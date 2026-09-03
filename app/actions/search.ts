'use server';

import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';

export type SearchHit = {
  id: string;
  kind: 'Staff' | 'News' | 'Service' | 'Task' | 'Submission';
  title: string;
  subtitle: string;
  href: string;
};

/**
 * Global search for the top bar.
 *
 * Scoped to what the signed-in person is allowed to see: staff records and the
 * review queue are manager/admin only, everyone can find news and services, and
 * tasks are limited to the viewer's own unless they manage.
 */
export async function globalSearch(rawQuery: string): Promise<SearchHit[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const q = rawQuery.trim();
  if (q.length < 2) return [];

  const isManager = user.role === 'manager' || user.role === 'admin';
  const contains = { contains: q };

  const [news, services, tasks, staff, timesheets] = await Promise.all([
    prisma.newsPost.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [{ title: contains }, { excerpt: contains }],
      },
      select: { id: true, slug: true, title: true, publishedAt: true },
      take: 5,
    }),

    prisma.scheduledService.findMany({
      where: { OR: [{ title: contains }, { location: contains }] },
      select: { id: true, title: true, date: true, location: true },
      orderBy: { date: 'desc' },
      take: 5,
    }),

    prisma.task.findMany({
      where: {
        AND: [
          { OR: [{ title: contains }, { detail: contains }] },
          isManager ? {} : { assigneeId: user.id },
        ],
      },
      select: { id: true, title: true, dueDate: true, status: true },
      orderBy: { dueDate: 'desc' },
      take: 5,
    }),

    isManager
      ? prisma.user.findMany({
          where: {
            OR: [{ name: contains }, { email: contains }, { title: contains }],
          },
          select: { id: true, name: true, email: true, title: true },
          take: 5,
        })
      : Promise.resolve([]),

    isManager
      ? prisma.timesheet.findMany({
          where: { submitter: { OR: [{ name: contains }, { email: contains }] } },
          select: { id: true, status: true, date: true, submitter: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        })
      : Promise.resolve([]),
  ]);

  const hits: SearchHit[] = [
    ...staff.map(u => ({
      id: u.id,
      kind: 'Staff' as const,
      title: u.name ?? u.email,
      subtitle: u.title ?? u.email,
      href: '/manager/staff',
    })),
    ...services.map(s => ({
      id: s.id,
      kind: 'Service' as const,
      title: s.title,
      subtitle: [s.date, s.location].filter(Boolean).join(' · '),
      href: `/service/${s.id}`,
    })),
    ...tasks.map(t => ({
      id: t.id,
      kind: 'Task' as const,
      title: t.title,
      subtitle: `${t.status === 'DONE' ? 'Done' : 'Open'} · due ${t.dueDate}`,
      href: isManager ? '/manager/tasks' : '/employee/dashboard',
    })),
    ...news.map(n => ({
      id: n.id,
      kind: 'News' as const,
      title: n.title,
      subtitle: 'Company news',
      href: `/news/${n.slug}`,
    })),
    ...timesheets.map(t => ({
      id: t.id,
      kind: 'Submission' as const,
      title: `Timesheet — ${t.submitter.name ?? 'Unknown'}`,
      subtitle: String(t.status).toLowerCase(),
      href: '/manager/timesheets',
    })),
  ];

  return hits.slice(0, 12);
}
