"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  InboxIcon,
  FolderIcon,
  SettingsIcon,
  TodayIcon,
} from "@/components/icons";

const ITEMS = [
  { href: "/today", label: "Today", Icon: TodayIcon },
  { href: "/inbox", label: "Inbox", Icon: InboxIcon },
  { href: "/projects", label: "Projects", Icon: FolderIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
] as const;

function useActive() {
  const pathname = usePathname();
  return (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop: vertical rail on the left. Hidden below md. */
export function SideNav() {
  const isActive = useActive();
  return (
    <nav className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 border-r border-border bg-background p-4 md:flex">
      <span className="mb-6 px-3 text-2xl font-extrabold tracking-tight text-text-primary">
        Todu
      </span>
      {ITEMS.map(({ href, label, Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors ${
              active
                ? "bg-primary text-white"
                : "text-text-secondary hover:bg-surface"
            }`}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Mobile: fixed bottom tab bar. Hidden at md and up. */
export function BottomNav() {
  const isActive = useActive();
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background/95 backdrop-blur md:hidden">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
              active ? "text-primary" : "text-text-secondary"
            }`}
          >
            <Icon size={22} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
