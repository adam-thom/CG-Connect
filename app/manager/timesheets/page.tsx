"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_SUBMISSIONS, MOCK_USERS } from "@/lib/mock-data";
import { CheckCircle2, XCircle, Clock, SaveAll, Activity } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ManagerTimesheets() {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState(() => 
    MOCK_SUBMISSIONS
      .filter(s => s.type === 'timesheet' && s.status === 'pending')
      .map(t => {
        const submitter = MOCK_USERS.find(u => u.id === t.submitterId);
        return { ...t, submitterName: submitter?.name || "Unknown Staff" };
      })
  );

  if (!user) return null;

  const totalHours = timesheets.reduce((acc, curr) => acc + (curr.data.totalHours || 0), 0);

  const handleAction = (id: string, action: 'approved' | 'revision-required') => {
    setTimesheets(prev => prev.filter(t => t.id !== id));
    // In a real app we would fire an API call here
  };

  const handleBatchApprove = () => {
    setTimesheets([]);
    // API call mass update
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-900 tracking-tight">Timesheet Review</h1>
          <p className="text-slate-500 mt-2 text-lg">Verify and sign-off on reported hours.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-brand-900 text-white rounded-3xl p-6 shadow-md flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-800 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
          <div className="relative z-10">
            <p className="text-brand-200 font-medium uppercase tracking-wider text-sm mb-1">Total Pending</p>
            <p className="text-5xl font-bold tracking-tight">{timesheets.length}</p>
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center relative z-10 mix-blend-overlay">
            <Clock className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="bg-orange-50 text-orange-900 border border-orange-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-orange-700 font-medium uppercase tracking-wider text-sm mb-1">Accrued Review Hours</p>
            <p className="text-5xl font-bold tracking-tight">{totalHours}<span className="text-2xl text-orange-600 font-semibold ml-2">hrs</span></p>
          </div>
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center relative z-10 text-orange-500 shrink-0">
            <Activity className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-900">Action Required Queue</h2>
          {timesheets.length > 0 && (
            <button 
              onClick={handleBatchApprove}
              className="bg-brand-900 hover:bg-brand-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <SaveAll className="w-4 h-4" /> Batch Approve All
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {timesheets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">You're all caught up!</h3>
              <p className="text-slate-500">There are no timesheets pending review at this time.</p>
            </div>
          ) : (
            timesheets.map(t => (
              <div key={t.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0">
                      {t.submitterName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-brand-900 text-lg">{t.submitterName}</p>
                      <p className="text-sm text-slate-500">{new Date(t.data.date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })} • {t.data.start} to {t.data.end}</p>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">{t.data.totalHours} h</p>
                    <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Calculated</p>
                  </div>

                  <div className="flex items-center gap-2 h-12 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                    <button 
                      onClick={() => handleAction(t.id, 'revision-required')}
                      className="flex-1 md:flex-none p-3 h-full rounded-xl text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 font-medium transition-colors flex items-center justify-center gap-2"
                      title="Reject / Request Revision"
                    >
                      <XCircle className="w-5 h-5" /> 
                      <span className="md:hidden lg:inline text-sm">Reject</span>
                    </button>
                    <button 
                      onClick={() => handleAction(t.id, 'approved')}
                      className="flex-1 md:flex-none px-6 h-full rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
