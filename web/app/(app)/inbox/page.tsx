import { InboxList } from "@/components/inbox-list";
import { listProjects, listTasks } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const [tasks, projects] = await Promise.all([listTasks(), listProjects()]);

  return (
    <div className="safe-top mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-[34px] font-extrabold tracking-tight text-text-primary">
        Inbox
      </h1>
      <InboxList tasks={tasks} projects={projects} />
    </div>
  );
}
