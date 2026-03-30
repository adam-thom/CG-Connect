import { cn } from "@/lib/utils";

type StatusType = "draft" | "pending" | "revision-required" | "finalized" | "approved";

export function StatusBadge({ status }: { status: StatusType | string }) {
  const normalized = status.toLowerCase();
  
  const styles = {
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    "revision-required": "bg-orange-50 text-orange-700 border-orange-200",
    finalized: "bg-emerald-50 text-emerald-700 border-emerald-200",
    approved: "bg-teal-50 text-teal-700 border-teal-200",
  }[normalized] || "bg-slate-100 text-slate-700 border-slate-200";

  const labels = {
    draft: "Draft",
    pending: "Pending Review",
    "revision-required": "Revision Required",
    finalized: "Finalized",
    approved: "Approved",
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm", styles)}>
      {labels[normalized as StatusType] || status}
    </span>
  );
}
