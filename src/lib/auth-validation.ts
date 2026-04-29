import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type ValidationResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()]/;

export function validatePasswordStrength(password: string): ValidationResult {
  if (password.length < 8) {
    return { success: false, error: "A senha deve ter pelo menos 8 caracteres." };
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    return { success: false, error: "A senha deve conter letras maiúsculas e minúsculas." };
  }

  if (!/[0-9]/.test(password)) {
    return { success: false, error: "A senha deve conter pelo menos um número." };
  }

  if (!SPECIAL_CHAR_REGEX.test(password)) {
    return { success: false, error: "A senha deve conter pelo menos um caractere especial." };
  }

  return { success: true };
}

export async function validateRegisterInput(input: {
  nome?: string;
  email?: string;
  senha?: string;
  telefone?: string;
}): Promise<ValidationResult> {
  const nome = input.nome?.trim();
  const email = input.email?.trim().toLowerCase();
  const senha = input.senha ?? "";
  const telefone = input.telefone?.trim();

  if (!nome || !email || !senha || !telefone) {
    const fieldErrors: Record<string, string> = {};
    if (!nome) fieldErrors.nome = "Nome e obrigatorio.";
    if (!telefone) fieldErrors.telefone = "Telefone e obrigatorio.";
    if (!email) fieldErrors.email = "E-mail e obrigatorio.";
    if (!senha) fieldErrors.senha = "Senha e obrigatoria.";
    return { success: false, error: "Preencha os campos obrigatorios.", fieldErrors };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      success: false,
      error: "Informe um e-mail valido.",
      fieldErrors: { email: "E-mail invalido." },
    };
  }

  const passwordValidation = validatePasswordStrength(senha);
  if (!passwordValidation.success) {
    return {
      ...passwordValidation,
      fieldErrors: { senha: passwordValidation.error ?? "Senha invalida." },
    };
  }

  const existingUser = await prisma.usuarios.findFirst({
    where: { Email: email },
  });

  if (existingUser) {
    return {
      success: false,
      error: "Este e-mail ja esta em uso.",
      fieldErrors: { email: "Este e-mail ja esta em uso." },
    };
  }

  return { success: true };
}

export async function validateLoginInput(input: {
  email?: string;
  senha?: string;
}): Promise<ValidationResult> {
  const email = input.email?.trim().toLowerCase();
  const senha = input.senha ?? "";

  if (!email || !senha) {
    const fieldErrors: Record<string, string> = {};
    if (!email) fieldErrors.email = "E-mail e obrigatorio.";
    if (!senha) fieldErrors.senha = "Senha e obrigatoria.";
    return { success: false, error: "Preencha e-mail e senha.", fieldErrors };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      success: false,
      error: "Informe um e-mail valido.",
      fieldErrors: { email: "E-mail invalido." },
    };
  }

  const user = await prisma.usuarios.findFirst({
    where: { Email: email },
  });

  if (!user) {
    return {
      success: false,
      error: "E-mail ou senha invalidos.",
      fieldErrors: { email: "Credenciais invalidas." },
    };
  }

  const passwordsMatch = await bcrypt.compare(senha, user.Senha);
  if (!passwordsMatch) {
    return {
      success: false,
      error: "E-mail ou senha invalidos.",
      fieldErrors: { senha: "Credenciais invalidas." },
    };
  }

  return { success: true };
}
