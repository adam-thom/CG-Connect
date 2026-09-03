"use client";

import { useAuth } from "@/lib/auth-context";
import { fetchManagerQueue, updateSubmissionStatusAdmin } from "@/app/actions/submissions";
import { CheckCircle2, XCircle, Clock, SaveAll, Activity, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCalendarDate } from "@/lib/utils";

type Row = {
  id: string;
  submitterName: string;
  data: {
    date: string | Date | null;
    timeIn: string | null;
    timeOut: string | null;
    totalHours: number | null;
  };
};

export default function ManagerTimesheets() {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchManagerQueue()
      .then(rows => {
        if (!active) return;
        setTimesheets(
          rows.filter(r => r.type === "timesheet" && r.status === "pending") as unknown as Row[]
        );
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
  }, []);

  if (!user) return null;

  const totalHours = timesheets.reduce((acc, t) => acc + (t.data.totalHours ?? 0), 0);

  /** Persists the decision, then drops the row. Restores it if the save fails. */
  const decide = async (id: string, status: "APPROVED" | "REJECTED") => {
    setBusyId(id);
    setError(null);
    const snapshot = timesheets;
    try {
      await updateSubmissionStatusAdmin(id, "timesheet", status);
      setTimesheets(prev => prev.filter(t => t.id !== id));
    } catch {
      setTimesheets(snapshot);
      setError("That did not save. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const approveAll = async () => {
    setBusyId("all");
    setError(null);
    const ids = timesheets.map(t => t.id);
    const results = await Promise.allSettled(
      ids.map(id => updateSubmissionStatusAdmin(id, "timesheet", "APPROVED"))
    );
    const failed = ids.filter((_, i) => results[i].status === "rejected");
    setTimesheets(prev => prev.filter(t => failed.includes(t.id)));
    if (failed.length) {
      setError(
        failed.length === 1
          ? "One timesheet did not save. Please try it again."
          : `${failed.length} timesheets did not save. Please try them again.`
      );
    }
    setBusyId(null);
  };

  return (
    <div className="animate-in fade-in duration-300 ease-cg mx-auto max-w-5xl pb-12">
      <div className="mb-8">
        <p className="cg-eyebrow">Review</p>
        <h1 className="mt-2 text-4xl">Timesheet Review</h1>
        <p className="mt-2 text-base">Verify and sign off on reported hours.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="cg-panel-accent relative flex items-center justify-between overflow-hidden">
          <div className="relative z-10">
            <p className="cg-eyebrow mb-1 text-white/80">Awaiting review</p>
            <p className="font-serif text-5xl">{isLoading ? "—" : timesheets.length}</p>
          </div>
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
            <Clock className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="cg-card flex items-center justify-between">
          <div>
            <p className="cg-eyebrow mb-1">Hours in the queue</p>
            <p className="font-serif text-5xl text-accent-on-surface">
              {isLoading ? "—" : totalHours}
              <span className="ml-2 font-sans text-2xl text-accent">hrs</span>
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-accent-on-surface">
            <Activity className="h-8 w-8" />
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="cg-callout mb-6 flex items-center gap-3 text-sm text-status-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="cg-card overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-ui-border bg-ui-bg-alt p-5">
          <h2 className="text-lg">Action required</h2>
          {timesheets.length > 0 && (
            <button
              onClick={approveAll}
              disabled={busyId !== null}
              className="cg-btn-primary min-h-0 py-2 text-sm"
            >
              {busyId === "all" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SaveAll className="h-4 w-4" />
              )}
              Approve all
            </button>
          )}
        </div>

        <div className="divide-y divide-ui-border">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 p-16 text-sm text-sage">
              <Loader2 className="h-5 w-5 animate-spin" />
              One moment.
            </div>
          ) : timesheets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-status-success-soft text-status-success">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl">Nothing to review.</h3>
              <p className="text-sage">No timesheets are waiting on you.</p>
            </div>
          ) : (
            timesheets.map(t => {
              const busy = busyId === t.id || busyId === "all";
              return (
                <div
                  key={t.id}
                  className="flex flex-col justify-between gap-6 p-6 transition-colors hover:bg-ui-bg-alt md:flex-row md:items-center"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-serif text-accent-on-surface">
                      {t.submitterName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-lg text-ui-text-primary">{t.submitterName}</p>
                      <p className="text-sm text-sage">
                        {formatCalendarDate(t.data.date)}
                        {t.data.timeIn && t.data.timeOut && ` · ${t.data.timeIn} to ${t.data.timeOut}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-6">
                    <div className="text-right">
                      <p className="font-serif text-2xl text-ui-text-primary">
                        {t.data.totalHours ?? "—"} h
                      </p>
                      <p className="cg-eyebrow block text-sage">Reported</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decide(t.id, "REJECTED")}
                        disabled={busy}
                        className="flex items-center justify-center gap-2 rounded-full border border-status-error/30 bg-status-error-soft px-4 py-2.5 text-sm font-medium text-status-error transition-colors hover:border-status-error/60 disabled:pointer-events-none disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Send back
                      </button>
                      <button
                        onClick={() => decide(t.id, "APPROVED")}
                        disabled={busy}
                        className="flex items-center justify-center gap-2 rounded-full border border-status-success/30 bg-status-success-soft px-5 py-2.5 text-sm font-medium text-status-success transition-colors hover:border-status-success/60 disabled:pointer-events-none disabled:opacity-50"
                      >
                        {busy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
