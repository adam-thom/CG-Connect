'use client';

import React, { useState, useTransition } from 'react';
import { setLocationBudget, resetLocationBudget } from '@/app/actions/capex';
import { Edit3, Check, Loader2, X, RefreshCcw, Activity } from 'lucide-react';

export const LOCATION_CONFIG: Record<string, { label: string; bar: string; bg: string; text: string; ring: string }> = {
  MB:    { label: 'MB',    bar: 'bg-[#2f9aad]', bg: 'bg-[#2f9aad]/10', text: 'text-[#0d7f94]', ring: 'focus:ring-[#2f9aad]' },
  CSG:   { label: 'CSG',  bar: 'bg-emerald-500', bg: 'bg-emerald-50',   text: 'text-emerald-700', ring: 'focus:ring-emerald-400' },
  EVG:   { label: 'EVG',  bar: 'bg-violet-500',  bg: 'bg-violet-50',    text: 'text-violet-700',  ring: 'focus:ring-violet-400' },
  EDENS: { label: 'EDENS',bar: 'bg-orange-500',  bg: 'bg-orange-50',    text: 'text-orange-700',  ring: 'focus:ring-orange-400' },
};

export interface LocationBudget {
  location: string;
  budget: number;
  spent: number;
}

export function GlobalLocationBar({ lb, readOnly = false }: { lb: LocationBudget, readOnly?: boolean }) {
  const cfg = LOCATION_CONFIG[lb.location] || LOCATION_CONFIG['MB'];
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(lb.budget.toString());
  const [isPending, startTransition] = useTransition();

  const pct = lb.budget > 0 ? Math.min((lb.spent / lb.budget) * 100, 100) : 0;
  const remainingPct = 100 - pct;

  const handleSave = () => {
    const val = parseFloat(input);
    if (isNaN(val) || val < 0) return;
    startTransition(async () => {
      await setLocationBudget(lb.location, val);
      setEditing(false);
    });
  };

  const handleReset = () => {
    if (!confirm('Are you sure you want to renew this budget? This will refill the bar to maximum and ignore past approved requests.')) return;
    startTransition(async () => {
      await resetLocationBudget(lb.location);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex flex-col gap-3 sm:gap-4 mb-5 flex-1">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex shrink-0 items-center justify-center font-black text-sm sm:text-lg shadow-inner ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">Global Facility Budget</h3>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5">
              ${lb.spent.toLocaleString(undefined, { maximumFractionDigits: 0 })} physically spent
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full mt-auto">
          {editing ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
                <input
                  type="number"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isPending}
                  autoFocus
                  className={`w-36 pl-7 pr-3 py-2 text-sm font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 ${cfg.ring} transition-all`}
                />
              </div>
              <button onClick={handleSave} disabled={isPending} className="w-9 h-9 flex items-center justify-center bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-all shadow-sm">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button onClick={() => { setEditing(false); setInput(lb.budget.toString()); }} disabled={isPending} className="w-9 h-9 flex items-center justify-center bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-100 p-2 sm:px-4 sm:py-2 rounded-xl w-full 2xl:w-auto justify-between 2xl:justify-end">
              <div className="text-left 2xl:text-right flex-1">
                <span className="block text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 mb-0.5 leading-none">BUDGET ALLOWANCE</span>
                <span className="text-sm sm:text-base font-bold text-slate-700 leading-none">
                  {lb.budget > 0
                    ? `$${lb.budget.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                    : 'Not set'}
                </span>
              </div>
              {!readOnly && (
                <>
                  <div className="w-px h-8 bg-slate-200 hidden sm:block mx-1"></div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setEditing(true)}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-lg transition-all shadow-sm hover:shadow"
                      title="Set Budget"
                    >
                      <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={handleReset}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500 hover:border-red-500 bg-white border border-slate-200 rounded-lg transition-all shadow-sm hover:shadow"
                      title="Renew Budget"
                    >
                      <RefreshCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner mb-2">
        {lb.budget > 0 ? (
          <div
            className={`h-full ${cfg.bar} transition-all duration-700 ease-out rounded-full`}
            style={{ width: `${remainingPct}%` }}
          />
        ) : (
          <div className="h-full w-full bg-slate-200 rounded-full opacity-50" />
        )}
      </div>

      <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
        <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> {remainingPct.toFixed(0)}% remaining</span>
        <span className="tracking-wider">{pct.toFixed(0)}% Utilized</span>
      </div>
    </div>
  );
}
