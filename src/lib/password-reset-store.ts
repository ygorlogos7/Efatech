import { prisma } from "@/lib/prisma";
import {
  generatePasswordResetPlainToken,
  hashPasswordResetToken,
  PASSWORD_RESET_EMAIL_COOLDOWN_MS,
  PASSWORD_RESET_TTL_MS,
} from "@/lib/password-reset-token";

export type IssuePasswordResetResult = {
  plainToken: string;
  expiresAt: Date;
  /** false quando ja existe token recente — nao reenvia e-mail. */
  shouldSendEmail: boolean;
};

/** Token pendente criado nos ultimos N minutos (evita varios e-mails seguidos). */
export async function hasRecentPasswordResetToken(
  usuarioId: number,
): Promise<boolean> {
  const cooldownSince = new Date(Date.now() - PASSWORD_RESET_EMAIL_COOLDOWN_MS);
  const rows = await prisma.$queryRaw<{ ok: number }[]>`
    SELECT 1 AS ok
    FROM "TokenResetSenha"
    WHERE "UsuarioId" = ${usuarioId}
      AND "UsadoEm" IS NULL
      AND "ExpiraEm" > NOW()
      AND "CriadoEm" > ${cooldownSince}
    LIMIT 1
  `;
  return rows.length > 0;
}

/** Invalida tokens pendentes e cria um novo (uso unico). SQL raw — nao depende do model no Prisma Client. */
export async function issuePasswordResetToken(
  usuarioId: number,
  ip?: string,
): Promise<IssuePasswordResetResult> {
  if (await hasRecentPasswordResetToken(usuarioId)) {
    return { plainToken: "", expiresAt: new Date(), shouldSendEmail: false };
  }
  const plainToken = generatePasswordResetPlainToken();
  const tokenHash = hashPasswordResetToken(plainToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  const ipValue = ip?.slice(0, 45) ?? null;

  await prisma.$executeRaw`
    UPDATE "TokenResetSenha"
    SET "UsadoEm" = NOW()
    WHERE "UsuarioId" = ${usuarioId} AND "UsadoEm" IS NULL
  `;

  await prisma.$executeRaw`
    INSERT INTO "TokenResetSenha" ("UsuarioId", "TokenHash", "ExpiraEm", "Ip")
    VALUES (${usuarioId}, ${tokenHash}, ${expiresAt}, ${ipValue})
  `;

  return { plainToken, expiresAt, shouldSendEmail: true };
}

export type RedeemPasswordResetResult =
  | { valid: false }
  | { valid: true; usuarioId: number; email: string };

/**
 * Consome o token (marca UsadoEm). Retorna invalido se expirado, ja usado ou inexistente.
 */
export async function redeemPasswordResetToken(
  plainToken: string,
): Promise<RedeemPasswordResetResult> {
  const tokenHash = hashPasswordResetToken(plainToken.trim());

  const rows = await prisma.$queryRaw<
    { Id: number; UsuarioId: number; Email: string }[]
  >`
    SELECT t."Id", u."Id" AS "UsuarioId", u."Email"
    FROM "TokenResetSenha" t
    INNER JOIN "Usuarios" u ON u."Id" = t."UsuarioId"
    WHERE t."TokenHash" = ${tokenHash}
      AND t."UsadoEm" IS NULL
      AND t."ExpiraEm" > NOW()
    LIMIT 1
  `;

  if (!rows.length) {
    return { valid: false };
  }

  const row = rows[0];
  const marked = await prisma.$executeRaw`
    UPDATE "TokenResetSenha"
    SET "UsadoEm" = NOW()
    WHERE "Id" = ${row.Id} AND "UsadoEm" IS NULL
  `;

  if (Number(marked) !== 1) {
    return { valid: false };
  }

  return {
    valid: true,
    usuarioId: row.UsuarioId,
    email: row.Email,
  };
}
