# Progress Tracker: Todu

This file updates after every session. Always read this first.

## Current Phase
🚧 Setup & Foundation

## In Progress
* Backend wiring: Convex (schema + functions) + Clerk auth — needs Ajay's accounts/keys

## Completed
* Expo app scaffolded (SDK 54, Expo Router, TypeScript) — Android-first, local dev build
* AGENTS.md + CLAUDE.md recreated; app.json/package.json named "todu"
* constants/colors.ts (light + dark Todu palette) + hooks/use-theme.ts
* Front-end UI shell (runs in Expo Go, sample data):
  - Tabs: Today / Inbox / Projects (starter tabs replaced)
  - Components: PriorityBadge, TaskCard, ProjectCard, EmptyState
  - Today (progress bar, overdue-first), Inbox (priority filter), Projects (counts)
  - Task Detail route (app/task/[id].tsx) with description + complete toggle
  - lib/types.ts + lib/sample-data.ts
* Verified: tsc clean, expo-doctor 18/18, eslint clean
* All context files created + enriched (data-model, theming, security, testing, etc.)

## Coming Next
* QuickAdd bottom sheet (floating + button) — create tasks
* Convex init + schema.ts (tasks, projects, reminders) + queries/mutations
* Clerk auth screens (login + signup) + provider wiring
* Swap sample-data for live Convex queries
* Theme toggle (light/dark/system) + NativeWind reconcile (feature_specs/01)
* Voice-to-text description (Gemini via Convex action) — see feature_specs/02
* Push notifications setup

## Architectural Decisions Log
* Convex chosen over Supabase — real-time out of the box, no REST boilerplate
* Expo Router chosen for file-based navigation (cleaner than React Navigation)
* Light + dark mode (follows system, manual toggle) — decided to support both
* Android-first for now; iOS later
* Voice-to-text via Gemini, called server-side from a Convex action (key never on client)
* Multi-tenant via Clerk userId — orgId support deferred to post-MVP
