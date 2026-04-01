import { EmployeeDocuments } from '@/components/EmployeeDocuments';
import { fetchAllDocuments, fetchDocumentCategories } from '@/app/actions/docs';

export const metadata = {
  title: 'Documents | CG Connect (Manager)',
};

export default async function ManagerDocsPage() {
  const documents = await fetchAllDocuments();
  const categories = await fetchDocumentCategories();
  return <EmployeeDocuments documents={documents} categories={categories} />;
}
