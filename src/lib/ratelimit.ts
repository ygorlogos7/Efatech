import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redis, warnIfProductionWithoutRedis } from "@/lib/upstash-redis";

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

/**
 * Rate limit global por IP (Upstash).
 * Sem Redis: não aplica limite global por IP (login usa fallback em memória).
 */
export async function enforceIpRateLimit(
  request: Request | NextRequest,
): Promise<NextResponse | null> {
  warnIfProductionWithoutRedis();

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
