type AttemptStore = {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
};

const attempts = new Map<string, AttemptStore>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;

function now() {
  return Date.now();
}

export function getRateLimitKey(email: string, ip: string) {
  return `${email.toLowerCase()}::${ip}`;
}

export function registerFailedAttempt(key: string) {
  const current = attempts.get(key);
  const time = now();

  if (!current || time - current.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: time });
    return;
  }

  const nextCount = current.count + 1;
  if (nextCount >= MAX_ATTEMPTS) {
    attempts.set(key, {
      count: nextCount,
      firstAttemptAt: current.firstAttemptAt,
      blockedUntil: time + BLOCK_MS,
    });
    return;
  }

  attempts.set(key, { ...current, count: nextCount });
}

export function clearAttemptHistory(key: string) {
  attempts.delete(key);
}

export function checkRateLimit(key: string): { blocked: boolean; retryAfterMs?: number } {
  const current = attempts.get(key);
  if (!current) return { blocked: false };

  const time = now();

  if (time - current.firstAttemptAt > WINDOW_MS && !current.blockedUntil) {
    attempts.delete(key);
    return { blocked: false };
  }

  if (!current.blockedUntil) return { blocked: false };

  if (time >= current.blockedUntil) {
    attempts.delete(key);
    return { blocked: false };
  }

  return { blocked: true, retryAfterMs: current.blockedUntil - time };
}
