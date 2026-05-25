import { Resend } from "resend";

/**
 * Remetente Resend: use EMAIL_FROM com dominio verificado ou onboarding@resend.dev.
 * NEXT_PUBLIC_SENDER_EMAIL (Gmail) nao funciona como "from" no Resend.
 */
function getEmailFrom() {
  const emailFrom = process.env.EMAIL_FROM?.trim();
  if (emailFrom) {
    return emailFrom.includes("<") ? emailFrom : `Efatech <${emailFrom}>`;
  }
  return "Efatech <onboarding@resend.dev>";
}

export type SendAuthEmailResult =
  | { sent: true }
  | { sent: false; error: string; loggedLink?: boolean };

export async function sendAuthEmail(options: {
  to: string;
  subject: string;
  html: string;
  /** Versao texto para clientes que nao renderizam HTML */
  text?: string;
  logLabel: string;
  /** URL de confirmacao etc. — sempre logada em dev se envio falhar */
  fallbackLink?: string;
}): Promise<SendAuthEmailResult> {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const isDev = process.env.NODE_ENV !== "production";

  const logLink = () => {
    if (options.fallbackLink) {
      console.log(`[Auth] ${options.logLabel} para ${options.to}:`);
      console.log(options.fallbackLink);
    } else {
      console.log(`[Auth] ${options.logLabel} para ${options.to}:`);
      console.log(options.html);
    }
  };

  if (!resendApiKey) {
    logLink();
    return {
      sent: false,
      error: "RESEND_API_KEY nao configurada.",
      loggedLink: true,
    };
  }

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: options.to,
    subject: options.subject,
    html: options.html,
    ...(options.text ? { text: options.text } : {}),
  });

  if (error) {
    console.error(`[Auth] Erro Resend (${options.logLabel}):`, error);
    if (isDev) logLink();
    return {
      sent: false,
      error: error.message,
      loggedLink: isDev,
    };
  }

  if (isDev && options.fallbackLink) {
    console.log(`[Auth] E-mail enviado para ${options.to}. Link (dev):`);
    console.log(options.fallbackLink);
  }

  return { sent: true };
}

export function getAppBaseUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}
