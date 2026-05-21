import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login', // Redireciona usuários deslogados para cá
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn =
        !!auth?.user && auth?.error !== "SessionRevoked";
      const pathname = nextUrl.pathname;

      const publicPaths = new Set([
        "/",
        "/login",
        "/cadastro",
        "/esqueci-senha",
        "/redefinir-senha",
      ]);

      const isPublic =
        publicPaths.has(pathname) ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/images");

      const isProtecting = !isPublic;

      if (isProtecting) {
        if (isLoggedIn) return true;
        return false;
      }

      if (isLoggedIn) {
        const isAuthRoute =
          pathname === "/login" ||
          pathname === "/cadastro" ||
          pathname === "/esqueci-senha";
        if (isAuthRoute) {
          return Response.redirect(new URL("/home", nextUrl));
        }
      }

      return true;
    },
  },
  providers: [], // Adicionado vazio para evitar erro no Edge middleware
} satisfies NextAuthConfig;
