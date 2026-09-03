/**
 * Dev seed: a handful of published company news posts so the dashboard feed
 * has something to lay out. Images come from the brand photo library, already
 * resized into public/uploads/news.
 *
 *   node prisma/seed_news.js
 */
const { createClient } = require('@libsql/client');

const db = createClient({ url: process.env.DATABASE_URL || 'file:./dev.db' });
const SEED_PREFIX = 'seed-news-';

const POSTS = [
  {
    slug: 'autumn-remembrance-service',
    title: 'Autumn Remembrance Service, 18 October',
    excerpt:
      'Families we have served this year are invited to the annual remembrance service at the Evergreen chapel. Staff from every location are welcome to attend.',
    body:
      'The Autumn Remembrance Service brings together the families we have walked beside this year.\n\nIt is held at the Evergreen chapel at 2:00 PM on Saturday 18 October. There will be readings, music, and a candle lit for each name.\n\nIf you would like to attend, let your location manager know by 10 October so we can set out enough seating.',
    mediaType: 'ARTICLE',
    imageUrl: '/uploads/news/sample-1.webp',
    imageWidth: 1200, imageHeight: 800,
    pinned: 1,
    daysAgo: 1,
  },
  {
    slug: 'welcoming-the-edens-team',
    title: 'Welcoming the Edens team to the group',
    excerpt:
      'Edens Funeral Home joined The Caring Group this month. Here is a short introduction to the people you will be working alongside.',
    body:
      'Edens Funeral Home has served its community since 1962, and this month it became part of The Caring Group.\n\nNothing changes for the families they look after. For us, it means four new colleagues, a fourth chapel, and a second transfer vehicle available to the region.\n\nYou will meet the team at the next all-locations meeting.',
    mediaType: 'ARTICLE',
    imageUrl: '/uploads/news/sample-2.webp',
    imageWidth: 1200, imageHeight: 1500,
    pinned: 0,
    daysAgo: 6,
  },
  {
    slug: 'a-walkthrough-of-the-new-transfer-vehicle',
    title: 'A walkthrough of the new transfer vehicle',
    excerpt:
      'A short video tour of the equipment, the loading procedure, and where everything is stowed. Worth five minutes before your next transfer.',
    body:
      'The new transfer vehicle is in service from Monday.\n\nThis walkthrough covers the equipment on board, the loading procedure for two-person transfers, and where each item is stowed.\n\nPlease watch it before your first transfer in the new vehicle.',
    mediaType: 'VIDEO',
    videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    imageUrl: '/uploads/news/sample-3.webp',
    imageWidth: 1200, imageHeight: 675,
    pinned: 0,
    daysAgo: 12,
  },
  {
    slug: 'updated-family-care-handbook',
    title: 'Updated family care handbook',
    excerpt:
      'The handbook has been revised with new guidance on first contact, arranging with a family remotely, and aftercare in the weeks that follow.',
    body:
      'The family care handbook has been revised for the first time since 2023.\n\nThe changes cover first contact, arranging with a family who cannot travel, and what aftercare looks like in the weeks that follow.\n\nThe full document is in the Document Vault. Please read the sections that apply to your role.',
    mediaType: 'RESOURCE',
    resourceUrl: '/employee/docs',
    imageUrl: '/uploads/news/sample-4.webp',
    imageWidth: 1200, imageHeight: 1200,
    pinned: 0,
    daysAgo: 20,
  },
  {
    slug: 'winter-on-call-rota-is-open',
    title: 'Winter on-call rota is open for requests',
    excerpt:
      'Preferences for the December and January on-call rota close on 15 November. Put your requests in with your location manager.',
    body:
      'The winter on-call rota covers 1 December to 31 January.\n\nPreferences close on 15 November. After that the rota is set by your location manager and published in the Dept Schedule.\n\nIf you have a fixed commitment over the period, please raise it early rather than swapping later.',
    mediaType: 'ARTICLE',
    imageUrl: null,
    pinned: 0,
    daysAgo: 27,
  },
];

async function main() {
  const author = await db.execute({
    sql: 'select id from User where role = ? limit 1',
    args: ['admin'],
  });
  const authorId = author.rows.length ? author.rows[0].id : null;

  await db.execute({ sql: 'delete from NewsPost where id like ?', args: [SEED_PREFIX + '%'] });

  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const published = new Date(Date.now() - p.daysAgo * 86400000).toISOString();
    await db.execute({
      sql: `insert into NewsPost
              (id, slug, title, excerpt, body, mediaType, imageUrl, videoUrl, resourceUrl,
               imageWidth, imageHeight, status, publishedAt, pinned, authorId, createdAt, updatedAt)
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', ?, ?, ?, ?, ?)`,
      args: [
        SEED_PREFIX + (i + 1),
        p.slug,
        p.title,
        p.excerpt,
        p.body,
        p.mediaType,
        p.imageUrl ?? null,
        p.videoUrl ?? null,
        p.resourceUrl ?? null,
        p.imageWidth ?? null,
        p.imageHeight ?? null,
        published,
        p.pinned,
        authorId,
        published,
        published,
      ],
    });
  }

  console.log('Seeded ' + POSTS.length + ' published news posts.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
