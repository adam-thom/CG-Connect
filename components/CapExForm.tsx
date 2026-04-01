'use client';

import React, { useState, useTransition } from 'react';
import { submitCapExRequest, updateCapExRequest } from '@/app/actions/capex';
import { UploadCloud, Loader2, DollarSign, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CapExForm({ existingData, locations }: { existingData?: any, locations?: string[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  
  const isEditing = !!existingData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Capture the form element NOW — e.currentTarget becomes null after the async transition
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
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-6">
        {isEditing ? "Revise CapEx Blueprint" : "Submit New Capital Expenditure"}
      </h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Project Name / Description</label>
          <input 
            type="text" 
            name="projectName" 
            defaultValue={existingData?.projectName || ''}
            required 
            placeholder="E.g., Facility Roof Repair - Summer"
            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#91665b] focus:outline-none transition-all shadow-inner font-medium" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Location Facility</label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select 
                  name="location" 
                  defaultValue={existingData?.location || ''}
                  required 
                  className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#91665b] focus:outline-none transition-all shadow-inner font-medium appearance-none"
              >
                  <option value="" disabled>Select location...</option>
                  {((locations && locations.length > 0) ? locations : ['MB', 'CSG', 'EVG', 'EDENS']).map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Total Budget Required</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                  type="number" 
                  name="amount" 
                  defaultValue={existingData?.amount || ''}
                  required 
                  step="0.01" 
                  min="0"
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#91665b] focus:outline-none transition-all shadow-inner font-medium"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                <UploadCloud className="w-4 h-4 text-slate-500" /> Standardized Reference Processing
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-6 max-w-lg">
                Upload exactly two verifiable contract or invoice estimate quotes verifying standard market values (Supported: .pdf, .docx, .doc).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-2">Comparable Quote A</label>
                   <input type="file" name="quote1" accept=".pdf,.docx,.doc" className="w-full text-sm font-medium file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#91665b]/10 file:text-[#91665b] hover:file:bg-[#91665b]/20 file:transition-colors file:cursor-pointer p-1" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-2">Comparable Quote B</label>
                   <input type="file" name="quote2" accept=".pdf,.docx,.doc" className="w-full text-sm font-medium file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#91665b]/10 file:text-[#91665b] hover:file:bg-[#91665b]/20 file:transition-colors file:cursor-pointer p-1" />
                </div>
            </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
                type="submit" 
                disabled={isPending}
                className="bg-[#91665b] hover:bg-[#674840] disabled:opacity-50 text-white px-8 py-4 rounded-full font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2 group w-full sm:w-auto justify-center"
            >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {isEditing ? 'Save Revisions' : 'Submit for Oversight Approval'}
            </button>
        </div>
      </form>
    </div>
  );
}
