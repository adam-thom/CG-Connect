'use server';

import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';

// =========================================================================
// STATUS NORMALIZATION
// Convention: DB stores UPPERCASE ("PENDING", "APPROVED", "REVISION-REQUIRED")
//             App/UI uses lowercase ("pending", "approved", "revision-required")
// =========================================================================
const toDbStatus = (s: string) => s.toUpperCase();
const toAppStatus = (s: string) => s.toLowerCase();

// =========================================================================
// FORM SUBMISSION (Employee)
// =========================================================================
export async function submitFormAction(formType: string, prevState: any, formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    return { error: 'Authentication required' };
  }

  // 1. Determine the logical Target Manager tags based on the Employee's tags
  const targetTagNames = new Set<string>();
  
  // Base routing derived from selected form Location, or fallback to Employee tags
  const location = formData.get('location') as string;
  if (location === 'MB') targetTagNames.add('MB Manager');
  if (location === 'CSG') targetTagNames.add('CSG Manager');
  if (location === 'EVG') targetTagNames.add('EVG Manager');
  if (location === 'EDENS') targetTagNames.add('EDENS Manager');

  if (!location) {
    const userTagNames = user.tags.map(t => t.name);
    if (userTagNames.includes('MB Employee')) targetTagNames.add('MB Manager');
    if (userTagNames.includes('CSG Employee')) targetTagNames.add('CSG Manager');
    if (userTagNames.includes('EVG Employee')) targetTagNames.add('EVG Manager');
    if (userTagNames.includes('EDENS Employee')) targetTagNames.add('EDENS Manager');
  }

  // Specific Form Type Additions (Overlaying Routing logic globally)
  if (formType === 'transfer') {
    targetTagNames.add('TRANSFER Manager');
  }
  if (formType === 'incident') {
    targetTagNames.add('OHS Manager');
  }
  if (formType === 'snow-log') {
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
          status: user.role === 'manager' || user.role === 'admin' ? 'APPROVED' : 'PENDING'
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
          
          callerName: formData.get('callerName') as string || null,
          callerPhone: formData.get('callerPhone') as string || null,
          funeralDirectorAssigning: formData.get('funeralDirectorAssigning') as string || null,
          destination: formData.get('destination') as string || null,
          
          deceasedName: formData.get('deceasedName') as string || null,
          deceasedAge: formData.get('deceasedAge') as string || null,
          deceasedSex: formData.get('deceasedSex') as string || null,
          deceasedDob: formData.get('deceasedDob') ? new Date(formData.get('deceasedDob') as string) : null,
          deceasedDod: formData.get('deceasedDod') ? new Date(formData.get('deceasedDod') as string) : null,
          placeOfDeath: formData.get('placeOfDeath') as string || null,
          
          valuables: formData.get('valuables') as string || null,
          
          nokName: formData.get('nokName') as string || null,
          nokRelation: formData.get('nokRelation') as string || null,
          nokContact: formData.get('nokContact') as string || null,
          
          specialInstructions: formData.get('specialInstructions') as string || null,
          medicalExaminerName: formData.get('medicalExaminerName') as string || null,
          dateToME: formData.get('dateToME') ? new Date(formData.get('dateToME') as string) : null,
          
          constName: formData.get('constName') as string || null,
          constNumber: formData.get('constNumber') as string || null,
          
          timeLeftMB: formData.get('timeLeftMB') as string || null,
          arriveScene: formData.get('arriveScene') as string || null,
          departScene: formData.get('departScene') as string || null,
          arriveHospital: formData.get('arriveHospital') as string || null,
          mileageOut: formData.get('mileageOut') as string || null,
          mileageReturn: formData.get('mileageReturn') as string || null,
          totalMileage: formData.get('totalMileage') as string || null,
          
          twoStaffApproved: formData.get('twoStaffApproved') as string || null,
          notes: formData.get('notes') as string || null,
          status: user.role === 'manager' || user.role === 'admin' ? 'APPROVED' : 'PENDING'
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
          status: 'PENDING' // Incidents ALWAYS default to pending
        }
      });
    } else if (formType === 'time-off') {
      await prisma.timeOffRequest.create({
        data: {
          submitterId: user.id,
          assignedTags: { connect: assignedTagsConnect },
          startDate: formData.get('startDate') ? new Date(formData.get('startDate') as string) : new Date(),
          endDate: formData.get('endDate') ? new Date(formData.get('endDate') as string) : new Date(),
          reason: formData.get('reason') as string || null,
          status: user.role === 'manager' || user.role === 'admin' ? 'APPROVED' : 'PENDING'
        }
      });
    } else if (formType === 'snow-log') {
      await prisma.snowRemovalLog.create({
        data: {
          submitterId: user.id,
          assignedTags: { connect: assignedTagsConnect },
          date: formData.get('date') ? new Date(formData.get('date') as string) : null,
          snowRemovalRequired: formData.get('snowRemovalRequired') as string || null,
          iceSalt: formData.get('iceSalt') as string || null,
          manualShoveling: formData.get('manualShoveling') as string || null,
          contractedPlow: formData.get('contractedPlow') as string || null,
          iceBreaking: formData.get('iceBreaking') as string || null,
          notes: formData.get('notes') as string || null,
          status: 'PENDING'
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
  const [timesheets, transfers, incidents, timeOffs, snowLogs] = await Promise.all([
    prisma.timesheet.findMany({ where: { submitterId: user.id }, orderBy: { createdAt: 'desc' } }),
    prisma.transferRecord.findMany({ where: { submitterId: user.id }, orderBy: { createdAt: 'desc' } }),
    prisma.incidentReport.findMany({ where: { submitterId: user.id }, orderBy: { createdAt: 'desc' } }),
    prisma.timeOffRequest.findMany({ where: { submitterId: user.id }, orderBy: { createdAt: 'desc' } }),
    prisma.snowRemovalLog.findMany({ where: { submitterId: user.id }, orderBy: { createdAt: 'desc' } })
  ]);

  const unified = [
    ...timesheets.map(t => ({ id: t.id, type: 'timesheet', status: toAppStatus(t.status), submitterId: t.submitterId, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...transfers.map(t => ({ id: t.id, type: 'transfer', status: toAppStatus(t.status), submitterId: t.submitterId, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...incidents.map(t => ({ id: t.id, type: 'incident', status: toAppStatus(t.status), submitterId: t.submitterId, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...timeOffs.map(t => ({ id: t.id, type: 'time-off', status: toAppStatus(t.status), submitterId: t.submitterId, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...snowLogs.map(t => ({ id: t.id, type: 'snow-log', status: toAppStatus(t.status), submitterId: t.submitterId, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t }))
  ];

  return unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function fetchManagerQueue() {
  const user = await getSessionUser();
  if (!user || user.role !== 'manager') return [];

  const managerTagNames = user.tags.map(t => t.name);

  // We find Submissions that are connected to ANY of the manager's tags.
  // Prisma relation filtering: assignedTags: { some: { name: { in: managerTagNames } } }
  
  const isDevAccount = user.email === 'dev@caringroup.com';
  const assignedTagsQuery = isDevAccount 
    ? {} 
    : { assignedTags: { some: { name: { in: managerTagNames } } } };

  const [timesheets, transfers, incidents, timeOffs, snowLogs] = await Promise.all([
    prisma.timesheet.findMany({
      where: assignedTagsQuery,
      include: { submitter: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.transferRecord.findMany({
      where: assignedTagsQuery,
      include: { submitter: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.incidentReport.findMany({
      where: assignedTagsQuery,
      include: { submitter: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.timeOffRequest.findMany({
      where: assignedTagsQuery,
      include: { submitter: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.snowRemovalLog.findMany({
      where: assignedTagsQuery,
      include: { submitter: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const unified = [
    ...timesheets.map(t => ({ id: t.id, type: 'timesheet', status: toAppStatus(t.status), submitterId: t.submitterId, submitterName: t.submitter.name || t.submitter.email, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...transfers.map(t => ({ id: t.id, type: 'transfer', status: toAppStatus(t.status), submitterId: t.submitterId, submitterName: t.submitter.name || t.submitter.email, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...incidents.map(t => ({ id: t.id, type: 'incident', status: toAppStatus(t.status), submitterId: t.submitterId, submitterName: t.submitter.name || t.submitter.email, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...timeOffs.map(t => ({ id: t.id, type: 'time-off', status: toAppStatus(t.status), submitterId: t.submitterId, submitterName: t.submitter.name || t.submitter.email, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...snowLogs.map(t => ({ id: t.id, type: 'snow-log', status: toAppStatus(t.status), submitterId: t.submitterId, submitterName: t.submitter.name || t.submitter.email, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t }))
  ];
  return unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function fetchAdminQueue() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return [];

  const [timesheets, transfers, incidents, timeOffs, snowLogs, capexRequests] = await Promise.all([
    prisma.timesheet.findMany({ include: { submitter: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }}),
    prisma.transferRecord.findMany({ include: { submitter: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }}),
    prisma.incidentReport.findMany({ include: { submitter: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }}),
    prisma.timeOffRequest.findMany({ include: { submitter: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }}),
    prisma.snowRemovalLog.findMany({ include: { submitter: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }}),
    prisma.capExRequest.findMany({ include: { submitter: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }})
  ]);

  const unified = [
    ...timesheets.map(t => ({ id: t.id, type: 'timesheet', status: toAppStatus(t.status), submitterId: t.submitterId, submitterName: t.submitter.name || t.submitter.email, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...transfers.map(t => ({ id: t.id, type: 'transfer', status: toAppStatus(t.status), submitterId: t.submitterId, submitterName: t.submitter.name || t.submitter.email, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...incidents.map(t => ({ id: t.id, type: 'incident', status: toAppStatus(t.status), submitterId: t.submitterId, submitterName: t.submitter.name || t.submitter.email, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...timeOffs.map(t => ({ id: t.id, type: 'time-off', status: toAppStatus(t.status), submitterId: t.submitterId, submitterName: t.submitter.name || t.submitter.email, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...snowLogs.map(t => ({ id: t.id, type: 'snow-log', status: toAppStatus(t.status), submitterId: t.submitterId, submitterName: t.submitter.name || t.submitter.email, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t })),
    ...capexRequests.map(t => ({ id: t.id, type: 'capex', status: toAppStatus(t.status), submitterId: t.submitterId, submitterName: t.submitter.name || t.submitter.email, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(), data: t }))
  ];

  return unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
// =========================================================================
// FETCH FULL SUBMISSION (with comments + submitter name)
// =========================================================================

type CommentWithAuthor = {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorRole: string;
};

type FullSubmission = {
  id: string;
  type: string;
  status: string;
  submitterId: string;
  submitterName: string;
  createdAt: string;
  updatedAt: string;
  data: Record<string, any>;
  comments: CommentWithAuthor[];
};

function serializeComment(c: any): CommentWithAuthor {
  return {
    id: c.id,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    authorId: c.authorId,
    authorName: c.author?.name || c.author?.email || c.authorId,
    authorRole: c.author?.role || 'employee',
  };
}

export async function fetchSubmissionById(id: string): Promise<FullSubmission | null> {
  const submitterSelect = { select: { name: true, email: true } };
  const commentInclude = { include: { author: { select: { name: true, email: true, role: true } } }, orderBy: { createdAt: 'asc' } as const };

  const [timesheet, transfer, incident, timeOff, snowLog] = await Promise.all([
    prisma.timesheet.findUnique({
      where: { id },
      include: { submitter: submitterSelect, comments: commentInclude }
    }),
    prisma.transferRecord.findUnique({
      where: { id },
      include: { submitter: submitterSelect, comments: commentInclude }
    }),
    prisma.incidentReport.findUnique({
      where: { id },
      include: { submitter: submitterSelect, comments: commentInclude }
    }),
    prisma.timeOffRequest.findUnique({
      where: { id },
      include: { submitter: submitterSelect, comments: commentInclude }
    }),
    prisma.snowRemovalLog.findUnique({
      where: { id },
      include: { submitter: submitterSelect, comments: commentInclude }
    }),
  ]);

  if (timesheet) {
    const { submitter, comments, id: _id, submitterId, status, createdAt, updatedAt, ...fields } = timesheet;
    return {
      id: _id, type: 'timesheet', status: toAppStatus(status), submitterId,
      submitterName: submitter.name || submitter.email,
      createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString(),
      data: { date: fields.date?.toISOString() ?? null, timeIn: fields.timeIn, timeOut: fields.timeOut, lunchHour: fields.lunchHour, overTime: fields.overTime, transferTime: fields.transferTime, totalHours: fields.totalHours },
      comments: comments.map(serializeComment),
    };
  }

  if (transfer) {
    const { submitter, comments, id: _id, submitterId, status, createdAt, updatedAt, ...fields } = transfer;
    return {
      id: _id, type: 'transfer', status: toAppStatus(status), submitterId,
      submitterName: submitter.name || submitter.email,
      createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString(),
      data: { 
        ...fields,
        date: fields.date?.toISOString() ?? null,
        deceasedDob: fields.deceasedDob?.toISOString() ?? null,
        deceasedDod: fields.deceasedDod?.toISOString() ?? null,
        dateToME: fields.dateToME?.toISOString() ?? null,
      },
      comments: comments.map(serializeComment),
    };
  }

  if (incident) {
    const { submitter, comments, id: _id, submitterId, status, createdAt, updatedAt, ...fields } = incident;
    return {
      id: _id, type: 'incident', status: toAppStatus(status), submitterId,
      submitterName: submitter.name || submitter.email,
      createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString(),
      data: { incidentDate: fields.incidentDate?.toISOString() ?? null, incidentLocation: fields.incidentLocation, nature: fields.nature, notes: fields.notes, certified: fields.certified },
      comments: comments.map(serializeComment),
    };
  }

  if (timeOff) {
    const { submitter, comments, id: _id, submitterId, status, createdAt, updatedAt, ...fields } = timeOff;
    return {
      id: _id, type: 'time-off', status: toAppStatus(status), submitterId,
      submitterName: submitter.name || submitter.email,
      createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString(),
      data: { startDate: fields.startDate?.toISOString() || null, endDate: fields.endDate?.toISOString() || null, reason: fields.reason },
      comments: comments.map(serializeComment),
    };
  }

  if (snowLog) {
    const { submitter, comments, id: _id, submitterId, status, createdAt, updatedAt, ...fields } = snowLog;
    return {
      id: _id, type: 'snow-log', status: toAppStatus(status), submitterId,
      submitterName: submitter.name || submitter.email,
      createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString(),
      data: { 
        ...fields, 
        date: fields.date?.toISOString() ?? null 
      },
      comments: comments.map(serializeComment),
    };
  }

  return null;
}

// =========================================================================
// COMMENTS
// =========================================================================

export async function addComment(submissionId: string, type: string, content: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Authentication required');
  if (!content.trim()) throw new Error('Comment cannot be empty');

  const linkField: Record<string, { connect: { id: string } }> = {};
  switch (type) {
    case 'timesheet': linkField.timesheet = { connect: { id: submissionId } }; break;
    case 'transfer': linkField.transferRecord = { connect: { id: submissionId } }; break;
    case 'incident': linkField.incidentReport = { connect: { id: submissionId } }; break;
    case 'time-off': linkField.timeOffRequest = { connect: { id: submissionId } }; break;
    case 'snow-log': linkField.snowRemovalLog = { connect: { id: submissionId } }; break;
    default: throw new Error('Invalid submission type');
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      author: { connect: { id: user.id } },
      ...linkField,
    },
    include: { author: { select: { name: true, email: true, role: true } } }
  });

  return serializeComment(comment);
}

// =========================================================================
// EMPLOYEE EDIT (only when REVISION-REQUIRED)
// =========================================================================

export async function updateSubmissionData(id: string, type: string, fields: FormData) {
  const user = await getSessionUser();
  if (!user) throw new Error('Authentication required');

  // Verify ownership & that the status allows edits
  const lockedStatuses = ['APPROVED', 'FINALIZED'];

  switch (type) {
    case 'timesheet': {
      const record = await prisma.timesheet.findUnique({ where: { id }, select: { submitterId: true, status: true } });
      if (!record) throw new Error('Record not found');
      if (record.submitterId !== user.id) throw new Error('Unauthorized');
      if (lockedStatuses.includes(record.status)) throw new Error('This submission is locked and cannot be edited.');
      await prisma.timesheet.update({
        where: { id },
        data: {
          date: fields.get('date') ? new Date(fields.get('date') as string) : null,
          timeIn: fields.get('timeIn') as string || null,
          timeOut: fields.get('timeOut') as string || null,
          lunchHour: fields.get('lunch') ? parseFloat(fields.get('lunch') as string) : null,
          overTime: fields.get('ot') ? parseFloat(fields.get('ot') as string) : null,
          transferTime: fields.get('transferTime') ? parseFloat(fields.get('transferTime') as string) : null,
          totalHours: fields.get('total') ? parseFloat(fields.get('total') as string) : null,
          status: 'PENDING', // Reset to pending after an employee edit
        }
      });
      break;
    }
    case 'transfer': {
      const record = await prisma.transferRecord.findUnique({ where: { id }, select: { submitterId: true, status: true } });
      if (!record) throw new Error('Record not found');
      if (record.submitterId !== user.id) throw new Error('Unauthorized');
      if (lockedStatuses.includes(record.status)) throw new Error('This submission is locked and cannot be edited.');
      await prisma.transferRecord.update({
        where: { id },
        data: {
          date: fields.get('date') ? new Date(fields.get('date') as string) : null,
          time: fields.get('time') as string || null,
          team: fields.get('team') as string || null,
          transferType: fields.get('transferType') as string || null,
          
          callerName: fields.get('callerName') as string || null,
          callerPhone: fields.get('callerPhone') as string || null,
          funeralDirectorAssigning: fields.get('funeralDirectorAssigning') as string || null,
          destination: fields.get('destination') as string || null,
          
          deceasedName: fields.get('deceasedName') as string || null,
          deceasedAge: fields.get('deceasedAge') as string || null,
          deceasedSex: fields.get('deceasedSex') as string || null,
          deceasedDob: fields.get('deceasedDob') ? new Date(fields.get('deceasedDob') as string) : null,
          deceasedDod: fields.get('deceasedDod') ? new Date(fields.get('deceasedDod') as string) : null,
          placeOfDeath: fields.get('placeOfDeath') as string || null,
          
          valuables: fields.get('valuables') as string || null,
          
          nokName: fields.get('nokName') as string || null,
          nokRelation: fields.get('nokRelation') as string || null,
          nokContact: fields.get('nokContact') as string || null,
          
          specialInstructions: fields.get('specialInstructions') as string || null,
          medicalExaminerName: fields.get('medicalExaminerName') as string || null,
          dateToME: fields.get('dateToME') ? new Date(fields.get('dateToME') as string) : null,
          
          constName: fields.get('constName') as string || null,
          constNumber: fields.get('constNumber') as string || null,
          
          timeLeftMB: fields.get('timeLeftMB') as string || null,
          arriveScene: fields.get('arriveScene') as string || null,
          departScene: fields.get('departScene') as string || null,
          arriveHospital: fields.get('arriveHospital') as string || null,
          mileageOut: fields.get('mileageOut') as string || null,
          mileageReturn: fields.get('mileageReturn') as string || null,
          totalMileage: fields.get('totalMileage') as string || null,
          
          twoStaffApproved: fields.get('twoStaffApproved') as string || null,
          notes: fields.get('notes') as string || null,
          status: 'PENDING',
        }
      });
      break;
    }
    case 'incident': {
      const record = await prisma.incidentReport.findUnique({ where: { id }, select: { submitterId: true, status: true } });
      if (!record) throw new Error('Record not found');
      if (record.submitterId !== user.id) throw new Error('Unauthorized');
      if (lockedStatuses.includes(record.status)) throw new Error('This submission is locked and cannot be edited.');
      await prisma.incidentReport.update({
        where: { id },
        data: {
          incidentDate: fields.get('incidentDate') ? new Date(fields.get('incidentDate') as string) : null,
          incidentLocation: fields.get('incidentLocation') as string || null,
          nature: fields.get('nature') as string || null,
          notes: fields.get('notes') as string || null,
          certified: fields.get('certified') ? 'Yes' : null,
          status: 'PENDING',
        }
      });
      break;
    }
    case 'time-off': {
      const record = await prisma.timeOffRequest.findUnique({ where: { id }, select: { submitterId: true, status: true } });
      if (!record) throw new Error('Record not found');
      if (record.submitterId !== user.id) throw new Error('Unauthorized');
      if (lockedStatuses.includes(record.status)) throw new Error('This submission is locked and cannot be edited.');
      await prisma.timeOffRequest.update({
        where: { id },
        data: {
          startDate: fields.get('startDate') ? new Date(fields.get('startDate') as string) : new Date(),
          endDate: fields.get('endDate') ? new Date(fields.get('endDate') as string) : new Date(),
          reason: fields.get('reason') as string || null,
          status: user.role === 'manager' || user.role === 'admin' ? 'APPROVED' : 'PENDING',
        }
      });
      break;
    }
    case 'snow-log': {
      const record = await prisma.snowRemovalLog.findUnique({ where: { id }, select: { submitterId: true, status: true } });
      if (!record) throw new Error('Record not found');
      if (record.submitterId !== user.id) throw new Error('Unauthorized');
      if (lockedStatuses.includes(record.status)) throw new Error('This submission is locked and cannot be edited.');
      await prisma.snowRemovalLog.update({
        where: { id },
        data: {
          date: fields.get('date') ? new Date(fields.get('date') as string) : null,
          snowRemovalRequired: fields.get('snowRemovalRequired') as string || null,
          iceSalt: fields.get('iceSalt') as string || null,
          manualShoveling: fields.get('manualShoveling') as string || null,
          contractedPlow: fields.get('contractedPlow') as string || null,
          iceBreaking: fields.get('iceBreaking') as string || null,
          notes: fields.get('notes') as string || null,
          status: 'PENDING',
        }
      });
      break;
    }
    default:
      throw new Error('Invalid submission type');
  }

  return { success: true };
}

// =========================================================================
// MANAGER / ADMIN STATUS UPDATE
// =========================================================================

export async function updateSubmissionStatus(id: string, type: string, newStatus: string) {
  const user = await getSessionUser();
  if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
    throw new Error('Unauthorized');
  }

  const dbStatus = toDbStatus(newStatus);

  switch (type) {
    case 'timesheet':
      await prisma.timesheet.update({ where: { id }, data: { status: dbStatus } }); break;
    case 'transfer':
      await prisma.transferRecord.update({ where: { id }, data: { status: dbStatus } }); break;
    case 'incident':
      await prisma.incidentReport.update({ where: { id }, data: { status: dbStatus } }); break;
    case 'time-off':
      await prisma.timeOffRequest.update({ where: { id }, data: { status: dbStatus } }); break;
    case 'snow-log':
      await prisma.snowRemovalLog.update({ where: { id }, data: { status: dbStatus } }); break;
    default:
      throw new Error('Invalid submission type');
  }

  return { success: true, newStatus: toAppStatus(dbStatus) };
}

// Keep the old name as an alias for any existing references
export { updateSubmissionStatus as updateSubmissionStatusAdmin };

// =========================================================================
// FETCH ALL APPROVED TIME OFF (For Scheduling)
// =========================================================================
export async function fetchAllApprovedTimeOffs() {
  const user = await getSessionUser();
  if (!user) return [];

  const timeOffs = await prisma.timeOffRequest.findMany({
    where: { status: 'APPROVED' },
    include: {
      submitter: {
        select: { id: true, name: true }
      }
    }
  });

  return timeOffs.map(t => ({
    id: t.id,
    userId: t.submitterId,
    userName: t.submitter.name,
    startDate: t.startDate?.toISOString().split('T')[0] || '',
    endDate: t.endDate?.toISOString().split('T')[0] || ''
  }));
}
