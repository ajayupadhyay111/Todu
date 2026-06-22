import { ConvexError, v } from "convex/values";
import { internalAction, internalMutation, internalQuery, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireUserId } from "./helpers";

/** Schedule a push reminder for a task. */
export const create = mutation({
  args: { taskId: v.id("tasks"), remindAt: v.number(), notificationId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Task not found." });
    }
    return await ctx.db.insert("reminders", {
      userId,
      taskId: args.taskId,
      remindAt: args.remindAt,
      sent: false,
      notificationId: args.notificationId,
    });
  },
});

export const cancel = mutation({
  args: { reminderId: v.id("reminders") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const reminder = await ctx.db.get(args.reminderId);
    if (!reminder || reminder.userId !== userId) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Reminder not found." });
    }
    await ctx.db.delete(args.reminderId);
  },
});

// ---- Internal sweep (driven by crons.ts) -----------------------------------

export const dueReminders = internalQuery({
  args: { now: v.number() },
  handler: async (ctx, args) => {
    const due = await ctx.db
      .query("reminders")
      .withIndex("by_remindAt", (q) => q.lte("remindAt", args.now))
      .collect();
    return due.filter((r) => !r.sent);
  },
});

export const markSent = internalMutation({
  args: { reminderId: v.id("reminders") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reminderId, { sent: true });
  },
});

export const pushPayloadFor = internalQuery({
  args: { taskId: v.id("tasks"), userId: v.string() },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .unique();
    if (!task || !user) return null;
    return { title: task.title, tokens: user.pushTokens };
  },
});

/** Sweep due reminders and fire Expo push notifications (cron-driven). */
export const sweep = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const due = await ctx.runQuery(internal.reminders.dueReminders, { now });

    for (const reminder of due) {
      const payload = await ctx.runQuery(internal.reminders.pushPayloadFor, {
        taskId: reminder.taskId,
        userId: reminder.userId,
      });
      if (payload && payload.tokens.length > 0) {
        const messages = payload.tokens.map((to: string) => ({
          to,
          sound: "default",
          title: "Task reminder",
          body: payload.title,
          data: { taskId: reminder.taskId },
        }));
        try {
          await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messages),
          });
        } catch (err) {
          console.error("Expo push failed", err);
          continue; // leave unsent; retried next sweep
        }
      }
      await ctx.runMutation(internal.reminders.markSent, { reminderId: reminder._id });
    }
  },
});
