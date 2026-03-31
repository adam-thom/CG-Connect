"use client";

import { useAuth } from "@/lib/auth-context";
import { fetchMySubmissions } from "@/app/actions/submissions";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";
import { Search, Filter, ArrowRight, FilePlus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function EmployeeSubmissions() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMySubmissions().then(data => {
      setMySubmissions(data);
      setIsLoading(false);
    });
  }, []);

  if (!user) return null;

  const filteredData = mySubmissions.filter(s => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-900 tracking-tight">My Submissions</h1>
          <p className="text-slate-500 mt-2 text-lg">Track the status of your records and requests.</p>
        </div>
        <div>
          <Link href="/employee/dashboard" className="bg-accent-600 hover:bg-accent-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
            <FilePlus className="w-5 h-5" />
            New Submission
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2 p-1 bg-slate-200/50 rounded-lg self-start">
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
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search ID or type..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500" />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    No submissions found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredData.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => window.location.href = `/employee/submissions/${sub.id}`}>
                    <td className="px-6 py-4 font-medium text-brand-900">{sub.id}</td>
                    <td className="px-6 py-4 capitalize font-medium text-slate-700">{sub.type}</td>
                    <td className="px-6 py-4">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/employee/submissions/${sub.id}`} 
                        className="inline-flex items-center justify-center p-2 rounded-lg text-brand-600 hover:bg-brand-50 hover:text-brand-800 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
