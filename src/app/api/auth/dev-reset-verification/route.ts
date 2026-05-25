import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Somente desenvolvimento — zera confirmacao para testar envio de e-mail. */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Nao disponivel." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Informe o e-mail." }, { status: 400 });
    }

    const count = await prisma.$executeRaw`
      UPDATE "Usuarios"
      SET "EmailVerificado" = false, "EmailVerificadoEm" = NULL
      WHERE LOWER("Email") = LOWER(${email})
    `;

    return NextResponse.json({
      success: true,
      updated: Number(count),
      message:
        "Confirmacao resetada. Use /reenviar-confirmacao para testar o envio.",
    });
  } catch (error) {
    console.error("[dev-reset-verification]", error);
    return NextResponse.json({ error: "Falha ao resetar." }, { status: 500 });
  }
}
