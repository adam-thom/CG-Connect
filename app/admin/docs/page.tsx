import { AdminDocuments } from '@/components/AdminDocuments';
import { fetchAllDocuments, fetchDocumentCategories } from '@/app/actions/docs';
import prisma from '@/lib/db';

export const metadata = {
  title: 'Document Control | Admin',
};

export default async function AdminDocsPage() {
  const documents = await fetchAllDocuments();
  const categories = await fetchDocumentCategories();
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });

  return <AdminDocuments documents={documents} categories={categories} tags={tags} />;
}
