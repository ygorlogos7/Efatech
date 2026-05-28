"use server";
{/*Alterações:
  19/04/26 - adicionado limite de 20 itens na pagina na funcao getProdutos,Pagesize,skip,take
*/}
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAction } from "@/lib/logger";

const MODULO = "PRODUTOS";

function defaultFiscalByRegime(regimeTributario?: number | null) {
  const regime = Number(regimeTributario || 1);
  if (regime === 1) {
    return {
      cod_cfop: "5102",
      icms_origem: 0,
      icms_cst_csosn: "102",
      pis_cst: "49",
      cofins_cst: "49",
      unidade_comercial: "UN",
    };
  }
  return {
    cod_cfop: "5102",
    icms_origem: 0,
    icms_cst_csosn: "00",
    pis_cst: "01",
    cofins_cst: "01",
    unidade_comercial: "UN",
  };
}

export async function getProdutoFiscalDefaults() {
  try {
    const empresaInterna = await prisma.empresa.findFirst({
      where: { CategoriaEmpresa: "interno", Ativo: true },
      orderBy: { Id: "asc" },
      select: { RegimeTributario: true },
    });
    return { success: true, data: defaultFiscalByRegime(empresaInterna?.RegimeTributario) };
  } catch (error) {
    return { success: false, error: "Falha ao buscar padrões fiscais." };
  }
}

export async function getProdutos(searchQuery?: string, page: number = 1, pageSize: number = 1000) {
  // O pageSize padrão é 1000 para retrocompatibilidade com PDV, mas telas com paginação podem passar 20 explicitamente.
  const skip = (page - 1) * pageSize;
  try {
    const isNumeric = /^\d+$/.test(searchQuery || "");
    const whereClause = searchQuery
      ? {
        OR: [
          { Cod_Nome: { contains: searchQuery, mode: "insensitive" as const } },
          { Cod_CodigoBarras: { contains: searchQuery } },
          ...(isNumeric ? [{ Id: Number(searchQuery) }] : [])
        ]
      }
      : {};

    const items = await prisma.produtos.findMany({
      where: whereClause,
      orderBy: { Cod_Nome: "asc" },
      take: pageSize,
      skip: skip,
    });

    const total = await prisma.produtos.count({ where: whereClause });

    // Serialização: converter Decimal para Number
    const serializedItems = items.map(p => ({
      ...p,
      Cod_Preco: Number(p.Cod_Preco)
    }));

    return { success: true, data: serializedItems, total };
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return { success: false, error: "Falha ao buscar produtos." };
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
      cod_ncm: ((formData.get("cod_ncm") as string) || "").trim() || null,
      cod_cfop: ((formData.get("cod_cfop") as string) || "").trim() || null,
      icms_origem: Number(formData.get("icms_origem") || 0),
      icms_cst_csosn: ((formData.get("icms_cst_csosn") as string) || "").trim() || null,
      pis_cst: ((formData.get("pis_cst") as string) || "").trim() || null,
      cofins_cst: ((formData.get("cofins_cst") as string) || "").trim() || null,
      unidade_comercial: ((formData.get("unidade_comercial") as string) || "").trim() || null,
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
      cod_ncm: ((formData.get("cod_ncm") as string) || "").trim() || null,
      cod_cfop: ((formData.get("cod_cfop") as string) || "").trim() || null,
      icms_origem: Number(formData.get("icms_origem") || 0),
      icms_cst_csosn: ((formData.get("icms_cst_csosn") as string) || "").trim() || null,
      pis_cst: ((formData.get("pis_cst") as string) || "").trim() || null,
      cofins_cst: ((formData.get("cofins_cst") as string) || "").trim() || null,
      unidade_comercial: ((formData.get("unidade_comercial") as string) || "").trim() || null,
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

export async function quickCreateProduto(formData: FormData) {
  try {
    const nome = formData.get("Nome") as string;
    const preco = Number(formData.get("Preco") || 0);
    const estoque = Number(formData.get("EstoqueInitial") || 0);
    const codigo = formData.get("Codigo") as string || `PROD-${Date.now()}`;

    const res = await prisma.produtos.create({
      data: {
        Cod_Nome: nome,
        Cod_Preco: preco,
        Cod_Estoque: estoque,
        Cod_CodigoBarras: codigo,
        ...defaultFiscalByRegime(1),
        Ativo: true,
      }
    });

    return { success: true, data: { ...res, Cod_Preco: Number(res.Cod_Preco) } };
  } catch (error: any) {
    console.error("Erro no quickCreateProduto:", error);
    return { success: false, error: error.message };
  }
}
