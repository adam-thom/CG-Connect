"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Send, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackThreadProps {
  comments: any[];
  status: string;
  type: string;
  onStatusChange: (newStatus: string) => void;
  onAddComment: (content: string) => void;
}

export function FeedbackThread({ comments, status, type, onStatusChange, onAddComment }: FeedbackThreadProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isManager = user?.role === "manager" || user?.role === "admin";
  const isLocked = status === "approved" || status === "finalized";
  
  const isOHSManager = user?.role === "admin" || user?.tags?.some((t: any) => t.name === "OHS Manager");
  const canOverrideStatus = isManager && (type !== "incident" || isOHSManager);

  if (!user) return null;

  const handleSubmit = async () => {
    if (!newComment.trim() && selectedStatus === status) return;
    
    setIsSubmitting(true);
    try {
      if (newComment.trim()) {
        await onAddComment(newComment);
        setNewComment("");
      }
      
      if (selectedStatus !== status) {
        await onStatusChange(selectedStatus);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
      <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-semibold text-brand-900">Feedback Thread & Finalization</h3>
      </div>
      
      <div className="p-6 space-y-6 bg-slate-50/50">
        {comments.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-dashed border-slate-200">
            <p className="text-sm text-slate-500">No comments on this record yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const _isManager = comment.authorRole === "manager" || comment.authorRole === "admin";
              return (
                <div key={comment.id} className="flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 text-sm shadow-sm",
                    _isManager ? "bg-brand-900 text-white" : "bg-white text-brand-700 border border-brand-200"
                  )}>
                    {_isManager ? "M" : "E"}
                  </div>
                  <div className="bg-white rounded-lg p-4 flex-1 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Input Area */}
        {!isLocked && (
          <div className="pt-6 border-t border-slate-200">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isManager ? "Add internal note or request adjustments..." : "Add a reply to the manager..."}
              className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[120px] mb-4 bg-white shadow-sm resize-y"
              disabled={isSubmitting}
            />
            
            <div className="flex items-center justify-between">
              {canOverrideStatus ? (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-between sm:justify-start">
                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-slate-200 rounded-lg text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium text-slate-700 shadow-sm w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    <option value="pending">Keep Pending</option>
                    <option value="revision-required">Require Revision</option>
                    <option value="approved">Approve</option>
                  </select>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || (!newComment.trim() && selectedStatus === status)}
                    className={cn(
                      "text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm w-full sm:w-auto disabled:opacity-50",
                      selectedStatus === "revision-required" ? "bg-orange-600 hover:bg-orange-700" : "bg-brand-900 hover:bg-brand-800"
                    )}
                  >
                    <Send className="w-4 h-4" />
                    {selectedStatus === "revision-required" ? "Send Back for Adjustments" : "Sign Off & Update"}
                  </button>
                </div>
              ) : (
                <div className="flex justify-end w-full">
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !newComment.trim()}
                    className="bg-accent-600 hover:bg-accent-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Submit Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
