import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { ChevronRightIcon } from "@/components/icons";
import { TaskEditor } from "@/components/task-editor";
import { listReminders } from "@/lib/actions/reminders";
import { getTask, listProjects } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await getTask(id);

  if (!task) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-6">
        <EmptyState title="Task not found" hint="It may have been deleted." />
      </div>
    );
  }

  const [projects, reminders] = await Promise.all([
    listProjects(),
    listReminders(id),
  ]);

  return (
    <div className="safe-top">
      <div className="mx-auto max-w-2xl px-5 pt-5">
        <Link
          href="/inbox"
          className="inline-flex items-center gap-1 text-sm font-semibold text-text-secondary"
        >
          <ChevronRightIcon size={16} className="rotate-180" />
          Back
        </Link>
      </div>
      <TaskEditor task={task} projects={projects} reminders={reminders} />
    </div>
  );
}
