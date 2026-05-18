"use server";

import { prisma } from "@/lib/prisma";
import {
  SANGRIA_FORMA_RELATORIO,
  fetchSangriasPorCaixaSessao,
  sumValorSangriasPorCaixaSessao,
  vincularSangriasLegadasAoCaixa,
  setContaPagarCaixaSessaoId,
} from "@/lib/caixaSangria";
import {
  FORMA_DINHEIRO_CONSOLIDADO,
  aplicarSangriaNoConsolidado,
  normalizarNomeFormaConsolidado,
  type LinhaFormaConsolidada,
} from "@/lib/caixaRelatorioFormas";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { logAction } from "@/lib/logger";

// Função auxiliar para converter Decimal do Prisma para Number antes de enviar para o cliente
function serializeCaixa(caixa: any) {
  if (!caixa) return null;
  return {
    ...caixa,
    ValorAbertura: Number(caixa.ValorAbertura),
    ValorFechamento: caixa.ValorFechamento ? Number(caixa.ValorFechamento) : null,
    DataAbertura: caixa.DataAbertura instanceof Date ? caixa.DataAbertura.toISOString() : caixa.DataAbertura,
    DataFechamento: caixa.DataFechamento instanceof Date ? caixa.DataFechamento.toISOString() : caixa.DataFechamento,
  };
}

export async function buscarCaixaAtivo() {
  noStore();
  try {
    console.log(">>> [CAIXA] Buscando caixa ativo...");
    
    const caixa = await prisma.caixaSessao.findFirst({
      where: { 
        Status: {
          equals: "Aberto",
          mode: "insensitive"
        } 
      },
      orderBy: { DataAbertura: "desc" },
    });

    if (!caixa) {
      console.log(">>> [CAIXA] Nenhum caixa aberto encontrado.");
      return { success: true, data: null };
    }

    console.log(">>> [CAIXA] Caixa encontrado! ID:", caixa.Id, "Status:", caixa.Status);

    return { 
      success: true, 
      data: serializeCaixa(caixa)
    };
  } catch (error: any) {
    console.error(">>> [CAIXA] ERRO AO BUSCAR CAIXA:", error);
    return { success: false, error: `Erro no banco de dados: ${error.message}` };
  }
}

// Mantendo o nome antigo apenas para não quebrar outros lugares temporariamente
export async function getCaixaAberto() {
  return buscarCaixaAtivo();
}

export async function abrirCaixa(formData: FormData) {
  console.log(">>> [CAIXA] INICIANDO ABERTURA NO SERVIDOR...");
  try {
    const rawValor = formData.get("valorAbertura");
    const valorAbertura = Number(rawValor);
    const funcionarioId = formData.get("funcionarioId") ? Number(formData.get("funcionarioId")) : null;
    const gerarRecebimento = formData.get("gerarRecebimento") === "true";
    const observacoes = (formData.get("observacoes") as string) || "Abertura manual";

    console.log(">>> [CAIXA] Parâmetros:", { valorAbertura, funcionarioId, gerarRecebimento });

    if (isNaN(valorAbertura)) {
      return { success: false, error: "Valor de abertura inválido." };
    }

    const result = await prisma.$transaction(async (tx) => {
      console.log(">>> [CAIXA] Criando registro de sessão...");
      const novoCaixa = await tx.caixaSessao.create({
        data: {
          ValorAbertura: valorAbertura,
          Observacoes: observacoes,
          Status: "Aberto",
          DataAbertura: new Date(),
          UsuarioId: funcionarioId,
        },
      });

      if (gerarRecebimento && valorAbertura > 0) {
        console.log(">>> [CAIXA] Gerando lançamento financeiro...");
        await tx.contaReceber.create({
          data: {
            Descricao: "Abertura de caixa",
            Valor: valorAbertura,
            Vencimento: new Date(),
            Recebimento: new Date(),
            Observacoes: `Gerado na abertura do caixa #${novoCaixa.Id}`,
          }
        });
      }
      return novoCaixa;
    });

    console.log(">>> [CAIXA] Revalidando caminhos...");
    revalidatePath("/vendas");
    revalidatePath("/financeiro");
    
    console.log(">>> [CAIXA] SUCESSO!");
    return { success: true, data: serializeCaixa(result) };
  } catch (error: any) {
    console.error(">>> [CAIXA] ERRO CRÍTICO NA ABERTURA:", error);
    
    // Registrar erro no log do sistema de forma silenciosa para o dev ver depois
    await logAction(
      "ERRO_ABERTURA_CAIXA",
      "CAIXA",
      `Erro técnico ao abrir caixa: ${error.message}`,
      "ERRO"
    );

    return { 
      success: false, 
      error: "Erro ao processar abertura: Verifique se o Funcionário e a Forma de Pagamento foram selecionados corretamente. A falha foi registrada para suporte técnico." 
    };
  }
}

