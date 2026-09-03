"use client";

import { StatusBadge } from "./StatusBadge";
import { FeedbackThread, type ThreadComment } from "./FeedbackThread";
import { formatDate } from "@/lib/utils";

export interface SubmissionRecord {
  id: string;
  type: string;
  status: string;
  submitterId: string;
  submitterName: string;
  createdAt: string;
  updatedAt: string;
  data: Record<string, unknown>;
  feedbackThread: ThreadComment[];
}

interface SubmissionDetailProps {
  submission: SubmissionRecord;
  title: string;
  children: React.ReactNode;
  onStatusChange?: (status: string) => void;
  onAddComment?: (content: string) => Promise<void> | void;
}

export function SubmissionDetail({
  submission,
  title,
  children,
  onStatusChange,
  onAddComment,
}: SubmissionDetailProps) {
  return (
    <div className="animate-in fade-in mx-auto max-w-4xl pb-12 duration-300 ease-cg">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl tracking-tight text-ui-text-primary">{title}</h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-sage">
            <span>Filed by {submission.submitterName}</span>
            <span aria-hidden>•</span>
            <span>{formatDate(submission.createdAt)}</span>
            <span aria-hidden>•</span>
            <span className="rounded bg-ui-bg-alt px-2 py-0.5 font-mono text-xs text-ui-text-secondary">
              {submission.id}
            </span>
          </div>
        </div>
        <div className="flex shrink-0">
          <StatusBadge status={submission.status} />
        </div>
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl border border-ui-border bg-ui-surface shadow-sm">
        <div className="p-6 md:p-8">{children}</div>
      </div>

      <FeedbackThread
        comments={submission.feedbackThread}
        status={submission.status}
        onStatusChange={s => onStatusChange?.(s)}
        onAddComment={c => onAddComment?.(c)}
      />
    </div>
  );
}
