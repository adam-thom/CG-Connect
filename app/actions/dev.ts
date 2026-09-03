'use server';

import { getSessionUser, createSession } from '@/lib/session';
import { redirect } from 'next/navigation';

/**
 * Preview the app as another role.
 *
 * This swaps the JWT session ONLY. It deliberately does not write to the User
 * record: this is a preview tool, and persisting the change rewrote real staff
 * roles as a side effect of clicking a toggle (it silently demoted a manager to
 * employee). The account keeps whatever role it was given in the directory; the
 * session is what changes, and signing in again restores the real role.
 */
export async function switchDevRole(newRole: string) {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'Not allowed in production.' };
  }

  const user = await getSessionUser();
  if (!user) return { error: 'No active session found.' };

  await createSession(user.id, user.email, newRole);

  redirect(`/${newRole}/dashboard`);
}
