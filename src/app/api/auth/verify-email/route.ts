import { NextResponse } from "next/server";
import { verifyEmailVerificationToken } from "@/lib/email-verification-token";
import {
  getUsuarioEmailStatus,
  markUsuarioEmailVerified,
} from "@/lib/usuario-email-verificado";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body?.token ?? "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token obrigatorio." },
        { status: 400 },
      );
    }

    const tokenValidation = verifyEmailVerificationToken(token);
    if (!tokenValidation.valid || !tokenValidation.email) {
      return NextResponse.json(
        { success: false, error: "Link invalido ou expirado." },
        { status: 400 },
      );
    }

    const status = await getUsuarioEmailStatus(tokenValidation.email);

    if (!status.exists) {
      return NextResponse.json(
        { success: false, error: "Usuario nao encontrado." },
        { status: 404 },
      );
    }

    if (status.verified) {
      return NextResponse.json({ success: true, alreadyVerified: true });
    }

    await markUsuarioEmailVerified(tokenValidation.email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[verify-email]", error);
    return NextResponse.json(
      { success: false, error: "Erro interno ao verificar e-mail." },
      { status: 500 },
    );
  }
}
