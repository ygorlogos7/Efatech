"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { resend } from "@/lib/mail";
import { getAppBaseUrl } from "@/lib/send-auth-email";
import { buildNfePayloadFromVenda } from "@/lib/focus-nfe/build-nfe-from-venda";
import { aguardarNfeAutorizada, isNfeAutorizada } from "@/lib/focus-nfe/aguardar-autorizacao";
import { salvarNfeArquivosLocais } from "@/lib/focus-nfe/export-local";
import { baixarPdfNfeFocus, emitirNfeFocus } from "@/lib/focus-nfe/nfe";
import { FocusAmbiente } from "@/lib/focus-nfe/types";

const toNum = (v: any) => ({ ...v, ValorTotal: Number(v.ValorTotal || 0) });

function resolveEmailFrom() {
  const fromRaw = process.env.EMAIL_FROM?.trim();
  if (fromRaw) {
    return fromRaw.includes("<") ? fromRaw : `Efatech PRO <${fromRaw}>`;
  }
  const sender = process.env.NEXT_PUBLIC_SENDER_EMAIL?.trim();
  if (sender) return `Efatech PRO <${sender}>`;
  return "Efatech PRO <onboarding@resend.dev>";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildNfeEmailHtml(options: {
  numero: string | number;
  nomeCliente: string;
  referencia: string;
}) {
  const baseUrl = getAppBaseUrl().replace(/\/$/, "");
  const logoPublica =
    process.env.NFE_EMAIL_LOGO_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "https://efatechpro.com.br";
  const logoBase = /localhost|127\.0\.0\.1/i.test(baseUrl) ? logoPublica.replace(/\/$/, "") : baseUrl;
  const logoUrl = `${logoBase}/images/logo_efatech.png`;
  const nome = escapeHtml(options.nomeCliente);
  const numero = escapeHtml(String(options.numero));
  const referencia = escapeHtml(options.referencia);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NF-e emitida com sucesso - Efatech</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#eef2f0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 32px rgba(46,150,95,0.12);">
          <tr>
            <td style="background:linear-gradient(135deg,#2e965f 0%,#247a4c 100%);padding:18px 24px 14px;text-align:center;">
              <img src="${logoUrl}" alt="Efatech" width="185" style="display:block;margin:0 auto;max-width:185px;height:auto;border:0;" />
              <p style="margin:8px 0 0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.92);font-weight:600;">
                Assistencia tecnica e acessorios
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 8px;text-align:center;">
              <h1 style="margin:0;font-size:22px;line-height:1.3;color:#1f2937;font-weight:700;">
                NF-e emitida com sucesso
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;text-align:center;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#6b7280;">Ola, <strong style="color:#2e965f;">${nome}</strong>.</p>
              <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#6b7280;">Segue em anexo o DANFE (PDF) da sua nota fiscal eletronica.</p>
              <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#6b7280;">Numero NF-e: <strong style="color:#1f2937;">${numero}</strong></p>
              <p style="margin:0;font-size:13px;line-height:1.5;color:#9ca3af;">Referencia: ${referencia}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function getNotasConfigComExportacao() {
  const configBase = await prisma.notasConfig.findUnique({ where: { Id: 1 } });

  let exportacao = {
    SalvarArquivosLocal: false,
    PastaExportacaoLocal: null as string | null,
  };

  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ SalvarArquivosLocal: boolean; PastaExportacaoLocal: string | null }>>(
      'SELECT "SalvarArquivosLocal", "PastaExportacaoLocal" FROM "NotasConfig" WHERE "Id" = 1 LIMIT 1',
    );
    if (rows?.[0]) {
      exportacao = {
        SalvarArquivosLocal: Boolean(rows[0].SalvarArquivosLocal),
        PastaExportacaoLocal: rows[0].PastaExportacaoLocal ?? null,
      };
    }
  } catch {
    // Mantém compatibilidade quando colunas novas ainda não existem no banco.
  }

  return {
    ...(configBase || {
      Id: 1,
      Ambiente: "homologacao",
      SeriePadrao: 1,
      ProximoNumeroNFe: 1,
      ProximoNumeroNFSe: 1,
      ProximoNumeroNFCe: 1,
    }),
    ...exportacao,
  };
}

function onlyDigits(v?: string | null) {
  return (v || "").replace(/\D/g, "");
}

