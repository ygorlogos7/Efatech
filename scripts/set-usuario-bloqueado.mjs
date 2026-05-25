import { readFileSync } from "fs";
import pg from "pg";

const env = readFileSync(".env", "utf8");
const dbUrl = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.replace(/^"|"$/g, "");
const email = (process.argv[2] || "").trim().toLowerCase();
const bloqueado = process.argv[3] !== "false";

if (!email) {
  console.error("Uso: node scripts/set-usuario-bloqueado.mjs email@exemplo.com [false]");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl });

try {
  await pool.query(
    `ALTER TABLE "Usuarios" ADD COLUMN IF NOT EXISTS "Bloqueado" BOOLEAN NOT NULL DEFAULT false`,
  );
  const r = await pool.query(
    `UPDATE "Usuarios" SET "Bloqueado" = $1 WHERE LOWER("Email") = LOWER($2) RETURNING "Id", "Email", "Bloqueado"`,
    [bloqueado, email],
  );
  if (!r.rowCount) {
    console.log("Usuario nao encontrado:", email);
  } else {
    console.log("OK:", r.rows[0]);
  }
} catch (e) {
  console.error("ERR:", e.message);
} finally {
  await pool.end();
}
