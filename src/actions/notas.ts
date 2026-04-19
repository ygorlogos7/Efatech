"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const toNum = (v: any) => ({ ...v, ValorTotal: Number(v.ValorTotal || 0) });

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

export async function createNota(tipo: "produto" | "servico" | "consumidor", formData: FormData) {
  try {
    const data = {
      Tipo: tipo,
      Destinatario: formData.get("Destinatario") as string,
      ValorTotal: Number(formData.get("ValorTotal") || 0),
      Serie: Number(formData.get("Serie") || 1),
      Numero: Number(formData.get("Numero") || Math.floor(Math.random() * 10000)),
      Status: "autorizada", // Simulação de autorização imediata para o ERP operante
      ChaveAcesso: Math.random().toString(36).substring(2, 15).toUpperCase(),
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
