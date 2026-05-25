import crypto from "crypto";
import { getAuthSecret } from "@/lib/auth-secret";

/** Link de confirmacao de e-mail — 1 hora (reenvio gera token novo). */
export const EMAIL_VERIFICATION_TTL_MS = 60 * 60 * 1000;
const TOKEN_TTL_MS = EMAIL_VERIFICATION_TTL_MS;

type TokenPayload = {
  email: string;
  exp: number;
};

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(data: string) {
  return crypto
    .createHmac("sha256", getAuthSecret())
    .update(data)
    .digest("base64url");
}

export function createEmailVerificationToken(email: string) {
  const payload: TokenPayload = {
    email: email.toLowerCase(),
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const payloadEncoded = toBase64Url(JSON.stringify(payload));
  const signature = sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export function verifyEmailVerificationToken(
  token: string,
): { valid: boolean; email?: string } {
  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) return { valid: false };

  const expectedSignature = sign(payloadEncoded);
  if (signature !== expectedSignature) return { valid: false };

  try {
    const payload = JSON.parse(fromBase64Url(payloadEncoded)) as TokenPayload;
    if (!payload?.email || !payload?.exp) return { valid: false };
    if (Date.now() > payload.exp) return { valid: false };
    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}
