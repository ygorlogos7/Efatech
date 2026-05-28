"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAction } from "@/lib/logger";

const MODULO = "VENDAS";

const toNum = (v: any) => {
  if (!v) return null;
  return {
    ...v,
    TotalProdutos: Number(v.TotalProdutos || 0),
    TotalServicos: Number(v.TotalServicos || 0),
    Desconto: Number(v.Desconto || 0),
    Total: Number(v.Total || 0),
    CaixaSessaoId: v.CaixaSessaoId || null,
  };
};

const normalizeString = (value: FormDataEntryValue | null) => {
  const parsed = typeof value === "string" ? value.trim() : "";
  return parsed.length > 0 ? parsed : null;
};

const normalizeFiscalItem = (item: any) => ({
  cod_ncm: typeof item?.cod_ncm === "string" ? item.cod_ncm.trim() || null : null,
  cod_cfop: typeof item?.cod_cfop === "string" ? item.cod_cfop.trim() || null : null,
  unidade_comercial: typeof item?.unidade_comercial === "string" ? item.unidade_comercial.trim() || null : null,
  icms_origem: Number(item?.icms_origem ?? 0),
  icms_cst_csosn: typeof item?.icms_cst_csosn === "string" ? item.icms_cst_csosn.trim() || null : null,
  pis_cst: typeof item?.pis_cst === "string" ? item.pis_cst.trim() || null : null,
  cofins_cst: typeof item?.cofins_cst === "string" ? item.cofins_cst.trim() || null : null,
});

// --- Vendas ---
export async function getVendas(tipo?: string, page: number = 1, pageSize: number = 20, searchQuery?: string) {
  const skip = (page - 1) * pageSize;
  
  try {
    const whereClause: any = tipo ? { Tipo: tipo } : {};

    if (searchQuery) {
      whereClause.OR = [
        { Numero: isNaN(parseInt(searchQuery)) ? undefined : { equals: parseInt(searchQuery) } },
        { Cliente: { Nome: { contains: searchQuery, mode: "insensitive" } } }
      ].filter(c => c.Numero !== undefined || c.Cliente !== undefined);
    }
    
    const items = await prisma.vendas.findMany({
      where: whereClause,
      include: { Cliente: true },
      orderBy: { CreatedAt: "desc" },
      take: pageSize,
      skip: skip,
    });
    
    const total = await prisma.vendas.count({ where: whereClause });
    
    return { success: true, data: items.map(toNum), total };
  } catch (error: any) {
    console.error("Error in getVendas:", error);
    return { success: false, error: `Falha ao buscar vendas: ${error.message}` };
  }
}

export async function getVendaById(id: number) {
  try {
    const item = await prisma.vendas.findUnique({
      where: { Id: id },
      include: {
        Cliente: {
          include: {
            Endereco: true
          }
        },
        Empresa: true,
        Itens: {
          include: {
            Produtos: true
          }
        },
        FormaPagamento: true
      }
    });

    if (item) {
      return {
        success: true,
        data: {
          ...toNum(item),
          Itens: item.Itens.map(i => ({
            ...i,
            ValorTotal: Number(i.ValorTotal)
          }))
        }
      };
    }
    return { success: false, error: "Venda não encontrada." };
  } catch (error) {
    return { success: false, error: "Falha na leitura." };
  }
}

