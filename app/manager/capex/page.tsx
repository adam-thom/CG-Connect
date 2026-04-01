import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { CapExForm } from '@/components/CapExForm';
import { LOCATION_CONFIG } from '@/components/GlobalBudgetCard';
import Link from 'next/link';
import { FileText, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function getLocationFromTag(tagName: string): string | null {
  const known = Object.keys(LOCATION_CONFIG);
  for (const loc of known) {
    if (tagName.toUpperCase().startsWith(loc)) return loc;
  }
  return null;
}

export default async function ManagerCapExDashboard() {
  const session = await getSessionUser();
  if (!session || session.role !== 'manager') redirect('/login');

  // Fetch manager with tags
  const mgr = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      tags: { select: { name: true } },
    },
  });

  // Derive locations from tags
  const locations = Array.from(
    new Set(
      (mgr?.tags ?? [])
        .map(t => getLocationFromTag(t.name))
        .filter((l): l is string => l !== null)
    )
  );

  // Fetch Global Location Budgets for mgr locations
  const globalBudgets = await prisma.locationBudget.findMany({
    where: { location: { in: locations } }
  });

  // Approved capex requests globally for assigned locations to calculate global spent
  const approvedRequests = await prisma.capExRequest.findMany({
    where: { location: { in: locations }, status: 'Approved' },
    select: { location: true, amount: true, createdAt: true },
  });

  const spentByLocation: Record<string, number> = {};
  for (const req of approvedRequests) {
    const loc = req.location.toUpperCase();
    const resetAt = globalBudgets.find(b => b.location === loc)?.lastResetAt;
    
    if (!resetAt || req.createdAt >= resetAt) {
      spentByLocation[loc] = (spentByLocation[loc] || 0) + req.amount;
    }
  }

  const locationBudgets = locations.map(loc => {
    const dbBudget = globalBudgets.find(b => b.location === loc);
    return {
      location: loc,
      budget: dbBudget?.budget ?? 0,
      spent: spentByLocation[loc] ?? 0,
    };
  });

  const allRequests = await prisma.capExRequest.findMany({
    where: { submitterId: session.id },
    orderBy: { createdAt: 'desc' },
  });

  const statusColors: Record<string, string> = {
    'Pending':            'bg-[#E5A877]/10 text-[#c0836b] border-[#E5A877]/20',
    'Approved':           'bg-[#2f9aad]/10 text-[#0d7f94] border-[#2f9aad]/20',
    'Denied':             'bg-red-50 text-red-600 border-red-100',
    'Revision Requested': 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Capital Expenditures</h1>
        <p className="text-slate-500 font-medium text-lg">
          Submit and track your expenditure requests across your assigned locations.
        </p>
      </div>

      {/* Per-location budget bars */}
      {locations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-5">Your Location Budgets</h2>
          <div className="space-y-5">
            {locationBudgets.map(lb => {
              const cfg = LOCATION_CONFIG[lb.location];
              if (!cfg) return null;
              const pct = lb.budget > 0 ? Math.min((lb.spent / lb.budget) * 100, 100) : 0;
              const remainingPct = 100 - pct;
              return (
                <div key={lb.location}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black tracking-wider px-2.5 py-1 rounded-md ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                    {lb.budget > 0 ? (
                      <span className="text-sm font-bold text-slate-700">
                        ${lb.spent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        <span className="text-slate-400 font-medium"> / ${lb.budget.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">Budget not yet assigned</span>
                    )}
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    {lb.budget > 0 && (
                      <div
                        className={`h-full ${cfg.bar} transition-all duration-700 ease-out rounded-full`}
                        style={{ width: `${remainingPct}%` }}
                      />
                    )}
                  </div>
                  {lb.budget > 0 && (
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{remainingPct.toFixed(0)}% remaining</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <CapExForm locations={locations} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Active Portfolio</h2>

          {allRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">No CapEx Requests</h3>
              <p className="text-slate-500 font-medium">You have not submitted any capital expenditure requests yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {allRequests.map((req) => {
                const locKey = req.location.toUpperCase();
                const cfg = LOCATION_CONFIG[locKey];
                return (
                  <Link
                    href={`/manager/capex/${req.id}`}
                    key={req.id}
                    className="block p-6 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className={cn('px-3 py-1 rounded-full text-xs font-bold border', statusColors[req.status] || statusColors['Pending'])}>
                            {req.status}
                          </span>
                          {cfg && (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${cfg.bg} ${cfg.text}`}>
                              {cfg.label}
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {req.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#91665b] transition-colors">{req.projectName}</h3>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right">
                          <span className="block text-xs font-bold tracking-widest text-slate-400 mb-1">AMOUNT</span>
                          <span className="font-black text-slate-700">${req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#91665b] group-hover:text-white transition-all shadow-sm">
                          <ChevronRight className="w-5 h-5 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
