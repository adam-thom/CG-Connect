"use client";

import { useAuth } from "@/lib/auth-context";
import { Users, FolderOpen, ArrowRight, ShieldCheck } from "lucide-react";
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  
  if (!user || user.role !== "admin") return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -mr-20 -mt-20 z-0 pointer-events-none opacity-60"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-100 text-brand-700 rounded-lg">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
          </div>
          <p className="text-slate-500 max-w-xl text-base sm:text-lg">Central hub for overriding system parameters, deploying resources, and orchestrating profiles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        <Link href="/admin/users" className="group bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm hover:border-[#91665b]/30 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[220px]">
           <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                 <Users className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Staff Directory</h2>
              <p className="text-sm sm:text-base text-slate-500 line-clamp-2 sm:line-clamp-3 leading-relaxed">Instantly manage all registered employee and manager accounts, mapping their physical locations via Routing Tags natively.</p>
           </div>
           
           <div className="flex items-center text-[#91665b] text-sm sm:text-base font-bold mt-6 sm:mt-8 pt-4 border-t border-slate-100">
              Access Directory <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
           </div>
        </Link>
        
        <Link href="/admin/docs" className="group bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm hover:border-[#91665b]/30 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[220px]">
           <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                 <FolderOpen className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Document Control</h2>
              <p className="text-sm sm:text-base text-slate-500 line-clamp-2 sm:line-clamp-3 leading-relaxed">Securely upload updated PDFs and Handbooks into the global registry, dynamically synchronizing out to standard employee portals.</p>
           </div>

           <div className="flex items-center text-[#91665b] text-sm sm:text-base font-bold mt-6 sm:mt-8 pt-4 border-t border-slate-100">
              Manage Documents <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
           </div>
        </Link>
        <Link href="/admin/capex" className="group bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm hover:border-[#91665b]/30 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[220px]">
           <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                 <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">CapEx Oversight</h2>
              <p className="text-sm sm:text-base text-slate-500 line-clamp-2 sm:line-clamp-3 leading-relaxed">Allocate and review Capital Expenditure budgets globally across all operational locations.</p>
           </div>

           <div className="flex items-center text-[#91665b] text-sm sm:text-base font-bold mt-6 sm:mt-8 pt-4 border-t border-slate-100">
              Manage Budgets <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
           </div>
        </Link>
      </div>
    </div>
  );
}
