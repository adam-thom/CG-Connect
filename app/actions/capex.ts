'use server';

import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Helper to save uploaded file locally simulating production bucket behavior
async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (err) {}
  
  const path = join(uploadDir, fileName);
  await writeFile(path, buffer);
  
  return `/uploads/${fileName}`;
}

export async function submitCapExRequest(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== 'manager') {
    return { error: 'Unauthorized' };
  }

  const projectName = formData.get('projectName') as string;
  const location = formData.get('location') as string;
  const amountStr = formData.get('amount') as string;
  const amount = parseFloat(amountStr);

  const file1 = formData.get('quote1') as File;
  const file2 = formData.get('quote2') as File;

  if (!projectName || !location || isNaN(amount) || !file1 || !file2) {
    return { error: 'Missing required fields or invalid amount' };
  }

  if (file1.size === 0 || file2.size === 0) {
    return { error: 'Two valid quote documents are required' };
  }

  try {
    const path1 = await saveFile(file1);
    const path2 = await saveFile(file2);

    const quotes = JSON.stringify([
      { name: file1.name, url: path1 },
      { name: file2.name, url: path2 }
    ]);

    const request = await prisma.capExRequest.create({
      data: {
        submitterId: user.id,
        projectName,
        location,
        amount,
        quotes,
        status: 'Pending',
      }
    });

    revalidatePath('/manager/capex');
    return { success: true, id: request.id };
  } catch (error) {
    return { error: 'An unexpected internal error interrupted the submission.' };
  }
}

export async function updateCapExRequest(id: string, formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== 'manager') return { error: 'Unauthorized' };

  const existing = await prisma.capExRequest.findUnique({ where: { id } });
  if (!existing || existing.submitterId !== user.id) return { error: 'Not found or unauthorized' };
  
  if (existing.status !== 'Pending' && existing.status !== 'Revision Requested') {
    return { error: 'Cannot edit an approved or denied request' };
  }

  const projectName = formData.get('projectName') as string;
  const location = formData.get('location') as string;
  const amountStr = formData.get('amount') as string;
  const amount = parseFloat(amountStr);

  const file1 = formData.get('quote1') as File | null;
  const file2 = formData.get('quote2') as File | null;

  let quotesStr = existing.quotes;
  try {
    const oldQuotes = JSON.parse(existing.quotes);
    
    let path1 = oldQuotes[0]?.url || "";
    let name1 = oldQuotes[0]?.name || "";
    if (file1 && file1.size > 0) {
      path1 = await saveFile(file1);
      name1 = file1.name;
    }

    let path2 = oldQuotes[1]?.url || "";
    let name2 = oldQuotes[1]?.name || "";
    if (file2 && file2.size > 0) {
      path2 = await saveFile(file2);
      name2 = file2.name;
    }

    quotesStr = JSON.stringify([
      { name: name1, url: path1 },
      { name: name2, url: path2 }
    ]);
  } catch (e) {
    console.warn("Failed modifying JSON quote string: ", e);
  }

  try {
    await prisma.capExRequest.update({
      where: { id },
      data: {
        projectName,
        location,
        amount,
        quotes: quotesStr,
        status: 'Pending', 
      }
    });

    revalidatePath(`/manager/capex/${id}`);
    revalidatePath('/manager/capex');
    revalidatePath('/admin/capex');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to securely update request context.' };
  }
}

export async function updateCapExStatus(id: string, status: string) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return { error: 'Unauthorized' };

  try {
    await prisma.capExRequest.update({
      where: { id },
      data: { status }
    });

    revalidatePath(`/admin/capex/${id}`);
    revalidatePath('/admin/capex');
    revalidatePath('/manager/capex');
    revalidatePath(`/manager/capex/${id}`);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update administrative status.' };
  }
}

export async function setLocationBudget(managerId: string, location: string, budget: number) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== 'admin') return { error: 'Unauthorized' };

  try {
    await prisma.managerLocationBudget.upsert({
      where: { managerId_location: { managerId, location } },
      update: { budget },
      create: { managerId, location, budget },
    });

    revalidatePath('/admin/capex');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update location budget.' };
  }
}

export async function addCapExComment(id: string, content: string) {
  const user = await getSessionUser();
  if (!user) return { error: 'Unauthorized' };
  
  if (!content || content.trim() === '') return { error: 'Comment cannot be blank.' };

  try {
    await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        capExRequestId: id
      }
    });

    revalidatePath(`/admin/capex/${id}`);
    revalidatePath(`/manager/capex/${id}`);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to append dialogue context.' };
  }
}

export async function resetLocationBudget(managerId: string, location: string) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== 'admin') return { error: 'Unauthorized' };

  try {
    await prisma.managerLocationBudget.update({
      where: { managerId_location: { managerId, location } },
      data: { lastResetAt: new Date() },
    });

    revalidatePath('/admin/capex');
    revalidatePath('/manager/capex');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to reset location budget.' };
  }
}
