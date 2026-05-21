import { NextResponse } from "next/server";
import { validateLoginInput } from "@/lib/auth-validation";
import { getClientIp, rateLimitUnavailableResponse } from "@/lib/ratelimit";
import {
  checkRateLimit,
  clearAttemptHistory,
  formatLoginBlockWait,
  getRateLimitKey,
  registerFailedAttempt,
} from "@/lib/login-rate-limit";
import { isRateLimitMisconfigured } from "@/lib/upstash-redis";

export async function POST(request: Request) {
  try {
    if (isRateLimitMisconfigured()) {
      return rateLimitUnavailableResponse();
    }

    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const ip = getClientIp(request);
    const rateLimitKey = getRateLimitKey(email || "unknown", ip);

    const limitStatus = await checkRateLimit(rateLimitKey);
    if (limitStatus.blocked) {
      const waitLabel = formatLoginBlockWait(limitStatus.retryAfterMs);
      return NextResponse.json(
        {
          success: false,
          error: `Muitas tentativas. Tente novamente em ${waitLabel}.`,
          fieldErrors: { senha: "Acesso temporariamente bloqueado." },
        },
        { status: 429 },
      );
    }

    const validation = await validateLoginInput({
      email,
      senha: body?.senha,
    });

    if (!validation.success) {
      await registerFailedAttempt(rateLimitKey);
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 },
      );
    }

    await clearAttemptHistory(rateLimitKey);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro interno ao validar login." },
      { status: 500 },
    );
  }
}
