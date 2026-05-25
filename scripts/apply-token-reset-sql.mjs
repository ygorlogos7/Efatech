import { readFileSync } from "fs";
import pg from "pg";

const env = readFileSync(".env", "utf8");
const dbUrl = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.replace(/^"|"$/g, "");
const sql = readFileSync("scripts/sql/add-token-reset-senha.sql", "utf8");
const pool = new pg.Pool({ connectionString: dbUrl });

try {
  await pool.query(sql);
  console.log("OK: TokenResetSenha criada/verificada no banco.");
} finally {
  await pool.end();
}
