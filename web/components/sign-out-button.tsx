"use client";

import { useClerk } from "@clerk/nextjs";

import { LogOutIcon } from "@/components/icons";

export function SignOutButton() {
  const { signOut } = useClerk();
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/sign-in" })}
      className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border py-3.5 text-base font-bold text-danger"
    >
      <LogOutIcon size={20} />
      Sign out
    </button>
  );
}
