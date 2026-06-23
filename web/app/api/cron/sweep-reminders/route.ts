import { NextResponse } from "next/server";
import { and, eq, lte } from "drizzle-orm";

import { db } from "@/lib/db";
import { reminders, tasks } from "@/lib/db/schema";
import { sendPushToUser } from "@/lib/push";

export const dynamic = "force-dynamic";

/** Reject requests that don't carry the shared cron secret. */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Vercel Cron hits this every minute. It finds due, unsent reminders, pushes
 * a notification to the owner, and marks them sent. Completed tasks are
 * skipped (the reminder is still marked sent so it won't retry forever).
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const due = await db
    .select({
      reminderId: reminders.id,
      ownerId: reminders.ownerId,
      taskId: reminders.taskId,
      title: tasks.title,
      status: tasks.status,
    })
    .from(reminders)
    .innerJoin(tasks, eq(reminders.taskId, tasks.id))
    .where(and(eq(reminders.sent, false), lte(reminders.remindAt, now)));

  let sent = 0;
  for (const item of due) {
    if (item.status === "open") {
      try {
        await sendPushToUser(item.ownerId, {
          title: "Todu reminder",
          body: item.title,
          url: `/task/${item.taskId}`,
        });
        sent += 1;
      } catch (error) {
        console.error("reminder push failed", item.reminderId, error);
      }
    }
    await db
      .update(reminders)
      .set({ sent: true })
      .where(eq(reminders.id, item.reminderId));
  }

  return NextResponse.json({ processed: due.length, sent });
}
