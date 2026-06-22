# Code Standards: Todu

## General
* TypeScript strict mode — no `any` allowed.
* Functional components only — no class components.
* Named exports preferred over default exports.

## Naming Conventions
* Components: PascalCase → `TaskCard.tsx`
* Hooks: camelCase with `use` prefix → `useTaskList.ts`
* Convex functions: camelCase → `createTask`, `updateTask`
* Constants: UPPER_SNAKE_CASE → `PRIMARY_COLOR`

## Convex Rules
* Always use `v.id("tableName")` for ID fields.
* Always use `ctx.auth.getUserIdentity()` — never trust client-passed userId.
* Mutations for writes, queries for reads — never mix.
* Validate every arg with `convex/values` (`v.string()`, `v.optional()`, …).
* Use the right index for every filter — no full-table scans (see data-model).

## React Native Rules
* Use Expo Router for all navigation.
* No inline styles — always use StyleSheet.create().
* All touch targets minimum 44x44px for accessibility.
* Android is the current target — test there first; keep code iOS-safe for later.

## Theming
* Support light AND dark — read colors from semantic tokens via the theme hook.
* Never hardcode hex; every color resolves per active theme (system + manual toggle).
* Verify contrast and readability in both themes before shipping a screen.

## Error Handling
* Convex: throw `ConvexError({ code, message })` — never let raw errors reach the client.
* UI: wrap async actions in try/catch; show a friendly toast/inline message, log the rest.
* Never swallow errors silently. No empty `catch {}`.
* Validate user input at the UI boundary AND in the mutation.

## UI States (every screen/list)
* **Loading** — skeletons preferred over spinners (Convex is fast).
* **Empty** — use the `EmptyState` component with a clear next action.
* **Error** — friendly message + retry. Never a blank screen.

## Forms & Validation
* Validate inline; disable submit until valid; show the first error near the field.
* Trim strings; treat empty/whitespace title as invalid.

## Testing
* Unit-test pure logic (date grouping, sorting, derived views) with Jest.
* Component-test critical components with React Native Testing Library.
* Smoke-test core flows (create task → appears in Today → complete) before shipping a feature.
* A bug fix gets a regression test where practical.

## Accessibility
* `accessibilityLabel`/`accessibilityRole` on all interactive elements.
* Min 44x44 touch targets; respect text scaling; meet contrast on the dark theme.

## Performance
* Lists use `FlatList`/`FlashList` with stable `keyExtractor` — never `.map()` long lists.
* Memoize expensive children (`React.memo`) and callbacks (`useCallback`) only where measured.
* Avoid re-renders from broad context; keep Convex queries narrow (use indexes).

## Dependencies
* Keep deps minimal; prefer Expo-maintained / first-party packages.
* Vet any new lib (maintenance, size, native modules) before adding — note the reason in the PR.
* No package that requires ejecting from the Expo managed/dev-build workflow.

## Imports & File Organization
* Absolute imports via path alias (`@/components/...`) — no deep `../../../`.
* One component per file; co-locate its styles and types.
* Order imports: external → internal (`@/…`) → relative.

## Comments & Docs
* Comment the "why", not the "what". Keep comments truthful and current.
* Public hooks/utils get a one-line JSDoc describing inputs/outputs.

## Git & Branching
* Branch names: `feat/…`, `fix/…`, `chore/…`.
* Small, focused commits; no commented-out code or stray `console.log` in commits.
* Commit format (below) is enforced by convention.

## Commit Format
* feat: add task creation screen
* fix: push notification not firing on Android
* chore: update Convex schema

## Banned Patterns
* No AsyncStorage for user data — Convex only.
* No prop drilling beyond 2 levels — use Zustand or React context.
* No hardcoded color values — always use constants/colors.ts.
* No secrets in the client or in git — the Gemini key lives only in Convex (server).
* No calling the Gemini API from the app — always go through the Convex voice action.
* No business logic in components — keep it in hooks/Convex.
