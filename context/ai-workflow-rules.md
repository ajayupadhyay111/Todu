# AI Workflow Rules: Todu

## Session Start (Mandatory)
1. Read ALL files in /context folder first.
2. Check progress-tracker.md for current status and next task.
3. Check convex/schema.ts (and data-model.md) before touching any data logic.

## Environment Setup (first run / fresh clone)
1. Use the repo's Node version; install deps with the project's package manager.
2. Copy `.env.example` → `.env.local`; fill Clerk + Convex public keys (never commit it). Set server secrets (`CLERK_SECRET`, `GEMINI_API_KEY`) in the Convex dashboard, not the client.
3. Start Convex (`npx convex dev`) and the Expo dev build; run on a simulator/device.
4. Confirm sign-in works end-to-end before building features.

## When Adding a Feature
1. Update convex/schema.ts if new table or field needed (sync data-model.md).
2. Write Convex query/mutation first.
3. Build UI component.
4. Connect via custom hook.
5. Handle loading / empty / error states.
6. Update progress-tracker.md when done.

## When Fixing a Bug
1. Identify which layer: UI / hook / Convex.
2. Reproduce first, then fix root cause — not symptoms.
3. Add a regression test where practical.
4. Test on Android (current target) first; keep it iOS-safe for later.

## Rules
* Work on one feature at a time — no combining unrelated work.
* Never hardcode userId — always from ctx.auth.getUserIdentity().
* Never expose raw Convex errors to the user — show friendly messages.
* Keep data-model.md in sync with schema.ts.
* Update progress-tracker.md after every completed task.

## Definition of Done
* Feature works on Android (current target); kept iOS-safe.
* Looks correct in BOTH light and dark themes.
* Loading, empty, and error states handled.
* No `any`, no stray `console.log`, no hardcoded colors/secrets.
* Ownership/auth enforced server-side for any new data access.
* progress-tracker.md updated.

## PR / Commit Checklist
* Small, focused diff; clear title using the commit format.
* Lint/typecheck pass.
* Manually verified the core flow it touches.

## Commit Format
* feat: add task creation screen
* fix: push notification not firing on Android
* chore: update Convex schema
