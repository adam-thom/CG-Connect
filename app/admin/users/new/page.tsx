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
    <div className="max-w-5xl mx-auto py-12 animate-in fade-in duration-300 ease-cg">
       <div className="mb-10">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
             <Link href="/admin/dashboard" className="hover:text-slate-800 transition-colors">PORTAL</Link> 
             <span className="text-slate-300">&gt;</span> 
             <Link href="/admin/users" className="hover:text-slate-800 transition-colors">STAFF DIRECTORY</Link>
             <span className="text-slate-300">&gt;</span> CREATE
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
             Add a staff member
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Set their role, the location they work from, and a password to get them started.</p>
       </div>

       <form action={action} className="bg-white p-8 sm:p-12 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50 rounded-full blur-3xl -mr-32 -mt-32 z-0 pointer-events-none opacity-50"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
             
             {/* General Info */}
             <div className="space-y-6">
                 <div className="flex items-center gap-2 mb-6">
                    <UserPlus className="w-5 h-5 text-brand-500" />
                    <h3 className="text-slate-900 border-b border-slate-100 pb-2 flex-grow">About them</h3>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">FIRST NAME</label>
                        <input type="text" name="firstName" required disabled={isPending}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-600 transition-all font-medium text-slate-900 placeholder-slate-400"
                            placeholder="e.g. John" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">LAST NAME</label>
                        <input type="text" name="lastName" required disabled={isPending}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-600 transition-all font-medium text-slate-900 placeholder-slate-400"
                            placeholder="e.g. Doe" />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">ROLE</label>
                        <select name="role" required disabled={isPending} className="w-full px-4 py-3 border-r-8 border-transparent bg-slate-50 border-y border-x border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-600 transition-all font-medium text-slate-900 cursor-pointer">
                           <option value="employee">Employee</option>
                           <option value="manager">Manager</option>
                           <option value="admin">Admin</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">DEPARTMENT</label>
                        <input type="text" name="department" disabled={isPending} placeholder="Operations"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-600 transition-all font-medium text-slate-900 placeholder-slate-400" />
                     </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">JOB TITLE</label>
                    <input type="text" name="title" disabled={isPending} placeholder="Funeral Director"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-600 transition-all font-medium text-slate-900 placeholder-slate-400" />
                 </div>

                 <div className="pt-6">
                    <div className="flex items-center gap-2 mb-6">
                        <ShieldCheck className="w-5 h-5 text-status-success" />
                        <h3 className="text-slate-900 border-b border-slate-100 pb-2 flex-grow">Sign-in details</h3>
                    </div>

                     <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">EMAIL ADDRESS</label>
                            <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input type="email" name="email" required disabled={isPending}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-status-success/30 focus:border-status-success/30 transition-all font-medium text-slate-900 placeholder-slate-400"
                                placeholder="staff@caring.com" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">TEMPORARY PASSWORD</label>
                            <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input type="password" name="password" required disabled={isPending}
                                autoComplete="new-password" data-lpignore="true"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-status-success/30 focus:border-status-success/30 transition-all font-medium text-slate-900 placeholder-slate-400"
                                placeholder="••••••••" />
                            </div>
                        </div>
                    </div>
                 </div>
             </div>

             {/* Dynamic Tag Matrix */}
             <div className="space-y-6 lg:border-l border-slate-100 lg:pl-12">
                 <div className="flex items-center gap-2 mb-6">
                    <Tag className="w-5 h-5 text-accent-on-surface" />
                    <h3 className="text-slate-900 border-b border-slate-100 pb-2 flex-grow">Tags</h3>
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed -mt-4 mb-4">
                   Choose the locations and groups this person belongs to. Their forms go to the managers who share a tag with them.
                 </p>

                 {/* Employee Tags */}
                 {tags.employee.length > 0 && (
                     <div className="mb-6">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Employee tags</h4>
                        <div className="grid grid-cols-2 gap-2">
                           {tags.employee.map(t => (
                              <label key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-ui-border hover:bg-brand-100/50 cursor-pointer transition-colors group">
                                 <input type="checkbox" name="tags" value={t.id} className="w-4 h-4 text-accent-on-surface rounded border-slate-300 focus:ring-accent/30 pointer-events-none" />
                                 <span className="text-sm font-bold text-slate-700 group-hover:text-accent-on-surface capitalize leading-none">{t.name}</span>
                              </label>
                           ))}
                        </div>
                     </div>
                 )}

                 {/* Manager Tags */}
                 {tags.manager.length > 0 && (
                     <div className="mb-6">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Manager tags</h4>
                        <div className="grid grid-cols-2 gap-2">
                           {tags.manager.map(t => (
                              <label key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-status-warning/30 hover:bg-status-warning-soft/50 cursor-pointer transition-colors group">
                                 <input type="checkbox" name="tags" value={t.id} className="w-4 h-4 text-status-warning rounded border-slate-300 focus:ring-status-warning/30 pointer-events-none" />
                                 <span className="text-sm font-bold text-slate-700 group-hover:text-status-warning capitalize leading-none">{t.name}</span>
                              </label>
                           ))}
                        </div>
                     </div>
                 )}

                 {/* Additional Tags */}
                 {tags.additional.length > 0 && (
                     <div className="mb-6">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Other groups</h4>
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
            <div className="relative z-10 mt-8 p-4 bg-status-error-soft border border-status-error/30 rounded-xl text-status-error font-semibold text-sm">
               Error: {state.error}
            </div>
          )}

          <div className="relative z-10 mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
               <Link href="/admin/users" className="text-slate-500 font-bold hover:text-slate-800 transition-colors px-4 py-2">
                 Cancel Generation
               </Link>
               
               <button type="submit" disabled={isPending} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-8 py-3.5 rounded-full font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2 group w-full sm:w-auto justify-center">
                 {isPending ? 'Provisioning Profile...' : 'Deploy Secure User'}
                 {!isPending && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
               </button>
          </div>
       </form>
    </div>
  );
}
