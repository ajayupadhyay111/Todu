import { currentUser } from "@clerk/nextjs/server";

import { PushToggle } from "@/components/push-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "—";

  return (
    <div className="safe-top mx-auto flex max-w-2xl flex-col gap-3.5 px-4 py-6">
      <h1 className="mb-1 text-[34px] font-extrabold tracking-tight text-text-primary">
        Settings
      </h1>

      <div className="rounded-card border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Signed in as
        </p>
        <p className="mt-1 text-base font-semibold text-text-primary">{email}</p>
      </div>

      <p className="mt-2 text-[13px] font-bold uppercase tracking-wide text-text-secondary">
        Notifications
      </p>
      <PushToggle />

      <p className="mt-2 text-[13px] font-bold uppercase tracking-wide text-text-secondary">
        Appearance
      </p>
      <ThemeToggle />

      <SignOutButton />
    </div>
  );
}
