"use client";

import { useActionState, useEffect, useState } from 'react';
import { updateUserAction, adminPasswordResetAction, fetchTagsByCategory, fetchUserById } from '@/app/actions/users';
import { UserCheck, ArrowRight, ShieldAlert, Tag, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditUserPage({ params }: { params: { id: string } }) {
  const [updateState, updateAction, isUpdating] = useActionState(updateUserAction, undefined);
  const [pwState, pwAction, isResetting] = useActionState(adminPasswordResetAction, undefined);

  const [user, setUser] = useState<any>(null);
  const [tags, setTags] = useState<{manager: any[], employee: any[], additional: any[]}>({ manager: [], employee: [], additional: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const resolvedParams = await params;
        if (!resolvedParams?.id) throw new Error("Missing ID parameter");
        
        const [tagsData, userData] = await Promise.all([
          fetchTagsByCategory(),
          fetchUserById(resolvedParams.id)
        ]);
        
        setTags(tagsData);
        setUser(userData);
      } catch (error) {
        console.error("Failed to hydrate user configuration:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [params]);

  if (isLoading) {
    return <div className="p-20 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-brand-500" /></div>;
  }

  if (!user) {
    return <div className="p-20 text-center text-red-500 font-bold">User profile could not be securely located!</div>;
  }

  const assignedTagIds = user.tags?.map((t: any) => t.id) || [];

  return (
    <div className="max-w-5xl mx-auto py-12 animate-in fade-in duration-500 space-y-8">
       <div className="mb-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
             <Link href="/admin/dashboard" className="hover:text-slate-800 transition-colors">PORTAL</Link> 
             <span className="text-slate-300">&gt;</span> 
             <Link href="/admin/users" className="hover:text-slate-800 transition-colors">STAFF DIRECTORY</Link>
             <span className="text-slate-300">&gt;</span> EDIT
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
             Modify Access Config
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Adjust role scope, location tags, and security credentials for an established user.</p>
       </div>

       {/* Primary Edit Profile Form */}
       <form action={updateAction} className="bg-white p-8 sm:p-12 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <input type="hidden" name="userId" value={user.id} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50 rounded-full blur-3xl -mr-32 -mt-32 z-0 pointer-events-none opacity-50"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
             {/* General Info */}
             <div className="space-y-6">
                 <div className="flex items-center gap-2 mb-6">
                    <UserCheck className="w-5 h-5 text-brand-500" />
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex-grow">Profile Basics</h3>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">FULL NAME</label>
                    <input type="text" name="name" required disabled={isUpdating} defaultValue={user.name}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#91665b]/30 focus:border-[#91665b] transition-all font-medium text-slate-900" />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">NETWORK ROLE</label>
                        <select name="role" required disabled={isUpdating} defaultValue={user.role} className="w-full px-4 py-3 border-r-8 border-transparent bg-slate-50 border-y border-x border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#91665b]/30 focus:border-[#91665b] transition-all font-medium text-slate-900 cursor-pointer capitalize">
                           <option value="employee">Employee</option>
                           <option value="manager">Manager</option>
                           <option value="admin">Admin</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">DEPARTMENT</label>
                        <input type="text" name="department" disabled={isUpdating} defaultValue={user.department}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#91665b]/30 focus:border-[#91665b] transition-all font-medium text-slate-900" />
                     </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">JOB TITLE</label>
                    <input type="text" name="title" disabled={isUpdating} defaultValue={user.title}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#91665b]/30 focus:border-[#91665b] transition-all font-medium text-slate-900" />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">EMAIL IDENTIFIER</label>
                    <input type="email" name="email" required disabled={isUpdating} defaultValue={user.email}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#91665b]/30 focus:border-[#91665b] transition-all font-medium text-slate-900" />
                 </div>
             </div>

             {/* Dynamic Tag Matrix */}
             <div className="space-y-6 lg:border-l border-slate-100 lg:pl-12">
                 <div className="flex items-center gap-2 mb-6">
                    <Tag className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex-grow">Routing Tags Matrix</h3>
                 </div>

                 {/* Employee Tags */}
                 {tags.employee.length > 0 && (
                     <div className="mb-6">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Employee Routing</h4>
                        <div className="grid grid-cols-2 gap-2">
                           {tags.employee.map(t => (
                              <label key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-colors group">
                                 <input type="checkbox" name="tags" value={t.id} defaultChecked={assignedTagIds.includes(t.id)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 pointer-events-none" />
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
                                 <input type="checkbox" name="tags" value={t.id} defaultChecked={assignedTagIds.includes(t.id)} className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 pointer-events-none" />
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
                                 <input type="checkbox" name="tags" value={t.id} defaultChecked={assignedTagIds.includes(t.id)} className="w-4 h-4 text-slate-600 rounded border-slate-300 focus:ring-slate-500 pointer-events-none" />
                                 <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 capitalize leading-none">{t.name}</span>
                              </label>
                           ))}
                        </div>
                     </div>
                 )}
             </div>
          </div>

          {updateState?.error && (
            <div className="relative z-10 mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-semibold text-sm">
               Error: {updateState.error}
            </div>
          )}

          <div className="relative z-10 mt-10 pt-8 border-t border-slate-100 flex items-center justify-end gap-4">
               <button type="submit" disabled={isUpdating} className="bg-[#91665b] hover:bg-[#674840] disabled:opacity-50 text-white px-8 py-3.5 rounded-full font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2 group justify-center">
                 {isUpdating ? 'Saving Framework...' : 'Commit Configuration Changes'}
                 {!isUpdating && <Save className="w-5 h-5" />}
               </button>
          </div>
       </form>

       {/* Security Operations Area */}
       <form action={pwAction} className="bg-red-50 border border-red-100 p-8 sm:p-12 rounded-[2rem] shadow-sm relative overflow-hidden">
           <input type="hidden" name="userId" value={user.id} />
           <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between relative z-10">
               <div className="max-w-xl space-y-2">
                   <div className="flex items-center gap-2">
                       <ShieldAlert className="w-6 h-6 text-red-500" />
                       <h3 className="text-xl font-bold text-red-900">Force Password Reset</h3>
                   </div>
                   <p className="text-red-700 text-sm leading-relaxed">As an Administrator, you possess clearance to forcibly override this user's password. This action happens instantaneously and will lock out existing sessions immediately.</p>
               </div>
               
               <div className="w-full sm:w-80 flex flex-col gap-3">
                   <input type="password" name="newPassword" required disabled={isResetting}
                          className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 font-medium text-slate-900 placeholder-slate-400"
                          placeholder="Type new temporary password..." />
                   
                   <button type="submit" disabled={isResetting} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all active:scale-95 w-full">
                       {isResetting ? 'Processing Override...' : 'Confirm Force Override'}
                   </button>
                   
                   {pwState?.error && <p className="text-xs font-bold text-red-600 mt-2 text-center">{pwState.error}</p>}
                   {pwState?.success && <p className="text-xs font-bold text-emerald-600 mt-2 text-center">{pwState.message}</p>}
               </div>
           </div>
       </form>
    </div>
  );
}
