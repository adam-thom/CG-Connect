'use server';

import { getSessionUser } from '@/lib/session';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function fetchTagsByCategory() {
  const tags = await prisma.tag.findMany();
  return {
    manager: tags.filter(t => t.type === 'MANAGER'),
    employee: tags.filter(t => t.type === 'EMPLOYEE'),
    additional: tags.filter(t => t.type === 'ADDITIONAL')
  };
}

export async function fetchDetailedUsers() {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return prisma.user.findMany({
    include: { tags: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function fetchFuneralDirectors() {
  return prisma.user.findMany({
    where: {
      tags: {
        some: {
          name: 'Funeral Director'
        }
      }
    },
    select: {
      id: true,
      name: true
    }
  });
}

export async function fetchUserById(id: string) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return prisma.user.findUnique({
    where: { id },
    include: { tags: true }
  });
}

export async function createUserAction(prevState: any, formData: FormData) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { error: 'Unauthorized: Only Administrators can provision user accounts.' };
  }

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = (formData.get('role') as string) || 'employee';
  const department = (formData.get('department') as string) || 'General';
  const title = formData.get('title') as string;
  
  // Extract Tags
  const tagIds = formData.getAll('tags') as string[];

  if (!firstName || !lastName || !email || !password) {
    return { error: 'All primary fields are strictly required (First Name, Last Name, Email, Password).' };
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    return { error: 'That email is already registered.' };
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const fullName = `${firstName.trim()} ${lastName.trim()}`;

  await prisma.user.create({
     data: {
       name: fullName,
       email: email.toLowerCase(),
       passwordHash,
       role: role.toLowerCase(),
       department,
       title: title || (role === 'admin' ? 'Administrator' : role === 'manager' ? 'Location Manager' : 'Staff Member'),
       tags: {
         connect: tagIds.map(id => ({ id }))
       }
     }
  });

  redirect('/admin/users');
}

export async function updateUserAction(prevState: any, formData: FormData) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  const id = formData.get('userId') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;
  const department = formData.get('department') as string;
  const title = formData.get('title') as string;
  const tagIds = formData.getAll('tags') as string[];

  if (!id || !name || !email || !role) {
    return { error: 'Name, Email, and Role are mandatory.' };
  }

  await prisma.user.update({
    where: { id },
    data: {
      name,
      email: email.toLowerCase(),
      role: role.toLowerCase(),
      department,
      title,
      tags: {
        set: tagIds.map(id => ({ id })) // Clears existing and completely overrides to selected!
      }
    }
  });

  redirect('/admin/users');
}

export async function adminPasswordResetAction(prevState: any, formData: FormData) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  const id = formData.get('userId') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!id || !newPassword || newPassword.length < 8) {
    return { error: 'Missing logic payload: Temporary password must securely be 8+ chars.' };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id },
    data: { passwordHash }
  });

  return { success: true, message: 'Password forcibly overridden.' };
}

export async function deleteUserAction(id: string) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  // To prevent orphans or deletion crashing:
  // For production systems, you generally want to "Soft-Delete", or optionally reassign their items.
  // Given we are modifying mock data directly, we will hard delete for clarity!
  try {
     await prisma.user.delete({ where: { id } });
     // Since this is called from a Client list explicitly, returning true re-refreshes hook!
     return { success: true };
  } catch (err) {
     return { success: false, error: "Cannot forcefully delete user. They likely own active relational Forms preventing uninstallation." }
  }
}

export async function updatePasswordAction(prevState: any, formData: FormData) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return { success: false, error: 'Unauthorized: Session missing.' };
  }

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!currentPassword || !newPassword) {
     return { success: false, error: 'Both current and new passwords are required.' };
  }

  if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters long.' };
  }

  const dbUser = await prisma.user.findUnique({
      where: { id: currentUser.id }
  });

  if (!dbUser || !dbUser.passwordHash) {
      return { success: false, error: 'Account compromised or invalid.' };
  }

  const isValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!isValid) {
      return { success: false, error: 'Current password provided is incorrect.' };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
      where: { id: currentUser.id },
      data: { passwordHash }
  });

  return { success: true, message: 'Your personal password was securely updated.' };
}
