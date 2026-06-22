# UI Context: Todu

## Design Philosophy
* Clean, minimal, distraction-free.
* **Light AND dark mode** — follow the system theme by default, with a manual toggle.
* Fast interactions — no loading spinners where possible (Convex is real-time).

## Theming
* All colors come from `constants/colors.ts` via **semantic tokens** — never hardcode hex in components.
* Two palettes (light + dark); the active one is resolved from system preference / user toggle.
* Accent colors (primary, priority, status) are shared across both themes.

## Color Tokens (constants/colors.ts)
```ts
export const Colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F4F4F5',
    border: '#E4E4E7',
    textPrimary: '#18181B',
    textSecondary: '#71717A',
  },
  dark: {
    background: '#0F0F0F',
    surface: '#1A1A1A',
    border: '#2A2A2A',
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
  },
  // shared accents (same in both themes)
  primary: '#6366F1',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  priorityHigh: '#EF4444',
  priorityMedium: '#F59E0B',
  priorityLow: '#6B7280',
}
```

## Key Screens
1. **Today** — tasks due today + overdue tasks highlighted in red
2. **Inbox** — all tasks, filterable by project/priority/status
3. **Projects** — project cards with task count and color label
4. **Task Detail** — full edit: title, **description**, priority, due date, project

## Core Components
* `TaskCard` — checkbox, title, priority badge, project label, due date
* `ProjectCard` — color dot, name, task count
* `QuickAdd` — bottom sheet for fast task creation (floating + button): title + description (with mic) + priority + due date + project
* `PriorityBadge` — colored chip (High / Medium / Low)
* `VoiceInputButton` — mic button next to the description field; records → Gemini → organized description text
* `ThemeToggle` — switch between light / dark / system
* `EmptyState` — friendly illustration when no tasks exist

## Task Description + Voice
* Every task has an optional **description** field (below the title).
* A mic button records the user's voice; the audio goes to a Convex action → Gemini, which returns a clean, organized description that fills the field.
* Show states: idle → recording (animated) → transcribing → filled (editable). Always editable after; never auto-save the raw transcript without showing it.

## Screen States (handle all three on every screen)
* **Today** — loading: skeleton rows; empty: "Nothing due today 🎉"; error: retry.
* **Inbox** — empty: "No tasks yet — tap + to add one."
* **Projects** — empty: "Create your first project."
* **Task Detail** — loading skeleton; handle deleted-task → back with toast.

## Interaction & Gestures
* Tap checkbox → toggle complete (optimistic, strike-through + fade).
* Tap a task row → Task Detail.
* Swipe a task → quick actions (complete / delete) — confirm destructive deletes.
* Floating **+** → QuickAdd bottom sheet from anywhere in the tabs.
* Mic button → hold/tap to record description; show clear recording + transcribing feedback.

## Accessibility
* Min 44x44 touch targets; `accessibilityLabel` on icons, mic, and the + button.
* Don't encode meaning in color alone — pair priority/overdue color with text/icon.
* Ensure contrast passes in BOTH light and dark themes.
* Respect Dynamic Type / font scaling.

## Sample Data (use for design mocks & seed/dev data)
Projects: Client Work (indigo, 8), Office (blue, 5), Learning (green, 3), Personal (amber, 4).

Tasks:
* "Send Q2 campaign report to client" — High, Client Work, due 2:00 PM
* "Review PR #142 — auth refactor" — High, Office, **overdue** (red)
* "Reply to Mehwish re: landing page" — Medium, Client Work, 4:30 PM
* "Finish React Native module 4" — Low, Learning, today
* "Book dentist appointment" — Medium, Personal, **overdue** (red)
* "Draft newsletter for Coder Labs" — Medium, Client Work, tomorrow
* "Update portfolio site copy" — Low, Personal, no date
