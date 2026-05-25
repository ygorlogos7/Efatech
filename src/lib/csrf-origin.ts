import { ALLOWED_HOSTS } from "@/lib/allowed-hosts";

/** APIs proprias de auth — Origin/Referer obrigatorio em POST (lacuna 9). */
const CUSTOM_AUTH_API_PATHS = new Set([
  "/api/auth/validate-login",
  "/api/auth/validate-register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/resend-verification",
  "/api/auth/verify-email",
  "/api/auth/send-verification-email",
  "/api/auth/dev-reset-verification",
]);

function hostToOriginVariants(host: string): string[] {
  const clean = host.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return [`https://${clean}`, `http://${clean}`];
}

/** Origens completas (protocolo + host) para comparar com header Origin. */
export function getAllowedRequestOrigins(): string[] {
  const origins = new Set<string>();

  for (const host of ALLOWED_HOSTS) {
    hostToOriginVariants(host).forEach((o) => origins.add(o));
  }

  const nextAuthUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "");
  if (nextAuthUrl) origins.add(nextAuthUrl);

  const vercelUrl = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercelUrl) {
    origins.add(vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`);
  }

  return [...origins];
}

export function shouldEnforceCsrfOrigin(method: string, pathname: string): boolean {
  if (method !== "POST") return false;
  return CUSTOM_AUTH_API_PATHS.has(pathname);
}

export function validateRequestOrigin(request: Request): boolean {
  const allowed = getAllowedRequestOrigins();
  const origin = request.headers.get("origin");

  if (origin) {
    return allowed.includes(origin);
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return allowed.includes(new URL(referer).origin);
    } catch {
      return false;
    }
  }

  return process.env.NODE_ENV !== "production";
}

export function csrfOriginForbiddenResponse() {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Requisicao bloqueada (origem invalida).",
    }),
    {
      status: 403,
      headers: { "Content-Type": "application/json" },
    },
  );
}
