import { NextResponse } from "next/server";
import { validateLoginInput } from "@/lib/auth-validation";
import {
  checkRateLimit,
  clearAttemptHistory,
  getRateLimitKey,
  registerFailedAttempt,
} from "@/lib/auth-rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const forwardedFor = request.headers.get("x-forwarded-for") ?? "unknown";
    const ip = forwardedFor.split(",")[0]?.trim() || "unknown";
    const rateLimitKey = getRateLimitKey(email || "unknown", ip);

    const limitStatus = checkRateLimit(rateLimitKey);
    if (limitStatus.blocked) {
      const retrySeconds = Math.ceil((limitStatus.retryAfterMs ?? 0) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Muitas tentativas. Tente novamente em ${retrySeconds}s.`,
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
      registerFailedAttempt(rateLimitKey);
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 },
      );
    }

    clearAttemptHistory(rateLimitKey);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro interno ao validar login." },
      { status: 500 },
    );
  }
}
