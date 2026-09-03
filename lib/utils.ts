import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * The company operates out of Alberta. Pinning locale and time zone keeps
 * server-rendered dates byte-identical to the client's, which a bare
 * `toLocaleDateString()` does not: Node resolves to en-CA (2028-05-14) while
 * the browser resolves to the OS locale (5/14/2028), and the mismatch throws
 * a hydration error. Always format dates through these helpers.
 */
const LOCALE = "en-CA";
const TIME_ZONE = "America/Edmonton";

/** A calendar date with no time, e.g. "2026-09-03". */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Turns a value into a Date that will format as the day it names.
 *
 * A bare "YYYY-MM-DD" is parsed by JS as UTC midnight, so formatting it in any
 * zone west of Greenwich yields the *previous* day — a line-up printed for the
 * 3rd came out headed the 2nd. Anchoring date-only strings at local noon puts
 * them far enough from both midnights that no offset can shift the date.
 *
 * Values that carry a time are real instants and are left alone.
 */
function toDate(value: string | number | Date): Date {
  if (typeof value === "string" && DATE_ONLY.test(value)) {
    return new Date(`${value}T12:00:00`);
  }
  return new Date(value);
}

/** "May 14, 2028" */
export function formatDate(value: string | number | Date | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: TIME_ZONE,
  });
}

/**
 * "May 14, 2028" for a value that is a calendar date rather than an instant —
 * a certification expiry, a timesheet's day, a service date.
 *
 * These reach us two ways and both drift a day if formatted as instants:
 *
 *  - as "YYYY-MM-DD", which JS parses as UTC midnight;
 *  - as a Date from a DateTime column, which the form wrote as
 *    `new Date("2026-09-03")` — also UTC midnight.
 *
 * Rendered in Edmonton either one comes out as the 2nd. So a Date is read back
 * in UTC, where the value was written, and a string keeps the noon anchor.
 * Anything holding a real time of day belongs in formatDate instead.
 */
export function formatCalendarDate(value: string | number | Date | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" && DATE_ONLY.test(value)) return formatDate(value);

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** "Thursday, 3 September 2026" — for headings that name a day. */
export function formatLongDate(value: string | number | Date | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  });
}

/** "May 14, 2028, 3:05 p.m." */
export function formatDateTime(value: string | number | Date | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  });
}
