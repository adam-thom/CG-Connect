'use client';

import React, { useState, useTransition } from 'react';
import { submitCapExRequest, updateCapExRequest } from '@/app/actions/capex';
import { UploadCloud, Loader2, DollarSign, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export function CapExForm({ existingData, locations, availableBudgets }: { existingData?: any, locations?: string[], availableBudgets?: { id: string, name: string, location: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [loc, setLoc] = useState(existingData?.location || (locations?.[0] || ''));
  const [isDragging, setIsDragging] = useState(false);
  
  const isEditing = !!existingData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    const file1 = formData.get('quote1') as File;
    const file2 = formData.get('quote2') as File;

    if (!isEditing && (!file1.size || !file2.size)) {
      setError("Two exact matching quote comparisons must be supplied.");
      return;
    }

    startTransition(async () => {
      let result;
      if (isEditing) {
        result = await updateCapExRequest(existingData.id, formData);
      } else {
        result = await submitCapExRequest(formData);
      }

      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
        if (!isEditing) {
            formEl.reset();
        }
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 lg:p-12 border border-slate-200 shadow-[4px_4px_20px_rgb(0,0,0,0.03)] max-w-4xl mx-auto rounded-none relative overflow-hidden"
    >
      {/* Structural Accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-brand-900" />

      <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-8 tracking-tight">
        {isEditing ? "Revise CapEx Blueprint" : "Capital Expenditure Request"}
      </h2>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-slate-900 text-white p-4 font-medium mb-8 flex items-center gap-2 rounded-none border-l-4 border-red-500"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Project Description</label>
          <input 
            type="text" 
            name="projectName" 
            defaultValue={existingData?.projectName || ''}
            required 
            placeholder="E.g., Facility Roof Repair - Summer"
            className="w-full p-4 border-b-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-900 focus:outline-none transition-colors shadow-none font-medium text-slate-900 placeholder-slate-400 rounded-none" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Facility</label>
            <div className="relative group">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand-900 transition-colors" />
              <select 
                  name="location" 
                  value={loc}
                  onChange={e => setLoc(e.target.value)}
                  required 
                  className="w-full pl-12 pr-4 py-4 border-b-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-900 focus:outline-none transition-colors font-medium text-slate-800 appearance-none rounded-none"
              >
                  <option value="" disabled>Select location...</option>
                  {((locations && locations.length > 0) ? locations : ['MB', 'CSG', 'EVG', 'EDENS']).map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Budget Category</label>
            <div className="relative group">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand-900 transition-colors" />
              <select 
                  name="budgetId" 
                  defaultValue={existingData?.budgetId || ''}
                  required 
                  className="w-full pl-12 pr-4 py-4 border-b-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-900 focus:outline-none transition-colors font-medium text-slate-800 appearance-none disabled:opacity-50 rounded-none"
              >
                  <option value="" disabled>Select budget category...</option>
                  {availableBudgets?.filter(b => b.location === loc).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Required Amount</label>
            <div className="relative group">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand-900 transition-colors" />
              <input 
                  type="number" 
                  name="amount" 
                  defaultValue={existingData?.amount || ''}
                  required 
                  step="0.01" 
                  min="0"
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-4 border-b-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-900 focus:outline-none transition-colors font-medium text-slate-800 rounded-none"
              />
            </div>
          </div>
        </div>

        <motion.div 
           onDragEnter={() => setIsDragging(true)}
           onDragLeave={() => setIsDragging(false)}
           onDrop={() => setIsDragging(false)}
          className={`p-8 border border-slate-300 ${isDragging ? 'bg-brand-50 border-brand-900' : 'bg-white'} rounded-none transition-colors duration-300`}
        >
            <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-3 mb-2">
                <motion.div
                  animate={isDragging ? { y: [0, -5, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <UploadCloud className="w-6 h-6 text-brand-900" />
                </motion.div>
                 Reference Documentation
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-6 max-w-xl leading-relaxed">
                Provide two verified vendor quotes or project estimates to authorize the requested capital limit (Supported: .pdf, .docx).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-200 p-4 bg-slate-50">
                   <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-3 block">Primary Quote</label>
                   <input type="file" name="quote1" accept=".pdf,.docx,.doc" className="w-full text-sm font-medium file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-slate-900 file:text-white hover:file:bg-slate-800 file:transition-colors file:cursor-pointer p-0 file:rounded-none" />
                </div>
                <div className="border border-slate-200 p-4 bg-slate-50">
                   <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-3 block">Secondary Quote</label>
                   <input type="file" name="quote2" accept=".pdf,.docx,.doc" className="w-full text-sm font-medium file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-slate-900 file:text-white hover:file:bg-slate-800 file:transition-colors file:cursor-pointer p-0 file:rounded-none" />
                </div>
            </div>
        </motion.div>

        <div className="pt-8 border-t border-slate-200 flex justify-end">
            <button 
                type="submit" 
                disabled={isPending}
                className="bg-brand-900 hover:bg-brand-950 disabled:opacity-50 text-white px-10 py-5 rounded-none font-bold uppercase tracking-widest text-sm transition-colors flex items-center gap-3 w-full sm:w-auto justify-center"
            >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {isEditing ? 'Save Revisions' : 'Authorize Expenditure'}
            </button>
        </div>
      </form>
    </motion.div>
  );
}
