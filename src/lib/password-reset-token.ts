import crypto from "crypto";

/** Validade do link de redefinicao (lacuna 6). */
export const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;

/** Intervalo minimo entre e-mails de reset para o mesmo usuario. */
export const PASSWORD_RESET_EMAIL_COOLDOWN_MS = 2 * 60 * 1000;

/** Token aleatorio enviado no link (nunca persista em claro no banco). */
export function generatePasswordResetPlainToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/** Hash SHA-256 hex para busca em TokenResetSenha.TokenHash. */
export function hashPasswordResetToken(plainToken: string): string {
  return crypto.createHash("sha256").update(plainToken).digest("hex");
}
