"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ---- Atendimentos (Central de Tickets) ----
export async function getAtendimentos() {
  try {
    const items = await prisma.atendimento.findMany({
      orderBy: { DataAbertura: "desc" }
    });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar atendimentos." };
  }
}

export async function createAtendimento(formData: FormData) {
  try {
    const data = {
      Assunto: formData.get("Assunto") as string,
      Descricao: formData.get("Descricao") as string | null,
      Prioridade: formData.get("Prioridade") as string || "media",
    };
    await prisma.atendimento.create({ data });
    revalidatePath("/atendimentos/central");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar atendimento." };
  }
}

// ---- Categorias ----
export async function getAtendimentoCategorias() {
  try {
    const items = await prisma.atendimentoCategoria.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar categorias." };
  }
}

// ---- Canais ----
export async function getAtendimentoCanais() {
  try {
    const items = await prisma.atendimentoCanal.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar canais." };
  }
}
