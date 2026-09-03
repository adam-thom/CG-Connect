import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

/**
 * Where the data lives.
 *
 * Locally this is a SQLite file. A deployment cannot use one: the filesystem
 * is read-only and is discarded between invocations, so a file URL there means
 * every request either fails or talks to an empty database that vanishes.
 *
 * The libSQL adapter speaks to hosted Turso over the same protocol, so a
 * deployment only needs DATABASE_URL pointing at libsql://… plus the auth
 * token that goes with it.
 */
const url = process.env.DATABASE_URL || 'file:./dev.db';
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;

/*
 * Fail loudly rather than serving an empty database that vanishes.
 *
 * Scoped to a real deployment: `next build` runs locally with
 * NODE_ENV=production too, and a local build against the dev file is normal.
 * On Vercel the check applies during the build as well, so a missing
 * DATABASE_URL is caught before anything is promoted.
 */
const isBuildStep = process.env.NEXT_PHASE === 'phase-production-build';
const isDeployed =
  process.env.VERCEL === '1' || (process.env.NODE_ENV === 'production' && !isBuildStep);

if (isDeployed && url.startsWith('file:')) {
  throw new Error(
    'DATABASE_URL points at a local file, which cannot work on a serverless ' +
      'host. Set it to a hosted libSQL URL (libsql://…) with TURSO_AUTH_TOKEN.'
  );
}

const prismaClientSingleton = () => {
  const adapter = new PrismaLibSql(authToken ? { url, authToken } : { url });
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
