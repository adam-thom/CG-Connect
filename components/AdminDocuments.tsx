"use client";

import { useActionState, useEffect, useState, useTransition } from 'react';
import {
  PlusCircle,
  Search,
  FileText,
  Image as ImageIcon,
  Table2,
  Trash2,
  Download,
  Loader2,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import {
  uploadDocument,
  fetchDocuments,
  deleteDocument,
  type DocFormState,
} from '@/app/actions/documents';
import { Modal } from '@/components/Modal';
import { useToast, useConfirm } from '@/components/Toast';
import { formatDate, cn } from '@/lib/utils';

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

const CATEGORIES = [
  'POLICY MANUALS',
  'STANDARDS OF PRACTICE',
  'HR & HANDBOOKS',
  'FORMS',
  'HEALTH & SAFETY',
  'GENERAL',
];

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const field =
  'w-full rounded-[var(--radius-panel)] border border-ui-border bg-ui-bg px-3 py-2.5 text-sm text-ui-text-primary outline-none transition-colors placeholder:text-sage/70 focus:border-accent focus:bg-ui-surface';

export function AdminDocuments() {
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const [docs, setDocs] = useState<Doc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [state, formAction, isUploading] = useActionState<DocFormState, FormData>(
    uploadDocument,
    {}
  );

  const load = () =>
    fetchDocuments()
      .then(rows => setDocs(rows as unknown as Doc[]))
      .catch(err => console.error('Could not load documents', err))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (state.success) {
      setIsAddOpen(false);
      toast.success('Document uploaded.');
      load();
    } else if (state.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const remove = async (doc: Doc) => {
    const ok = await confirm({
      title: 'Remove this document?',
      body: `“${doc.name}” will no longer be available to staff, and the file is deleted.`,
      confirmLabel: 'Remove',
      destructive: true,
    });
    if (!ok) return;
    startTransition(async () => {
      try {
        await deleteDocument(doc.id);
        await load();
        toast.success('Document removed.');
      } catch {
        toast.error('That did not delete. Please try again.');
      }
    });
  };

  const filtered = docs.filter(d =>
    [d.name, d.category, d.originalName]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(query.trim().toLowerCase()))
  );

  const totalBytes = docs.reduce((a, d) => a + d.sizeBytes, 0);

  return (
    <div className="animate-in fade-in duration-300 ease-cg mx-auto max-w-6xl pb-16">
      {dialog}

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="cg-eyebrow">Document control</p>
          <h1 className="mt-2 text-4xl">Company Repository</h1>
          <p className="mt-2 text-base">Publish policies and forms for every location.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="cg-btn-primary group shrink-0">
          <PlusCircle className="h-4 w-4 transition-transform group-hover:rotate-90" />
          Upload a document
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="cg-card">
          <p className="cg-eyebrow mb-1 block text-sage">Documents</p>
          <p className="font-serif text-4xl text-accent-on-surface">
            {isLoading ? '—' : docs.length}
          </p>
        </div>
        <div className="cg-card">
          <p className="cg-eyebrow mb-1 block text-sage">Stored</p>
          <p className="font-serif text-4xl text-accent-on-surface">
            {isLoading ? '—' : humanSize(totalBytes)}
          </p>
        </div>
        <div className="cg-card">
          <p className="cg-eyebrow mb-1 block text-sage">Managers only</p>
          <p className="font-serif text-4xl text-accent-on-surface">
            {isLoading ? '—' : docs.filter(d => d.sharedWith === 'managers').length}
          </p>
        </div>
      </div>

      <div className="cg-card overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-ui-border bg-ui-bg-alt p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg">Registry</h2>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-sage" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Filter the registry"
              aria-label="Filter documents"
              className="w-full rounded-full border border-ui-border bg-ui-surface py-2 pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-sage/70 focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 p-16 text-sm text-sage">
            <Loader2 className="h-5 w-5 animate-spin" />
            One moment.
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <FolderOpen className="mx-auto mb-4 h-10 w-10 text-sage" />
            <p className="text-sage">
              {docs.length === 0
                ? 'Nothing uploaded yet.'
                : "We couldn't find a document matching that."}
            </p>
            {docs.length === 0 && (
              <button onClick={() => setIsAddOpen(true)} className="cg-btn-primary mt-6">
                <PlusCircle className="h-4 w-4" />
                Upload the first one
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-ui-border">
            {filtered.map(doc => {
              const Icon = ICON[doc.type] ?? FileText;
              return (
                <li
                  key={doc.id}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-ui-bg-alt sm:flex-row sm:items-center"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-panel)] bg-brand-100 text-accent-on-surface">
                    <Icon className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ui-text-primary">{doc.name}</p>
                    <p className="cg-meta mt-0.5 block text-sage">
                      {doc.category} · {doc.type.toUpperCase()} · {humanSize(doc.sizeBytes)} ·{' '}
                      {formatDate(doc.createdAt)}
                      {doc.author?.name ? ` · ${doc.author.name}` : ''}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {doc.sharedWith === 'managers' && (
                      <span className="cg-pill-warning">Managers only</span>
                    )}
                    <a
                      href={doc.fileUrl ?? '#'}
                      download={doc.originalName ?? doc.name}
                      aria-label={`Download ${doc.name}`}
                      className={cn(
                        'rounded-full p-2 text-sage transition-colors hover:bg-brand-100 hover:text-accent-on-surface',
                        !doc.fileUrl && 'pointer-events-none opacity-40'
                      )}
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => remove(doc)}
                      disabled={isPending}
                      aria-label={`Remove ${doc.name}`}
                      className="rounded-full p-2 text-sage transition-colors hover:bg-status-error-soft hover:text-status-error disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Upload a document">
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div role="alert" className="cg-callout flex items-center gap-3 text-sm text-status-error">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="doc-file" className="cg-eyebrow block text-sage">
              File
            </label>
            <input
              id="doc-file"
              name="file"
              type="file"
              required
              className="block w-full cursor-pointer rounded-[var(--radius-panel)] border border-dashed border-ui-border bg-ui-bg px-4 py-6 text-sm text-sage file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:border-brand-300"
            />
            <p className="cg-meta text-sage">PDF, Word, Excel, PowerPoint, CSV or image. Up to 25 MB.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="doc-name" className="cg-eyebrow block text-sage">
              Display name
            </label>
            <input
              id="doc-name"
              name="name"
              placeholder="Leave blank to use the file name"
              className={field}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="doc-category" className="cg-eyebrow block text-sage">
                Category
              </label>
              <select id="doc-category" name="category" className={field} defaultValue="GENERAL">
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="doc-shared" className="cg-eyebrow block text-sage">
                Who can see it
              </label>
              <select id="doc-shared" name="sharedWith" className={field} defaultValue="all">
                <option value="all">Everyone</option>
                <option value="managers">Managers only</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="cg-btn-secondary min-h-0 py-2.5 text-sm"
            >
              Cancel
            </button>
            <button type="submit" disabled={isUploading} className="cg-btn-primary min-h-0 py-2.5 text-sm">
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              {isUploading ? 'One moment.' : 'Upload'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
