'use client';

import React, { useState, useTransition } from 'react';
import { updateCapExStatus, addCapExComment } from '@/app/actions/capex';
import { CheckCircle, XCircle, Clock, FileText, Send, Building, MapPin, DollarSign, UploadCloud, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CapExForm } from './CapExForm';

export function CapExDetail({ data, currentUserRole, validLocations, availableBudgets }: { data: any; currentUserRole: string; validLocations?: string[]; availableBudgets?: { id: string; name: string; location: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [comment, setComment] = useState("");
  
  const isAdmin = currentUserRole === 'admin';
  const isManager = currentUserRole === 'manager';

  const isEditable = isManager && (data.status === 'Pending' || data.status === 'Revision Requested');

  const quotes = data.quotes ? JSON.parse(data.quotes) : [];
  const budgetName = availableBudgets?.find(b => b.id === data.budgetId)?.name || 'General';

  const handleStatusUpdate = (newStatus: string) => {
    startTransition(async () => {
      await updateCapExStatus(data.id, newStatus);
      router.refresh();
    });
  };

  const handleCommentSubmit = () => {
    if (!comment.trim() || isPending) return;
    startTransition(async () => {
      await addCapExComment(data.id, comment);
      setComment("");
      router.refresh();
    });
  };

  const statusColors: any = {
    'Pending': 'bg-[#E5A877]/10 text-[#c0836b] border-[#E5A877]/20',
    'Approved': 'bg-[#2f9aad]/10 text-[#0d7f94] border-[#2f9aad]/20',
    'Denied': 'bg-red-50 text-red-600 border-red-100',
    'Revision Requested': 'bg-amber-50 text-amber-600 border-amber-100',
  };

  const StatusIcon = () => {
    if (data.status === 'Approved') return <CheckCircle className="w-5 h-5 text-[#0d7f94]" />;
    if (data.status === 'Denied') return <XCircle className="w-5 h-5 text-red-500" />;
    if (data.status === 'Revision Requested') return <RefreshCcw className="w-5 h-5 text-amber-500" />;
    return <Clock className="w-5 h-5 text-[#c0836b]" />;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100">
           <div className="flex-1 p-8">
             <div className="flex items-center gap-3 mb-6">
                 <span className={cn("px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm flex items-center gap-2", statusColors[data.status] || statusColors['Pending'])}>
                   <StatusIcon /> {data.status}
                 </span>
                 <span className="text-sm font-medium text-slate-400 flex items-center gap-1"><Clock className="w-4 h-4"/> {new Date(data.createdAt).toLocaleDateString()}</span>
             </div>

             <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{data.projectName}</h1>
             <p className="text-slate-500 font-medium mb-8 flex items-center gap-2">
                <Building className="w-4 h-4" /> Submitted by <span className="text-slate-700 font-bold">{data.submitter?.name}</span>
             </p>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                 <div>
                    <span className="block text-xs font-bold text-slate-400 tracking-wider mb-2">TARGET LOCATION</span>
                    <span className="font-bold text-slate-800 flex items-center gap-2 text-lg"><MapPin className="w-5 h-5 text-[#91665b]"/> {data.location}</span>
                 </div>
                 <div>
                    <span className="block text-xs font-bold text-slate-400 tracking-wider mb-2">BUDGET CATEGORY</span>
                    <span className="font-bold text-slate-800 flex items-center gap-2 text-lg">{budgetName}</span>
                 </div>
                 <div>
                    <span className="block text-xs font-bold text-slate-400 tracking-wider mb-2">EXPENDITURE AMOUNT</span>
                    <span className="font-bold text-[#0d7f94] flex items-center gap-1 text-xl"><DollarSign className="w-6 h-6"/> {data.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                 </div>
             </div>
             
             <div className="mb-4">
                <span className="block text-xs font-bold text-slate-400 tracking-wider mb-4">SUPPLIED JUSTIFICATION CONTRACTS</span>
                <div className="flex flex-col gap-3">
                   {quotes.map((q: any, i: number) => (
                      <a 
                        key={i} 
                        href={q.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-[#91665b] hover:shadow-md transition-all bg-white group text-sm font-bold text-slate-600 hover:text-[#91665b]"
                      >
                         <span className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-slate-400 group-hover:text-[#91665b]" />
                            {q.name}
                         </span>
                         <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full group-hover:bg-[#91665b]/10">Preview Local Document</span>
                      </a>
                   ))}
                </div>
             </div>
           </div>
           
           {isAdmin && data.status === 'Pending' && (
             <div className="w-80 bg-slate-50 border-l border-slate-200 p-8 flex flex-col items-center justify-center shrink-0 shadow-inner">
                <h3 className="font-bold text-slate-900 mb-6 text-center">Administrative Oversight</h3>
                <div className="w-full space-y-3">
                   <button 
                     onClick={() => handleStatusUpdate('Approved')}
                     disabled={isPending}
                     className="w-full py-4 bg-[#2f9aad] hover:bg-[#0d7f94] text-white font-bold rounded-2xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                   >
                     Authorize Funding
                   </button>
                   <button 
                     onClick={() => handleStatusUpdate('Revision Requested')}
                     disabled={isPending}
                     className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                   >
                     Request Revision Context
                   </button>
                   <button 
                     onClick={() => handleStatusUpdate('Denied')}
                     disabled={isPending}
                     className="w-full py-4 bg-transparent border-2 border-red-200 hover:border-red-500 hover:bg-red-50 text-red-600 font-bold rounded-2xl transition-all disabled:opacity-50"
                   >
                     Deny Expenditure
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
      
      {isEditable && (
        <div className="mb-8">
            <CapExForm existingData={data} locations={validLocations} availableBudgets={availableBudgets} />
        </div>
      )}

      {/* Threaded Feedback */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between shadow-inner">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            Dialogue Threading
          </h3>
        </div>
        
        <div className="p-8 space-y-8 bg-slate-50/30">
          {data.comments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">No organizational dialogue recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {data.comments.map((c: any) => {
                const _isAdmin = c.author.role === "admin";
                return (
                  <div key={c.id} className="flex gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-black shrink-0 text-sm shadow-sm ring-4 ring-white",
                      _isAdmin ? "bg-[#303335] text-white" : "bg-[#91665b] text-white"
                    )}>
                      {_isAdmin ? "A" : "M"}
                    </div>
                    <div className="bg-white rounded-2xl p-5 flex-1 shadow-sm border border-slate-200">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-3">
                        <span className="text-sm font-extrabold text-slate-900">
                          {c.author.name || c.author.email}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1.5 font-bold tracking-wider">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{c.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Comment Drop */}
          <div className="pt-8 border-t border-slate-200 relative">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Inject an organizational mandate or submitter justification metric here..."
              className="w-full border border-slate-200 rounded-2xl p-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91665b] min-h-[140px] mb-4 bg-white shadow-inner resize-y placeholder-slate-400"
            />
            
            <div className="flex justify-end absolute bottom-10 right-6">
               <button 
                   onClick={handleCommentSubmit}
                   disabled={isPending || !comment.trim()}
                   className="bg-[#303335] hover:bg-[#1f2223] disabled:opacity-50 text-white px-8 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
               >
                   {isPending ? <RefreshCcw className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4" />}
                   Transmit Dialogue
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
