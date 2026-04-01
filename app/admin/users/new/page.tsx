"use client";

import { useActionState, useEffect, useState } from 'react';
import { createUserAction, fetchTagsByCategory } from '@/app/actions/users';
import { UserPlus, ArrowRight, ShieldCheck, Mail, Key, Tag } from 'lucide-react';
import Link from 'next/link';

export default function CreateUserPage() {
  const [state, action, isPending] = useActionState(createUserAction, undefined);
  const [tags, setTags] = useState<{manager: any[], employee: any[], additional: any[]}>({ manager: [], employee: [], additional: [] });

  useEffect(() => {
    fetchTagsByCategory().then(data => setTags(data));
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12 animate-in fade-in duration-500">
       <div className="mb-10">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
             <Link href="/admin/dashboard" className="hover:text-slate-800 transition-colors">PORTAL</Link> 
             <span className="text-slate-300">&gt;</span> 
             <Link href="/admin/users" className="hover:text-slate-800 transition-colors">STAFF DIRECTORY</Link>
             <span className="text-slate-300">&gt;</span> CREATE
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
             Provision Secure Access
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Define role scope and strict location tracking logic for a new network deployment natively.</p>
       </div>

       <form action={action} className="bg-white p-8 sm:p-12 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50 rounded-full blur-3xl -mr-32 -mt-32 z-0 pointer-events-none opacity-50"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
             
             {/* General Info */}
             <div className="space-y-6">
                 <div className="flex items-center gap-2 mb-6">
                    <UserPlus className="w-5 h-5 text-brand-500" />
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex-grow">Profile Basics</h3>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">FIRST NAME</label>
                        <input type="text" name="firstName" required disabled={isPending}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#91665b]/30 focus:border-[#91665b] transition-all font-medium text-slate-900 placeholder-slate-400"
                            placeholder="e.g. John" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">LAST NAME</label>
                        <input type="text" name="lastName" required disabled={isPending}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#91665b]/30 focus:border-[#91665b] transition-all font-medium text-slate-900 placeholder-slate-400"
                            placeholder="e.g. Doe" />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">NETWORK ROLE</label>
                        <select name="role" required disabled={isPending} className="w-full px-4 py-3 border-r-8 border-transparent bg-slate-50 border-y border-x border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#91665b]/30 focus:border-[#91665b] transition-all font-medium text-slate-900 cursor-pointer">
                           <option value="employee">Employee</option>
                           <option value="manager">Manager</option>
                           <option value="admin">Admin</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">DEPARTMENT</label>
                        <input type="text" name="department" disabled={isPending} placeholder="Operations"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#91665b]/30 focus:border-[#91665b] transition-all font-medium text-slate-900 placeholder-slate-400" />
                     </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">JOB TITLE</label>
                    <input type="text" name="title" disabled={isPending} placeholder="Funeral Director"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#91665b]/30 focus:border-[#91665b] transition-all font-medium text-slate-900 placeholder-slate-400" />
                 </div>

                 <div className="pt-6">
                    <div className="flex items-center gap-2 mb-6">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex-grow">Security Credentials</h3>
                    </div>

                     <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">EMAIL ADDRESS</label>
                            <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input type="email" name="email" required disabled={isPending}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium text-slate-900 placeholder-slate-400"
                                placeholder="staff@caring.com" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">TEMPORARY PASSWORD</label>
                            <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input type="password" name="password" required disabled={isPending}
                                autoComplete="new-password" data-lpignore="true"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium text-slate-900 placeholder-slate-400"
                                placeholder="••••••••" />
                            </div>
                        </div>
                    </div>
                 </div>
             </div>

             {/* Dynamic Tag Matrix */}
             <div className="space-y-6 lg:border-l border-slate-100 lg:pl-12">
                 <div className="flex items-center gap-2 mb-6">
                    <Tag className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex-grow">Routing Tags Matrix</h3>
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed -mt-4 mb-4">
                   Select all physical locations and routing protocols this user belongs to. An Employee submitting a form will route it to Managers matching their tags.
                 </p>

                 {/* Employee Tags */}
                 {tags.employee.length > 0 && (
                     <div className="mb-6">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Employee Routing</h4>
                        <div className="grid grid-cols-2 gap-2">
                           {tags.employee.map(t => (
                              <label key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-colors group">
                                 <input type="checkbox" name="tags" value={t.id} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 pointer-events-none" />
                                 <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-900 capitalize leading-none">{t.name}</span>
                              </label>
                           ))}
                        </div>
                     </div>
                 )}

                 {/* Manager Tags */}
                 {tags.manager.length > 0 && (
                     <div className="mb-6">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Manager Scope</h4>
                        <div className="grid grid-cols-2 gap-2">
                           {tags.manager.map(t => (
                              <label key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-colors group">
                                 <input type="checkbox" name="tags" value={t.id} className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 pointer-events-none" />
                                 <span className="text-sm font-bold text-slate-700 group-hover:text-amber-900 capitalize leading-none">{t.name}</span>
                              </label>
                           ))}
                        </div>
                     </div>
                 )}

                 {/* Additional Tags */}
                 {tags.additional.length > 0 && (
                     <div className="mb-6">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">System Groups</h4>
                        <div className="grid grid-cols-2 gap-2">
                           {tags.additional.map(t => (
                              <label key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors group">
                                 <input type="checkbox" name="tags" value={t.id} className="w-4 h-4 text-slate-600 rounded border-slate-300 focus:ring-slate-500 pointer-events-none" />
                                 <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 capitalize leading-none">{t.name}</span>
                              </label>
                           ))}
                        </div>
                     </div>
                 )}
             </div>
          </div>

          {state?.error && (
            <div className="relative z-10 mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-semibold text-sm">
               Error: {state.error}
            </div>
          )}

          <div className="relative z-10 mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
               <Link href="/admin/users" className="text-slate-500 font-bold hover:text-slate-800 transition-colors px-4 py-2">
                 Cancel Generation
               </Link>
               
               <button type="submit" disabled={isPending} className="bg-[#91665b] hover:bg-[#674840] disabled:opacity-50 text-white px-8 py-3.5 rounded-full font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2 group w-full sm:w-auto justify-center">
                 {isPending ? 'Provisioning Profile...' : 'Deploy Secure User'}
                 {!isPending && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
               </button>
          </div>
       </form>
    </div>
  );
}
