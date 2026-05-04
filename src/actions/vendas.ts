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
  } catch (error) {
    console.error("Error in getVendas:", error);
    return { success: false, error: "Falha ao buscar vendas." };
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
    const clienteId = formData.get("ClienteId") ? Number(formData.get("ClienteId")) : null;
    const itensJson = formData.get("Itens") as string;
    const itens = itensJson ? JSON.parse(itensJson) : [];

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
        TotalProdutos: Number(formData.get("TotalProdutos") || 0),
        TotalServicos: Number(formData.get("TotalServicos") || 0),
        Desconto: Number(formData.get("Desconto") || 0),
        Total: total,
        Observacoes: formData.get("Observacoes") as string | null,
        Vendedor: formData.get("Vendedor") as string | null,
        EmpresaId: formData.get("EmpresaId") ? Number(formData.get("EmpresaId")) : null,
        AssinaturaCliente: formData.get("AssinaturaCliente") as string | null,
        Ativo: true,
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

    console.log(">>> [VENDA] CRIADA COM SUCESSO! ID:", venda.Id);

    // Revalidação em background (opcional)
    // revalidatePath("/vendas/balcao"); 

    return { success: true, id: venda.Id };
  } catch (error: any) {
    console.error(">>> [VENDA] ERRO NO SERVIDOR:", error.message);
    return { success: false, error: error.message };
  }
}

export async function updateVenda(id: number, tipo: string, formData: FormData) {
  try {
    const total = Number(formData.get("Total") || 0);
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
        CanalId: formData.get("CanalId") ? Number(formData.get("CanalId")) : null,
        EmpresaId: formData.get("EmpresaId") ? Number(formData.get("EmpresaId")) : null,
        FormaPagamentoId: formData.get("FormaPagamentoId") ? Number(formData.get("FormaPagamentoId")) : null,
        Ativo: formData.get("Ativo") !== "false",
      },
    });
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

// --- Situações ---
export async function getVendaSituacoes() {
  try {
    const items = await prisma.vendaSituacao.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar situações." };
  }
}

export async function createVendaSituacao(formData: FormData) {
  try {
    await prisma.vendaSituacao.create({
      data: { Nome: formData.get("Nome") as string, Cor: (formData.get("Cor") as string) || null, Ativo: true },
    });
    revalidatePath("/vendas/opcoes/situacoes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar." };
  }
}

// --- Canais ---
export async function getVendaCanais() {
  try {
    const items = await prisma.vendaCanal.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar canais." };
  }
}

export async function createVendaCanal(formData: FormData) {
  try {
    await prisma.vendaCanal.create({
      data: { Nome: formData.get("Nome") as string, Ativo: true },
    });
    revalidatePath("/vendas/opcoes/canais");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar." };
  }
}

// --- Modelos de Email ---
export async function getVendaModelosEmail() {
  try {
    const items = await prisma.vendaModeloEmail.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar modelos." };
  }
}

export async function createVendaModeloEmail(formData: FormData) {
  try {
    await prisma.vendaModeloEmail.create({
      data: {
        Nome: formData.get("Nome") as string,
        Assunto: formData.get("Assunto") as string,
        Corpo: formData.get("Corpo") as string,
        Ativo: true,
      },
    });
    revalidatePath("/vendas/opcoes/modelos-email");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar." };
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

// --- Config ---
export async function getVendaConfig() {
  try {
    const config = await prisma.vendaConfig.findFirst();
    return {
      success: true,
      data: config ? { ...config, DescontoMaximo: Number(config.DescontoMaximo) } : config,
    };
  } catch (error) {
    return { success: false, error: "Falha ao buscar configurações." };
  }
}

export async function saveVendaConfig(formData: FormData) {
  try {
    const data = {
      MensagemRodape: (formData.get("MensagemRodape") as string) || null,
      NumeracaoAutomatica: formData.get("NumeracaoAutomatica") === "true",
      EmailPadrao: (formData.get("EmailPadrao") as string) || null,
      PermitirDesconto: formData.get("PermitirDesconto") === "true",
      DescontoMaximo: Number(formData.get("DescontoMaximo") || 100),
    };
    const existing = await prisma.vendaConfig.findFirst();
    if (existing) {
      await prisma.vendaConfig.update({ where: { Id: existing.Id }, data });
    } else {
      await prisma.vendaConfig.create({ data });
    }
    revalidatePath("/vendas/opcoes/configuracoes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao salvar." };
  }
}
export async function updateSituacaoVenda(id: number, ativo: boolean) {
  try {
    await prisma.venda.update({
      where: { Id: id },
      data: { Ativo: ativo }
    });
    revalidatePath("/vendas/produtos");
    revalidatePath("/vendas/balcao");
    revalidatePath("/vendas/servicos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao alterar situação da venda." };
  }
}
