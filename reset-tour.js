const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.updateMany({ data: { tourCompleted: false } });
  console.log("Tour reset for all users");
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
