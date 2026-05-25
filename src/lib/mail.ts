import { Resend } from "resend";

// Inicializa o Resend apenas se a chave estiver presente para evitar erros de inicialização no servidor
const resendApiKey = process.env.RESEND_API_KEY?.trim();
export const resend = resendApiKey ? new Resend(resendApiKey) : null;
