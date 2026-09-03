/**
 * Shared constants for tags and form routing.
 *
 * These live here rather than in app/actions/tags.ts because a "use server"
 * module may only export async functions — exporting a constant from one throws
 * at runtime, not at build time.
 */

export const TAG_TYPES = ['EMPLOYEE', 'MANAGER', 'ADDITIONAL'] as const;
export type TagType = (typeof TAG_TYPES)[number];

/** Form types that can be routed. Keys match app/employee/submissions/new/[type]. */
export const ROUTABLE_FORMS = [
  { key: 'timesheet', label: 'Timesheets', hint: 'Hours filed by staff each day.' },
  { key: 'transfer', label: 'Transfer records', hint: 'Details of a transfer into our care.' },
  { key: 'incident', label: 'Incident reports', hint: 'Injury, damage or a legal matter.' },
  { key: 'timeoff', label: 'Time off requests', hint: 'Holiday and leave.' },
  { key: 'funding', label: 'Funding requests', hint: 'Spending that needs approval.' },
] as const;

export const TAG_TYPE_LABEL: Record<string, string> = {
  EMPLOYEE: 'Employee tags',
  MANAGER: 'Manager tags',
  ADDITIONAL: 'Other groups',
};
