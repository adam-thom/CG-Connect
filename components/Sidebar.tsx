"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  FolderOpen,
  Users,
  CheckSquare,
  PlusCircle,
  User as UserIcon
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isManager = user.role === 'manager';

  const employeeLinks = [
    { name: 'Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'Schedule', href: '/employee/schedule', icon: CalendarDays },
    { name: 'My Submissions', href: '/employee/submissions', icon: FileText },
    { name: 'Company Docs', href: '/employee/docs', icon: FolderOpen },
    { name: 'My Profile', href: '/employee/profile', icon: UserIcon },
  ];

  const managerLinks = [
    { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Dept Schedule', href: '/manager/schedule', icon: CalendarDays },
    { name: 'Timesheets', href: '/manager/timesheets', icon: CheckSquare },
    { name: 'Review Queue', href: '/manager/submissions', icon: FileText },
    { name: 'Document Vault', href: '/manager/documents', icon: FolderOpen },
    { name: 'Staff Profiles', href: '/manager/staff', icon: Users },
  ];

  const links = isManager ? managerLinks : employeeLinks;

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col z-20">
      <div className="h-24 flex items-center px-6 border-b border-slate-100 shrink-0 bg-brand-900">
        <Link href={isManager ? "/manager/dashboard" : "/employee/dashboard"} className="block w-full">
          <Image src="/2026-CG-Branding-optomized.png" alt="The Caring Group" width={220} height={55} className="object-contain" />
        </Link>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        {!isManager && (
          <div className="mb-8">
            <button className="w-full bg-accent-600 hover:bg-accent-700 text-white rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 font-medium transition-colors shadow-sm focus:ring-2 focus:ring-accent-500 focus:ring-offset-2">
              <PlusCircle className="w-5 h-5" />
              New Record
            </button>
          </div>
        )}

        <nav className="space-y-1 mt-2">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-brand-50 text-brand-900 shadow-sm ring-1 ring-brand-900/5"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <link.icon className={cn("w-5 h-5", isActive ? "text-brand-700" : "text-slate-400")} />
                {link.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold shrink-0 border border-brand-200">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
            <p className="text-xs text-brand-700 font-medium truncate">{user.title}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
