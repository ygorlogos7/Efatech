"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getTransportadoras(searchQuery?: string) {
  try {
    const whereClause = searchQuery 
      ? {
          OR: [
            { Nome: { contains: searchQuery, mode: "insensitive" as const } },
            { CPFCNPJ: { contains: searchQuery } }
          ]
        }
      : {};

    const items = await prisma.transportadora.findMany({
      where: whereClause,
      orderBy: { Nome: "asc" },
    });

    return { success: true, data: items };
  } catch (error) {
    console.error("Erro ao buscar transportadoras:", error);
    return { success: false, error: "Falha ao buscar transportadoras do banco de dados." };
  }
}

export async function getTransportadoraById(id: number) {
  try {
    const item = await prisma.transportadora.findUnique({
      where: { Id: id },
    });
    
    if (item) {
        return { success: true, data: item };
    }
    
    return { success: false, error: "Transportadora não encontrada." };
  } catch (error) {
    return { success: false, error: "Falha na leitura." };
  }
}

export async function createTransportadora(formData: FormData) {
  try {
    const data = {
      Ativo: formData.get("Ativo") === "true",
      Nome: formData.get("Nome") as string,
      Email: formData.get("Email") as string | null,
      CPFCNPJ: formData.get("CPFCNPJ") as string | null,
      Telefone: formData.get("Telefone") as string | null,
      TelefoneCelular: formData.get("TelefoneCelular") as string | null,
      Observacoes: formData.get("Observacoes") as string | null,
    };

    await prisma.transportadora.create({ data });
    revalidatePath("/cadastros/transportadoras");
  } catch (error) {
    console.error("Erro ao inserir:", error);
    return { success: false, error: "Falha ao gravar transportadora." };
  }
  redirect("/cadastros/transportadoras");
}

export async function updateTransportadora(id: number, formData: FormData) {
  try {
    const data = {
      Ativo: formData.get("Ativo") === "true",
      Nome: formData.get("Nome") as string,
      Email: formData.get("Email") as string | null,
      CPFCNPJ: formData.get("CPFCNPJ") as string | null,
      Telefone: formData.get("Telefone") as string | null,
      TelefoneCelular: formData.get("TelefoneCelular") as string | null,
      Observacoes: formData.get("Observacoes") as string | null,
    };

    await prisma.transportadora.update({ where: { Id: id }, data });
    revalidatePath("/cadastros/transportadoras");
  } catch (error) {
    return { success: false, error: "Falha ao atualizar." };
  }
  redirect("/cadastros/transportadoras");
}

export async function deleteTransportadora(id: number) {
  try {
    await prisma.transportadora.delete({ where: { Id: id } });
    revalidatePath("/cadastros/transportadoras");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao deletar." };
  }
}
