"use client";

import { useAuth } from "@/lib/auth-context";
import { SubmissionDetail, type SubmissionRecord } from "@/components/SubmissionDetail";
import {
  addSubmissionComment,
  fetchSubmissionById,
  resubmitSubmission,
} from "@/app/actions/submissions";
import { useToast } from "@/components/Toast";
import { notFound } from "next/navigation";
import { useState, useEffect, use } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { formatCalendarDate } from "@/lib/utils";

/** "nokName" -> "Nok name". Column names are the only labels we have. */
const formatKey = (key: string) => {
  const spaced = key.replace(/([A-Z])/g, " $1").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/** A stored value as a person should read it. */
function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (value instanceof Date) return formatCalendarDate(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

/** The same value as an input's starting text. */
function inputValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

export default function SubmissionViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = useAuth();
  const toast = useToast();
  // In this version of Next, `params` is a Promise. Reading `.id` off it
  // synchronously yielded undefined, the fetch rejected, and with no catch the
  // page spun forever on its loading state.
  const { id } = use(params);

  const [submission, setSubmission] = useState<SubmissionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchSubmissionById(id)
      .then(data => {
        if (active) setSubmission(data as SubmissionRecord | null);
      })
      .catch(err => {
        console.error("Could not load that record", err);
        if (active) setLoadFailed(true);
      })
      .finally(() => {
        // Always clears, so a failure shows a message rather than a spinner.
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
        <Link href="/employee/submissions" className="cg-btn-secondary mt-6">
          Back to my submissions
        </Link>
      </div>
    );
  }

  if (!submission) return notFound();

  if (user.role === "employee" && submission.submitterId !== user.id) {
    return (
      <div className="p-8 text-center text-status-error">
        That record belongs to someone else.
      </div>
    );
  }

  const isEditable =
    submission.submitterId === user.id && submission.status === "revision-required";

  const handleStatusChange = (newStatus: string) => {
    setSubmission(prev => (prev ? { ...prev, status: newStatus } : prev));
  };

  const handleAddComment = async (content: string) => {
    const saved = await addSubmissionComment(submission.id, submission.type, content);
    setSubmission(prev =>
      prev ? { ...prev, feedbackThread: [...prev.feedbackThread, saved] } : prev
    );
  };

  const handleResubmit = async (formData: FormData) => {
    setIsSaving(true);
    try {
      const result = await resubmitSubmission(submission.id, submission.type, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const refreshed = await fetchSubmissionById(submission.id);
      setSubmission(refreshed as SubmissionRecord | null);
      toast.success("Thank you. Your corrections are back with the reviewer.");
    } catch {
      toast.error("Something went wrong on our end. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const fields = (
    <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
      {Object.entries(submission.data).map(([key, value]) => {
        const isNarrative = typeof value === "string" && value.length > 50;

        return (
          <div key={key} className={isNarrative ? "col-span-full" : ""}>
            <label
              htmlFor={isEditable ? key : undefined}
              className="mb-2 block text-xs font-semibold tracking-wider text-sage uppercase"
            >
              {formatKey(key)}
            </label>
            {isEditable ? (
              isNarrative ? (
                <textarea
                  id={key}
                  name={key}
                  rows={4}
                  defaultValue={inputValue(value)}
                  className="w-full rounded-lg border border-status-warning/30 bg-status-warning-soft p-3 text-ui-text-primary focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              ) : (
                <input
                  id={key}
                  name={key}
                  type={
                    value instanceof Date
                      ? "date"
                      : typeof value === "number"
                        ? "number"
                        : "text"
                  }
                  step={typeof value === "number" ? "any" : undefined}
                  defaultValue={inputValue(value)}
                  className="w-full rounded-lg border border-status-warning/30 bg-status-warning-soft p-3 text-ui-text-primary focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              )
            ) : (
              <div className="min-h-[50px] rounded-lg border border-ui-border bg-ui-bg-alt/50 p-4 text-ui-text-primary">
                {displayValue(value)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <SubmissionDetail
      submission={submission}
      title={`${formatKey(submission.type)} record`}
      onStatusChange={handleStatusChange}
      onAddComment={handleAddComment}
    >
      {isEditable ? (
        <form action={handleResubmit}>
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-status-warning/30 bg-status-warning-soft p-4 text-sm text-status-warning">
            <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-status-warning" />
            This record came back for a change. Please correct the details below and
            send it again.
          </div>

          {fields}

          <div className="mt-8 flex justify-end border-t border-ui-border pt-6">
            <button type="submit" disabled={isSaving} className="cg-btn-primary">
              {isSaving ? "One moment." : "Save and send again"}
            </button>
          </div>
        </form>
      ) : (
        fields
      )}
    </SubmissionDetail>
  );
}
