"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ---- Dados da Empresa ----
export async function getEmpresa() {
  try {
    const item = await prisma.empresa.findUnique({ where: { Id: 1 } });
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: "Falha ao buscar dados da empresa." };
  }
}

export async function updateEmpresa(formData: FormData) {
  try {
    const data = {
      RazaoSocial: formData.get("RazaoSocial") as string,
      NomeFantasia: formData.get("NomeFantasia") as string | null,
      Cnpj: formData.get("Cnpj") as string,
      Email: formData.get("Email") as string | null,
      Telefone: formData.get("Telefone") as string | null,
    };
    await prisma.empresa.upsert({
      where: { Id: 1 },
      update: data,
      create: { ...data, Id: 1 }
    });
    revalidatePath("/configuracoes/dados-empresa");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao atualizar dados da empresa." };
  }
}

// ---- Plano ----
export async function getPlano() {
  try {
    const item = await prisma.plano.findUnique({ where: { Id: 1 } });
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: "Falha ao buscar plano." };
  }
}

// ---- Configurações Gerais ----
export async function getConfigGeral() {
  try {
    const item = await prisma.configGeral.findUnique({ where: { Id: 1 } });
    return { success: true, data: item || { NomeSistema: "Efatech ERP", Moeda: "BRL" } };
  } catch (error) {
    return { success: false, error: "Falha ao buscar configurações gerais." };
  }
}
