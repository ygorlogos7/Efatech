import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/password-reset-token";

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

    const user = await prisma.usuarios.findFirst({
      where: { Email: email },
    });

    // Nunca expor se o e-mail existe ou nao.
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = createPasswordResetToken(email);
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const resetLink = `${baseUrl}/redefinir-senha?token=${encodeURIComponent(token)}`;

    // Aqui voce integraria o seu provedor SMTP.
    console.log(`[Auth] Link de redefinicao para ${email}: ${resetLink}`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro interno ao solicitar redefinicao." },
      { status: 500 },
    );
  }
}
