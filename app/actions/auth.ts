'use server';

import { createSession, deleteSession } from '@/lib/session';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.passwordHash) {
    return { error: 'Invalid email or password' };
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    return { error: 'Invalid email or password' };
  }

  // Create JWT session cookie 
  await createSession(user.id, user.email, user.role);

  // Redirect to respective dashboard
  if (user.role === 'manager') {
    redirect('/manager/dashboard');
  } else if (user.role === 'admin') {
    redirect('/admin/dashboard');
  } else {
    // defaults to employee
    redirect('/employee/dashboard');
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