export async function fecharCaixa(id: number, valorFechamento: number) {
  try {
    // 1. Buscar a sessão para saber as datas
    const session = await prisma.caixaSessao.findUnique({ where: { Id: id } });
    if (!session) return { success: false, error: "Sessão não encontrada." };

    const dataAbertura = session.DataAbertura || new Date();
    const dataFechamento = new Date();

    // 2. Vincular movimentos que aconteceram no período e estão sem ID de sessão
    // Isso garante que mesmo que o vínculo tenha falhado na criação, ele seja corrigido no fechamento.
    
    // Vendas
    await prisma.vendas.updateMany({
      where: {
        CaixaSessaoId: null,
        CreatedAt: { gte: dataAbertura, lte: dataFechamento },
        Ativo: true
      },
      data: { CaixaSessaoId: id }
    });

    // O.S. (Apenas as finalizadas/encerradas entram no caixa)
    await prisma.ordensServico.updateMany({
      where: {
        CaixaSessaoId: null,
        CreatedAt: { gte: dataAbertura, lte: dataFechamento },
        Ativo: false
      },
      data: { CaixaSessaoId: id }
    });

    await vincularSangriasLegadasAoCaixa(id, dataAbertura, dataFechamento);

    // 3. Atualizar a sessão
    const caixa = await prisma.caixaSessao.update({
      where: { Id: id },
      data: {
        Status: "Fechado",
        DataFechamento: dataFechamento,
        ValorFechamento: valorFechamento,
      },
    });

    revalidatePath("/vendas/balcao");
    revalidatePath("/financeiro/opcoes/caixas");
    return { success: true, data: serializeCaixa(caixa) };
  } catch (error) {
    console.error("Erro ao fechar caixa:", error);
    return { success: false, error: "Falha ao fechar caixa." };
  }
}


