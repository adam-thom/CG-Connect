import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { notFound, redirect } from 'next/navigation';
import { CapExDetail } from '@/components/CapExDetail';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function ManagerCapExDetailView({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || user.role !== 'manager') {
    redirect('/login');
  }

  const { id } = await params;

  const request = await prisma.capExRequest.findUnique({
    where: { id },
    include: {
      submitter: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!request) {
    notFound();
  }

  if (request.submitterId !== user.id) {
    redirect('/manager/capex'); // Secure isolation
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href="/manager/capex" className="text-sm font-bold text-slate-500 hover:text-[#91665b] flex items-center gap-1 transition-colors w-fit">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
      
      <CapExDetail data={request} currentUserRole="manager" />
    </div>
  );
}
