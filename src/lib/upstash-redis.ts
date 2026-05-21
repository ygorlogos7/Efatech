import { Redis } from "@upstash/redis";

/**
 * Upstash Redis — fonte única do cliente e regras de ambiente.
 * Com variáveis configuradas: rate limit distribuído (recomendado em produção).
 * Sem Upstash: fallback em memória (login e APIs seguem funcionando).
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

/** Fallback em RAM quando Upstash não está no ambiente. */
export function canUseInMemoryRateLimitFallback(): boolean {
  return redis === null;
}

let missingRedisWarned = false;

/** Aviso único no log do servidor (build/start e primeira requisição). */
export function warnIfProductionWithoutRedis(): void {
  if (!isProductionEnv() || isUpstashConfigured() || missingRedisWarned) return;
  missingRedisWarned = true;
  console.warn(
    "[RateLimit] Produção sem Upstash: usando limite em memória. " +
      "Configure UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN para limite entre instâncias.",
  );
}
