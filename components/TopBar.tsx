"use client";

import { useAuth } from '@/lib/auth-context';
import { Search, Bell, LogOut, Loader2, Menu } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { switchDevRole } from '@/app/actions/dev';

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  if (!user) return null;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 w-full animate-in slide-in-from-top-4 duration-500">
      
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="relative w-full group hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search records, staff, or documents (CMD+K)"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 sm:text-sm transition-all shadow-inner"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs font-semibold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-white">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      <div className="ml-4 flex items-center gap-5">
        
        {/* DEV ROLE SLIDER */}
        {user.email === 'dev@caringroup.com' && (
          <div className="hidden md:flex items-center bg-slate-100/80 p-1.5 rounded-full mr-2 border border-slate-200/60 shadow-inner relative">
             {isPending && (
               <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
               </div>
             )}
             {['employee', 'manager', 'admin'].map(r => (
               <button
                 key={r}
                 disabled={isPending}
                 onClick={() => {
                   if (user.role !== r) {
                      startTransition(() => {
                         switchDevRole(r);
                      });
                   }
                 }}
                 className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all duration-300 ${user.role === r ? 'bg-white shadow-sm text-brand-900 border-slate-200/60' : 'text-slate-500 hover:text-slate-800'}`}
               >
                 {r}
               </button>
             ))}
          </div>
        )}

        <button className="text-slate-400 hover:text-brand-900 relative p-1 transition-colors rounded-full hover:bg-slate-50">
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-accent-500 ring-2 ring-white" />
          <Bell className="w-5 h-5" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        <button 
          onClick={async () => await logoutAction()}
          className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-medium transition-colors p-1.5 rounded-md hover:bg-slate-50"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
