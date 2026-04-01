import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ManagerBudgetCard, LOCATION_CONFIG } from '@/components/ManagerBudgetCard';
import Link from 'next/link';
import { FileText, Clock, ChevronRight, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

// Extract the location key from a tag name e.g. "MB Manager" → "MB"
function getLocationFromTag(tagName: string): string | null {
  const known = Object.keys(LOCATION_CONFIG); // ['MB', 'CSG', 'EVG', 'EDENS']
  for (const loc of known) {
    if (tagName.toUpperCase().startsWith(loc)) return loc;
  }
  return null;
}

export default async function AdminCapExDashboard() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') redirect('/login');

  // Fetch all managers with their tags and location budgets
  const managers = await prisma.user.findMany({
    where: { role: 'manager' },
    select: {
      id: true,
      name: true,
      email: true,
      tags: { select: { name: true } },
      locationBudgets: { select: { location: true, budget: true, lastResetAt: true } },
    },
    orderBy: { name: 'asc' },
  });

  // Fetch all approved requests to build spent-per-manager-per-location map
  const approvedRequests = await prisma.capExRequest.findMany({
    where: { status: 'Approved' },
    select: { submitterId: true, location: true, amount: true, createdAt: true },
  });

  // Map: managerId → location → spent
  type SpentMap = Record<string, Record<string, number>>;
  const spentMap: SpentMap = {};
  for (const req of approvedRequests) {
    if (!spentMap[req.submitterId]) spentMap[req.submitterId] = {};
    const loc = req.location.toUpperCase();
    const manager = managers.find(m => m.id === req.submitterId);
    const resetAt = manager?.locationBudgets.find(b => b.location === loc)?.lastResetAt;

    if (!resetAt || req.createdAt >= resetAt) {
      spentMap[req.submitterId][loc] = (spentMap[req.submitterId][loc] || 0) + req.amount;
    }
  }

  // Build per-manager data packets
  const managerData = managers.map(mgr => {
    const locations = Array.from(
      new Set(
        mgr.tags
          .map(t => getLocationFromTag(t.name))
          .filter((l): l is string => l !== null)
      )
    );

    const locationBudgets = locations.map(loc => ({
      location: loc,
      budget: mgr.locationBudgets.find(b => b.location === loc)?.budget ?? 0,
      spent: spentMap[mgr.id]?.[loc] ?? 0,
    }));

    return { manager: { id: mgr.id, name: mgr.name, email: mgr.email }, locations, locationBudgets };
  });

  // Global request queue
  const allRequests = await prisma.capExRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { submitter: { select: { name: true, email: true } } },
  });

  const statusColors: Record<string, string> = {
    'Pending':           'bg-[#E5A877]/10 text-[#c0836b] border-[#E5A877]/20',
    'Approved':          'bg-[#2f9aad]/10 text-[#0d7f94] border-[#2f9aad]/20',
    'Denied':            'bg-red-50 text-red-600 border-red-100',
    'Revision Requested':'bg-amber-50 text-amber-600 border-amber-100',
  };

  const locationChipColors: Record<string, string> = {
    MB:    'bg-[#2f9aad]/10 text-[#0d7f94]',
    CSG:   'bg-emerald-50 text-emerald-700',
    EVG:   'bg-violet-50 text-violet-700',
    EDENS: 'bg-orange-50 text-orange-700',
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">CapEx Oversight Portal</h1>
        <p className="text-slate-500 font-medium text-lg">
          Set location budgets per manager and monitor real-time expenditure across all departments.
        </p>
      </div>

      {/* Budget Allocation Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 shadow-inner">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Location Budget Allocations</h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Hover a location bar and click the pencil to set a budget. Bars drain as approved requests accumulate.
            </p>
          </div>
        </div>

        {managerData.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center text-slate-500 font-medium shadow-sm">
            No managers found. Assign manager roles in the Staff Directory first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {managerData.map(({ manager, locations, locationBudgets }) => (
              <ManagerBudgetCard
                key={manager.id}
                manager={manager}
                locations={locations}
                locationBudgets={locationBudgets}
              />
            ))}
          </div>
        )}
      </div>

      {/* Global Review Queue */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 shadow-inner">
            <FileText className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Global Review Queue</h2>
        </div>

        {allRequests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">Queue Empty</h3>
            <p className="text-slate-500 font-medium">No expenditure requests submitted yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {allRequests.map((req) => {
              const locKey = req.location.toUpperCase();
              const locChip = locationChipColors[locKey] || 'bg-slate-100 text-slate-600';
              return (
                <Link
                  href={`/admin/capex/${req.id}`}
                  key={req.id}
                  className="block p-6 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={cn('px-3 py-1 rounded-full text-xs font-bold border', statusColors[req.status] || statusColors['Pending'])}>
                          {req.status}
                        </span>
                        <span className={cn('px-2 py-0.5 rounded text-xs font-black', locChip)}>
                          {req.location.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {req.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-[#2f9aad] transition-colors">{req.projectName}</h3>
                      <p className="text-sm text-slate-400 font-bold mt-0.5">
                        By <span className="text-slate-600">{req.submitter.name || req.submitter.email}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 mb-0.5">AMOUNT</p>
                        <p className="font-black text-[#0d7f94] text-xl">${req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-[#2f9aad] group-hover:border-[#2f9aad] group-hover:text-white transition-all shadow-sm">
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
  );
}
