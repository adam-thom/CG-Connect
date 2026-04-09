export const metadata = {
  title: 'Notifications | CG Connect',
};

import { fetchMyNotifications } from '@/app/actions/notifications';
import { Bell, Clock, AlertTriangle, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  href: string | null;
  read: boolean;
  createdAt: string;
};

export default async function NotificationsPage() {
  const notifications = await fetchMyNotifications();

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
      <div className="mb-6 flex items-center text-sm font-medium text-slate-500">
        <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
        <span className="text-slate-900">Notifications</span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-brand-100 rounded-xl text-brand-700 shadow-sm border border-brand-200">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-slate-500 mt-1">Updates on your records, approvals, and messages.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden min-h-[500px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-slate-400">
            <Bell className="w-12 h-12 mb-4 text-slate-200" />
            <p className="font-medium text-lg">You're all caught up!</p>
            <p className="text-sm">No new notifications to show right now.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((notif: AppNotification) => (
               <li key={notif.id} className="group hover:bg-slate-50 transition-colors">
                 <Link href={notif.href || '#'} className="flex items-start gap-4 p-5 sm:p-6">
                    <div className="mt-1 flex-shrink-0">
                      {notif.title.toLowerCase().includes('required') || notif.title.toLowerCase().includes('action') || notif.title.toLowerCase().includes('alert') ? (
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center border border-orange-200">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                      ) : notif.title.toLowerCase().includes('reminder') ? (
                         <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200">
                           <Clock className="w-5 h-5" />
                         </div>
                      ) : (
                         <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
                           <MessageSquare className="w-5 h-5" />
                         </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-bold text-slate-900 truncate mb-1">
                         {notif.title}
                         {!notif.read && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-brand-500"></span>}
                       </h4>
                       <p className="text-sm text-slate-600 mb-2">
                         {notif.message}
                       </p>
                       <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                         {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </div>
                    <div className="flex-shrink-0 pl-4 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                 </Link>
               </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