export async function getCaixaSessoes(filters?: { usuarioId?: string | number, dataInicio?: string, dataFim?: string, status?: string }) {
  noStore();
  console.log("[DEBUG] getCaixaSessoes called with:", JSON.stringify(filters));
  try {
    const where: any = {};

    if (filters?.usuarioId && filters.usuarioId !== "" && filters.usuarioId !== "0") {
      where.UsuarioId = Number(filters.usuarioId);
    }

    if (filters?.status && filters.status !== "" && filters.status !== "Todos") {
      where.Status = filters.status;
    }

    if (filters?.dataInicio || filters?.dataFim) {
      where.DataAbertura = {};
      if (filters.dataInicio) {
        const dStart = new Date(`${filters.dataInicio}T00:00:00`);
        if (!isNaN(dStart.getTime())) where.DataAbertura.gte = dStart;
      }
      if (filters.dataFim) {
        const dEnd = new Date(`${filters.dataFim}T23:59:59`);
        if (!isNaN(dEnd.getTime())) where.DataAbertura.lte = dEnd;
      }
    }

    const sessions = await prisma.caixaSessao.findMany({
      where,
      orderBy: { DataAbertura: "desc" },
      take: 50,
    });

    console.log(`[DEBUG] Found ${sessions.length} sessions`);

    // Busca rápida de funcionários
    const userIds = [...new Set(sessions.map(s => s.UsuarioId).filter(Boolean))] as number[];
    const users = userIds.length > 0 ? await prisma.funcionario.findMany({
      where: { Id: { in: userIds } },
      select: { Id: true, Nome: true }
    }) : [];

    const data = await Promise.all(sessions.map(async s => {
      try {
        const user = users.find(u => u.Id === s.UsuarioId);
        
        // Data limite para busca de movimentos
        const dataAbertura = s.DataAbertura || new Date(0);
        const dataFim = s.DataFechamento || new Date();
        const startOfDay = new Date(dataAbertura);
        startOfDay.setHours(0, 0, 0, 0);
        
        // Busca paralela para agilizar
        const [vendas, oss, sangriaValorSum, suprimentos] = await Promise.all([
          prisma.vendas.aggregate({
            where: { 
              OR: [
                { CaixaSessaoId: s.Id }, 
                { AND: [{ CaixaSessaoId: null }, { OR: [{ CreatedAt: { gte: startOfDay, lte: dataFim } }, { DataVenda: { gte: startOfDay, lte: dataFim } }] }] }
              ],
            },
            _sum: { Total: true }
          }),
          prisma.ordensServico.aggregate({
            where: { 
              OR: [
                { CaixaSessaoId: s.Id }, 
                { AND: [{ CaixaSessaoId: null }, { OR: [{ CreatedAt: { gte: startOfDay, lte: dataFim } }, { DataFechamento: { gte: startOfDay, lte: dataFim } }] }] }
              ],
              Ativo: false 
            },
            _sum: { Total: true }
          }),
          sumValorSangriasPorCaixaSessao(s.Id, dataAbertura, dataFim),
          prisma.contaReceber.aggregate({
            where: { 
              CreatedAt: { gte: startOfDay, lte: dataFim },
              NOT: { Descricao: { contains: "Abertura de caixa" } }
            },
            _sum: { Valor: true }
          })
        ]);

        const totalEntradas = Number(vendas._sum.Total || 0) + Number(oss._sum.Total || 0) + Number(suprimentos._sum.Valor || 0);
        const totalSaidas = sangriaValorSum;
        const saldoAtual = Number(s.ValorAbertura) + totalEntradas - totalSaidas;

        return {
          Id: s.Id,
          UsuarioId: s.UsuarioId,
          FuncionarioNome: user?.Nome || "Sistema",
          DataAbertura: s.DataAbertura?.toISOString() || null,
          DataFechamento: s.DataFechamento?.toISOString() || null,
          ValorAbertura: Number(s.ValorAbertura),
          ValorFechamento: s.ValorFechamento ? Number(s.ValorFechamento) : null,
          Status: s.Status,
          Observacoes: s.Observacoes,
          Saldo: saldoAtual,
        };
      } catch (err: any) {
        console.error(`[DEBUG] Error session ${s.Id}:`, err.message);
        return {
          Id: s.Id,
          FuncionarioNome: `ERRO: ${err.message}`, // Exibe o erro real na tela
          DataAbertura: s.DataAbertura?.toISOString() || null,
          DataFechamento: s.DataFechamento?.toISOString() || null,
          ValorAbertura: Number(s.ValorAbertura),
          ValorFechamento: s.ValorFechamento ? Number(s.ValorFechamento) : null,
          Status: s.Status,
          Saldo: 0
        };
      }
    }));

    return { success: true, data };
  } catch (error: any) {
    console.error("[DEBUG] FATAL getCaixaSessoes:", error.message);
    return { success: false, error: "Erro ao carregar dados do banco." };
  }
}

