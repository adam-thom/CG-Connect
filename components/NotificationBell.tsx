'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckSquare, Clock } from 'lucide-react';
import { fetchMyNotifications, markNotificationRead, markAllNotificationsRead } from '@/app/actions/notifications';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    try {
      const data = await fetchMyNotifications();
      setNotifications(data);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Refresh notifications every minute automatically
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAllNotificationsRead();
    fetchNotifs();
  };

  const handleNotificationClick = async (id: string, href?: string) => {
    await markNotificationRead(id);
    setOpen(false);
    fetchNotifs();
    if (href) {
      router.push(href);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="text-slate-400 hover:text-brand-900 relative p-1.5 transition-colors rounded-full hover:bg-slate-50 focus:outline-none"
      >
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-500 ring-2 ring-white"></span>
          </span>
        )}
        <Bell className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-brand-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1 transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[28rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center text-slate-500 italic text-sm">
                You have no notifications.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => handleNotificationClick(n.id, n.href)}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-slate-50 transition-colors flex gap-3",
                      !n.read ? "bg-brand-50/30" : "opacity-70"
                    )}
                  >
                    <div className="mt-0.5 relative">
                      {/* Read/Unread indicator */}
                      <div className={cn(
                        "w-2 h-2 rounded-full absolute -left-1 -top-1",
                        !n.read ? "bg-accent-500" : "bg-transparent"
                      )} />
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-sm", !n.read ? "font-bold text-slate-900" : "font-semibold text-slate-700")}>
                        {n.title}
                      </p>
                      <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
