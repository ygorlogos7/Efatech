import { NextResponse } from "next/server";
import { validateRegisterInput } from "@/lib/auth-validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = await validateRegisterInput({
      nome: body?.nome,
      email: body?.email,
      senha: body?.senha,
      telefone: body?.telefone,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro interno ao validar cadastro." },
      { status: 500 },
    );
  }
}
