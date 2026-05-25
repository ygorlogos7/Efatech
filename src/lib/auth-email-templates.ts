import { getAppBaseUrl } from "@/lib/send-auth-email";

const BRAND_GREEN = "#2e965f";
const BRAND_GREEN_DARK = "#247a4c";
const PAGE_BG = "#eef2f0";
const CARD_BG = "#ffffff";
const TEXT_MAIN = "#1f2937";
const TEXT_MUTED = "#6b7280";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * HTML para clientes de e-mail (layout em tabela + CSS inline).
 * Logo: URL publica do site (NEXTAUTH_URL + /images/logo_efatech.png).
 */
export function buildEmailVerificationHtml(options: {
  email: string;
  verifyLink: string;
  expiresHours?: number;
}) {
  const baseUrl = getAppBaseUrl().replace(/\/$/, "");
  const logoUrl = `${baseUrl}/images/logo_efatech.png`;
  const resendUrl = `${baseUrl}/reenviar-confirmacao`;
  const email = escapeHtml(options.email);
  const verifyLink = escapeHtml(options.verifyLink);
  const hours = options.expiresHours ?? 1;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Confirme seu e-mail - Efatech</title>
</head>
<body style="margin:0;padding:0;background-color:${PAGE_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${PAGE_BG};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:${CARD_BG};border-radius:16px;overflow:hidden;box-shadow:0 12px 32px rgba(46,150,95,0.12);">
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND_GREEN} 0%,${BRAND_GREEN_DARK} 100%);padding:28px 24px;text-align:center;">
              <img src="${logoUrl}" alt="Efatech" width="220" style="display:block;margin:0 auto;max-width:220px;height:auto;border:0;" />
              <p style="margin:12px 0 0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.92);font-weight:600;">
                Assistencia tecnica e acessorios
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 8px;text-align:center;">
              <h1 style="margin:0;font-size:22px;line-height:1.3;color:${TEXT_MAIN};font-weight:700;">
                Confirmacao de e-mail
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;text-align:center;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${TEXT_MUTED};">
                Enviamos este e-mail para confirmar seu cadastro no Efatech.
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${TEXT_MUTED};">
                Endereco: <strong style="color:${BRAND_GREEN};">${email}</strong>
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:999px;background-color:${BRAND_GREEN};">
                    <a href="${verifyLink}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">
                      Confirmar meu e-mail
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:${TEXT_MUTED};">
                O link expira em <strong>${hours} hora</strong>. Depois disso, solicite um novo em
                <a href="${resendUrl}" style="color:${BRAND_GREEN};font-weight:600;text-decoration:underline;">Reenviar confirmacao</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 16px;" />
              <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;text-align:center;">
                Se o botao nao abrir, copie e cole no navegador:<br />
                <a href="${verifyLink}" style="color:${BRAND_GREEN};word-break:break-all;">${verifyLink}</a>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:11px;color:#9ca3af;text-align:center;">
          &copy; Efatech — voce recebeu este e-mail por ter se cadastrado no sistema.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildEmailVerificationText(options: {
  email: string;
  verifyLink: string;
  expiresHours?: number;
}) {
  const baseUrl = getAppBaseUrl().replace(/\/$/, "");
  const hours = options.expiresHours ?? 1;
  return `Efatech — Confirmacao de e-mail

Ola,

Confirme o cadastro do e-mail ${options.email} acessando o link abaixo (valido por ${hours} hora):

${options.verifyLink}

Se o link expirar: ${baseUrl}/reenviar-confirmacao

Efatech — Assistencia tecnica e acessorios`;
}
