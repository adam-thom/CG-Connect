"use client";

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAuth } from '@/lib/auth-context';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className={`min-h-screen flex transition-colors duration-500 bg-slate-50 text-slate-900 ${user.role === 'manager' ? 'manager-theme' : ''}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col pl-64 min-w-0 transition-all duration-300">
        <TopBar />
        <main className="flex-1 p-6 md:p-8 lg:px-12 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
