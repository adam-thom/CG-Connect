import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ManagerBudgetCard } from '@/components/ManagerBudgetCard';
import Link from 'next/link';
import { FileText, Clock, ChevronRight, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function AdminCapExDashboard() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  // Fetch managers with their budget field explicitly selected
  const managers = await prisma.user.findMany({
    where: { role: 'manager' },
    select: {
      id: true,
      name: true,
      email: true,
      quarterlyCapExBudget: true,
    }
  });

  // Fetch all approved CapEx requests to calculate spent amounts per manager
  const approvedRequests = await prisma.capExRequest.findMany({
    where: { status: 'Approved' },
    select: { submitterId: true, amount: true },
  });

  // Build a map of submitterId -> total spent
  const spentByManager: Record<string, number> = {};
  for (const req of approvedRequests) {
    spentByManager[req.submitterId] = (spentByManager[req.submitterId] || 0) + req.amount;
  }

  // Global queue — all requests for admin review
  const allRequests = await prisma.capExRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { submitter: true },
  });

  const statusColors: any = {
    'Pending': 'bg-[#E5A877]/10 text-[#c0836b] border-[#E5A877]/20',
    'Approved': 'bg-[#2f9aad]/10 text-[#0d7f94] border-[#2f9aad]/20',
    'Denied': 'bg-red-50 text-red-600 border-red-100',
    'Revision Requested': 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Administrative Assignment Portal</h1>
        <p className="text-slate-500 font-medium text-lg">Centralize capital expenditure allocations securely monitoring departmental budgeting pipelines dynamically.</p>
      </div>

      <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 shadow-inner">
                 <Activity className="w-5 h-5"/>
             </div>
             <h2 className="text-2xl font-bold text-slate-900">Total Infrastructure Allowances</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {managers.map(mgr => {
                  const spent = spentByManager[mgr.id] ?? 0;
                  return <ManagerBudgetCard key={mgr.id} manager={mgr} spent={spent} />;
              })}
              {managers.length === 0 && (
                  <div className="col-span-full bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center text-slate-500 font-medium shadow-sm">
                      No registered managerial departments allocated.
                  </div>
              )}
          </div>
      </div>

      <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 shadow-inner">
                 <FileText className="w-5 h-5"/>
             </div>
             <h2 className="text-2xl font-bold text-slate-900">Global Review Queue</h2>
          </div>
          
          {allRequests.length === 0 ? (
             <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">Queue Exhausted</h3>
                <p className="text-slate-500 font-medium text-lg">No departmental expenditure requests pending oversight review.</p>
             </div>
          ) : (
             <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {allRequests.map((req) => (
                   <Link 
                     href={`/admin/capex/${req.id}`} 
                     key={req.id}
                     className="block p-6 lg:p-8 hover:bg-slate-50 transition-colors group"
                   >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                         <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                               <span className={cn("px-4 py-1.5 rounded-full text-xs font-bold border", statusColors[req.status] || statusColors['Pending'])}>
                                  {req.status}
                               </span>
                               <span className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5 bg-slate-100/50 px-3 py-1 rounded-md">
                                  <Clock className="w-4 h-4" />
                                  {req.createdAt.toLocaleDateString()}
                               </span>
                            </div>
                            <h3 className="font-extrabold text-slate-900 text-xl group-hover:text-[#2f9aad] transition-colors mb-1 tracking-tight">{req.projectName}</h3>
                            <p className="text-sm font-bold text-slate-400">Department: <span className="text-slate-600">{req.submitter.name || req.submitter.email}</span></p>
                         </div>
                         <div className="text-right flex items-center justify-between lg:justify-end gap-8 bg-slate-50/50 lg:bg-transparent p-4 lg:p-0 rounded-2xl lg:rounded-none border border-slate-100 lg:border-none">
                            <div className="min-w-32 text-left lg:text-right">
                               <span className="block text-[10px] font-black tracking-widest text-slate-400 mb-1">TARGET APPRAISAL</span>
                               <span className="font-black text-[#0d7f94] text-xl">${req.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white lg:bg-slate-50 border border-slate-200 lg:border-transparent shadow-sm flex items-center justify-center text-slate-400 group-hover:bg-[#2f9aad] group-hover:border-[#2f9aad] group-hover:text-white transition-all">
                               <ChevronRight className="w-6 h-6 ml-0.5" />
                            </div>
                         </div>
                      </div>
                   </Link>
                ))}
             </div>
          )}
      </div>
    </div>
  );
}
