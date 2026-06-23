"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, tasks } from "@/lib/db/schema";
import type { Priority, TaskStatusValue } from "@/lib/types";

/** Re-render every list that can show a task. */
function revalidateTaskViews() {
  revalidatePath("/today");
  revalidatePath("/inbox");
  revalidatePath("/projects");
}

async function assertProjectOwned(ownerId: string, projectId: string) {
  const rows = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, ownerId)))
    .limit(1);
  if (!rows[0]) throw new Error("Project not found.");
}

export async function createTask(input: {
  title: string;
  notes?: string;
  priority?: Priority;
  projectId?: string | null;
  dueDate?: number | null;
}) {
  const ownerId = await requireUserId();
  const title = input.title.trim();
  if (!title) throw new Error("Task title required.");
  if (input.projectId) await assertProjectOwned(ownerId, input.projectId);

  const existing = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(eq(tasks.ownerId, ownerId));

  await db.insert(tasks).values({
    ownerId,
    title,
    notes: input.notes?.trim() || null,
    priority: input.priority ?? "medium",
    status: "open",
    projectId: input.projectId ?? null,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    sortOrder: existing.length,
  });

  revalidateTaskViews();
}

export async function updateTask(input: {
  taskId: string;
  title?: string;
  notes?: string | null;
  priority?: Priority;
  projectId?: string | null;
  dueDate?: number | null;
}) {
  const ownerId = await requireUserId();
  if (input.projectId) await assertProjectOwned(ownerId, input.projectId);

  const patch: Partial<typeof tasks.$inferInsert> = {};
  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) throw new Error("Task title required.");
    patch.title = title;
  }
  if (input.notes !== undefined) patch.notes = input.notes?.trim() || null;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.projectId !== undefined) patch.projectId = input.projectId ?? null;
  if (input.dueDate !== undefined) {
    patch.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  }

  await db
    .update(tasks)
    .set(patch)
    .where(and(eq(tasks.id, input.taskId), eq(tasks.ownerId, ownerId)));

  revalidateTaskViews();
  revalidatePath(`/task/${input.taskId}`);
}

/** Set completion; keeps completedAt in sync with status. */
export async function setTaskStatus(input: {
  taskId: string;
  status: TaskStatusValue;
}) {
  const ownerId = await requireUserId();
  await db
    .update(tasks)
    .set({
      status: input.status,
      completedAt: input.status === "done" ? new Date() : null,
    })
    .where(and(eq(tasks.id, input.taskId), eq(tasks.ownerId, ownerId)));

  revalidateTaskViews();
}

/** Delete a task (its reminders cascade via the FK). */
export async function deleteTask(input: { taskId: string }) {
  const ownerId = await requireUserId();
  await db
    .delete(tasks)
    .where(and(eq(tasks.id, input.taskId), eq(tasks.ownerId, ownerId)));

  revalidateTaskViews();
}
