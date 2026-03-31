'use server';

import { getSessionUser } from '@/lib/session';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

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

  if (!firstName || !lastName || !email || !password) {
    return { error: 'All fields are strictly required (First Name, Last Name, Email, Password).' };
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
       department: 'Unmapped',
       title: role === 'admin' ? 'Administrator' : role === 'manager' ? 'Location Manager' : 'Staff Member',
     }
  });

  redirect('/admin/dashboard');
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

  // Hash new payload definitively!
  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
      where: { id: currentUser.id },
      data: { passwordHash }
  });

  return { success: true, message: 'Your password was securely updated.' };
}
