"use client";

import { useAuth } from "@/lib/auth-context";
import { ChevronLeft, ChevronRight, Clock, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn, formatLongDate } from "@/lib/utils";
import { getServicesForMonth } from "@/app/actions/lineup";
import {
  WEEKDAY_LABELS,
  addMonths,
  buildMonthGrid,
  monthLabel,
  monthRange,
  todayKey,
} from "@/lib/calendar";

type Assignment = { id: string; roleName: string; staffName: string };
type Service = {
  id: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  assignments: Assignment[];
};

export default function EmployeeSchedule() {
  const { user } = useAuth();
  const now = new Date();
  const [{ year, month }, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [services, setServices] = useState<Service[]>([]);
  /** The month the loaded services belong to; null until the first load. */
  const [loadedMonth, setLoadedMonth] = useState<string | null>(null);
  const monthKey = `${year}-${month}`;
  const isLoading = loadedMonth !== monthKey;
  const [selected, setSelected] = useState<string | null>(todayKey());

  useEffect(() => {
    let active = true;
    const { start, end } = monthRange(year, month);
    getServicesForMonth(start, end)
      .then(rows => {
        if (!active) return;
        setServices(rows as unknown as Service[]);
        setLoadedMonth(`${year}-${month}`);
      })
      .catch(err => console.error("Could not load the schedule", err))
      .finally(() => {
        // `isLoading` is derived, so nothing to reset here.
      });
    return () => {
      active = false;
    };
  }, [year, month]);

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  /** Services keyed by day, and whether this person is on any of them. */
  const byDay = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of services) {
      const list = map.get(s.date) ?? [];
      list.push(s);
      map.set(s.date, list);
    }
    return map;
  }, [services]);

  const myName = user?.name ?? "";
  const isMine = (s: Service) =>
    !!myName && s.assignments.some(a => a.staffName === myName);

  const selectedServices = selected ? (byDay.get(selected) ?? []) : [];

  if (!user) return null;

  const step = (delta: number) => setCursor(c => addMonths(c.year, c.month, delta));
  const goToday = () => {
    const n = new Date();
    setCursor({ year: n.getFullYear(), month: n.getMonth() });
    setSelected(todayKey());
  };

  return (
    <div className="animate-in fade-in duration-300 ease-cg pb-12">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="cg-eyebrow">Your month</p>
          <h1 className="mt-2 text-4xl">Schedule</h1>
          <p className="mt-2 text-base">Services at your location, and the ones you are on.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={goToday} className="cg-btn-secondary min-h-0 py-2 text-sm">
            Today
          </button>
          <div className="flex items-center overflow-hidden rounded-full border border-ui-border bg-ui-surface">
            <button
              onClick={() => step(-1)}
              aria-label="Previous month"
              className="border-r border-ui-border p-2 text-ui-text-secondary transition-colors hover:bg-ui-bg-alt"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-40 px-4 py-1.5 text-center text-sm font-medium text-ui-text-primary">
              {monthLabel(year, month)}
            </span>
            <button
              onClick={() => step(1)}
              aria-label="Next month"
              className="border-l border-ui-border p-2 text-ui-text-secondary transition-colors hover:bg-ui-bg-alt"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="cg-card min-w-0 flex-1 overflow-hidden p-0">
          <div className="grid grid-cols-7 border-b border-ui-border bg-ui-bg-alt">
            {WEEKDAY_LABELS.map(d => (
              <div
                key={d}
                className="cg-eyebrow py-3 text-center text-sage"
                aria-hidden={false}
              >
                {d}
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-3 p-20 text-sm text-sage">
              <Loader2 className="h-5 w-5 animate-spin" />
              One moment.
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {grid.map(cell => {
                const dayServices = byDay.get(cell.key) ?? [];
                const mine = dayServices.filter(isMine);
                const isSelected = cell.key === selected;
                return (
                  <button
                    key={cell.key}
                    onClick={() => setSelected(cell.key)}
                    aria-current={cell.isToday ? "date" : undefined}
                    aria-label={`${cell.key}, ${dayServices.length} service${dayServices.length === 1 ? "" : "s"}`}
                    className={cn(
                      "flex min-h-28 flex-col gap-1 border-b border-r border-ui-border p-2 text-left transition-colors",
                      !cell.inCurrentMonth && "bg-ui-bg-alt/40 text-sage/50",
                      isSelected ? "bg-brand-100" : "hover:bg-ui-bg-alt"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                        cell.isToday
                          ? "bg-accent text-white"
                          : cell.inCurrentMonth
                          ? "text-ui-text-primary"
                          : "text-sage/60"
                      )}
                    >
                      {cell.day}
                    </span>

                    <span className="flex flex-col gap-1 overflow-hidden">
                      {dayServices.slice(0, 2).map(s => (
                        <span
                          key={s.id}
                          className={cn(
                            "truncate rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-tight tracking-tight",
                            isMine(s)
                              ? "bg-accent text-white"
                              : "bg-ui-bg-alt text-ui-text-secondary"
                          )}
                        >
                          {s.title}
                        </span>
                      ))}
                      {dayServices.length > 2 && (
                        <span className="px-1.5 text-[10px] text-sage">
                          +{dayServices.length - 2} more
                        </span>
                      )}
                    </span>

                    {mine.length > 0 && (
                      <span className="sr-only">You are assigned on this day</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="w-full shrink-0 xl:w-80">
          <div className="cg-card">
            {/* Derived from the selected day, not the calendar cursor: paging
              * the month must not relabel a selection made in another one. */}
            <p className="cg-eyebrow block text-sage">
              {selected
                ? formatLongDate(selected).split(", ").slice(1).join(", ")
                : "Select a day"}
            </p>
            <h2 className="mt-1 text-xl">
              {selected
                ? formatLongDate(selected)
                : "No day selected"}
            </h2>

            {selectedServices.length === 0 ? (
              <p className="mt-4 text-sm text-sage">Nothing scheduled for this day.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {selectedServices.map(s => {
                  const mine = isMine(s);
                  return (
                    <li
                      key={s.id}
                      className={cn(
                        "rounded-[var(--radius-panel)] border p-4",
                        mine ? "border-brand-300 bg-brand-50" : "border-ui-border"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/service/${s.id}`}
                          className="text-[1rem] text-ui-text-primary transition-colors hover:text-accent-on-surface"
                        >
                          {s.title}
                        </Link>
                        {mine && <span className="cg-pill-brand shrink-0">You</span>}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-sage">
                        {s.time && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {s.time}
                          </span>
                        )}
                        {s.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {s.location}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/service/${s.id}`}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent-on-surface transition-colors hover:text-accent-dark"
                      >
                        Full details
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>

                      {s.assignments.length > 0 && (
                        <ul className="mt-3 space-y-1 border-t border-ui-border pt-3">
                          {s.assignments.map(a => (
                            <li
                              key={a.id}
                              className="flex justify-between gap-3 text-sm"
                            >
                              <span className="text-sage">{a.roleName}</span>
                              <span
                                className={cn(
                                  "text-right",
                                  a.staffName === myName
                                    ? "font-medium text-accent-on-surface"
                                    : "text-ui-text-secondary"
                                )}
                              >
                                {a.staffName || "—"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
