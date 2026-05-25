"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { validateRegisterInput } from "@/lib/auth-validation";
import { bumpSessionVersion } from "@/lib/session-version";
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
      return { success: false, error: validation.error };
    }

    // Limpa a formatação de telefone (remove parênteses, traços, espaços)
    const telefoneNumbers = telefoneStr.replace(/\D/g, "");
    const celularNumbers = celularStr ? celularStr.replace(/\D/g, "") : "";

    const telefone = telefoneNumbers || null;
    const celular = celularNumbers || null;

    // Hashear a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Salvar no banco
    await prisma.usuarios.create({
      data: {
        Nome: nome,
        Email: email,
        Senha: hashedPassword,
        Telefone: telefone,
        Celular: celular,
      },
    });

    const mail = await sendVerificationEmailForAddress(email);

    return {
      success: true,
      emailSent: mail.emailSent,
      verifyLink: mail.verifyLink,
      message: mail.message,
    };
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return { success: false, error: "Ocorreu um erro interno ao tentar cadastrar." };
  }
}
