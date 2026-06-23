import { BottomNav, SideNav } from "@/components/app-nav";
import { QuickAdd } from "@/components/quick-add";
import { listProjects } from "@/lib/queries";

/**
 * App shell shared by every signed-in screen: left rail on desktop, bottom
 * tab bar on mobile, and the global QuickAdd button. Auth is enforced by
 * middleware before this renders.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const projects = await listProjects();

  return (
    <div className="flex min-h-screen bg-background">
      <SideNav />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <BottomNav />
      <QuickAdd projects={projects} />
    </div>
  );
}
