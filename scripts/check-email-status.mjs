import { readFileSync } from "fs";
import pg from "pg";

const env = readFileSync(".env", "utf8");
const dbUrl = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.replace(/^"|"$/g, "");
const email = process.argv[2] || "matheusnonatosa7@gmail.com";

const pool = new pg.Pool({ connectionString: dbUrl });

try {
  const r = await pool.query(
    `SELECT "Id", "Email", "EmailVerificado", "EmailVerificadoEm"
     FROM "Usuarios" WHERE LOWER("Email") = LOWER($1)`,
    [email],
  );
  console.log(JSON.stringify(r.rows, null, 2));
} catch (e) {
  console.error("ERR:", e.message);
} finally {
  await pool.end();
}
