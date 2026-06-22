# Progress Tracker: Todu

This file updates after every session. Always read this first.

## Current Phase
✅ Backend live + wired — tsc + eslint clean. Ready to run on device.

## Setup Done (Ajay)
* Convex deployment: `festive-dolphin-36` (npx convex dev running, functions + cron deployed)
* Clerk app created; publishable key in .env.local; JWT template "convex"; issuer
  `equal-seal-6.clerk.accounts.dev`; CLERK_JWT_ISSUER_DOMAIN set in Convex dashboard
* Convex codegen produced typed api → all type errors resolved

## Next: run it
* `npx expo run:android` (dev build — push + secure-store need native, not Expo Go)
* Smoke test: sign up → create project → QuickAdd task → Today/Inbox → complete → theme toggle

## Completed
* Expo app scaffolded (SDK 54, Expo Router, TypeScript) — Android-first, local dev build
* constants/colors.ts (light + dark) + hooks/use-theme.ts (now honors manual toggle)
* Front-end UI shell + components (PriorityBadge, TaskCard, ProjectCard, EmptyState)
* **Convex backend (convex/):**
  - schema.ts (users, projects, tasks, reminders + all indexes per data-model)
  - auth.config.ts (Clerk JWT), helpers.ts (requireUserId)
  - users.ts (current/upsert/registerPushToken)
  - projects.ts (list/listWithCounts/create/update/remove→tasks fall to Inbox)
  - tasks.ts (list/today/byProject/get/create/update/setStatus/remove→cascades reminders)
  - reminders.ts (create/cancel + internal sweep) + crons.ts (1-min sweep → Expo push)
* **Auth:** ClerkProvider + ConvexProviderWithClerk + SecureStore token cache (lib/token-cache.ts);
  (auth) sign-in + sign-up (email + code verify); route gating in app/_layout.tsx
* **Live data:** all tabs + task detail now read/write Convex (sample-data no longer used)
* **QuickAdd:** floating + button → @gorhom/bottom-sheet (title/priority/project) on all tabs
* **Theme toggle:** Settings tab (system/light/dark, persisted via AsyncStorage) + sign out
* **Push:** usePushNotifications (permission + Expo token → Convex); useBootstrapUser (upsert)
* lib/dates.ts (TZ-correct today boundary + due labels)
* .env.example + .env.local (placeholders)

## Coming Next
* Run the 3 blocked steps above → then verify tsc/eslint clean on a device
* Voice-to-text description (Gemini via Convex action) — see feature_specs/02
* Polish: swipe-to-delete/complete on TaskCard, reminder UI in task detail, seed defaults

## Architectural Decisions Log
* Convex chosen over Supabase — real-time out of the box, no REST boilerplate
* Expo Router chosen for file-based navigation (cleaner than React Navigation)
* Light + dark mode (follows system, manual toggle) — decided to support both
* Android-first for now; iOS later
* Voice-to-text via Gemini, called server-side from a Convex action (key never on client)
* Multi-tenant via Clerk userId — orgId support deferred to post-MVP
