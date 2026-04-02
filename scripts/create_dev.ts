import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as bcrypt from 'bcryptjs';

const prismaClientSingleton = () => {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || 'file:./dev.db',
  });
  return new PrismaClient({ adapter });
};

const prisma = prismaClientSingleton();

async function main() {
  const passwordHash = await bcrypt.hash('Developer', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'dev@caringroup.com' },
    update: {
      passwordHash,
      role: 'admin',
      name: 'Developer',
    },
    create: {
      email: 'dev@caringroup.com',
      passwordHash,
      role: 'admin',
      name: 'Developer',
    },
  });

  console.log('Dev user created:', user);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