export async function getCaixaSessaoDetalhes(id: number) {
  try {
    const session = await prisma.caixaSessao.findUnique({
      where: { Id: id },
    });

    if (!session) return { success: false, error: "Sessão não encontrada." };

    const funcionario = session.UsuarioId 
      ? await prisma.funcionario.findUnique({ where: { Id: session.UsuarioId } })
      : null;

    const dataAbertura = session.DataAbertura || new Date();
    const dataFechamento = session.DataFechamento || new Date();

    // 1. Buscar Vendas
    const vendas = await prisma.vendas.findMany({
      where: { 
        OR: [
          { CaixaSessaoId: id },
          { 
            AND: [
              { CaixaSessaoId: null },
              { CreatedAt: { gte: dataAbertura, lte: dataFechamento } }
            ]
          }
        ],
        Ativo: true 
      },
      include: { FormaPagamento: true }
    });

    // 2. Buscar O.S.
    const os = await prisma.ordensServico.findMany({
      where: { 
        OR: [
          { CaixaSessaoId: id },
          { 
            AND: [
              { CaixaSessaoId: null },
              { CreatedAt: { gte: dataAbertura, lte: dataFechamento } }
            ]
          }
        ],
        Ativo: false 
      },
      include: { FormaPagamento: true }
    });

    const sangriasRaw = await fetchSangriasPorCaixaSessao(id, dataAbertura, dataFechamento);
    const sangrias = sangriasRaw as Array<{ Valor: unknown; Descricao?: string; [key: string]: unknown }>;

    // 4. Buscar Suprimentos/Recebimentos (Contas a Receber no período, exceto as automáticas de abertura para não duplicar)
    const suprimentos = await prisma.contaReceber.findMany({
      where: {
        CreatedAt: { gte: dataAbertura, lte: dataFechamento },
        NOT: { Descricao: { contains: "Abertura de caixa" } }
      }
    });

    // Agrupar tudo por forma de pagamento para o resumo
    const consolidado: Record<string, { Recebido: number; Pago: number }> = {
      [FORMA_DINHEIRO_CONSOLIDADO]: {
        Recebido: Number(session.ValorAbertura),
        Pago: 0,
      },
    };

    vendas.forEach(v => {
      const forma = normalizarNomeFormaConsolidado(v.FormaPagamento?.Nome || "Outros");
      if (!consolidado[forma]) consolidado[forma] = { Recebido: 0, Pago: 0 };
      consolidado[forma].Recebido += Number(v.Total);
    });

    os.forEach(o => {
      const forma = normalizarNomeFormaConsolidado(o.FormaPagamento?.Nome || "Outros");
      if (!consolidado[forma]) consolidado[forma] = { Recebido: 0, Pago: 0 };
      consolidado[forma].Recebido += Number(o.Total);
    });

    suprimentos.forEach(s => {
      const forma = FORMA_DINHEIRO_CONSOLIDADO;
      if (!consolidado[forma]) consolidado[forma] = { Recebido: 0, Pago: 0 };
      consolidado[forma].Recebido += Number(s.Valor);
    });

    const totalSangriasSessao = sangrias.reduce(
      (acc, s) => acc + Number(s.Valor),
      0
    );
    const formasDetalhe: Record<string, LinhaFormaConsolidada> = {};
    for (const [forma, valores] of Object.entries(consolidado)) {
      formasDetalhe[forma] = {
        Nome: forma,
        Recebido: valores.Recebido,
        Pago: valores.Pago,
        Total: 0,
      };
    }
    aplicarSangriaNoConsolidado(formasDetalhe, totalSangriasSessao);

    const resumoFinal = Object.values(formasDetalhe).map((row) => ({
      Forma: row.Nome,
      Recebido: row.Recebido,
      Pago: row.Pago,
      Total: row.Total,
    }));

    const totalEntradas = resumoFinal.reduce((acc, curr) => acc + curr.Recebido, 0);
    const totalSaidas = resumoFinal.reduce((acc, curr) => acc + curr.Pago, 0);

    return { 
      success: true, 
      data: {
        session: {
            ...session,
            ValorAbertura: Number(session.ValorAbertura),
            ValorFechamento: session.ValorFechamento ? Number(session.ValorFechamento) : null,
            FuncionarioNome: funcionario?.Nome || "Sistema",
        },
        vendas: resumoFinal,
        vendasRaw: [
          ...vendas.map(v => ({ ...v, Total: Number(v.Total), _type: 'VENDA' })),
          ...os.map(o => ({ ...o, Total: Number(o.Total), _type: 'OS' }))
        ],
        sangrias: sangrias.map(s => ({ ...s, Valor: Number(s.Valor) })),
        suprimentos: suprimentos.map(s => ({ ...s, Valor: Number(s.Valor) })),
        totaisGerais: {
            Entradas: totalEntradas,
            Saidas: totalSaidas,
            SaldoReal: totalEntradas - totalSaidas
        }
      } 
    };
  } catch (error) {
    console.error("Erro ao buscar detalhes do caixa:", error);
    return { success: false, error: "Falha ao processar detalhes." };
  }
}
export async function getCaixaPrintData(id: number, type: 'vendas' | 'os' | 'completo') {
  console.log(">>> [PRINT] Iniciando busca para ID:", id, "Tipo:", type);
  try {
    const session = await prisma.caixaSessao.findUnique({ where: { Id: id } });
    if (!session) {
      console.warn(">>> [PRINT] Sessão não encontrada para ID:", id);
      return { success: false, error: "Sessão não encontrada." };
    }

    console.log(">>> [PRINT] Sessão encontrada. Status:", session.Status);

    const dataAbertura = session.DataAbertura || new Date();
    const dataFechamento = session.DataFechamento || new Date();

    const funcionario = session.UsuarioId
      ? await prisma.funcionario.findUnique({ where: { Id: session.UsuarioId } })
      : null;

    // 1. Vendas Consolidadas
    let vendasConsolidada: any[] = [];
    if (type === 'vendas' || type === 'completo') {
      console.log(">>> [PRINT] Buscando Vendas...");
      const vendas = await prisma.vendas.findMany({
        where: { 
          OR: [
            { CaixaSessaoId: id },
            { 
              AND: [
                { CaixaSessaoId: null },
                { CreatedAt: { gte: dataAbertura, lte: dataFechamento } }
              ]
            }
          ],
        },
        include: { FormaPagamento: true }
      });
      console.log(">>> [PRINT] Vendas encontradas:", vendas.length);
      
      const consolidado: Record<string, any> = {};
      vendas.forEach(v => {
        const forma = normalizarNomeFormaConsolidado(v.FormaPagamento?.Nome || "Diversos");
        if (!consolidado[forma]) consolidado[forma] = { Forma: forma, Recebido: 0, AReceber: 0, Total: 0 };
        const valor = Number(v.Total || 0);
        consolidado[forma].Recebido += valor;
        consolidado[forma].Total += valor;
      });
      vendasConsolidada = Object.values(consolidado);
    }

    // 2. O.S. Consolidadas
    let osConsolidada: any[] = [];
    if (type === 'os' || type === 'completo') {
      console.log(">>> [PRINT] Buscando O.S...");
      const os = await prisma.ordensServico.findMany({
        where: {
          OR: [
            { CaixaSessaoId: id },
            { 
              AND: [
                { CaixaSessaoId: null },
                { CreatedAt: { gte: dataAbertura, lte: dataFechamento } }
              ]
            }
          ],
          Ativo: false 
        },
        include: { FormaPagamento: true }
      });
      console.log(">>> [PRINT] O.S. encontradas:", os.length);

      const consolidado: Record<string, any> = {};
      os.forEach(o => {
        const forma = normalizarNomeFormaConsolidado(o.FormaPagamento?.Nome || "Não informado");
        if (!consolidado[forma]) consolidado[forma] = { Forma: forma, Recebido: 0, AReceber: 0, Total: 0 };
        const valor = Number(o.Total || 0);
        consolidado[forma].Recebido += valor;
        consolidado[forma].Total += valor;
      });
      osConsolidada = Object.values(consolidado);
    }

    // 3. Sangrias e Suprimentos
    console.log(">>> [PRINT] Buscando Sangrias/Suprimentos...");
    const sangriasRaw = await fetchSangriasPorCaixaSessao(id, dataAbertura, dataFechamento);
    const suprimentosRaw = await prisma.contaReceber.findMany({
      where: {
        CreatedAt: { gte: dataAbertura, lte: dataFechamento },
        NOT: { Descricao: { contains: "Abertura de caixa" } },
      },
    });

    const sangrias = sangriasRaw.map((s: Record<string, unknown>) => ({
      Forma: SANGRIA_FORMA_RELATORIO,
      Pago: Number(s.Valor ?? s.valor),
      APagar: 0,
      Total: Number(s.Valor ?? s.valor),
    }));
    const suprimentos = suprimentosRaw.map(s => ({
      Forma: FORMA_DINHEIRO_CONSOLIDADO,
      Recebido: Number(s.Valor),
      Total: Number(s.Valor),
    }));

    console.log(">>> [PRINT] Consolidando valores...");
    // 4. Consolidado Final (Formas de Pagamento)
    const formasFinal: any = {};
    const addValues = (arr: any[], mode: 'entrada' | 'saida') => {
      arr.forEach(item => {
        const nome = normalizarNomeFormaConsolidado(item.Forma || "Diversos");
        // NaoRecebido: reservado p/ contas "à receber" no futuro; hoje o relatório só preenche Recebido/Pago/Total.
        if (!formasFinal[nome]) formasFinal[nome] = { Nome: nome, NaoRecebido: 0, Recebido: 0, Pago: 0, Total: 0 };
        if (mode === 'entrada') {
           formasFinal[nome].Recebido += Number(item.Recebido || item.Total || 0);
           formasFinal[nome].Total += Number(item.Total || 0);
        } else {
           formasFinal[nome].Pago += Number(item.Pago || item.Total || 0);
           formasFinal[nome].Total -= Number(item.Total || 0);
        }
      });
    };

    const abertura = {
      Forma: FORMA_DINHEIRO_CONSOLIDADO,
      Recebido: Number(session.ValorAbertura),
      AReceber: 0,
      Total: Number(session.ValorAbertura),
    };
    
    addValues([abertura], 'entrada');
    addValues(vendasConsolidada, 'entrada');
    addValues(osConsolidada, 'entrada');
    addValues(suprimentos, 'entrada');

    const totalSangriasSessao = (sangriasRaw as { Valor?: unknown }[]).reduce(
      (acc, s) => acc + Number(s.Valor ?? 0),
      0
    );
    aplicarSangriaNoConsolidado(formasFinal, totalSangriasSessao);

    const consolidadoGeral = Object.values(formasFinal) as {
      Nome: string;
      Recebido: number;
      Pago: number;
      Total: number;
    }[];
    const totalEntradas = consolidadoGeral.reduce(
      (acc, curr) => acc + curr.Recebido,
      0
    );
    const totalSaidas = consolidadoGeral.reduce((acc, curr) => acc + curr.Pago, 0);
    const saldoReal = consolidadoGeral.reduce((acc, curr) => acc + curr.Total, 0);

    const dataResult = {
      session: {
        Id: session.Id,
        Status: session.Status,
        DataAbertura: session.DataAbertura?.toISOString(),
        DataFechamento: session.DataFechamento?.toISOString(),
        ValorAbertura: Number(session.ValorAbertura),
        ValorFechamento: Number(session.ValorFechamento || 0),
        FuncionarioNome: funcionario?.Nome || "Sistema",
      },
      abertura,
      vendas: vendasConsolidada,
      os: osConsolidada,
      sangrias,
      consolidadoGeral,
      saldoReal,
    };

    console.log(">>> [PRINT] Sucesso! Enviando payload.");
    return { success: true, data: dataResult };
  } catch (error: any) {
    console.error(">>> [PRINT] ERRO CRÍTICO:", error);
    return { success: false, error: "Erro interno no servidor." };
  }
}

