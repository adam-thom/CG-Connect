"use server";

import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

/**
 * DAILY LINEUP (DAY-LEVEL NOTES)
 */
export async function getDailyLineup(date: string) {
  try {
    return await prisma.dailyLineup.findUnique({
      where: { date }
    });
  } catch (error) {
    console.error("Error fetching daily lineup:", error);
    return null;
  }
}

export async function saveDailyNotes(date: string, notes: string) {
  try {
    const lineup = await prisma.dailyLineup.upsert({
      where: { date },
      update: { notes },
      create: { date, notes },
    });
    revalidatePath("/manager/lineup");
    return { success: true, id: lineup.id };
  } catch (error) {
    console.error("Error saving daily notes:", error);
    return { success: false, error: "Failed to save notes" };
  }
}

export async function getAllServices() {
  try {
    return await prisma.scheduledService.findMany({
      orderBy: { date: 'asc' }
    });
  } catch (error) {
    console.error("Error fetching all services:", error);
    return [];
  }
}

export async function getServicesForDate(date: string) {
  try {
    return await prisma.scheduledService.findMany({
      where: { date },
      include: { assignments: true },
      orderBy: { time: 'asc' }
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

/**
 * Every service in a month, with its roster. The calendars query by month so
 * paging back and forth costs one round trip per month rather than one per day.
 */
export async function getServicesForMonth(start: string, end: string) {
  try {
    return await prisma.scheduledService.findMany({
      where: { date: { gte: start, lte: end } },
      include: { assignments: true },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
  } catch (error) {
    console.error("Error fetching services for month:", error);
    return [];
  }
}

/**
 * One service with its full roster, plus that day's directives. Readable by any
 * signed-in member of staff: the roster is what tells someone who they are
 * working alongside.
 */
export async function fetchServiceDetail(id: string) {
  const user = await getSessionUser();
  if (!user) return null;

  const service = await prisma.scheduledService.findUnique({
    where: { id },
    include: { assignments: { orderBy: { createdAt: 'asc' } } },
  });
  if (!service) return null;

  const lineup = await prisma.dailyLineup.findUnique({ where: { date: service.date } });

  // Other services that same day, so a person can see the shape of the day.
  const sameDay = await prisma.scheduledService.findMany({
    where: { date: service.date, NOT: { id } },
    orderBy: { time: 'asc' },
    select: { id: true, title: true, time: true, location: true },
  });

  return {
    service,
    notes: lineup?.notes ?? null,
    sameDay,
    viewerName: user.name ?? '',
  };
}

export async function createService(data: {
  title: string;
  date: string;
  time?: string;
  location?: string;
}) {
  try {
    const service = await prisma.scheduledService.create({
      data: {
        title: data.title,
        date: data.date,
        time: data.time || null,
        location: data.location || null,
      }
    });
    revalidatePath("/manager/schedule");
    revalidatePath("/manager/lineup");
    return { success: true, service };
  } catch (error) {
    console.error("Error creating service:", error);
    return { success: false, error: "Failed to create service" };
  }
}

export async function deleteService(id: string) {
  try {
    await prisma.scheduledService.delete({
      where: { id }
    });
    revalidatePath("/manager/schedule");
    revalidatePath("/manager/lineup");
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { success: false, error: "Failed to delete service" };
  }
}

/**
 * SERVICE ASSIGNMENTS (LINEUP DETAILS)
 */
export async function saveServiceAssignments(serviceId: string, assignments: { roleName: string; staffName: string }[]) {
  try {
    // Transactional sync: Delete and recreate
    await prisma.$transaction([
      prisma.serviceRoleAssignment.deleteMany({
        where: { serviceId }
      }),
      prisma.serviceRoleAssignment.createMany({
        data: assignments.map(a => ({
          serviceId,
          roleName: a.roleName,
          staffName: a.staffName
        }))
      })
    ]);
    
    revalidatePath("/manager/lineup");
    return { success: true };
  } catch (error) {
    console.error("Error saving assignments:", error);
    // Fallback if createMany has issues with LibSQL/SQLite versions
    try {
        await prisma.serviceRoleAssignment.deleteMany({ where: { serviceId } });
        for (const a of assignments) {
            await prisma.serviceRoleAssignment.create({
                data: { serviceId, roleName: a.roleName, staffName: a.staffName }
            });
        }
        revalidatePath("/manager/lineup");
        return { success: true };
    } catch (innerError) {
        return { success: false, error: "Failed to sync roster" };
    }
  }
}
