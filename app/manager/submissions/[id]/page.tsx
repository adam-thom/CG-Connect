"use client";

import { useAuth } from "@/lib/auth-context";
import { SubmissionDetail } from "@/components/SubmissionDetail";
import { MOCK_SUBMISSIONS } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { useState } from "react";

const formatKey = (key: string) => {
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export default function ManagerSubmissionViewPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  
  const [submission, setSubmission] = useState(() => {
    return MOCK_SUBMISSIONS.find(s => s.id === params.id);
  });

  if (!user) return null;
  if (!submission) return notFound();

  // Basic check to ensure Manager
  if (user.role !== "manager") {
    return <div className="p-8 text-center text-red-600">Restricted access area.</div>;
  }

  const handleStatusChange = (newStatus: string) => {
    setSubmission(prev => prev ? { ...prev, status: newStatus as any } : prev);
  };

  const handleAddComment = (content: string) => {
    const newComment = {
      id: `CMT-${Date.now()}`,
      authorId: user.id,
      content,
      createdAt: new Date().toISOString()
    };
    setSubmission(prev => prev ? { 
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
