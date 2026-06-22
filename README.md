# Todu

A fast, minimal task manager for developers and digital marketers — capture tasks
(by typing or voice), organize them by project, and get reminded before deadlines.
Android-first, light + dark mode.

## Stack
- **React Native + Expo** (SDK 54, Expo Router) — Android first
- **Convex** — real-time database & backend *(planned)*
- **Clerk** — auth *(planned)*
- **Expo Notifications** — push reminders *(planned)*
- **Google Gemini** — voice-to-text task descriptions, server-side via Convex *(planned)*
- **TypeScript** (strict)

## Status
Front-end shell is running on sample data; backend not yet wired.

**Built**
- Light/dark theming (`constants/colors.ts` + `hooks/use-theme.ts`)
- Tabs: **Today**, **Inbox**, **Projects**
- Components: `TaskCard`, `PriorityBadge`, `ProjectCard`, `EmptyState`
- Today (progress + overdue-first), Inbox (priority filter), Projects (counts)
- Task Detail screen (`app/task/[id].tsx`)

**Next**
- QuickAdd bottom sheet → Convex schema + queries → Clerk auth → live data
- Theme toggle, push notifications, Gemini voice-to-text

## Project structure
```
app/            Expo Router routes (tabs + task/[id])
components/      Reusable UI components
constants/       colors.ts (light+dark), theme.ts
hooks/           use-theme, use-color-scheme
lib/             types.ts, sample-data.ts
context/         Agent/project docs + feature specs (start here)
```

## Getting started
```bash
npm install
npx expo start      # open in Expo Go (v54) — scan the QR
```

> **SDK is pinned to 54** to match the dev's Expo Go (v54). Do not bump the SDK.
> Once native modules (Convex/Clerk/notifications/voice) are added, use a local
> development build: `npx expo run:android` (no EAS).

## Docs
Project context, architecture, data model, and feature specs live in
[`/context`](./context). Read those before contributing.
