"use client";

import { useActionState } from 'react';
import { createUserAction } from '@/app/actions/users';
import { UserPlus, ArrowRight, ShieldCheck, Mail, Key } from 'lucide-react';
import Link from 'next/link';

export default function CreateUserPage() {
  const [state, action, isPending] = useActionState(createUserAction, undefined);

  return (
    <div className="max-w-4xl mx-auto py-12 animate-in fade-in duration-500">
       <div className="mb-10">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Link href="/admin/dashboard" className="hover:text-slate-800 transition-colors">PORTAL</Link> 
             <span className="text-slate-300">&gt;</span> STAFF DIRECTORY
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
             Create New User
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Provision secure access credentials for incoming staff natively.</p>
       </div>

       <form action={action} className="bg-white p-8 sm:p-12 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50 rounded-full blur-3xl -mr-32 -mt-32 z-0 pointer-events-none opacity-50"></div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
             
             {/* General Info */}
             <div className="col-span-1 space-y-6">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">FIRST NAME</label>
                    <div className="relative">
                       <input type="text" name="firstName" required disabled={isPending}
                          className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A7705B]/30 focus:border-[#A7705B] transition-all font-medium text-slate-900 placeholder-slate-400"
                          placeholder="e.g. John"
                       />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">LAST NAME</label>
                    <div className="relative">
                       <input type="text" name="lastName" required disabled={isPending}
                          className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A7705B]/30 focus:border-[#A7705B] transition-all font-medium text-slate-900 placeholder-slate-400"
                          placeholder="e.g. Doe"
                       />
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">SYSTEM ROLE</label>
                    <select name="role" required disabled={isPending} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A7705B]/30 focus:border-[#A7705B] transition-all font-medium text-slate-900 cursor-pointer appearance-none">
                       <option value="employee">Standard Profile (Employee)</option>
                       <option value="manager">Restricted Profile (Manager)</option>
                       <option value="admin">Root Access (Admin)</option>
                    </select>
                 </div>
             </div>

             {/* Authentication Layout */}
             <div className="col-span-1 border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-8 pt-8 sm:pt-0 space-y-6">
                 <div className="flex items-center gap-2 mb-6">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-slate-900">Security Credentials</h3>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">EMAIL ADDRESS</label>
                    <div className="relative">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                       <input type="email" name="email" required disabled={isPending}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium text-slate-900 placeholder-slate-400"
                          placeholder="staff@caring.com"
                       />
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-2">Required for Central System Authentication loop.</p>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">TEMPORARY PASSWORD</label>
                    <div className="relative">
                       <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                       <input type="password" name="password" required disabled={isPending}
                          autoComplete="new-password" data-lpignore="true"
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium text-slate-900 placeholder-slate-400"
                          placeholder="••••••••"
                       />
                    </div>
                 </div>
             </div>
          </div>

          {state?.error && (
            <div className="relative z-10 mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-semibold text-sm">
               Error: {state.error}
            </div>
          )}

          <div className="relative z-10 mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
               <Link href="/admin/dashboard" className="text-slate-500 font-bold hover:text-slate-800 transition-colors px-4 py-2">
                 Cancel Generation
               </Link>
               
               <button type="submit" disabled={isPending} className="bg-[#A7705B] hover:bg-[#8B5A44] disabled:opacity-50 text-white px-8 py-3.5 rounded-full font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2 group w-full sm:w-auto justify-center">
                 {isPending ? 'Provisioning Framework...' : 'Deploy Secure User'}
                 {!isPending && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
               </button>
          </div>
       </form>
    </div>
  );
}
