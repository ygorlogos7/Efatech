"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email");
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

export async function registerUser(formData: FormData) {
  try {
    const nome = formData.get("nome") as string;
    const email = formData.get("email") as string;
    const senha = formData.get("senha") as string;
    const telefoneStr = formData.get("telefone") as string;
    const celularStr = formData.get("celular") as string;

    if (!nome || !email || !senha || !telefoneStr) {
      return { success: false, error: "Preencha todos os campos obrigatórios." };
    }

    // Verifica se e-mail já existe (Note que a tabela usa "Email" com E maiúsculo - do C#)
    const existingUser = await prisma.usuarios.findFirst({
      where: { Email: email }
    });

    if (existingUser) {
      return { success: false, error: "Este e-mail já está em uso." };
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
        Celular: celular
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return { success: false, error: "Ocorreu um erro interno ao tentar cadastrar." };
  }
}
