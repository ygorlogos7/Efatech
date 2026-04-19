"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Valores de Venda ---
export async function getValoresVenda() {
  try {
    const items = await prisma.valoresVenda.findMany({
      orderBy: { Desc_Lucro: "asc" }
    });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar valores de venda." };
  }
}

// --- Grupos de Produtos ---
export async function getProdutoGrupos() {
  try {
    const items = await prisma.produtoGrupo.findMany({
      orderBy: { Nome: "asc" }
    });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar grupos de produtos." };
  }
}

export async function createProdutoGrupo(formData: FormData) {
  try {
    const nome = formData.get("Nome") as string;
    await prisma.produtoGrupo.create({
      data: { Nome: nome, Ativo: true }
    });
    revalidatePath("/produtos/opcoes/grupos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar grupo." };
  }
}

// --- Unidades de Produtos ---
export async function getProdutoUnidades() {
  try {
    const items = await prisma.produtoUnidade.findMany({
      orderBy: { Nome: "asc" }
    });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar unidades." };
  }
}

export async function createProdutoUnidade(formData: FormData) {
  try {
    const nome = formData.get("Nome") as string;
    const sigla = formData.get("Sigla") as string;
    await prisma.produtoUnidade.create({
      data: { Nome: nome, Sigla: sigla, Ativo: true }
    });
    revalidatePath("/produtos/opcoes/unidades");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar unidade." };
  }
}

// --- Grades/Variações ---
export async function getProdutoGrades() {
  try {
    const items = await prisma.produtoGrade.findMany({
      orderBy: { Nome: "asc" }
    });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar grades." };
  }
}

export async function createProdutoGrade(formData: FormData) {
  try {
    const nome = formData.get("Nome") as string;
    await prisma.produtoGrade.create({
      data: { Nome: nome, Ativo: true }
    });
    revalidatePath("/produtos/opcoes/grades");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar grade." };
  }
}

// --- Etiquetas ---
export async function getProdutoEtiquetas() {
  try {
    const items = await prisma.produtoEtiqueta.findMany({
      orderBy: { Nome: "asc" }
    });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar etiquetas." };
  }
}

export async function createProdutoEtiqueta(formData: FormData) {
  try {
    const nome = formData.get("Nome") as string;
    const codigo = formData.get("Codigo") as string;
    await prisma.produtoEtiqueta.create({
      data: { Nome: nome, Codigo: codigo, Ativo: true }
    });
    revalidatePath("/produtos/etiquetas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar etiqueta." };
  }
}
