import { Redis } from "@upstash/redis";

/**
 * Upstash Redis — fonte única do cliente e regras de ambiente.
 * Produção: obrigatório (sem fallback em Map).
 * Desenvolvimento: Map em login-rate-limit.ts se variáveis ausentes.
 */
export function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

export function isProductionEnv(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Cliente compartilhado (rate limit global + tentativas de login). */
export const redis = isUpstashConfigured() ? Redis.fromEnv() : null;

/** Map em RAM permitido só fora de produção, quando Upstash não está no .env. */
export function canUseInMemoryRateLimitFallback(): boolean {
  return !isProductionEnv() && redis === null;
}

/** Produção sem Redis — rate limit distribuído indisponível (não usar Map). */
export function isRateLimitMisconfigured(): boolean {
  return isProductionEnv() && redis === null;
}

let missingRedisWarned = false;

/** Aviso único no log do servidor (build/start e primeira requisição). */
export function warnIfProductionWithoutRedis(): void {
  if (!isRateLimitMisconfigured() || missingRedisWarned) return;
  missingRedisWarned = true;
  console.error(
    "[RateLimit] CRÍTICO: em produção defina UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN. " +
      "Sem Redis não há limite compartilhado entre instâncias e o fallback em memória está desativado.",
  );
}
