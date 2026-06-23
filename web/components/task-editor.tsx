"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  BellIcon,
  CalendarIcon,
  CheckIcon,
  RefreshIcon,
  TrashIcon,
} from "@/components/icons";
import {
  cancelReminder,
  createReminder,
} from "@/lib/actions/reminders";
import { deleteTask, setTaskStatus, updateTask } from "@/lib/actions/tasks";
import { formatDue, toDateTimeLocalValue } from "@/lib/dates";
import type {
  Priority,
  ProjectDto,
  ReminderDto,
  TaskDto,
} from "@/lib/types";

const PRIORITIES: Priority[] = ["high", "medium", "low"];
const PRIORITY_COLOR: Record<Priority, string> = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#6B7280",
};

interface TaskEditorProps {
  task: TaskDto;
  projects: ProjectDto[];
  reminders: ReminderDto[];
}

export function TaskEditor({ task, projects, reminders }: TaskEditorProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes ?? "");
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [projectId, setProjectId] = useState<string | null>(task.projectId);
  const [dueDate, setDueDate] = useState<number | null>(task.dueDate);
  const [reminderAt, setReminderAt] = useState("");

  const done = task.status === "done";
  const due = formatDue(dueDate);

  const save = () => {
    if (!title.trim() || pending) return;
    startTransition(async () => {
      await updateTask({
        taskId: task.id,
        title: title.trim(),
        notes,
        priority,
        projectId,
        dueDate,
      });
      router.push("/inbox");
    });
  };

  const toggleStatus = () =>
    startTransition(async () => {
      await setTaskStatus({ taskId: task.id, status: done ? "open" : "done" });
      router.refresh();
    });

  const remove = () => {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteTask({ taskId: task.id });
      router.push("/inbox");
    });
  };

  const addReminder = () => {
    if (!reminderAt) return;
    const ms = new Date(reminderAt).getTime();
    if (Number.isNaN(ms)) return;
    startTransition(async () => {
      await createReminder({ taskId: task.id, remindAt: ms });
      setReminderAt("");
      router.refresh();
    });
  };

  const removeReminder = (reminderId: string) =>
    startTransition(async () => {
      await cancelReminder({ reminderId, taskId: task.id });
      router.refresh();
    });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-2.5 px-5 py-6 pb-28">
      <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        rows={1}
        className="resize-none bg-transparent text-2xl font-extrabold leading-8 text-text-primary outline-none placeholder:text-text-secondary"
      />

      <p className="mt-2.5 text-[13px] font-bold uppercase tracking-wide text-text-secondary">
        Priority
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {PRIORITIES.map((p) => {
          const active = p === priority;
          const color = PRIORITY_COLOR[p];
          return (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className="rounded-full border px-3 py-1.5 text-[13px] font-semibold capitalize"
              style={{
                borderColor: color,
                color,
                backgroundColor: active ? `${color}22` : "transparent",
              }}
            >
              {p}
            </button>
          );
        })}
      </div>

      <p className="mt-2.5 text-[13px] font-bold uppercase tracking-wide text-text-secondary">
        Project
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setProjectId(null)}
          className={`rounded-full border border-border px-3 py-1.5 text-[13px] font-semibold text-text-secondary ${
            projectId === null ? "bg-surface" : ""
          }`}
        >
          Inbox
        </button>
        {projects.map((p) => {
          const active = p.id === projectId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setProjectId(p.id)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold text-text-primary"
              style={{
                borderColor: p.color,
                backgroundColor: active ? `${p.color}22` : "transparent",
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              {p.name}
            </button>
          );
        })}
      </div>

      <p className="mt-2.5 text-[13px] font-bold uppercase tracking-wide text-text-secondary">
        Due
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[13px] font-semibold"
          style={{ color: due?.overdue ? "#EF4444" : undefined }}
        >
          <CalendarIcon size={15} />
          <span className={due?.overdue ? "text-danger" : "text-text-primary"}>
            {due?.label ?? "No date"}
          </span>
          <input
            type="datetime-local"
            value={dueDate ? toDateTimeLocalValue(dueDate) : ""}
            onChange={(e) =>
              setDueDate(e.target.value ? new Date(e.target.value).getTime() : null)
            }
            className="sr-only"
          />
        </label>
        {dueDate !== null && (
          <button
            type="button"
            onClick={() => setDueDate(null)}
            className="rounded-full border border-border px-3 py-1.5 text-[13px] font-semibold text-text-secondary"
          >
            Clear
          </button>
        )}
      </div>

      <p className="mt-2.5 text-[13px] font-bold uppercase tracking-wide text-text-secondary">
        Description
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add details…"
        className="min-h-[100px] resize-y rounded-xl border border-border bg-surface p-3.5 text-[15px] leading-relaxed text-text-primary outline-none placeholder:text-text-secondary focus:border-primary"
      />

      <p className="mt-2.5 text-[13px] font-bold uppercase tracking-wide text-text-secondary">
        Reminders
      </p>
      <div className="flex flex-col gap-2">
        {reminders.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-2.5"
          >
            <span className="flex items-center gap-2 text-sm text-text-primary">
              <BellIcon size={16} className="text-text-secondary" />
              {new Date(r.remindAt).toLocaleString()}
              {r.sent && (
                <span className="text-xs text-text-secondary">(sent)</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => removeReminder(r.id)}
              className="text-xs font-semibold text-danger"
            >
              Remove
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            type="datetime-local"
            value={reminderAt}
            onChange={(e) => setReminderAt(e.target.value)}
            className="flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={addReminder}
            disabled={!reminderAt || pending}
            className="rounded-xl bg-primary px-4 text-sm font-bold text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleStatus}
        disabled={pending}
        className="mt-3.5 flex items-center justify-center gap-2 rounded-card border border-border py-3.5 text-base font-bold"
        style={{
          backgroundColor: done ? "var(--color-surface)" : "#22C55E",
          color: done ? "var(--color-text-primary)" : "#fff",
        }}
      >
        {done ? <RefreshIcon size={20} /> : <CheckIcon size={20} />}
        {done ? "Reopen task" : "Mark complete"}
      </button>

      <button
        type="button"
        onClick={save}
        disabled={!title.trim() || pending}
        className="rounded-card bg-primary py-3.5 text-base font-bold text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>

      <button
        type="button"
        onClick={remove}
        className="mt-5 flex items-center justify-center gap-1.5 text-[15px] font-semibold text-danger"
      >
        <TrashIcon size={18} />
        Delete task
      </button>
    </div>
  );
}
