"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    // A receber hoje
    const receberHoje = await prisma.contaReceber.findMany({
      where: {
        Vencimento: { gte: today, lt: tomorrow },
        Recebimento: null,
      },
    });
    const totalReceberHoje = receberHoje.reduce(
      (sum, c) => sum + Number(c.Valor || 0),
      0
    );

    // A pagar hoje
    const pagarHoje = await prisma.contaPagar.findMany({
      where: {
        Vencimento: { gte: today, lt: tomorrow },
        Pagamento: null,
      },
    });
    const totalPagarHoje = pagarHoje.reduce(
      (sum, c) => sum + Number(c.Valor || 0),
      0
    );

    // Recebimentos do mês
    const recebimentosMes = await prisma.contaReceber.findMany({
      where: {
        Vencimento: { gte: firstDayOfMonth, lte: lastDayOfMonth },
      },
    });
    const recebimentosRealizados = recebimentosMes
      .filter((c) => c.Recebimento !== null)
      .reduce((sum, c) => sum + Number(c.Valor || 0), 0);
    const recebimentosPrevisto = recebimentosMes.reduce(
      (sum, c) => sum + Number(c.Valor || 0),
      0
    );
    const recebimentosFalta = recebimentosPrevisto - recebimentosRealizados;
    const recebimentosPercentual =
      recebimentosPrevisto > 0
        ? (recebimentosRealizados / recebimentosPrevisto) * 100
        : 0;

    // Pagamentos do mês
    const pagamentosMes = await prisma.contaPagar.findMany({
      where: {
        Vencimento: { gte: firstDayOfMonth, lte: lastDayOfMonth },
      },
    });
    const pagamentosRealizados = pagamentosMes
      .filter((c) => c.Pagamento !== null)
      .reduce((sum, c) => sum + Number(c.Valor || 0), 0);
    const pagamentosPrevisto = pagamentosMes.reduce(
      (sum, c) => sum + Number(c.Valor || 0),
      0
    );
    const pagamentosFalta = pagamentosPrevisto - pagamentosRealizados;
    const pagamentosPercentual =
      pagamentosPrevisto > 0
        ? (pagamentosRealizados / pagamentosPrevisto) * 100
        : 0;

    // Fluxo de caixa - últimos 6 meses
    const fluxoData = [];
    for (let i = 5; i >= 0; i--) {
      const mesDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mesEnd = new Date(
        mesDate.getFullYear(),
        mesDate.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      const recebidos = await prisma.contaReceber.findMany({
        where: {
          Recebimento: { gte: mesDate, lte: mesEnd },
        },
      });
      const pagos = await prisma.contaPagar.findMany({
        where: {
          Pagamento: { gte: mesDate, lte: mesEnd },
        },
      });

      const entradas = recebidos.reduce(
        (sum, c) => sum + Number(c.Valor || 0),
        0
      );
      const saidas = pagos.reduce(
        (sum, c) => sum + Number(c.Valor || 0),
        0
      );

      const monthNames = [
        "jan",
        "fev",
        "mar",
        "abr",
        "mai",
        "jun",
        "jul",
        "ago",
        "set",
        "out",
        "nov",
        "dez",
      ];
      fluxoData.push({
        name: `${monthNames[mesDate.getMonth()]} ${mesDate.getFullYear()}`,
        entry: Math.round(entradas / 1000 * 10) / 10,
        exit: Math.round(-saidas / 1000 * 10) / 10,
      });
    }

    // Vendas - últimos 6 meses
    const vendasData = [];
    for (let i = 5; i >= 0; i--) {
      const mesDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mesEnd = new Date(
        mesDate.getFullYear(),
        mesDate.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      const vendas = await prisma.vendas.findMany({
        where: {
          DataVenda: { gte: mesDate, lte: mesEnd },
          Ativo: true,
        },
      });

      const totalVendas = vendas.reduce(
        (sum, v) => sum + Number(v.Total || 0),
        0
      );

      const monthNames = [
        "jan",
        "fev",
        "mar",
        "abr",
        "mai",
        "jun",
        "jul",
        "ago",
        "set",
        "out",
        "nov",
        "dez",
      ];
      vendasData.push({
        name: `${monthNames[mesDate.getMonth()]} ${mesDate.getFullYear()}`,
        real: Math.round(totalVendas / 1000 * 10) / 10,
        target: 0,
      });
    }

    return {
      success: true,
      data: {
        totalReceberHoje,
        totalPagarHoje,
        recebimentos: {
          realizado: recebimentosRealizados,
          falta: recebimentosFalta,
          previsto: recebimentosPrevisto,
          percentual: Math.round(recebimentosPercentual * 10) / 10,
        },
        pagamentos: {
          realizado: pagamentosRealizados,
          falta: pagamentosFalta,
          previsto: pagamentosPrevisto,
          percentual: Math.round(pagamentosPercentual * 10) / 10,
        },
        fluxoData,
        vendasData,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return {
      success: false,
      data: {
        totalReceberHoje: 0,
        totalPagarHoje: 0,
        recebimentos: { realizado: 0, falta: 0, previsto: 0, percentual: 0 },
        pagamentos: { realizado: 0, falta: 0, previsto: 0, percentual: 0 },
        fluxoData: [],
        vendasData: [],
      },
    };
  }
}
