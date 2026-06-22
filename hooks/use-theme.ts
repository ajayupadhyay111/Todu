import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, type ThemeMode } from '@/constants/colors';

/**
 * Resolves the active Todu palette (light/dark) plus shared accent colors.
 * Use this everywhere instead of hardcoding hex values.
 */
export function useTheme() {
  const scheme: ThemeMode = useColorScheme() === 'dark' ? 'dark' : 'light';
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
