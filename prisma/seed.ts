import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const managerTags = [
    "MB Manager", "CSG Manager", "EVG Manager", "EDENS Manager", 
    "TRANSFER Manager", "OHS Manager", "REGIONAL Manager - South", "REGIONAL Manager - North"
  ];
  const employeeTags = [
    "MB Employee", "CSG Employee", "EVG Employee", "EDENS Employee", 
    "TRANSFER Employee", "PART TIME Employee"
  ];
  const additionalTags = ["ADMIN", "IT Department"];

  console.log("Seeding tags...");

  for (const name of managerTags) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name, type: "MANAGER" }
    });
  }

  for (const name of employeeTags) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name, type: "EMPLOYEE" }
    });
  }

  for (const name of additionalTags) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name, type: "ADDITIONAL" }
    });
  }
  console.log("Tags seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
