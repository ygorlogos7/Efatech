"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getEmpresas(pesquisa: string = "") {
  try {
    const items = await prisma.empresa.findMany({
      where: {
        OR: [
          { RazaoSocial: { contains: pesquisa, mode: "insensitive" } },
          { NomeFantasia: { contains: pesquisa, mode: "insensitive" } },
          { Cnpj: { contains: pesquisa, mode: "insensitive" } },
        ],
      },
      orderBy: { RazaoSocial: "asc" },
    });
    return { success: true, data: items };
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    return { success: false, error: "Falha ao buscar empresas." };
  }
}

export async function getEmpresaById(id: number) {
  try {
    const item = await prisma.empresa.findUnique({
      where: { Id: id },
    });
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: "Falha ao buscar empresa." };
  }
}

export async function createEmpresa(formData: FormData) {
  try {
    const data = {
      RazaoSocial: formData.get("RazaoSocial") as string,
      NomeFantasia: formData.get("NomeFantasia") as string,
      Cnpj: formData.get("Cnpj") as string,
      InscricaoEstadual: formData.get("InscricaoEstadual") as string,
      Email: formData.get("Email") as string,
      Telefone: formData.get("Telefone") as string,
      Cep: formData.get("Cep") as string,
      Logradouro: formData.get("Logradouro") as string,
      Numero: formData.get("Numero") as string,
      Bairro: formData.get("Bairro") as string,
      Cidade: formData.get("Cidade") as string,
      Uf: formData.get("Uf") as string,
      Ativo: formData.get("Ativo") === "on",
    };

    await prisma.empresa.create({ data });
    revalidatePath("/cadastros/opcoes/empresas");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar empresa:", error);
    return { success: false, error: "Falha ao criar empresa." };
  }
}

export async function updateEmpresa(id: number, formData: FormData) {
  try {
    const data = {
      RazaoSocial: formData.get("RazaoSocial") as string,
      NomeFantasia: formData.get("NomeFantasia") as string,
      Cnpj: formData.get("Cnpj") as string,
      InscricaoEstadual: formData.get("InscricaoEstadual") as string,
      Email: formData.get("Email") as string,
      Telefone: formData.get("Telefone") as string,
      Cep: formData.get("Cep") as string,
      Logradouro: formData.get("Logradouro") as string,
      Numero: formData.get("Numero") as string,
      Bairro: formData.get("Bairro") as string,
      Cidade: formData.get("Cidade") as string,
      Uf: formData.get("Uf") as string,
      Ativo: formData.get("Ativo") === "on",
    };

    await prisma.empresa.update({
      where: { Id: id },
      data,
    });
    revalidatePath("/cadastros/opcoes/empresas");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error);
    return { success: false, error: "Falha ao atualizar empresa." };
  }
}

export async function deleteEmpresa(id: number) {
  try {
    await prisma.empresa.delete({
      where: { Id: id },
    });
    revalidatePath("/cadastros/opcoes/empresas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao excluir empresa." };
  }
}
export async function quickCreateEmpresa(formData: FormData) {
  const razao = formData.get("RazaoSocial") as string;
  try {
    const data = {
      RazaoSocial: razao,
      NomeFantasia: formData.get("NomeFantasia") as string || razao,
      Cnpj: formData.get("Cnpj") as string | null,
      Telefone: formData.get("Telefone") as string | null,
      Ativo: true,
    };

    const newEmpresa = await prisma.empresa.create({ data });
    revalidatePath("/cadastros/opcoes/empresas");
    return { success: true, data: newEmpresa };
  } catch (error) {
    console.error("Erro no quickCreateEmpresa:", error);
    return { success: false, error: "Falha ao gravar empresa rapidamente." };
  }
}
