/**
 * Todu color tokens — the source of truth for app colors.
 * Light + dark palettes; accent colors are shared across both themes.
 * Never hardcode hex in components — import from here (see context/ui-context.md).
 */
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
} as const;

export type ThemeMode = 'light' | 'dark';
export type ThemeColors = (typeof Colors)['light'];
