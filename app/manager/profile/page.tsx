"use client";

import { useAuth } from "@/lib/auth-context";
import { Activity, ShieldCheck, FileText, CheckCircle2, XCircle } from "lucide-react";
import { MOCK_SUBMISSIONS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { PasswordUpdateForm } from "@/components/PasswordUpdateForm";
import Link from "next/link";

export default function ManagerProfile() {
  const { user } = useAuth();
  if (!user) return null;

  const recentReviews = MOCK_SUBMISSIONS.filter(s => s.status === 'pending').slice(0, 4);


  return (
    <div className="animate-in fade-in duration-500 pb-12 space-y-8 max-w-5xl mx-auto">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-50 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
        
        <div className="relative z-10 w-24 h-24 rounded-full bg-accent-900 border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-white shrink-0">
          {user.name.charAt(0)}
        </div>
        
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-accent-900">{user.name}</h1>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold uppercase tracking-wider">
              {user.id}
            </span>
          </div>
          <p className="text-lg text-slate-500">{user.title} • {user.department}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        

        {/* Pending Reviews Carousel Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-accent-500" />
              <h2 className="text-lg font-bold text-accent-900">Pending Actions</h2>
            </div>
            <Link href="/manager/dashboard" className="text-sm font-semibold text-accent-600 hover:text-accent-800">
              View Board
            </Link>
          </div>
          <div className="p-6 space-y-4">
            {recentReviews.map(sub => (
              <div key={sub.id} className="block p-4 border border-slate-200 rounded-xl hover:border-accent-300 hover:shadow-sm transition-all group cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-accent-900 capitalize flex items-center gap-2">
                      {sub.type}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Review ID: {sub.id}</p>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <PasswordUpdateForm />

    </div>
  );
}
