import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, Users, FileText, CalendarDays } from "lucide-react";
import { fetchServiceDetail } from "@/app/actions/lineup";
import { AppShell } from "@/components/AppShell";
import { cn, formatLongDate } from "@/lib/utils";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await fetchServiceDetail(id);
  if (!data) notFound();

  const { service, notes, sameDay, viewerName } = data;
  const myRoles = service.assignments
    .filter(a => a.staffName === viewerName)
    .map(a => a.roleName);

  const readableDate = formatLongDate(service.date);

  return (
    <AppShell>
      <div className="animate-in fade-in duration-300 ease-cg mx-auto max-w-3xl pb-16">
        <Link
          href="/employee/schedule"
          className="mb-8 flex w-fit items-center gap-2 text-sm text-sage transition-colors hover:text-accent-on-surface"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to schedule
        </Link>

        <p className="cg-eyebrow">Service</p>
        <h1 className="mt-2 text-4xl">{service.title}</h1>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ui-text-secondary">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-sage" />
            {readableDate}
          </span>
          {service.time && (
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-sage" />
              {service.time}
            </span>
          )}
          {service.location && (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sage" />
              {service.location}
            </span>
          )}
        </div>

        {myRoles.length > 0 && (
          <div className="cg-panel-accent mt-8">
            <p className="cg-eyebrow mb-2 block text-white/80">Your part</p>
            <p className="text-lg text-white">
              You are on this service as {myRoles.join(" and ")}.
            </p>
          </div>
        )}

        <section className="cg-card mt-8">
          <h2 className="cg-eyebrow mb-4 flex items-center gap-2 text-sage">
            <Users className="h-3.5 w-3.5" />
            Line-up
          </h2>

          {service.assignments.length === 0 ? (
            <p className="text-sm text-sage">
              The roster for this service has not been built yet.
            </p>
          ) : (
            <ul className="divide-y divide-ui-border">
              {service.assignments.map(a => {
                const isMe = a.staffName === viewerName;
                return (
                  <li
                    key={a.id}
                    className={cn(
                      "flex items-center justify-between gap-4 py-3",
                      isMe && "-mx-3 rounded-[var(--radius-panel)] bg-brand-50 px-3"
                    )}
                  >
                    <span className="cg-eyebrow text-sage">{a.roleName}</span>
                    <span
                      className={cn(
                        "text-right",
                        isMe
                          ? "font-medium text-accent-on-surface"
                          : a.staffName
                          ? "text-ui-text-primary"
                          : "text-sage"
                      )}
                    >
                      {a.staffName || "Unassigned"}
                      {isMe && <span className="ml-2 cg-pill-brand">You</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {notes && (
          <section className="cg-card mt-6">
            <h2 className="cg-eyebrow mb-3 flex items-center gap-2 text-sage">
              <FileText className="h-3.5 w-3.5" />
              Directives for the day
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed text-ui-text-secondary">{notes}</p>
          </section>
        )}

        {sameDay.length > 0 && (
          <section className="mt-6">
            <h2 className="cg-eyebrow mb-3 block text-sage">Also on {readableDate}</h2>
            <ul className="space-y-2">
              {sameDay.map(s => (
                <li key={s.id}>
                  <Link
                    href={`/service/${s.id}`}
                    className="flex items-center justify-between gap-4 rounded-[var(--radius-panel)] border border-ui-border p-4 transition-colors hover:border-brand-300"
                  >
                    <span className="text-ui-text-primary">{s.title}</span>
                    <span className="flex shrink-0 gap-3 text-sm text-sage">
                      {s.time && <span>{s.time}</span>}
                      {s.location && <span className="hidden sm:inline">{s.location}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}
