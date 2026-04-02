import prisma from './lib/db';

async function check() {
  const dev = await prisma.user.findUnique({
    where: { email: 'dev@caringroup.com' },
    select: { id: true }
  });

  const logs = await prisma.snowRemovalLog.findMany({
    where: { submitterId: dev?.id },
    include: { assignedTags: true }
  });

  console.log("Dev snow logs:", JSON.stringify(logs, null, 2));

  // Check if OHS Manager tag exists!
  const ohsTag = await prisma.tag.findUnique({ where: { name: 'OHS Manager' } });
  console.log("OHS Manager tag exists?", !!ohsTag);

  // Check standard tags
  const tags = await prisma.tag.findMany();
  console.log("All tags:", tags.map(t => t.name));
}

check().finally(() => prisma.$disconnect());
