"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { reminders, tasks } from "@/lib/db/schema";
import type { ReminderDto } from "@/lib/types";

/** Reminders for a task (owned by the current user), soonest first. */
export async function listReminders(taskId: string): Promise<ReminderDto[]> {
  const ownerId = await requireUserId();
  const rows = await db
    .select()
    .from(reminders)
    .where(and(eq(reminders.taskId, taskId), eq(reminders.ownerId, ownerId)))
    .orderBy(asc(reminders.remindAt));
  return rows.map((r) => ({
    id: r.id,
    taskId: r.taskId,
    remindAt: r.remindAt.getTime(),
    sent: r.sent,
  }));
}

/** Schedule a push reminder for a task at a future time. */
export async function createReminder(input: {
  taskId: string;
  remindAt: number;
}) {
  const ownerId = await requireUserId();

  const owned = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.id, input.taskId), eq(tasks.ownerId, ownerId)))
    .limit(1);
  if (!owned[0]) throw new Error("Task not found.");

  await db.insert(reminders).values({
    ownerId,
    taskId: input.taskId,
    remindAt: new Date(input.remindAt),
    sent: false,
  });

  revalidatePath(`/task/${input.taskId}`);
}

export async function cancelReminder(input: {
  reminderId: string;
  taskId: string;
}) {
  const ownerId = await requireUserId();
  await db
    .delete(reminders)
    .where(
      and(eq(reminders.id, input.reminderId), eq(reminders.ownerId, ownerId))
    );

  revalidatePath(`/task/${input.taskId}`);
}
