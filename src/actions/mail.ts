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
    
    const { data, error } = await resend.emails.send({
      from: `Efatech PRO <${from}>`,
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to send email:", error);
    return { success: false, error: "Falha ao enviar e-mail." };
  }
}
