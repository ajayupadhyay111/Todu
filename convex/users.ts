import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./helpers";

/** The signed-in user's profile row (null until first upsert). */
export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

/** Create or refresh the user's row. Call once after sign-in. */
export const upsert = mutation({
  args: { email: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const clerkId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { email: args.email, name: args.name });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      clerkId,
      email: args.email,
      name: args.name,
      pushTokens: [],
      createdAt: Date.now(),
    });
  },
});

/** Register an Expo push token for the current device (dedup). */
export const registerPushToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const clerkId = await requireUserId(ctx);
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (!user) {
      throw new ConvexError({ code: "NO_USER", message: "Profile not found." });
    }
    if (user.pushTokens.includes(args.token)) return;
    await ctx.db.patch(user._id, { pushTokens: [...user.pushTokens, args.token] });
  },
});
