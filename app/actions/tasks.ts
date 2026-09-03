'use server';

import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { notify } from '@/app/actions/notifications';

const PRIORITIES = ['NORMAL', 'HIGH'] as const;

async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

async function requireManager() {
  const user = await requireUser();
  if (user.role !== 'manager' && user.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return user;
}

function revalidateDashboards() {
  revalidatePath('/employee/dashboard');
  revalidatePath('/manager/dashboard');
  revalidatePath('/manager/tasks');
}

/**
 * A person's day.
 *
 * `scope` decides which services come back:
 *  - "mine" (staff): only services this person is rostered on.
 *  - "team" (managers): every service running that day, with their own roles
 *    still marked. A manager's day is mostly other people's work, so showing
 *    only their own roster would hide the thing they actually need to see.
 *
 * Tasks are always the viewer's own; `teamTaskCount` gives managers a count of
 * what is still open across everyone without listing it all here.
 */
export async function fetchMyDay(dateKey: string, scope: 'mine' | 'team' = 'mine') {
  const user = await requireUser();
  const isManager = user.role === 'manager' || user.role === 'admin';
  const wantsTeam = scope === 'team' && isManager;

  const [tasks, services, teamTaskCount] = await Promise.all([
    prisma.task.findMany({
      where: {
        assigneeId: user.id,
        OR: [
          { status: 'OPEN', dueDate: { lte: dateKey } },
          { status: 'DONE', dueDate: dateKey },
        ],
      },
      include: { assignedBy: { select: { name: true } } },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { dueDate: 'asc' }],
    }),
    prisma.scheduledService.findMany({
      where: { date: dateKey },
      include: { assignments: true },
      orderBy: { time: 'asc' },
    }),
    wantsTeam
      ? prisma.task.count({
          where: { status: 'OPEN', dueDate: { lte: dateKey }, NOT: { assigneeId: user.id } },
        })
      : Promise.resolve(0),
  ]);

  // ServiceRoleAssignment stores the staff member's name rather than a user id,
  // so this matches on name. Worth revisiting if two people ever share one.
  const name = user.name ?? '';
  const shaped = services.map(s => ({
    id: s.id,
    title: s.title,
    date: s.date,
    time: s.time,
    location: s.location,
    myRoles: s.assignments.filter(a => a.staffName === name).map(a => a.roleName),
    rosterSize: s.assignments.length,
  }));

  return {
    tasks,
    services: wantsTeam ? shaped : shaped.filter(s => s.myRoles.length > 0),
    teamTaskCount,
    scope: wantsTeam ? ('team' as const) : ('mine' as const),
    today: dateKey,
  };
}

export async function setTaskStatus(id: string, done: boolean) {
  const user = await requireUser();

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new Error('We could not find that task.');

  // A person may tick off their own work; managers may tick off anyone's.
  const isMine = task.assigneeId === user.id;
  const isManager = user.role === 'manager' || user.role === 'admin';
  if (!isMine && !isManager) throw new Error('Unauthorized');

  await prisma.task.update({
    where: { id },
    data: {
      status: done ? 'DONE' : 'OPEN',
      completedAt: done ? new Date() : null,
    },
  });

  revalidateDashboards();
  return { success: true };
}

export async function createTask(input: {
  title: string;
  detail?: string;
  dueDate: string;
  assigneeId: string;
  priority?: string;
}) {
  try {
    const manager = await requireManager();

    const title = input.title.trim();
    if (!title) return { success: false, error: 'Please give the task a title.' };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) {
      return { success: false, error: 'Please choose a date for the task.' };
    }
    if (!input.assigneeId) {
      return { success: false, error: 'Please choose who the task is for.' };
    }

    const priority = PRIORITIES.includes(input.priority as never)
      ? (input.priority as string)
      : 'NORMAL';

    await prisma.task.create({
      data: {
        title,
        detail: input.detail?.trim() || null,
        dueDate: input.dueDate,
        assigneeId: input.assigneeId,
        assignedById: manager.id,
        priority,
      },
    });

    // Do not make someone discover their own task by chance.
    if (input.assigneeId !== manager.id) {
      await notify({
        recipientId: input.assigneeId,
        kind: 'TASK',
        title: priority === 'HIGH' ? `Priority task for ${input.dueDate}` : `New task for ${input.dueDate}`,
        body: title,
        href: '/employee/dashboard',
      });
    }

    revalidateDashboards();
    return { success: true };
  } catch {
    return { success: false, error: 'Something went wrong on our end. Please try again.' };
  }
}

export async function deleteTask(id: string) {
  await requireManager();
  await prisma.task.delete({ where: { id } });
  revalidateDashboards();
  return { success: true };
}

/** Everything the manager's team has on, for a given day. */
export async function fetchTeamTasks(dateKey: string) {
  await requireManager();
  return prisma.task.findMany({
    where: {
      OR: [
        { status: 'OPEN', dueDate: { lte: dateKey } },
        { dueDate: dateKey },
      ],
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      assignedBy: { select: { name: true } },
    },
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { priority: 'desc' }],
  });
}

/** People a task can be given to. */
export async function fetchAssignableStaff() {
  await requireManager();
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, title: true },
    orderBy: { name: 'asc' },
  });
}
