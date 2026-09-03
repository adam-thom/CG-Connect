"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Loader2,
  Clock,
  MapPin,
  Check,
  AlertCircle,
  CalendarCheck,
  ListChecks,
  ChevronRight,
} from "lucide-react";
import { fetchMyDay, setTaskStatus } from "@/app/actions/tasks";
import { todayKey } from "@/lib/calendar";
import { cn, formatLongDate } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  detail: string | null;
  dueDate: string;
  status: string;
  priority: string;
  assignedBy: { name: string | null } | null;
};

type MyService = {
  id: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  myRoles: string[];
  rosterSize: number;
};

export function TodayPanel({ scope = "mine" }: { scope?: "mine" | "team" }) {
  const today = todayKey();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [services, setServices] = useState<MyService[]>([]);
  const [teamTaskCount, setTeamTaskCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isTeam = scope === "team";

  useEffect(() => {
    let active = true;
    fetchMyDay(today, scope)
      .then(res => {
        if (!active) return;
        setTasks(res.tasks as unknown as Task[]);
        setServices(res.services as MyService[]);
        setTeamTaskCount(res.teamTaskCount ?? 0);
      })
      .catch(() => {
        if (active) setError("Something went wrong on our end. Please try again.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [today, scope]);

  const toggle = (task: Task) => {
    const done = task.status !== "DONE";
    // Optimistic: ticking a box should feel instant, and it is put back if the
    // save fails.
    const snapshot = tasks;
    setTasks(prev =>
      prev.map(t => (t.id === task.id ? { ...t, status: done ? "DONE" : "OPEN" } : t))
    );
    startTransition(async () => {
      try {
        await setTaskStatus(task.id, done);
      } catch {
        setTasks(snapshot);
        setError("That did not save. Please try again.");
      }
    });
  };

  const open = tasks.filter(t => t.status !== "DONE");
  const doneCount = tasks.length - open.length;
  const overdue = open.filter(t => t.dueDate < today);
  const nothingOn = services.length === 0 && tasks.length === 0;

  return (
    <section className="cg-card">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="cg-eyebrow">Today</p>
          <h2 className="mt-1 text-2xl">
            {formatLongDate(today)}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!isLoading && tasks.length > 0 && (
            <span className={doneCount === tasks.length ? "cg-pill-success" : "cg-pill-neutral"}>
              {doneCount}/{tasks.length} done
            </span>
          )}
          {isTeam && (
            <Link
              href="/manager/tasks"
              className="text-sm text-accent-on-surface transition-colors hover:text-accent-dark"
            >
              Team tasks
              {teamTaskCount > 0 ? ` (${teamTaskCount})` : ""}
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="cg-callout mb-4 flex items-center gap-3 text-sm text-status-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-10 text-sm text-sage">
          <Loader2 className="h-5 w-5 animate-spin" />
          One moment.
        </div>
      ) : nothingOn ? (
        <p className="py-6 text-sm text-sage">
          {isTeam
            ? "No services are scheduled today, and you have no tasks."
            : "Nothing scheduled and no tasks for today."}
        </p>
      ) : (
        <div className="space-y-6">
          {services.length > 0 && (
            <div>
              <h3 className="cg-eyebrow mb-3 flex items-center gap-2 text-sage">
                <CalendarCheck className="h-3.5 w-3.5" />
                {isTeam ? "Services today" : "You are on"}
              </h3>
              <ul className="space-y-3">
                {services.map(s => (
                  <li key={s.id}>
                    <Link
                      href={`/service/${s.id}`}
                      className={cn(
                        "block rounded-[var(--radius-panel)] border p-4 transition-colors",
                        s.myRoles.length > 0
                          ? "border-brand-200 bg-brand-50 hover:border-brand-400"
                          : "border-ui-border hover:border-brand-300"
                      )}
                    >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-[1rem] text-ui-text-primary">{s.title}</h4>
                      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-accent-on-surface">
                        Full details
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-sage">
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

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {s.myRoles.map(r => (
                        <span key={r} className="cg-pill-brand">
                          {r}
                        </span>
                      ))}
                      {s.rosterSize === 0 ? (
                        <span className="cg-pill-warning">No roster yet</span>
                      ) : (
                        s.rosterSize > s.myRoles.length && (
                          <span className="cg-pill-neutral">
                            {s.myRoles.length > 0
                              ? `+${s.rosterSize - s.myRoles.length} on the roster`
                              : `${s.rosterSize} on the roster`}
                          </span>
                        )
                      )}
                    </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tasks.length > 0 && (
            <div>
              <h3 className="cg-eyebrow mb-3 flex items-center gap-2 text-sage">
                <ListChecks className="h-3.5 w-3.5" />
                Your tasks
              </h3>

              {overdue.length > 0 && (
                <p className="mb-3 text-sm text-status-error">
                  {overdue.length === 1
                    ? "One task is still open from an earlier day."
                    : `${overdue.length} tasks are still open from earlier days.`}
                </p>
              )}

              <ul className="space-y-2">
                {tasks.map(task => {
                  const done = task.status === "DONE";
                  const isOverdue = !done && task.dueDate < today;
                  return (
                    <li key={task.id}>
                      <label
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-[var(--radius-panel)] border p-3 transition-colors",
                          done
                            ? "border-transparent bg-ui-bg-alt"
                            : isOverdue
                            ? "border-status-error/30 bg-status-error-soft/40 hover:border-status-error/50"
                            : "border-ui-border hover:border-brand-300"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={done}
                          disabled={isPending}
                          onChange={() => toggle(task)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
                        />
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "flex items-center gap-2 font-medium",
                              done ? "text-sage line-through" : "text-ui-text-primary"
                            )}
                          >
                            {task.title}
                            {!done && task.priority === "HIGH" && (
                              <span className="cg-pill-warning shrink-0">Priority</span>
                            )}
                          </span>

                          {task.detail && (
                            <span className="mt-0.5 block text-sm text-ui-text-secondary">
                              {task.detail}
                            </span>
                          )}

                          <span className="cg-meta mt-1 block text-sage">
                            {isOverdue ? `Due ${task.dueDate}` : "Due today"}
                            {task.assignedBy?.name ? ` · from ${task.assignedBy.name}` : ""}
                          </span>
                        </span>
                        {done && <Check className="mt-0.5 h-4 w-4 shrink-0 text-status-success" />}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
