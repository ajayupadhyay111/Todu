import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./helpers";

/** All projects for the current user, ordered. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return projects.sort((a, b) => a.order - b.order);
  },
});

/** Projects plus their open/total task counts (for the Projects screen). */
export const listWithCounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return Promise.all(
      projects
        .sort((a, b) => a.order - b.order)
        .map(async (p) => {
          const tasks = await ctx.db
            .query("tasks")
            .withIndex("by_user_and_project", (q) =>
              q.eq("userId", userId).eq("projectId", p._id)
            )
            .collect();
          const done = tasks.filter((t) => t.status === "done").length;
          return { ...p, total: tasks.length, done };
        })
    );
  },
});

export const create = mutation({
  args: { name: v.string(), color: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const name = args.name.trim();
    if (!name) {
      throw new ConvexError({ code: "INVALID", message: "Project name required." });
    }
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return await ctx.db.insert("projects", {
      userId,
      name,
      color: args.color,
      order: existing.length,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Project not found." });
    }
    const patch: Partial<{ name: string; color: string }> = {};
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) {
        throw new ConvexError({ code: "INVALID", message: "Project name required." });
      }
      patch.name = name;
    }
    if (args.color !== undefined) patch.color = args.color;
    await ctx.db.patch(args.projectId, patch);
  },
});

/** Delete a project; its tasks fall back to Inbox (projectId cleared). */
export const remove = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Project not found." });
    }
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_and_project", (q) =>
        q.eq("userId", userId).eq("projectId", args.projectId)
      )
      .collect();
    for (const t of tasks) {
      await ctx.db.patch(t._id, { projectId: undefined });
    }
    await ctx.db.delete(args.projectId);
  },
});
