const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.usuarios.findMany();
  console.log('Total de usuários:', users.length);
  users.forEach(u => {
    console.log(`ID: ${u.Id}, Nome: ${u.Nome}, Email: ${u.Email}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
