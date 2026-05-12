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

export async function getLogs(filtros?: any, page: number = 1, pageSize: number = 20) {
  try {
    const where: any = {};

    if (filtros?.usuario) {
      where.Usuario = { contains: filtros.usuario, mode: 'insensitive' };
    }
    if (filtros?.modulo && filtros.modulo !== "TODOS") {
      where.Modulo = filtros.modulo;
    }
    if (filtros?.acao) {
      where.Acao = { contains: filtros.acao, mode: 'insensitive' };
    }
    if (filtros?.dataInicio || filtros?.dataFim) {
      where.Data = {};
      if (filtros.dataInicio) where.Data.gte = new Date(filtros.dataInicio + "T00:00:00");
      if (filtros.dataFim) where.Data.lte = new Date(filtros.dataFim + "T23:59:59");
    }

    const [logs, total] = await Promise.all([
      prisma.logSistema.findMany({
        where,
        orderBy: { Data: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.logSistema.count({ where })
    ]);

    return { success: true, data: logs, total };
  } catch (error) {
    console.error("Erro ao buscar logs:", error);
    return { success: false, error: "Erro ao buscar logs" };
  }
}

export async function getRelatorioVendas(filtros?: any, page: number = 1, pageSize: number = 20) {
  try {
    const where: any = { Ativo: true };

    if (filtros?.cliente) {
      where.OR = [
        { Cliente: { Nome: { contains: filtros.cliente, mode: 'insensitive' } } },
      ];
    }

    if (filtros?.dataInicio || filtros?.dataFim) {
      where.DataVenda = {};
      if (filtros.dataInicio) where.DataVenda.gte = new Date(filtros.dataInicio + "T00:00:00");
      if (filtros.dataFim) where.DataVenda.lte = new Date(filtros.dataFim + "T23:59:59");
    }

    // OTIMIZAÇÃO: Buscamos apenas o necessário para o agrupamento
    const todasVendas = await prisma.vendas.findMany({
      where,
      select: {
        Total: true,
        DataVenda: true
      },
      orderBy: { DataVenda: "desc" },
    });

    // Agrupamos por dia em JavaScript (Agora muito mais rápido sem os joins pesados)
    const agrupado: Record<string, { data: string, total: number, qtd: number }> = {};
    
    todasVendas.forEach(v => {
      const dataStr = new Date(v.DataVenda).toISOString().split('T')[0];
      if (!agrupado[dataStr]) {
        agrupado[dataStr] = { data: dataStr, total: 0, qtd: 0 };
      }
      agrupado[dataStr].total += Number(v.Total || 0);
      agrupado[dataStr].qtd += 1;
    });

    const result = Object.values(agrupado).sort((a, b) => b.data.localeCompare(a.data));
    const total = result.length;
    const paginado = result.slice((page - 1) * pageSize, page * pageSize);

    return { 
      success: true, 
      data: paginado,
      total,
      faturamentoTotal: result.reduce((acc, curr) => acc + curr.total, 0)
    };
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

export async function getRelatorioOrdensServico(filtros?: any, page: number = 1, pageSize: number = 20) {
  try {
    const where: any = { Ativo: true };

    if (filtros?.cliente) {
      where.OR = [
        { Cliente: { Nome: { contains: filtros.cliente, mode: 'insensitive' } } },
      ];
    }

    if (filtros?.dataInicio || filtros?.dataFim) {
      where.DataAbertura = {};
      if (filtros.dataInicio) where.DataAbertura.gte = new Date(filtros.dataInicio + "T00:00:00");
      if (filtros.dataFim) where.DataAbertura.lte = new Date(filtros.dataFim + "T23:59:59");
    }

    // OTIMIZAÇÃO: Buscamos apenas o necessário para o agrupamento
    const todasOS = await prisma.ordensServico.findMany({
      where,
      select: {
        Total: true,
        DataAbertura: true
      },
      orderBy: { DataAbertura: "desc" },
    });

    const agrupado: Record<string, { data: string, total: number, qtd: number }> = {};
    
    todasOS.forEach(os => {
      const dataStr = new Date(os.DataAbertura).toISOString().split('T')[0];
      if (!agrupado[dataStr]) {
        agrupado[dataStr] = { data: dataStr, total: 0, qtd: 0 };
      }
      agrupado[dataStr].total += Number(os.Total || 0);
      agrupado[dataStr].qtd += 1;
    });

    const result = Object.values(agrupado).sort((a, b) => b.data.localeCompare(a.data));
    const total = result.length;
    const paginado = result.slice((page - 1) * pageSize, page * pageSize);

    return { 
      success: true, 
      data: paginado,
      total,
      faturamentoTotal: result.reduce((acc, curr) => acc + curr.total, 0)
    };
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
    const [clientes, fornecedores, funcionarios, produtos] = await Promise.all([
      prisma.clientes.count({ where: { Ativo: true } }),
      prisma.fornecedor.count({ where: { Ativo: true } }),
      prisma.funcionario.count({ where: { Ativo: true } }),
      prisma.produtos.count({ where: { Ativo: true } }),
    ]);

    return {
      success: true,
      data: {
        clientes,
        fornecedores,
        funcionarios,
        produtos,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar relatório de cadastros:", error);
    return { success: false, error: "Erro ao buscar relatório de cadastros" };
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
