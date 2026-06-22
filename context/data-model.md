# Data Model: Todu

The source of truth for the database. Read this before writing any Convex
query/mutation or touching `convex/schema.ts`. Keep this file and the actual
schema in sync — if they disagree, the schema wins and this file must be updated.

## Ownership & isolation
* Every user-owned row stores `userId` = `ctx.auth.getUserIdentity().subject` (Clerk subject).
* Never trust a client-passed `userId`. Always derive it server-side.
* Every query/mutation filters by `userId` first. Cross-user reads are a bug.
* Schema keeps a nullable `orgId` reserved for future teams (not used in MVP).

## Entities

### users
Profile + device data, synced from Clerk on first sign-in.
| Field | Type | Notes |
|---|---|---|
| `clerkId` | string | Clerk subject; unique; indexed |
| `email` | string | from Clerk |
| `name` | string (optional) | display name |
| `pushTokens` | string[] | Expo push tokens (one per device) |
| `createdAt` | number | epoch ms |

### projects
A bucket for tasks (Client / Office / Learning / Personal, etc.).
| Field | Type | Notes |
|---|---|---|
| `userId` | string | owner; indexed |
| `name` | string | required |
| `color` | string | hex token from `constants/colors.ts` |
| `order` | number | manual sort position |
| `createdAt` | number | epoch ms |

### tasks
The core entity.
| Field | Type | Notes |
|---|---|---|
| `userId` | string | owner; indexed |
| `projectId` | id("projects") (optional) | null = Inbox (no project) |
| `title` | string | required |
| `notes` | string (optional) | task description; can be filled via voice-to-text (Gemini) |
| `priority` | "high" \| "medium" \| "low" | default "medium" |
| `status` | "open" \| "done" | default "open" |
| `dueDate` | number (optional) | epoch ms; null = no date |
| `completedAt` | number (optional) | set when status → done |
| `order` | number | manual sort within a list |
| `createdAt` | number | epoch ms |

### reminders
Scheduled push for a task. Drives Expo Notifications.
| Field | Type | Notes |
|---|---|---|
| `userId` | string | owner; indexed |
| `taskId` | id("tasks") | parent; indexed |
| `remindAt` | number | epoch ms |
| `sent` | boolean | default false |
| `notificationId` | string (optional) | local notification handle |

## Indexes (define in schema.ts)
* `users.by_clerkId` → `["clerkId"]`
* `projects.by_user` → `["userId"]`
* `tasks.by_user` → `["userId"]`
* `tasks.by_user_and_project` → `["userId", "projectId"]`
* `tasks.by_user_and_due` → `["userId", "dueDate"]`  ← powers the Today view
* `tasks.by_user_and_status` → `["userId", "status"]`
* `reminders.by_task` → `["taskId"]`
* `reminders.by_remindAt` → `["remindAt"]`  ← for the reminder sweep

## Derived views (no separate table)
* **Today** = tasks where `status = "open"` AND (`dueDate` ≤ end of today OR overdue). Overdue (`dueDate < startOfToday`) is surfaced first, in red.
* **Inbox** = all open tasks, filterable by project/priority.
* **Project progress** = `done / total` computed from the project's tasks.

## Schema sketch (convex/schema.ts)
```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
```

## Invariants
* Deleting a project must reassign its tasks to Inbox (`projectId = null`) or cascade-delete — decide per UX; never orphan a `projectId`.
* Deleting a task must delete its reminders.
* `completedAt` is set/cleared together with `status`.
* All timestamps are epoch ms (UTC); format for display in the UI layer.
