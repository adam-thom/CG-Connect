"use client";

import { useAuth } from "@/lib/auth-context";
import { SubmissionDetail } from "@/components/SubmissionDetail";
import { fetchSubmissionById } from "@/app/actions/submissions";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

// Helper to format camelCase keys to Sentance Case
const formatKey = (key: string) => {
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export default function SubmissionViewPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubmissionById(params.id).then(data => {
      setSubmission(data);
      setIsLoading(false);
    });
  }, [params.id]);

  if (!user) return null;
  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (!submission) return notFound();

  // Basic check if employee can view this
  if (user.role === "employee" && submission.submitterId !== user.id) {
    return <div className="p-8 text-center text-red-600">You do not have permission to view this record.</div>;
  }

  const isEditable = user.role === "employee" && submission.status === "revision-required";

  const handleStatusChange = (newStatus: string) => {
    setSubmission((prev: any) => prev ? { ...prev, status: newStatus as any } : prev);
  };

  const handleAddComment = (content: string) => {
    const newComment = {
      id: `CMT-${Date.now()}`,
      authorId: user.id,
      content,
      createdAt: new Date().toISOString()
    };
    setSubmission((prev: any) => prev ? { 
      ...prev, 
      feedbackThread: [...prev.feedbackThread, newComment] 
    } : prev);
  };

  // Render abstract fields based on data object
  const renderDataFields = (data: any) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
        {Object.entries(data).map(([key, value]) => {
          // If value is a long string narrative, make it full width
          const isNarrative = typeof value === 'string' && value.length > 50;
          
          return (
            <div key={key} className={isNarrative ? "col-span-full" : ""}>
              <label className="block text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                {formatKey(key)}
              </label>
              {isEditable ? (
                isNarrative ? (
                  <textarea 
                    className="w-full border border-orange-300 rounded-lg p-3 bg-orange-50 focus:ring-2 focus:ring-brand-500 text-slate-800" 
                    defaultValue={String(value)}
                    rows={4}
                  />
                ) : (
                  <input 
                    type={typeof value === 'number' ? 'number' : 'text'}
                    className="w-full border border-orange-300 rounded-lg p-3 bg-orange-50 focus:ring-2 focus:ring-brand-500 text-slate-800" 
                    defaultValue={String(value)}
                  />
                )
              ) : (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-800 min-h-[50px] font-medium">
                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <SubmissionDetail
      submission={submission}
      title={`${formatKey(submission.type)} Record`}
      onStatusChange={handleStatusChange}
      onAddComment={handleAddComment}
    >
      {isEditable && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 flex items-center gap-3 text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
          This submission requires your revision. Please make necessary updates to the highlighted fields above and reply in the feedback thread below.
        </div>
      )}
      {renderDataFields(submission.data)}
    </SubmissionDetail>
  );
}
