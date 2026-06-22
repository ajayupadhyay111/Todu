# System Architecture: Todu

## Tech Stack
* **Frontend**: React Native with Expo (Expo Router for navigation)
* **Backend/DB**: Convex (real-time, serverless, no REST needed)
* **Auth**: Clerk (with Expo SDK)
* **Notifications**: Expo Notifications (push)
* **AI / Voice-to-text**: Google Gemini API (server-side via Convex action)
* **SDK**: Expo SDK 54 (pinned — matches dev's Expo Go v54; do not bump)
* **Build**: local development build installed on a physical phone for live testing — **Android first** (iOS later) — no EAS

## Folder Structure
Expo SDK 54, Expo Router, root-level layout (path alias `@/*` → repo root).
```
todu/
├── app/                    # Expo Router routes
│   ├── (auth)/             # Login, signup screens
│   ├── (tabs)/             # Today / Inbox / Projects
│   └── task/[id].tsx       # Task detail/edit screen
├── components/             # Reusable UI components (+ ui/)
├── constants/              # colors.ts (light+dark), theme.ts
├── hooks/                  # Custom hooks
├── convex/                 # Backend — root-level (required by Convex)
│   ├── schema.ts           # DB schema
│   ├── tasks.ts            # Task queries + mutations
│   ├── projects.ts         # Project queries + mutations
│   ├── reminders.ts        # Reminder logic
│   └── voice.ts            # Gemini voice-to-text action (server-side)
├── assets/                 # Images, icons, splash
├── app.json                # Expo config
└── context/                # Agent context docs
```

## System Boundaries
* Convex handles all data — no REST API, no AsyncStorage for user data.
* Auth is enforced at every Convex mutation via ctx.auth.getUserIdentity().
* Push notification tokens stored in Convex per user.
* **Gemini API is called only from a Convex action — never from the client.** The API key stays server-side.
* Multi-tenant: each user's data isolated by Clerk userId. Schema ready for orgId (future teams).

## Data Flow
User Action → Convex Mutation → Real-time update → UI re-renders automatically

> Data model & schema live in [data-model.md](./data-model.md). Read it before any data work.

## Auth Flow
* Clerk owns identity (email/password + Google). Expo SDK provides the session.
* `<ClerkProvider>` wraps the app; `<ConvexProviderWithClerk>` passes the Clerk token to Convex.
* Expo Router route groups gate access: unauthenticated → `(auth)`, authenticated → `(tabs)`.
* On first sign-in, upsert a `users` row (keyed by `clerkId`) — see data-model.
* Server-side, every function reads `ctx.auth.getUserIdentity()`; no identity → reject.

## Voice-to-Text (Gemini) Architecture
* User records audio in the app (expo-av / expo-audio).
* Audio is sent to a **Convex action** (`convex/voice.ts`), which calls the Gemini API with the secret key, asks it to transcribe AND organize the text into a clean task description, and returns the result.
* The app shows the returned text in the editable description field — user confirms before save.
* **Why server-side**: keeps `GEMINI_API_KEY` out of the client, lets us add rate-limiting and prompt control in one place. See [feature_specs/02_voice_to_task.md](./feature_specs/02_voice_to_task.md).

## Theming
* Light + dark palettes in `constants/colors.ts`; active theme from system preference + manual toggle.
* Components read semantic tokens via a theme hook — never hardcode colors.

## State Management
* **Server state** = Convex. `useQuery` is reactive — no manual refetch, no React Query.
* **Local/UI state** = `useState`/`useReducer`. Cross-screen UI state (filters, theme, sheet open) → Zustand only if it crosses ≥2 levels.
* Do not cache server data in Zustand/AsyncStorage — read it live from Convex.

## Notifications Architecture
* Request permission on first launch after sign-in; store the Expo push token in `users.pushTokens`.
* Reminders are rows in `reminders` (see data-model). A scheduled Convex action sweeps `by_remindAt` for due, unsent reminders and sends the push, then marks `sent`.
* Also schedule a local notification as a fallback when the device is offline.

## Offline & Sync
* Convex queues mutations and reconciles on reconnect; UI updates optimistically where it helps.
* Treat the network as unreliable: never block the UI on a write; show the new state immediately and let Convex confirm.
* Voice-to-text needs connectivity (Gemini) — show a clear offline message; let the user type instead.
* No user data in AsyncStorage — only ephemeral prefs (e.g. theme, last-selected filter).

## Error Handling Strategy
* Convex functions throw `ConvexError` with a stable `code` + human message; the UI maps codes to friendly copy. Never surface raw stack traces.
* Every screen handles three states: loading, empty, error (see ui-context + code-standards).
* Gemini failures (timeout, quota) degrade gracefully → "Couldn't transcribe, type it instead."
* Unexpected errors are logged to the monitoring tool (Sentry) and shown as a generic retry state.

## Environment & Config
* Public config via `EXPO_PUBLIC_*` env vars (Clerk publishable key, Convex URL).
* **Server-only secrets** (set in Convex dashboard, never in the client/git): `CLERK_SECRET`, `GEMINI_API_KEY`.
* `.env.local` is git-ignored; `.env.example` documents required keys.

## Third-Party Services
| Concern | Service |
|---|---|
| Auth | Clerk |
| Database / backend | Convex |
| Push | Expo Notifications |
| Voice-to-text / AI | Google Gemini API (server-side) |
| Error monitoring | Sentry (planned) |

## Security
* Project/task ownership verified on every read and write before returning or mutating data.
* No client-trusted IDs for authorization — always re-check `userId` server-side.
* Validate all mutation args with `convex/values` (`v.*`) — never accept unvalidated input.
* Gemini key never leaves the server; rate-limit the voice action to curb abuse/cost.
