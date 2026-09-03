"use client";

import { useAuth } from "@/lib/auth-context";
import { Activity, ShieldCheck, FileText, CheckCircle2, XCircle } from "lucide-react";
import { MOCK_SUBMISSIONS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { PasswordUpdateForm } from "@/components/PasswordUpdateForm";
import Link from "next/link";
import { formatCalendarDate } from "@/lib/utils";

export default function ManagerProfile() {
  const { user } = useAuth();
  if (!user) return null;

  const recentReviews = MOCK_SUBMISSIONS.filter(s => s.status === 'pending').slice(0, 4);

  const certifications = [
    { name: "NFDA Board Certification", expires: "2028-05-15", status: "Active" },
    { name: "Emergency Response Handling", expires: "2026-11-01", status: "Active" },
    { name: "OSHA Bloodborne Pathogens", expires: "2025-10-12", status: "Expired" },
    { name: "Advanced Crematory Operations", expires: "2027-02-28", status: "Active" },
  ];

  return (
    <div className="animate-in fade-in duration-300 pb-12 space-y-8 max-w-5xl mx-auto ease-cg">
      
      {/* Profile Header */}
      <div className="bg-ui-surface rounded-3xl p-8 border border-ui-border shadow-sm flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 z-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl"></div>
        
        <div className="relative z-10 w-24 h-24 rounded-full bg-accent border-4 border-ui-border shadow-md flex items-center justify-center text-3xl font-bold text-white shrink-0">
          {user.name.charAt(0)}
        </div>
        
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl text-ui-text-primary">{user.name}</h1>
            <span className="px-3 py-1 bg-ui-bg-alt text-ui-text-secondary rounded-full text-xs font-semibold uppercase tracking-wider">
              {user.id}
            </span>
          </div>
          <p className="text-lg text-sage">{user.title} • {user.department}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Certifications Card */}
        <div className="bg-ui-surface rounded-2xl border border-ui-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-ui-border flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg text-ui-text-primary">Professional Licenses</h2>
          </div>
          <div className="p-0 flex-1">
            <ul className="divide-y divide-ui-border">
              {certifications.map((cert, idx) => {
                const isActive = cert.status === "Active";
                return (
                  <li key={idx} className="p-5 flex items-center justify-between hover:bg-ui-bg-alt transition-colors">
                    <div>
                      <p className="font-semibold text-ui-text-primary mb-1">{cert.name}</p>
                      <p className="text-sm text-sage flex items-center gap-2">
                        Valid until: {formatCalendarDate(cert.expires)}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-status-success-soft text-status-success border border-status-success/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-status-error-soft text-status-error border border-status-error/30">
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

        {/* Pending Reviews Carousel Widget */}
        <div className="bg-ui-surface rounded-2xl border border-ui-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-ui-border flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg text-ui-text-primary">Pending Actions</h2>
            </div>
            <Link href="/manager/dashboard" className="text-sm font-semibold text-accent-on-surface hover:text-brand-800">
              View Board
            </Link>
          </div>
          <div className="p-6 space-y-4">
            {recentReviews.map(sub => (
              <div key={sub.id} className="block p-4 border border-ui-border rounded-xl hover:border-brand-300 hover:shadow-sm transition-all group cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-ui-text-primary capitalize flex items-center gap-2">
                      {sub.type}
                    </h3>
                    <p className="text-sm text-sage mt-1">Review ID: {sub.id}</p>
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
