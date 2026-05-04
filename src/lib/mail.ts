import { Resend } from "resend";

// Inicializa o Resend apenas se a chave estiver presente para evitar erros de inicialização no servidor
export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
