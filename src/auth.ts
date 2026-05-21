import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SESSION_MAX_AGE = 60 * 60 * 8;
/** Renova o JWT periodicamente (rotação de sessão enquanto o usuário está ativo). */
const SESSION_UPDATE_AGE = 60 * 60;

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          return null;
        }

        const normalizedEmail = String(credentials.email).trim().toLowerCase();

        const user = await prisma.usuarios.findFirst({
          where: { Email: normalizedEmail },
          select: {
            Id: true,
            Nome: true,
            Email: true,
            Senha: true,
            SessaoVersao: true,
          },
        });

        if (!user) return null;

        const passwordsMatch = await bcrypt.compare(
          credentials.senha as string,
          user.Senha
        );

        if (passwordsMatch) {
          return {
            id: String(user.Id),
            email: user.Email,
            name: user.Nome,
            sessaoVersao: user.SessaoVersao,
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: SESSION_UPDATE_AGE,
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.sessaoVersao = user.sessaoVersao ?? 0;
        delete token.error;
      }

      if (token.sub && !user) {
        const dbUser = await prisma.usuarios.findUnique({
          where: { Id: Number(token.sub) },
          select: { SessaoVersao: true },
        });

        if (!dbUser || token.sessaoVersao !== dbUser.SessaoVersao) {
          token.error = "SessionRevoked";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.error === "SessionRevoked") {
        return {
          ...session,
          user: undefined,
          expires: new Date(0).toISOString(),
          error: "SessionRevoked",
        };
      }

      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
});
