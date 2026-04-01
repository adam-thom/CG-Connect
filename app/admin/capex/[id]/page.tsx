import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { notFound, redirect } from 'next/navigation';
import { CapExDetail } from '@/components/CapExDetail';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function AdminCapExDetailView({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
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

  // Administrators have global oversight so isolation validation is intentionally omitted here natively bridging workflows.

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/capex" className="text-sm font-bold text-slate-500 hover:text-[#0d7f94] flex items-center gap-1 transition-colors w-fit">
          <ChevronLeft className="w-4 h-4" /> Back to Administrative Portal
        </Link>
      </div>
      
      <CapExDetail data={request} currentUserRole="admin" />
    </div>
  );
}
