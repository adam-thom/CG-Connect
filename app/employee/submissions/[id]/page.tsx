"use client";

import { useAuth } from "@/lib/auth-context";
import { SubmissionDetail } from "@/components/SubmissionDetail";
import { SubmissionFormFields } from "@/components/SubmissionFormFields";
import { fetchSubmissionById, addComment, updateSubmissionData } from "@/app/actions/submissions";
import { notFound, useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { Loader2, Save, Lock } from "lucide-react";

const formatKey = (key: string) => {
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export default function SubmissionViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const router = useRouter();
  
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    fetchSubmissionById(resolvedParams.id).then(data => {
      setSubmission(data);
      setIsLoading(false);
    });
  }, [resolvedParams.id]);

  if (!user) return null;
  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (!submission) return notFound();

  if (user.role === "employee" && submission.submitterId !== user.id) {
    return <div className="p-8 text-center text-red-600">You do not have permission to view this record.</div>;
  }

  const isEditable = submission.status === "revision-required";
  const isLocked = submission.status === "approved" || submission.status === "finalized";

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

  const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");

    const formData = new FormData(e.currentTarget);

    try {
      await updateSubmissionData(submission.id, submission.type, formData);
      
      // Re-fetch to get clean DB state + trigger UI update to Pending
      const updated = await fetchSubmissionById(submission.id);
      setSubmission(updated);
      
      // Wait a moment and redirect to main submissions page
      setTimeout(() => {
        router.push("/employee/submissions");
      }, 1000);
      
    } catch (e: any) {
      setSaveError(e.message || "Failed to save changes");
      setIsSaving(false);
    }
  };

  return (
    <SubmissionDetail
      submission={{...submission, feedbackThread: submission.comments}}
      title={`${formatKey(submission.type)} Record`}
      onAddComment={handleAddComment}
    >
      {isEditable && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 flex items-center gap-3 text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0"></div>
          This submission requires your revision. Please make necessary updates below and click Save Changes. You may also reply in the feedback thread.
        </div>
      )}

      {isLocked && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-3 text-sm font-bold shadow-sm">
          <Lock className="w-5 h-5 shrink-0" />
          This record has been APPROVED and is locked from further edits.
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm font-medium">
          {saveError}
        </div>
      )}

      <form onSubmit={handleSaveChanges}>
        <SubmissionFormFields 
          type={submission.type} 
          data={submission.data} 
          isEditable={isEditable}
          isLocked={isLocked}
        />
        
        {isEditable && (
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-brand-900 hover:bg-brand-800 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSaving ? "Saving..." : "Save Changes & Resubmit"}
            </button>
          </div>
        )}
      </form>
    </SubmissionDetail>
  );
}
