'use server';

import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { endOfMonth, format, differenceInDays } from 'date-fns';

export interface AppNotification {
  id: string; // Dynamic ID
  type: 'action-required' | 'update' | 'reminder';
  title: string;
  message: string;
  link: string;
  createdAt: string; 
  read: boolean;
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  const currentUser = await getSessionUser();
  if (!currentUser) return [];

  const notifications: AppNotification[] = [];

  // --- 1. Submissions awaiting managerial approval ---
  if (currentUser.role === 'manager' || currentUser.role === 'admin') {
    const userTagIds = currentUser.tags.map(t => t.id);

    // Any assigned tags where form is PENDING?
    const timesheets = await prisma.timesheet.findMany({
      where: {
        status: 'PENDING',
        assignedTags: { some: { id: { in: userTagIds } } },
      },
      select: { id: true, submitter: { select: { name: true } }, createdAt: true }
    });
    
    timesheets.forEach(ts => {
      notifications.push({
        id: `ts-req-${ts.id}`,
        type: 'action-required',
        title: 'Timesheet Approval Needed',
        message: `${ts.submitter.name} has submitted a timesheet for your review.`,
        link: `/manager/timesheets`,
        createdAt: ts.createdAt.toISOString(),
        read: false
      });
    });

    // Similar logic can be expanded for other forms like TransferRecords
  }

  // --- 2. My Forms needing revision or newly approved ---
  // We'll fetch the user's forms updated in the last 7 days.
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const mySubmissions = await prisma.timesheet.findMany({
    where: {
      submitterId: currentUser.id,
      updatedAt: { gte: sevenDaysAgo },
      status: { in: ['REVISION-REQUIRED', 'APPROVED', 'REJECTED'] } // Let's just track big updates
    },
    select: { id: true, status: true, updatedAt: true }
  });

  mySubmissions.forEach(sub => {
    notifications.push({
      id: `my-ts-${sub.id}-${sub.status}`,
      type: sub.status === 'REVISION-REQUIRED' ? 'action-required' : 'update',
      title: `Timesheet Update: ${sub.status}`,
      message: `Your timesheet ${sub.id} was marked as ${sub.status}.`,
      link: `/employee/submissions/${sub.id}`,
      createdAt: sub.updatedAt.toISOString(),
      read: false
    });
  });

  // Fetch comments to the user's forms in the last 7 days
  const myCommentsOnForms = await prisma.comment.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
      authorId: { not: currentUser.id }, // someone else commented
      OR: [
        { timesheet: { submitterId: currentUser.id } },
        { transferRecord: { submitterId: currentUser.id } },
        { incidentReport: { submitterId: currentUser.id } },
        { timeOffRequest: { submitterId: currentUser.id } },
      ]
    },
    select: { id: true, content: true, author: { select: { name: true } }, createdAt: true, timesheetId: true, transferRecordId: true, incidentReportId: true, timeOffRequestId: true }
  });

  myCommentsOnForms.forEach(comment => {
    let formId = comment.timesheetId || comment.transferRecordId || comment.incidentReportId || comment.timeOffRequestId;
    let type = comment.timesheetId ? 'Timesheet' : comment.transferRecordId ? 'Transfer Record' : comment.incidentReportId ? 'Incident Report' : 'Time Off Request';
    notifications.push({
      id: `comment-${comment.id}`,
      type: 'update',
      title: `New Comment on your ${type}`,
      message: `${comment.author.name} commented: "${comment.content.substring(0, 30)}..."`,
      link: `/employee/submissions/${formId}`,
      createdAt: comment.createdAt.toISOString(),
      read: false
    });
  });

  // --- 3. Timesheet Cutoff Reminder (4 days prior to EOM) ---
  const today = new Date();
  const eom = endOfMonth(today);
  const daysUntilEom = differenceInDays(eom, today);

  if (daysUntilEom <= 4 && daysUntilEom >= 0) {
    notifications.push({
      id: `eom-reminder-${format(today, 'yyyy-MM')}`,
      type: 'reminder',
      title: 'Timesheet Deadline Approaching',
      message: `Reminder: The end of the month is in ${daysUntilEom} days. Ensure all timesheets are submitted.`,
      link: '/employee/submissions/new/timesheet',
      createdAt: today.toISOString(),
      read: false
    });
  }

  // Sort by date descending
  return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
