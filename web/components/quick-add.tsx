"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { PlusIcon } from "@/components/icons";
import { createTask } from "@/lib/actions/tasks";
import type { Priority, ProjectDto } from "@/lib/types";

const PRIORITIES: Priority[] = ["high", "medium", "low"];
const PRIORITY_COLOR: Record<Priority, string> = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#6B7280",
};

/** Floating + button that opens a sheet/modal to create a task fast. */
export function QuickAdd({ projects }: { projects: ProjectDto[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const reset = () => {
    setTitle("");
    setPriority("medium");
    setProjectId(null);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || pending) return;
    startTransition(async () => {
      await createTask({ title: title.trim(), priority, projectId });
      reset();
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Add task"
        className="safe-bottom fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-black/20 md:bottom-8 md:right-8"
      >
        <PlusIcon size={28} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <form
            onSubmit={submit}
            className="safe-bottom relative w-full max-w-md rounded-t-sheet border border-border bg-background p-6 sm:rounded-sheet"
          >
            <h2 className="text-xl font-extrabold text-text-primary">New task</h2>

            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing?"
              className="mt-4 h-[52px] w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-base text-text-primary outline-none placeholder:text-text-secondary focus:border-primary"
            />

            <p className="mt-4 text-[13px] font-bold uppercase tracking-wide text-text-secondary">
              Priority
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
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

            <p className="mt-4 text-[13px] font-bold uppercase tracking-wide text-text-secondary">
              Project
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
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

            <button
              type="submit"
              disabled={!title.trim() || pending}
              className="mt-6 h-[52px] w-full rounded-xl bg-primary py-3.5 text-base font-bold text-white disabled:opacity-50"
            >
              {pending ? "Adding…" : "Add task"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
