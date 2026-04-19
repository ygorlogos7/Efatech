import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();
async function main() {
  await prisma.clientes.create({
    data: { Nome: 'TESTE', TipoCliente: 'Fisica', CPFCNPJ: '48637271863', Telefone: '', Ativo: true, VendedorResponsavel: 'Admin', PermitirExcederLimite: false }
  });
  console.log("Inserido.");
}
main().catch(console.error).finally(() => process.exit(0));
