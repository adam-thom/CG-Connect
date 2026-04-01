"use client";
import { StatusBadge } from "./StatusBadge";
import { FeedbackThread } from "./FeedbackThread";
import { Submission, Comment } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface SubmissionDetailProps {
  submission: Submission;
  title: string;
  children: React.ReactNode;
  onStatusChange?: (status: string) => void;
  onAddComment?: (content: string) => void;
}

export function SubmissionDetail({ 
  submission, 
  title, 
  children,
  onStatusChange,
  onAddComment
}: SubmissionDetailProps) {
  // We determine if we can edit by the current status
  // but the specific form pages will manage if the fields are actually disabled
  
  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-900 tracking-tight">{title}</h2>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500 font-medium">
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">ID: {submission.id}</span>
            <span>Submitted by {submission.submitterId}</span>
            <span>•</span>
            <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex shrink-0">
          <StatusBadge status={submission.status} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8 ring-1 ring-slate-900/5">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </div>

      <FeedbackThread 
        comments={submission.feedbackThread}
        status={submission.status}
        type={submission.type}
        onStatusChange={(s) => onStatusChange?.(s)}
        onAddComment={(c) => onAddComment?.(c)}
      />
    </div>
  );
}
