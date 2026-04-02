"use client";

import { useAuth } from "@/lib/auth-context";
import { fetchAdminQueue } from "@/app/actions/submissions";
import { Search, Filter, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminSubmissionsQueue() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminQueue().then(data => {
      setAllSubmissions(data);
      setIsLoading(false);
    });
  }, []);

  if (!user || user.role !== 'admin') return null;
  
  const filteredData = allSubmissions.filter(s => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-900 tracking-tight">Master Submissions Queue</h1>
          <p className="text-slate-500 mt-2 text-lg">System-wide overview of all submitted forms and requests.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 p-1 bg-slate-200/50 rounded-lg self-start">
            {['all', 'pending', 'revision-required', 'approved', 'finalized'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all",
                  filter === tab 
                    ? "bg-white text-brand-900 shadow-sm" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                {tab.replace('-', ' ')}
                {tab === 'pending' && <span className="ml-2 bg-amber-100 text-amber-700 py-0.5 px-1.5 rounded text-xs">{allSubmissions.filter(s => s.status === 'pending').length}</span>}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72 flex items-center gap-2">
            <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 bg-white shadow-sm">
              <Filter className="w-4 h-4" />
            </button>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search staff, ID, or type..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Submitter</th>
                <th className="px-6 py-4">Submission ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Submitted On</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500" />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                    Queue is empty for the active filter.
                  </td>
                </tr>
              ) : (
                filteredData.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-brand-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">{sub.submitterName.charAt(0)}</div>
                        {sub.submitterName}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{sub.id}</td>
                    <td className="px-6 py-4 capitalize font-medium text-slate-700">{sub.type}</td>
                    <td className="px-6 py-4">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={sub.type === 'capex' ? `/admin/capex/${sub.id}` : `/manager/submissions/${sub.id}`} 
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 hover:text-brand-900 transition-colors font-semibold text-xs"
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
