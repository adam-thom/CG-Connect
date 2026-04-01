import prisma from './lib/db';

async function check() {
  try {
    const docs = await prisma.document.findMany({
      include: { category: true, visibilityTags: true }
    });
    console.log("Documents:", docs.length);
    console.dir(docs, { depth: null });
  } catch (e) {
    console.error(e);
  }
}
check();
