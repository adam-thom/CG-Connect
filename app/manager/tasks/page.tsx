"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  Check,
  CalendarDays,
} from "lucide-react";
import {
  createTask,
  deleteTask,
  fetchAssignableStaff,
  fetchTeamTasks,
  setTaskStatus,
} from "@/app/actions/tasks";
import { todayKey } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useToast, useConfirm } from "@/components/Toast";

type TeamTask = {
  id: string;
  title: string;
  detail: string | null;
  dueDate: string;
  status: string;
  priority: string;
  assignee: { id: string; name: string | null; email: string };
  assignedBy: { name: string | null } | null;
};

type Staff = { id: string; name: string | null; email: string; title: string | null };

const field =
  "w-full rounded-[var(--radius-panel)] border border-ui-border bg-ui-bg px-3 py-2.5 text-sm text-ui-text-primary outline-none transition-colors placeholder:text-sage/70 focus:border-accent focus:bg-ui-surface";

export default function ManagerTasksPage() {
  const { user } = useAuth();
  const today = todayKey();

  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const [draft, setDraft] = useState({
    title: "",
    detail: "",
    dueDate: today,
    assigneeId: "",
    priority: "NORMAL",
  });

  const load = async () => {
    const [t, s] = await Promise.all([fetchTeamTasks(today), fetchAssignableStaff()]);
    setTasks(t as unknown as TeamTask[]);
    setStaff(s as Staff[]);
  };

  useEffect(() => {
    let active = true;
    Promise.all([fetchTeamTasks(today), fetchAssignableStaff()])
      .then(([t, s]) => {
        if (!active) return;
        setTasks(t as unknown as TeamTask[]);
        setStaff(s as Staff[]);
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
  }, [today]);

  if (!user) return null;

  const assign = () => {
    setError(null);
    startTransition(async () => {
      const res = await createTask(draft);
      if (res.success) {
        setDraft({ title: "", detail: "", dueDate: today, assigneeId: "", priority: "NORMAL" });
        await load();
        toast.success("Task assigned. They will see it on their dashboard.");
      } else {
        setError(res.error ?? "That did not save. Please try again.");
      }
    });
  };

  const toggle = (task: TeamTask) => {
    startTransition(async () => {
      try {
        await setTaskStatus(task.id, task.status !== "DONE");
        await load();
      } catch {
        setError("That did not save. Please try again.");
      }
    });
  };

  const remove = async (task: TeamTask) => {
    const ok = await confirm({
      title: "Remove this task?",
      body: `“${task.title}” will disappear from their dashboard.`,
      confirmLabel: "Remove",
      destructive: true,
    });
    if (!ok) return;
    startTransition(async () => {
      try {
        await deleteTask(task.id);
        await load();
        toast.success("Removed.");
      } catch {
        toast.error("That did not delete. Please try again.");
      }
    });
  };

  const open = tasks.filter(t => t.status !== "DONE");

  return (
    <div className="animate-in fade-in duration-300 ease-cg mx-auto max-w-5xl pb-16">
      {dialog}
      <div className="mb-8">
        <p className="cg-eyebrow">Assignments</p>
        <h1 className="mt-2 text-4xl">Tasks</h1>
        <p className="mt-2 text-base">
          Give your team jobs for the day. They appear on that person&apos;s dashboard.
        </p>
      </div>

      {error && (
        <div role="alert" className="cg-callout mb-6 flex items-center gap-3 text-sm text-status-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="cg-card mb-8">
        <h2 className="cg-eyebrow mb-4 block text-sage">Assign a task</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={draft.title}
            onChange={e => setDraft({ ...draft, title: e.target.value })}
            placeholder="What needs doing?"
            className={cn(field, "sm:col-span-2")}
          />
          <input
            value={draft.detail}
            onChange={e => setDraft({ ...draft, detail: e.target.value })}
            placeholder="Any detail they need (optional)"
            className={cn(field, "sm:col-span-2")}
          />
          <select
            value={draft.assigneeId}
            onChange={e => setDraft({ ...draft, assigneeId: e.target.value })}
            aria-label="Who is it for"
            className={field}
          >
            <option value="">Who is it for?</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>
                {s.name ?? s.email}
                {s.title ? ` — ${s.title}` : ""}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={draft.dueDate}
            onChange={e => setDraft({ ...draft, dueDate: e.target.value })}
            aria-label="Due date"
            className={field}
          />
          <select
            value={draft.priority}
            onChange={e => setDraft({ ...draft, priority: e.target.value })}
            aria-label="Priority"
            className={field}
          >
            <option value="NORMAL">Normal</option>
            <option value="HIGH">Priority</option>
          </select>
          <button
            onClick={assign}
            disabled={isPending || !draft.title.trim() || !draft.assigneeId}
            className="cg-btn-primary"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Assign
          </button>
        </div>
      </div>

      <div className="cg-card overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-ui-border bg-ui-bg-alt p-5">
          <h2 className="text-lg">Open and due today</h2>
          <span className="cg-pill-neutral">{open.length} open</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 p-16 text-sm text-sage">
            <Loader2 className="h-5 w-5 animate-spin" />
            One moment.
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-16 text-center text-sm text-sage">
            No tasks for today. Assign one above.
          </div>
        ) : (
          <ul className="divide-y divide-ui-border">
            {tasks.map(task => {
              const done = task.status === "DONE";
              const isOverdue = !done && task.dueDate < today;
              return (
                <li
                  key={task.id}
                  className="flex items-start gap-3 p-4 transition-colors hover:bg-ui-bg-alt"
                >
                  <button
                    onClick={() => toggle(task)}
                    disabled={isPending}
                    aria-label={done ? `Reopen ${task.title}` : `Mark ${task.title} done`}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                      done
                        ? "border-status-success bg-status-success text-white"
                        : "border-ui-border hover:border-accent"
                    )}
                  >
                    {done && <Check className="h-3 w-3" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "flex flex-wrap items-center gap-2 font-medium",
                        done ? "text-sage line-through" : "text-ui-text-primary"
                      )}
                    >
                      {task.title}
                      {!done && task.priority === "HIGH" && (
                        <span className="cg-pill-warning">Priority</span>
                      )}
                      {isOverdue && <span className="cg-pill-error">Overdue</span>}
                    </p>
                    {task.detail && (
                      <p className="mt-0.5 text-sm text-ui-text-secondary">{task.detail}</p>
                    )}
                    <p className="cg-meta mt-1 flex flex-wrap items-center gap-x-2 text-sage">
                      <span className="font-medium text-accent-on-surface">
                        {task.assignee.name ?? task.assignee.email}
                      </span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {task.dueDate}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => remove(task)}
                    disabled={isPending}
                    aria-label={`Remove ${task.title}`}
                    className="shrink-0 rounded-full p-2 text-sage transition-colors hover:bg-status-error-soft hover:text-status-error disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
