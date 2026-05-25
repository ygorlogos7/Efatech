import { readFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const env = readFileSync(".env", "utf8");
const dbUrl = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.replace(/^"|"$/g, "");
const pool = new pg.Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const email = "matheusnonatosa7@gmail.com";

try {
  const rows = await prisma.$queryRaw`
    SELECT "EmailVerificado" FROM "Usuarios" WHERE "Email" = ${email} LIMIT 1
  `;
  console.log("Prisma $queryRaw OK:", rows);
} catch (e) {
  console.error("FAIL:", e);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
