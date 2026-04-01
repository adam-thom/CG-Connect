'use client';

import React, { useState, useTransition } from 'react';
import { setLocationBudget, resetLocationBudget } from '@/app/actions/capex';
import { Edit3, Check, Loader2, X, DollarSign, RefreshCcw } from 'lucide-react';

// Per-location color palette
export const LOCATION_CONFIG: Record<string, { label: string; bar: string; bg: string; text: string; ring: string }> = {
  MB:    { label: 'MB',    bar: 'bg-[#2f9aad]', bg: 'bg-[#2f9aad]/10', text: 'text-[#0d7f94]', ring: 'focus:ring-[#2f9aad]' },
  CSG:   { label: 'CSG',  bar: 'bg-emerald-500', bg: 'bg-emerald-50',   text: 'text-emerald-700', ring: 'focus:ring-emerald-400' },
  EVG:   { label: 'EVG',  bar: 'bg-violet-500',  bg: 'bg-violet-50',    text: 'text-violet-700',  ring: 'focus:ring-violet-400' },
  EDENS: { label: 'EDENS',bar: 'bg-orange-500',  bg: 'bg-orange-50',    text: 'text-orange-700',  ring: 'focus:ring-orange-400' },
};

interface LocationBudget {
  location: string;
  budget: number;
  spent: number;
}

interface Props {
  manager: { id: string; name: string | null; email: string };
  locations: string[];           // from the manager's tags e.g. ['MB', 'CSG']
  locationBudgets: LocationBudget[];
}

function LocationBar({ managerId, lb }: { managerId: string; lb: LocationBudget }) {
  const cfg = LOCATION_CONFIG[lb.location] || LOCATION_CONFIG['MB'];
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(lb.budget.toString());
  const [isPending, startTransition] = useTransition();

  const pct = lb.budget > 0 ? Math.min((lb.spent / lb.budget) * 100, 100) : 0;
  // Bar shows remaining (empties as money is spent)
  const remainingPct = 100 - pct;

  const handleSave = () => {
    const val = parseFloat(input);
    if (isNaN(val) || val < 0) return;
    startTransition(async () => {
      await setLocationBudget(managerId, lb.location, val);
      setEditing(false);
    });
  };

  const handleReset = () => {
    if (!confirm('Are you sure you want to reset this budget? This will refill the bar to maximum and ignore past approved requests.')) return;
    startTransition(async () => {
      await resetLocationBudget(managerId, lb.location);
    });
  };

  return (
    <div className="group/bar">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black tracking-wider px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            ${lb.spent.toLocaleString(undefined, { maximumFractionDigits: 0 })} spent
          </span>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-1">
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                <input
                  type="number"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isPending}
                  autoFocus
                  className={`w-24 pl-5 pr-2 py-1 text-xs font-bold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 ${cfg.ring}`}
                />
              </div>
              <button onClick={handleSave} disabled={isPending} className="w-6 h-6 flex items-center justify-center bg-slate-800 text-white rounded-md hover:bg-slate-700 disabled:opacity-50">
                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              </button>
              <button onClick={() => { setEditing(false); setInput(lb.budget.toString()); }} disabled={isPending} className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                {lb.budget > 0
                  ? `$${lb.budget.toLocaleString(undefined, { maximumFractionDigits: 0 })} budget`
                  : 'Not set'}
              </span>
              <button
                onClick={() => setEditing(true)}
                className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-slate-600 transition-colors hidden group-hover/bar:flex"
                title="Set budget"
              >
                <Edit3 className="w-3 h-3" />
              </button>
              <button
                onClick={handleReset}
                className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors hidden group-hover/bar:flex"
                title="Reset budget"
              >
                <RefreshCcw className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar: empties as budget is consumed */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
        {lb.budget > 0 ? (
          <div
            className={`h-full ${cfg.bar} transition-all duration-700 ease-out rounded-full`}
            style={{ width: `${remainingPct}%` }}
          />
        ) : (
          <div className="h-full w-full bg-slate-200 rounded-full opacity-50" />
        )}
      </div>

      {lb.budget > 0 && (
        <div className="flex justify-between mt-1">
          <span className="text-[10px] font-bold text-slate-400">{remainingPct.toFixed(0)}% remaining</span>
          <span className="text-[10px] font-bold text-slate-400">{pct.toFixed(0)}% used</span>
        </div>
      )}
    </div>
  );
}

export function ManagerBudgetCard({ manager, locations, locationBudgets }: Props) {
  const displayName = manager.name || manager.email;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      {/* Manager header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-full bg-[#91665b]/10 flex items-center justify-center text-[#91665b] font-black text-sm shrink-0 ring-2 ring-[#91665b]/20">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm leading-tight">{displayName}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {locations.map(loc => {
              const cfg = LOCATION_CONFIG[loc];
              if (!cfg) return null;
              return (
                <span key={loc} className={`text-[10px] font-black px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text}`}>
                  {cfg.label}
                </span>
              );
            })}
          </div>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[10px] font-bold tracking-widest text-slate-400">TOTAL BUDGET</p>
          <p className="text-sm font-black text-slate-700">
            ${locationBudgets.reduce((s, b) => s + b.budget, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Per-location bars */}
      <div className="space-y-4">
        {locations.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium text-center py-2">No locations assigned via tags</p>
        ) : (
          locations.map(loc => {
            const lb = locationBudgets.find(b => b.location === loc) || { location: loc, budget: 0, spent: 0 };
            return <LocationBar key={loc} managerId={manager.id} lb={lb} />;
          })
        )}
      </div>
    </div>
  );
}
