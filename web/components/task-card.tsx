"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { CheckCircleIcon, CircleIcon } from "@/components/icons";
import { PriorityBadge } from "@/components/priority-badge";
import { setTaskStatus } from "@/lib/actions/tasks";
import { formatDue } from "@/lib/dates";
import type { TaskDto } from "@/lib/types";

interface TaskCardProps {
  task: TaskDto;
  projectName?: string;
  projectColor?: string;
}

export function TaskCard({ task, projectName, projectColor }: TaskCardProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  // Optimistic completion so the checkbox feels instant.
  const [done, setDone] = useState(task.status === "done");

  const due = formatDue(task.dueDate);

  const toggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    const next = !done;
    setDone(next);
    startTransition(() =>
      setTaskStatus({ taskId: task.id, status: next ? "done" : "open" })
    );
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/task/${task.id}`)}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/task/${task.id}`)}
      className="flex cursor-pointer gap-3 rounded-card border border-border bg-surface p-3.5 transition-colors hover:border-text-secondary/40"
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={done ? "Mark incomplete" : "Mark complete"}
        className="mt-0.5 shrink-0"
      >
        {done ? (
          <CheckCircleIcon size={24} className="text-success" />
        ) : (
          <CircleIcon size={24} className="text-text-secondary" />
        )}
      </button>

      <div className="flex flex-1 flex-col gap-2">
        <p
          className={`line-clamp-2 text-[15px] font-semibold leading-5 ${
            done ? "text-text-secondary line-through" : "text-text-primary"
          }`}
        >
          {task.title}
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <PriorityBadge priority={task.priority} />
          {projectName && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: projectColor ?? "#71717a" }}
              />
              {projectName}
            </span>
          )}
          {due && (
            <span
              className={`text-xs font-semibold ${
                due.overdue ? "text-danger" : "text-text-secondary"
              }`}
            >
              {due.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
