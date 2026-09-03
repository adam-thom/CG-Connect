"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, Clock, Truck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/** What an employee can file. Mirrors app/employee/submissions/new/[type]. */
export const NEW_RECORD_TYPES = [
  {
    href: "/employee/submissions/new/timesheet",
    label: "Timesheet",
    hint: "Your hours for a day",
    icon: Clock,
  },
  {
    href: "/employee/submissions/new/transfer",
    label: "Transfer record",
    hint: "Details of a transfer",
    icon: Truck,
  },
  {
    href: "/employee/submissions/new/incident",
    label: "Incident report",
    hint: "Something that went wrong",
    icon: TriangleAlert,
  },
];

/**
 * Starts a new record. There are three kinds, so this offers the choice rather
 * than guessing — and lives in one place so the sidebar and the submissions
 * page cannot drift apart.
 */
export function NewRecordMenu({
  label = "New Record",
  fullWidth = false,
  align = "left",
}: {
  label?: string;
  fullWidth?: boolean;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div ref={ref} className={cn("relative", fullWidth && "w-full")}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn("cg-btn-primary group", fullWidth && "w-full")}
      >
        <PlusCircle
          className={cn(
            "h-4 w-4 transition-transform",
            open ? "rotate-45" : "group-hover:rotate-90"
          )}
        />
        {label}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute top-full z-20 mt-2 w-64 overflow-hidden rounded-[var(--radius-card)] border border-ui-border bg-ui-surface shadow-[0_18px_40px_-18px_rgba(24,28,29,0.5)]",
            "animate-in fade-in slide-in-from-top-1 duration-200 ease-cg",
            fullWidth && "w-auto left-0 right-0",
            !fullWidth && (align === "right" ? "right-0" : "left-0")
          )}
        >
          {NEW_RECORD_TYPES.map(t => (
            <Link
              key={t.href}
              role="menuitem"
              href={t.href}
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 p-3 transition-colors hover:bg-ui-bg-alt"
            >
              <t.icon className="mt-0.5 h-4 w-4 shrink-0 text-accent-on-surface" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ui-text-primary">{t.label}</span>
                <span className="block text-xs text-sage">{t.hint}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
