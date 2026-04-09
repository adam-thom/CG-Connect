import prisma from '../lib/db';
async function main() {
  await prisma.comment.deleteMany({ where: { capExRequestId: { not: null } } });
  await prisma.capExRequest.deleteMany({});
  await prisma.locationBudget.deleteMany({});
  console.log("Wiped all legacy CapEx and Budget Data");
}
main().catch(console.error).finally(() => prisma.$disconnect());
