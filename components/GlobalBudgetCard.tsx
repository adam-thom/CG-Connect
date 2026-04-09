'use client';

import React, { useState, useTransition } from 'react';
import { setLocationBudget, resetLocationBudget, deleteLocationBudget } from '@/app/actions/capex';
import { Edit3, Check, Loader2, X, RefreshCcw, Activity, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LOCATION_CONFIG: Record<string, { label: string; bar: string; bg: string; text: string; ring: string }> = {
  MB:    { label: 'MB',    bar: 'bg-[#2f9aad]', bg: 'bg-[#2f9aad]/10', text: 'text-[#0d7f94]', ring: 'focus:ring-[#2f9aad]' },
  CSG:   { label: 'CSG',  bar: 'bg-emerald-600', bg: 'bg-emerald-50',   text: 'text-emerald-700', ring: 'focus:ring-emerald-600' },
  EVG:   { label: 'EVG',  bar: 'bg-violet-600',  bg: 'bg-violet-50',    text: 'text-violet-700',  ring: 'focus:ring-violet-600' },
  EDENS: { label: 'EDENS',bar: 'bg-orange-600',  bg: 'bg-orange-50',    text: 'text-orange-700',  ring: 'focus:ring-orange-600' },
};

export interface LocationBudget {
  id: string;
  name: string;
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
      await setLocationBudget(lb.id, val);
      setEditing(false);
    });
  };

  const handleReset = () => {
    if (!confirm('Are you sure you want to renew this budget? This will refill the bar to maximum and ignore past approved requests.')) return;
    startTransition(async () => {
      await resetLocationBudget(lb.id);
    });
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to completely delete this budget? All related CapEx requests will lose their category association.')) return;
    startTransition(async () => {
      await deleteLocationBudget(lb.id);
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="bg-white rounded-none border border-slate-300 shadow-[2px_2px_10px_rgb(0,0,0,0.03)] p-5 lg:p-7 flex flex-col h-full overflow-hidden relative group"
    >
      <div className="flex flex-col gap-4 mb-6 flex-1 z-10 relative">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-none flex shrink-0 items-center justify-center font-bold text-lg border border-slate-200 ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 leading-tight tracking-tight">{lb.name}</h3>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">
              ${lb.spent.toLocaleString(undefined, { maximumFractionDigits: 0 })} Used
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full mt-auto pt-2">
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div 
                key="editing"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-stretch gap-0 w-full lg:w-auto"
              >
                <div className="relative flex-1 lg:flex-none">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
                  <input
                    type="number"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isPending}
                    autoFocus
                    className={`w-full lg:w-36 pl-8 pr-4 py-3 text-sm font-medium border border-slate-300 border-r-0 rounded-none bg-white focus:outline-none focus:ring-1 focus:z-10 ${cfg.ring} transition-colors`}
                  />
                </div>
                <button 
                  onClick={handleSave} 
                  disabled={isPending} 
                  className="px-4 flex items-center justify-center bg-slate-900 text-white border border-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => { setEditing(false); setInput(lb.budget.toString()); }} 
                  disabled={isPending} 
                  className="px-4 flex items-center justify-center bg-slate-50 text-slate-500 border border-slate-300 border-l-0 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="viewing"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-4 bg-slate-50/50 border border-slate-200 p-3 sm:px-5 sm:py-3 rounded-none w-full xl:w-auto justify-between xl:justify-end"
              >
                <div className="text-left xl:text-right flex-1">
                  <span className="block text-[10px] sm:text-xs font-bold tracking-[0.15em] text-slate-400 mb-1 leading-none uppercase">Allowance</span>
                  <span className="text-base sm:text-xl font-serif font-bold text-slate-900 leading-none">
                    {lb.budget > 0
                      ? `$${lb.budget.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : 'Not set'}
                  </span>
                </div>
                {!readOnly && (
                  <>
                    <div className="w-px h-8 bg-slate-200 hidden sm:block mx-2"></div>
                    <div className="flex items-center shrink-0 border border-slate-200 divide-x divide-slate-200 rounded-none overflow-hidden">
                      <button
                         onClick={() => setEditing(true)}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 bg-white hover:bg-slate-50 transition-colors"
                        title="Set Budget"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleReset}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 bg-white hover:bg-slate-50 transition-colors"
                        title="Renew Budget"
                      >
                        <RefreshCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 transition-colors"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full h-2 bg-slate-100 rounded-none overflow-hidden border border-slate-200/50 mb-3 relative z-10">
        {lb.budget > 0 ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${remainingPct}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className={`h-full ${cfg.bar} absolute left-0 top-0 border-r border-black/10`}
          />
        ) : (
          <div className="h-full w-full bg-slate-200 opacity-50" />
        )}
      </div>

      <div className="flex justify-between items-center text-[10px] sm:text-xs font-semibold text-slate-500 z-10 relative uppercase tracking-wider">
        <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> {remainingPct.toFixed(0)}% Left</span>
        <span className="text-slate-400">{pct.toFixed(0)}% Used</span>
      </div>

      {/* Decorative top border */}
      <div className={`absolute top-0 left-0 w-full h-1 ${cfg.bar} opacity-60`} />
    </motion.div>
  );
}
