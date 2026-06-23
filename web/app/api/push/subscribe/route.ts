import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";

interface SubscriptionBody {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
}

/** Persist (or refresh) the caller's push subscription for this device. */
export async function POST(request: Request) {
  const ownerId = await requireUserId();
  const body = (await request.json()) as SubscriptionBody;

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });
  }

  await db
    .insert(pushSubscriptions)
    .values({
      ownerId,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        ownerId,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
      },
    });

  return NextResponse.json({ ok: true });
}
