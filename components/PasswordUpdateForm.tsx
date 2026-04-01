"use client";

import { useActionState } from 'react';
import { updatePasswordAction } from '@/app/actions/users';
import { LockKeyhole, Save } from 'lucide-react';

export function PasswordUpdateForm() {
  const [state, action, isPending] = useActionState(updatePasswordAction, undefined);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-8">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <LockKeyhole className="w-5 h-5 text-brand-500" />
        <h2 className="text-lg font-bold text-brand-900">Account Security</h2>
      </div>
      
      <div className="p-6">
        <form action={action} className="max-w-xl space-y-6">
           <p className="text-sm text-slate-500 font-medium pb-2">Modify your central system authentication credentials natively. Ensure you use a strong alphanumeric payload.</p>
           
           <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">CURRENT PASSWORD</label>
                <input type="password" name="currentPassword" required disabled={isPending}
                   autoComplete="new-password" data-lpignore="true"
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#91665b]/30 focus:border-[#91665b] transition-all font-medium text-slate-900"
                   placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">NEW SECURE PASSWORD</label>
                <input type="password" name="newPassword" required disabled={isPending} minLength={8}
                   autoComplete="new-password" data-lpignore="true"
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#91665b]/30 focus:border-[#91665b] transition-all font-medium text-slate-900"
                   placeholder="New password (min 8 characters)"
                />
              </div>
           </div>

           {state?.error && (
             <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-semibold border border-red-100">
               {state.error}
             </div>
           )}

           {state?.success && (
             <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold border border-emerald-100">
               {state.message}
             </div>
           )}

           <div className="pt-2">
              <button type="submit" disabled={isPending} className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-2">
                 {isPending ? 'Encrypting Payload...' : <><Save className="w-4 h-4" /> Save New Password</>}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
