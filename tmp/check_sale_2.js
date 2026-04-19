const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sale = await prisma.vendas.findUnique({
    where: { Id: 2 }
  });
  if (sale) {
    console.log('Venda encontrada:', sale);
  } else {
    console.log('Venda ID 2 não existe no banco de dados.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
