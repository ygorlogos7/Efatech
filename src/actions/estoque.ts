"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const toNum = (v: any) => ({ ...v, Quantidade: Number(v.Quantidade) });
const toNumCompra = (v: any) => ({ ...v, Total: Number(v.Total), Desconto: Number(v.Desconto) });

// ---- Movimentações ----
export async function getMovimentacoes() {
  try {
    const items = await prisma.estoqueMovimentacao.findMany({ orderBy: { CreatedAt: "desc" } });
    return { success: true, data: items.map(toNum) };
  } catch { return { success: false, error: "Falha ao buscar." }; }
}

export async function createMovimentacao(formData: FormData) {
  try {
    await prisma.estoqueMovimentacao.create({
      data: {
        Tipo: formData.get("Tipo") as string,
        Quantidade: Number(formData.get("Quantidade") || 0),
        Motivo: formData.get("Motivo") as string | null,
        Observacoes: formData.get("Observacoes") as string | null,
      }
    });
    revalidatePath("/estoque/movimentacoes");
    return { success: true };
  } catch { return { success: false, error: "Falha ao criar." }; }
}

// ---- Ajustes ----
export async function getAjustes() {
  try {
    const items = await prisma.estoqueAjuste.findMany({ orderBy: { CreatedAt: "desc" } });
    return { success: true, data: items.map(i => ({ ...i, QuantidadeAnterior: Number(i.QuantidadeAnterior), QuantidadeNova: Number(i.QuantidadeNova) })) };
  } catch { return { success: false, error: "Falha ao buscar." }; }
}

export async function createAjuste(formData: FormData) {
  try {
    await prisma.estoqueAjuste.create({
      data: {
        QuantidadeAnterior: Number(formData.get("QuantidadeAnterior") || 0),
        QuantidadeNova: Number(formData.get("QuantidadeNova") || 0),
        Motivo: formData.get("Motivo") as string | null,
        Observacoes: formData.get("Observacoes") as string | null,
      }
    });
    revalidatePath("/estoque/ajustes");
    return { success: true };
  } catch { return { success: false, error: "Falha ao criar." }; }
}

// ---- Transferências ----
export async function getTransferencias() {
  try {
    const items = await prisma.estoqueTransferencia.findMany({ orderBy: { CreatedAt: "desc" } });
    return { success: true, data: items.map(toNum) };
  } catch { return { success: false, error: "Falha ao buscar." }; }
}

export async function createTransferencia(formData: FormData) {
  try {
    await prisma.estoqueTransferencia.create({
      data: {
        Quantidade: Number(formData.get("Quantidade") || 0),
        LocalOrigem: formData.get("LocalOrigem") as string | null,
        LocalDestino: formData.get("LocalDestino") as string | null,
        Observacoes: formData.get("Observacoes") as string | null,
      }
    });
    revalidatePath("/estoque/transferencias");
    return { success: true };
  } catch { return { success: false, error: "Falha ao criar." }; }
}

// ---- Cotações ----
export async function getCotacoes() {
  try {
    const items = await prisma.estoqueCotacao.findMany({ orderBy: { CreatedAt: "desc" } });
    return { success: true, data: items.map(i => ({ ...i, Total: Number(i.Total) })) };
  } catch { return { success: false, error: "Falha ao buscar." }; }
}

export async function createCotacao(formData: FormData) {
  try {
    await prisma.estoqueCotacao.create({
      data: {
        Status: "pendente",
        Total: Number(formData.get("Total") || 0),
        Observacoes: formData.get("Observacoes") as string | null,
      }
    });
    revalidatePath("/estoque/cotacoes");
    return { success: true };
  } catch { return { success: false, error: "Falha ao criar." }; }
}

// ---- Compras Produtos ----
export async function getComprasProdutos() {
  try {
    const items = await prisma.comprasProdutos.findMany({ orderBy: { CreatedAt: "desc" } });
    return { success: true, data: items.map(toNumCompra) };
  } catch { return { success: false, error: "Falha ao buscar." }; }
}

export async function createCompraProdutos(formData: FormData) {
  try {
    await prisma.comprasProdutos.create({
      data: {
        Status: formData.get("Status") as string || "pendente",
        Total: Number(formData.get("Total") || 0),
        Desconto: Number(formData.get("Desconto") || 0),
        Observacoes: formData.get("Observacoes") as string | null,
      }
    });
    revalidatePath("/estoque/compras/produtos");
    return { success: true };
  } catch { return { success: false, error: "Falha ao criar." }; }
}

// ---- Compras Serviços ----
export async function getComprasServicos() {
  try {
    const items = await prisma.comprasServicos.findMany({ orderBy: { CreatedAt: "desc" } });
    return { success: true, data: items.map(toNumCompra) };
  } catch { return { success: false, error: "Falha ao buscar." }; }
}

export async function createCompraServicos(formData: FormData) {
  try {
    await prisma.comprasServicos.create({
      data: {
        Status: formData.get("Status") as string || "pendente",
        Total: Number(formData.get("Total") || 0),
        Desconto: Number(formData.get("Desconto") || 0),
        Observacoes: formData.get("Observacoes") as string | null,
      }
    });
    revalidatePath("/estoque/compras/servicos");
    return { success: true };
  } catch { return { success: false, error: "Falha ao criar." }; }
}

// ---- Trocas e devoluções ----
export async function getTrocasDevolucoes() {
  try {
    const items = await prisma.estoqueTrocaDevolucao.findMany({ orderBy: { CreatedAt: "desc" } });
    return { success: true, data: items.map(toNum) };
  } catch { return { success: false, error: "Falha ao buscar." }; }
}

export async function createTrocaDevolucao(formData: FormData) {
  try {
    await prisma.estoqueTrocaDevolucao.create({
      data: {
        Tipo: formData.get("Tipo") as string,
        Quantidade: Number(formData.get("Quantidade") || 1),
        Motivo: formData.get("Motivo") as string | null,
        Observacoes: formData.get("Observacoes") as string | null,
      }
    });
    revalidatePath("/estoque/trocas-devolucoes");
    return { success: true };
  } catch { return { success: false, error: "Falha ao criar." }; }
}

// ---- Opções: Situações ----
export async function getEstoqueSituacoes() {
  try {
    const items = await prisma.estoqueSituacao.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch { return { success: false, error: "Falha ao buscar." }; }
}

export async function createEstoqueSituacao(formData: FormData) {
  try {
    await prisma.estoqueSituacao.create({
      data: { Nome: formData.get("Nome") as string, Cor: formData.get("Cor") as string || null, Ativo: true }
    });
    revalidatePath("/estoque/opcoes/situacoes");
    return { success: true };
  } catch { return { success: false, error: "Falha ao criar." }; }
}

// ---- Opções: Locais ----
export async function getEstoqueLocais() {
  try {
    const items = await prisma.estoqueLocal.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch { return { success: false, error: "Falha ao buscar." }; }
}

export async function createEstoqueLocal(formData: FormData) {
  try {
    await prisma.estoqueLocal.create({
      data: { Nome: formData.get("Nome") as string, Ativo: true }
    });
    revalidatePath("/estoque/opcoes/locais");
    return { success: true };
  } catch { return { success: false, error: "Falha ao criar." }; }
}
