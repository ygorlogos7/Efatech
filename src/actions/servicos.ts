"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getServicos(searchQuery?: string) {
  try {
    const whereClause = searchQuery 
      ? {
          OR: [
            { Nome: { contains: searchQuery, mode: "insensitive" as const } },
            { CodigoServico: { contains: searchQuery } }
          ]
        }
      : {};

    const items = await prisma.servicos.findMany({
      where: whereClause,
      orderBy: { Nome: "asc" },
    });

    return { success: true, data: items };
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return { success: false, error: "Falha ao buscar serviços." };
  }
}

export async function getServicoById(id: number) {
  try {
    const item = await prisma.servicos.findUnique({
      where: { Id: id },
    });
    
    if (item) {
        return { 
          success: true, 
          data: {
            ...item,
            ValorCusto: Number(item.ValorCusto),
            ValorVenda: Number(item.ValorVenda),
            PercentualTributos: item.PercentualTributos ? Number(item.PercentualTributos) : 0
          } 
        };
    }
    
    return { success: false, error: "Serviço não encontrado." };
  } catch (error) {
    return { success: false, error: "Falha na leitura." };
  }
}

export async function createServico(formData: FormData) {
  try {
    const data = {
      Ativo: formData.get("Ativo") === "true",
      Nome: formData.get("Nome") as string,
      Descricao: formData.get("Descricao") as string | null,
      ValorCusto: Number(formData.get("ValorCusto") || 0),
      ValorVenda: Number(formData.get("ValorVenda") || 0),
      Categoria: formData.get("Categoria") as string | null,
      CodigoServico: formData.get("CodigoServico") as string | null,
      IssRetidoFonte: formData.get("IssRetidoFonte") === "on",
      Observacoes: formData.get("Observacoes") as string | null,
      PercentualTributos: Number(formData.get("PercentualTributos") || 0),
      RegraTributacao: formData.get("RegraTributacao") as string | null,
      TipoServico: formData.get("TipoServico") as string | null,
    };

    await prisma.servicos.create({ data });
    revalidatePath("/servicos");
  } catch (error) {
    console.error("Erro ao inserir:", error);
    return { success: false, error: "Falha ao gravar serviço." };
  }
  redirect("/servicos");
}

export async function updateServico(id: number, formData: FormData) {
  try {
    const data = {
      Ativo: formData.get("Ativo") === "true",
      Nome: formData.get("Nome") as string,
      Descricao: formData.get("Descricao") as string | null,
      ValorCusto: Number(formData.get("ValorCusto") || 0),
      ValorVenda: Number(formData.get("ValorVenda") || 0),
      Categoria: formData.get("Categoria") as string | null,
      CodigoServico: formData.get("CodigoServico") as string | null,
      IssRetidoFonte: formData.get("IssRetidoFonte") === "on",
      Observacoes: formData.get("Observacoes") as string | null,
      PercentualTributos: Number(formData.get("PercentualTributos") || 0),
      RegraTributacao: formData.get("RegraTributacao") as string | null,
      TipoServico: formData.get("TipoServico") as string | null,
    };

    await prisma.servicos.update({ where: { Id: id }, data });
    revalidatePath("/servicos");
  } catch (error) {
    return { success: false, error: "Falha ao atualizar serviço." };
  }
  redirect("/servicos");
}

export async function deleteServico(id: number) {
  try {
    await prisma.servicos.delete({ where: { Id: id } });
    revalidatePath("/servicos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao deletar." };
  }
}
