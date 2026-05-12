/** Mesmo texto que `SANGRIA_FORMA_RELATORIO` em `caixaSangria.ts` (linha oculta no consolidado exibido). */
export const RETIRADAS_FORMA_CONSOLIDADO = "Retiradas de caixa";

/**
 * Índice da linha de "dinheiro" onde exibir o total de sangria no resumo por forma.
 * Sangria no sistema sai do físico; prioriza abertura em "Dinheiro à Vista".
 */
export function indiceLinhaParaAlocarSangria(rows: { Nome: string }[]): number {
  if (!rows?.length) return -1;
  let i = rows.findIndex((r) => r.Nome === "Dinheiro à Vista");
  if (i >= 0) return i;
  i = rows.findIndex((r) => r.Nome?.toUpperCase() === "DINHEIRO");
  if (i >= 0) return i;
  i = rows.findIndex((r) => (r.Nome || "").toLowerCase().includes("dinheiro"));
  if (i >= 0) return i;
  return 0;
}
