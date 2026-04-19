"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getFuncionarios(searchQuery?: string) {
  try {
    const whereClause = searchQuery 
      ? {
          OR: [
            { Nome: { contains: searchQuery, mode: "insensitive" as const } },
            { CPFCNPJ: { contains: searchQuery } }
          ]
        }
      : {};

    const items = await prisma.funcionario.findMany({
      where: whereClause,
      orderBy: { Nome: "asc" },
    });

    return { success: true, data: items };
  } catch (error) {
    console.error("Erro ao buscar funcionarios:", error);
    return { success: false, error: "Falha ao buscar funcionarios do banco de dados." };
  }
}

export async function getFuncionarioById(id: number) {
  try {
    const item = await prisma.funcionario.findUnique({
      where: { Id: id },
    });
    
    if (item) {
        return { 
          success: true, 
          data: {
            ...item,
            Comissao: item.Comissao ? Number(item.Comissao) : null,
            DataNascimento: item.DataNascimento ? item.DataNascimento.toISOString().split("T")[0] : null
          } 
        };
    }
    
    return { success: false, error: "Funcionário não encontrado." };
  } catch (error) {
    return { success: false, error: "Falha na leitura." };
  }
}

export async function createFuncionario(formData: FormData) {
  try {
    const dataNascimentoRaw = formData.get("DataNascimento") as string | null;
    const data = {
      Ativo: formData.get("Ativo") === "true",
      PermitirAcessoSistema: formData.get("PermitirAcessoSistema") === "on",
      Nome: formData.get("Nome") as string,
      Cargo: formData.get("Cargo") as string | null,
      Email: formData.get("Email") as string | null,
      CPFCNPJ: formData.get("CPFCNPJ") as string | null,
      RG: formData.get("RG") as string | null,
      Sexo: formData.get("Sexo") as string | null,
      TelefoneFixo: formData.get("TelefoneFixo") as string | null,
      TelefoneCelular1: formData.get("TelefoneCelular1") as string | null,
      TelefoneCelular2: formData.get("TelefoneCelular2") as string | null,
      Comissao: formData.get("Comissao") ? Number(formData.get("Comissao")) : null,
      DataNascimento: dataNascimentoRaw ? new Date(dataNascimentoRaw) : null,
      Observacoes: formData.get("Observacoes") as string | null,
    };

    await prisma.funcionario.create({ data });
    revalidatePath("/cadastros/funcionarios");
  } catch (error) {
    console.error("Erro ao inserir:", error);
    return { success: false, error: "Falha ao gravar funcionário." };
  }
  redirect("/cadastros/funcionarios");
}

export async function updateFuncionario(id: number, formData: FormData) {
  try {
    const dataNascimentoRaw = formData.get("DataNascimento") as string | null;
    const data = {
      Ativo: formData.get("Ativo") === "true",
      PermitirAcessoSistema: formData.get("PermitirAcessoSistema") === "on",
      Nome: formData.get("Nome") as string,
      Cargo: formData.get("Cargo") as string | null,
      Email: formData.get("Email") as string | null,
      CPFCNPJ: formData.get("CPFCNPJ") as string | null,
      RG: formData.get("RG") as string | null,
      Sexo: formData.get("Sexo") as string | null,
      TelefoneFixo: formData.get("TelefoneFixo") as string | null,
      TelefoneCelular1: formData.get("TelefoneCelular1") as string | null,
      TelefoneCelular2: formData.get("TelefoneCelular2") as string | null,
      Comissao: formData.get("Comissao") ? Number(formData.get("Comissao")) : null,
      DataNascimento: dataNascimentoRaw ? new Date(dataNascimentoRaw) : null,
      Observacoes: formData.get("Observacoes") as string | null,
    };

    await prisma.funcionario.update({ where: { Id: id }, data });
    revalidatePath("/cadastros/funcionarios");
  } catch (error) {
    return { success: false, error: "Falha ao atualizar." };
  }
  
  redirect("/cadastros/funcionarios");
}

export async function deleteFuncionario(id: number) {
  try {
    await prisma.funcionario.delete({ where: { Id: id } });
    revalidatePath("/cadastros/funcionarios");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao deletar." };
  }
}
