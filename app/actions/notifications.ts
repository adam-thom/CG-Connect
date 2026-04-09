'use server';

import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';

// =========================================================================
// INTERNAL NOTIFICATION DISPATCH (Not exposed directly to client calls)
// =========================================================================

export async function createNotification(userId: string, title: string, message: string, href?: string) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        href,
      }
    });
  } catch (e) {
    console.error("Failed to create notification for user", userId, e);
  }
}

// Helper to batch alert managers based on an array of `Tag` names
export async function notifyManagersByTags(tagNames: string[], title: string, message: string, href?: string) {
  try {
    // Find all users who either explicitly have the tag, or have a matching role string in tags schema
    const targetUsers = await prisma.user.findMany({
      where: {
        OR: [
          { tags: { some: { name: { in: tagNames } } } },
          { email: 'dev@caringroup.com' }, // Dev always gets everything
        ]
      },
      select: { id: true }
    });

    const uniqueUserIds = Array.from(new Set(targetUsers.map(u => u.id)));

    // Create notifications concurrently
    await Promise.all(uniqueUserIds.map(uid => 
      createNotification(uid, title, message, href)
    ));
  } catch (e) {
    console.error("Failed to notify managers", e);
  }
}

// =========================================================================
// CLIENT INTERFACES
// =========================================================================

export async function fetchMyNotifications() {
  const user = await getSessionUser();
  if (!user) return [];

  const notes = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50 // Limit historical fetch
  });

  return notes.map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    href: n.href,
    read: n.read,
    createdAt: n.createdAt.toISOString()
  }));
}

export async function markNotificationRead(id: string) {
  const user = await getSessionUser();
  if (!user) return { success: false };

  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { read: true }
  });

  return { success: true };
}

export async function markAllNotificationsRead() {
  const user = await getSessionUser();
  if (!user) return { success: false };

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true }
  });

  return { success: true };
}
