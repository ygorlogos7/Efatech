const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const situacoes = await prisma.vendaSituacao.findMany();
  console.log(JSON.stringify(situacoes, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
