'use server';

import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { promises as fs } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'docs');
const MAX_BYTES = 25 * 1024 * 1024;

/** Extensions we will store, mapped from the browser-reported type. */
const ALLOWED: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'text/plain': '.txt',
  'text/csv': '.csv',
  'image/png': '.png',
  'image/jpeg': '.jpg',
};

const KIND: Record<string, string> = {
  '.pdf': 'pdf',
  '.doc': 'docx',
  '.docx': 'docx',
  '.xls': 'xlsx',
  '.xlsx': 'xlsx',
  '.ppt': 'pptx',
  '.pptx': 'pptx',
  '.txt': 'txt',
  '.csv': 'csv',
  '.png': 'image',
  '.jpg': 'image',
};

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') throw new Error('Unauthorized');
  return user;
}

export type DocFormState = { error?: string; success?: boolean };

export async function uploadDocument(
  _prev: DocFormState,
  formData: FormData
): Promise<DocFormState> {
  try {
    const user = await requireAdmin();

    const file = formData.get('file') as File | null;
    const name = String(formData.get('name') ?? '').trim();
    const category = String(formData.get('category') ?? '').trim() || 'GENERAL';
    const sharedWith = String(formData.get('sharedWith') ?? 'all');

    if (!file || typeof file === 'string' || file.size === 0) {
      return { error: 'Please choose a file to upload.' };
    }

    const ext = ALLOWED[file.type] ?? path.extname(file.name).toLowerCase();
    if (!KIND[ext]) {
      return { error: 'That file type is not one we store. Try a PDF, Word, Excel or image file.' };
    }
    if (file.size > MAX_BYTES) {
      return { error: 'That file is larger than 25 MB.' };
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const stored = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, stored), Buffer.from(await file.arrayBuffer()));

    await prisma.document.create({
      data: {
        name: name || file.name,
        type: KIND[ext],
        category,
        sizeBytes: file.size,
        sharedWith: sharedWith === 'managers' ? 'managers' : 'all',
        fileUrl: `/uploads/docs/${stored}`,
        originalName: file.name,
        authorId: user.id,
      },
    });

    revalidatePath('/admin/docs');
    revalidatePath('/employee/docs');
    revalidatePath('/manager/docs');
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error && e.message === 'Unauthorized'
        ? 'You do not have permission to do that.'
        : 'Something went wrong on our end. Please try again.',
    };
  }
}

/** Documents the signed-in person is allowed to see. */
export async function fetchDocuments() {
  const user = await getSessionUser();
  if (!user) return [];

  const canSeeManagerOnly = user.role === 'manager' || user.role === 'admin';

  return prisma.document.findMany({
    where: canSeeManagerOnly ? {} : { sharedWith: 'all' },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteDocument(id: string) {
  await requireAdmin();

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) throw new Error('We could not find that document.');

  // Remove the stored file too, so deleting from the registry does not leave
  // an orphan on disk that is still reachable by its URL.
  if (doc.fileUrl) {
    const abs = path.join(process.cwd(), 'public', doc.fileUrl.replace(/^\//, ''));
    await fs.unlink(abs).catch(() => {});
  }

  await prisma.document.delete({ where: { id } });

  revalidatePath('/admin/docs');
  revalidatePath('/employee/docs');
  revalidatePath('/manager/docs');
  return { success: true };
}

/** Distinct categories in use, for grouping and for the upload form. */
export async function fetchDocumentCategories() {
  const user = await getSessionUser();
  if (!user) return [];
  const rows = await prisma.document.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });
  return rows.map(r => r.category);
}
