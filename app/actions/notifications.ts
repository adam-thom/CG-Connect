'use server';

import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

/**
 * Records a notification. Called from wherever a decision is made, so the
 * person it affects finds out without having to go looking.
 *
 * Deliberately swallows its own failures: a notification is never important
 * enough to fail the action that triggered it.
 */
export async function notify(input: {
  recipientId: string;
  title: string;
  body?: string;
  href?: string;
  kind?: 'SUBMISSION' | 'TASK' | 'NEWS';
}) {
  try {
    await prisma.notification.create({
      data: {
        recipientId: input.recipientId,
        title: input.title,
        body: input.body ?? null,
        href: input.href ?? null,
        kind: input.kind ?? 'SUBMISSION',
      },
    });
  } catch (e) {
    console.error('Could not record notification', e);
  }
}

/** Fan-out for company-wide announcements. */
export async function notifyEveryone(input: {
  title: string;
  body?: string;
  href?: string;
  kind?: 'SUBMISSION' | 'TASK' | 'NEWS';
  exceptUserId?: string;
}) {
  try {
    const users = await prisma.user.findMany({ select: { id: true } });
    await prisma.notification.createMany({
      data: users
        .filter(u => u.id !== input.exceptUserId)
        .map(u => ({
          recipientId: u.id,
          title: input.title,
          body: input.body ?? null,
          href: input.href ?? null,
          kind: input.kind ?? 'NEWS',
        })),
    });
  } catch (e) {
    console.error('Could not record notifications', e);
  }
}

export async function fetchMyNotifications() {
  const user = await getSessionUser();
  if (!user) return { items: [], unread: 0 };

  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.notification.count({ where: { recipientId: user.id, readAt: null } }),
  ]);

  return { items, unread };
}

export async function markNotificationRead(id: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.notification.updateMany({
    where: { id, recipientId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  return { success: true };
}

export async function markAllNotificationsRead() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.notification.updateMany({
    where: { recipientId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath('/');
  return { success: true };
}
