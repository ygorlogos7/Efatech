import { readFileSync } from "fs";
import pg from "pg";

const env = readFileSync(".env", "utf8");
const dbUrl = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.replace(/^"|"$/g, "");
if (!dbUrl) {
  console.error("DATABASE_URL not found in .env");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl });
const email = "matheusnonatosa7@gmail.com";

try {
  const cols = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'Usuarios'
    ORDER BY ordinal_position
  `);
  console.log("Columns on Usuarios:");
  for (const r of cols.rows) console.log(" -", r.column_name, r.data_type);

  const test = await pool.query(
    `SELECT "EmailVerificado" FROM "Usuarios" WHERE "Email" = $1 LIMIT 1`,
    [email],
  );
  console.log("Query OK:", test.rows);
} catch (e) {
  console.error("Query FAIL:", e.message);
} finally {
  await pool.end();
}
