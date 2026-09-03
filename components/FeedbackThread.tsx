"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Send, Loader2 } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";

export interface ThreadComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

interface FeedbackThreadProps {
  comments: ThreadComment[];
  status: string;
  onStatusChange: (newStatus: string) => void;
  onAddComment: (content: string) => Promise<void> | void;
}

/** First letters of a name, for the avatar. */
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function FeedbackThread({
  comments,
  status,
  onStatusChange,
  onAddComment,
}: FeedbackThreadProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(status);

  if (!user) return null;

  const isReviewer = user.role === "manager" || user.role === "admin";

  const send = async () => {
    const content = newComment.trim();
    if (!content || isSending) return;
    setIsSending(true);
    setSendError("");
    try {
      await onAddComment(content);
      setNewComment("");
    } catch {
      setSendError("Something went wrong on our end. Please try that again.");
    } finally {
      setIsSending(false);
    }
  };

  const canReply =
    status === "revision-required" || status === "draft" || status === "pending";

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-ui-border bg-ui-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-ui-border bg-ui-bg-alt px-5 py-4">
        <h3 className="text-lg text-ui-text-primary">Notes on this record</h3>
      </div>

      <div className="space-y-6 bg-ui-bg-alt/50 p-6">
        {comments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ui-border bg-ui-surface py-8 text-center">
            <p className="text-sm text-sage">No notes on this record yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => {
              const fromReviewer =
                comment.authorRole === "manager" || comment.authorRole === "admin";
              return (
                <div key={comment.id} className="flex gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium shadow-sm",
                      fromReviewer
                        ? "bg-brand-900 text-white"
                        : "border border-brand-200 bg-ui-surface text-accent-on-surface"
                    )}
                    aria-hidden
                  >
                    {initials(comment.authorName)}
                  </div>
                  <div className="flex-1 rounded-lg border border-ui-border bg-ui-surface p-4 shadow-sm">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-ui-text-primary">
                        {comment.authorName}
                        {comment.authorId === user.id && (
                          <span className="ml-2 text-xs font-normal text-sage">You</span>
                        )}
                      </span>
                      <span className="text-xs text-sage">
                        {formatDateTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-ui-text-secondary">
                      {comment.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t border-ui-border pt-6">
          <label htmlFor="submission-note" className="sr-only">
            Add a note
          </label>
          <textarea
            id="submission-note"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            disabled={isSending}
            placeholder={
              isReviewer
                ? "Add a note, or ask for an adjustment…"
                : "Write back to whoever is reviewing this…"
            }
            className="mb-4 min-h-[120px] w-full resize-y rounded-xl border border-ui-border bg-ui-surface p-4 text-sm shadow-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:opacity-60"
          />

          {sendError && (
            <p role="alert" className="mb-3 text-sm text-status-error">
              {sendError}
            </p>
          )}

          <div className="flex items-center justify-between">
            {isReviewer ? (
              <div className="flex w-full items-center justify-between gap-3 sm:justify-start">
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  aria-label="Record status"
                  className="rounded-lg border border-ui-border bg-ui-surface p-2.5 text-sm font-medium text-ui-text-secondary shadow-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="pending">Leave with review</option>
                  <option value="revision-required">Send back for changes</option>
                  <option value="approved">Approve</option>
                  <option value="finalized">Finalise</option>
                </select>
                <button
                  type="button"
                  disabled={isSending}
                  onClick={async () => {
                    if (newComment.trim()) await send();
                    if (selectedStatus !== status) onStatusChange(selectedStatus);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors disabled:opacity-60",
                    selectedStatus === "revision-required"
                      ? "bg-status-warning"
                      : "bg-brand-900 hover:bg-brand-800"
                  )}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {selectedStatus === "revision-required" ? "Send back" : "Sign off"}
                </button>
              </div>
            ) : (
              <div className="flex w-full justify-end">
                {canReply && (
                  <button
                    type="button"
                    disabled={isSending || !newComment.trim()}
                    onClick={send}
                    className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send note
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
