"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getContratos() {
  try {
    const contratos = await prisma.contrato.findMany({
      orderBy: { CreatedAt: "desc" },
    });
    return { success: true, data: contratos };
  } catch (error) {
    console.error("Erro ao buscar contratos:", error);
    return { success: false, error: "Erro ao buscar contratos" };
  }
}

export async function createContrato(data: any) {
  try {
    const contrato = await prisma.contrato.create({
      data,
    });
    revalidatePath("/contratos");
    return { success: true, data: contrato };
  } catch (error) {
    console.error("Erro ao criar contrato:", error);
    return { success: false, error: "Erro ao criar contrato" };
  }
}

export async function updateContrato(id: number, data: any) {
  try {
    const contrato = await prisma.contrato.update({
      where: { Id: id },
      data,
    });
    revalidatePath("/contratos");
    return { success: true, data: contrato };
  } catch (error) {
    console.error("Erro ao atualizar contrato:", error);
    return { success: false, error: "Erro ao atualizar contrato" };
  }
}

export async function deleteContrato(id: number) {
  try {
    await prisma.contrato.delete({
      where: { Id: id },
    });
    revalidatePath("/contratos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar contrato:", error);
    return { success: false, error: "Erro ao deletar contrato" };
  }
}

export async function getAssinaturas() {
  try {
    const assinaturas = await prisma.assinatura.findMany({
      orderBy: { CreatedAt: "desc" },
    });
    return { success: true, data: assinaturas };
  } catch (error) {
    console.error("Erro ao buscar assinaturas:", error);
    return { success: false, error: "Erro ao buscar assinaturas" };
  }
}

export async function getLocacoes() {
  try {
    const locacoes = await prisma.locacao.findMany({
      orderBy: { CreatedAt: "desc" },
    });
    return { success: true, data: locacoes };
  } catch (error) {
    console.error("Erro ao buscar locações:", error);
    return { success: false, error: "Erro ao buscar locações" };
  }
}
