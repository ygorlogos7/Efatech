"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

// Função auxiliar para converter Decimal do Prisma para Number antes de enviar para o cliente
function serializeCaixa(caixa: any) {
  if (!caixa) return null;
  return {
    ...caixa,
    ValorAbertura: Number(caixa.ValorAbertura),
    ValorFechamento: caixa.ValorFechamento ? Number(caixa.ValorFechamento) : null,
    DataAbertura: caixa.DataAbertura instanceof Date ? caixa.DataAbertura.toISOString() : caixa.DataAbertura,
    DataFechamento: caixa.DataFechamento instanceof Date ? caixa.DataFechamento.toISOString() : caixa.DataFechamento,
  };
}

export async function buscarCaixaAtivo() {
  noStore();
  try {
    console.log(">>> [CAIXA] Buscando caixa ativo...");
    
    const caixa = await prisma.caixaSessao.findFirst({
      where: { 
        Status: {
          equals: "Aberto",
          mode: "insensitive"
        } 
      },
      orderBy: { DataAbertura: "desc" },
    });

    if (!caixa) {
      console.log(">>> [CAIXA] Nenhum caixa aberto encontrado.");
      return { success: true, data: null };
    }

    console.log(">>> [CAIXA] Caixa encontrado! ID:", caixa.Id, "Status:", caixa.Status);

    return { 
      success: true, 
      data: serializeCaixa(caixa)
    };
  } catch (error: any) {
    console.error(">>> [CAIXA] ERRO AO BUSCAR CAIXA:", error);
    return { success: false, error: `Erro no banco de dados: ${error.message}` };
  }
}

// Mantendo o nome antigo apenas para não quebrar outros lugares temporariamente
export async function getCaixaAberto() {
  return buscarCaixaAtivo();
}

export async function abrirCaixa(formData: FormData) {
  console.log(">>> [CAIXA] INICIANDO ABERTURA NO SERVIDOR...");
  try {
    const rawValor = formData.get("valorAbertura");
    const valorAbertura = Number(rawValor);
    const funcionarioId = formData.get("funcionarioId") ? Number(formData.get("funcionarioId")) : null;
    const gerarRecebimento = formData.get("gerarRecebimento") === "true";
    const observacoes = (formData.get("observacoes") as string) || "Abertura manual";

    console.log(">>> [CAIXA] Parâmetros:", { valorAbertura, funcionarioId, gerarRecebimento });

    if (isNaN(valorAbertura)) {
      return { success: false, error: "Valor de abertura inválido." };
    }

    const result = await prisma.$transaction(async (tx) => {
      console.log(">>> [CAIXA] Criando registro de sessão...");
      const novoCaixa = await tx.caixaSessao.create({
        data: {
          ValorAbertura: valorAbertura,
          Observacoes: observacoes,
          Status: "Aberto",
          DataAbertura: new Date(),
          UsuarioId: funcionarioId,
        },
      });

      if (gerarRecebimento && valorAbertura > 0) {
        console.log(">>> [CAIXA] Gerando lançamento financeiro...");
        await tx.contaReceber.create({
          data: {
            Descricao: "Abertura de caixa",
            Valor: valorAbertura,
            Vencimento: new Date(),
            Recebimento: new Date(),
            Status: "Recebido",
            Observacoes: `Gerado na abertura do caixa #${novoCaixa.Id}`,
          }
        });
      }
      return novoCaixa;
    });

    console.log(">>> [CAIXA] Revalidando caminhos...");
    revalidatePath("/vendas");
    revalidatePath("/financeiro");
    
    console.log(">>> [CAIXA] SUCESSO!");
    return { success: true, data: serializeCaixa(result) };
  } catch (error: any) {
    console.error(">>> [CAIXA] ERRO CRÍTICO NA ABERTURA:", error);
    return { success: false, error: `Falha na operação: ${error.message}` };
  }
}

