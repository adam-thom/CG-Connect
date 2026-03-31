'use server';

import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function submitFormAction(formType: string, prevState: any, formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    return { error: 'Authentication required' };
  }

  // 1. Determine the logical Target Manager tags based on the Employee's tags
  const targetTagNames = new Set<string>();
  
  // Base routing derived from Employee tags
  const userTagNames = user.tags.map(t => t.name);
  if (userTagNames.includes('MB Employee')) targetTagNames.add('MB Manager');
  if (userTagNames.includes('CSG Employee')) targetTagNames.add('CSG Manager');
  if (userTagNames.includes('EVG Employee')) targetTagNames.add('EVG Manager');
  if (userTagNames.includes('EDENS Employee')) targetTagNames.add('EDENS Manager');

  // Specific Form Type Additions (Overlaying Routing logic globally)
  if (formType === 'transfer') {
    targetTagNames.add('TRANSFER Manager');
  }
  if (formType === 'incident') {
    targetTagNames.add('OHS Manager');
  }

  // Find the exact Tag IDs from the DB natively
  const tagsToConnect = await prisma.tag.findMany({
    where: { name: { in: Array.from(targetTagNames) } },
    select: { id: true }
  });

  const assignedTagsConnect = tagsToConnect.map(t => ({ id: t.id }));

  try {
    if (formType === 'timesheet') {
      await prisma.timesheet.create({
        data: {
          submitterId: user.id,
          assignedTags: { connect: assignedTagsConnect },
          date: formData.get('date') ? new Date(formData.get('date') as string) : null,
          timeIn: formData.get('timeIn') as string || null,
          timeOut: formData.get('timeOut') as string || null,
          lunchHour: formData.get('lunch') ? parseFloat(formData.get('lunch') as string) : null,
          overTime: formData.get('ot') ? parseFloat(formData.get('ot') as string) : null,
          transferTime: formData.get('transferTime') ? parseFloat(formData.get('transferTime') as string) : null,
          totalHours: formData.get('total') ? parseFloat(formData.get('total') as string) : null,
        }
      });
    } else if (formType === 'transfer') {
      await prisma.transferRecord.create({
        data: {
          submitterId: user.id,
          assignedTags: { connect: assignedTagsConnect },
          date: formData.get('date') ? new Date(formData.get('date') as string) : null,
          time: formData.get('time') as string || null,
          team: formData.get('team') as string || null,
          transferType: formData.get('transferType') as string || null,
          deceasedName: formData.get('deceasedName') as string || null,
          placeOfDeath: formData.get('placeOfDeath') as string || null,
          nokName: formData.get('nokName') as string || null,
          nokRelation: formData.get('nokRelation') as string || null,
          nokContact: formData.get('nokContact') as string || null,
          constName: formData.get('constName') as string || null,
          constNumber: formData.get('constNumber') as string || null,
          meName: formData.get('meName') as string || null,
          twoStaffApproved: formData.get('twoStaffApproved') as string || null,
          notes: formData.get('notes') as string || null,
        }
      });
    } else if (formType === 'incident') {
      await prisma.incidentReport.create({
        data: {
          submitterId: user.id,
          assignedTags: { connect: assignedTagsConnect },
          incidentDate: formData.get('incidentDate') ? new Date(formData.get('incidentDate') as string) : null,
          incidentLocation: formData.get('incidentLocation') as string || null,
          nature: formData.get('nature') as string || null,
          notes: formData.get('notes') as string || null,
          certified: formData.get('certified') ? 'Yes' : null,
        }
      });
    }
  } catch (error) {
    console.error('Submission Error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Database crash', 
      success: false 
    };
  }

  // Next.js convention: return Success context, let hook trigger redirect to bypass nested try-catch routing errors!
  return { error: '', success: true };
}

// =========================================================================
// UNIFIED SUBMISSION QUEUES & ROUTING
// =========================================================================

