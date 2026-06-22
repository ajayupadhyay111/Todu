import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./helpers";

const priorityValidator = v.union(
  v.literal("high"),
  v.literal("medium"),
  v.literal("low")
);

/** All tasks for the current user (Inbox source; client filters). */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return tasks.sort((a, b) => a.order - b.order || b.createdAt - a.createdAt);
  },
});

/**
 * Today view = open tasks due on or before end of the user's local day
 * (overdue included). `endOfDay` is computed client-side for correct TZ.
 */
export const today = query({
  args: { endOfDay: v.number() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_and_due", (q) =>
        q.eq("userId", userId).lte("dueDate", args.endOfDay)
      )
      .collect();
    return tasks
      .filter((t) => t.status === "open" && t.dueDate !== undefined)
      .sort((a, b) => (a.dueDate ?? 0) - (b.dueDate ?? 0));
  },
});

export const byProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_and_project", (q) =>
        q.eq("userId", userId).eq("projectId", args.projectId)
      )
      .collect();
    return tasks.sort((a, b) => a.order - b.order);
  },
});

export const get = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) return null;
    return task;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    notes: v.optional(v.string()),
    priority: v.optional(priorityValidator),
    projectId: v.optional(v.id("projects")),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const title = args.title.trim();
    if (!title) {
      throw new ConvexError({ code: "INVALID", message: "Task title required." });
    }
    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (!project || project.userId !== userId) {
        throw new ConvexError({ code: "NOT_FOUND", message: "Project not found." });
      }
    }
    const siblings = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return await ctx.db.insert("tasks", {
      userId,
      title,
      notes: args.notes?.trim() || undefined,
      priority: args.priority ?? "medium",
      status: "open",
      projectId: args.projectId,
      dueDate: args.dueDate,
      order: siblings.length,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
    priority: v.optional(priorityValidator),
    projectId: v.optional(v.union(v.id("projects"), v.null())),
    dueDate: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Task not found." });
    }
    const patch: Record<string, unknown> = {};
    if (args.title !== undefined) {
      const title = args.title.trim();
      if (!title) {
        throw new ConvexError({ code: "INVALID", message: "Task title required." });
      }
      patch.title = title;
    }
    if (args.notes !== undefined) patch.notes = args.notes.trim() || undefined;
    if (args.priority !== undefined) patch.priority = args.priority;
    if (args.projectId !== undefined) {
      patch.projectId = args.projectId ?? undefined;
    }
    if (args.dueDate !== undefined) patch.dueDate = args.dueDate ?? undefined;
    await ctx.db.patch(args.taskId, patch);
  },
});

/** Toggle or set completion; keeps completedAt in sync with status. */
export const setStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(v.literal("open"), v.literal("done")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Task not found." });
    }
    await ctx.db.patch(args.taskId, {
      status: args.status,
      completedAt: args.status === "done" ? Date.now() : undefined,
    });
  },
});

/** Delete a task and all of its reminders. */
export const remove = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Task not found." });
    }
    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
    for (const r of reminders) await ctx.db.delete(r._id);
    await ctx.db.delete(args.taskId);
  },
});