export async function fecharCaixa(id: number, valorFechamento: number) {
  try {
    // 1. Buscar a sessão para saber as datas
    const session = await prisma.caixaSessao.findUnique({ where: { Id: id } });
    if (!session) return { success: false, error: "Sessão não encontrada." };

    const dataAbertura = session.DataAbertura || new Date();
    const dataFechamento = new Date();

    // 2. Vincular movimentos que aconteceram no período e estão sem ID de sessão
    // Isso garante que mesmo que o vínculo tenha falhado na criação, ele seja corrigido no fechamento.
    
    // Vendas
    await prisma.vendas.updateMany({
      where: {
        CaixaSessaoId: null,
        CreatedAt: { gte: dataAbertura, lte: dataFechamento },
        Ativo: true
      },
      data: { CaixaSessaoId: id }
    });

    // O.S. (Apenas as finalizadas/encerradas entram no caixa)
    await prisma.ordensServico.updateMany({
      where: {
        CaixaSessaoId: null,
        CreatedAt: { gte: dataAbertura, lte: dataFechamento },
        Ativo: false
      },
      data: { CaixaSessaoId: id }
    });

    // Contas a Pagar (Sangrias) - Se tivermos campo CaixaSessaoId ou similar no futuro.
    // Por enquanto usamos a data como critério de busca, mas vamos registrar o fechamento.

    // 3. Atualizar a sessão
    const caixa = await prisma.caixaSessao.update({
      where: { Id: id },
      data: {
        Status: "Fechado",
        DataFechamento: dataFechamento,
        ValorFechamento: valorFechamento,
      },
    });

    revalidatePath("/vendas/balcao");
    revalidatePath("/financeiro/opcoes/caixas");
    return { success: true, data: serializeCaixa(caixa) };
  } catch (error) {
    console.error("Erro ao fechar caixa:", error);
    return { success: false, error: "Falha ao fechar caixa." };
  }
}


export async function getCaixaSessoes(filters?: { usuarioId?: string | number, dataInicio?: string, dataFim?: string, status?: string }) {
  noStore();
  console.log("[DEBUG] getCaixaSessoes called with:", JSON.stringify(filters));
  try {
    const where: any = {};

    if (filters?.usuarioId && filters.usuarioId !== "" && filters.usuarioId !== "0") {
      where.UsuarioId = Number(filters.usuarioId);
    }

    if (filters?.status && filters.status !== "" && filters.status !== "Todos") {
      where.Status = filters.status;
    }

    if (filters?.dataInicio || filters?.dataFim) {
      where.DataAbertura = {};
      if (filters.dataInicio) {
        const dStart = new Date(`${filters.dataInicio}T00:00:00`);
        if (!isNaN(dStart.getTime())) where.DataAbertura.gte = dStart;
      }
      if (filters.dataFim) {
        const dEnd = new Date(`${filters.dataFim}T23:59:59`);
        if (!isNaN(dEnd.getTime())) where.DataAbertura.lte = dEnd;
      }
    }

    const sessions = await prisma.caixaSessao.findMany({
      where,
      orderBy: { DataAbertura: "desc" },
      take: 50,
    });

    console.log(`[DEBUG] Found ${sessions.length} sessions`);

    // Busca rápida de funcionários
    const userIds = [...new Set(sessions.map(s => s.UsuarioId).filter(Boolean))] as number[];
    const users = userIds.length > 0 ? await prisma.funcionario.findMany({
      where: { Id: { in: userIds } },
      select: { Id: true, Nome: true }
    }) : [];

    const data = await Promise.all(sessions.map(async s => {
      try {
        const user = users.find(u => u.Id === s.UsuarioId);
        
        // Data limite para busca de movimentos
        const dataAbertura = s.DataAbertura || new Date(0);
        const dataFim = s.DataFechamento || new Date();
        const startOfDay = new Date(dataAbertura);
        startOfDay.setHours(0, 0, 0, 0);
        
        // Busca paralela para agilizar
        const [vendas, oss, sangrias, suprimentos] = await Promise.all([
          prisma.vendas.aggregate({
            where: { 
              OR: [
                { CaixaSessaoId: s.Id }, 
                { AND: [{ CaixaSessaoId: null }, { OR: [{ CreatedAt: { gte: startOfDay, lte: dataFim } }, { DataVenda: { gte: startOfDay, lte: dataFim } }] }] }
              ],
            },
            _sum: { Total: true }
          }),
          prisma.ordensServico.aggregate({
            where: { 
              OR: [
                { CaixaSessaoId: s.Id }, 
                { AND: [{ CaixaSessaoId: null }, { OR: [{ CreatedAt: { gte: startOfDay, lte: dataFim } }, { DataFechamento: { gte: startOfDay, lte: dataFim } }] }] }
              ],
              Ativo: false 
            },
            _sum: { Total: true }
          }),
          prisma.contaPagar.aggregate({
            where: { CreatedAt: { gte: startOfDay, lte: dataFim } },
            _sum: { Valor: true }
          }),
          prisma.contaReceber.aggregate({
            where: { 
              CreatedAt: { gte: startOfDay, lte: dataFim },
              NOT: { Descricao: { contains: "Abertura de caixa" } }
            },
            _sum: { Valor: true }
          })
        ]);

        const totalEntradas = Number(vendas._sum.Total || 0) + Number(oss._sum.Total || 0) + Number(suprimentos._sum.Valor || 0);
        const totalSaidas = Number(sangrias._sum.Valor || 0);
        const saldoAtual = Number(s.ValorAbertura) + totalEntradas - totalSaidas;

        return {
          Id: s.Id,
          UsuarioId: s.UsuarioId,
          FuncionarioNome: user?.Nome || "Sistema",
          DataAbertura: s.DataAbertura?.toISOString() || null,
          DataFechamento: s.DataFechamento?.toISOString() || null,
          ValorAbertura: Number(s.ValorAbertura),
          ValorFechamento: s.ValorFechamento ? Number(s.ValorFechamento) : null,
          Status: s.Status,
          Observacoes: s.Observacoes,
          Saldo: saldoAtual,
        };
      } catch (err: any) {
        console.error(`[DEBUG] Error session ${s.Id}:`, err.message);
        return {
          Id: s.Id,
          FuncionarioNome: `ERRO: ${err.message}`, // Exibe o erro real na tela
          DataAbertura: s.DataAbertura?.toISOString() || null,
          DataFechamento: s.DataFechamento?.toISOString() || null,
          ValorAbertura: Number(s.ValorAbertura),
          ValorFechamento: s.ValorFechamento ? Number(s.ValorFechamento) : null,
          Status: s.Status,
          Saldo: 0
        };
      }
    }));

    return { success: true, data };
  } catch (error: any) {
    console.error("[DEBUG] FATAL getCaixaSessoes:", error.message);
    return { success: false, error: "Erro ao carregar dados do banco." };
  }
}

