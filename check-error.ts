import prisma from './lib/db';

async function checkCrash() {
  const dev = await prisma.user.findUnique({
    where: { email: 'dev@caringroup.com' },
    select: { id: true, tags: true }
  });

  try {
    const tagsToConnect = await prisma.tag.findMany({
      where: { name: { in: ['OHS Manager'] } },
      select: { id: true }
    });

    const assignedTagsConnect = tagsToConnect.map(t => ({ id: t.id }));

    const log = await prisma.snowRemovalLog.create({
      data: {
        submitterId: dev!.id,
        assignedTags: { connect: assignedTagsConnect },
        date: new Date(),
        snowRemovalRequired: 'Yes',
        iceSalt: 'Yes',
        manualShoveling: null,
        contractedPlow: null,
        iceBreaking: 'Yes',
        notes: 'Test note',
        status: 'PENDING'
      }
    });

    console.log("Success! Created log:", log.id);
  } catch (err) {
    console.error("Crash!", err);
  }
}

checkCrash().finally(() => prisma.$disconnect());
