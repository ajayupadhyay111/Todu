import { ConvexError } from "convex/values";
import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Returns the authenticated Clerk subject (used as `userId` everywhere).
 * Throws a stable ConvexError the UI can map to friendly copy.
 */
export async function requireUserId(
  ctx: QueryCtx | MutationCtx
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Sign in to continue." });
  }
  return identity.subject;
}
