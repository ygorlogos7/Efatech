const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const venda = await prisma.vendas.findFirst({
    where: { Numero: 170 },
    include: {
      Itens: {
        include: {
          Produtos: true
        }
      }
    }
  });
  console.log(JSON.stringify(venda, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
