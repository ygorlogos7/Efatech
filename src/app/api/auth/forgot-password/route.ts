import { NextResponse } from "next/server";
import { Resend } from "resend";
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
    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const emailFrom = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

    // Modo simples: envia com Resend quando configurado.
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: emailFrom,
        to: email,
        subject: "Redefinicao de senha",
        html: `<p>Recebemos uma solicitacao para redefinir sua senha.</p>
<p>Clique no link abaixo para continuar:</p>
<p><a href="${resetLink}">${resetLink}</a></p>
<p>Se voce nao solicitou, pode ignorar este e-mail.</p>`,
      });
    } else {
      // Fallback local para testes sem provedor.
      console.log(`[Auth] Link de redefinicao para ${email}: ${resetLink}`);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro interno ao solicitar redefinicao." },
      { status: 500 },
    );
  }
}
