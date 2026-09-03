const { PrismaClient } = require('../src/generated/prisma');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const bcrypt = require('bcryptjs');

const adapter = new PrismaLibSql({
  url: 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const elena = await prisma.user.upsert({
    where: { email: 'elena@caring.com' },
    update: {},
    create: {
      id: 'MGR-001',
      email: 'elena@caring.com',
      name: 'Elena Moretti',
      role: 'manager',
      department: 'Administration',
      title: 'Regional Director',
      passwordHash: passwordHash
    },
  });

  console.log('Seed successful:', elena.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
