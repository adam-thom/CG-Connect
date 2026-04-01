'use client';

import React from 'react';
import { DollarSign } from 'lucide-react';

interface CapExProgressBarProps {
  budget: number;
  spent: number;
  userName?: string;
}

export function CapExProgressBar({ budget, spent, userName }: CapExProgressBarProps) {
  const isSetup = budget > 0;
  const percentage = isSetup ? Math.min((spent / budget) * 100, 100) : 0;
  
  let barColor = 'bg-[#E5A877]'; 
  if (percentage >= 90) barColor = 'bg-red-500';
  else if (percentage >= 75) barColor = 'bg-[#c0836b]';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
           <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
             <DollarSign className="w-4 h-4" />
           </div>
          {userName ? `${userName}'s CapEx Budget` : "Quarterly Budget Allowance"}
        </h3>
        {isSetup ? (
            <span className="text-sm font-bold text-slate-700">
            ${spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-slate-400 font-medium">/ ${budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </span>
        ) : (
            <span className="text-sm font-bold text-slate-400">Not Configured</span>
        )}
      </div>
      
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
        {isSetup && (
            <div 
            className={`h-full ${barColor} transition-all duration-1000 ease-out`} 
            style={{ width: `${percentage}%` }}
            />
        )}
      </div>
      
      <div className="mt-3 text-xs font-bold text-slate-400 flex items-center justify-between">
        <span>{percentage.toFixed(1)}% Consumed</span>
        <span>{isSetup ? (100 - percentage).toFixed(1) : '0'}% Remaining</span>
      </div>
    </div>
  );
}