export async function getCaixaSessaoDetalhes(id: number) {
  try {
    const session = await prisma.caixaSessao.findUnique({
      where: { Id: id },
    });

    if (!session) return { success: false, error: "Sessão não encontrada." };

    const funcionario = session.UsuarioId 
      ? await prisma.funcionario.findUnique({ where: { Id: session.UsuarioId } })
      : null;

    const dataAbertura = session.DataAbertura || new Date();
    const dataFechamento = session.DataFechamento || new Date();

    // 1. Buscar Vendas
    const vendas = await prisma.vendas.findMany({
      where: { 
        OR: [
          { CaixaSessaoId: id },
          { 
            AND: [
              { CaixaSessaoId: null },
              { CreatedAt: { gte: dataAbertura, lte: dataFechamento } }
            ]
          }
        ],
        Ativo: true 
      },
      include: { FormaPagamento: true }
    });

    // 2. Buscar O.S.
    const os = await prisma.ordensServico.findMany({
      where: { 
        OR: [
          { CaixaSessaoId: id },
          { 
            AND: [
              { CaixaSessaoId: null },
              { CreatedAt: { gte: dataAbertura, lte: dataFechamento } }
            ]
          }
        ],
        Ativo: false 
      },
      include: { FormaPagamento: true }
    });

    // 3. Buscar Sangrias (Contas a Pagar no período)
    const sangrias = await prisma.contaPagar.findMany({
      where: {
        CreatedAt: { gte: dataAbertura, lte: dataFechamento }
      }
    });

    // 4. Buscar Suprimentos/Recebimentos (Contas a Receber no período, exceto as automáticas de abertura para não duplicar)
    const suprimentos = await prisma.contaReceber.findMany({
      where: {
        CreatedAt: { gte: dataAbertura, lte: dataFechamento },
        NOT: { Descricao: { contains: "Abertura de caixa" } }
      }
    });

    // Agrupar tudo por forma de pagamento para o resumo
    const consolidado: Record<string, { Recebido: number, Pago: number }> = {};

    vendas.forEach(v => {
      const forma = v.FormaPagamento?.Nome || "Outros";
      if (!consolidado[forma]) consolidado[forma] = { Recebido: 0, Pago: 0 };
      consolidado[forma].Recebido += Number(v.Total);
    });

    os.forEach(o => {
      const forma = o.FormaPagamento?.Nome || "Outros";
      if (!consolidado[forma]) consolidado[forma] = { Recebido: 0, Pago: 0 };
      consolidado[forma].Recebido += Number(o.Total);
    });

    suprimentos.forEach(s => {
      const forma = "Dinheiro à Vista"; // Simplificação ou buscar forma real se houver vínculo
      if (!consolidado[forma]) consolidado[forma] = { Recebido: 0, Pago: 0 };
      consolidado[forma].Recebido += Number(s.Valor);
    });

    sangrias.forEach(s => {
      const forma = "Dinheiro à Vista";
      if (!consolidado[forma]) consolidado[forma] = { Recebido: 0, Pago: 0 };
      consolidado[forma].Pago += Number(s.Valor);
    });

    const resumoFinal = Object.entries(consolidado).map(([forma, valores]) => ({
      Forma: forma,
      Recebido: valores.Recebido,
      Pago: valores.Pago,
      Total: valores.Recebido - valores.Pago
    }));

    const totalEntradas = resumoFinal.reduce((acc, curr) => acc + curr.Recebido, 0) + Number(session.ValorAbertura);
    const totalSaidas = resumoFinal.reduce((acc, curr) => acc + curr.Pago, 0);

    return { 
      success: true, 
      data: {
        session: {
            ...session,
            ValorAbertura: Number(session.ValorAbertura),
            ValorFechamento: session.ValorFechamento ? Number(session.ValorFechamento) : null,
            FuncionarioNome: funcionario?.Nome || "Sistema",
        },
        vendas: resumoFinal,
        vendasRaw: [
          ...vendas.map(v => ({ ...v, Total: Number(v.Total), _type: 'VENDA' })),
          ...os.map(o => ({ ...o, Total: Number(o.Total), _type: 'OS' }))
        ],
        sangrias: sangrias.map(s => ({ ...s, Valor: Number(s.Valor) })),
        suprimentos: suprimentos.map(s => ({ ...s, Valor: Number(s.Valor) })),
        totaisGerais: {
            Entradas: totalEntradas,
            Saidas: totalSaidas,
            SaldoReal: totalEntradas - totalSaidas
        }
      } 
    };
  } catch (error) {
    console.error("Erro ao buscar detalhes do caixa:", error);
    return { success: false, error: "Falha ao processar detalhes." };
  }
}
export async function getCaixaPrintData(id: number, type: 'vendas' | 'os' | 'completo') {
  console.log(">>> [PRINT] Iniciando busca para ID:", id, "Tipo:", type);
  try {
    const session = await prisma.caixaSessao.findUnique({ where: { Id: id } });
    if (!session) {
      console.warn(">>> [PRINT] Sessão não encontrada para ID:", id);
      return { success: false, error: "Sessão não encontrada." };
    }

    console.log(">>> [PRINT] Sessão encontrada. Status:", session.Status);

    const dataAbertura = session.DataAbertura || new Date();
    const dataFechamento = session.DataFechamento || new Date();

    let result: any = { 
      session: { 
        ...session, 
        ValorAbertura: Number(session.ValorAbertura),
        ValorFechamento: session.ValorFechamento ? Number(session.ValorFechamento) : null
      } 
    };

    // 1. Abertura
    result.abertura = {
      Forma: "Dinheiro à Vista",
      Recebido: Number(session.ValorAbertura),
      AReceber: 0,
      Total: Number(session.ValorAbertura)
    };

    console.log(">>> [PRINT] Buscando Sangrias e Suprimentos...");
    const sangrias = await prisma.contaPagar.findMany({
      where: { CreatedAt: { gte: dataAbertura, lte: dataFechamento } }
    });
    const suprimentos = await prisma.contaReceber.findMany({
      where: { 
        CreatedAt: { gte: dataAbertura, lte: dataFechamento },
        NOT: { Descricao: { contains: "Abertura de caixa" } }
      }
    });
    
    result.sangrias = sangrias.map(s => ({ Forma: "Dinheiro à Vista", Pago: Number(s.Valor), Total: Number(s.Valor) }));
    result.suprimentos = suprimentos.map(s => ({ Forma: "Dinheiro à Vista", Recebido: Number(s.Valor), Total: Number(s.Valor) }));

    const startOfDay = new Date(dataAbertura);
    startOfDay.setHours(0, 0, 0, 0);

    // 2. Vendas
    if (type === 'vendas' || type === 'completo') {
      console.log(">>> [PRINT] Buscando Vendas...");
      const vendas = await prisma.vendas.findMany({
        where: { 
          OR: [
            { CaixaSessaoId: id },
            { 
              AND: [
                { CaixaSessaoId: null },
                { 
                  OR: [
                    { CreatedAt: { gte: startOfDay, lte: dataFechamento } },
                    { DataVenda: { gte: startOfDay, lte: dataFechamento } }
                  ]
                }
              ]
            }
          ],
        },
        include: { FormaPagamento: true }
      });
      
      const consolidadoVendas: any = {};
      vendas.forEach(v => {
        const forma = v.FormaPagamento?.Nome || "Diversos";
        if (!consolidadoVendas[forma]) consolidadoVendas[forma] = { Forma: forma, Recebido: 0, AReceber: 0, Total: 0 };
        consolidadoVendas[forma].Recebido += Number(v.Total);
        consolidadoVendas[forma].Total += Number(v.Total);
      });

      result.vendas = Object.values(consolidadoVendas);
      result.vendasRaw = vendas.map(v => ({ ...v, Total: Number(v.Total) }));
    } else {
      result.vendas = [];
      result.vendasRaw = [];
    }

    // 3. Ordens de Serviço
    if (type === 'os' || type === 'completo') {
      console.log(">>> [PRINT] Buscando O.S...");
      const os = await prisma.ordensServico.findMany({
        where: {
          OR: [
            { CaixaSessaoId: id },
            { 
              AND: [
                { CaixaSessaoId: null },
                { 
                  OR: [
                    { DataFechamento: { gte: startOfDay, lte: dataFechamento } },
                    { CreatedAt: { gte: startOfDay, lte: dataFechamento } }
                  ]
                }
              ]
            }
          ],
          Ativo: false 
        },
        include: { FormaPagamento: true }
      });

      const consolidadoOS: any = {};
      os.forEach(o => {
        const forma = o.FormaPagamento?.Nome || "Não informado";
        if (!consolidadoOS[forma]) consolidadoOS[forma] = { Forma: forma, Recebido: 0, AReceber: 0, Total: 0 };
        consolidadoOS[forma].Recebido += Number(o.Total);
        consolidadoOS[forma].Total += Number(o.Total);
      });
      result.os = Object.values(consolidadoOS);
      result.osRaw = os.map(o => ({ ...o, Total: Number(o.Total) }));
    } else {
      result.os = [];
      result.osRaw = [];
    }

    console.log(">>> [PRINT] Consolidando valores finais...");
    // 4. Formas de Pagamento (Consolidado Final)
    const formasFinal: any = {};
    const addValues = (arr: any[], mode: 'entrada' | 'saida') => {
      arr.forEach(item => {
        const nome = item.Forma || item.Nome || "Diversos";
        if (!formasFinal[nome]) formasFinal[nome] = { Nome: nome, NaoRecebido: 0, Recebido: 0, Pago: 0, Total: 0 };
        if (mode === 'entrada') {
           formasFinal[nome].Recebido += Number(item.Recebido || item.Total || 0);
           formasFinal[nome].Total += Number(item.Total || 0);
        } else {
           formasFinal[nome].Pago += Number(item.Pago || item.Total || 0);
           formasFinal[nome].Total -= Number(item.Total || 0);
        }
      });
    };

    addValues([result.abertura], 'entrada');
    addValues(result.vendas, 'entrada');
    addValues(result.os, 'entrada');
    addValues(result.suprimentos, 'entrada');
    addValues(result.sangrias, 'saida');

    result.consolidadoGeral = Object.values(formasFinal);
    
    // Saldo Real
    const totalEntradas = result.consolidadoGeral.reduce((acc: number, curr: any) => acc + curr.Recebido, 0);
    const totalSaidas = result.consolidadoGeral.reduce((acc: number, curr: any) => acc + curr.Pago, 0);
    result.saldoReal = totalEntradas - totalSaidas;

    console.log(">>> [PRINT] Serializando para retorno...");
    // SERIALIZAÇÃO FINAL PARA EVITAR ERROS NO CLIENT COMPONENT
    const serializedResult = {
      ...result,
      session: {
        ...result.session,
        DataAbertura: result.session.DataAbertura?.toISOString() || null,
        DataFechamento: result.session.DataFechamento?.toISOString() || null,
      },
      vendasRaw: result.vendasRaw?.map((v: any) => ({
        ...v,
        Total: Number(v.Total),
        DataVenda: v.DataVenda?.toISOString() || null,
        CreatedAt: v.CreatedAt?.toISOString() || null,
      })) || [],
      osRaw: result.osRaw?.map((o: any) => ({
        ...o,
        Total: Number(o.Total),
        DataFechamento: o.DataFechamento?.toISOString() || null,
        CreatedAt: o.CreatedAt?.toISOString() || null,
      })) || [],
      sangrias: result.sangrias?.map((s: any) => ({
        ...s,
        Pago: Number(s.Pago),
        Total: Number(s.Total),
        CreatedAt: s.CreatedAt?.toISOString() || s.CreatedAt,
      })) || [],
      suprimentos: result.suprimentos?.map((s: any) => ({
        ...s,
        Recebido: Number(s.Recebido),
        Total: Number(s.Total),
        CreatedAt: s.CreatedAt?.toISOString() || s.CreatedAt,
      })) || [],
    };

    console.log(">>> [PRINT] SUCESSO!");
    return { success: true, data: serializedResult };
  } catch (error: any) {
    console.error(">>> [PRINT] ERRO CRÍTICO NO SERVIDOR:", error);
    return { success: false, error: `Falha técnica: ${error.message}` };
  }
}

