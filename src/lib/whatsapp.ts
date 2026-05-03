/**
 * Retorna a URL base do sistema.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

/**
 * Formata um número de telefone para o padrão do WhatsApp (apenas números com DDI 55).
 */
export function formatWhatsAppNumber(phone: string | null | undefined): string {
  if (!phone) return "";
  
  // Remove tudo que não for dígito
  let cleaned = phone.replace(/\D/g, "");
  
  if (!cleaned) return "";

  // Se o número começar com 0, remove o zero (comum em DDDs no Brasil)
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // Se o número tiver 10 ou 11 dígitos (DDD + número), adiciona o 55 (Brasil)
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = "55" + cleaned;
  }
  
  // Se o número tiver 12 ou 13 dígitos e começar com 55, está correto.
  // Caso contrário, se for menor ou maior que o padrão esperado, retornamos o que temos.
  
  return cleaned;
}

/**
 * Gera o link do WhatsApp para um número e mensagem opcionais.
 */
export function getWhatsAppLink(phone: string | null | undefined, message: string = ""): string {
  const formattedPhone = formatWhatsAppNumber(phone);
  if (!formattedPhone) return "";
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}${message ? `?text=${encodedMessage}` : ""}`;
}
