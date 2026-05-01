const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.caixaSessao.findMany({
    take: 5,
    orderBy: { DataAbertura: 'desc' }
  });
  console.log('Total sessions:', sessions.length);
  console.log('Sample:', JSON.stringify(sessions, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
