# Project Overview: Todu

Todu is a fast, minimal task manager built for developers and digital marketers who juggle client tasks, office work, and personal learning daily. Users can capture tasks instantly (by typing or by voice), organize by projects, and get reminded before deadlines.

## Measurable Goals
* Let authenticated users create and manage tasks across multiple projects.
* Let users see a focused "Today" view with only what matters right now.
* Let users add a task description by voice, auto-organized via Gemini.
* Send push reminders so no task is forgotten.

## Core User Flow
1. User signs in via Clerk.
2. User creates a project (Client / Office / Learning / Personal).
3. User adds a task with title, description (typed or by voice), priority, and due date.
4. User checks Today view every morning.
5. Push notification fires before due time.

## Scope Boundary
* **In Scope**: Auth, projects, tasks (title + description), priorities, due dates, Today view, push notifications, light + dark mode, voice-to-text description (Gemini).
* **Out of Scope**: Team collaboration, comments, file attachments, billing, other AI features beyond voice-to-text.

## Success Criteria
* Can a signed in user create a project and add tasks in under 30 seconds?
* Does Today view show only today's and overdue tasks?
* Can a user dictate a description and get clean, organized text back?
* Do push notifications fire on time on Android?

## Target Platforms
* **Android first (current focus)**; iOS later.
* Phone-first; tablet is best-effort. Minimum Android 8+ (revisit per dependencies).

## Non-Functional Requirements
* **Fast**: cold start to interactive < 2s on a mid-range device; task add feels instant (optimistic).
* **Reliable**: works on flaky networks; no data loss on a dropped write.
* **Accessible**: 44px targets, screen-reader labels, readable contrast in both themes.
* **Private/secure**: each user only sees their own data; Gemini key never on the client.

## Constraints & Assumptions
* Single user per account (no teams in MVP — schema reserves `orgId`).
* Light + dark mode, following system preference with a manual toggle.
* Online-first, offline-tolerant — Convex reconciles on reconnect; voice needs connectivity.
* Solo developer (Ajay); favor simple, shippable choices over infra-heavy ones.

## Key Risks
* Android push delivery quirks (OEM battery optimizations) — test on real devices early.
* Time zones / "today" boundary correctness for due-date grouping.
* Gemini cost/quota and latency for voice — rate-limit and degrade to typing.
* Scope creep from "Out of Scope" features — keep MVP tight.