export async function getCaixaResumoSimples(id: number) {
  try {
    const details = await getCaixaSessaoDetalhes(id);
    if (!details.success || !details.data) return details;

    const data = details.data;
    
    const resumoFormas = data.vendas as { Forma: string; Recebido: number; Pago: number; Total: number }[];
    const dinheiroEntry = resumoFormas.find((f) =>
      normalizarNomeFormaConsolidado(f.Forma) === FORMA_DINHEIRO_CONSOLIDADO
    );
    const totalSangrias = data.sangrias.reduce(
      (acc: number, curr: { Valor: number }) => acc + Number(curr.Valor),
      0
    );
    const totalSuprimentos = data.suprimentos.reduce(
      (acc: number, curr: { Valor: number }) => acc + Number(curr.Valor),
      0
    );
    const saldoEmDinheiro = dinheiroEntry
      ? Number(dinheiroEntry.Total)
      : Number(data.session.ValorAbertura) + totalSuprimentos - totalSangrias;

    return {
      success: true,
      data: {
        saldoEsperado: data.totaisGerais.SaldoReal,
        saldoEmDinheiro,
        vendasCount: data.vendasRaw.filter((v: any) => v._type === 'VENDA').length,
        osCount: data.vendasRaw.filter((v: any) => v._type === 'OS').length,
        sangriasCount: data.sangrias.length,
        suprimentosCount: data.suprimentos.length,
        totalSangrias,
        totalSuprimentos
      }
    };
  } catch (error) {
    return { success: false, error: "Erro ao calcular resumo." };
  }
}

