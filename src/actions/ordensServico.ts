"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- Ordens de Serviço ---
export async function getOrdensServico(searchQuery?: string) {
  try {
    const items = await prisma.ordensServico.findMany({
      where: searchQuery ? {
        OR: [
          { Equipamento: { contains: searchQuery, mode: "insensitive" } },
          { Defeito: { contains: searchQuery, mode: "insensitive" } },
        ]
      } : {},
      include: { Cliente: true },
      orderBy: { CreatedAt: "desc" },
    });
    return { success: true, data: items.map(i => ({ ...i, Total: Number(i.Total) })) };
  } catch (error) {
    return { success: false, error: "Falha ao buscar ordens de serviço." };
  }
}

export async function getOrdemServicoById(id: number) {
  try {
    const item = await prisma.ordensServico.findUnique({ 
      where: { Id: id },
      include: { 
        Cliente: {
          include: {
            Endereco: true
          }
        }
      } 
    });
    if (item) {
      const plainItem = JSON.parse(JSON.stringify(item));
      return { 
        success: true, 
        data: { 
          ...plainItem, 
          Total: Number(item.Total) 
        } 
      };
    }
    return { success: false, error: "OS não encontrada." };
  } catch (error) {
    return { success: false, error: "Falha na leitura." };
  }
}

export async function createOrdemServico(formData: FormData) {
  try {
    const res = await prisma.ordensServico.create({
      data: {
        ClienteId: formData.get("ClienteId") ? Number(formData.get("ClienteId")) : null,
        Equipamento: formData.get("Equipamento") as string | null,
        Defeito: formData.get("Defeito") as string | null,
        Solucao: formData.get("Solucao") as string | null,
        Observacoes: formData.get("Observacoes") as string | null,
        Total: Number(formData.get("Total") || 0),
        DataPrevisao: formData.get("DataPrevisao") ? new Date(formData.get("DataPrevisao") as string) : null,
        AssinaturaCliente: formData.get("AssinaturaCliente") as string | null,
        AssinaturaTecnico: formData.get("AssinaturaTecnico") as string | null,
        Ativo: true,
      }
    });
    revalidatePath("/ordens-servico");
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: "Falha ao criar OS." };
  }
  redirect("/ordens-servico");
}

export async function updateOrdemServico(id: number, formData: FormData) {
  try {
    await prisma.ordensServico.update({
      where: { Id: id },
      data: {
        ClienteId: formData.get("ClienteId") ? Number(formData.get("ClienteId")) : null,
        Equipamento: formData.get("Equipamento") as string | null,
        Defeito: formData.get("Defeito") as string | null,
        Solucao: formData.get("Solucao") as string | null,
        Observacoes: formData.get("Observacoes") as string | null,
        Total: Number(formData.get("Total") || 0),
        DataPrevisao: formData.get("DataPrevisao") ? new Date(formData.get("DataPrevisao") as string) : null,
        AssinaturaCliente: formData.get("AssinaturaCliente") as string | null,
        AssinaturaTecnico: formData.get("AssinaturaTecnico") as string | null,
        Ativo: formData.get("Ativo") === "true",
      }
    });
    revalidatePath("/ordens-servico");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao atualizar OS." };
  }
  redirect("/ordens-servico");
}

export async function deleteOrdemServico(id: number) {
  try {
    await prisma.ordensServico.delete({ where: { Id: id } });
    revalidatePath("/ordens-servico");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao deletar." };
  }
}

// --- Situações OS ---
export async function getOSSituacoes() {
  try {
    const items = await prisma.ordemServicoSituacao.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar situações." };
  }
}

export async function createOSSituacao(formData: FormData) {
  try {
    await prisma.ordemServicoSituacao.create({
      data: {
        Nome: formData.get("Nome") as string,
        Cor: formData.get("Cor") as string || null,
        Ativo: true,
      }
    });
    revalidatePath("/ordens-servico/opcoes/situacoes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar situação." };
  }
}

// --- Modelos de Email OS ---
export async function getOSModelosEmail() {
  try {
    const items = await prisma.ordemServicoModeloEmail.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar modelos." };
  }
}

export async function createOSModeloEmail(formData: FormData) {
  try {
    await prisma.ordemServicoModeloEmail.create({
      data: {
        Nome: formData.get("Nome") as string,
        Assunto: formData.get("Assunto") as string,
        Corpo: formData.get("Corpo") as string,
        Ativo: true,
      }
    });
    revalidatePath("/ordens-servico/opcoes/modelos-email");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar modelo." };
  }
}

// --- Config OS ---
export async function getOSConfig() {
  try {
    const config = await prisma.ordemServicoConfig.findFirst();
    return { success: true, data: config };
  } catch (error) {
    return { success: false, error: "Falha ao buscar configurações." };
  }
}

export async function saveOSConfig(formData: FormData) {
  try {
    const data = {
      ValidadePadraoEmDias: parseInt(formData.get("ValidadePadraoEmDias") as string) || 7,
      MensagemRodape: formData.get("MensagemRodape") as string || null,
      NumeracaoAutomatica: formData.get("NumeracaoAutomatica") === "true",
      EmailPadrao: formData.get("EmailPadrao") as string || null,
    };
    const existing = await prisma.ordemServicoConfig.findFirst();
    if (existing) {
      await prisma.ordemServicoConfig.update({ where: { Id: existing.Id }, data });
    } else {
      await prisma.ordemServicoConfig.create({ data });
    }
    revalidatePath("/ordens-servico/opcoes/configuracoes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao salvar." };
  }
}
