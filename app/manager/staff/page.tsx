"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_USERS } from "@/lib/mock-data";
import { Users, AlertTriangle, Search, ShieldAlert, Mail } from "lucide-react";

export default function ManagerStaff() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="animate-in fade-in duration-500 pb-12 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-900 tracking-tight">Staff Management</h1>
          <p className="text-slate-500 mt-2 text-lg">Directory of all active personnel and role permissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stats & Warnings */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
            <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3 text-brand-700">
              <Users className="w-7 h-7" />
            </div>
            <p className="text-4xl font-bold text-brand-900">{MOCK_USERS.length}</p>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">Active Staff</p>
          </div>

          <div className="bg-accent-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-600 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
            <div className="relative z-10 flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-accent-300 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-1">Security Audit</h3>
                <p className="text-accent-100 text-sm leading-relaxed mb-4">
                  Legacy role permissions detected on some regional accounts. Review access levels.
                </p>
                <button className="bg-white text-accent-900 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-accent-50 transition-colors w-full">
                  Run Audit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Grid */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
              <h2 className="font-semibold text-brand-900 text-lg">Personnel Roster</h2>
              <div className="relative w-full max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Search name or ID..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {MOCK_USERS.map(staff => {
                const isNoRole = staff.role === "employee" && !staff.title.includes('Lead');
                return (
                  <div key={staff.id} className="border border-slate-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-sm transition-all group relative overflow-hidden">
                    {/* Error line for demonstration of missing roles like wireframe 10 */}
                    {isNoRole && <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400"></div>}
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg shrink-0">
                        {staff.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="font-bold text-brand-900 truncate">{staff.name}</h3>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                            {staff.id}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-brand-600 mb-1">{staff.title}</p>
                        <p className="text-xs text-slate-500">{staff.department}</p>
                        
                        <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100">
                          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> {staff.email}
                          </span>
                          <button className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors">
                            Edit Role
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
