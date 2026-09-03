"use client";

import { useAuth } from "@/lib/auth-context";
import { CheckSquare, Activity, Users, FolderOpen, ArrowRight, Loader2, ShieldCheck, Download } from "lucide-react";
import Link from "next/link";
import { NewsFeed } from "@/components/NewsFeed";
import { TodayPanel } from "@/components/TodayPanel";
import { fetchManagerQueue, fetchDashboardCounts } from "@/app/actions/submissions";
import { formatDateTime } from "@/lib/utils";
import { useState, useEffect } from "react";

type MetricTone = "brand" | "neutral";

function MetricCard({
  href,
  icon: Icon,
  value,
  label,
  pill,
  tone = "neutral",
}: {
  href: string;
  icon: React.ElementType;
  value: React.ReactNode;
  label: string;
  pill?: string;
  tone?: MetricTone;
}) {
  return (
    <Link
      href={href}
      className="cg-card group flex min-h-[190px] flex-col justify-between p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300"
    >
      <div className="mb-6 flex items-start justify-between">
        <div
          className={
            tone === "brand"
              ? "flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-accent-on-surface transition-transform group-hover:scale-110"
              : "flex h-14 w-14 items-center justify-center rounded-2xl bg-ui-bg-alt text-ui-text-secondary transition-transform group-hover:scale-110"
          }
        >
          <Icon className="h-7 w-7" />
        </div>
        {pill && <span className="cg-pill-brand">{pill}</span>}
      </div>
      <div>
        {/* Stat figures sit in accent-dark per the spec. Serif, never bold. */}
        <p className="font-serif text-4xl leading-none text-accent-on-surface">{value}</p>
        <p className="mt-2.5 flex items-center gap-2 cg-eyebrow text-sage transition-colors group-hover:text-accent">
          {label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  );
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    pendingTimesheets: 0,
    activeTransfers: 0,
    staff: 0,
    documents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetchManagerQueue(), fetchDashboardCounts()])
      .then(([queue, c]) => {
        if (!active) return;
        setAllSubmissions(queue);
        setCounts(c);
      })
      .catch(err => console.error("Could not load the dashboard", err))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!user) return null;

  /**
   * Downloads the current review queue as CSV. Values are quoted and internal
   * quotes doubled, so a comma in a name cannot shift the columns.
   */
  const exportCsv = () => {
    const rows = [
      ['Submitted', 'Type', 'Staff member', 'Status'],
      ...allSubmissions.map(s => [
        new Date(s.createdAt).toISOString(),
        s.type,
        s.submitterName ?? '',
        s.status,
      ]),
    ];
    const csv = rows
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join("\r\n");

    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `cg-review-queue-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingTimesheets = allSubmissions.filter(s => s.type === 'timesheet' && s.status === 'pending');
  const allPending = allSubmissions.filter(s => s.status === 'pending');

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-cg">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="cg-eyebrow">Operational Overview</p>
          <h1 className="mt-2 text-4xl lg:text-5xl">Facility Overview</h1>
          <p className="mt-3 text-base font-medium text-ui-text-secondary">
            Operational intelligence for{" "}
            <span className="font-medium text-ui-text-primary">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            .
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCsv} disabled={isLoading} className="cg-btn-secondary">
            <Download className="h-4 w-4" />
            Export queue
          </button>
        </div>
      </div>

      {/* The department's day: every service running, plus this manager's own
        * tasks. Scoped to "team" so it is not limited to their own roster. */}
      <TodayPanel scope="team" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 stagger-entrance">
        <MetricCard
          href="/manager/timesheets"
          icon={CheckSquare}
          value={isLoading ? "—" : counts.pendingTimesheets}
          label="Timesheets Pending"
          pill={counts.pendingTimesheets > 0 ? "Action" : undefined}
          tone="brand"
        />
        <MetricCard
          href="/manager/submissions"
          icon={Activity}
          value={isLoading ? "—" : counts.activeTransfers}
          label="Transfers Pending"
          tone="brand"
        />
        <MetricCard
          href="/manager/staff"
          icon={Users}
          value={isLoading ? "—" : counts.staff}
          label="Staff"
        />
        <MetricCard
          href="/manager/docs"
          icon={FolderOpen}
          value={isLoading ? "—" : counts.documents}
          label="Documents"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="cg-card overflow-hidden p-0 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ui-border/70 px-8 py-6">
            <h2 className="text-xl">Operational Timeline</h2>
            <Link
              href="/manager/submissions"
              className="cg-eyebrow transition-colors hover:text-accent-on-surface"
            >
              View all
            </Link>
          </div>
          <div className="p-8 lg:p-10">
            <div className="relative space-y-10">
              <div className="absolute bottom-2 left-[19px] top-2 w-px bg-ui-border" />

              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-300" />
                </div>
              ) : allPending.length === 0 ? (
                <div className="py-4 pl-12 text-sm font-medium text-ui-text-secondary">
                  Nothing needs your attention today.
                </div>
              ) : (
                allPending.slice(0, 3).map(sub => (
                  <div key={sub.id} className="group relative pl-12">
                    <div className="absolute left-0 top-1 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-ui-border bg-ui-surface shadow-sm transition-colors group-hover:border-brand-400">
                      <div className="h-3 w-3 rounded-full bg-brand-500 ring-4 ring-brand-100" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ui-text-primary transition-colors group-hover:text-accent-on-surface">
                        {sub.submitterName}{" "}
                        <span className="font-medium lowercase text-ui-text-secondary">initiated a</span>{" "}
                        <span className="capitalize text-accent-on-surface">{sub.type}</span>
                      </p>
                      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-ui-text-secondary">
                        {formatDateTime(sub.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}

              <div className="group relative pl-12">
                <div className="absolute left-0 top-1 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-ui-border bg-ui-surface shadow-sm">
                  <div className="h-3 w-3 rounded-full bg-slate-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ui-text-primary">
                    Automated System Pulse{" "}
                    <span className="font-medium lowercase text-ui-text-secondary">completed successfully</span>
                  </p>
                  <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-ui-text-secondary">
                    Today at 3:00 AM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Replaces a decorative "Facility Access" panel whose only button did
          * nothing. This says what is actually waiting and takes you to it. */}
        <div className="cg-panel-accent flex flex-col p-8 lg:p-10">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-2xl text-white">Needs your attention</h3>
          <p className="mt-4 text-sm leading-relaxed text-white/85">
            {isLoading
              ? "One moment."
              : allPending.length === 0
              ? "Nothing is waiting on you. Everything submitted has been reviewed."
              : allPending.length === 1
              ? "One record is waiting for your review."
              : `${allPending.length} records are waiting for your review.`}
          </p>
          <Link
            href="/manager/submissions"
            className="mt-auto w-full rounded-full bg-white px-6 py-3.5 text-center text-sm font-medium text-accent-dark transition-colors hover:bg-brand-50"
          >
            {allPending.length === 0 ? "Open the review queue" : "Review now"}
          </Link>
        </div>
      </div>

      {/* Company news, written by the communications team. */}
      <section className="pt-2">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="cg-eyebrow">Company news</p>
            <h2 className="mt-1 text-2xl">Recent news &amp; updates</h2>
          </div>
          <Link
            href="/news"
            className="shrink-0 text-sm text-accent-on-surface transition-colors hover:text-accent-dark"
          >
            View all
          </Link>
        </div>
        <NewsFeed limit={6} />
      </section>

    </div>
  );
}
