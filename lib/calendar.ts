/**
 * Month-grid maths for the schedule calendars.
 *
 * Everything here works in plain calendar terms (year, month index, day of
 * month) and never constructs a UTC instant, because a calendar cell is a date
 * on a wall, not a moment in time. Mixing the two is what made timesheet dates
 * render a day early before.
 */

export type CalendarDay = {
  /** "YYYY-MM-DD" — the key used to look records up. */
  key: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
};

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Local-date key, with no timezone conversion. */
export function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function todayKey() {
  const n = new Date();
  return dateKey(n.getFullYear(), n.getMonth(), n.getDate());
}

export function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * A six-week grid (42 cells) covering the month, padded with the tail of the
 * previous month and the head of the next so every row is complete. A fixed
 * cell count keeps the grid from changing height as you page through months.
 */
export function buildMonthGrid(year: number, month: number): CalendarDay[] {
  const today = todayKey();
  const firstWeekday = new Date(year, month, 1).getDay();
  const thisMonthDays = daysInMonth(year, month);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthDays = daysInMonth(prevYear, prevMonth);

  const cells: CalendarDay[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const key = dateKey(prevYear, prevMonth, day);
    cells.push({
      key,
      day,
      inCurrentMonth: false,
      isToday: key === today,
      isWeekend: cells.length % 7 === 0 || cells.length % 7 === 6,
    });
  }

  for (let day = 1; day <= thisMonthDays; day++) {
    const key = dateKey(year, month, day);
    cells.push({
      key,
      day,
      inCurrentMonth: true,
      isToday: key === today,
      isWeekend: cells.length % 7 === 0 || cells.length % 7 === 6,
    });
  }

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  let day = 1;
  while (cells.length < 42) {
    const key = dateKey(nextYear, nextMonth, day);
    cells.push({
      key,
      day,
      inCurrentMonth: false,
      isToday: key === today,
      isWeekend: cells.length % 7 === 0 || cells.length % 7 === 6,
    });
    day++;
  }

  return cells;
}

/** Inclusive first/last day keys of a month, for a range query. */
export function monthRange(year: number, month: number) {
  return {
    start: dateKey(year, month, 1),
    end: dateKey(year, month, daysInMonth(year, month)),
  };
}

export function addMonths(year: number, month: number, delta: number) {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}
