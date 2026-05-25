import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validatePasswordStrength } from "@/lib/auth-validation";
import { redeemPasswordResetToken } from "@/lib/password-reset-store";
import { bumpSessionVersion } from "@/lib/session-version";

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

    const redeemed = await redeemPasswordResetToken(token);
    if (!redeemed.valid) {
      return NextResponse.json(
        { success: false, error: "Token invalido, expirado ou ja utilizado." },
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

    await prisma.usuarios.update({
      where: { Id: redeemed.usuarioId },
      data: { Senha: hashedPassword },
    });

    await bumpSessionVersion(redeemed.usuarioId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json(
      { success: false, error: "Erro interno ao redefinir senha." },
      { status: 500 },
    );
  }
}