export async function getCaixaResumoSimples(id: number) {
  try {
    const details = await getCaixaSessaoDetalhes(id);
    if (!details.success) return details;

    const data = details.data;
    
    // Filtra apenas o que é dinheiro para ajudar na conferência física
    const dinheiroEntry = data.vendas.find((f: any) => f.Forma.toUpperCase() === "DINHEIRO" || f.Forma.toUpperCase().includes("DINHEIRO"));
    const totalEmDinheiro = (dinheiroEntry?.Recebido || 0) + (data.session.ValorAbertura || 0);
    const totalSangrias = data.sangrias.reduce((acc: number, curr: any) => acc + curr.Valor, 0);
    const totalSuprimentos = data.suprimentos.reduce((acc: number, curr: any) => acc + curr.Valor, 0);

    return {
      success: true,
      data: {
        saldoEsperado: data.totaisGerais.SaldoReal,
        saldoEmDinheiro: totalEmDinheiro + totalSuprimentos - totalSangrias, // O que deve ter na gaveta
        vendasCount: data.vendasRaw.filter((v: any) => v._type === 'VENDA').length,
        osCount: data.vendasRaw.filter((v: any) => v._type === 'OS').length,
        sangriasCount: data.sangrias.length,
        suprimentosCount: data.suprimentos.length,
        totalSangrias,
        totalSuprimentos
      }
    };
  } catch (error) {
    return { success: false, error: "Erro ao calcular resumo." };
  }
}

