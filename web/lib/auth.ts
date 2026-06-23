import { auth } from "@clerk/nextjs/server";

/**
 * Resolve the current Clerk user id for server-side data access, or throw.
 * Mirrors the mobile backend's requireUserId helper — every query/mutation
 * scopes rows to this id, which is our ownership boundary.
 */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("UNAUTHENTICATED");
  }
  return userId;
}
