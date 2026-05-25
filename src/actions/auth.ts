"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { validateRegisterInput } from "@/lib/auth-validation";
import { bumpSessionVersion } from "@/lib/session-version";
import { REGISTER_GENERIC_SUCCESS_MESSAGE } from "@/lib/register-messages";
import { getUsuarioAuthStatus } from "@/lib/usuario-email-verificado";
import { sendVerificationEmailForAddress } from "@/lib/verification-email";

export async function loginAction(formData: FormData) {
  try {
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const senha = formData.get("senha");
    
    // Isso vai tentar logar e jogar um throw Redirect (se sucesso) ou AuthError (se falha)
    await signIn('credentials', { email, senha, redirectTo: '/home' });
    
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'E-mail ou senha inválidos.' };
    }
    // Erros de redirect originais do Next.js devem ser relançados para o redirecionamento funcionar
    throw error;
  }
}

/** Encerra sessões em todos os dispositivos (invalida JWTs antigos). */
export async function revokeAllSessionsAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." };
  }

  await bumpSessionVersion(Number(session.user.id));
  await signOut({ redirectTo: "/login" });

  return { success: true };
}

export async function registerUser(formData: FormData) {
  try {
    const nome = formData.get("nome") as string;
    const email = String(formData.get("email") as string).trim().toLowerCase();
    const senha = formData.get("senha") as string;
    const telefoneStr = formData.get("telefone") as string;
    const celularStr = formData.get("celular") as string;

    const validation = await validateRegisterInput({
      nome,
      email,
      senha,
      telefone: telefoneStr,
    });

    if (!validation.success) {
      return { success: false, error: validation.error, fieldErrors: validation.fieldErrors };
    }

    const existing = await getUsuarioAuthStatus(email);

    if (existing.exists) {
      if (!existing.verified) {
        await sendVerificationEmailForAddress(email);
      }
      return {
        success: true,
        message: REGISTER_GENERIC_SUCCESS_MESSAGE,
      };
    }

    const telefoneNumbers = telefoneStr.replace(/\D/g, "");
    const celularNumbers = celularStr ? celularStr.replace(/\D/g, "") : "";

    const hashedPassword = await bcrypt.hash(senha, 10);

    await prisma.usuarios.create({
      data: {
        Nome: nome,
        Email: email,
        Senha: hashedPassword,
        Telefone: telefoneNumbers || null,
        Celular: celularNumbers || null,
      },
    });

    await sendVerificationEmailForAddress(email);

    return {
      success: true,
      message: REGISTER_GENERIC_SUCCESS_MESSAGE,
    };
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return { success: false, error: "Ocorreu um erro interno ao tentar cadastrar." };
  }
}
