"use client";

import { useAuth } from '@/lib/auth-context';
import { Search, Bell, LogOut, Loader2, Menu, X, CheckCheck } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { switchDevRole } from '@/app/actions/dev';
import { globalSearch, type SearchHit } from '@/app/actions/search';
import {
  fetchMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/app/actions/notifications';
import { formatDateTime, cn } from '@/lib/utils';

type Note = {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  kind: string;
  readAt: string | Date | null;
  createdAt: string | Date;
};

export function TopBar({ onOpenNav }: { onOpenNav?: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [unread, setUnread] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Debounced: a keystroke should not mean a round trip.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      globalSearch(q)
        .then(setHits)
        .catch(() => setHits([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const loadNotes = () => {
    fetchMyNotifications()
      .then(res => {
        setNotes(res.items as unknown as Note[]);
        setUnread(res.unread);
      })
      .catch(() => {});
  };

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    loadNotes();
    // Light polling so a decision made elsewhere surfaces without a refresh.
    const t = setInterval(loadNotes, 60_000);
    return () => clearInterval(t);
  }, [userId]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(t)) setSearchOpen(false);
      if (bellRef.current && !bellRef.current.contains(t)) setBellOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setBellOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!user) return null;

  const openHit = (hit: SearchHit) => {
    setSearchOpen(false);
    setQuery('');
    router.push(hit.href);
  };

  const openNote = async (note: Note) => {
    setBellOpen(false);
    if (!note.readAt) {
      await markNotificationRead(note.id).catch(() => {});
      loadNotes();
    }
    if (note.href) router.push(note.href);
  };

  const home =
    user.role === 'admin'
      ? '/admin/dashboard'
      : user.role === 'manager'
        ? '/manager/dashboard'
        : '/employee/dashboard';

  const portalLabel =
    user.role === 'admin'
      ? 'Admin Portal'
      : user.role === 'manager'
        ? 'Management Portal'
        : 'Staff Portal';

  return (
    // Fixed and full-bleed: the bar runs the whole width of the screen and the
    // navigation rail hangs beneath it, rather than the bar starting where the
    // rail ends.
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center border-b border-white/10 bg-ink text-white">
      <div className="flex h-full shrink-0 items-center gap-2 pl-3 sm:pl-4 lg:w-64 lg:border-r lg:border-white/10 lg:pl-5">
        <button
          onClick={onOpenNav}
          aria-label="Open navigation"
          aria-controls="cg-sidebar"
          className="shrink-0 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          href={home}
          className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
        >
          {/* The two-tone terracotta leaf is the variant for cream surfaces, so
            * it sits on a cream chip rather than being recoloured for the ink. */}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream">
            <Image
              src="/cg-leaf-mark.png"
              alt="The Caring Group"
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block font-serif text-base text-white">CG Connect</span>
            <span className="cg-eyebrow block whitespace-nowrap text-[9px] tracking-[0.14em] text-white/55">
              {portalLabel}
            </span>
          </span>
        </Link>
      </div>

      {/* Search stays hard left against the rail; the controls sit hard right. */}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-3 sm:px-6">
      <div ref={searchRef} className="relative flex max-w-xl flex-1">
        <div className="group relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin text-white/60" />
            ) : (
              <Search className="h-4 w-4 text-white/60 transition-colors group-focus-within:text-white" />
            )}
          </div>
          <input
            type="search"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search staff, services, tasks or news"
            aria-label="Search"
            className="block w-full rounded-full border border-white/15 bg-white/10 py-2 pl-11 pr-9 text-sm leading-5 text-white placeholder-white/50 transition-all focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/10"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setHits([]);
              }}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/60 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {searchOpen && query.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-[var(--radius-card)] border border-ui-border bg-ui-surface text-ui-text-primary shadow-[0_18px_40px_-18px_rgba(24,28,29,0.5)] animate-in fade-in slide-in-from-top-1 duration-200 ease-cg">
            {searching && hits.length === 0 ? (
              <p className="p-4 text-sm text-sage">One moment.</p>
            ) : hits.length === 0 ? (
              <p className="p-4 text-sm text-sage">
                We couldn&apos;t find anything for that. Try a name or a service.
              </p>
            ) : (
              <ul className="max-h-80 divide-y divide-ui-border overflow-y-auto">
                {hits.map(hit => (
                  <li key={`${hit.kind}-${hit.id}`}>
                    <button
                      onClick={() => openHit(hit)}
                      className="flex w-full items-center justify-between gap-3 p-3 text-left transition-colors hover:bg-ui-bg-alt"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{hit.title}</span>
                        <span className="block truncate text-xs text-sage">{hit.subtitle}</span>
                      </span>
                      <span className="cg-pill-neutral shrink-0">{hit.kind}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* DEV ROLE SWITCHER — never rendered in production. */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="relative hidden items-center rounded-full border border-white/15 bg-white/10 p-1 xl:flex">
            {isPending && (
              <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-white/70" />
              </div>
            )}
            {['employee', 'manager', 'admin'].map(r => (
              <button
                key={r}
                disabled={isPending}
                onClick={() => {
                  if (user.role !== r) {
                    startTransition(() => {
                      void switchDevRole(r);
                    });
                  }
                }}
                className={`rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  user.role === r ? 'bg-white text-ink shadow-sm' : 'text-white/70 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen(o => !o)}
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
            aria-expanded={bellOpen}
            className="relative rounded-full p-2 text-white/80 transition-all hover:bg-white/10 hover:text-white active:scale-90"
          >
            {unread > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white ring-2 ring-ink">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
            <Bell className="h-5 w-5" />
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[var(--radius-card)] border border-ui-border bg-ui-surface text-ui-text-primary shadow-[0_18px_40px_-18px_rgba(24,28,29,0.5)] animate-in fade-in slide-in-from-top-1 duration-200 ease-cg">
              <div className="flex items-center justify-between gap-2 border-b border-ui-border bg-ui-bg-alt px-4 py-3">
                <p className="cg-eyebrow text-sage">Notifications</p>
                {unread > 0 && (
                  <button
                    onClick={async () => {
                      await markAllNotificationsRead().catch(() => {});
                      loadNotes();
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-accent-on-surface hover:text-accent-dark"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {notes.length === 0 ? (
                <p className="p-6 text-center text-sm text-sage">Nothing new.</p>
              ) : (
                <ul className="max-h-96 divide-y divide-ui-border overflow-y-auto">
                  {notes.map(n => (
                    <li key={n.id}>
                      <button
                        onClick={() => openNote(n)}
                        className={cn(
                          'flex w-full gap-3 p-4 text-left transition-colors hover:bg-ui-bg-alt',
                          !n.readAt && 'bg-brand-50'
                        )}
                      >
                        <span
                          className={cn(
                            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                            n.readAt ? 'bg-transparent' : 'bg-accent'
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{n.title}</span>
                          {n.body && (
                            <span className="mt-0.5 block text-sm text-ui-text-secondary">
                              {n.body}
                            </span>
                          )}
                          <span className="cg-meta mt-1 block text-sage">
                            {formatDateTime(n.createdAt)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="mx-1 hidden h-6 w-px bg-white/20 sm:block" />

        <Link
          href={user.role === 'manager' ? '/manager/profile' : '/employee/profile'}
          className="hidden items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-white/10 sm:flex"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent font-serif text-sm text-white">
            {user.name.charAt(0)}
          </span>
          <span className="hidden text-sm text-white/90 md:inline">{user.name}</span>
        </Link>

        <button
          onClick={async () => await logoutAction()}
          aria-label="Sign out"
          className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-widest text-white/80 transition-all hover:bg-white/10 hover:text-white active:scale-95"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden lg:inline">Sign Out</span>
        </button>
      </div>
      </div>
    </header>
  );
}
