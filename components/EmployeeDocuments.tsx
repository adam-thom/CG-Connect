"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Search,
  Loader2,
  FolderOpen,
  Image as ImageIcon,
  Table2,
} from "lucide-react";
import { fetchDocuments } from "@/app/actions/documents";
import { formatDate, cn } from "@/lib/utils";

type Doc = {
  id: string;
  name: string;
  type: string;
  category: string;
  sizeBytes: number;
  sharedWith: string;
  fileUrl: string | null;
  originalName: string | null;
  createdAt: string | Date;
  author: { name: string | null } | null;
};

const ICON: Record<string, React.ElementType> = {
  pdf: FileText,
  docx: FileText,
  xlsx: Table2,
  csv: Table2,
  image: ImageIcon,
};

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function EmployeeDocuments() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    fetchDocuments()
      .then(rows => {
        if (active) setDocs(rows as unknown as Doc[]);
      })
      .catch(err => console.error("Could not load documents", err))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter(d =>
      [d.name, d.category, d.originalName].filter(Boolean).some(v =>
        String(v).toLowerCase().includes(q)
      )
    );
  }, [docs, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Doc[]>();
    for (const d of filtered) {
      const list = map.get(d.category) ?? [];
      list.push(d);
      map.set(d.category, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div className="animate-in fade-in duration-300 ease-cg pb-16">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="cg-eyebrow">Reference</p>
          <h1 className="mt-2 text-4xl">Company Documents</h1>
          <p className="mt-2 text-base">Policies, handbooks and forms, kept in one place.</p>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-3 h-4 w-4 text-sage" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search documents"
            aria-label="Search documents"
            className="w-full rounded-full border border-ui-border bg-ui-surface py-2.5 pl-9 pr-4 text-sm text-ui-text-primary outline-none transition-colors placeholder:text-sage/70 focus:border-accent focus:ring-4 focus:ring-accent/10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 p-20 text-sm text-sage">
          <Loader2 className="h-5 w-5 animate-spin" />
          One moment.
        </div>
      ) : docs.length === 0 ? (
        <div className="cg-card py-16 text-center">
          <FolderOpen className="mx-auto mb-4 h-10 w-10 text-sage" />
          <p className="text-sage">No documents have been published yet.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="cg-card py-16 text-center">
          <p className="text-sage">We couldn&apos;t find a document matching that.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map(([category, items]) => (
            <section key={category}>
              <h2 className="cg-eyebrow mb-4 block text-sage">{category}</h2>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map(doc => {
                  const Icon = ICON[doc.type] ?? FileText;
                  return (
                    <li key={doc.id} className="cg-card flex flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-panel)] bg-brand-100 text-accent-on-surface">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-ui-text-primary">
                            {doc.name}
                          </span>
                          <span className="cg-meta mt-0.5 block text-sage">
                            {doc.type.toUpperCase()} · {humanSize(doc.sizeBytes)} ·{" "}
                            {formatDate(doc.createdAt)}
                          </span>
                        </span>
                      </div>

                      {doc.sharedWith === "managers" && (
                        <span className="cg-pill-warning w-fit">Managers only</span>
                      )}

                      <div className="mt-auto flex gap-2">
                        <a
                          href={doc.fileUrl ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-disabled={!doc.fileUrl}
                          className={cn(
                            "cg-btn-secondary min-h-0 flex-1 py-2.5 text-sm",
                            !doc.fileUrl && "pointer-events-none opacity-50"
                          )}
                        >
                          <Eye className="h-4 w-4" />
                          Open
                        </a>
                        <a
                          href={doc.fileUrl ?? "#"}
                          download={doc.originalName ?? doc.name}
                          aria-disabled={!doc.fileUrl}
                          aria-label={`Download ${doc.name}`}
                          className={cn(
                            "cg-btn-primary min-h-0 px-4 py-2.5 text-sm",
                            !doc.fileUrl && "pointer-events-none opacity-50"
                          )}
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
