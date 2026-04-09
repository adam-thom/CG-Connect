'use client';

import React, { useState, useTransition } from 'react';
import { createLocationBudget } from '@/app/actions/capex';
import { Plus, Loader2 } from 'lucide-react';
import { Modal } from './Modal';

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
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-brand-700 hover:border-brand-200 hover:bg-brand-50 rounded-lg text-sm font-bold shadow-sm transition-all"
      >
        <Plus className="w-4 h-4" /> Add Budget
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`New Budget for ${location}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Budget Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Renovation, Vehicles, Marketing"
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Starting Amount</label>
            <input 
              type="number" 
              value={amountStr} 
              onChange={e => setAmountStr(e.target.value)} 
              placeholder="0.00"
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsOpen(false)} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button 
              onClick={handleSave} 
              disabled={isPending}
              className="bg-brand-900 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-800 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
