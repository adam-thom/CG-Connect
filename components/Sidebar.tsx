"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { NewRecordMenu } from '@/components/NewRecordMenu';
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  FolderOpen,
  Users,
  CheckSquare,
  User as UserIcon,
  Route,
  Newspaper,
  ListChecks,
  X,
  Tag as TagIcon
} from 'lucide-react';

export function Sidebar({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();
  if (!user) return null;

  const isManager = user.role === 'manager';
  const isAdmin = user.role === 'admin';

  const employeeLinks = [
    { name: 'Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'Schedule', href: '/employee/schedule', icon: CalendarDays },
    { name: 'My Submissions', href: '/employee/submissions', icon: FileText },
    { name: 'Company News', href: '/news', icon: Newspaper },
    { name: 'Company Docs', href: '/employee/docs', icon: FolderOpen },
    { name: 'My Profile', href: '/employee/profile', icon: UserIcon },
  ];

  const managerLinks = [
    { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Daily Line-up', href: '/manager/lineup', icon: Route },
    { name: 'Dept Schedule', href: '/manager/schedule', icon: CalendarDays },
    { name: 'Tasks', href: '/manager/tasks', icon: ListChecks },
    { name: 'Timesheets', href: '/manager/timesheets', icon: CheckSquare },
    { name: 'Review Queue', href: '/manager/submissions', icon: FileText },
    { name: 'Company News', href: '/news', icon: Newspaper },
    { name: 'Document Vault', href: '/manager/docs', icon: FolderOpen },
    { name: 'Staff Profiles', href: '/manager/staff', icon: Users },
  ];

  const adminLinks = [
    { name: 'Admin Console', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Staff Directory', href: '/admin/users', icon: Users },
    { name: 'Tags & Roles', href: '/admin/assign-roles', icon: TagIcon },
    { name: 'Form Routing', href: '/admin/form-routing', icon: Route },
    { name: 'News & Updates', href: '/admin/news', icon: Newspaper },
    { name: 'Document Control', href: '/admin/docs', icon: FolderOpen },
  ];

  // The logo and portal name now live in the top bar, which spans the screen.
  const links = isAdmin ? adminLinks : isManager ? managerLinks : employeeLinks;

  return (
    <aside
      id="cg-sidebar"
      aria-label="Main navigation"
      // Off-canvas below lg, permanent above it. `transform` rather than
      // display so it slides rather than snapping.
      data-open={isOpen ? 'true' : 'false'}
      className={cn(
        // Starts below the top bar so the bar reads as one unbroken band.
        'cg-drawer fixed bottom-0 left-0 top-16 z-30 flex w-64 flex-col border-r border-ui-border bg-ui-bg',
        // Managers already sit on ink, so the rail stays part of that ground.
        !isManager && 'sidebar-ink'
      )}
    >
      {/* On a small screen the drawer covers the page, so it needs its own way
        * out. Above lg it is permanent and the button would be noise. */}
      <div className="flex shrink-0 justify-end px-4 pt-4 lg:hidden">
        <button
          onClick={onClose}
          aria-label="Close navigation"
          className="rounded-full p-2 text-sage transition-colors hover:bg-ui-surface hover:text-ui-text-primary"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {!isManager && !isAdmin && (
          <div className="px-1">
            <NewRecordMenu fullWidth />
          </div>
        )}

        <nav className="space-y-1">
          <p className="cg-eyebrow mb-2 px-4 text-sage">Platform</p>
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn('cg-nav-item group', isActive && 'cg-nav-item-active')}
              >
                <link.icon
                  className={cn(
                    'h-[18px] w-[18px] transition-colors',
                    isActive ? 'text-accent-on-surface' : 'text-sage group-hover:text-accent'
                  )}
                />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-ui-border p-4">
        <div className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-transparent p-2.5 transition-all duration-300 hover:border-ui-border hover:bg-ui-surface hover:shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-serif text-lg text-white transition-transform group-hover:scale-110">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-bold leading-tight text-ui-text-primary">{user.name}</p>
            <p className="cg-eyebrow mt-0.5 block">{user.title}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
