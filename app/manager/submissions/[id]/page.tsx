"use client";

import { useAuth } from "@/lib/auth-context";
import { SubmissionDetail } from "@/components/SubmissionDetail";
import { fetchSubmissionById, updateSubmissionStatusAdmin } from "@/app/actions/submissions";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const formatKey = (key: string) => {
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export default function ManagerSubmissionViewPage({ params }: { params: { id: string } }) {
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

  // Basic check to ensure Manager
  if (user.role !== "manager") {
    return <div className="p-8 text-center text-red-600">Restricted access area.</div>;
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateSubmissionStatusAdmin(submission.id, submission.type, newStatus);
      setSubmission((prev: any) => prev ? { ...prev, status: newStatus as any } : prev);
    } catch (e) {
      alert("Failed to update status");
    }
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

  // Managers never edit the form fields directly, they only review them and update status
  const renderDataFields = (data: any) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
        {Object.entries(data).map(([key, value]) => {
          const isNarrative = typeof value === 'string' && value.length > 50;
          
          return (
            <div key={key} className={isNarrative ? "col-span-full" : ""}>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                {formatKey(key)}
              </label>
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 text-brand-900 min-h-[50px] font-medium leading-relaxed">
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <SubmissionDetail
      submission={submission}
      title={`${formatKey(submission.type)} Record Detail`}
      onStatusChange={handleStatusChange}
      onAddComment={handleAddComment}
    >
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 font-bold flex items-center justify-center shrink-0">
          U
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Submitter Reference</p>
          <p className="text-lg font-bold text-brand-900">{submission.submitterId}</p>
        </div>
      </div>
      
      {renderDataFields(submission.data)}
    </SubmissionDetail>
  );
}
