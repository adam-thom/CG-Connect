"use client";

import { useAuth } from "@/lib/auth-context";
import { fetchStaffDirectory } from "@/app/actions/users";
import { Users, Search, ShieldAlert, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Staff = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  department: string | null;
  title: string | null;
  tags: { id: string; name: string; type: string }[];
};

export default function ManagerStaff() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    fetchStaffDirectory()
      .then(rows => {
        if (active) setStaff(rows as Staff[]);
      })
      .catch(err => console.error("Could not load the staff directory", err))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(s =>
      [s.name, s.email, s.id, s.title, s.department]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    );
  }, [staff, query]);

  // A real data-quality signal rather than an invented warning: anyone with no
  // tags receives no routed submissions, so their forms go nowhere.
  const untagged = useMemo(() => staff.filter(s => s.tags.length === 0), [staff]);

  if (!user) return null;

  return (
    <div className="animate-in fade-in duration-300 ease-cg mx-auto max-w-7xl space-y-8 pb-12">
      <div>
        <p className="cg-eyebrow">People</p>
        <h1 className="mt-2 text-4xl">Staff Profiles</h1>
        <p className="mt-2 text-base">Everyone on the team, and the tags that route their forms.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="space-y-6 md:col-span-1">
          <div className="cg-card text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-accent-on-surface">
              <Users className="h-7 w-7" />
            </div>
            <p className="font-serif text-4xl text-accent-on-surface">
              {isLoading ? "—" : staff.length}
            </p>
            <p className="cg-eyebrow mt-1 block text-sage">Active staff</p>
          </div>

          {!isLoading && untagged.length > 0 && (
            <div className="cg-panel-accent">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-1 h-6 w-6 shrink-0" />
                <div>
                  <h3 className="text-lg text-white">Routing gap</h3>
                  <p className="mb-4 mt-1 text-sm leading-relaxed text-white/85">
                    {untagged.length === 1
                      ? "One person has no tags, so their submissions will not reach a manager."
                      : `${untagged.length} people have no tags, so their submissions will not reach a manager.`}
                  </p>
                  {user.role === "admin" && (
                    <Link
                      href="/admin/users"
                      className="inline-flex rounded-full bg-white px-4 py-2.5 text-sm font-medium text-accent-dark transition-colors hover:bg-brand-50"
                    >
                      Assign tags
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-3">
          <div className="cg-card overflow-hidden p-0">
            <div className="flex flex-col gap-4 border-b border-ui-border bg-ui-bg-alt p-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg">Personnel roster</h2>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-sage" />
                <input
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name, email or ID"
                  aria-label="Search the roster"
                  className="w-full rounded-full border border-ui-border bg-ui-surface py-2 pl-9 pr-4 text-sm text-ui-text-primary outline-none transition-colors placeholder:text-sage/70 focus:border-accent focus:ring-4 focus:ring-accent/10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center gap-3 p-16 text-sm text-sage">
                <Loader2 className="h-5 w-5 animate-spin" />
                One moment.
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center text-sm text-sage">
                {query
                  ? "We couldn't find that name. Try a surname on its own."
                  : "No staff records yet."}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                {filtered.map(person => (
                  <div
                    key={person.id}
                    className="group relative overflow-hidden rounded-[var(--radius-panel)] border border-ui-border p-5 transition-colors hover:border-brand-300"
                  >
                    {person.tags.length === 0 && (
                      <div
                        className="absolute left-0 top-0 h-full w-1.5 bg-status-warning"
                        title="No tags assigned"
                      />
                    )}
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 font-serif text-lg text-accent-on-surface">
                        {(person.name ?? person.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center justify-between gap-2">
                          <h3 className="truncate text-[1rem] text-ui-text-primary">
                            {person.name ?? "Unnamed"}
                          </h3>
                          <span className="shrink-0 whitespace-nowrap rounded bg-ui-bg-alt px-2 py-0.5 text-xs font-semibold uppercase text-ui-text-secondary">
                            {person.id}
                          </span>
                        </div>
                        <p className="mb-1 text-sm font-medium text-accent-on-surface">
                          {person.title ?? person.role}
                        </p>
                        <p className="text-xs text-sage">{person.department ?? "—"}</p>

                        {person.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {person.tags.map(t => (
                              <span key={t.id} className="cg-pill-neutral">
                                {t.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-ui-border pt-4">
                          <a
                            href={`mailto:${person.email}`}
                            className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-sage transition-colors hover:text-accent-on-surface"
                          >
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{person.email}</span>
                          </a>
                          {user.role === "admin" && (
                            <Link
                              href={`/admin/users/${person.id}/edit`}
                              className="shrink-0 text-xs font-semibold text-accent-on-surface transition-colors hover:text-accent-dark"
                            >
                              Edit
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
