import crypto from "crypto";

const TOKEN_TTL_MS = 15 * 60 * 1000;

type TokenPayload = {
  email: string;
  exp: number;
};

function getSecret() {
  return process.env.NEXTAUTH_SECRET || "unsafe-dev-secret";
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(data: string) {
  return crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createPasswordResetToken(email: string) {
  const payload: TokenPayload = {
    email: email.toLowerCase(),
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const payloadEncoded = toBase64Url(JSON.stringify(payload));
  const signature = sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export function verifyPasswordResetToken(token: string): { valid: boolean; email?: string } {
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
