const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Connecting to database...");
    const userCount = await prisma.user.count();
    console.log(`Connection successful! Total users in database: ${userCount}`);
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        onboarded: true,
        createdAt: true
      },
      take: 10
    });
    console.log("First 10 users:", users);
  } catch (err) {
    console.error("Database connection failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
