"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- Ordens de Serviço ---
export async function getOrdensServico(searchQuery?: string, page: number = 1, pageSize: number = 20) {
  const skip = (page - 1) * pageSize;
  
  try {
    const whereClause = searchQuery ? {
      OR: [
        { Equipamento: { contains: searchQuery, mode: "insensitive" as const } },
        { Defeito: { contains: searchQuery, mode: "insensitive" as const } },
      ]
    } : {};

    const items = await prisma.ordensServico.findMany({
      where: whereClause,
      include: { Cliente: true },
      orderBy: { CreatedAt: "desc" },
      take: pageSize,
      skip: skip,
    });

    const total = await prisma.ordensServico.count({ where: whereClause });
    return { 
        success: true, 
        data: items.map(i => ({ 
            ...i, 
            Total: Number(i.Total),
        })), 
        total 
    };
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
        },
        FormaPagamento: true
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
    let clienteId = formData.get("ClienteId") ? Number(formData.get("ClienteId")) : null;
    const clienteNome = formData.get("ClienteNome") as string;
    const clienteTelefone = formData.get("ClienteTelefone") as string;
    const clienteCPF = formData.get("ClienteCPF") as string;

    // Se não tiver ID mas tiver Nome, cria um novo cliente
    if (!clienteId && clienteNome) {
      const novoCliente = await prisma.clientes.create({
        data: {
          Nome: clienteNome,
          Telefone: clienteTelefone || null,
          CPFCNPJ: clienteCPF || null,
          TipoCliente: "F", // Padrão
          Ativo: true,
          VendedorResponsavel: "Johnny Andrade Ferreira",
          PermitirExcederLimite: false
        }
      });
      clienteId = novoCliente.Id;
    }

    // Buscar caixa aberto para vincular
    const caixaAberto = await prisma.caixaSessao.findFirst({
      where: { Status: "Aberto" },
      orderBy: { DataAbertura: "desc" }
    });

    const res = await prisma.ordensServico.create({
      data: {
        ClienteId: clienteId,
        Equipamento: formData.get("Equipamento") as string | null,
        Defeito: formData.get("Defeito") as string | null,
        Solucao: formData.get("Solucao") as string | null,
        Observacoes: formData.get("Observacoes") as string | null,
        Total: Number(formData.get("Total") || 0),
        DataPrevisao: formData.get("DataPrevisao") ? new Date(formData.get("DataPrevisao") as string) : null,
        AssinaturaCliente: formData.get("AssinaturaCliente") as string | null,
        AssinaturaTecnico: formData.get("AssinaturaTecnico") as string | null,
        FormaPagamentoId: formData.get("FormaPagamentoId") ? Number(formData.get("FormaPagamentoId")) : null,
        CaixaSessaoId: caixaAberto?.Id || null,
        Ativo: true,
      }
    });
    revalidatePath("/ordens-servico");
    return { success: true, data: res };
  } catch (error) {
    console.error("Erro ao criar OS:", error);
    return { success: false, error: "Falha ao criar OS." };
  }
}

export async function updateOrdemServico(id: number, formData: FormData) {
  try {
    const isFinalizing = formData.get("Ativo") === "false";
    let caixaSessaoId = undefined;

    if (isFinalizing) {
      const caixaAberto = await prisma.caixaSessao.findFirst({
        where: { Status: "Aberto" },
        orderBy: { DataAbertura: "desc" }
      });
      caixaSessaoId = caixaAberto?.Id;
    }

    const res = await prisma.ordensServico.update({
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
        FormaPagamentoId: formData.get("FormaPagamentoId") ? Number(formData.get("FormaPagamentoId")) : null,
        CaixaSessaoId: caixaSessaoId,
        Ativo: !isFinalizing,
      }
    });
    revalidatePath("/ordens-servico");
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: "Falha ao atualizar OS." };
  }
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

export async function updateSituacaoOS(id: number, ativo: boolean) {
  try {
    await prisma.ordensServico.update({
      where: { Id: id },
      data: { Ativo: ativo }
    });
    revalidatePath("/ordens-servico");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao alterar situação da OS." };
  }
}
