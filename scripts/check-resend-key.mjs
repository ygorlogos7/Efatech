import { readFileSync } from "fs";

const line = readFileSync(".env", "utf8")
  .split("\n")
  .find((l) => l.startsWith("RESEND_API_KEY="));

if (!line) {
  console.error("RESEND_API_KEY nao encontrada no .env");
  process.exit(1);
}

let v = line.slice("RESEND_API_KEY=".length).trim();
if (
  (v.startsWith('"') && v.endsWith('"')) ||
  (v.startsWith("'") && v.endsWith("'"))
) {
  v = v.slice(1, -1);
}

console.log("Prefixo real (4 chars):", JSON.stringify(v.slice(0, 4)));
console.log("Comeca com re_ (correto):", v.startsWith("re_"));
console.log("Comeca com rex_ (errado):", v.startsWith("rex_"));
console.log("Tamanho da chave:", v.length);
console.log("Tem espaco no fim:", v !== v.trim());
console.log(
  "Formato esperado Resend: re_ + ~30-40 caracteres (ex.: re_abc123...)",
);
