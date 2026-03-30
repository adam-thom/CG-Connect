"use client";

import { useAuth } from "@/lib/auth-context";
import { Activity, ShieldCheck, FileText, CheckCircle2, XCircle } from "lucide-react";
import { MOCK_SUBMISSIONS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";

export default function EmployeeProfile() {
  const { user } = useAuth();
  if (!user) return null;

  const recentSubmissions = MOCK_SUBMISSIONS.filter(s => s.submitterId === user.id).slice(0, 4);

  const certifications = [
    { name: "NFDA Board Certification", expires: "2028-05-15", status: "Active" },
    { name: "Emergency Response Handling", expires: "2026-11-01", status: "Active" },
    { name: "OSHA Bloodborne Pathogens", expires: "2025-10-12", status: "Expired" },
    { name: "Advanced Crematory Operations", expires: "2027-02-28", status: "Active" },
  ];

  return (
    <div className="animate-in fade-in duration-500 pb-12 space-y-8 max-w-5xl mx-auto">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
        
        <div className="relative z-10 w-24 h-24 rounded-full bg-brand-900 border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-white shrink-0">
          {user.name.charAt(0)}
        </div>
        
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-brand-900">{user.name}</h1>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold uppercase tracking-wider">
              {user.id}
            </span>
          </div>
          <p className="text-lg text-slate-500">{user.title} • {user.department}</p>
        </div>

        <div className="relative z-10 bg-accent-50 border border-accent-200 p-5 rounded-2xl w-full md:w-auto shrink-0 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-white rounded-xl shadow-sm text-accent-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-accent-800 uppercase tracking-wider mb-0.5">Current Duty</p>
            <p className="text-brand-900 font-bold">{user.title.includes('Lead') ? 'On-Call Lead' : 'Active Shift'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Certifications Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-bold text-brand-900">Professional Licenses</h2>
          </div>
          <div className="p-0 flex-1">
            <ul className="divide-y divide-slate-100">
              {certifications.map((cert, idx) => {
                const isActive = cert.status === "Active";
                return (
                  <li key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-semibold text-brand-900 mb-1">{cert.name}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        Valid until: {new Date(cert.expires).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3.5 h-3.5" /> Expired
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Recent Submissions Carousel Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg font-bold text-brand-900">Recent Records</h2>
            </div>
            <Link href="/employee/submissions" className="text-sm font-semibold text-brand-600 hover:text-brand-800">
              View All
            </Link>
          </div>
          <div className="p-6 space-y-4">
            {recentSubmissions.map(sub => (
              <Link key={sub.id} href={`/employee/submissions/${sub.id}`} className="block p-4 border border-slate-200 rounded-xl hover:border-brand-300 hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-brand-900 capitalize flex items-center gap-2">
                      {sub.type} Report
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Submitted: {new Date(sub.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>
              </Link>
            ))}
            {recentSubmissions.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-8">
                No recent records found.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
