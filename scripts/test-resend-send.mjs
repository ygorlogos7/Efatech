import { readFileSync } from "fs";
import { Resend } from "resend";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      const k = l.slice(0, i);
      let v = l.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      return [k, v];
    }),
);

const to = process.argv[2] || "matheusnonatosa7@gmail.com";
const key = env.RESEND_API_KEY;
const from = env.EMAIL_FROM || "onboarding@resend.dev";

if (!key) {
  console.error("RESEND_API_KEY ausente no .env");
  process.exit(1);
}

console.log("From:", from);
console.log("To:", to);
console.log("Key prefix (real):", key.slice(0, 7) + "...");
console.log("Key OK format (re_):", key.startsWith("re_") && !key.startsWith("rex_"));
console.log("Key length:", key.length);

const resend = new Resend(key);
const { data, error } = await resend.emails.send({
  from,
  to,
  subject: "[TESTE Efatech] Confirme seu e-mail",
  html: "<p>Teste de envio Resend. Se recebeu, o Gmail esta ok.</p>",
});

if (error) {
  console.error("ERRO Resend:", JSON.stringify(error, null, 2));
  process.exit(1);
}

console.log("OK — id do envio:", data?.id);
console.log("Veja em https://resend.com/emails — status delivered/bounced");
