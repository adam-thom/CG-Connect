'use server';

import prisma from '@/lib/db';
import { notify } from '@/app/actions/notifications';
import { routingTagIdsFor } from '@/app/actions/tags';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function submitFormAction(formType: string, prevState: any, formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    return { error: 'Authentication required' };
  }

  /*
   * Who reviews this record.
   *
   * Two sources, unioned:
   *  1. The rules an admin set in Form routing, read now and copied onto the
   *     record so a later rule change never rewrites who this one went to.
   *  2. Location routing derived from the submitter's own tags — an
   *     "<X> Employee" files to "<X> Manager". This keeps records reaching the
   *     right location even before any rules have been configured.
   */
  const configuredTagIds = await routingTagIdsFor(formType);

  const derivedTagNames = user.tags
    .filter(t => t.type === 'EMPLOYEE' && /Employee$/i.test(t.name))
    .map(t => t.name.replace(/Employee$/i, 'Manager').trim());

  const derivedTags = derivedTagNames.length
    ? await prisma.tag.findMany({
        where: { name: { in: derivedTagNames } },
        select: { id: true },
      })
    : [];

  const tagIds = new Set<string>([...configuredTagIds, ...derivedTags.map(t => t.id)]);
  const assignedTagsConnect = Array.from(tagIds).map(id => ({ id }));

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
  if (!user) return [];
  if (user.role !== 'manager' && user.role !== 'admin') return [];

  const managerTagNames = user.tags.map(t => t.name);

  /*
   * Records reach a manager through tags: a submission is routed to tags, and a
   * manager sees it if they hold one of them.
   *
   * Admins are not routed to anything, so tag filtering would give them an
   * empty queue — they see everything instead.
   */
  const scope =
    user.role === 'admin'
      ? {}
      : { assignedTags: { some: { name: { in: managerTagNames } } } };

  const [timesheets, transfers, incidents] = await Promise.all([
    prisma.timesheet.findMany({
      where: scope,
      include: { submitter: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.transferRecord.findMany({
      where: scope,
      include: { submitter: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.incidentReport.findMany({
      where: scope,
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

/**
 * Everything the detail page needs: who filed the record, and the whole
 * conversation about it. Both were previously missing — the page showed a raw
 * database id where a name belongs, and the feedback thread was hardcoded
 * empty, so notes written by a manager were invisible to the person who filed.
 */
const DETAIL_INCLUDE = {
  submitter: { select: { name: true, email: true } },
  comments: {
    orderBy: { createdAt: 'asc' as const },
    include: { author: { select: { name: true, email: true, role: true } } },
  },
};

type DetailRecord = {
  id: string;
  submitterId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  submitter: { name: string | null; email: string };
  comments: {
    id: string;
    content: string;
    createdAt: Date;
    authorId: string;
    author: { name: string | null; email: string; role: string };
  }[];
};

/**
 * Splits a record into the form fields and the plumbing around them.
 *
 * The detail pages render `data` field by field, so the id, status and
 * timestamps have to come out of it — left in, they printed as form rows
 * labelled "Submitter Id" and "Updated At" alongside the real answers.
 */
function shapeSubmission(record: DetailRecord, type: string) {
  const {
    submitter,
    comments,
    id,
    submitterId,
    status,
    createdAt,
    updatedAt,
    ...data
  } = record;

  return {
    id,
    type,
    status: status.toLowerCase(),
    submitterId,
    submitterName: submitter.name || submitter.email,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    data,
    feedbackThread: comments.map(c => ({
      id: c.id,
      authorId: c.authorId,
      authorName: c.author.name || c.author.email,
      authorRole: c.author.role,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}

export async function fetchSubmissionById(id: string) {
  const user = await getSessionUser();
  if (!user) return null;

  // A cuid does not say which table it belongs to, so all three are asked.
  const [timesheet, transfer, incident] = await Promise.all([
    prisma.timesheet.findUnique({ where: { id }, include: DETAIL_INCLUDE }),
    prisma.transferRecord.findUnique({ where: { id }, include: DETAIL_INCLUDE }),
    prisma.incidentReport.findUnique({ where: { id }, include: DETAIL_INCLUDE }),
  ]);

  if (timesheet) return shapeSubmission(timesheet, 'timesheet');
  if (transfer) return shapeSubmission(transfer, 'transfer');
  if (incident) return shapeSubmission(incident, 'incident');

  return null;
}

/**
 * How each record type is named to a person. Interpolating the bare key gave
 * notifications reading "a incident"; these carry their own article.
 */
const TYPE_LABEL: Record<string, string> = {
  timesheet: 'timesheet',
  transfer: 'transfer record',
  incident: 'incident report',
};

const labelFor = (type: string) => TYPE_LABEL[type] ?? 'record';

/** Which column on Comment links it back to a record of this type. */
function commentLinkFor(type: string, id: string) {
  switch (type) {
    case 'timesheet':
      return { timesheetId: id };
    case 'transfer':
      return { transferRecordId: id };
    case 'incident':
      return { incidentReportId: id };
    default:
      return null;
  }
}

/** The record's owner, so a note can be announced to the other party. */
async function submitterOf(type: string, id: string) {
  switch (type) {
    case 'timesheet':
      return prisma.timesheet.findUnique({ where: { id }, select: { submitterId: true } });
    case 'transfer':
      return prisma.transferRecord.findUnique({ where: { id }, select: { submitterId: true } });
    case 'incident':
      return prisma.incidentReport.findUnique({ where: { id }, select: { submitterId: true } });
    default:
      return null;
  }
}

/**
 * Writes a note onto the record.
 *
 * This used to live only in React state: a manager's request for an adjustment
 * looked sent, then vanished on the next page load and never reached the person
 * who filed. Notes are now rows, and the other party is told.
 */
export async function addSubmissionComment(id: string, type: string, content: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Please sign in again.');

  const trimmed = content.trim();
  if (!trimmed) throw new Error('There is nothing to send yet.');

  const link = commentLinkFor(type, id);
  if (!link) throw new Error('That record type is not one we handle.');

  const owner = await submitterOf(type, id);
  if (!owner) throw new Error('We could not find that record.');

  // An employee may only write on their own record; reviewers may write on any
  // record their queue reaches them.
  if (user.role === 'employee' && owner.submitterId !== user.id) {
    throw new Error('That record is not yours.');
  }

  const comment = await prisma.comment.create({
    data: { content: trimmed, authorId: user.id, ...link },
    include: { author: { select: { name: true, email: true, role: true } } },
  });

  const author = user.name ?? user.email;

  if (owner.submitterId === user.id) {
    // The employee replied — tell the reviewers holding this record.
    const reviewers = await prisma.user.findMany({
      where: { role: { in: ['manager', 'admin'] } },
      select: { id: true },
    });
    await Promise.all(
      reviewers.map(r =>
        notify({
          recipientId: r.id,
          kind: 'SUBMISSION',
          title: `${author} replied on their ${labelFor(type)}`,
          body: trimmed.slice(0, 140),
          href: `/manager/submissions/${id}`,
        })
      )
    );
  } else {
    await notify({
      recipientId: owner.submitterId,
      kind: 'SUBMISSION',
      title: `${author} left a note on your ${labelFor(type)}`,
      body: trimmed.slice(0, 140),
      href: `/employee/submissions/${id}`,
    });
  }

  return {
    id: comment.id,
    authorId: comment.authorId,
    authorName: comment.author.name || comment.author.email,
    authorRole: comment.author.role,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
  };
}

/**
 * Columns a submitter may correct when a record is sent back, and how to read
 * each one off the form. Anything absent from this map cannot be written —
 * status, ids and timestamps are not the submitter's to change.
 */
const EDITABLE_FIELDS: Record<string, Record<string, 'string' | 'float' | 'date'>> = {
  timesheet: {
    date: 'date',
    timeIn: 'string',
    timeOut: 'string',
    lunchHour: 'float',
    overTime: 'float',
    transferTime: 'float',
    totalHours: 'float',
  },
  transfer: {
    date: 'date',
    time: 'string',
    team: 'string',
    transferType: 'string',
    deceasedName: 'string',
    placeOfDeath: 'string',
    nokName: 'string',
    nokRelation: 'string',
    nokContact: 'string',
    constName: 'string',
    constNumber: 'string',
    meName: 'string',
    twoStaffApproved: 'string',
    notes: 'string',
  },
  incident: {
    incidentDate: 'date',
    incidentLocation: 'string',
    nature: 'string',
    notes: 'string',
    certified: 'string',
  },
};

function coerce(raw: FormDataEntryValue | null, kind: 'string' | 'float' | 'date') {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) return null;
  if (kind === 'float') {
    const n = parseFloat(value);
    return Number.isNaN(n) ? null : n;
  }
  if (kind === 'date') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return value;
}

/**
 * Saves a submitter's corrections and puts the record back in the queue.
 *
 * The detail page has always rendered editable inputs for a record that was
 * sent back, but there was nothing behind them: the corrections were typed and
 * then dropped on the next navigation, and the record stayed sent back forever.
 */
export async function resubmitSubmission(id: string, type: string, formData: FormData) {
  const user = await getSessionUser();
  if (!user) return { error: 'Please sign in again.' };

  const fields = EDITABLE_FIELDS[type];
  if (!fields) return { error: 'That record type is not one we handle.' };

  const owner = await submitterOf(type, id);
  if (!owner) return { error: 'We could not find that record.' };
  if (owner.submitterId !== user.id) return { error: 'That record is not yours.' };

  const data: Record<string, unknown> = { status: 'PENDING' };
  for (const [name, kind] of Object.entries(fields)) {
    if (formData.has(name)) data[name] = coerce(formData.get(name), kind);
  }

  try {
    switch (type) {
      case 'timesheet':
        await prisma.timesheet.update({ where: { id }, data });
        break;
      case 'transfer':
        await prisma.transferRecord.update({ where: { id }, data });
        break;
      case 'incident':
        await prisma.incidentReport.update({ where: { id }, data });
        break;
    }
  } catch (e) {
    console.error('Could not save those corrections', e);
    return { error: 'Something went wrong on our end. Please try again.' };
  }

  const reviewers = await prisma.user.findMany({
    where: { role: { in: ['manager', 'admin'] } },
    select: { id: true },
  });
  await Promise.all(
    reviewers.map(r =>
      notify({
        recipientId: r.id,
        kind: 'SUBMISSION',
        title: `${user.name ?? user.email} re-sent their ${labelFor(type)}`,
        href: `/manager/submissions/${id}`,
      })
    )
  );

  return { error: '' };
}

export async function updateSubmissionStatusAdmin(id: string, type: string, newStatus: string) {
  const user = await getSessionUser();
  if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
    throw new Error('You are not able to review records.');
  }

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
      throw new Error("That record type is not one we handle.");
  }

  // Close the loop: whoever filed this needs to know it was looked at.
  const reviewer = user.name ?? 'Your manager';
  const wording: Record<string, { title: string; body: string }> = {
    APPROVED: {
      title: `Your ${labelFor(type)} was approved`,
      body: `${reviewer} signed it off.`,
    },
    FINALIZED: {
      title: `Your ${labelFor(type)} is finalised`,
      body: `${reviewer} has closed it off. No further action is needed.`,
    },
    'REVISION-REQUIRED': {
      title: `Your ${labelFor(type)} needs another look`,
      body: `${reviewer} sent it back. Please check the details and send it again.`,
    },
  };

  // Leaving a record with review is not news to the person who filed it.
  const message = wording[formattedStatus];
  if (message) {
    await notify({
      recipientId: result.submitterId,
      kind: 'SUBMISSION',
      title: message.title,
      body: message.body,
      href: `/employee/submissions/${id}`,
    });
  }

  return { success: true };
}

/**
 * Headline counts for the manager dashboard. Previously these tiles showed
 * invented figures ("4 active transfers", "42 staff"); they now come from the
 * database so the dashboard cannot disagree with the pages it links to.
 */
export async function fetchDashboardCounts() {
  const user = await getSessionUser();
  if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
    return { pendingTimesheets: 0, activeTransfers: 0, staff: 0, documents: 0 };
  }

  const [pendingTimesheets, activeTransfers, staff, documents] = await Promise.all([
    prisma.timesheet.count({ where: { status: 'PENDING' } }),
    prisma.transferRecord.count({ where: { status: 'PENDING' } }),
    prisma.user.count(),
    prisma.document.count(),
  ]);

  return { pendingTimesheets, activeTransfers, staff, documents };
}

/**
 * Why the review queue might be empty.
 *
 * A manager holding no manager tags matches no routed record, so their queue is
 * empty however much work is waiting — and nothing on screen says why. This
 * lets the page explain instead of showing a bare "nothing here".
 */
export async function fetchQueueContext() {
  const user = await getSessionUser();
  if (!user) return { canReview: false, hasRoutableTags: false, isAdmin: false, untriaged: 0 };

  const isAdmin = user.role === 'admin';
  const hasRoutableTags = user.tags.some(t => t.type === 'MANAGER' || t.type === 'ADDITIONAL');

  // Records nobody is routed to at all — these would otherwise sit unseen.
  const [ts, tr, ir] = await Promise.all([
    prisma.timesheet.count({ where: { assignedTags: { none: {} } } }),
    prisma.transferRecord.count({ where: { assignedTags: { none: {} } } }),
    prisma.incidentReport.count({ where: { assignedTags: { none: {} } } }),
  ]);

  return {
    canReview: isAdmin || user.role === 'manager',
    hasRoutableTags: isAdmin || hasRoutableTags,
    isAdmin,
    untriaged: ts + tr + ir,
  };
}
