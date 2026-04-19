const { PrismaClient } = require('./src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAndCreateUser() {
  try {
    console.log('Checking for test user...');
    
    // Check if test user exists
    const existingUser = await prisma.usuarios.findFirst({
      where: { Email: 'teste@efatech.com' }
    });
    
    if (existingUser) {
      console.log('Test user found:', existingUser);
      
      // Check if password matches
      const passwordMatch = await bcrypt.compare('Teste@1234', existingUser.Senha);
      console.log('Password matches:', passwordMatch);
      
      if (!passwordMatch) {
        console.log('Updating password...');
        const hashedPassword = await bcrypt.hash('Teste@1234', 10);
        await prisma.usuarios.update({
          where: { Id: existingUser.Id },
          data: { Senha: hashedPassword }
        });
        console.log('Password updated successfully');
      }
    } else {
      console.log('Test user not found, creating...');
      
      const hashedPassword = await bcrypt.hash('Teste@1234', 10);
      const newUser = await prisma.usuarios.create({
        data: {
          Nome: 'Admin',
          Email: 'teste@efatech.com',
          Senha: hashedPassword,
          Telefone: '(11) 99999-9999',
          Celular: '(11) 99999-9999'
        }
      });
      
      console.log('Test user created:', newUser);
    }
    
    // List all users
    const allUsers = await prisma.usuarios.findMany();
    console.log('All users in database:', allUsers.length);
    allUsers.forEach(user => {
      console.log(`- ${user.Nome} (${user.Email})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateUser();