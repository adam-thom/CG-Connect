"use client";

import { useAuth } from "@/lib/auth-context";
import { fetchDetailedUsers, deleteUserAction } from "@/app/actions/users";
import { Users, Search, Filter, Shield, UserPlus, Trash2, Edit, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function AdminStaffDirectory() {
  const { user } = useAuth();
  const [directory, setDirectory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const loadUsers = () => {
    setIsLoading(true);
    fetchDetailedUsers().then(data => {
      setDirectory(data);
      setIsLoading(false);
    }).catch(() => {
        setIsLoading(false);
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
      if(confirm(`Are you absolutely sure you want to delete ${name}? This action cannot be reversed.`)) {
          const res = await deleteUserAction(id);
          if (res?.error) alert(res.error);
          else loadUsers();
      }
  };

  if (!user || user.role !== 'admin') return null;

  const filteredUsers = directory.filter(u => {
      const matchesFilter = filter === "all" ? true : u.role === filter;
      const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || 
                            u.email.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -mr-20 -mt-20 z-0 pointer-events-none opacity-60"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-100 text-brand-700 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Staff Directory</h1>
          </div>
          <p className="text-slate-500 max-w-xl text-lg">Manage all active Employee and Manager profiles, assigning routing Tags systematically across the enterprise.</p>
        </div>
        <div className="relative z-10">
            <Link href="/admin/users/new" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Add New Staff
            </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="py-2 pl-3 pr-8 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm font-medium cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="employee">Employees</option>
              <option value="manager">Managers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Staff Member</th>
                <th className="px-6 py-4 font-bold">Role & Title</th>
                <th className="px-6 py-4 font-bold">Active Tags</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                    No matching users found in the system.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold shrink-0">
                          {u.name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name || "System User"}</p>
                          <p className="text-sm text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-sm font-bold text-slate-800 capitalize">{u.role}</p>
                       <p className="text-xs text-slate-500 block truncate max-w-[200px]">{u.title || "Unmapped"}</p>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-wrap gap-1">
                          {u.tags.length === 0 ? (
                             <span className="text-xs text-slate-400 italic">No Tags Assigned</span>
                          ) : (
                             u.tags.map((t: any) => (
                               <span key={t.id} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                                  {t.name}
                               </span>
                             ))
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                           <Link href={`/admin/users/${u.id}/edit`} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                               <Edit className="w-4 h-4" />
                           </Link>
                           <button onClick={() => handleDelete(u.id, u.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                               <Trash2 className="w-4 h-4" />
                           </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
