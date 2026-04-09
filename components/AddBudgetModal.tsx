'use client';

import React, { useState, useTransition } from 'react';
import { createLocationBudget } from '@/app/actions/capex';
import { Plus, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { motion } from 'framer-motion';

export function AddBudgetModal({ location }: { location: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    const val = parseFloat(amountStr);
    if (!name.trim()) return alert("Name is required");
    if (isNaN(val) || val < 0) return alert("Valid budget amount is required");

    startTransition(async () => {
      await createLocationBudget(location, name, val);
      setIsOpen(false);
      setName('');
      setAmountStr('');
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-3 border border-slate-300 bg-white text-slate-800 hover:text-white hover:bg-slate-900 hover:border-slate-900 rounded-none text-xs uppercase tracking-widest font-bold transition-all group shadow-sm"
      >
        <Plus className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" /> 
        Add Budget
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`New Allocation: ${location}`}>
        <div className="space-y-6">
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-2">Portfolio Definition</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Facilities, Fleet, IT"
              className="w-full p-4 border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-900 focus:outline-none transition-colors font-medium text-slate-900 placeholder-slate-400 rounded-none"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-2">Initial Authorisation Limit</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
              <input 
                type="number" 
                value={amountStr} 
                onChange={e => setAmountStr(e.target.value)} 
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-4 border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-900 focus:outline-none transition-colors font-medium text-slate-800 placeholder-slate-400 rounded-none"
              />
            </div>
          </div>
          <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
            <button 
               onClick={() => setIsOpen(false)} 
               className="px-6 py-3 font-bold text-xs uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-none transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={isPending}
              className="bg-brand-900 text-white font-bold text-xs uppercase tracking-widest px-8 py-3 rounded-none flex items-center gap-2 hover:bg-brand-950 disabled:opacity-50 transition-colors"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Execute
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
