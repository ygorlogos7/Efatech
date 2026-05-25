/**
 * Teste local lacuna 9 — Origin/Referer nas APIs auth.
 * Requer: npm run dev
 */
const base = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function post(path, headers, body = {}) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

console.log("Base:", base);

const ok = await post(
  "/api/auth/validate-login",
  { Origin: base },
  { email: "teste@efatech.com", senha: "x" },
);
console.log("\n[OK] Origin valido:", ok.status, ok.data.error?.slice(0, 40) || ok.data);

const bad = await post(
  "/api/auth/validate-login",
  { Origin: "https://site-malicioso.com" },
  { email: "teste@efatech.com", senha: "x" },
);
console.log("[BLOQUEIO] Origin invalido:", bad.status, bad.data.error);

const referer = await post(
  "/api/auth/forgot-password",
  { Referer: `${base}/esqueci-senha` },
  { email: "teste@efatech.com" },
);
console.log("[OK] Referer valido:", referer.status, referer.data);

const noHeader = await post("/api/auth/validate-register", {}, {
  nome: "A",
  email: "a@b.com",
  senha: "Teste@1234",
  telefone: "11999999999",
});
console.log(
  "[DEV] Sem Origin/Referer:",
  noHeader.status,
  process.env.NODE_ENV === "production" ? "(prod deve 403)" : "(dev permite)",
);
