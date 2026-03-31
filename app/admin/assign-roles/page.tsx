"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_USERS, MANAGER_ROLES, EMPLOYEE_ROLES, User } from "@/lib/mock-data";
import { useState } from "react";
import { ShieldAlert, Users } from "lucide-react";

export default function AssignRolesPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  
  if (!user || user.role !== "admin") return (
    <div className="flex flex-col items-center justify-center p-20 text-center text-red-500">
      <ShieldAlert className="w-16 h-16 mb-4" />
      <h2 className="text-xl font-bold">Unauthorized Screen</h2>
    </div>
  );

  const toggleRole = (userId: string, roleToToggle: string) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        if (u.assignedRoles.includes(roleToToggle)) {
          return { ...u, assignedRoles: u.assignedRoles.filter(r => r !== roleToToggle) };
        } else {
          return { ...u, assignedRoles: [...u.assignedRoles, roleToToggle] };
        }
      }
      return u;
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-900 tracking-tight flex items-center gap-3">
          <Users className="w-8 h-8 text-brand-700" />
          Assign Roles
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Manage employee and manager role topologies system-wide for form routing constraints.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <ul className="divide-y divide-slate-100">
            {users.map(u => (
              <li key={u.id} className="py-8 flex flex-col md:flex-row gap-8 items-start">
                <div className="w-64 shrink-0">
                  <p className="font-bold text-slate-900 text-lg">{u.name}</p>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">{u.department} &bull; {u.role}</p>
                </div>
                
                <div className="flex-1 w-full space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Currently Assigned System Roles</label>
                    <div className="flex flex-wrap gap-2 min-h-8">
                        {u.assignedRoles.map(r => (
                          <span key={r} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-brand-100 text-brand-800 border border-brand-200">
                            {r}
                            <button onClick={() => toggleRole(u.id, r)} className="hover:text-brand-900 focus:outline-none">&times;</button>
                          </span>
                        ))}
                        {u.assignedRoles.length === 0 && <span className="text-sm text-slate-400 italic">No specific system roles assigned.</span>}
                    </div>
                  </div>
                  
                  {u.role !== 'admin' && (
                    <div className="pt-4 border-t border-slate-50">
                        <label className="block text-xs font-semibold text-slate-600 mb-2">+ Add {u.role === 'manager' ? 'Manager Roles' : 'Employee Roles'}</label>
                        <select 
                            onChange={(e) => {
                                if (e.target.value) toggleRole(u.id, e.target.value);
                                e.target.value = "";
                            }}
                            className="w-full sm:w-80 border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none cursor-pointer"
                            defaultValue=""
                        >
                            <option value="">-- Select from predefined configurations --</option>
                            {(u.role === 'manager' ? MANAGER_ROLES : EMPLOYEE_ROLES).filter(r => !u.assignedRoles.includes(r)).map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
