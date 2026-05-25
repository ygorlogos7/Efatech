import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildPasswordResetHtml,
  buildPasswordResetText,
} from "@/lib/auth-email-templates";
import { getRequestBaseUrl, sendAuthEmail } from "@/lib/send-auth-email";
import { PASSWORD_RESET_TTL_MS } from "@/lib/password-reset-token";
import { issuePasswordResetToken } from "@/lib/password-reset-store";
import { getClientIp } from "@/lib/ratelimit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const ip = getClientIp(request);

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Informe o e-mail." },
        { status: 400 },
      );
    }

    const user = await prisma.usuarios.findFirst({
      where: { Email: email },
      select: { Id: true },
    });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const issued = await issuePasswordResetToken(user.Id, ip);

    if (!issued.shouldSendEmail) {
      return NextResponse.json({ success: true });
    }

    const resetLink = `${getRequestBaseUrl(request)}/redefinir-senha?token=${encodeURIComponent(issued.plainToken)}`;

    const expiresMinutes = Math.round(PASSWORD_RESET_TTL_MS / 60_000);

    const mail = await sendAuthEmail({
      to: email,
      subject: "Redefinicao de senha - Efatech",
      html: buildPasswordResetHtml({
        email,
        resetLink,
        expiresMinutes,
      }),
      text: buildPasswordResetText({
        email,
        resetLink,
        expiresMinutes,
      }),
      logLabel: "Reset de senha",
      fallbackLink: resetLink,
    });

    if (!mail.sent) {
      console.warn("[forgot-password] E-mail nao enviado:", mail.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[forgot-password]", error);
    const detail =
      process.env.NODE_ENV !== "production" && error instanceof Error
        ? error.message
        : undefined;
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno ao solicitar redefinicao.",
        ...(detail ? { detail } : {}),
      },
      { status: 500 },
    );
  }
}
