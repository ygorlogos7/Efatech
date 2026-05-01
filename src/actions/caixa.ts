"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Função auxiliar para converter Decimal do Prisma para Number antes de enviar para o cliente
function serializeCaixa(caixa: any) {
  if (!caixa) return null;
  return {
    ...caixa,
    ValorAbertura: Number(caixa.ValorAbertura),
    ValorFechamento: caixa.ValorFechamento ? Number(caixa.ValorFechamento) : null,
  };
}

export async function getCaixaAberto() {
  try {
    const caixa = await prisma.caixaSessao.findFirst({
      where: { Status: "Aberto" },
      orderBy: { DataAbertura: "desc" },
    });

    return { success: true, data: serializeCaixa(caixa) };
  } catch (error) {
    console.error("Erro ao verificar caixa:", error);
    return { success: false, error: "Falha ao verificar status do caixa." };
  }
}

export async function abrirCaixa(formData: FormData) {
  console.log(">>> [CAIXA] INICIANDO PROCESSO DE ABERTURA NO SERVIDOR...");
  try {
    const rawValor = formData.get("valorAbertura");
    const valorAbertura = Number(rawValor);
    const funcionarioId = formData.get("funcionarioId") ? Number(formData.get("funcionarioId")) : null;
    const gerarRecebimento = formData.get("gerarRecebimento") === "true";
    
    const observacoes = (formData.get("observacoes") as string) || "Abertura manual";

    if (isNaN(valorAbertura)) {
      return { success: false, error: "Valor inválido." };
    }

    // 1. Criar a sessão do caixa
    const novoCaixa = await prisma.caixaSessao.create({
      data: {
        ValorAbertura: valorAbertura,
        Observacoes: observacoes,
        Status: "Aberto",
        DataAbertura: new Date(),
        UsuarioId: funcionarioId,
      },
    });

    // 2. Se solicitado, gerar lançamento financeiro
    if (gerarRecebimento && valorAbertura > 0) {
      const descricao = formData.get("descricao") as string || "Abertura de caixa";
      const formaPgtoId = formData.get("formaPgtoId") ? Number(formData.get("formaPgtoId")) : null;
      const planoContaId = formData.get("planoContaId") ? Number(formData.get("planoContaId")) : null;
      const vencimento = formData.get("vencimento") ? new Date(formData.get("vencimento") as string) : new Date();

      await prisma.contaReceber.create({
        data: {
          Descricao: descricao,
          Valor: valorAbertura,
          Vencimento: vencimento,
          Recebimento: new Date(), // Considerado como recebido no momento da abertura
          FormaPgtoId: formaPgtoId,
          PlanoContaId: planoContaId,
          Observacoes: `Gerado automaticamente na abertura do caixa #${novoCaixa.Id}`,
          SituacaoId: 1, // Exemplo: 1 para 'Liquidado' ou similar se existir
        }
      });
    }

    revalidatePath("/vendas/balcao");
    revalidatePath("/pdv/balcao");
    revalidatePath("/financeiro/fluxo-caixa");

    return { success: true, data: serializeCaixa(novoCaixa) };
  } catch (error: any) {
    console.error(">>> [CAIXA] ERRO FATAL AO ABRIR CAIXA:", error);
    return { success: false, error: `Erro técnico: ${error.message}` };
  }
}

export async function fecharCaixa(id: number, valorFechamento: number) {
  try {
    const caixa = await prisma.caixaSessao.update({
      where: { Id: id },
      data: {
        Status: "Fechado",
        DataFechamento: new Date(),
        ValorFechamento: valorFechamento,
      },
    });

    revalidatePath("/vendas/balcao");
    return { success: true, data: serializeCaixa(caixa) };
  } catch (error) {
    console.error("Erro ao fechar caixa:", error);
    return { success: false, error: "Falha ao fechar caixa." };
  }
}

