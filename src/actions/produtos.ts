"use server";
{/*Alterações:
  19/04/26 - adicionado limite de 20 itens na pagina na funcao getProdutos,Pagesize,skip,take
*/}
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAction } from "@/lib/logger";

const MODULO = "PRODUTOS";

export async function getProdutos(searchQuery?: string, page: number = 1) {
  const pageSize = 20; {/*limite de 20 itens por pagina*/ }
  const skip = (page - 1) * pageSize;
  try {
    const whereClause = searchQuery
      ? {
        OR: [
          { Cod_Nome: { contains: searchQuery, mode: "insensitive" as const } },
          { Cod_CodigoBarras: { contains: searchQuery } }
        ]
      }
      : {};

    const items = await prisma.produtos.findMany({
      where: whereClause,
      orderBy: { Cod_Nome: "asc" },
      take: pageSize,
      skip: skip,
    });

    const total = await prisma.produtos.count({ where: whereClause }); {/*total de itens*/ }

    return { success: true, data: items, total };
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return { success: false, error: "Falha ao buscar produtos do banco de dados." };
  }
}

export async function getProdutoById(id: number) {
  try {
    const item = await prisma.produtos.findUnique({
      where: { Id: id },
    });

    if (item) {
      return {
        success: true,
        data: {
          ...item,
          Cod_Preco: Number(item.Cod_Preco)
        }
      };
    }

    return { success: false, error: "Produto não encontrado." };
  } catch (error) {
    return { success: false, error: "Falha na leitura." };
  }
}

export async function createProduto(formData: FormData) {
  const nome = formData.get("Cod_Nome") as string;
  try {
    const data = {
      Ativo: formData.get("Ativo") === "true",
      Cod_Nome: nome,
      Cod_CodigoBarras: formData.get("Cod_CodigoBarras") as string,
      Cod_Preco: Number(formData.get("Cod_Preco") || 0),
      Cod_Estoque: Number(formData.get("Cod_Estoque") || 0),
    };

    await prisma.produtos.create({ data });
    await logAction("Criar Produto", MODULO, `Produto '${nome}' criado com sucesso.`);
    revalidatePath("/produtos");
  } catch (error) {
    console.error("Erro ao inserir produto:", error);
    await logAction("Criar Produto", MODULO, `Falha ao criar produto '${nome}': ${error}`, "ERRO");
    return { success: false, error: "Falha ao gravar produto." };
  }
  redirect("/produtos");
}

export async function updateProduto(id: number, formData: FormData) {
  const nome = formData.get("Cod_Nome") as string;
  try {
    const data = {
      Ativo: formData.get("Ativo") === "true",
      Cod_Nome: nome,
      Cod_CodigoBarras: formData.get("Cod_CodigoBarras") as string,
      Cod_Preco: Number(formData.get("Cod_Preco") || 0),
      Cod_Estoque: Number(formData.get("Cod_Estoque") || 0),
    };

    await prisma.produtos.update({ where: { Id: id }, data });
    await logAction("Atualizar Produto", MODULO, `Produto '${nome}' (ID: ${id}) atualizado com sucesso.`);
    revalidatePath("/produtos");
  } catch (error) {
    await logAction("Atualizar Produto", MODULO, `Falha ao atualizar produto '${nome}' (ID: ${id}): ${error}`, "ERRO");
    return { success: false, error: "Falha ao atualizar produto." };
  }
  redirect("/produtos");
}

export async function deleteProduto(id: number) {
  try {
    await prisma.produtos.delete({ where: { Id: id } });
    await logAction("Deletar Produto", MODULO, `Produto ID: ${id} removido do sistema.`);
    revalidatePath("/produtos");
    return { success: true };
  } catch (error) {
    await logAction("Deletar Produto", MODULO, `Falha ao remover produto ID: ${id}: ${error}`, "ERRO");
    return { success: false, error: "Falha ao deletar produto." };
  }
}
