"use client";

import { useAuth } from "@/lib/auth-context";
import { SubmissionDetail } from "@/components/SubmissionDetail";
import { SubmissionFormFields } from "@/components/SubmissionFormFields";
import { fetchSubmissionById, updateSubmissionStatusAdmin, addComment } from "@/app/actions/submissions";
import { notFound, useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { Loader2, Lock } from "lucide-react";

const formatKey = (key: string) => {
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export default function ManagerSubmissionViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const router = useRouter();
  
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubmissionById(resolvedParams.id).then(data => {
      setSubmission(data);
      setIsLoading(false);
    });
  }, [resolvedParams.id]);

  if (!user) return null;
  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (!submission) return notFound();

  if (user.role !== "manager" && user.role !== "admin") {
    return <div className="p-8 text-center text-red-600">Restricted access area.</div>;
  }

  const isLocked = submission.status === "approved" || submission.status === "finalized";

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateSubmissionStatusAdmin(submission.id, submission.type, newStatus);
      const updated = await fetchSubmissionById(submission.id);
      setSubmission(updated);
      
      if (newStatus === "approved") {
        setTimeout(() => router.push("/manager/submissions"), 1500);
      }
    } catch (e: any) {
      alert(e.message || "Failed to update status");
    }
  };

  const handleAddComment = async (content: string) => {
    try {
      const newComment = await addComment(submission.id, submission.type, content);
      setSubmission((prev: any) => ({
        ...prev,
        comments: [...prev.comments, newComment]
      }));
    } catch (e: any) {
      alert(e.message || "Failed to add comment");
    }
  };

  return (
    <SubmissionDetail
      submission={{...submission, feedbackThread: submission.comments}}
      title={`${formatKey(submission.type)} Record Detail`}
      onStatusChange={handleStatusChange}
      onAddComment={handleAddComment}
    >
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 font-bold flex items-center justify-center shrink-0">
          {submission.submitterName?.charAt(0) || "U"}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Submitter Reference</p>
          <p className="text-lg font-bold text-brand-900">{submission.submitterName}</p>
        </div>
      </div>
      
      {isLocked && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-3 text-sm font-bold shadow-sm">
          <Lock className="w-5 h-5 shrink-0" />
          This record has been APPROVED and finalized. All fields and feedback are locked.
        </div>
      )}

      <SubmissionFormFields 
        type={submission.type} 
        data={submission.data} 
        isEditable={false} // Managers never edit fields directly
        isLocked={isLocked}
      />
    </SubmissionDetail>
  );
}
