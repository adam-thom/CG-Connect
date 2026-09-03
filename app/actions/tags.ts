'use server';

import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
// A "use server" module may only export async functions, so the shared
// constants live in lib/forms.ts.
import { TAG_TYPES, ROUTABLE_FORMS } from '@/lib/forms';


async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') throw new Error('Unauthorized');
  return user;
}

function revalidateAdmin() {
  revalidatePath('/admin/assign-roles');
  revalidatePath('/admin/form-routing');
  revalidatePath('/admin/users');
}

export async function fetchTags() {
  await requireAdmin();
  return prisma.tag.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });
}

/** Staff with their tags, for the assignment screen. */
export async function fetchStaffWithTags() {
  await requireAdmin();
  return prisma.user.findMany({
    include: { tags: { select: { id: true, name: true, type: true } } },
    orderBy: { name: 'asc' },
  });
}

export async function createTag(name: string, type: string) {
  try {
    await requireAdmin();
    const clean = name.trim();
    if (!clean) return { success: false, error: 'Please give the tag a name.' };
    if (!(TAG_TYPES as readonly string[]).includes(type)) {
      return { success: false, error: 'Please choose a tag type.' };
    }

    const clash = await prisma.tag.findUnique({ where: { name: clean } });
    if (clash) return { success: false, error: 'A tag with that name already exists.' };

    await prisma.tag.create({ data: { name: clean, type } });
    revalidateAdmin();
    return { success: true };
  } catch {
    return { success: false, error: 'Something went wrong on our end. Please try again.' };
  }
}

export async function deleteTag(id: string) {
  await requireAdmin();
  // Prisma clears the implicit join rows for us; existing submissions keep the
  // approvers they were filed with only where those rows still resolve.
  await prisma.tag.delete({ where: { id } });
  revalidateAdmin();
  return { success: true };
}

/** Replaces a person's whole tag set in one write. */
export async function setUserTags(userId: string, tagIds: string[]) {
  try {
    await requireAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: { tags: { set: tagIds.map(id => ({ id })) } },
    });
    revalidateAdmin();
    return { success: true };
  } catch {
    return { success: false, error: 'That did not save. Please try again.' };
  }
}

/** Current routing rules, keyed by form type. */
export async function fetchFormRouting() {
  await requireAdmin();
  const rows = await prisma.formRouting.findMany({
    include: { tags: { select: { id: true, name: true, type: true } } },
  });

  const byForm: Record<string, string[]> = {};
  for (const f of ROUTABLE_FORMS) byForm[f.key] = [];
  for (const row of rows) byForm[row.formType] = row.tags.map(t => t.id);
  return byForm;
}

export async function setFormRouting(formType: string, tagIds: string[]) {
  try {
    await requireAdmin();
    if (!ROUTABLE_FORMS.some(f => f.key === formType)) {
      return { success: false, error: 'That is not a form we can route.' };
    }

    await prisma.formRouting.upsert({
      where: { formType },
      create: { formType, tags: { connect: tagIds.map(id => ({ id })) } },
      update: { tags: { set: tagIds.map(id => ({ id })) } },
    });

    revalidateAdmin();
    return { success: true };
  } catch {
    return { success: false, error: 'That did not save. Please try again.' };
  }
}

/**
 * The tag ids a newly created submission of this type should be assigned to.
 * Read at submission time and copied onto the record, so later rule changes do
 * not rewrite who an already-filed record went to.
 */
export async function routingTagIdsFor(formType: string): Promise<string[]> {
  try {
    const row = await prisma.formRouting.findUnique({
      where: { formType },
      include: { tags: { select: { id: true } } },
    });
    return row?.tags.map(t => t.id) ?? [];
  } catch {
    return [];
  }
}
