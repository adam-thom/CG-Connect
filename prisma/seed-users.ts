import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Users with Passwords...');

  const defaultPassword = 'password123';
  const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

  // Note: These arrays correspond to realistic tag names we seeded earlier
  const users = [
    {
      id: "EMP-001",
      name: "Sarah Jenkins",
      email: "sarah@caring.com",
      role: "employee",
      department: "Operations",
      title: "Funeral Director",
      passwordHash: hashedPassword,
      tags: {
        connect: [{ name: "MB Employee" }, { name: "FUNERAL DIRECTOR" }] 
        // Note: FUNERAL DIRECTOR isn't explicitly in the 8 tags we seeded earlier 
        // but was in MOCK_USERS assignedRoles. Let's just create it on the fly if needed.
      }
    },
    {
      id: "MGR-001",
      name: "Elena Moretti",
      email: "elena@caring.com",
      role: "manager",
      department: "Administration",
      title: "Regional Director",
      passwordHash: hashedPassword,
      tags: {
        connect: [{ name: "REGIONAL Manager - South" }, { name: "OHS Manager" }, { name: "MB Manager" }]
      }
    },
    {
      id: "ADM-001",
      name: "Admin User",
      email: "admin@caring.com",
      role: "admin",
      department: "IT",
      title: "System Administrator",
      passwordHash: hashedPassword,
      tags: {
        connect: [{ name: "ADMIN" }, { name: "IT Department" }]
      }
    }
  ];

  for (const u of users) {
    // Upsert any tags just in case
    for (const tag of u.tags.connect) {
      await prisma.tag.upsert({
        where: { name: tag.name },
        update: {},
        create: { name: tag.name, type: u.role === 'manager' ? 'MANAGER' : u.role === 'employee' ? 'EMPLOYEE' : 'ADDITIONAL'}
      });
    }

    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash: u.passwordHash,
        tags: u.tags
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        title: u.title,
        passwordHash: u.passwordHash,
        tags: u.tags
      }
    });

    console.log(`Created/Updated User: ${u.email} : ${defaultPassword}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
