"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Loader2, Plus, Trash2, Tag as TagIcon, Search, Check } from "lucide-react";
import {
  fetchTags,
  fetchStaffWithTags,
  createTag,
  deleteTag,
  setUserTags,
} from "@/app/actions/tags";
import { useToast, useConfirm } from "@/components/Toast";
import { cn } from "@/lib/utils";
import { TAG_TYPES as TYPE_ORDER, TAG_TYPE_LABEL as TYPE_LABEL } from "@/lib/forms";

type Tag = { id: string; name: string; type: string; _count?: { users: number } };
type Staff = {
  id: string;
  name: string | null;
  email: string;
  title: string | null;
  role: string;
  tags: { id: string; name: string; type: string }[];
};


const field =
  "w-full rounded-[var(--radius-panel)] border border-ui-border bg-ui-bg px-3 py-2.5 text-sm text-ui-text-primary outline-none transition-colors placeholder:text-sage/70 focus:border-accent focus:bg-ui-surface";

export default function AssignRolesPage() {
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const [tags, setTags] = useState<Tag[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState({ name: "", type: "EMPLOYEE" });

  const load = async () => {
    const [t, s] = await Promise.all([fetchTags(), fetchStaffWithTags()]);
    setTags(t as unknown as Tag[]);
    setStaff(s as unknown as Staff[]);
  };

  useEffect(() => {
    let active = true;
    Promise.all([fetchTags(), fetchStaffWithTags()])
      .then(([t, s]) => {
        if (!active) return;
        setTags(t as unknown as Tag[]);
        setStaff(s as unknown as Staff[]);
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

  const grouped = useMemo(() => {
    return TYPE_ORDER.map(type => ({ type, items: tags.filter(t => t.type === type) })).filter(
      g => g.items.length > 0
    );
  }, [tags]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(u =>
      [u.name, u.email, u.title].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    );
  }, [staff, query]);

  /** Optimistic: a checkbox should respond immediately, and revert if it fails. */
  const toggleTag = (person: Staff, tag: Tag) => {
    const has = person.tags.some(t => t.id === tag.id);
    const next = has
      ? person.tags.filter(t => t.id !== tag.id)
      : [...person.tags, { id: tag.id, name: tag.name, type: tag.type }];

    const snapshot = staff;
    setStaff(prev => prev.map(u => (u.id === person.id ? { ...u, tags: next } : u)));

    startTransition(async () => {
      const res = await setUserTags(person.id, next.map(t => t.id));
      if (!res.success) {
        setStaff(snapshot);
        toast.error(res.error ?? "That did not save. Please try again.");
      }
    });
  };

  const addTag = () => {
    startTransition(async () => {
      const res = await createTag(draft.name, draft.type);
      if (res.success) {
        setDraft({ name: "", type: draft.type });
        await load();
        toast.success("Tag created.");
      } else {
        toast.error(res.error ?? "That did not save. Please try again.");
      }
    });
  };

  const removeTag = async (tag: Tag) => {
    const ok = await confirm({
      title: `Delete the “${tag.name}” tag?`,
      body: "It will be removed from everyone who has it, and from any routing rules that use it.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    startTransition(async () => {
      try {
        await deleteTag(tag.id);
        await load();
        toast.success("Tag deleted.");
      } catch {
        toast.error("That did not delete. Please try again.");
      }
    });
  };

  return (
    <div className="animate-in fade-in duration-300 ease-cg mx-auto max-w-5xl pb-16">
      {dialog}

      <div className="mb-8">
        <p className="cg-eyebrow">Access</p>
        <h1 className="mt-2 text-4xl">Tags &amp; roles</h1>
        <p className="mt-2 text-base">
          Tags say who someone is and where they work. Form routing then decides which tags
          receive which records.
        </p>
      </div>

      <div className="cg-card mb-8">
        <h2 className="cg-eyebrow mb-4 block text-sage">Create a tag</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
          <input
            value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
            placeholder="e.g. Athabasca Manager"
            aria-label="Tag name"
            className={field}
          />
          <select
            value={draft.type}
            onChange={e => setDraft({ ...draft, type: e.target.value })}
            aria-label="Tag type"
            className={field}
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADDITIONAL">Other</option>
          </select>
          <button
            onClick={addTag}
            disabled={isPending || !draft.name.trim()}
            className="cg-btn-primary"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add tag
          </button>
        </div>

        {loaded && tags.length > 0 && (
          <div className="mt-6 space-y-4 border-t border-ui-border pt-5">
            {grouped.map(g => (
              <div key={g.type}>
                <p className="cg-eyebrow mb-2 block text-sage">{TYPE_LABEL[g.type]}</p>
                <ul className="flex flex-wrap gap-2">
                  {g.items.map(t => (
                    <li
                      key={t.id}
                      className="group flex items-center gap-2 rounded-full border border-ui-border bg-ui-bg-alt py-1 pl-3 pr-1.5 text-sm"
                    >
                      <TagIcon className="h-3.5 w-3.5 text-sage" />
                      <span className="text-ui-text-primary">{t.name}</span>
                      <span className="text-xs text-sage">{t._count?.users ?? 0}</span>
                      <button
                        onClick={() => removeTag(t)}
                        disabled={isPending}
                        aria-label={`Delete the ${t.name} tag`}
                        className="rounded-full p-1 text-sage transition-colors hover:bg-status-error-soft hover:text-status-error disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cg-card overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-ui-border bg-ui-bg-alt p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg">Who has what</h2>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-sage" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Find a person"
              aria-label="Find a person"
              className="w-full rounded-full border border-ui-border bg-ui-surface py-2 pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-sage/70 focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
          </div>
        </div>

        {!loaded ? (
          <div className="flex items-center justify-center gap-3 p-16 text-sm text-sage">
            <Loader2 className="h-5 w-5 animate-spin" />
            One moment.
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-16 text-center text-sm text-sage">
            {staff.length === 0 ? "No staff yet." : "We couldn't find anyone matching that."}
          </p>
        ) : (
          <ul className="divide-y divide-ui-border">
            {filtered.map(person => (
              <li key={person.id} className="p-5">
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ui-text-primary">
                      {person.name ?? person.email}
                    </p>
                    <p className="cg-meta block text-sage">
                      {person.title ?? person.email} · {person.role}
                    </p>
                  </div>
                  <span className="cg-pill-neutral shrink-0">
                    {person.tags.length} {person.tags.length === 1 ? "tag" : "tags"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => {
                    const on = person.tags.some(t => t.id === tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(person, tag)}
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
