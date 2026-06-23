"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { InboxIcon } from "@/components/icons";
import { TaskCard } from "@/components/task-card";
import type { Priority, ProjectDto, TaskDto } from "@/lib/types";

type Filter = "all" | Priority;
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

interface InboxListProps {
  tasks: TaskDto[];
  projects: ProjectDto[];
}

export function InboxList({ tasks, projects }: InboxListProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  );

  const visible = useMemo(
    () => tasks.filter((t) => filter === "all" || t.priority === filter),
    [tasks, filter]
  );

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => {
          const active = f.value === filter;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-border text-text-secondary"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<InboxIcon size={40} />}
          title="No tasks yet"
          hint="Tap + to add one."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {visible.map((task) => {
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
