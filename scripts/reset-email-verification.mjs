import { readFileSync } from "fs";
import pg from "pg";

const env = readFileSync(".env", "utf8");
const dbUrl = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.replace(/^"|"$/g, "");
const email = (process.argv[2] || "matheusnonatosa7@gmail.com").trim().toLowerCase();

const pool = new pg.Pool({ connectionString: dbUrl });

try {
  const r = await pool.query(
    `UPDATE "Usuarios"
     SET "EmailVerificado" = false, "EmailVerificadoEm" = NULL
     WHERE LOWER("Email") = LOWER($1)
     RETURNING "Id", "Email", "EmailVerificado"`,
    [email],
  );
  if (!r.rowCount) {
    console.log("Nenhum usuario encontrado para:", email);
  } else {
    console.log("Reset OK:", r.rows[0]);
  }
} catch (e) {
  console.error("ERR:", e.message);
} finally {
  await pool.end();
}
