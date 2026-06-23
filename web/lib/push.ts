import "server-only";

import webpush from "web-push";

import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@todu.app";

let configured = false;

/** Lazily apply VAPID details (keys may be absent at build time). */
function ensureConfigured() {
  if (configured) return;
  if (!publicKey || !privateKey) {
    throw new Error(
      "VAPID keys missing — set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY."
    );
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Send a notification to every subscription owned by a user. Subscriptions
 * that the push service reports as gone (404/410) are pruned automatically.
 */
export async function sendPushToUser(ownerId: string, payload: PushPayload) {
  ensureConfigured();

  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.ownerId, ownerId));

  const body = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.endpoint, sub.endpoint));
        } else {
          console.error("web-push send failed", statusCode, error);
        }
      }
    })
  );
}
