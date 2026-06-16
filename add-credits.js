const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@search1.kg' }
  });
  
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { paidCredits: 500 }
    });
    console.log('Successfully added 500 paidCredits to test@search1.kg');
  } else {
    console.log('User test@search1.kg not found');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