export async function createVenda(tipo: string, formData: FormData) {
  try {
    const total = Number(formData.get("Total") || 0);
    const itensJson = formData.get("Itens") as string;
    const itens = itensJson ? JSON.parse(itensJson) : [];
    const dataVendaRaw = formData.get("DataVenda") as string | null;
    const dataVenda = dataVendaRaw ? new Date(dataVendaRaw) : new Date();
    let clienteId = formData.get("ClienteId") ? Number(formData.get("ClienteId")) : null;

    const clienteNome = formData.get("ClienteNome") as string;
    const clienteTelefone = formData.get("ClienteTelefone") as string;
    const clienteCPF = formData.get("ClienteCPF") as string;
    const clienteEmail = formData.get("ClienteEmail") as string;
    const clienteCep = normalizeString(formData.get("ClienteCep"));
    const clienteLogradouro = normalizeString(formData.get("ClienteLogradouro"));
    const clienteNumero = normalizeString(formData.get("ClienteNumero"));
    const clienteBairro = normalizeString(formData.get("ClienteBairro"));
    const clienteCidade = normalizeString(formData.get("ClienteCidade"));
    const clienteUf = normalizeString(formData.get("ClienteUf"));

    const empresaRazaoSocial = normalizeString(formData.get("EmpresaRazaoSocial"));
    const empresaNomeFantasia = normalizeString(formData.get("EmpresaNomeFantasia"));
    const empresaCnpj = normalizeString(formData.get("EmpresaCnpj"));
    const empresaIE = normalizeString(formData.get("EmpresaIE"));
    const empresaEmailComercial = normalizeString(formData.get("EmpresaEmailComercial"));
    const empresaTelefoneComercial = normalizeString(formData.get("EmpresaTelefoneComercial"));
    const empresaCep = normalizeString(formData.get("EmpresaCep"));
    const empresaLogradouro = normalizeString(formData.get("EmpresaLogradouro"));
    const empresaNumero = normalizeString(formData.get("EmpresaNumero"));
    const empresaBairro = normalizeString(formData.get("EmpresaBairro"));
    const empresaCidade = normalizeString(formData.get("EmpresaCidade"));
    const empresaUf = normalizeString(formData.get("EmpresaUf"));

    // Se não tiver ID mas tiver Nome, cria um novo cliente
    if (!clienteId && clienteNome) {
      const novoCliente = await prisma.clientes.create({
        data: {
          Nome: clienteNome,
          Telefone: clienteTelefone || null,
          CPFCNPJ: clienteCPF || null,
          Email: clienteEmail || null,
          TipoCliente: "F", // Padrão
          Ativo: true,
          VendedorResponsavel: formData.get("Vendedor") as string || "Johnny Andrade Ferreira",
          PermitirExcederLimite: false
        }
      });
      clienteId = novoCliente.Id;
    }

    // Buscar caixa aberto para vincular
    const caixaAberto = await prisma.caixaSessao.findFirst({
      where: { Status: "Aberto" },
      orderBy: { DataAbertura: "desc" }
    });

    console.log(">>> [VENDA] VINCULANDO AO CAIXA:", caixaAberto?.Id || "NENHUM CAIXA ABERTO");

    const venda = await prisma.vendas.create({
      data: {
        Tipo: tipo,
        ClienteId: clienteId,
        DataVenda: dataVenda,
        TotalProdutos: Number(formData.get("TotalProdutos") || 0),
        TotalServicos: Number(formData.get("TotalServicos") || 0),
        Desconto: Number(formData.get("Desconto") || 0),
        Total: total,
        Observacoes: formData.get("Observacoes") as string | null,
        Vendedor: formData.get("Vendedor") as string | null,
        EmpresaId: formData.get("EmpresaId") ? Number(formData.get("EmpresaId")) : null,
        AssinaturaCliente: formData.get("AssinaturaCliente") as string | null,
        Garantia: formData.get("Garantia") as string | null,
        Ativo: formData.get("Situacao") ? formData.get("Situacao") === "Concluída" : true,
        CaixaSessaoId: caixaAberto?.Id || null, // Vínculo com o caixa
        FormaPagamentoId: formData.get("FormaPagamentoId") ? Number(formData.get("FormaPagamentoId")) : null,
        Itens: {
          create: itens.map((item: any) => ({
            ProdutoId: Number(item.ProdutoId),
            Quantidade: Number(item.Quantidade),
            ValorTotal: Number(item.ValorTotal),
          }))
        }
      },
    });

    if (clienteId) {
      await prisma.clientes.update({
        where: { Id: clienteId },
        data: {
          Nome: clienteNome || undefined,
          Telefone: clienteTelefone || null,
          CPFCNPJ: clienteCPF || null,
          Email: clienteEmail || null,
        },
      });

      const hasClienteAddressData = Boolean(
        clienteCep || clienteLogradouro || clienteNumero || clienteBairro || clienteCidade || clienteUf,
      );
      if (hasClienteAddressData) {
        const enderecoExistente = await prisma.endereco.findFirst({
          where: { ClienteId: clienteId },
          orderBy: { Id: "asc" },
          select: { Id: true },
        });

        if (enderecoExistente) {
          await prisma.endereco.update({
            where: { Id: enderecoExistente.Id },
            data: {
              Cep: clienteCep,
              Logradouro: clienteLogradouro,
              Numero: clienteNumero,
              Bairro: clienteBairro,
              Cidade: clienteCidade,
              UF: clienteUf,
            },
          });
        } else {
          await prisma.endereco.create({
            data: {
              ClienteId: clienteId,
              Cep: clienteCep,
              Logradouro: clienteLogradouro,
              Numero: clienteNumero,
              Bairro: clienteBairro,
              Cidade: clienteCidade,
              UF: clienteUf,
            },
          });
        }
      }
    }

    const empresaId = venda.EmpresaId;
    if (empresaId) {
      await prisma.empresa.update({
        where: { Id: empresaId },
        data: {
          RazaoSocial: empresaRazaoSocial || undefined,
          NomeFantasia: empresaNomeFantasia,
          Cnpj: empresaCnpj || undefined,
          InscricaoEstadual: empresaIE,
          Email: empresaEmailComercial,
          Telefone: empresaTelefoneComercial,
          Cep: empresaCep,
          Logradouro: empresaLogradouro,
          Numero: empresaNumero,
          Bairro: empresaBairro,
          Cidade: empresaCidade,
          Uf: empresaUf,
        },
      });
    }

    for (const item of itens) {
      if (!item?.ProdutoId) continue;
      await prisma.produtos.update({
        where: { Id: Number(item.ProdutoId) },
        data: normalizeFiscalItem(item),
      });
    }

    console.log(">>> [VENDA] CRIADA COM SUCESSO! ID:", venda.Id);

    return { success: true, id: venda.Id, data: venda };
  } catch (error: any) {
    console.error(">>> [VENDA] ERRO NO SERVIDOR:", error.message);
    return { success: false, error: error.message };
  }
}