export async function lancarSangria(formData: FormData) {
  try {
    const valor = Number(formData.get("valor"));
    const descricao = formData.get("descricao") as string || "Sangria de caixa";
    const sessionId = formData.get("sessionId") ? Number(formData.get("sessionId")) : null;

    if (isNaN(valor) || valor <= 0) return { success: false, error: "Valor inválido." };

    await prisma.contaPagar.create({
      data: {
        Descricao: descricao,
        Valor: valor,
        Vencimento: new Date(),
        Pagamento: new Date(),
        SituacaoId: 1, // Liquidado
        PlanoContaId: 1, // Geral
        FormaPgtoId: 1,  // Dinheiro
        Observacoes: sessionId ? `Sangria vinculada ao caixa #${sessionId}` : "Sangria manual",
      }
    });

    revalidatePath("/financeiro/opcoes/caixas");
    revalidatePath("/financeiro/fluxo-caixa");
    
    return { success: true, message: "Sangria realizada com sucesso!" };
  } catch (error) {
    console.error("Erro ao lançar sangria:", error);
    return { success: false, error: "Falha técnica ao lançar sangria." };
  }
}

export async function lancarSuprimento(formData: FormData) {
  try {
    const valor = Number(formData.get("valor"));
    const descricao = formData.get("descricao") as string || "Suprimento de caixa";
    const sessionId = formData.get("sessionId") ? Number(formData.get("sessionId")) : null;

    if (isNaN(valor) || valor <= 0) return { success: false, error: "Valor inválido." };

    await prisma.contaReceber.create({
      data: {
        Descricao: descricao,
        Valor: valor,
        Vencimento: new Date(),
        Recebimento: new Date(),
        SituacaoId: 1, // Liquidado
        PlanoContaId: 1, // Geral
        FormaPgtoId: 1,  // Dinheiro
        Observacoes: sessionId ? `Suprimento vinculado ao caixa #${sessionId}` : "Suprimento manual",
      }
    });

    revalidatePath("/financeiro/opcoes/caixas");
    revalidatePath("/financeiro/fluxo-caixa");

    return { success: true, message: "Suprimento realizado com sucesso!" };
  } catch (error) {
    console.error("Erro ao lançar suprimento:", error);
    return { success: false, error: "Falha técnica ao lançar suprimento." };
  }
}
