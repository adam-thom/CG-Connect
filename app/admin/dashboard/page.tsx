"use client";

import { useAuth } from "@/lib/auth-context";
import { Users, AlertTriangle } from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  
  if (!user || user.role !== "admin") return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-brand-900 tracking-tight">Admin Console</h1>
        <p className="text-slate-500 mt-2 text-lg">System-wide configuration and compliance tools.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4 opacity-80" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Notice: Development Mode</h2>
        <p className="text-slate-600 max-w-md">This dashboard is a scaffold for future administrative tool expansions. Navigate to "Assign Roles" in the sidebar to configure required system topologies for Manager / Employee form routing.</p>
      </div>
    </div>
  );
}
