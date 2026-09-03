"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Route, Check, ArrowRight, Info } from "lucide-react";
import { fetchTags, fetchFormRouting, setFormRouting } from "@/app/actions/tags";
import { ROUTABLE_FORMS as FORMS } from "@/lib/forms";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

type Tag = { id: string; name: string; type: string };


export default function FormRoutingPage() {
  const toast = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [routing, setRouting] = useState<Record<string, string[]>>({});
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    Promise.all([fetchTags(), fetchFormRouting()])
      .then(([t, r]) => {
        if (!active) return;
        setTags(t as unknown as Tag[]);
        setRouting(r);
      })
      .catch(() => toast.error("Something went wrong on our end. Please try again."))
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Saves on each toggle. A rules screen that needs a separate Save button is
  // one where people leave without pressing it.
  const toggle = (formKey: string, tagId: string) => {
    const current = routing[formKey] ?? [];
    const next = current.includes(tagId)
      ? current.filter(id => id !== tagId)
      : [...current, tagId];

    const snapshot = routing;
    setRouting(prev => ({ ...prev, [formKey]: next }));

    startTransition(async () => {
      const res = await setFormRouting(formKey, next);
      if (!res.success) {
        setRouting(snapshot);
        toast.error(res.error ?? "That did not save. Please try again.");
      }
    });
  };

  // Only manager and other groups can receive records; employee tags describe
  // who files them, not who reviews them.
  const routableTags = tags.filter(t => t.type !== "EMPLOYEE");

  return (
    <div className="animate-in fade-in duration-300 ease-cg mx-auto max-w-4xl pb-16">
      <div className="mb-8">
        <p className="cg-eyebrow">Workflow</p>
        <h1 className="mt-2 text-4xl">Form routing</h1>
        <p className="mt-2 text-base">
          Choose which tags receive each kind of record. Changes save as you make them.
        </p>
      </div>

      <div className="cg-callout mb-8 flex items-start gap-3 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p className="text-ui-text-secondary">
          A rule applies to records filed from now on. Records already submitted keep the
          approvers they were filed with, so changing a rule never rewrites history.{" "}
          <Link href="/admin/assign-roles" className="text-accent-on-surface hover:underline">
            Manage tags
          </Link>
          .
        </p>
      </div>

      {!loaded ? (
        <div className="flex items-center justify-center gap-3 p-20 text-sm text-sage">
          <Loader2 className="h-5 w-5 animate-spin" />
          One moment.
        </div>
      ) : routableTags.length === 0 ? (
        <div className="cg-card py-16 text-center">
          <Route className="mx-auto mb-4 h-10 w-10 text-sage" />
          <p className="text-sage">There are no manager tags to route to yet.</p>
          <Link href="/admin/assign-roles" className="cg-btn-primary mt-6">
            Create a tag
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {FORMS.map(form => {
            const selected = routing[form.key] ?? [];
            return (
              <section key={form.key} className="cg-card">
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <div>
                    <h2 className="text-xl">{form.label}</h2>
                    <p className="cg-meta mt-0.5 block text-sage">{form.hint}</p>
                  </div>
                  <span
                    className={selected.length === 0 ? "cg-pill-warning" : "cg-pill-success"}
                  >
                    {selected.length === 0
                      ? "Not routed"
                      : `${selected.length} ${selected.length === 1 ? "tag" : "tags"}`}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {routableTags.map(tag => {
                    const on = selected.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggle(form.key, tag.id)}
                        disabled={isPending}
                        aria-pressed={on}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-60",
                          on
                            ? "border-accent bg-accent text-white"
                            : "border-ui-border text-ui-text-secondary hover:border-brand-300 hover:bg-brand-50"
                        )}
                      >
                        {on && <Check className="h-3.5 w-3.5" />}
                        {tag.name}
                      </button>
                    );
                  })}
                </div>

                {selected.length === 0 && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-status-warning">
                    <ArrowRight className="h-3.5 w-3.5" />
                    Nobody is set to receive these. They will still appear in the review queue.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
