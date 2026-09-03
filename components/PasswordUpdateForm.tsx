"use client";

import { useActionState } from 'react';
import { updatePasswordAction } from '@/app/actions/users';
import { LockKeyhole, Save } from 'lucide-react';

export function PasswordUpdateForm() {
  const [state, action, isPending] = useActionState(updatePasswordAction, undefined);

  return (
    <div className="bg-ui-surface rounded-2xl border border-ui-border shadow-sm overflow-hidden flex flex-col mt-8">
      <div className="p-6 border-b border-ui-border flex items-center gap-3">
        <LockKeyhole className="w-5 h-5 text-brand-500" />
        <h2 className="text-lg text-ui-text-primary">Account Security</h2>
      </div>
      
      <div className="p-6">
        <form action={action} className="max-w-xl space-y-6">
           <p className="text-sm text-sage font-medium pb-2">Change the password you use to sign in. Choose something long that you have not used elsewhere.</p>
           
           <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sage uppercase tracking-widest mb-2">CURRENT PASSWORD</label>
                <input type="password" name="currentPassword" required disabled={isPending}
                   autoComplete="new-password" data-lpignore="true"
                   className="w-full px-4 py-3 bg-ui-bg-alt border border-ui-border rounded-xl focus:bg-ui-surface focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-600 transition-all font-medium text-ui-text-primary"
                   placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sage uppercase tracking-widest mb-2">NEW SECURE PASSWORD</label>
                <input type="password" name="newPassword" required disabled={isPending} minLength={8}
                   autoComplete="new-password" data-lpignore="true"
                   className="w-full px-4 py-3 bg-ui-bg-alt border border-ui-border rounded-xl focus:bg-ui-surface focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-600 transition-all font-medium text-ui-text-primary"
                   placeholder="New password (min 8 characters)"
                />
              </div>
           </div>

           {state?.error && (
             <div className="p-3 bg-status-error-soft text-status-error rounded-lg text-sm font-semibold border border-status-error/30">
               {state.error}
             </div>
           )}

           {state?.success && (
             <div className="p-3 bg-status-success-soft text-status-success rounded-lg text-sm font-semibold border border-status-success/30">
               {state.message}
             </div>
           )}

           <div className="pt-2">
              <button type="submit" disabled={isPending} className="cg-btn-primary">
                 {isPending ? 'One moment.' : <><Save className="w-4 h-4" /> Save New Password</>}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
