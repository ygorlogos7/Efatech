import {
  canUseInMemoryRateLimitFallback,
  isRateLimitMisconfigured,
  redis,
  warnIfProductionWithoutRedis,
} from "@/lib/upstash-redis";

const FAIL_PREFIX = "login:fail:";
const BLOCK_PREFIX = "login:block:";

const MAX_ATTEMPTS = 5;
const WINDOW_SEC = 10 * 60;
const BLOCK_SEC = 15 * 60;

type AttemptStore = {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
};

/** Fallback só em dev sem Upstash — nunca usado em produção. */
const devAttempts = new Map<string, AttemptStore>();

export function getRateLimitKey(email: string, ip: string) {
  return `${email.toLowerCase()}::${ip}`;
}

/** Ex.: 899s → "15 minutos" */
export function formatLoginBlockWait(retryAfterMs?: number): string {
  const totalSeconds = Math.max(0, Math.ceil((retryAfterMs ?? 0) / 1000));
  if (totalSeconds < 60) {
    return totalSeconds <= 1 ? "1 segundo" : `${totalSeconds} segundos`;
  }
  const minutes = Math.ceil(totalSeconds / 60);
  return minutes === 1 ? "1 minuto" : `${minutes} minutos`;
}

function devNow() {
  return Date.now();
}

function checkDevRateLimit(key: string): { blocked: boolean; retryAfterMs?: number } {
  const current = devAttempts.get(key);
  if (!current) return { blocked: false };

  const time = devNow();

  if (time - current.firstAttemptAt > WINDOW_SEC * 1000 && !current.blockedUntil) {
    devAttempts.delete(key);
    return { blocked: false };
  }

  if (!current.blockedUntil) return { blocked: false };

  if (time >= current.blockedUntil) {
    devAttempts.delete(key);
    return { blocked: false };
  }

  return { blocked: true, retryAfterMs: current.blockedUntil - time };
}

function registerDevFailedAttempt(key: string) {
  const current = devAttempts.get(key);
  const time = devNow();

  if (!current || time - current.firstAttemptAt > WINDOW_SEC * 1000) {
    devAttempts.set(key, { count: 1, firstAttemptAt: time });
    return;
  }

  const nextCount = current.count + 1;
  if (nextCount >= MAX_ATTEMPTS) {
    devAttempts.set(key, {
      count: nextCount,
      firstAttemptAt: current.firstAttemptAt,
      blockedUntil: time + BLOCK_SEC * 1000,
    });
    return;
  }

  devAttempts.set(key, { ...current, count: nextCount });
}

/** Produção sem Redis: bloqueia tentativas (fail-closed) em vez de liberar tudo. */
function misconfiguredRateLimitStatus(): { blocked: boolean; retryAfterMs?: number } {
  return { blocked: true, retryAfterMs: BLOCK_SEC * 1000 };
}

export async function checkRateLimit(
  key: string,
): Promise<{ blocked: boolean; retryAfterMs?: number }> {
  warnIfProductionWithoutRedis();

  if (isRateLimitMisconfigured()) {
    return misconfiguredRateLimitStatus();
  }

  if (canUseInMemoryRateLimitFallback()) {
    return checkDevRateLimit(key);
  }

  const blockKey = `${BLOCK_PREFIX}${key}`;
  const ttl = await redis!.ttl(blockKey);
  if (ttl > 0) {
    return { blocked: true, retryAfterMs: ttl * 1000 };
  }

  return { blocked: false };
}

export async function registerFailedAttempt(key: string): Promise<void> {
  if (isRateLimitMisconfigured()) return;

  if (canUseInMemoryRateLimitFallback()) {
    registerDevFailedAttempt(key);
    return;
  }

  const failKey = `${FAIL_PREFIX}${key}`;
  const count = await redis!.incr(failKey);

  if (count === 1) {
    await redis!.expire(failKey, WINDOW_SEC);
  }

  if (count >= MAX_ATTEMPTS) {
    await redis!.set(`${BLOCK_PREFIX}${key}`, "1", { ex: BLOCK_SEC });
    await redis!.del(failKey);
  }
}

export async function clearAttemptHistory(key: string): Promise<void> {
  if (isRateLimitMisconfigured()) return;

  if (canUseInMemoryRateLimitFallback()) {
    devAttempts.delete(key);
    return;
  }

  await redis!.del(`${FAIL_PREFIX}${key}`, `${BLOCK_PREFIX}${key}`);
}