export async function lancarSangria(formData: FormData) {
  try {
    const valor = Number(formData.get("valor"));
    const descricao = formData.get("descricao") as string || "Sangria de caixa";
    const rawSid = formData.get("sessionId");
    const parsedSid = rawSid != null && String(rawSid).trim() !== "" ? Number(rawSid) : NaN;
    const sessionId = !isNaN(parsedSid) && parsedSid > 0 ? parsedSid : null;

    if (isNaN(valor) || valor <= 0) return { success: false, error: "Valor inválido." };

    const created = await prisma.contaPagar.create({
      data: {
        Descricao: descricao,
        Valor: valor,
        Vencimento: new Date(),
        Pagamento: new Date(),
        SituacaoId: 1, // Liquidado
        PlanoContaId: 1, // Geral
        FormaPgtoId: 1, // Dinheiro
        Observacoes: sessionId ? `Sangria vinculada ao caixa #${sessionId}` : "Sangria manual",
      },
    });
    if (sessionId) await setContaPagarCaixaSessaoId(created.Id, sessionId);

    revalidatePath("/financeiro/opcoes/caixas");
    revalidatePath("/financeiro/fluxo-caixa");
    
    return { success: true, message: "Sangria realizada com sucesso!" };
  } catch (error) {
    console.error("Erro ao lançar sangria:", error);
    return { success: false, error: "Falha técnica ao lançar sangria." };
  }
}