export async function getProximoNumeroVenda() {
  try {
    const ultima = await prisma.vendas.findFirst({
      orderBy: { Numero: "desc" },
      select: { Numero: true }
    });
    return { success: true, proximo: (ultima?.Numero || 0) + 1 };
  } catch (error) {
    return { success: true, proximo: 1 };
  }
}

export async function updateVenda(id: number, tipo: string, formData: FormData) {
  try {
    const total = Number(formData.get("Total") || 0);
    const itensJson = formData.get("Itens") as string;
    const itens = itensJson ? JSON.parse(itensJson) : [];
    const clienteId = formData.get("ClienteId") ? Number(formData.get("ClienteId")) : null;
    const clienteNome = formData.get("ClienteNome") as string;
    const clienteTelefone = formData.get("ClienteTelefone") as string;
    const clienteCPF = formData.get("ClienteCPF") as string;
    const clienteEmail = formData.get("ClienteEmail") as string;
    const clienteCep = normalizeString(formData.get("ClienteCep"));
    const clienteLogradouro = normalizeString(formData.get("ClienteLogradouro"));
    const clienteNumero = normalizeString(formData.get("ClienteNumero"));
    const clienteBairro = normalizeString(formData.get("ClienteBairro"));
    const clienteCidade = normalizeString(formData.get("ClienteCidade"));
    const clienteUf = normalizeString(formData.get("ClienteUf"));

    const empresaId = formData.get("EmpresaId") ? Number(formData.get("EmpresaId")) : null;
    const empresaRazaoSocial = normalizeString(formData.get("EmpresaRazaoSocial"));
    const empresaNomeFantasia = normalizeString(formData.get("EmpresaNomeFantasia"));
    const empresaCnpj = normalizeString(formData.get("EmpresaCnpj"));
    const empresaIE = normalizeString(formData.get("EmpresaIE"));
    const empresaEmailComercial = normalizeString(formData.get("EmpresaEmailComercial"));
    const empresaTelefoneComercial = normalizeString(formData.get("EmpresaTelefoneComercial"));
    const empresaCep = normalizeString(formData.get("EmpresaCep"));
    const empresaLogradouro = normalizeString(formData.get("EmpresaLogradouro"));
    const empresaNumero = normalizeString(formData.get("EmpresaNumero"));
    const empresaBairro = normalizeString(formData.get("EmpresaBairro"));
    const empresaCidade = normalizeString(formData.get("EmpresaCidade"));
    const empresaUf = normalizeString(formData.get("EmpresaUf"));

    await prisma.vendas.update({
      where: { Id: id },
      data: {
        TotalProdutos: Number(formData.get("TotalProdutos") || 0),
        TotalServicos: Number(formData.get("TotalServicos") || 0),
        Desconto: Number(formData.get("Desconto") || 0),
        Total: total,
        Observacoes: formData.get("Observacoes") as string | null,
        Vendedor: formData.get("Vendedor") as string | null,
        Garantia: formData.get("Garantia") as string | null,
        EmpresaId: empresaId,
        FormaPagamentoId: formData.get("FormaPagamentoId") ? Number(formData.get("FormaPagamentoId")) : null,
        Ativo: formData.get("Situacao") === "Concluída",
      },
    });

    if (clienteId) {
      await prisma.clientes.update({
        where: { Id: clienteId },
        data: {
          Nome: clienteNome || undefined,
          Telefone: clienteTelefone || null,
          CPFCNPJ: clienteCPF || null,
          Email: clienteEmail || null,
        },
      });

      const hasClienteAddressData = Boolean(
        clienteCep || clienteLogradouro || clienteNumero || clienteBairro || clienteCidade || clienteUf,
      );
      if (hasClienteAddressData) {
        const enderecoExistente = await prisma.endereco.findFirst({
          where: { ClienteId: clienteId },
          orderBy: { Id: "asc" },
          select: { Id: true },
        });

        if (enderecoExistente) {
          await prisma.endereco.update({
            where: { Id: enderecoExistente.Id },
            data: {
              Cep: clienteCep,
              Logradouro: clienteLogradouro,
              Numero: clienteNumero,
              Bairro: clienteBairro,
              Cidade: clienteCidade,
              UF: clienteUf,
            },
          });
        } else {
          await prisma.endereco.create({
            data: {
              ClienteId: clienteId,
              Cep: clienteCep,
              Logradouro: clienteLogradouro,
              Numero: clienteNumero,
              Bairro: clienteBairro,
              Cidade: clienteCidade,
              UF: clienteUf,
            },
          });
        }
      }
    }

    if (empresaId) {
      await prisma.empresa.update({
        where: { Id: empresaId },
        data: {
          RazaoSocial: empresaRazaoSocial || undefined,
          NomeFantasia: empresaNomeFantasia,
          Cnpj: empresaCnpj || undefined,
          InscricaoEstadual: empresaIE,
          Email: empresaEmailComercial,
          Telefone: empresaTelefoneComercial,
          Cep: empresaCep,
          Logradouro: empresaLogradouro,
          Numero: empresaNumero,
          Bairro: empresaBairro,
          Cidade: empresaCidade,
          Uf: empresaUf,
        },
      });
    }

    for (const item of itens) {
      if (!item?.ProdutoId) continue;
      await prisma.produtos.update({
        where: { Id: Number(item.ProdutoId) },
        data: normalizeFiscalItem(item),
      });
    }
    await logAction("Atualizar Venda", MODULO, `Venda ID: ${id} (${tipo}) atualizada para R$ ${total.toFixed(2)}.`);
    revalidatePath(`/vendas/${tipo}`);
  } catch (error) {
    await logAction("Atualizar Venda", MODULO, `Falha ao atualizar venda ID: ${id}: ${error}`, "ERRO");
    return { success: false, error: "Falha ao atualizar venda." };
  }
  redirect(`/vendas/${tipo}`);
}

