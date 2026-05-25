import { logAction } from "@/lib/logger";

export type LoginAuditResult =
  | "sucesso"
  | "credenciais_invalidas"
  | "email_nao_confirmado"
  | "conta_bloqueada"
  | "rate_limit";

const RESULT_LABELS: Record<LoginAuditResult, string> = {
  sucesso: "Login autorizado (validacao previa)",
  credenciais_invalidas: "Tentativa de login falhou — credenciais invalidas",
  email_nao_confirmado: "Tentativa de login falhou — e-mail nao confirmado",
  conta_bloqueada: "Tentativa de login falhou — conta bloqueada",
  rate_limit: "Tentativa de login bloqueada — rate limit",
};

/** Registra tentativa de login em LogSistema (modulo AUTENTICACAO). */
export async function logLoginAudit(params: {
  email: string;
  resultado: LoginAuditResult;
  ip?: string;
}) {
  const email = params.email.trim().toLowerCase() || "desconhecido";
  const quando = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const ip = params.ip ?? "desconhecido";
  const descricao = `${RESULT_LABELS[params.resultado]} para ${email}, IP ${ip}, em ${quando}.`;

  await logAction(
    params.resultado === "sucesso" ? "Login validado" : "Login falhou",
    "AUTENTICACAO",
    descricao,
    params.resultado === "sucesso" ? "INFO" : "AVISO",
    email,
  );
}
