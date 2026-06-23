# Todu Web

Installable PWA that mirrors the Todu mobile app — built with **Next.js 15
(App Router)**, **Neon Postgres + Drizzle**, **Clerk** auth, **Web Push
(VAPID)**, and **Serwist** for the service worker / offline shell.

It is a standalone web app: it shares the same Clerk identity as the mobile
app, but its task data lives in its own Neon database (the mobile app still
uses Convex). Migrating mobile onto this backend is a future step.

## Stack

| Concern   | Choice                                    |
| --------- | ----------------------------------------- |
| Framework | Next.js 15 App Router, TypeScript         |
| Styling   | Tailwind CSS (tokens mirror the mobile)   |
| Database  | Neon Postgres via Drizzle ORM             |
| Auth      | Clerk (`@clerk/nextjs`)                    |
| Push      | Web Push API (VAPID) + `web-push`         |
| Cron      | Vercel Cron → `/api/cron/sweep-reminders` |
| PWA       | Serwist (`@serwist/next`)                 |

## Setup

1. Install deps:

   ```bash
   npm install
   ```

2. Copy env and fill it in:

   ```bash
   cp .env.example .env.local
   ```

   - `DATABASE_URL` — Neon pooled connection string.
   - Clerk keys — reuse the same Clerk app as mobile.
   - VAPID keys — generate once:

     ```bash
     npx web-push generate-vapid-keys
     ```

     Public → `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, private → `VAPID_PRIVATE_KEY`.
   - `CRON_SECRET` — any random string; Vercel Cron sends it as a Bearer token.

3. Apply the database schema to Neon:

   ```bash
   npm run db:migrate   # applies drizzle/ migrations
   # or, for quick local iteration:
   npm run db:push
   ```

4. Run it:

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` / `build` / `start`
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint`
- `npm run db:generate` — emit SQL from the Drizzle schema
- `npm run db:migrate` / `db:push` / `db:studio`

## How it works

- **Reads** are React Server Components calling `lib/queries.ts` (Drizzle,
  scoped to the Clerk user id).
- **Writes** are server actions in `lib/actions/*` that `revalidatePath` the
  affected routes.
- **Push**: the settings screen subscribes the browser via the service worker
  and stores the subscription (`/api/push/subscribe`). A reminder set on a task
  is swept every minute by Vercel Cron, which sends a Web Push notification.
- **PWA**: `app/manifest.ts` + `app/sw.ts` (Serwist) make the app installable
  with an offline fallback (`/offline`). The SW is disabled in `next dev`.

## Icons

`public/icons/*.png` are generated (solid indigo + white check) by:

```bash
node scripts/generate-icons.mjs
```

Replace them with a designed mark anytime — keep the same filenames/sizes.

## Deploy (Vercel)

Set all `.env.local` values as Vercel project env vars. `vercel.json` already
declares the every-minute cron for reminder delivery.
