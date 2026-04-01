"use client";
import { useAuth } from "@/lib/auth-context";
import { Clock, AlertTriangle, FileText, ArrowRight, Activity, CalendarDays, Loader2 } from "lucide-react";
import Link from "next/link";
import { fetchMySubmissions } from "@/app/actions/submissions";
import { StatusBadge } from "@/components/StatusBadge";
import { useState, useEffect } from "react";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMySubmissions().then(data => {
      setMySubmissions(data);
      setIsLoading(false);
    });
  }, []);
  
  if (!user) return null;

  const actionRequired = mySubmissions.filter(s => ["revision-required"].includes(s.status));
  const recent = mySubmissions.slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-900 tracking-tight">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-slate-500 mt-2 text-lg">Here is your stewardship overview for today.</p>
        </div>
        
        {/* Current Duty Status Card */}
        <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
            <Activity className="w-5 h-5 text-accent-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Duty</p>
            <p className="font-semibold text-brand-900">{user.title}</p>
          </div>
        </div>
      </div>

      {/* Action Cards (High Priority) */}
      <div>
        <h2 className="text-lg font-semibold text-brand-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Action Required
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actionRequired.length === 0 ? (
            <div className="col-span-full bg-white p-6 rounded-2xl border border-slate-200 border-dashed text-center">
              <p className="text-slate-500">No immediate actions required.</p>
            </div>
          ) : (
            actionRequired.map(sub => (
              <div key={sub.id} className="bg-white rounded-2xl p-6 border-l-4 border-orange-500 shadow-sm outline border-slate-200 outline-1 outline-transparent hover:outline-orange-200 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <StatusBadge status={sub.status} />
                  <span className="text-xs font-medium text-slate-400">{new Date(sub.updatedAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-semibold text-lg text-brand-900 capitalize mb-1">
                  {sub.type} Update
                </h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  Manager requested revisions on submission {sub.id}. Please review feedback thread.
                </p>
                <Link href={`/employee/submissions/${sub.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                  Review Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions */}
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-lg font-semibold text-brand-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-500" />
            Quick Submissions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/employee/submissions/new/timesheet" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow hover:border-brand-300 transition-all group flex items-start gap-4">
              <div className="p-3 bg-brand-50 rounded-xl group-hover:bg-brand-100 transition-colors">
                <Clock className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-900">Log Timesheet</h3>
                <p className="text-sm text-slate-500 mt-1">Submit your daily or weekly hours.</p>
              </div>
            </Link>
            
            <Link href="/employee/submissions/new/transfer" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow hover:border-brand-300 transition-all group flex items-start gap-4">
              <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
                <Activity className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-900">Transfer Record</h3>
                <p className="text-sm text-slate-500 mt-1">Log a decedent transfer operation.</p>
              </div>
            </Link>

            <Link href="/employee/submissions/new/incident" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow hover:border-brand-300 transition-all group flex items-start gap-4">
              <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-900">Incident Report</h3>
                <p className="text-sm text-slate-500 mt-1">Report a safety or operational issue.</p>
              </div>
            </Link>

            <Link href="/employee/submissions/new/time-off" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow hover:border-brand-300 transition-all group flex items-start gap-4">
              <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-900">Request Time Off</h3>
                <p className="text-sm text-slate-500 mt-1">Book your scheduled days off.</p>
              </div>
            </Link>
            
            <Link href="/employee/schedule" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow hover:border-brand-300 transition-all group flex items-start gap-4">
              <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                <CalendarDays className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-900">View Schedule</h3>
                <p className="text-sm text-slate-500 mt-1">Check your upcoming assignments.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Submissions Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-900">Recent Activity</h2>
            <Link href="/employee/submissions" className="text-sm font-medium text-brand-600 hover:text-brand-800">View All</Link>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[150px]">
            {isLoading ? (
               <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
            ) : recent.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No recent activity.</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recent.map(sub => (
                  <li key={sub.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <Link href={`/employee/submissions/${sub.id}`} className="flex items-center justify-between gap-4">
                      <div className="overflow-hidden">
                        <p className="font-semibold text-sm text-brand-900 truncate capitalize">{sub.type}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{new Date(sub.createdAt).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={sub.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
