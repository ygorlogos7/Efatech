import { ALLOWED_HOSTS } from "@/lib/allowed-hosts";

/** Rotas do NextAuth — CSRF proprio; nao validar Origin aqui. */
const NEXTAUTH_POST_PREFIXES = [
  "/api/auth/signin",
  "/api/auth/signout",
  "/api/auth/session",
  "/api/auth/csrf",
  "/api/auth/providers",
  "/api/auth/callback",
  "/api/auth/error",
  "/api/auth/verify-request",
] as const;

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
  if (!pathname.startsWith("/api/auth")) return false;
  if (NEXTAUTH_POST_PREFIXES.some((p) => pathname.startsWith(p))) {
    return false;
  }
  return true;
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
