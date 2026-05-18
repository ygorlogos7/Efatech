/** Mesmo texto que `SANGRIA_FORMA_RELATORIO` em `caixaSangria.ts` (linha oculta no consolidado exibido). */
export const RETIRADAS_FORMA_CONSOLIDADO = "Retiradas de caixa";

/** Nome único no consolidado para abertura, vendas e suprimentos em espécie. */
export const FORMA_DINHEIRO_CONSOLIDADO = "Dinheiro";

export type LinhaFormaConsolidada = {
  Nome: string;
  NaoRecebido?: number;
  Recebido: number;
  Pago: number;
  Total: number;
};

export function isFormaDinheiro(nome: string | undefined | null): boolean {
  const n = (nome || "").trim();
  if (!n || n === RETIRADAS_FORMA_CONSOLIDADO) return false;
  return /dinheiro/i.test(n);
}

/** Agrupa "DINHEIRO", "Dinheiro à Vista", etc. na mesma linha do relatório. */
export function normalizarNomeFormaConsolidado(nome: string | undefined | null): string {
  const n = (nome || "Diversos").trim();
  if (n === RETIRADAS_FORMA_CONSOLIDADO) return RETIRADAS_FORMA_CONSOLIDADO;
  if (isFormaDinheiro(n)) return FORMA_DINHEIRO_CONSOLIDADO;
  return n;
}

/** Saldo líquido da linha: entradas − saídas (sangria entra em Pago na linha Dinheiro). */
export function saldoLiquidoLinha(row: { Recebido?: number; Pago?: number }): number {
  return Number(row.Recebido ?? 0) - Number(row.Pago ?? 0);
}

export function totalEntradasDinheiroLinhas(
  rows: { Nome: string; Recebido?: number }[]
): number {
  return rows
    .filter((r) => r.Nome !== RETIRADAS_FORMA_CONSOLIDADO)
    .filter((r) => isFormaDinheiro(r.Nome))
    .reduce((acc, r) => acc + Number(r.Recebido ?? 0), 0);
}

/** Valor absoluto para exibição (coluna sangria sempre positiva). */
export function valorSangriaExibicao(valor: unknown): number {
  return Math.abs(Number(valor ?? 0));
}

/**
 * Desconta o total de sangrias na linha Dinheiro e recalcula Total de cada forma.
 * Sangria não vira linha separada no consolidado exibido.
 */
export function aplicarSangriaNoConsolidado(
  formas: Record<string, LinhaFormaConsolidada>,
  totalSangrias: number
): void {
  const sangria = valorSangriaExibicao(totalSangrias);
  if (sangria > 0) {
    if (!formas[FORMA_DINHEIRO_CONSOLIDADO]) {
      formas[FORMA_DINHEIRO_CONSOLIDADO] = {
        Nome: FORMA_DINHEIRO_CONSOLIDADO,
        NaoRecebido: 0,
        Recebido: 0,
        Pago: 0,
        Total: 0,
      };
    }
    formas[FORMA_DINHEIRO_CONSOLIDADO].Pago += sangria;
  }
  for (const row of Object.values(formas)) {
    if (row.Nome === RETIRADAS_FORMA_CONSOLIDADO) continue;
    row.Total = saldoLiquidoLinha(row);
  }
}
