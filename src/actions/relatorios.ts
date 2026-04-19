"use server";

import { prisma } from "@/lib/prisma";

export async function getResumoGeral() {
  try {
    const [
      totalClientes,
      totalProdutos,
      totalVendas,
      totalServicos,
    ] = await Promise.all([
      prisma.clientes.count({ where: { Ativo: true } }),
      prisma.produtos.count({ where: { Ativo: true } }),
      prisma.vendas.count({ where: { Ativo: true } }),
      prisma.servicos.count({ where: { Ativo: true } }),
    ]);

    return {
      success: true,
      data: {
        totalClientes,
        totalProdutos,
        totalVendas,
        totalServicos,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar resumo geral:", error);
    return { success: false, error: "Erro ao buscar resumo geral" };
  }
}

export async function getLogs(filters?: any) {
  try {
    const logs = await prisma.logSistema.findMany({
      orderBy: { Data: "desc" },
      take: 100,
    });
    return { success: true, data: logs };
  } catch (error) {
    console.error("Erro ao buscar logs:", error);
    return { success: false, error: "Erro ao buscar logs" };
  }
}

export async function getRelatorioVendas(filtros?: any) {
  try {
    const vendas = await prisma.vendas.findMany({
      where: { Ativo: true },
      include: {
        Cliente: true,
        Itens: {
          include: {
            Produtos: true,
          },
        },
      },
      orderBy: { DataVenda: "desc" },
      take: 100,
    });
    return { success: true, data: vendas };
  } catch (error) {
    console.error("Erro ao buscar relatório de vendas:", error);
    return { success: false, error: "Erro ao buscar relatório de vendas" };
  }
}

export async function getRelatorioEstoque(filtros?: any) {
  try {
    const produtos = await prisma.produtos.findMany({
      where: { Ativo: true },
      orderBy: { Cod_Nome: "asc" },
    });
    return { success: true, data: produtos };
  } catch (error) {
    console.error("Erro ao buscar relatório de estoque:", error);
    return { success: false, error: "Erro ao buscar relatório de estoque" };
  }
}

export async function getRelatorioFinanceiro(filtros?: any) {
  try {
    const [contasPagar, contasReceber] = await Promise.all([
      prisma.contaPagar.findMany({
        orderBy: { Vencimento: "desc" },
        take: 50,
      }),
      prisma.contaReceber.findMany({
        orderBy: { Vencimento: "desc" },
        take: 50,
      }),
    ]);

    return {
      success: true,
      data: {
        contasPagar,
        contasReceber,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar relatório financeiro:", error);
    return { success: false, error: "Erro ao buscar relatório financeiro" };
  }
}

export async function getRelatorioOrdensServico(filtros?: any) {
  try {
    const ordensServico = await prisma.ordensServico.findMany({
      where: { Ativo: true },
      include: {
        Cliente: true,
      },
      orderBy: { DataAbertura: "desc" },
      take: 100,
    });
    return { success: true, data: ordensServico };
  } catch (error) {
    console.error("Erro ao buscar relatório de ordens de serviço:", error);
    return {
      success: false,
      error: "Erro ao buscar relatório de ordens de serviço",
    };
  }
}

export async function getRelatorioCadastros(filtros?: any) {
  try {
    const [clientes, fornecedores, funcionarios] = await Promise.all([
      prisma.clientes.count({ where: { Ativo: true } }),
      prisma.fornecedor.count({ where: { Ativo: true } }),
      prisma.funcionario.count({ where: { Ativo: true } }),
    ]);

    return {
      success: true,
      data: {
        clientes,
        fornecedores,
        funcionarios,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar relatório de cadastros:", error);
    return { success: false, error: "Erro ao buscar relatório de cadastros" };
  }
}

export async function getRelatorioContratos(filtros?: any) {
  try {
    const contratos = await prisma.contrato.findMany({
      orderBy: { CreatedAt: "desc" },
      take: 100,
    });
    return { success: true, data: contratos };
  } catch (error) {
    console.error("Erro ao buscar relatório de contratos:", error);
    return { success: false, error: "Erro ao buscar relatório de contratos" };
  }
}

export async function getRelatorioNotasFiscais(filtros?: any) {
  try {
    const [notasFiscais, notasCompra] = await Promise.all([
      prisma.notaFiscal.findMany({
        orderBy: { DataEmissao: "desc" },
        take: 50,
      }),
      prisma.notaCompra.findMany({
        orderBy: { DataEntrada: "desc" },
        take: 50,
      }),
    ]);

    return {
      success: true,
      data: {
        notasFiscais,
        notasCompra,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar relatório de notas fiscais:", error);
    return {
      success: false,
      error: "Erro ao buscar relatório de notas fiscais",
    };
  }
}
