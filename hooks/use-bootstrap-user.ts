import { useUser } from '@clerk/clerk-expo';
import { useMutation } from 'convex/react';
import { useEffect } from 'react';

import { api } from '@/convex/_generated/api';

/**
 * Ensures a `users` row exists for the signed-in Clerk user.
 * Runs once per session after the Clerk user is available.
 */
export function useBootstrapUser() {
  const { user, isLoaded } = useUser();
  const upsert = useMutation(api.users.upsert);

  useEffect(() => {
    if (!isLoaded || !user) return;
    const email = user.primaryEmailAddress?.emailAddress ?? '';
    upsert({ email, name: user.fullName ?? undefined }).catch(() => {});
  }, [isLoaded, user, upsert]);
}