export async function getCaixaSessoes(filters?: { atendenteId?: number, dataInicio?: string, dataFim?: string, situacao?: string }) {
  try {
    const where: any = {};

    if (filters?.atendenteId) {
      where.UsuarioId = filters.atendenteId;
    }

    if (filters?.situacao && filters.situacao !== "Todos") {
      where.Status = filters.situacao;
    }

    if (filters?.dataInicio || filters?.dataFim) {
      where.DataAbertura = {};
      if (filters.dataInicio) {
        where.DataAbertura.gte = new Date(`${filters.dataInicio}T00:00:00`);
      }
      if (filters.dataFim) {
        where.DataAbertura.lte = new Date(`${filters.dataFim}T23:59:59`);
      }
    }

    const sessions = await prisma.caixaSessao.findMany({
      where,
      orderBy: { DataAbertura: "desc" },
      take: 50,
    });

    // Como não há relação formal no Prisma (usuário ID direto), buscamos os usuários manually
    const userIds = [...new Set(sessions.map(s => s.UsuarioId).filter(Boolean))];
    const users = await prisma.funcionario.findMany({
      where: { Id: { in: userIds as number[] } }
    });

    const data = await Promise.all(sessions.map(async s => {
      const user = users.find(u => u.Id === s.UsuarioId);
      
      // Calcular saldo dinâmico da sessão com fallback para datas (caso o ID de sessão não esteja preenchido)
      const dataFim = s.DataFechamento || new Date();
      
      const vendasSessao = await prisma.vendas.findMany({
        where: { 
          OR: [
            { CaixaSessaoId: s.Id },
            { 
              AND: [
                { CaixaSessaoId: null },
                { CreatedAt: { gte: s.DataAbertura as Date, lte: dataFim } }
              ]
            }
          ],
          Ativo: true 
        }
      });

      const osSessao = await prisma.ordensServico.findMany({
        where: { 
          OR: [
            { CaixaSessaoId: s.Id },
            { 
              AND: [
                { CaixaSessaoId: null },
                { CreatedAt: { gte: s.DataAbertura as Date, lte: dataFim } }
              ]
            }
          ],
          Ativo: false 
        }
      });

      const totalVendas = vendasSessao.reduce((acc, curr) => acc + Number(curr.Total), 0);
      const totalOS = osSessao.reduce((acc, curr) => acc + Number(curr.Total), 0);
      const saldoAtual = Number(s.ValorAbertura) + totalVendas + totalOS;

      return {
        ...s,
        FuncionarioNome: user?.Nome || "Sistema",
        ValorAbertura: Number(s.ValorAbertura),
        ValorFechamento: s.ValorFechamento ? Number(s.ValorFechamento) : null,
        Saldo: saldoAtual,
      };
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao buscar histórico de caixas:", error);
    return { success: false, error: "Falha ao buscar histórico." };
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

    // Buscar Vendas desta sessão com fallback
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

    // Buscar O.S. desta sessão com fallback
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

    // Agrupar tudo por forma de pagamento
    const resumoFinal: any[] = [];
    const consolidado: Record<string, number> = {};

    vendas.forEach(v => {
      const forma = v.FormaPagamento?.Nome || "Outros";
      consolidado[forma] = (consolidado[forma] || 0) + Number(v.Total);
    });

    os.forEach(o => {
      const forma = o.FormaPagamento?.Nome || "Outros";
      consolidado[forma] = (consolidado[forma] || 0) + Number(o.Total);
    });

    for (const [forma, total] of Object.entries(consolidado)) {
      resumoFinal.push({
        Forma: forma,
        Recebido: total,
        AReceber: 0,
        Total: total
      });
    }

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
        totaisGerais: {
            SaldoReal: Number(session.ValorAbertura) + resumoFinal.reduce((acc, curr) => acc + curr.Total, 0)
        }
      } 
    };
  } catch (error) {
    console.error("Erro ao buscar detalhes do caixa:", error);
    return { success: false, error: "Falha ao processar detalhes." };
  }
}
export async function getCaixaPrintData(id: number, type: 'vendas' | 'os' | 'completo') {
  try {
    const session = await prisma.caixaSessao.findUnique({ where: { Id: id } });
    if (!session) return { success: false, error: "Sessão não encontrada." };

    const dataAbertura = session.DataAbertura || new Date();
    const dataFechamento = session.DataFechamento || new Date();

    let result: any = { 
      session: { 
        ...session, 
        ValorAbertura: Number(session.ValorAbertura),
        ValorFechamento: session.ValorFechamento ? Number(session.ValorFechamento) : null
      } 
    };

    // 1. Abertura (Tratamos como uma movimentação de entrada em Dinheiro)
    result.abertura = {
      Forma: "Dinheiro à Vista",
      Recebido: Number(session.ValorAbertura),
      AReceber: 0,
      Total: Number(session.ValorAbertura)
    };

    // 1.1 Sangrias (Contas a Pagar registradas no período)
    const sangrias = await prisma.contaPagar.findMany({
      where: {
        CreatedAt: { gte: dataAbertura, lte: dataFechamento }
      }
    });
    
    const consolidadoSangrias: any = {};
    sangrias.forEach(s => {
      const forma = "Dinheiro à Vista"; // Por padrão, sangria de caixa é dinheiro
      if (!consolidadoSangrias[forma]) consolidadoSangrias[forma] = { Forma: forma, Pago: 0, APagar: 0, Total: 0 };
      consolidadoSangrias[forma].Pago += Number(s.Valor);
      consolidadoSangrias[forma].Total += Number(s.Valor);
    });
    result.sangrias = Object.values(consolidadoSangrias);

    // 2. Vendas
    if (type === 'vendas' || type === 'completo') {
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
      result.vendasRaw = vendas.map(v => ({ ...v, Total: Number(v.Total) }));
      
      // Consolidar Vendas por Forma
      const consolidadoVendas: any = {};
      vendas.forEach(v => {
        const forma = v.FormaPagamento?.Nome || "Diversos";
        if (!consolidadoVendas[forma]) consolidadoVendas[forma] = { Forma: forma, Recebido: 0, AReceber: 0, Total: 0 };
        consolidadoVendas[forma].Recebido += Number(v.Total);
        consolidadoVendas[forma].Total += Number(v.Total);
      });
      result.vendas = Object.values(consolidadoVendas);
    } else {
      result.vendas = [];
    }

    // 3. Ordens de Serviço
    if (type === 'os' || type === 'completo') {
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
          Ativo: false // Apenas as Finalizadas entram no caixa
        },
        include: { FormaPagamento: true }
      });
      result.osRaw = os.map(o => ({ ...o, Total: Number(o.Total) }));

      // Consolidar OS por Forma
      const consolidadoOS: any = {};
      os.forEach(o => {
        const forma = o.FormaPagamento?.Nome || "Não informado";
        if (!consolidadoOS[forma]) consolidadoOS[forma] = { Forma: forma, Recebido: 0, AReceber: 0, Total: 0 };
        consolidadoOS[forma].Recebido += Number(o.Total);
        consolidadoOS[forma].Total += Number(o.Total);
      });
      result.os = Object.values(consolidadoOS);
    } else {
      result.os = [];
    }

    // 4. Formas de Pagamento (Consolidado Final)
    const formasFinal: any = {};
    const addValues = (arr: any[]) => {
      arr.forEach(item => {
        if (!formasFinal[item.Forma]) formasFinal[item.Forma] = { Nome: item.Forma, NaoRecebido: 0, Recebido: 0, Total: 0 };
        formasFinal[item.Forma].Recebido += item.Recebido;
        formasFinal[item.Forma].NaoRecebido += item.AReceber;
        formasFinal[item.Forma].Total += item.Total;
      });
    };

    // Agregar da Abertura, Vendas e OS
    if (type === 'completo') {
       addValues([result.abertura]);
    }
    addValues(result.vendas);
    addValues(result.os);

    result.consolidadoGeral = Object.values(formasFinal);
    
    // Saldo Real: Entradas - Saídas
    const totalEntradas = result.consolidadoGeral.reduce((acc: number, curr: any) => acc + curr.Recebido, 0);
    const totalSaidas = result.sangrias.reduce((acc: number, curr: any) => acc + curr.Pago, 0);
    result.saldoReal = totalEntradas - totalSaidas;

    return { success: true, data: result };
  } catch (error) {
    console.error("Erro ao preparar dados de impressão:", error);
    return { success: false, error: "Falha ao preparar relatório." };
  }
}
