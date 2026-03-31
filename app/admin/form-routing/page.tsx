"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouting, RoutingConfig } from "@/lib/routing-context";
import { MANAGER_ROLES } from "@/lib/mock-data";
import { ShieldAlert, Route, Save } from "lucide-react";
import { useState, useEffect } from "react";

export default function FormRoutingPage() {
  const { user } = useAuth();
  const { routingConfig, updateRouting, isLoading } = useRouting();

  const [localConfig, setLocalConfig] = useState<RoutingConfig | null>(null);

  useEffect(() => {
    if (!isLoading && !localConfig) {
      setLocalConfig(routingConfig);
    }
  }, [isLoading, routingConfig, localConfig]);

  if (!user || user.role !== "admin") return (
    <div className="flex flex-col items-center justify-center p-20 text-center text-red-500">
      <ShieldAlert className="w-16 h-16 mb-4" />
      <h2 className="text-xl font-bold">Unauthorized Configuration Screen</h2>
    </div>
  );

  if (!localConfig) return <div className="p-8 text-slate-500 font-medium">Loading routing logic...</div>;

  const handleToggle = (formKey: keyof RoutingConfig, role: string) => {
    const activeRoles = localConfig[formKey] as string[];
    let newRoles;
    if (activeRoles.includes(role)) {
      newRoles = activeRoles.filter(r => r !== role);
    } else {
      newRoles = [...activeRoles, role];
    }
    const updated = { ...localConfig, [formKey]: newRoles };
    setLocalConfig(updated);
  };

  const handleSave = () => {
    updateRouting("transfer", localConfig.transfer);
    updateRouting("timesheet", localConfig.timesheet);
    updateRouting("incident", localConfig.incident);
    alert("System logic successfully injected!");
  };

  const renderRoleToggles = (formKey: 'transfer' | 'timesheet' | 'incident') => {
    return MANAGER_ROLES.map(role => (
      <label key={role} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
        <input 
          type="checkbox" 
          checked={(localConfig[formKey] as string[]).includes(role)} 
          onChange={() => handleToggle(formKey, role)}
          className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
        />
        <span className="text-sm font-semibold text-slate-700">{role}</span>
      </label>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-900 tracking-tight flex items-center gap-3">
            <Route className="w-8 h-8 text-brand-700" />
            Form Routing Config
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Set the automated managerial destinations for employee submissions.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-900 text-white font-semibold rounded-lg hover:bg-brand-800 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" /> Save Routing Flow
        </button>
      </div>

      <div className="space-y-6">
        {/* Transfer Records */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800">Transfer Records Workflow</h2>
            <p className="text-sm text-slate-500 mt-1">Select the generic management roles that will receive incoming transfer disposition and pickup logs.</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-l-4 border-brand-500">
            {renderRoleToggles('transfer')}
          </div>
        </div>

        {/* Timesheets Secondary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800">Timesheet Transfer Alerts</h2>
            <p className="text-sm text-slate-500 mt-1">Timesheets automatically bind to the user's selected Location. Select the roles that receive the simulated alert concurrently when <strong>Transfer Time</strong> &gt; 0.</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-l-4 border-amber-500">
            {renderRoleToggles('timesheet')}
          </div>
        </div>

        {/* Incident Reports */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800">Incident Report Escalation</h2>
            <p className="text-sm text-slate-500 mt-1">Incidents inherently route to the selected Location phase. Select the compliance/overhead roles that actively receive the explicit escalated alert alongside them.</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-l-4 border-red-500">
            {renderRoleToggles('incident')}
          </div>
        </div>
      </div>
    </div>
  );
}
