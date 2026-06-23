export const metadata = { title: "Offline — Todu" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background p-6 text-center">
      <h1 className="text-2xl font-extrabold text-text-primary">
        You&apos;re offline
      </h1>
      <p className="text-sm text-text-secondary">
        Reconnect to sync your tasks. Anything you opened recently is still
        cached.
      </p>
    </main>
  );
}
