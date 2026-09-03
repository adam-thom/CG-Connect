"use client";

import { useAuth } from "@/lib/auth-context";
import { SubmissionDetail, type SubmissionRecord } from "@/components/SubmissionDetail";
import {
  addSubmissionComment,
  fetchSubmissionById,
  updateSubmissionStatusAdmin,
} from "@/app/actions/submissions";
import { notFound } from "next/navigation";
import { useState, useEffect, use } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { formatCalendarDate } from "@/lib/utils";

const formatKey = (key: string) => {
  const spaced = key.replace(/([A-Z])/g, " $1").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (value instanceof Date) return formatCalendarDate(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export default function ManagerSubmissionViewPage({
  params,
}: {
  // `params` is a Promise in this version of Next. Typing it as a plain
  // object compiles but invites reading `.id` off the Promise, which
  // yields undefined at runtime.
  params: Promise<{ id: string }>;
}) {
  const toast = useToast();
  const { user } = useAuth();
  const { id } = use(params);

  const [submission, setSubmission] = useState<SubmissionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetchSubmissionById(id)
      .then(data => {
        if (active) setSubmission(data as SubmissionRecord | null);
      })
      .catch(error => {
        console.error("Could not load that record", error);
        if (active) setLoadFailed(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 p-16 text-sm text-sage">
        <Loader2 className="h-5 w-5 animate-spin" />
        One moment.
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="mx-auto max-w-lg p-16 text-center">
        <p className="text-ui-text-primary">Something went wrong on our end.</p>
        <p className="mt-1 text-sm text-sage">Please try again in a moment.</p>
        <Link href="/manager/submissions" className="cg-btn-secondary mt-6">
          Back to the review queue
        </Link>
      </div>
    );
  }

  if (!submission) return notFound();

  // Admins are shown the whole queue, so they must be able to open what is in it.
  if (user.role !== "manager" && user.role !== "admin") {
    return (
      <div className="p-8 text-center text-status-error">
        This part of the portal is for reviewers.
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateSubmissionStatusAdmin(submission.id, submission.type, newStatus);
      setSubmission(prev => (prev ? { ...prev, status: newStatus } : prev));
      toast.success("Thank you. The record is updated and they have been told.");
    } catch {
      toast.error("That did not save. Please try again.");
    }
  };

  const handleAddComment = async (content: string) => {
    const saved = await addSubmissionComment(submission.id, submission.type, content);
    setSubmission(prev =>
      prev ? { ...prev, feedbackThread: [...prev.feedbackThread, saved] } : prev
    );
  };

  return (
    <SubmissionDetail
      submission={submission}
      title={`${formatKey(submission.type)} record`}
      onStatusChange={handleStatusChange}
      onAddComment={handleAddComment}
    >
      <div className="mb-8 flex items-center gap-3 border-b border-ui-border pb-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ui-bg-alt font-medium text-sage">
          {submission.submitterName.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="cg-eyebrow text-sage">Filed by</p>
          <p className="text-lg text-ui-text-primary">{submission.submitterName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
        {Object.entries(submission.data).map(([key, value]) => {
          const isNarrative = typeof value === "string" && value.length > 50;
          return (
            <div key={key} className={isNarrative ? "col-span-full" : ""}>
              <p className="mb-1.5 text-xs font-semibold tracking-wider text-sage uppercase">
                {formatKey(key)}
              </p>
              <div className="min-h-[50px] rounded-xl border border-ui-border bg-ui-bg-alt/50 p-4 leading-relaxed text-ui-text-primary">
                {displayValue(value)}
              </div>
            </div>
          );
        })}
      </div>
    </SubmissionDetail>
  );
}
