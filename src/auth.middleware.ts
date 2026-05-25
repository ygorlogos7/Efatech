import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/** Middleware/proxy: sem Prisma — compativel com Edge (NextAuth + /api/auth/csrf). */
export const { auth: proxyAuth } = NextAuth(authConfig);