export async function deleteVenda(id: number, tipo: string) {
  try {
    await prisma.vendas.delete({ where: { Id: id } });
    await logAction("Deletar Venda", MODULO, `Venda ID: ${id} removida pelo usuário.`);
    revalidatePath(`/vendas/${tipo}`);
    return { success: true };
  } catch (error) {
    await logAction("Deletar Venda", MODULO, `Falha ao remover venda ID: ${id}: ${error}`, "ERRO");
    return { success: false, error: "Falha ao deletar." };
  }
}

// --- Balanças ---
export async function getVendaBalancas() {
  try {
    const items = await prisma.vendaBalanca.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar balanças." };
  }
}

export async function createVendaBalanca(formData: FormData) {
  try {
    await prisma.vendaBalanca.create({
      data: {
        Nome: formData.get("Nome") as string,
        Modelo: (formData.get("Modelo") as string) || null,
        Porta: (formData.get("Porta") as string) || null,
        Ativo: true,
      },
    });
    revalidatePath("/vendas/opcoes/balancas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar." };
  }
}

export async function updateSituacaoVenda(id: number, status: string) {
  try {
    if (status !== "Concluída" && status !== "Aberta") {
      return { success: false, error: "Situação inválida." };
    }

    await prisma.vendas.update({
      where: { Id: id },
      data: {
        Ativo: status === "Concluída",
      }
    });

    revalidatePath("/vendas/produtos");
    revalidatePath("/vendas/balcao");
    revalidatePath("/vendas/servicos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao alterar situação:", error);
    return { success: false, error: "Falha ao alterar situação da venda." };
  }
}
