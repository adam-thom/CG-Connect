"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastProvider } from './Toast';
import { useAuth } from '@/lib/auth-context';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  // Navigating should dismiss the drawer, or the new page opens behind it.
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  // A drawer over the content must not leave the page scrolling underneath it.
  useEffect(() => {
    if (!navOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [navOpen]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navOpen]);

  if (!user) return null;

  // Managers work on the dark ink surface; employees and admins on cream.
  // .theme-dark only reassigns semantic tokens - see globals.css.
  return (
    <ToastProvider>
      <div
        className={`flex min-h-screen bg-ui-bg text-ui-text-primary ${
          user.role === 'manager' ? 'theme-dark' : ''
        }`}
      >
        <Sidebar isOpen={navOpen} onClose={() => setNavOpen(false)} />

        {navOpen && (
          <div
            aria-hidden
            onClick={() => setNavOpen(false)}
            className="fixed inset-0 z-20 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-200 lg:hidden"
          />
        )}

        <TopBar onOpenNav={() => setNavOpen(true)} />

        {/* pt-16 clears the fixed bar; pl-64 clears the rail beneath it. */}
        <div className="flex min-w-0 flex-1 flex-col pt-16 lg:pl-64">
          <main className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-cg mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 md:p-8 lg:px-12">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
