'use server';

import prisma from '@/lib/db';
import { getSessionUser, createSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function switchDevRole(newRole: string) {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'Not allowed in production.' };
  }

  const user = await getSessionUser();
  if (!user) return { error: 'No active session found.' };

  // Hardcode update the role securely bypassing standard validation matrix for active testing
  await prisma.user.update({
    where: { id: user.id },
    data: { role: newRole }
  });

  // Hot-swap the actual JWT Edge session seamlessly preventing middleware isolation parameters.
  await createSession(user.id, user.email, newRole);

  // Re-route the user back into the target hierarchy
  redirect(`/${newRole}/dashboard`);
}
