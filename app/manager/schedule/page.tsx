"use client";

import { useAuth } from "@/lib/auth-context";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ClipboardList,
  Clock,
  MapPin,
  Loader2,
  CheckCircle2,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { cn, formatLongDate } from "@/lib/utils";
import { Modal } from "@/components/Modal";
import { useToast, useConfirm } from "@/components/Toast";
import { createService, getServicesForMonth, deleteService } from "@/app/actions/lineup";
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

export default function ManagerSchedule() {
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({ title: "", time: "", location: "" });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const refresh = async () => {
    const { start, end } = monthRange(year, month);
    const rows = await getServicesForMonth(start, end);
    setServices(rows as unknown as Service[]);
  };

  useEffect(() => {
    let active = true;
    const { start, end } = monthRange(year, month);
    getServicesForMonth(start, end)
      .then(rows => {
        if (!active) return;
        setServices(rows as unknown as Service[]);
        setLoadedMonth(`${year}-${month}`);
      })
      .catch(() => {
        if (active) setError("Something went wrong on our end. Please try again.");
      })
      .finally(() => {
        // `isLoading` is derived, so nothing to reset here.
      });
    return () => {
      active = false;
    };
  }, [year, month]);

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const byDay = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of services) {
      const list = map.get(s.date) ?? [];
      list.push(s);
      map.set(s.date, list);
    }
    return map;
  }, [services]);

  const dayServices = selectedDate ? (byDay.get(selectedDate) ?? []) : [];
  const needingRoster = useMemo(
    () => services.filter(s => s.date >= todayKey() && s.assignments.length === 0).slice(0, 5),
    [services]
  );

  if (!user) return null;

  const step = (delta: number) => setCursor(c => addMonths(c.year, c.month, delta));

  const openDay = (key: string) => {
    setSelectedDate(key);
    setNewService({ title: "", time: "", location: "" });
    setSaveStatus("idle");
    setError(null);
    setIsModalOpen(true);
  };

  const handleAddService = () => {
    if (!selectedDate || !newService.title.trim()) return;
    setSaveStatus("saving");
    setError(null);
    startTransition(async () => {
      const res = await createService({ ...newService, date: selectedDate });
      if (res.success) {
        await refresh();
        setNewService({ title: "", time: "", location: "" });
        setSaveStatus("saved");
        toast.success("Service added.");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("idle");
        setError("That did not save. Please try again.");
      }
    });
  };

  const handleDelete = async (service: Service) => {
    const ok = await confirm({
      title: "Remove this service?",
      body: `“${service.title}” on ${service.date}, along with its roster.`,
      confirmLabel: "Remove",
      destructive: true,
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await deleteService(service.id);
      if (res.success) {
        await refresh();
        toast.success("Service removed.");
      } else {
        toast.error("That did not delete. Please try again.");
      }
    });
  };

  return (
    <div className="animate-in fade-in duration-300 ease-cg overflow-x-hidden pb-12">
      {dialog}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="cg-eyebrow">Workforce planning</p>
          <h1 className="mt-2 text-4xl">Department Schedule</h1>
          <p className="mt-2 text-base">Click any date to add a service or build its line-up.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const n = new Date();
              setCursor({ year: n.getFullYear(), month: n.getMonth() });
            }}
            className="cg-btn-secondary min-h-0 py-2 text-sm"
          >
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

      {error && (
        <div role="alert" className="cg-callout mb-6 flex items-center gap-3 text-sm text-status-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col items-start gap-6 xl:flex-row">
        <div className="cg-card w-full min-w-0 flex-1 overflow-hidden p-0">
          <div className="grid grid-cols-7 border-b border-ui-border bg-ui-bg-alt">
            {WEEKDAY_LABELS.map(d => (
              <div key={d} className="cg-eyebrow py-3 text-center text-sage">
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
                const list = byDay.get(cell.key) ?? [];
                return (
                  <button
                    key={cell.key}
                    onClick={() => openDay(cell.key)}
                    aria-label={`${cell.key}, ${list.length} service${list.length === 1 ? "" : "s"}`}
                    className={cn(
                      "group flex min-h-32 flex-col gap-1 border-b border-r border-ui-border p-2 text-left transition-colors hover:bg-ui-bg-alt",
                      !cell.inCurrentMonth && "bg-ui-bg-alt/40"
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <span
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                          cell.isToday
                            ? "bg-accent text-white"
                            : cell.inCurrentMonth
                            ? "text-ui-text-primary"
                            : "text-sage/60"
                        )}
                      >
                        {cell.day}
                      </span>
                      <Plus className="h-4 w-4 text-sage opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>

                    <span className="flex flex-col gap-1 overflow-hidden">
                      {list.slice(0, 3).map(s => (
                        <span
                          key={s.id}
                          className="truncate rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-tight tracking-tight text-white"
                        >
                          {s.title}
                        </span>
                      ))}
                      {list.length > 3 && (
                        <span className="px-1.5 text-[10px] text-sage">
                          +{list.length - 3} more
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="w-full shrink-0 space-y-6 xl:w-80">
          <div className="cg-panel-accent">
            <p className="cg-eyebrow mb-3 block text-white/80">Needs a line-up</p>
            {isLoading ? (
              <p className="text-sm text-white/80">One moment.</p>
            ) : needingRoster.length === 0 ? (
              <p className="text-sm text-white/85">Every upcoming service has a roster.</p>
            ) : (
              <ul className="space-y-3">
                {needingRoster.map(s => (
                  <li key={s.id}>
                    <Link
                      href={`/manager/lineup?date=${s.date}`}
                      className="flex items-start gap-3 text-sm leading-snug text-white/90 transition-colors hover:text-white"
                    >
                      <ClipboardList className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        <span className="font-medium text-white">{s.title}</span> on {s.date}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="cg-card">
            <p className="cg-eyebrow mb-3 block text-sage">This month</p>
            <p className="font-serif text-4xl text-accent-on-surface">
              {isLoading ? "—" : services.length}
            </p>
            <p className="mt-1 text-sm text-sage">
              {services.length === 1 ? "service scheduled" : "services scheduled"}
            </p>
          </div>
        </aside>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          selectedDate
            ? formatLongDate(selectedDate)
            : ""
        }
      >
        <div className="space-y-6">
          <div>
            <h3 className="cg-eyebrow mb-3 block text-sage">Scheduled services</h3>
            {dayServices.length === 0 ? (
              <p className="text-sm text-sage">No services are scheduled for this date.</p>
            ) : (
              <ul className="space-y-3">
                {dayServices.map(s => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-panel)] border border-ui-border bg-ui-surface p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[1rem] text-ui-text-primary">{s.title}</p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-sage">
                        {s.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {s.time}
                          </span>
                        )}
                        {s.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {s.location}
                          </span>
                        )}
                        <span>
                          {s.assignments.length === 0
                            ? "No roster yet"
                            : `${s.assignments.length} assigned`}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Link
                        href={`/manager/lineup?date=${s.date}`}
                        className="rounded-full bg-brand-100 px-3 py-1.5 text-xs font-medium text-accent-on-surface transition-colors hover:bg-brand-200"
                      >
                        Build line-up
                      </Link>
                      <button
                        onClick={() => handleDelete(s)}
                        disabled={isPending}
                        aria-label={`Remove ${s.title}`}
                        className="rounded-full p-2 text-sage transition-colors hover:bg-status-error-soft hover:text-status-error disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-[var(--radius-panel)] border border-dashed border-ui-border p-4">
            <h3 className="cg-eyebrow mb-3 block text-sage">Add a service</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                placeholder="Service name, e.g. Miller Funeral"
                value={newService.title}
                onChange={e => setNewService({ ...newService, title: e.target.value })}
                className="col-span-full rounded-[var(--radius-panel)] border border-ui-border bg-ui-bg px-3 py-2.5 text-sm text-ui-text-primary outline-none transition-colors placeholder:text-sage/70 focus:border-accent focus:bg-ui-surface"
              />
              <input
                placeholder="Time, e.g. 10:30 AM"
                value={newService.time}
                onChange={e => setNewService({ ...newService, time: e.target.value })}
                className="rounded-[var(--radius-panel)] border border-ui-border bg-ui-bg px-3 py-2.5 text-sm text-ui-text-primary outline-none transition-colors placeholder:text-sage/70 focus:border-accent focus:bg-ui-surface"
              />
              <input
                placeholder="Location"
                value={newService.location}
                onChange={e => setNewService({ ...newService, location: e.target.value })}
                className="rounded-[var(--radius-panel)] border border-ui-border bg-ui-bg px-3 py-2.5 text-sm text-ui-text-primary outline-none transition-colors placeholder:text-sage/70 focus:border-accent focus:bg-ui-surface"
              />
              <button
                onClick={handleAddService}
                disabled={!newService.title.trim() || saveStatus === "saving"}
                className="cg-btn-primary col-span-full"
              >
                {saveStatus === "saving" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saveStatus === "saved" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {saveStatus === "saving"
                  ? "One moment."
                  : saveStatus === "saved"
                  ? "Saved."
                  : "Add service"}
              </button>
            </div>
          </div>

          {/* Rostering lives in the Daily Line-up, which saves assignments
            * against the service. Duplicating it here would mean two places to
            * do one job, so this links across instead. */}
          {selectedDate && (
            <Link
              href={`/manager/lineup?date=${selectedDate}`}
              className="cg-btn-secondary w-full"
            >
              <ClipboardList className="h-4 w-4" />
              Open the line-up for this day
            </Link>
          )}
        </div>
      </Modal>
    </div>
  );
}
