import { Colors } from '@/constants/colors';
import { useThemeMode } from '@/hooks/use-theme-mode';

/**
 * Resolves the active Todu palette (light/dark) plus shared accent colors.
 * Honors the manual theme toggle (system/light/dark) via ThemeModeProvider.
 * Use this everywhere instead of hardcoding hex values.
 */
export function useTheme() {
  const { scheme } = useThemeMode();
  return {
    mode: scheme,
    ...Colors[scheme],
    primary: Colors.primary,
    success: Colors.success,
    danger: Colors.danger,
    warning: Colors.warning,
    priorityHigh: Colors.priorityHigh,
    priorityMedium: Colors.priorityMedium,
    priorityLow: Colors.priorityLow,
  };
}

export type Theme = ReturnType<typeof useTheme>;
