"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- Orçamentos (Produtos) ---
export async function getOrcamentosProdutos(searchQuery?: string, page: number = 1, pageSize: number = 20) {
  const skip = (page - 1) * pageSize;
  
  try {
    const whereClause: any = {};
    
    if (searchQuery) {
      whereClause.OR = [
        { Numero: isNaN(parseInt(searchQuery)) ? undefined : { equals: parseInt(searchQuery) } },
        { Clientes: { Nome: { contains: searchQuery, mode: "insensitive" } } }
      ].filter(c => c.Numero !== undefined || c.Clientes !== undefined);

      if (isNaN(parseInt(searchQuery))) {
        whereClause.OR = [
          { Clientes: { Nome: { contains: searchQuery, mode: "insensitive" } } }
        ];
      }
    }

    const items = await prisma.orcamento.findMany({
      where: whereClause,
      include: { Clientes: true },
      orderBy: { CreatedAt: "desc" },
      take: pageSize,
      skip: skip,
    });

    const situacoes = await prisma.orcamentoSituacao.findMany({ where: { Ativo: true } });
    
    const total = await prisma.orcamento.count({ where: whereClause });
    return { 
      success: true, 
      data: items.map(i => ({ 
        ...i, 
        TotalProdutos: Number(i.TotalProdutos), 
        TotalServicos: Number(i.TotalServicos), 
        Desconto: Number(i.Desconto), 
        Total: Number(i.Total),
        Situacao: situacoes.find(s => s.Id === i.SituacaoId)
      })), 
      total 
    };
  } catch (error) {
    return { success: false, error: "Falha ao buscar orçamentos de produtos." };
  }
}

// --- Orçamentos (Serviços) ---
export async function getOrcamentosServicos(searchQuery?: string, page: number = 1, pageSize: number = 20) {
  const skip = (page - 1) * pageSize;
  try {
    const whereClause: any = {};
    
    if (searchQuery) {
      whereClause.OR = [
        { Numero: isNaN(parseInt(searchQuery)) ? undefined : { equals: parseInt(searchQuery) } },
        { Clientes: { Nome: { contains: searchQuery, mode: "insensitive" } } }
      ].filter(c => c.Numero !== undefined || c.Clientes !== undefined);

      if (isNaN(parseInt(searchQuery))) {
        whereClause.OR = [
          { Clientes: { Nome: { contains: searchQuery, mode: "insensitive" } } }
        ];
      }
    }

    const items = await prisma.orcamento.findMany({
      where: whereClause,
      include: { Clientes: true },
      orderBy: { CreatedAt: "desc" },
      take: pageSize,
      skip: skip,
    });

    const situacoes = await prisma.orcamentoSituacao.findMany({ where: { Ativo: true } });
    
    const total = await prisma.orcamento.count({ where: whereClause });
    return { 
      success: true, 
      data: items.map(i => ({ 
        ...i, 
        TotalProdutos: Number(i.TotalProdutos), 
        TotalServicos: Number(i.TotalServicos), 
        Desconto: Number(i.Desconto), 
        Total: Number(i.Total),
        Situacao: situacoes.find(s => s.Id === i.SituacaoId)
      })), 
      total 
    };
  } catch (error) {
    return { success: false, error: "Falha ao buscar orçamentos de serviços." };
  }
}

// --- Situações ---
export async function getOrcamentoSituacoes() {
  try {
    const items = await prisma.orcamentoSituacao.findMany({ 
      orderBy: { Nome: "asc" } 
    });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar situações." };
  }
}

export async function createOrcamentoSituacao(formData: FormData) {
  try {
    await prisma.orcamentoSituacao.create({
      data: {
        Nome: formData.get("Nome") as string,
        Cor: formData.get("Cor") as string || null,
        TransformarEmVenda: formData.get("TransformarEmVenda") === "true",
        ExibirNaListagem: formData.get("ExibirNaListagem") === "true",
        Ativo: true,
      }
    });
    revalidatePath("/orcamentos/opcoes/situacoes");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar situação:", error);
    return { success: false, error: "Falha ao criar situação." };
  }
}

// --- Modelos de Email ---
export async function getModelosEmail() {
  try {
    const items = await prisma.orcamentoModeloEmail.findMany({ orderBy: { Nome: "asc" } });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Falha ao buscar modelos de e-mail." };
  }
}

export async function createModeloEmail(formData: FormData) {
  try {
    await prisma.orcamentoModeloEmail.create({
      data: {
        Nome: formData.get("Nome") as string,
        Assunto: formData.get("Assunto") as string,
        Corpo: formData.get("Corpo") as string,
        Ativo: true,
      }
    });
    revalidatePath("/orcamentos/opcoes/modelos-email");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar modelo." };
  }
}

// --- Configurações ---
export async function getOrcamentoConfig() {
  try {
    const config = await prisma.orcamentoConfig.findFirst();
    return { success: true, data: config };
  } catch (error) {
    return { success: false, error: "Falha ao buscar configurações." };
  }
}

