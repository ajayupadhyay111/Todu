"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { MonitorIcon, MoonIcon, SunIcon } from "@/components/icons";

const OPTIONS = [
  { value: "system", label: "System", Icon: MonitorIcon },
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — theme is only known on the client.
  useEffect(() => setMounted(true), []);
  const active = mounted ? theme ?? "system" : "system";

  return (
    <div className="flex gap-2">
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = active === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-3 text-sm font-semibold transition-colors ${
              selected
                ? "bg-primary text-white"
                : "bg-surface text-text-primary"
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
