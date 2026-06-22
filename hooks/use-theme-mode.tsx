import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme as useSystemScheme } from "react-native";

import type { ThemeMode } from "@/constants/colors";

/** User preference: follow system, or force light/dark. */
export type ThemePref = "system" | "light" | "dark";

const STORAGE_KEY = "todu.themePref";

type ThemeModeContext = {
  /** The resolved palette to render (system pref collapsed to light/dark). */
  scheme: ThemeMode;
  /** The raw user preference. */
  pref: ThemePref;
  setPref: (pref: ThemePref) => void;
};

const Ctx = createContext<ThemeModeContext | null>(null);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const system: ThemeMode = useSystemScheme() === "dark" ? "dark" : "light";
  const [pref, setPrefState] = useState<ThemePref>("system");

  // Load the persisted preference once on mount.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setPrefState(stored);
      }
    });
  }, []);

  const setPref = (next: ThemePref) => {
    setPrefState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const value = useMemo<ThemeModeContext>(
    () => ({ scheme: pref === "system" ? system : pref, pref, setPref }),
    [pref, system]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Active theme preference + setter. Falls back to system outside a provider. */
export function useThemeMode(): ThemeModeContext {
  const ctx = useContext(Ctx);
  const system: ThemeMode = useSystemScheme() === "dark" ? "dark" : "light";
  if (ctx) return ctx;
  return { scheme: system, pref: "system", setPref: () => {} };
}
