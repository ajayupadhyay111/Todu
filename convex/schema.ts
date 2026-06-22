import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Source of truth: context/data-model.md. Keep both in sync.
export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    pushTokens: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  projects: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.string(),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  tasks: defineTable({
    userId: v.string(),
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    notes: v.optional(v.string()),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    status: v.union(v.literal("open"), v.literal("done")),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_project", ["userId", "projectId"])
    .index("by_user_and_due", ["userId", "dueDate"])
    .index("by_user_and_status", ["userId", "status"]),

  reminders: defineTable({
    userId: v.string(),
    taskId: v.id("tasks"),
    remindAt: v.number(),
    sent: v.boolean(),
    notificationId: v.optional(v.string()),
  })
    .index("by_task", ["taskId"])
    .index("by_remindAt", ["remindAt"]),
});
