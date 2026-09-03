"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FolderOpen,
  ArrowRight,
  Newspaper,
  Tag as TagIcon,
  Route,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { NewsFeed } from "@/components/NewsFeed";
import { fetchAdminOverview } from "@/app/actions/admin";

type Card = {
  href: string;
  icon: React.ElementType;
  title: string;
  body: string;
  stat?: string;
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    staff: 0,
    documents: 0,
    tags: 0,
    publishedNews: 0,
    draftNews: 0,
    unroutedForms: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAdminOverview()
      .then(c => {
        if (active) setCounts(c);
      })
      .catch(err => console.error("Could not load the console", err))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!user || user.role !== "admin") return null;

  const n = (v: number) => (isLoading ? "—" : String(v));

  const cards: Card[] = [
    {
      href: "/admin/users",
      icon: Users,
      title: "Staff Directory",
      body: "Add people, update their details, and set which location they work from.",
      stat: `${n(counts.staff)} on the directory`,
    },
    {
      href: "/admin/assign-roles",
      icon: TagIcon,
      title: "Tags & Roles",
      body: "Tags say who someone is and where they work. Routing uses them to decide who reviews what.",
      stat: `${n(counts.tags)} tags`,
    },
    {
      href: "/admin/form-routing",
      icon: Route,
      title: "Form Routing",
      body: "Choose which tags receive each kind of record when staff file it.",
      stat:
        isLoading
          ? "—"
          : counts.unroutedForms === 0
          ? "All forms routed"
          : `${counts.unroutedForms} not routed yet`,
    },
    {
      href: "/admin/news",
      icon: Newspaper,
      title: "News & Updates",
      body: "Write and publish updates that appear on everyone's dashboard.",
      stat: isLoading
        ? "—"
        : `${counts.publishedNews} live${counts.draftNews ? `, ${counts.draftNews} draft` : ""}`,
    },
    {
      href: "/admin/docs",
      icon: FolderOpen,
      title: "Document Control",
      body: "Publish policies, handbooks and forms for every location.",
      stat: `${n(counts.documents)} documents`,
    },
  ];

  return (
    <div className="animate-in fade-in duration-300 ease-cg mx-auto max-w-6xl space-y-10 pb-16">
      <div>
        <p className="cg-eyebrow">Administration</p>
        <h1 className="mt-2 text-4xl lg:text-5xl">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
          {(user.name ?? "").split(" ")[0]}.
        </h1>
        <p className="mt-3 max-w-2xl text-base">
          Look after staff accounts, the documents everyone relies on, and what reaches whom.
        </p>
      </div>

      {!isLoading && counts.unroutedForms > 0 && (
        <div className="cg-callout flex items-start justify-between gap-4">
          <p className="text-sm text-ui-text-secondary">
            {counts.unroutedForms === 1
              ? "One form type has no routing set, so nobody is assigned to review it."
              : `${counts.unroutedForms} form types have no routing set, so nobody is assigned to review them.`}
          </p>
          <Link href="/admin/form-routing" className="shrink-0 text-sm font-medium text-accent-on-surface hover:underline">
            Set it up
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(card => (
          <Link
            key={card.href}
            href={card.href}
            className="cg-card group flex min-h-[220px] flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-brand-300"
          >
            <div>
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-accent-on-surface transition-transform group-hover:scale-110">
                <card.icon className="h-6 w-6" />
              </span>
              <h2 className="text-xl">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ui-text-secondary">{card.body}</p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-ui-border pt-4">
              <span className="cg-meta text-sage">
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  card.stat
                )}
              </span>
              <ArrowRight className="h-4 w-4 text-accent-on-surface transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Company news, written by the communications team. */}
      <section className="pt-2">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="cg-eyebrow">Company news</p>
            <h2 className="mt-1 text-2xl">Recent news &amp; updates</h2>
          </div>
          <Link
            href="/news"
            className="shrink-0 text-sm text-accent-on-surface transition-colors hover:text-accent-dark"
          >
            View all
          </Link>
        </div>
        <NewsFeed limit={6} />
      </section>
    </div>
  );
}
