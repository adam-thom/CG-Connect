'use server';

import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';

export async function saveTransferDraft(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return { error: "Authentication required." };

  const dataObj = Object.fromEntries(formData.entries());
  const draftStr = JSON.stringify(dataObj);

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { transferDraft: draftStr },
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getTransferDraft() {
  const user = await getSessionUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { transferDraft: true }
  });

  if (!dbUser?.transferDraft) return null;

  try {
    return JSON.parse(dbUser.transferDraft);
  } catch(e) {
    return null;
  }
}
