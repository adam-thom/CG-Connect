import { cn } from "@/lib/utils";

type StatusType = "draft" | "pending" | "revision-required" | "finalized" | "approved";

export function StatusBadge({ status }: { status: StatusType | string }) {
  const normalized = status.toLowerCase();
  
  const styles = {
    draft: "bg-ui-bg-alt text-ui-text-secondary border-ui-border",
    pending: "bg-status-warning-soft text-status-warning border-status-warning/60",
    "revision-required": "bg-status-warning-soft text-status-warning border-status-warning/60",
    finalized: "bg-brand-50 text-accent-on-surface border-brand-200/60",
    approved: "bg-status-success-soft text-status-success border-status-success/60",
  }[normalized] || "bg-ui-bg-alt text-ui-text-secondary border-ui-border";

  const dotColors = {
    draft: "bg-slate-400",
    pending: "bg-status-warning",
    "revision-required": "bg-status-warning",
    finalized: "bg-brand-500",
    approved: "bg-status-success",
  }[normalized] || "bg-slate-400";

  const labels = {
    draft: "Draft",
    pending: "Review Required",
    "revision-required": "Revision Needed",
    finalized: "Finalized",
    approved: "Approved",
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-sm", styles)}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors, normalized === 'pending' && "animate-pulse")} />
      {labels[normalized as StatusType] || status}
    </span>
  );
}
