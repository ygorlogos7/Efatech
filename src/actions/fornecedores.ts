"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAction } from "@/lib/logger";

const MODULO = "FORNECEDORES";

export async function getFornecedores(searchQuery?: string) {
  try {
    const whereClause = searchQuery 
      ? {
          OR: [
            { Nome: { contains: searchQuery, mode: "insensitive" as const } },
            { CPFCNPJ: { contains: searchQuery } }
          ]
        }
      : {};

    const fornecedores = await prisma.fornecedor.findMany({
      where: whereClause,
      orderBy: { Nome: "asc" },
    });

    return { success: true, data: fornecedores };
  } catch (error) {
    console.error("Erro ao buscar fornecedores:", error);
    return { success: false, error: "Falha ao buscar fornecedores do banco de dados." };
  }
}

export async function getFornecedorById(id: number) {
  try {
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { Id: id },
    });
    
    if (fornecedor) {
        return { success: true, data: fornecedor };
    }
    
    return { success: false, error: "Fornecedor não encontrado." };
  } catch (error) {
    return { success: false, error: "Falha na leitura." };
  }
}

export async function createFornecedor(formData: FormData) {
  const nome = formData.get("Nome") as string;
  try {
    const data = {
      TipoFornecedor: formData.get("TipoFornecedor") as string || "J",
      Ativo: formData.get("Ativo") === "true",
      Nome: nome,
      Email: formData.get("Email") as string | null,
      CPFCNPJ: formData.get("CPFCNPJ") as string | null,
      Telefone: formData.get("Telefone") as string | null,
      TelefoneCelular: formData.get("TelefoneCelular") as string | null,
      Observacoes: formData.get("Observacoes") as string | null,
    };

    await prisma.fornecedor.create({ data });
    await logAction("Criar Fornecedor", MODULO, `Fornecedor '${nome}' criado com sucesso.`);
    revalidatePath("/cadastros/fornecedores");
  } catch (error) {
    console.error("Erro ao inserir:", error);
    await logAction("Criar Fornecedor", MODULO, `Falha ao cadastrar fornecedor '${nome}': ${error}`, "ERRO");
    return { success: false, error: "Falha ao gravar fornecedor." };
  }

  redirect("/cadastros/fornecedores");
}

export async function updateFornecedor(id: number, formData: FormData) {
  const nome = formData.get("Nome") as string;
  try {
    const data = {
      TipoFornecedor: formData.get("TipoFornecedor") as string || "J",
      Ativo: formData.get("Ativo") === "true",
      Nome: nome,
      Email: formData.get("Email") as string | null,
      CPFCNPJ: formData.get("CPFCNPJ") as string | null,
      Telefone: formData.get("Telefone") as string | null,
      TelefoneCelular: formData.get("TelefoneCelular") as string | null,
      Observacoes: formData.get("Observacoes") as string | null,
    };

    await prisma.fornecedor.update({
      where: { Id: id },
      data
    });
    await logAction("Atualizar Fornecedor", MODULO, `Fornecedor '${nome}' (ID: ${id}) atualizado.`);
    revalidatePath("/cadastros/fornecedores");
  } catch (error) {
    await logAction("Atualizar Fornecedor", MODULO, `Falha ao atualizar fornecedor '${nome}' (ID: ${id}): ${error}`, "ERRO");
    return { success: false, error: "Falha ao atualizar." };
  }
  
  redirect("/cadastros/fornecedores");
}

export async function deleteFornecedor(id: number) {
  try {
    await prisma.fornecedor.delete({
      where: { Id: id }
    });
    await logAction("Deletar Fornecedor", MODULO, `Fornecedor ID: ${id} removido.`);
    revalidatePath("/cadastros/fornecedores");
    return { success: true };
  } catch (error) {
    await logAction("Deletar Fornecedor", MODULO, `Falha ao remover fornecedor ID: ${id}: ${error}`, "ERRO");
    return { success: false, error: "Falha ao deletar." };
  }
}
