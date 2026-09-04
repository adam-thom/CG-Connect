/*
 * Prepares an empty database for first use.
 *
 * Run once after `prisma db push` has created the tables. It seeds the tag
 * vocabulary the routing rules depend on, and creates a single administrator
 * so somebody can sign in and set up everyone else.
 *
 * Plain JavaScript on purpose: the .ts seeds need a TypeScript runner that is
 * not a dependency of this project, and the other .js seeds hardcode the local
 * SQLite file, so none of them can reach a hosted database.
 *
 * Idempotent. Running it twice changes nothing and never resets a password.
 *
 *   DATABASE_URL="libsql://<db>.turso.io" \
 *   TURSO_AUTH_TOKEN="..." \
 *   ADMIN_EMAIL="you@caringroup.com" \
 *   ADMIN_PASSWORD="..." \
 *   node prisma/bootstrap.js
 */
const { PrismaClient } = require('../src/generated/prisma');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const bcrypt = require('bcryptjs');

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;

if (!url) {
  console.error('Set DATABASE_URL to the database you want to prepare.');
  process.exit(1);
}

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';

if (!email || !password) {
  console.error(
    'Set ADMIN_EMAIL and ADMIN_PASSWORD. This account is the way into the\n' +
      'portal, so the password is yours to choose rather than something\n' +
      'written down in this repository.'
  );
  process.exit(1);
}

// The demo password is in the repo and in this conversation. It must never be
// what protects a real administrator account.
if (password.length < 12 || /^password/i.test(password)) {
  console.error(
    'That password is too weak or is one of the demo passwords. Use at least\n' +
      '12 characters that are not used anywhere else.'
  );
  process.exit(1);
}

const MANAGER_TAGS = [
  'MB Manager',
  'CSG Manager',
  'EVG Manager',
  'EDENS Manager',
  'TRANSFER Manager',
  'OHS Manager',
  'REGIONAL Manager - South',
  'REGIONAL Manager - North',
];

const EMPLOYEE_TAGS = [
  'MB Employee',
  'CSG Employee',
  'EVG Employee',
  'EDENS Employee',
  'TRANSFER Employee',
  'PART TIME Employee',
];

const ADDITIONAL_TAGS = ['ADMIN', 'IT Department'];

const prisma = new PrismaClient({
  adapter: new PrismaLibSql(authToken ? { url, authToken } : { url }),
});

async function main() {
  const groups = [
    [MANAGER_TAGS, 'MANAGER'],
    [EMPLOYEE_TAGS, 'EMPLOYEE'],
    [ADDITIONAL_TAGS, 'ADDITIONAL'],
  ];

  let tagCount = 0;
  for (const [names, type] of groups) {
    for (const name of names) {
      await prisma.tag.upsert({ where: { name }, update: {}, create: { name, type } });
      tagCount += 1;
    }
  }
  console.log(`Tags ready (${tagCount}).`);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`${email} already exists — left exactly as it was.`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: process.env.ADMIN_NAME || 'Administrator',
      role: 'admin',
      department: 'Administration',
      title: 'System Administrator',
      passwordHash: await bcrypt.hash(password, 10),
      tags: { connect: [{ name: 'ADMIN' }] },
    },
  });

  console.log(`Administrator created: ${user.email}`);
  console.log('Sign in with that address, then add everyone else from Staff Directory.');
}

main()
  .catch(e => {
    console.error('Bootstrap failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
