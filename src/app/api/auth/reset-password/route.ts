import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validatePasswordStrength } from "@/lib/auth-validation";
import { verifyPasswordResetToken } from "@/lib/password-reset-token";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body?.token ?? "");
    const senha = String(body?.senha ?? "");

    if (!token || !senha) {
      return NextResponse.json(
        { success: false, error: "Token e nova senha sao obrigatorios." },
        { status: 400 },
      );
    }

    const tokenValidation = verifyPasswordResetToken(token);
    if (!tokenValidation.valid || !tokenValidation.email) {
      return NextResponse.json(
        { success: false, error: "Token invalido ou expirado." },
        { status: 400 },
      );
    }

    const passwordValidation = validatePasswordStrength(senha);
    if (!passwordValidation.success) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    await prisma.usuarios.updateMany({
      where: { Email: tokenValidation.email },
      data: { Senha: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro interno ao redefinir senha." },
      { status: 500 },
    );
  }
}