export async function lancarSuprimento(formData: FormData) {
  try {
    const valor = Number(formData.get("valor"));
    const descricao = formData.get("descricao") as string || "Suprimento de caixa";
    const sessionId = formData.get("sessionId") ? Number(formData.get("sessionId")) : null;

    if (isNaN(valor) || valor <= 0) return { success: false, error: "Valor inválido." };

    await prisma.contaReceber.create({
      data: {
        Descricao: descricao,
        Valor: valor,
        Vencimento: new Date(),
        Recebimento: new Date(),
        SituacaoId: 1, // Liquidado
        PlanoContaId: 1, // Geral
        FormaPgtoId: 1,  // Dinheiro
        Observacoes: sessionId ? `Suprimento vinculado ao caixa #${sessionId}` : "Suprimento manual",
      }
    });

    revalidatePath("/financeiro/opcoes/caixas");
    revalidatePath("/financeiro/fluxo-caixa");

    return { success: true, message: "Suprimento realizado com sucesso!" };
  } catch (error) {
    console.error("Erro ao lançar suprimento:", error);
    return { success: false, error: "Falha técnica ao lançar suprimento." };
  }
}

export async function deletarCaixaSessao(id: number) {
  try {
    await prisma.caixaSessao.delete({
      where: { Id: id }
    });
    revalidatePath("/financeiro/opcoes/caixas");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar sessão de caixa:", error);
    return { success: false, error: "Falha ao deletar. Certifique-se que não existem movimentos vinculados." };
  }
}
