'use client';

import React, { useState, useTransition } from 'react';
import { setManagerBudget } from '@/app/actions/capex';
import { CapExProgressBar } from './CapExProgressBar';
import { Edit3, Check, Loader2, X } from 'lucide-react';

export function ManagerBudgetCard({ manager, spent }: { manager: any, spent: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(manager.quarterlyCapExBudget?.toString() || "0");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val < 0) return;

    startTransition(async () => {
      await setManagerBudget(manager.id, val);
      setIsEditing(false);
    });
  };

  return (
    <div className="relative group">
       <CapExProgressBar budget={manager.quarterlyCapExBudget || 0} spent={spent} userName={manager.name || manager.email} />
       
       <div className="absolute top-4 right-4 flex items-center gap-2">
           {isEditing ? (
              <div className="flex items-center gap-2 bg-white shadow-lg p-1.5 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-right-2">
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                    <input 
                      type="number" 
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-32 pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#2f9aad]"
                      autoFocus
                      disabled={isPending}
                    />
                 </div>
                 <button 
                   onClick={handleSave} 
                   disabled={isPending}
                   className="w-8 h-8 flex items-center justify-center bg-[#2f9aad] text-white rounded-lg hover:bg-[#0d7f94] transition-colors shadow-sm disabled:opacity-50"
                 >
                   {isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4"/>}
                 </button>
                 <button 
                   onClick={() => {
                      setIsEditing(false);
                      setBudgetInput(manager.quarterlyCapExBudget?.toString() || "0");
                   }} 
                   disabled={isPending}
                   className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                 >
                   <X className="w-4 h-4"/>
                 </button>
              </div>
           ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-full shadow-sm hover:text-[#0d7f94] hover:border-[#0d7f94] transition-all opacity-0 group-hover:opacity-100"
                title="Edit Quarterly Assigned Budget Allowance"
              >
                <Edit3 className="w-4 h-4" />
              </button>
           )}
       </div>
    </div>
  );
}
