import { EmptyState } from "@/components/empty-state";
import { TaskCard } from "@/components/task-card";
import { listProjects, listTodayTasks } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const [tasks, projects] = await Promise.all([
    listTodayTasks(),
    listProjects(),
  ]);
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const total = tasks.length;

  return (
    <div className="safe-top mx-auto max-w-2xl px-4 py-6">
      <header className="mb-4 flex flex-col gap-1.5">
        <span className="text-[13px] font-bold uppercase tracking-wide text-primary">
          {dateLabel}
        </span>
        <h1 className="text-[34px] font-extrabold tracking-tight text-text-primary">
          Today
        </h1>
        <p className="text-[13px] text-text-secondary">
          {total} {total === 1 ? "task" : "tasks"} to do
        </p>
      </header>

      {total === 0 ? (
        <EmptyState title="Nothing due today 🎉" hint="Enjoy the clear runway." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {tasks.map((task) => {
            const project = task.projectId
              ? projectMap.get(task.projectId)
              : undefined;
            return (
              <TaskCard
                key={task.id}
                task={task}
                projectName={project?.name}
                projectColor={project?.color}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
