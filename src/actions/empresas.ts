"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/logger";

const MODULO = "EMPRESA";

type EscopoEmpresa = "cadastro" | "interno" | "todas";

function normalizeInscricaoEstadual(value: FormDataEntryValue | null) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  if (raw.toLowerCase() === "isento") return "ISENTO";
  const digits = raw.replace(/\D/g, "");
  return digits || null;
}

function normalizeInscricaoMunicipal(value: FormDataEntryValue | null) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits || null;
}

function parseRegimeTributario(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  if (parsed === 1 || parsed === 2 || parsed === 3) return parsed;
  return 1;
}

export async function getEmpresas(pesquisa: string = "", escopo: EscopoEmpresa = "todas") {
  try {
    const whereScope =
      escopo === "interno"
        ? { CategoriaEmpresa: "interno" as const }
        : escopo === "cadastro"
          ? { CategoriaEmpresa: "cadastro" as const }
          : {};

    const items = await prisma.empresa.findMany({
      where: {
        ...whereScope,
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
      CategoriaEmpresa: (formData.get("CategoriaEmpresa") as string) || "cadastro",
      RazaoSocial: formData.get("RazaoSocial") as string,
      NomeFantasia: formData.get("NomeFantasia") as string,
      Cnpj: formData.get("Cnpj") as string,
      InscricaoEstadual: normalizeInscricaoEstadual(formData.get("InscricaoEstadual")),
      InscricaoMunicipal: normalizeInscricaoMunicipal(formData.get("InscricaoMunicipal")),
      RegimeTributario: parseRegimeTributario(formData.get("RegimeTributario")),
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

    const empresa = await prisma.empresa.create({ data });
    await logAction("Criar Empresa", MODULO, `Empresa ${data.RazaoSocial} (CNPJ: ${data.Cnpj}) cadastrada com sucesso.`);
    revalidatePath("/cadastros/opcoes/empresas");
    revalidatePath("/configuracoes/empresas");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar empresa:", error);
    await logAction("Criar Empresa", MODULO, `Falha ao criar empresa: ${error}`, "ERRO");
    return { success: false, error: "Falha ao criar empresa." };
  }
}

export async function updateEmpresa(id: number, formData: FormData) {
  try {
    const categoriaEmpresa = (formData.get("CategoriaEmpresa") as string) || undefined;
    const data = {
      ...(categoriaEmpresa ? { CategoriaEmpresa: categoriaEmpresa } : {}),
      RazaoSocial: formData.get("RazaoSocial") as string,
      NomeFantasia: formData.get("NomeFantasia") as string,
      Cnpj: formData.get("Cnpj") as string,
      InscricaoEstadual: normalizeInscricaoEstadual(formData.get("InscricaoEstadual")),
      InscricaoMunicipal: normalizeInscricaoMunicipal(formData.get("InscricaoMunicipal")),
      RegimeTributario: parseRegimeTributario(formData.get("RegimeTributario")),
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
    await logAction("Atualizar Empresa", MODULO, `Empresa ID: ${id} (${data.RazaoSocial}) atualizada com sucesso.`);
    revalidatePath("/cadastros/opcoes/empresas");
    revalidatePath("/configuracoes/empresas");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error);
    await logAction("Atualizar Empresa", MODULO, `Falha ao atualizar empresa ID: ${id}: ${error}`, "ERRO");
    return { success: false, error: "Falha ao atualizar empresa." };
  }
}

export async function deleteEmpresa(id: number) {
  try {
    await prisma.empresa.delete({
      where: { Id: id },
    });
    await logAction("Excluir Empresa", MODULO, `Empresa ID: ${id} removida do sistema.`);
    revalidatePath("/cadastros/opcoes/empresas");
    return { success: true };
  } catch (error) {
    await logAction("Excluir Empresa", MODULO, `Falha ao excluir empresa ID: ${id}: ${error}`, "ERRO");
    return { success: false, error: "Falha ao excluir empresa." };
  }
}
export async function quickCreateEmpresa(formData: FormData) {
  const razao = (formData.get("RazaoSocial") as string)?.trim();
  if (!razao) {
    return { success: false as const, error: "Informe a razão social da empresa." };
  }
  try {
    const cnpjTrim = ((formData.get("Cnpj") as string) || "").trim();
    const nfTrim = ((formData.get("NomeFantasia") as string) || "").trim();
    const data = {
      CategoriaEmpresa: "cadastro",
      RazaoSocial: razao,
      NomeFantasia: nfTrim || razao,
      Cnpj: cnpjTrim || `TEMP-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      InscricaoEstadual: ((formData.get("InscricaoEstadual") as string) || "").trim() || null,
      InscricaoMunicipal: normalizeInscricaoMunicipal(formData.get("InscricaoMunicipal")),
      Email: ((formData.get("Email") as string) || "").trim() || null,
      Telefone: ((formData.get("Telefone") as string) || "").trim() || null,
      Ativo: true,
    };

    const newEmpresa = await prisma.empresa.create({ data });
    await logAction("Quick Create Empresa", MODULO, `Empresa ${razao} cadastrada via criação rápida.`);
    revalidatePath("/cadastros/opcoes/empresas");
    return { success: true, data: newEmpresa };
  } catch (error) {
    console.error("Erro no quickCreateEmpresa:", error);
    await logAction("Quick Create Empresa", MODULO, `Falha no Quick Create: ${error}`, "ERRO");
    return { success: false, error: "Falha ao gravar empresa rapidamente." };
  }
}
