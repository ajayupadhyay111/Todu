# Agent Context Entrypoint: Todu

You are Claude Code (Opus). Your training data may be outdated — always use Context7 MCP to fetch live docs before writing code for Convex, Clerk, or Expo.

## Session Start — Mandatory Steps
1. Read all 7 files inside /context folder in order:
   project-overview → architecture → data-model → code-standards → ai-workflow-rules → ui-context → progress-tracker
2. Read progress-tracker.md to know current status.
3. Check data-model.md + convex/schema.ts before any data work.
4. Only then start implementing.

## Stack Quick Reference
* React Native + Expo (Expo Router) — **Android first**
* Convex (DB + backend)
* Clerk (auth)
* Expo Notifications (push)
* Google Gemini API (voice-to-text, server-side via Convex action)
* Light + dark mode (system + manual toggle)
* **Expo SDK 54** (pinned — dev's Expo Go is v54; do NOT bump the SDK)
* Local development build installed on a physical phone for live testing — no EAS

## Feature Specs
Detailed, step-by-step plans live in `/context/feature_specs/` (01 design system, 02 voice-to-task, …). Read the relevant spec before building that feature.

## Dev (Ajay) Working Style
* Single-shot execution preferred — complete the full feature in one pass.
* No asking for approvals mid-task — make decisions and ship.
* Update progress-tracker.md at end of every session.

## Session Start Prompt Template
"Read all files in /context folder first, then check progress-tracker.md. Today's task: [TASK]"
