import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login', // Redireciona usuários deslogados para cá
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtecting = nextUrl.pathname.startsWith('/home'); // Qualquer página /home pra frente precisa de login
      
      if (isProtecting) {
        if (isLoggedIn) return true;
        return false; // Redireciona para /login
      } else if (isLoggedIn) {
        const isAuthRoute = nextUrl.pathname === '/login' || nextUrl.pathname === '/cadastro';
        if (isAuthRoute) {
          return Response.redirect(new URL('/home', nextUrl)); // Manda usuários já logados da tela de login para a Home
        }
      }
      return true;
    },
  },
  providers: [], // Adicionado vazio para evitar erro no Edge middleware
} satisfies NextAuthConfig;
