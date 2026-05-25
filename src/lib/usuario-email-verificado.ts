import { prisma } from "@/lib/prisma";

export type UsuarioAuthStatus = {
  exists: boolean;
  verified: boolean;
  blocked: boolean;
};

/** Status de conta para login/cadastro (SQL raw — compativel com schema em migracao). */
export async function getUsuarioAuthStatus(
  email: string,
): Promise<UsuarioAuthStatus> {
  try {
    const rows = await prisma.$queryRaw<
      { EmailVerificado: boolean; Bloqueado: boolean }[]
    >`
      SELECT "EmailVerificado", COALESCE("Bloqueado", false) AS "Bloqueado"
      FROM "Usuarios"
      WHERE LOWER("Email") = LOWER(${email})
      LIMIT 1
    `;

    if (!rows.length) {
      return { exists: false, verified: false, blocked: false };
    }

    return {
      exists: true,
      verified: Boolean(rows[0].EmailVerificado),
      blocked: Boolean(rows[0].Bloqueado),
    };
  } catch {
    const rows = await prisma.$queryRaw<{ EmailVerificado: boolean }[]>`
      SELECT "EmailVerificado"
      FROM "Usuarios"
      WHERE LOWER("Email") = LOWER(${email})
      LIMIT 1
    `;

    if (!rows.length) {
      return { exists: false, verified: false, blocked: false };
    }

    return {
      exists: true,
      verified: Boolean(rows[0].EmailVerificado),
      blocked: false,
    };
  }
}

/** @deprecated Use getUsuarioAuthStatus */
export async function getUsuarioEmailStatus(
  email: string,
): Promise<{ exists: boolean; verified: boolean }> {
  const s = await getUsuarioAuthStatus(email);
  return { exists: s.exists, verified: s.verified };
}

export async function markUsuarioEmailVerified(email: string): Promise<boolean> {
  const count = await prisma.$executeRaw`
    UPDATE "Usuarios"
    SET "EmailVerificado" = true, "EmailVerificadoEm" = NOW()
    WHERE LOWER("Email") = LOWER(${email})
  `;
  return Number(count) > 0;
}

export async function setUsuarioBloqueado(
  email: string,
  bloqueado: boolean,
): Promise<boolean> {
  try {
    const count = await prisma.$executeRaw`
      UPDATE "Usuarios"
      SET "Bloqueado" = ${bloqueado}
      WHERE LOWER("Email") = LOWER(${email})
    `;
    return Number(count) > 0;
  } catch {
    return false;
  }
}
