"use server";

import { resend } from "@/lib/mail";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmailAction({ to, subject, html }: SendEmailParams) {
  try {
    const from = process.env.NEXT_PUBLIC_SENDER_EMAIL || "onboarding@resend.dev";
    
    if (!resend) {
      console.warn(">>> [MAIL] Resend não configurado. Chave de API ausente.");
      return { success: false, error: "Serviço de e-mail não configurado no servidor." };
    }

    const { data, error } = await resend.emails.send({
      from: `Efatech PRO <${from}>`,
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error(">>> [MAIL] Erro no Resend:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to send email:", error);
    return { success: false, error: "Falha ao enviar e-mail." };
  }
}
