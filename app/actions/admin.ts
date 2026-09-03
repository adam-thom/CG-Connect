'use server';

import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { ROUTABLE_FORMS } from '@/lib/forms';

const EMPTY = {
  staff: 0,
  documents: 0,
  tags: 0,
  publishedNews: 0,
  draftNews: 0,
  unroutedForms: 0,
};

/**
 * Headline numbers for the admin console, in one round trip rather than five.
 * `unroutedForms` is the one that matters: a form type with no routing rule has
 * nobody assigned to review it, which is worth surfacing rather than hiding.
 */
export async function fetchAdminOverview() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return EMPTY;

  const [staff, documents, tags, publishedNews, draftNews, routings] = await Promise.all([
    prisma.user.count(),
    prisma.document.count(),
    prisma.tag.count(),
    prisma.newsPost.count({ where: { status: 'PUBLISHED' } }),
    prisma.newsPost.count({ where: { status: 'DRAFT' } }),
    prisma.formRouting.findMany({ include: { _count: { select: { tags: true } } } }),
  ]);

  const routedKeys = new Set(routings.filter(r => r._count.tags > 0).map(r => r.formType));
  const unroutedForms = ROUTABLE_FORMS.filter(f => !routedKeys.has(f.key)).length;

  return { staff, documents, tags, publishedNews, draftNews, unroutedForms };
}
