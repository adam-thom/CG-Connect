"use client";

import { useAuth } from '@/lib/auth-context';
import { Search, Bell, LogOut, ArrowLeftRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function TopBar() {
  const { user, switchRole, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSwitchRole = () => {
    switchRole();
    if (user.role === 'employee') {
      router.push('/manager/dashboard');
    } else {
      router.push('/employee/dashboard');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex-1 flex max-w-xl">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search records, staff, or documents (CMD+K)"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 sm:text-sm transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs font-semibold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-white">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      <div className="ml-4 flex items-center gap-5">
        {/* DEV ONLY TOGGLE */}
        <button 
          onClick={handleSwitchRole}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-all shadow-sm"
          title="Dev Tool: Switch Role"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            Switch to {user.role === 'employee' ? 'Manager' : 'Employee'}
          </span>
        </button>

        <button className="text-slate-400 hover:text-brand-900 relative p-1 transition-colors rounded-full hover:bg-slate-50">
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-accent-500 ring-2 ring-white" />
          <Bell className="w-5 h-5" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        <button 
          onClick={handleLogout}
          className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-medium transition-colors p-1.5 rounded-md hover:bg-slate-50"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
