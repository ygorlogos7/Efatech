import { prisma } from "@/lib/prisma";

/** Rótulo da sangria no consolidado / impressão (não confundir com cadastro de FormaPagamento). */
export const SANGRIA_FORMA_RELATORIO = "Retiradas de caixa";

/** Mesma regra do antigo `where`, via SQL — funciona mesmo se o Prisma Client ainda não tiver `CaixaSessaoId`. */
function sangriaSqlWhere(
  sessionId: number,
  dataAbertura: Date,
  dataFechamento: Date
) {
  const needle = `%Sangria vinculada ao caixa #${sessionId}%`;
  const obsCaixa = `%caixa #${sessionId}%`;
  return { needle, obsCaixa, sessionId, dataAbertura, dataFechamento };
}

/** Lista `ContaPagar` consideradas sangria desta sessão (vínculo ou legado por texto + datas). */
export async function fetchSangriasPorCaixaSessao(
  sessionId: number,
  dataAbertura: Date,
  dataFechamento: Date
): Promise<Record<string, unknown>[]> {
  const { needle, obsCaixa } = sangriaSqlWhere(sessionId, dataAbertura, dataFechamento);
  return prisma.$queryRaw`
    SELECT * FROM "ContaPagar"
    WHERE (
      "CaixaSessaoId" = ${sessionId}
      OR (
        "CaixaSessaoId" IS NULL
        AND "CreatedAt" >= ${dataAbertura}
        AND "CreatedAt" <= ${dataFechamento}
        AND (
          "Observacoes" ILIKE ${needle}
          OR (
            LOWER("Descricao") LIKE '%sangria%'
            AND "Observacoes" ILIKE ${obsCaixa}
          )
        )
      )
    )
    ORDER BY "CreatedAt" ASC
  `;
}

export async function sumValorSangriasPorCaixaSessao(
  sessionId: number,
  dataAbertura: Date,
  dataFechamento: Date
): Promise<number> {
  const { needle, obsCaixa } = sangriaSqlWhere(sessionId, dataAbertura, dataFechamento);
  const rows = await prisma.$queryRaw<[{ sum: unknown }]>`
    SELECT COALESCE(SUM("Valor"), 0) AS sum FROM "ContaPagar"
    WHERE (
      "CaixaSessaoId" = ${sessionId}
      OR (
        "CaixaSessaoId" IS NULL
        AND "CreatedAt" >= ${dataAbertura}
        AND "CreatedAt" <= ${dataFechamento}
        AND (
          "Observacoes" ILIKE ${needle}
          OR (
            LOWER("Descricao") LIKE '%sangria%'
            AND "Observacoes" ILIKE ${obsCaixa}
          )
        )
      )
    )
  `;
  return Number(rows[0]?.sum ?? 0);
}

/** No fechamento: preenche `CaixaSessaoId` em sangrias legadas que só tinham observação. */
export async function vincularSangriasLegadasAoCaixa(
  caixaSessaoId: number,
  dataAbertura: Date,
  dataFechamento: Date
): Promise<void> {
  const pattern = `%Sangria vinculada ao caixa #${caixaSessaoId}%`;
  await prisma.$executeRaw`
    UPDATE "ContaPagar"
    SET "CaixaSessaoId" = ${caixaSessaoId}
    WHERE "CaixaSessaoId" IS NULL
      AND "CreatedAt" >= ${dataAbertura}
      AND "CreatedAt" <= ${dataFechamento}
      AND "Observacoes" ILIKE ${pattern}
  `;
}

export async function setContaPagarCaixaSessaoId(contaPagarId: number, caixaSessaoId: number) {
  await prisma.$executeRaw`
    UPDATE "ContaPagar" SET "CaixaSessaoId" = ${caixaSessaoId} WHERE "Id" = ${contaPagarId}
  `;
}