export async function saveOrcamentoConfig(formData: FormData) {
  try {
    const data = {
      ValidadePadraoEmDias: parseInt(formData.get("ValidadePadraoEmDias") as string) || 30,
      MensagemRodape: formData.get("MensagemRodape") as string || null,
      NumeracaoAutomatica: formData.get("NumeracaoAutomatica") === "true",
      EmailPadrao: formData.get("EmailPadrao") as string || null,
    };
    const existing = await prisma.orcamentoConfig.findFirst();
    if (existing) {
      await prisma.orcamentoConfig.update({ where: { Id: existing.Id }, data });
    } else {
      await prisma.orcamentoConfig.create({ data });
    }
    revalidatePath("/orcamentos/opcoes/configuracoes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao salvar configurações." };
  }
}
export async function getOrcamentoById(id: number) {
  try {
    const item = await prisma.orcamento.findUnique({
      where: { Id: id },
      include: { Clientes: { include: { Endereco: true } } }
    });
    if (!item) return { success: false, error: "Orçamento não encontrado." };
    
    // Converte Decimal para Number para o frontend
    const plainItem = JSON.parse(JSON.stringify(item));
    return { 
      success: true, 
      data: { 
        ...plainItem,
        TotalProdutos: Number(item.TotalProdutos),
        TotalServicos: Number(item.TotalServicos),
        Desconto: Number(item.Desconto),
        Total: Number(item.Total)
      } 
    };
  } catch (error) {
    return { success: false, error: "Falha ao buscar detalhes do orçamento." };
  }
}

export async function createOrcamento(formData: FormData) {
  try {
    let clienteId = formData.get("ClienteId") ? Number(formData.get("ClienteId")) : null;
    const clienteNome = formData.get("ClienteNome") as string;
    const clienteTelefone = formData.get("ClienteTelefone") as string;
    const clienteCPF = formData.get("ClienteCPF") as string;
    const clienteEmail = formData.get("ClienteEmail") as string;

    // Se não tiver ID mas tiver Nome, cria um novo cliente
    if (!clienteId && clienteNome) {
      const novoCliente = await prisma.clientes.create({
        data: {
          Nome: clienteNome,
          Telefone: clienteTelefone || null,
          CPFCNPJ: clienteCPF || null,
          Email: clienteEmail || null,
          TipoCliente: "F",
          Ativo: true,
          VendedorResponsavel: "Johnny Andrade Ferreira",
          PermitirExcederLimite: false
        }
      });
      clienteId = novoCliente.Id;
    }

    const dataValidadeStr = formData.get("DataValidade") as string;
    const total = parseFloat(formData.get("Total") as string) || 0;
    const desconto = parseFloat(formData.get("Desconto") as string) || 0;

    const data = {
      ClienteId: clienteId || null,
      DataValidade: dataValidadeStr ? new Date(dataValidadeStr) : null,
      Descricao: formData.get("Descricao") as string || null,
      Observacoes: formData.get("Observacoes") as string || null,
      TotalProdutos: total,
      Total: total - desconto,
      Desconto: desconto,
      Ativo: true,
    };

    const item = await prisma.orcamento.create({ data });
    
    revalidatePath("/orcamentos/produtos");
    revalidatePath("/orcamentos/servicos");
    return { success: true, data: { Id: item.Id } };
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    return { success: false, error: "Falha ao salvar orçamento." };
  }
}

export async function updateOrcamento(id: number, formData: FormData) {
    try {
      const clienteId = parseInt(formData.get("ClienteId") as string);
      const dataValidadeStr = formData.get("DataValidade") as string;
      const total = parseFloat(formData.get("Total") as string) || 0;
      const desconto = parseFloat(formData.get("Desconto") as string) || 0;
  
      const data = {
        ClienteId: clienteId || null,
        DataValidade: dataValidadeStr ? new Date(dataValidadeStr) : null,
        Descricao: formData.get("Descricao") as string || null,
        Observacoes: formData.get("Observacoes") as string || null,
        TotalProdutos: total,
        Total: total - desconto,
        Desconto: desconto,
      };
  
      await prisma.orcamento.update({ where: { Id: id }, data });
      
      revalidatePath("/orcamentos/produtos");
      revalidatePath("/orcamentos/servicos");
      return { success: true };
    } catch (error) {
      return { success: false, error: "Falha ao atualizar orçamento." };
    }
  }
export async function deleteOrcamento(id: number) {
  try {
    await prisma.orcamento.delete({ where: { Id: id } });
    revalidatePath("/orcamentos/produtos");
    revalidatePath("/orcamentos/servicos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao excluir orçamento." };
  }
}
export async function updateSituacaoOrcamento(id: number, ativo: boolean) {
  try {
    await prisma.orcamento.update({
      where: { Id: id },
      data: { Ativo: ativo }
    });
    revalidatePath("/orcamentos/produtos");
    revalidatePath("/orcamentos/servicos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao alterar situação do orçamento." };
  }
}

export async function updateSituacaoIdOrcamento(id: number, situacaoId: number | null) {
  try {
    await prisma.orcamento.update({
      where: { Id: id },
      data: { SituacaoId: situacaoId }
    });
    revalidatePath("/orcamentos/produtos");
    revalidatePath("/orcamentos/servicos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao alterar situação." };
  }
}
