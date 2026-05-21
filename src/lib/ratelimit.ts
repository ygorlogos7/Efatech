import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isRateLimitMisconfigured,
  redis,
  warnIfProductionWithoutRedis,
} from "@/lib/upstash-redis";

/** Limite de 10 requisições a cada 10 segundos por IP (rotas /api). */
export const rateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
    })
  : null;

export function getClientIp(request: Request | NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "127.0.0.1";
  }
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

/** Rotas de API que passam pelo rate limit global (proxy). */
export function shouldRateLimitApi(pathname: string): boolean {
  return pathname.startsWith("/api");
}

const RATE_LIMIT_UNAVAILABLE_MESSAGE =
  "Serviço temporariamente indisponível. Tente novamente em alguns minutos.";

/**
 * Rate limit global por IP (Upstash).
 * Produção sem Redis: falha fechada (503), não deixa /api sem limite.
 * Desenvolvimento sem Redis: segue sem limite global (login ainda usa Map local).
 */
export async function enforceIpRateLimit(
  request: Request | NextRequest,
): Promise<NextResponse | null> {
  warnIfProductionWithoutRedis();

  if (isRateLimitMisconfigured()) {
    return NextResponse.json(
      { error: RATE_LIMIT_UNAVAILABLE_MESSAGE },
      { status: 503 },
    );
  }

  if (!rateLimiter) return null;

  const ip = getClientIp(request);
  const { success } = await rateLimiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Muitas tentativas. Por favor, aguarde alguns segundos." },
      { status: 429 },
    );
  }

  return null;
}

/** Resposta padrão quando login/auth exige Redis e ele não está configurado em produção. */
export function rateLimitUnavailableResponse() {
  return NextResponse.json(
    {
      success: false,
      error: RATE_LIMIT_UNAVAILABLE_MESSAGE,
    },
    { status: 503 },
  );
}