export async function fetchMySubmissions() {
  const user = await getSessionUser();
  if (!user) return [];

  // Parallel fetch across all schemas
  const [timesheets, transfers, incidents] = await Promise.all([
    prisma.timesheet.findMany({ where: { submitterId: user.id }, orderBy: { createdAt: 'desc' } }),
    prisma.transferRecord.findMany({ where: { submitterId: user.id }, orderBy: { createdAt: 'desc' } }),
    prisma.incidentReport.findMany({ where: { submitterId: user.id }, orderBy: { createdAt: 'desc' } })
  ]);

  const unified = [
    ...timesheets.map(t => ({ id: t.id, type: 'timesheet', status: t.status as any, submitterId: t.submitterId, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...transfers.map(t => ({ id: t.id, type: 'transfer', status: t.status as any, submitterId: t.submitterId, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...incidents.map(t => ({ id: t.id, type: 'incident', status: t.status as any, submitterId: t.submitterId, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t }))
  ];

  return unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function fetchManagerQueue() {
  const user = await getSessionUser();
  if (!user || user.role !== 'manager') return [];

  const managerTagNames = user.tags.map(t => t.name);

  // We find Submissions that are connected to ANY of the manager's tags.
  // Prisma relation filtering: assignedTags: { some: { name: { in: managerTagNames } } }
  
  const [timesheets, transfers, incidents] = await Promise.all([
    prisma.timesheet.findMany({
      where: { assignedTags: { some: { name: { in: managerTagNames } } } },
      include: { submitter: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.transferRecord.findMany({
      where: { assignedTags: { some: { name: { in: managerTagNames } } } },
      include: { submitter: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.incidentReport.findMany({
      where: { assignedTags: { some: { name: { in: managerTagNames } } } },
      include: { submitter: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const unified = [
    ...timesheets.map(t => ({ id: t.id, type: 'timesheet', status: t.status.toLowerCase() as any, submitterId: t.submitterId, submitterName: t.submitter.name || t.submitter.email, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...transfers.map(t => ({ id: t.id, type: 'transfer', status: t.status.toLowerCase() as any, submitterId: t.submitterId, submitterName: t.submitter.name || t.submitter.email, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...incidents.map(t => ({ id: t.id, type: 'incident', status: t.status.toLowerCase() as any, submitterId: t.submitterId, submitterName: t.submitter.name || t.submitter.email, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t }))
  ];

  return unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function fetchSubmissionById(id: string) {
  // Determine which table it lives in dynamically based on ID signature if we customized them, 
  // OR just gracefully attempt to query the native CUID against all 3.
  const [timesheet, transfer, incident] = await Promise.all([
    prisma.timesheet.findUnique({ where: { id } }),
    prisma.transferRecord.findUnique({ where: { id } }),
    prisma.incidentReport.findUnique({ where: { id } })
  ]);

  if (timesheet) return { id: timesheet.id, type: 'timesheet', status: timesheet.status.toLowerCase(), submitterId: timesheet.submitterId, createdAt: timesheet.createdAt.toISOString(), updatedAt: timesheet.updatedAt.toISOString(), data: timesheet, feedbackThread: [] };
  if (transfer) return { id: transfer.id, type: 'transfer', status: transfer.status.toLowerCase(), submitterId: transfer.submitterId, createdAt: transfer.createdAt.toISOString(), updatedAt: transfer.updatedAt.toISOString(), data: transfer, feedbackThread: [] };
  if (incident) return { id: incident.id, type: 'incident', status: incident.status.toLowerCase(), submitterId: incident.submitterId, createdAt: incident.createdAt.toISOString(), updatedAt: incident.updatedAt.toISOString(), data: incident, feedbackThread: [] };
  
  return null;
}

export async function updateSubmissionStatusAdmin(id: string, type: string, newStatus: string) {
  const user = await getSessionUser();
  if (!user || user.role !== 'manager') throw new Error("Unauthorized Access");

  let result;
  // Prisma uppercase enums are mapped back here safely
  const formattedStatus = newStatus.toUpperCase();

  switch(type) {
    case 'timesheet':
      result = await prisma.timesheet.update({ where: { id }, data: { status: formattedStatus }}); break;
    case 'transfer':
      result = await prisma.transferRecord.update({ where: { id }, data: { status: formattedStatus }}); break;
    case 'incident':
      result = await prisma.incidentReport.update({ where: { id }, data: { status: formattedStatus }}); break;
    default:
      throw new Error("Invalid formulation routing parameter.");
  }
  
  return { success: true };
}
