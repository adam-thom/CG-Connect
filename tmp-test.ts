import { PrismaClient } from './src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function run() {
  try {
    const user = await prisma.user.findFirst({
        where: { email: 'sarah@caring.com' }
    });
    console.log("Found User ID:", user?.id);

    const result = await prisma.transferRecord.create({
      data: {
        submitterId: user!.id,
        assignedTags: { connect: [] },
        date: null,
        time: null,
        team: null,
        transferType: null,
        deceasedName: null,
        placeOfDeath: null,
        nokName: null,
        nokRelation: null,
        nokContact: null,
        constName: null,
        constNumber: null,
        meName: null,
        twoStaffApproved: null,
        notes: null,
      }
    });

    console.log("Success!", result);
  } catch (err: any) {
    console.error("Prisma Error:", err.message);
  } finally {
    process.exit(0);
  }
}

run();
