/**
 * Testes locais das lacunas 3, 5 e 8 (sem UI).
 * Requer: npm run dev OU apenas DATABASE_URL no .env para partes SQL.
 */
import { readFileSync } from "fs";
import pg from "pg";

const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
const env = readFileSync(".env", "utf8");
const dbUrl = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.replace(/^"|"$/g, "");
const testEmail = "matheusnonatosa7@gmail.com";

const pool = new pg.Pool({ connectionString: dbUrl });

async function ensureBloqueadoColumn() {
  await pool.query(
    `ALTER TABLE "Usuarios" ADD COLUMN IF NOT EXISTS "Bloqueado" BOOLEAN NOT NULL DEFAULT false`,
  );
  console.log("OK coluna Bloqueado");
}

async function testRegisterEnumeration() {
  const res = await fetch(`${base}/api/auth/validate-register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Teste Bot",
      telefone: "11999999999",
      email: testEmail,
      senha: "Teste@1234",
    }),
  });
  const data = await res.json();
  console.log("\n[Lacuna 5] validate-register (e-mail existente):");
  console.log("  status:", res.status, "success:", data.success);
  console.log("  erro expoe e-mail existente?", /ja esta em uso|pendente/i.test(data.error || "") ? "SIM (ruim)" : "NAO (bom)");
}

async function testLoginAuditAndBlocked() {
  const resFail = await fetch(`${base}/api/auth/validate-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.0.99" },
    body: JSON.stringify({ email: testEmail, senha: "senha-errada" }),
  });
  const failData = await resFail.json();
  console.log("\n[Lacuna 8] login falha (senha errada):");
  console.log("  status:", resFail.status, failData.error);

  const logs = await pool.query(
    `SELECT "Acao", "Modulo", "Descricao", "Ip", "Data"
     FROM "LogSistema"
     WHERE "Modulo" = 'AUTENTICACAO'
     ORDER BY "Id" DESC LIMIT 3`,
  );
  console.log("  ultimos logs AUTENTICACAO:", logs.rows.length);
  logs.rows.forEach((row, i) => {
    console.log(`  [${i}]`, row.Acao, "-", row.Descricao?.slice(0, 80));
  });

  await pool.query(
    `UPDATE "Usuarios" SET "Bloqueado" = true WHERE LOWER("Email") = LOWER($1)`,
    [testEmail],
  );
  const resBlock = await fetch(`${base}/api/auth/validate-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, senha: "qualquer" }),
  });
  const blockData = await resBlock.json();
  console.log("\n[Lacuna 3] conta bloqueada:");
  console.log("  ", blockData.error);

  await pool.query(
    `UPDATE "Usuarios" SET "Bloqueado" = false WHERE LOWER("Email") = LOWER($1)`,
    [testEmail],
  );
  console.log("  Bloqueado resetado para false");
}

try {
  await ensureBloqueadoColumn();
  await testRegisterEnumeration();
  await testLoginAuditAndBlocked();
} catch (e) {
  console.error("Falha:", e.message);
  console.error("Dica: rode npm run dev para testar as APIs.");
} finally {
  await pool.end();
}
