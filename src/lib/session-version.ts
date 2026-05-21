import { prisma } from "@/lib/prisma";

/** Invalida todas as sessões JWT do usuário (incrementa versão no banco). */
export async function bumpSessionVersion(userId: number) {
  return prisma.usuarios.update({
    where: { Id: userId },
    data: { SessaoVersao: { increment: 1 } },
    select: { SessaoVersao: true },
  });
}
