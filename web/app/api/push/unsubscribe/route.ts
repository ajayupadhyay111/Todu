import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";

/** Forget a push subscription by endpoint (scoped to the caller). */
export async function POST(request: Request) {
  const ownerId = await requireUserId();
  const { endpoint } = (await request.json()) as { endpoint?: string };

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint." }, { status: 400 });
  }

  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.endpoint, endpoint),
        eq(pushSubscriptions.ownerId, ownerId)
      )
    );

  return NextResponse.json({ ok: true });
}
