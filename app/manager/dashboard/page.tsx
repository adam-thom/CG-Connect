"use client";

import { useAuth } from "@/lib/auth-context";
import { CheckSquare, Activity, Users, FolderOpen, ArrowRight, Loader2, CloudSnow } from "lucide-react";
import Link from "next/link";
import { fetchManagerQueue } from "@/app/actions/submissions";
import { useState, useEffect } from "react";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchManagerQueue().then(data => {
      setAllSubmissions(data);
      setIsLoading(false);
    });
  }, []);

  if (!user) return null;

  const pendingTimesheets = allSubmissions.filter(s => s.type === 'timesheet' && s.status === 'pending');
  const allPending = allSubmissions.filter(s => s.status === 'pending');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Facility Overview</h1>
          <p className="text-slate-500 mt-2 text-lg">System-wide operational metrics for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric'})}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/manager/timesheets" className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-colors group-hover:bg-amber-100"></div>
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center -ml-1">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">{pendingTimesheets.length}</p>
            <p className="text-sm font-semibold text-slate-500 flex items-center gap-1">
              Timesheets Pending <ArrowRight className="w-4 h-4 text-brand-500 opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all" />
            </p>
          </div>
        </Link>


        
        <Link href="/manager/submissions" className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-colors group-hover:bg-rose-100"></div>
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center -ml-1">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">{allPending.length}</p>
            <p className="text-sm font-semibold text-slate-500 flex items-center gap-1">
              Forms in Review Queue <ArrowRight className="w-4 h-4 text-brand-500 opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all" />
            </p>
          </div>
        </Link>



        <Link href="/manager/capex" className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-colors group-hover:bg-teal-100"></div>
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center -ml-1">
              <FolderOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">CapEx</p>
            <p className="text-sm font-semibold text-slate-500 flex items-center gap-1">
              Capital Expenditures <ArrowRight className="w-4 h-4 text-brand-500 opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all" />
            </p>
          </div>
        </Link>

        <Link href="/employee/submissions/new/snow-log" className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-colors group-hover:bg-sky-100"></div>
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center -ml-1">
              <CloudSnow className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-1 tracking-tight truncate px-1">Snow Log</p>
            <p className="text-sm font-semibold text-slate-500 flex items-center gap-1">
              File New Removal Log <ArrowRight className="w-4 h-4 text-brand-500 opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all shrink-0" />
            </p>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden pt-1 pb-4">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">System Activity Timeline</h2>
        </div>
        <div className="p-6">
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
            {isLoading ? (
               <div className="pl-6"><Loader2 className="w-5 h-5 animate-spin text-brand-500" /></div>
            ) : allPending.length === 0 ? (
               <div className="pl-6 text-sm text-slate-500">No pending submissions in queue.</div>
            ) : allPending.slice(0, 3).map((sub, i) => (
              <div key={sub.id} className="relative pl-8">
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-white ring-2 ring-amber-100 animate-pulse"></div>
                <p className="text-sm font-semibold text-slate-900">{sub.submitterName} submitted a new <span className="capitalize">{sub.type}</span></p>
                <p className="text-xs text-slate-500 mt-1">{new Date(sub.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
            ))}
            <div className="relative pl-8">
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-brand-500 border-2 border-white ring-2 ring-brand-100"></div>
              <p className="text-sm font-semibold text-brand-900">System Backup Completed</p>
              <p className="text-xs text-slate-500 mt-1">Today at 3:00 AM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