function validateCadastrosNfe(venda: any, empresaEmitente: any) {
  const faltas: string[] = [];
  const emp = empresaEmitente || {};
  const cli = venda?.Cliente || {};
  const endCli = cli?.Endereco?.[0] || {};

  if (!onlyDigits(emp.Cnpj) || onlyDigits(emp.Cnpj).length !== 14) faltas.push("Empresa emitente: CNPJ inválido/ausente");
  if (!emp.RazaoSocial) faltas.push("Empresa emitente: Razão Social");
  if (!emp.InscricaoEstadual) faltas.push("Empresa emitente: Inscrição Estadual");
  if (!emp.Logradouro || !emp.Numero || !emp.Bairro || !emp.Cidade || !emp.Uf || !onlyDigits(emp.Cep)) {
    faltas.push("Empresa emitente: Endereço completo (logradouro, número, bairro, cidade, UF, CEP)");
  }

  if (!cli.Nome) faltas.push("Cliente: Nome/Razão social");
  const docCli = onlyDigits(cli.CPFCNPJ);
  if (!docCli || (docCli.length !== 11 && docCli.length !== 14)) faltas.push("Cliente: CPF/CNPJ válido");
  if (!endCli.Logradouro || !endCli.Numero || !endCli.Bairro || !endCli.Cidade || !endCli.UF || !onlyDigits(endCli.Cep)) {
    faltas.push("Cliente: Endereço completo (logradouro, número, bairro, cidade, UF, CEP)");
  }

  (venda?.Itens || []).forEach((item: any, idx: number) => {
    const p = item?.Produtos || {};
    const nome = p?.Cod_Nome || `Item ${idx + 1}`;
    if (!p.cod_ncm) faltas.push(`${nome}: NCM`);
    if (!p.cod_cfop) faltas.push(`${nome}: CFOP`);
    if (!p.icms_cst_csosn) faltas.push(`${nome}: CST/CSOSN ICMS`);
    if (!p.pis_cst) faltas.push(`${nome}: CST PIS`);
    if (!p.cofins_cst) faltas.push(`${nome}: CST COFINS`);
    if (!p.unidade_comercial) faltas.push(`${nome}: Unidade comercial`);
  });

  return faltas;
}

function buildMensagemPendenciasNfe(faltas: string[]) {
  const empresa = faltas.filter((f) => f.startsWith("Empresa emitente:"));
  const cliente = faltas.filter((f) => f.startsWith("Cliente:"));
  const produtos = faltas.filter((f) => !f.startsWith("Empresa emitente:") && !f.startsWith("Cliente:"));

  const linhas: string[] = [
    "Não foi possível emitir a NF-e porque faltam alguns dados obrigatórios.",
    "",
  ];

  if (empresa.length) {
    linhas.push("🏢 Empresa emitente");
    empresa.forEach((i) => linhas.push(`- ${i.replace("Empresa emitente: ", "")}`));
    linhas.push("");
  }

  if (cliente.length) {
    linhas.push("👤 Cliente");
    cliente.forEach((i) => linhas.push(`- ${i.replace("Cliente: ", "")}`));
    linhas.push("");
  }

  if (produtos.length) {
    linhas.push("📦 Produtos");
    produtos.slice(0, 10).forEach((i) => linhas.push(`- ${i}`));
    if (produtos.length > 10) {
      linhas.push(`- ... e mais ${produtos.length - 10} pendência(s) de produto`);
    }
    linhas.push("");
  }

  linhas.push("Depois de preencher, tente emitir novamente.");
  return linhas.join("\n");
}

async function enviarNfePorEmailAutomatico(params: {
  to?: string | null;
  nomeCliente?: string | null;
  ref: string;
  ambiente: FocusAmbiente;
  numero?: number | null;
}) {
  const to = String(params.to || "").trim();
  if (!to) {
    return { sent: false as const, error: "Cliente sem e-mail cadastrado." };
  }
  if (!resend) {
    return { sent: false as const, error: "Serviço de e-mail não configurado (RESEND_API_KEY)." };
  }

  const pdfBuffer = await baixarPdfNfeFocus(params.ref, params.ambiente);
  const numero = params.numero || "s-numero";
  const clienteNome = params.nomeCliente || "Cliente";
  const from = resolveEmailFrom();

  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: `NF-e ${numero} - Efatech`,
    html: buildNfeEmailHtml({
      numero,
      nomeCliente: clienteNome,
      referencia: params.ref,
    }),
    attachments: [
      {
        filename: `NFe-${numero}.pdf`,
        content: pdfBuffer.toString("base64"),
      },
    ],
  });

  if (error) {
    const message = /domain.*not verified/i.test(error.message)
      ? "Domínio de e-mail remetente não verificado no Resend. Verifique EMAIL_FROM e o status do domínio."
      : error.message;
    return { sent: false as const, error: message };
  }
  return { sent: true as const };
}

