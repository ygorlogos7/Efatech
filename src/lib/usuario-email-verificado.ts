import { prisma } from "@/lib/prisma";

/** Leitura/escrita de EmailVerificado via SQL — funciona mesmo se o client Prisma ainda não foi regenerado. */
export async function getUsuarioEmailStatus(
  email: string,
): Promise<{ exists: boolean; verified: boolean }> {
  const rows = await prisma.$queryRaw<{ EmailVerificado: boolean }[]>`
    SELECT "EmailVerificado"
    FROM "Usuarios"
    WHERE "Email" = ${email}
    LIMIT 1
  `;

  if (!rows.length) {
    return { exists: false, verified: false };
  }

  return { exists: true, verified: Boolean(rows[0].EmailVerificado) };
}

export async function markUsuarioEmailVerified(email: string): Promise<boolean> {
  const count = await prisma.$executeRaw`
    UPDATE "Usuarios"
    SET "EmailVerificado" = true, "EmailVerificadoEm" = NOW()
    WHERE "Email" = ${email}
  `;
  return Number(count) > 0;
}
