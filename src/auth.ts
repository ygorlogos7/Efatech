import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // Validação básica se preencheu
        if (!credentials?.email || !credentials?.senha) {
          return null;
        }

        // Busca o usuário pelo e-mail com E maiusculo no banco do C#
        const user = await prisma.usuarios.findFirst({
          where: { Email: credentials.email as string }
        });

        if (!user) return null;

        // Bate a senha descriptografando o hash
        const passwordsMatch = await bcrypt.compare(
          credentials.senha as string,
          user.Senha
        );

        if (passwordsMatch) {
          // Se sucesso, retorna o objeto padrão pro NextAuth salvar na sessão (cookie)
          return { id: String(user.Id), email: user.Email, name: user.Nome };
        }

        return null;
      },
    }),
  ],
  session: { strategy: 'jwt' }
});
