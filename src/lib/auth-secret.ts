/** Segredo HMAC para tokens de auth (reset, verificação de e-mail). */
export function getAuthSecret(): string {
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "unsafe-dev-secret"
  );
}
