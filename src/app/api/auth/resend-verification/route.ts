import { NextResponse } from "next/server";
import { sendVerificationEmailForAddress } from "@/lib/verification-email";

/**
 * POST /api/auth/resend-verification
 * Body: { "email": "usuario@exemplo.com" }
 *
 * Reenvia link de confirmacao de e-mail (contas com EmailVerificado = false).
 * Em desenvolvimento, pode retornar verifyLink na resposta se o Resend nao entregar.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Informe o e-mail." },
        { status: 400 },
      );
    }

    const result = await sendVerificationEmailForAddress(email);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message ?? "Falha ao processar." },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[resend-verification]", error);
    return NextResponse.json(
      { success: false, error: "Erro interno ao reenviar confirmacao." },
      { status: 500 },
    );
  }
}
