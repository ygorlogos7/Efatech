import {
  buildEmailVerificationHtml,
  buildEmailVerificationText,
} from "@/lib/auth-email-templates";
import { createEmailVerificationToken } from "@/lib/email-verification-token";
import { getAppBaseUrl, sendAuthEmail } from "@/lib/send-auth-email";
import { getUsuarioEmailStatus } from "@/lib/usuario-email-verificado";

export type SendVerificationEmailResult = {
  /** Sempre true na resposta publica (nao revela se e-mail existe). */
  success: boolean;
  pending?: boolean;
  alreadyVerified?: boolean;
  emailSent?: boolean;
  message?: string;
  /** Apenas em desenvolvimento — link direto quando Resend nao entrega. */
  verifyLink?: string;
  mailError?: string;
};

function isDevEnv() {
  return process.env.NODE_ENV !== "production";
}

export async function sendVerificationEmailForAddress(
  email: string,
): Promise<SendVerificationEmailResult> {
  const normalized = email.trim().toLowerCase();
  const status = await getUsuarioEmailStatus(normalized);

  if (!status.exists) {
    return {
      success: true,
      message:
        "Se o e-mail estiver cadastrado e pendente, enviamos um novo link.",
    };
  }

  if (status.verified) {
    return {
      success: true,
      alreadyVerified: true,
      message: "Este e-mail ja foi confirmado. Voce pode fazer login.",
    };
  }

  const token = createEmailVerificationToken(normalized);
  const verifyLink = `${getAppBaseUrl()}/verificar-email?token=${encodeURIComponent(token)}`;

  const mailResult = await sendAuthEmail({
    to: normalized,
    subject: "Confirme seu e-mail - Efatech",
    html: buildEmailVerificationHtml({
      email: normalized,
      verifyLink,
      expiresHours: 1,
    }),
    text: buildEmailVerificationText({
      email: normalized,
      verifyLink,
      expiresHours: 1,
    }),
    logLabel: "Link de verificacao",
    fallbackLink: verifyLink,
  });

  const dev = isDevEnv();
  const base: SendVerificationEmailResult = {
    success: true,
    pending: true,
    emailSent: mailResult.sent,
  };

  if (mailResult.sent) {
    return {
      ...base,
      message:
        "Link de confirmacao enviado. Abra o e-mail (confira o spam) e clique no link — nao use atalho na tela.",
    };
  }

  return {
    ...base,
    message: dev
      ? "E-mail nao entregue pelo Resend (modo dev). Use o link abaixo para confirmar."
      : "Nao foi possivel enviar o e-mail agora. Corrija a configuracao no servidor (veja detalhe abaixo).",
    mailError: mailResult.error,
    ...(dev ? { verifyLink } : {}),
  };
}
