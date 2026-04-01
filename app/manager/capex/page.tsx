import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { CapExProgressBar } from '@/components/CapExProgressBar';
import { CapExForm } from '@/components/CapExForm';
import Link from 'next/link';
import { FileText, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function ManagerCapExDashboard() {
  const session = await getSessionUser();
  if (!session || session.role !== 'manager') {
    redirect('/login');
  }

  // Fetch fresh user record with budget field — getSessionUser only includes `tags`
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      quarterlyCapExBudget: true,
    }
  });

  const budget = user?.quarterlyCapExBudget ?? 0;

  // Approved requests sum
  const approvedRequests = await prisma.capExRequest.findMany({
    where: { submitterId: session.id, status: 'Approved' },
    select: { amount: true },
  });
  const spent = approvedRequests.reduce((sum: number, req: { amount: number }) => sum + req.amount, 0);

  const allRequests = await prisma.capExRequest.findMany({
    where: { submitterId: session.id },
    orderBy: { createdAt: 'desc' },
  });

  const statusColors: any = {
    'Pending': 'bg-[#E5A877]/10 text-[#c0836b] border-[#E5A877]/20',
    'Approved': 'bg-[#2f9aad]/10 text-[#0d7f94] border-[#2f9aad]/20',
    'Denied': 'bg-red-50 text-red-600 border-red-100',
    'Revision Requested': 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Capital Expenditures</h1>
        <p className="text-slate-500 font-medium text-lg">Manage your quarterly assignments and allocate infrastructural spending.</p>
      </div>

      <CapExProgressBar budget={budget} spent={spent} userName={session.name || ''} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
           <CapExForm />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Active Portfolio</h2>
          
          {allRequests.length === 0 ? (
             <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">No CapEx Requests</h3>
                <p className="text-slate-500 font-medium">You have not submitted any capital expenditure requests this quarter.</p>
             </div>
          ) : (
             <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {allRequests.map((req) => (
                   <Link 
                     href={`/manager/capex/${req.id}`} 
                     key={req.id}
                     className="block p-6 hover:bg-slate-50 transition-colors group"
                   >
                      <div className="flex items-center justify-between">
                         <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                               <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", statusColors[req.status] || statusColors['Pending'])}>
                                  {req.status}
                               </span>
                               <span className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {req.createdAt.toLocaleDateString()}
                               </span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#91665b] transition-colors">{req.projectName}</h3>
                            <p className="text-sm font-medium text-slate-500">{req.location}</p>
                         </div>
                         <div className="text-right flex items-center gap-6">
                            <div className="min-w-32 text-right">
                               <span className="block text-xs font-bold tracking-widest text-slate-400 mb-1">AMOUNT</span>
                               <span className="font-black text-slate-700">${req.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#91665b] group-hover:text-white transition-all shadow-sm">
                               <ChevronRight className="w-5 h-5 ml-0.5" />
                            </div>
                         </div>
                      </div>
                   </Link>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
