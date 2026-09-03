"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";
type Toast = { id: number; tone: ToastTone; message: string };

type ToastApi = {
  /** Confirms something happened. */
  success: (message: string) => void;
  /** Something did not work. Stays until dismissed. */
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

/**
 * One place to say "that worked" or "that did not".
 *
 * Replaces the three patterns the app had grown: inline status text, browser
 * alert(), and silence. Anything that changes data should say so here.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId.current++;
      setToasts(prev => [...prev, { id, tone, message }]);
      // Errors stay put: the reader may need to act on them. Confirmations
      // clear themselves so they do not pile up.
      if (tone !== "error") {
        window.setTimeout(() => dismiss(id), 4000);
      }
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: m => push("success", m),
      error: m => push("error", m),
      info: m => push("info", m),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        // Polite so a confirmation does not interrupt what someone is reading,
        // but assistive tech still announces it.
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      >
        {toasts.map(t => (
          <ToastRow key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const TONE = {
  success: { icon: CheckCircle2, cls: "border-status-success/40 bg-status-success-soft text-status-success" },
  error: { icon: AlertCircle, cls: "border-status-error/40 bg-status-error-soft text-status-error" },
  info: { icon: Info, cls: "border-ui-border bg-ui-surface text-ui-text-primary" },
} as const;

function ToastRow({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const { icon: Icon, cls } = TONE[toast.tone];
  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[var(--radius-panel)] border p-4 shadow-[0_8px_24px_-12px_rgba(24,28,29,0.35)]",
        "animate-in fade-in slide-in-from-bottom-2 duration-300 ease-cg",
        cls
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1 text-sm leading-snug">{toast.message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/**
 * Falls back to no-ops outside a provider so a component can call it without
 * knowing whether it is inside the app shell.
 */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  const fallback = useMemo<ToastApi>(
    () => ({ success: () => {}, error: () => {}, info: () => {} }),
    []
  );
  return ctx ?? fallback;
}

/**
 * A styled replacement for window.confirm(), so destructive actions match the
 * rest of the interface instead of raising an OS dialog.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const handle = () => onCancel();
    d.addEventListener("close", handle);
    return () => d.removeEventListener("close", handle);
  }, [onCancel]);

  return (
    <dialog
      ref={ref}
      onClick={e => {
        if (e.target === ref.current) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-[var(--radius-card)] border border-ui-border bg-ui-surface p-0 text-ui-text-primary outline-none open:animate-in open:fade-in open:zoom-in-95 duration-200 ease-cg backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <h2 className="text-xl">{title}</h2>
        {body && <p className="mt-2 text-sm text-ui-text-secondary">{body}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="cg-btn-secondary min-h-0 py-2.5 text-sm">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "inline-flex min-h-0 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white transition-colors",
              destructive
                ? "bg-status-error hover:brightness-110"
                : "bg-accent hover:bg-accent-dark"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}

/**
 * Ergonomic wrapper so a component can `await confirm(...)` instead of wiring
 * dialog state by hand. Returns the element to render plus the asking function.
 *
 *   const { confirm, dialog } = useConfirm();
 *   ...
 *   if (await confirm({ title: 'Delete this?' })) doIt();
 *   return <>{dialog}...</>
 */
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    body?: string;
    confirmLabel?: string;
    destructive?: boolean;
    resolve?: (ok: boolean) => void;
  }>({ open: false, title: "" });

  const confirm = useCallback(
    (opts: { title: string; body?: string; confirmLabel?: string; destructive?: boolean }) =>
      new Promise<boolean>(resolve => {
        setState({ ...opts, open: true, resolve });
      }),
    []
  );

  const settle = useCallback(
    (ok: boolean) => {
      setState(prev => {
        prev.resolve?.(ok);
        return { ...prev, open: false, resolve: undefined };
      });
    },
    []
  );

  const dialog = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      body={state.body}
      confirmLabel={state.confirmLabel}
      destructive={state.destructive}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  );

  return { confirm, dialog };
}
