"use client";

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Clock, Activity, AlertTriangle, CalendarDays, Wallet, X, CloudSnow } from 'lucide-react';

interface NewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewSubmissionModal({ isOpen, onClose }: NewSubmissionModalProps) {
  const { user } = useAuth();
  if (!isOpen || !user) return null;

  const isManagerOrAdmin = user.role === 'manager' || user.role === 'admin';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 tracking-tight">Create New Record</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
          <Link onClick={onClose} href="/employee/submissions/new/timesheet" className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow hover:border-brand-300 transition-all group flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-brand-50 rounded-xl group-hover:bg-brand-100 transition-colors">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-900 text-sm">Timesheet</h3>
            </div>
          </Link>
          
          <Link onClick={onClose} href="/employee/submissions/new/transfer" className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow hover:border-brand-300 transition-all group flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-900 text-sm">Transfer Record</h3>
            </div>
          </Link>

          <Link onClick={onClose} href="/employee/submissions/new/incident" className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow hover:border-brand-300 transition-all group flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-900 text-sm">Incident Report</h3>
            </div>
          </Link>

          <Link onClick={onClose} href="/employee/submissions/new/time-off" className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow hover:border-brand-300 transition-all group flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
              <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-900 text-sm">Time Off Request</h3>
            </div>
          </Link>

          {isManagerOrAdmin && (
            <>
              <Link onClick={onClose} href="/manager/capex/new" className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow hover:border-brand-300 transition-all group flex flex-col items-center text-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-900 text-sm">CapEx Request</h3>
                </div>
              </Link>
              <Link onClick={onClose} href="/employee/submissions/new/snow-log" className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow hover:border-brand-300 transition-all group flex flex-col items-center text-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-sky-50 rounded-xl group-hover:bg-sky-100 transition-colors">
                  <CloudSnow className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-900 text-sm">Snow Removal</h3>
                </div>
              </Link>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
