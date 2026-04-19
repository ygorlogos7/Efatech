"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper to convert Decimal to number
const toNum = (v: any) => ({ ...v, Valor: Number(v.Valor || 0) });

// ---- Contas a Pagar ----
export async function getContasPagar() {
  try {
    const items = await prisma.contaPagar.findMany({ orderBy: { Vencimento: "asc" } });
    return { success: true, data: items.map(toNum) };
  } catch (error) {
    return { success: false, error: "Falha ao buscar contas a pagar." };
  }
}

export async function createContaPagar(formData: FormData) {
  try {
    const data = {
      Descricao: formData.get("Descricao") as string,
      Valor: Number(formData.get("Valor") || 0),
      Vencimento: new Date(formData.get("Vencimento") as string),
      Pagamento: formData.get("Pagamento") ? new Date(formData.get("Pagamento") as string) : null,
      Observacoes: formData.get("Observacoes") as string | null,
    };
    await prisma.contaPagar.create({ data });
    revalidatePath("/financeiro/contas-pagar");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar conta a pagar." };
  }
}

// ---- Contas a Receber ----
export async function getContasReceber() {
  try {
    const items = await prisma.contaReceber.findMany({ orderBy: { Vencimento: "asc" } });
    return { success: true, data: items.map(toNum) };
  } catch (error) {
    return { success: false, error: "Falha ao buscar contas a receber." };
  }
}

export async function createContaReceber(formData: FormData) {
  try {
    const data = {
      Descricao: formData.get("Descricao") as string,
      Valor: Number(formData.get("Valor") || 0),
      Vencimento: new Date(formData.get("Vencimento") as string),
      Recebimento: formData.get("Recebimento") ? new Date(formData.get("Recebimento") as string) : null,
      Observacoes: formData.get("Observacoes") as string | null,
    };
    await prisma.contaReceber.create({ data });
    revalidatePath("/financeiro/contas-receber");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar conta a receber." };
  }
}

// ---- Caixas ----
export async function getCaixas() {
  try {
    const items = await prisma.caixa.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items.map(i => ({ ...i, SaldoAtual: Number(i.SaldoAtual) })) };
  } catch (error) {
    return { success: false, error: "Falha ao buscar caixas." };
  }
}

export async function createCaixa(formData: FormData) {
  try {
    await prisma.caixa.create({
      data: {
        Nome: formData.get("Nome") as string,
        SaldoInicial: Number(formData.get("SaldoInicial") || 0),
        SaldoAtual: Number(formData.get("SaldoInicial") || 0),
      }
    });
    revalidatePath("/financeiro/opcoes/caixas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar caixa." };
  }
}

// ---- Contas Bancárias ----
export async function getContasBancarias() {
  try {
    const items = await prisma.contaBancaria.findMany({ orderBy: { Banco: "asc" } });
    return { success: true, data: items.map(i => ({ ...i, SaldoAtual: Number(i.SaldoAtual) })) };
  } catch (error) {
    return { success: false, error: "Falha ao buscar contas bancárias." };
  }
}

export async function createContaBancaria(formData: FormData) {
  try {
    await prisma.contaBancaria.create({
      data: {
        Banco: formData.get("Banco") as string,
        Agencia: formData.get("Agencia") as string | null,
        Conta: formData.get("Conta") as string | null,
        Titular: formData.get("Titular") as string | null,
        SaldoInicial: Number(formData.get("SaldoInicial") || 0),
        SaldoAtual: Number(formData.get("SaldoInicial") || 0),
      }
    });
    revalidatePath("/financeiro/opcoes/contas-bancarias");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar conta bancária." };
  }
}

// ---- Formas de Pagamento ----
export async function getFormasPagamento() {
  try {
    const items = await prisma.formaPagamento.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar formas de pagamento." };
  }
}

export async function createFormaPagamento(formData: FormData) {
  try {
    await prisma.formaPagamento.create({
      data: { Nome: formData.get("Nome") as string }
    });
    revalidatePath("/financeiro/opcoes/formas-pagamento");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar forma de pagamento." };
  }
}

// ---- Plano de Contas ----
export async function getPlanoContas() {
  try {
    const items = await prisma.planoConta.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar plano de contas." };
  }
}

export async function createPlanoConta(formData: FormData) {
  try {
    await prisma.planoConta.create({
      data: {
        Nome: formData.get("Nome") as string,
        Tipo: formData.get("Tipo") as string,
      }
    });
    revalidatePath("/financeiro/opcoes/plano-contas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar plano de conta." };
  }
}

// ---- Centros de Custo ----
export async function getCentrosCusto() {
  try {
    const items = await prisma.centroCusto.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar centros de custo." };
  }
}

export async function createCentroCusto(formData: FormData) {
  try {
    await prisma.centroCusto.create({
      data: { Nome: formData.get("Nome") as string }
    });
    revalidatePath("/financeiro/opcoes/centros-custo");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar centro de custo." };
  }
}

// ---- Boletos ----
export async function getBoletos() {
  try {
    const items = await prisma.boletoBancario.findMany({ orderBy: { CreatedAt: "desc" } });
    return { success: true, data: items.map(i => ({ ...i, Valor: Number(i.Valor) })) };
  } catch (error) {
    return { success: false, error: "Falha ao buscar boletos." };
  }
}