// ---- Notas Fiscais (NFe, NFSe, NFCe) ----
export async function getNotas(tipo: "produto" | "servico" | "consumidor") {
  try {
    const items = await prisma.notaFiscal.findMany({
      where: { Tipo: tipo },
      orderBy: { DataEmissao: "desc" }
    });
    return { success: true, data: items.map(toNum) };
  } catch (error) {
    return { success: false, error: `Falha ao buscar notas de ${tipo}.` };
  }
}

export async function enviarNotaNfePorEmail(notaId: number) {
  try {
    const nota = await prisma.notaFiscal.findUnique({
      where: { Id: notaId },
      include: {
        Vendas: {
          include: {
            Cliente: true,
          },
        },
      },
    });

    if (!nota) {
      return { success: false, error: "Nota fiscal não encontrada." };
    }
    if (!nota.FocusRef) {
      return { success: false, error: "Nota sem referência Focus para envio." };
    }
    if (!isNfeAutorizada(nota.Status)) {
      return { success: false, error: `NF-e ainda não autorizada (${nota.Status || "processando"}).` };
    }

    const envio = await enviarNfePorEmailAutomatico({
      to: nota.Vendas?.Cliente?.Email || null,
      nomeCliente: nota.Vendas?.Cliente?.Nome || nota.Destinatario || null,
      ref: nota.FocusRef,
      ambiente: (nota.Ambiente || "homologacao") as FocusAmbiente,
      numero: nota.Numero,
    });

    if (!envio.sent) {
      return { success: false, error: envio.error || "Falha ao enviar nota por e-mail." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao enviar NF-e por e-mail:", error);
    return { success: false, error: error?.message || "Falha ao enviar NF-e por e-mail." };
  }
}

export async function createNota(tipo: "produto" | "servico" | "consumidor", formData: FormData) {
  try {
    const data = {
      Tipo: tipo,
      Destinatario: formData.get("Destinatario") as string,
      ValorTotal: Number(formData.get("ValorTotal") || 0),
      Serie: Number(formData.get("Serie") || 1),
      Numero: Number(formData.get("Numero") || Math.floor(Math.random() * 10000)),
      Status: "autorizada", // Simulação de autorização imediata para o ERP operante
      Chave: Math.random().toString(36).substring(2, 15).toUpperCase(),
    };

    await prisma.notaFiscal.create({ data });
    revalidatePath(`/notas/${tipo}s`);
  } catch (error) {
    console.error("Erro ao emitir nota:", error);
    return { success: false, error: "Falha ao gravar nota fiscal no banco." };
  }
  const redirectPath = tipo === "produto" ? "produtos" : (tipo === "servico" ? "servicos" : "consumidor");
  const { redirect } = await import("next/navigation");
  redirect(`/notas/${redirectPath}`);
}

export async function getNotasConfig() {
  try {
    const config = await getNotasConfigComExportacao();
    return { success: true, data: config };
  } catch (error) {
    return { success: false, error: "Falha ao buscar configurações de notas." };
  }
}

export async function saveNotasConfig(formData: FormData) {
  try {
    const ambiente = (formData.get("Ambiente") as string) === "producao" ? "producao" : "homologacao";
    const salvarLocal = formData.get("SalvarArquivosLocal") === "true";
    const pasta = String(formData.get("PastaExportacaoLocal") || "").trim() || null;

    if (salvarLocal && !pasta) {
      return {
        success: false,
        error: "Informe a pasta de destino para salvar XML e DANFE na máquina.",
      };
    }

    const seriePadrao = parseInt(formData.get("SeriePadrao") as string, 10) || 1;
    const proximoNumero = parseInt(formData.get("ProximoNumeroNFe") as string, 10) || 1;

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "NotasConfig" (
        "Id", "Ambiente", "SeriePadrao", "ProximoNumeroNFe",
        "ProximoNumeroNFSe", "ProximoNumeroNFCe",
        "SalvarArquivosLocal", "PastaExportacaoLocal"
      )
      VALUES (1, $1, $2, $3, 1, 1, $4, $5)
      ON CONFLICT ("Id") DO UPDATE SET
        "Ambiente" = EXCLUDED."Ambiente",
        "SeriePadrao" = EXCLUDED."SeriePadrao",
        "ProximoNumeroNFe" = EXCLUDED."ProximoNumeroNFe",
        "SalvarArquivosLocal" = EXCLUDED."SalvarArquivosLocal",
        "PastaExportacaoLocal" = EXCLUDED."PastaExportacaoLocal"
      `,
      ambiente,
      seriePadrao,
      proximoNumero,
      salvarLocal,
      pasta,
    );

    revalidatePath("/notas/opcoes/configuracoes");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar config de notas:", error);
    return { success: false, error: "Falha ao salvar configurações de notas." };
  }
}

export async function getEmpresasInternasEmissoras() {
  try {
    const items = await prisma.empresa.findMany({
      where: { CategoriaEmpresa: "interno", Ativo: true },
      select: { Id: true, RazaoSocial: true, NomeFantasia: true, Cnpj: true },
      orderBy: { RazaoSocial: "asc" },
    });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar empresas emissoras." };
  }
}

export async function emitirNfeFromVenda(vendaId: number, empresaInternaId?: number) {
  try {
    const config = await getNotasConfigComExportacao();
    const ambiente = ((config?.Ambiente || "homologacao") as FocusAmbiente);

    const venda = await prisma.vendas.findUnique({
      where: { Id: vendaId },
      include: {
        Cliente: { include: { Endereco: true } },
        Itens: { include: { Produtos: true } },
      },
    });
    if (!venda) {
      return { success: false, error: "Venda não encontrada." };
    }
    if (!venda.Itens?.length) {
      return { success: false, error: "Venda sem itens para emitir NF-e." };
    }

    const empresaEmitente =
      (empresaInternaId
        ? await prisma.empresa.findFirst({
            where: { Id: empresaInternaId, CategoriaEmpresa: "interno", Ativo: true },
          })
        : null) ??
      (await prisma.empresa.findFirst({
        where: { CategoriaEmpresa: "interno", Ativo: true },
        orderBy: { Id: "asc" },
      }));

    if (!empresaEmitente) {
      return { success: false, error: "Nenhuma empresa interna ativa para emissão." };
    }

    const faltas = validateCadastrosNfe(venda, empresaEmitente);
    if (faltas.length) {
      return {
        success: false,
        error: buildMensagemPendenciasNfe(faltas),
      };
    }

    const ref = `efatech-venda-${vendaId}-${Date.now()}`;
    const payload = buildNfePayloadFromVenda(venda, empresaEmitente);
    const focusResult = await emitirNfeFocus(ref, payload, ambiente);
    const consulta = await aguardarNfeAutorizada(ref, ambiente).catch(() => focusResult);
    const statusFinal = String((consulta?.status as string) || (focusResult?.status as string) || "processando");
    const numeroNota = config?.ProximoNumeroNFe || null;
    const motivoSefaz = String(
      (consulta?.motivo as string) ||
        (focusResult?.motivo as string) ||
        (consulta as any)?.mensagem_sefaz ||
        (focusResult as any)?.mensagem_sefaz ||
        "",
    ).trim();
    const statusRejeitado = /erro|rejeit|deneg/i.test(statusFinal);

    await prisma.notaFiscal.create({
      data: {
        Tipo: "produto",
        VendaId: venda.Id,
        EmpresaId: empresaEmitente.Id,
        FocusRef: ref,
        Ambiente: ambiente,
        Destinatario: venda.Cliente?.Nome || null,
        ValorTotal: venda.Total,
        Serie: config?.SeriePadrao || 1,
        Numero: numeroNota,
        Status: statusFinal,
        StatusSefaz: statusFinal,
        Chave: (consulta?.chave as string) || (focusResult?.chave as string) || null,
        ProtocoloAutorizacao: (consulta?.numero as string) || null,
        MotivoSefaz: motivoSefaz || null,
        PdfUrl: (consulta?.url_danfe as string) || null,
      },
    });

    await prisma.notasConfig.upsert({
      where: { Id: 1 },
      update: { ProximoNumeroNFe: (config?.ProximoNumeroNFe || 1) + 1 },
      create: {
        Id: 1,
        ProximoNumeroNFe: 2,
      },
    });

    revalidatePath("/notas/produtos");
    revalidatePath("/vendas/produtos");
    revalidatePath("/vendas/balcao");
    revalidatePath("/vendas/servicos");

    if (statusRejeitado) {
      return {
        success: false,
        error: [
          "A SEFAZ rejeitou a autorização da NF-e.",
          motivoSefaz ? `Motivo: ${motivoSefaz}` : `Status: ${statusFinal}`,
          "Confira também o regime tributário (CRT), certificado digital e CST/CSOSN dos produtos.",
        ].join("\n"),
        data: { ref, status: statusFinal, motivo: motivoSefaz || null },
      };
    }

    let exportLocal: { pasta: string; pdfPath?: string; xmlPath?: string; avisos?: string[] } | null =
      null;
    let exportLocalErro: string | null = null;
    let emailAutomatico: { sent: boolean; error?: string } | null = null;

    if (!config?.SalvarArquivosLocal) {
      // Opção desligada — não tenta gravar na pasta.
    } else if (!config.PastaExportacaoLocal) {
      exportLocalErro = "Pasta de destino não configurada em Notas → Configurações.";
    } else if (!isNfeAutorizada(statusFinal)) {
      exportLocalErro = `NF-e ainda não autorizada (${statusFinal}). Arquivos não foram gravados na pasta.`;
    } else {
      try {
        exportLocal = await salvarNfeArquivosLocais({
          pasta: config.PastaExportacaoLocal,
          ref,
          ambiente,
          chave: (consulta?.chave as string) || (focusResult?.chave as string) || null,
          numero: numeroNota,
          serie: config?.SeriePadrao || 1,
          urlDanfe: (consulta?.url_danfe as string) || null,
        });
      } catch (err: any) {
        exportLocalErro = err?.message || "Não foi possível salvar XML/DANFE na pasta configurada.";
        console.error("Exportação local NF-e:", err);
      }
    }

    if (isNfeAutorizada(statusFinal)) {
      try {
        emailAutomatico = await enviarNfePorEmailAutomatico({
          to: venda.Cliente?.Email || null,
          nomeCliente: venda.Cliente?.Nome || null,
          ref,
          ambiente,
          numero: numeroNota,
        });
      } catch (err: any) {
        emailAutomatico = {
          sent: false,
          error: err?.message || "Falha ao enviar NF-e por e-mail.",
        };
        console.error("Envio automático NF-e por e-mail:", err);
      }
    }

    return {
      success: true,
      data: {
        ref,
        status: statusFinal,
        motivo: motivoSefaz || null,
        chave: (consulta?.chave as string) || (focusResult?.chave as string) || null,
        exportLocal,
        exportLocalErro,
        emailAutomatico,
      },
    };
  } catch (error: any) {
    console.error("Erro ao emitir NF-e na Focus:", error);
    return {
      success: false,
      error: error?.message || "Falha ao emitir NF-e na Focus. Verifique os cadastros fiscais (empresa, cliente e produto).",
    };
  }
}

// ---- Notas de Compras ----
export async function getNotasCompras() {
  try {
    const items = await prisma.notaCompra.findMany({ orderBy: { DataEntrada: "desc" } });
    return { success: true, data: items.map(toNum) };
  } catch (error) {
    return { success: false, error: "Falha ao buscar notas de compras." };
  }
}

// ---- Naturezas de Operação ----
export async function getNaturezas() {
  try {
    const items = await prisma.naturezaOperacao.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar naturezas." };
  }
}

export async function createNatureza(formData: FormData) {
  try {
    await prisma.naturezaOperacao.create({
      data: {
        Nome: formData.get("Nome") as string,
        Cfop: formData.get("Cfop") as string | null,
        Tipo: formData.get("Tipo") as string | null,
      }
    });
    revalidatePath("/notas/opcoes/naturezas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar natureza de operação." };
  }
}

// ---- Tributações ----
export async function getTributacoes() {
  try {
    const items = await prisma.tributacao.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items.map(i => ({ ...i, Icms: Number(i.Icms), Ipi: Number(i.Ipi), Pis: Number(i.Pis), Cofins: Number(i.Cofins) })) };
  } catch (error) {
    return { success: false, error: "Falha ao buscar tributações." };
  }
}

export async function createTributacao(formData: FormData) {
  try {
    await prisma.tributacao.create({
      data: {
        Nome: formData.get("Nome") as string,
        Icms: Number(formData.get("Icms") || 0),
        Ipi: Number(formData.get("Ipi") || 0),
        Pis: Number(formData.get("Pis") || 0),
        Cofins: Number(formData.get("Cofins") || 0),
      }
    });
    revalidatePath("/notas/opcoes/tributacoes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar tributação." };
  }
}

// ---- Atividades de Serviços ----
export async function getAtividadesServicos() {
  try {
    const items = await prisma.atividadeServico.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar atividades." };
  }
}

// ---- Certificados Digitais ----
export async function getCertificados() {
  try {
    const items = await prisma.certificadoDigital.findMany({ orderBy: { CreatedAt: "desc" } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar certificados." };
  }
}

// ---- Intermediadores ----
export async function getIntermediadores() {
  try {
    const items = await prisma.intermediador.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar intermediadores." };
  }
}
