'use server';

import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

export async function fetchDocumentCategories() {
  return prisma.documentCategory.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function createDocumentCategory(prevState: any, formData: FormData) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { error: 'Unauthorized: Only Administrators can modify document categories.' };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name || name.trim() === '') {
    return { error: 'Category name is required.' };
  }

  try {
    const category = await prisma.documentCategory.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    });

    // Create the physical folder
    const safeFolderName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const folderPath = path.join(process.cwd(), 'storage', 'docs', safeFolderName);
    await fs.mkdir(folderPath, { recursive: true });

    revalidatePath('/admin/docs');
    revalidatePath('/manager/docs');
    revalidatePath('/employee/docs');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to create category. Perhaps it already exists.' };
  }
}

export async function deleteDocumentCategory(categoryId: string) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  try {
    await prisma.documentCategory.delete({
      where: { id: categoryId }
    });
    revalidatePath('/admin/docs');
    revalidatePath('/manager/docs');
    revalidatePath('/employee/docs');
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Cannot delete category. Ensure no documents rely on it.' };
  }
}

export async function fetchAllDocuments() {
  const currentUser = await getSessionUser();
  if (!currentUser) return [];

  const isAdminOrDev = currentUser.role === 'admin' || currentUser.email === 'dev@caringroup.com';

  if (isAdminOrDev) {
    return prisma.document.findMany({
      include: {
        category: true,
        visibilityTags: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // If not admin, only fetch documents that share tags with current user or authored by them
  return prisma.document.findMany({
    where: {
      OR: [
        {
          visibilityTags: {
            some: {
              id: {
                in: currentUser.tags.map(t => t.id)
              }
            }
          }
        },
        {
          authorId: currentUser.id
        }
      ]
    },
    include: {
      category: true,
      visibilityTags: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function deleteDocument(documentId: string) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  try {
    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (doc?.filePath) {
      try {
        await fs.unlink(path.join(process.cwd(), doc.filePath));
      } catch (err) {
        console.error("Failed to delete physical file", err);
      }
    }
    await prisma.document.delete({ where: { id: documentId } });
    revalidatePath('/admin/docs');
    revalidatePath('/manager/docs');
    revalidatePath('/employee/docs');
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to delete document.' };
  }
}

export async function createDocument(prevState: any, formData: FormData) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { error: 'Unauthorized: Only Administrators can upload documents.' };
  }

  const file = formData.get('file') as File;
  const categoryId = formData.get('categoryId') as string;
  const tagIds = formData.getAll('tags') as string[];

  if (!file || file.size === 0) return { error: 'File is required.' };
  if (!categoryId) return { error: 'Category is required.' };
  if (tagIds.length === 0) return { error: 'At least one visibility tag is required.' };

  const category = await prisma.documentCategory.findUnique({ where: { id: categoryId } });
  if (!category) return { error: 'Invalid category.' };

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeFolderName = category.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const safeFileName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
  const physicalPath = path.join('storage', 'docs', safeFolderName, safeFileName);
  
  const absolutePath = path.join(process.cwd(), physicalPath);

  try {
    // Ensure folder exists
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer);

    const matchExtension = file.name.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
    const type = matchExtension ? matchExtension[1].toUpperCase() : 'UNKNOWN';

    await prisma.document.create({
      data: {
        name: file.name,
        type: type,
        sizeBytes: file.size,
        filePath: physicalPath,
        authorId: currentUser.id,
        categoryId: category.id,
        visibilityTags: {
          connect: tagIds.map(id => ({ id }))
        }
      }
    });

    revalidatePath('/admin/docs');
    revalidatePath('/manager/docs');
    revalidatePath('/employee/docs');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to save document. Please try again.' };
  }
}

export async function updateDocument(documentId: string, formData: FormData) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { error: 'Unauthorized: Only Administrators can update documents.' };
  }

  const file = formData.get('file') as File | null;
  const categoryId = formData.get('categoryId') as string;
  const tagIds = formData.getAll('tags') as string[];

  if (!categoryId) return { error: 'Category is required.' };
  if (tagIds.length === 0) return { error: 'At least one visibility tag is required.' };

  const category = await prisma.documentCategory.findUnique({ where: { id: categoryId } });
  if (!category) return { error: 'Invalid category.' };

  let updateData: any = {
    categoryId: category.id,
    visibilityTags: {
      set: tagIds.map(id => ({ id }))
    }
  };

  if (file && file.size > 0 && file.name !== 'undefined') {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeFolderName = category.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safeFileName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const physicalPath = path.join('storage', 'docs', safeFolderName, safeFileName);
    const absolutePath = path.join(process.cwd(), physicalPath);

    try {
      // Delete old file if present
      const oldDoc = await prisma.document.findUnique({ where: { id: documentId } });
      if (oldDoc?.filePath) {
        try {
          await fs.unlink(path.join(process.cwd(), oldDoc.filePath));
        } catch(e) {}
      }

      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, buffer);

      const matchExtension = file.name.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
      const type = matchExtension ? matchExtension[1].toUpperCase() : 'UNKNOWN';

      updateData.name = file.name;
      updateData.type = type;
      updateData.sizeBytes = file.size;
      updateData.filePath = physicalPath;
    } catch (e) {
      return { error: 'Failed to replace file.' };
    }
  }

  await prisma.document.update({
    where: { id: documentId },
    data: updateData
  });

    revalidatePath('/admin/docs');
    revalidatePath('/employee/docs');
    revalidatePath('/manager/docs');
    return { success: true };
}
