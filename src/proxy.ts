import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Ignora rotas /api, arquivos internos do next e assets estáticos (imagens em /public)
  matcher: ['/((?!api|_next/static|_next/image|images|.*\\.png$).*)'],
};
