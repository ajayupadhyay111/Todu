import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error(
    "Missing EXPO_PUBLIC_CONVEX_URL. Run `npx convex dev` and add it to .env.local."
  );
}

export const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});
