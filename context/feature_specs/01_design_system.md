# Feature Spec 01: Design System & UI Setup

## Goal
Set up core UI foundation for Todu — install NativeWind, configure dark theme tokens, and prepare base components used across all screens.

## Design Decisions
* React Native app — NO shadcn/ui, NO Tailwind CSS web config.
* Use NativeWind v4 for utility styling in React Native.
* All colors defined in constants/colors.ts — never hardcode hex values in components.
* **Light AND dark mode** — both palettes in colors.ts; active theme from system + manual toggle.
* Android-first build for now (iOS later).

## Implementation Details
1. **Prerequisite Check**: Read agents.md and all /context files before starting.
2. **Setup Core Packages**:
   * Install NativeWind v4 + babel plugin
   * Configure metro.config.js and babel.config.js for NativeWind
   * Configure tailwind.config.js pointing to app/ and components/
3. **Icons**:
   * Use @expo/vector-icons (already included in Expo — no extra install)
4. **Utility**:
   * Create lib/utils.ts with cn() helper using clsx + twMerge (NativeWind compatible)
5. **Constants & Theme**:
   * Create constants/colors.ts with light + dark palettes (see below)
   * Create constants/typography.ts with font sizes and weights
   * Create a theme provider + `useTheme()` hook resolving system preference + manual toggle
6. **Base Components** (create in components/ui/):
   * Button.tsx — primary, secondary, ghost variants
   * Badge.tsx — for priority labels (High/Medium/Low)
   * Card.tsx — surface container used in TaskCard and ProjectCard
   * Divider.tsx — horizontal separator

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

## Verification Checklist
- [ ] NativeWind classes apply correctly on Android (primary target)
- [ ] Light and dark themes both render correctly (system + toggle)
- [ ] constants/colors.ts imported cleanly in all base components
- [ ] No hardcoded hex values in any component file
- [ ] Button, Badge, Card, Divider render without errors in both themes
- [ ] progress-tracker.md updated after completion
