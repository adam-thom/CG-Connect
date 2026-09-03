"use client";

import { useAuth } from "@/lib/auth-context";
import { fetchManagerQueue, fetchQueueContext } from "@/app/actions/submissions";
import { CheckSquare, Search, Filter, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";

export default function ManagerSubmissionsQueue() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("pending");
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ctx, setCtx] = useState<{ hasRoutableTags: boolean; isAdmin: boolean; untriaged: number } | null>(null);

  useEffect(() => {
    fetchQueueContext().then(setCtx).catch(() => {});
    fetchManagerQueue().then(data => {
      setAllSubmissions(data);
      setIsLoading(false);
    });
  }, []);

  if (!user) return null;
  
  const filteredData = allSubmissions.filter(s => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  return (
    <div className="animate-in fade-in duration-300 pb-12 ease-cg">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl text-ui-text-primary tracking-tight">Review Queue</h1>
          <p className="text-sage mt-2 text-lg">Manage and approve all staff records system-wide.</p>
        </div>
      </div>

      <div className="bg-ui-surface rounded-2xl shadow-sm border border-ui-border overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-ui-border bg-ui-bg-alt flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2 p-1 bg-slate-200/50 rounded-lg self-start">
            {['pending', 'revision-required', 'approved', 'all'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all",
                  filter === tab 
                    ? "bg-ui-surface text-ui-text-primary shadow-sm" 
                    : "text-ui-text-secondary hover:text-ui-text-primary hover:bg-slate-200/50"
                )}
              >
                {tab.replace('-', ' ')}
                {tab === 'pending' && <span className="ml-2 bg-status-warning-soft text-status-warning py-0.5 px-1.5 rounded text-xs">{allSubmissions.filter(s => s.status === 'pending').length}</span>}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72 flex items-center gap-2">
            <button className="p-2 border border-ui-border rounded-lg text-sage hover:bg-ui-bg-alt bg-ui-surface shadow-sm">
              <Filter className="w-4 h-4" />
            </button>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-sage" />
              </div>
              <input
                type="text"
                placeholder="Search staff, ID, or type..."
                className="block w-full pl-10 pr-3 py-2 border border-ui-border rounded-lg text-sm bg-ui-surface focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ui-text-secondary">
            <thead className="bg-ui-bg-alt/50 text-sage text-xs uppercase tracking-wider font-semibold border-b border-ui-border">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Submission ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Submitted On</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ui-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sage">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500" />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    {/* An empty queue has two very different causes. Saying which
                      * matters: an untagged manager sees nothing however much
                      * work is waiting, and nothing on screen would explain it. */}
                    {ctx && !ctx.hasRoutableTags ? (
                      <>
                        <p className="text-ui-text-primary">
                          You have no manager tags, so no records are routed to you.
                        </p>
                        <p className="mt-1 text-sm text-sage">
                          An administrator can add one under Tags &amp; roles.
                        </p>
                      </>
                    ) : (
                      <p className="text-sage">No records to review for this filter.</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredData.map(sub => (
                  <tr key={sub.id} className="hover:bg-ui-bg-alt transition-colors">
                    <td className="px-6 py-4 font-semibold text-ui-text-primary">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-accent-on-surface flex items-center justify-center font-bold text-xs">{sub.submitterName.charAt(0)}</div>
                        {sub.submitterName}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{sub.id}</td>
                    <td className="px-6 py-4 capitalize font-medium text-ui-text-secondary">{sub.type}</td>
                    <td className="px-6 py-4">{formatDate(sub.createdAt)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/manager/submissions/${sub.id}`} 
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-brand-50 text-accent-on-surface hover:bg-brand-100 hover:text-ui-text-primary transition-colors font-semibold text-xs"
                      >
                        Review Form
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
