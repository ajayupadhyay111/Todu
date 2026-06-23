"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { PlusIcon } from "@/components/icons";
import { createProject } from "@/lib/actions/projects";

const SWATCHES = ["#6366F1", "#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#A855F7"];

export function NewProjectDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(SWATCHES[0]);
  const [pending, startTransition] = useTransition();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || pending) return;
    startTransition(async () => {
      await createProject({ name: name.trim(), color });
      setName("");
      setColor(SWATCHES[0]);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="New project"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white"
      >
        <PlusIcon size={22} />
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
            <h2 className="text-xl font-extrabold text-text-primary">
              New project
            </h2>

            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              className="mt-4 h-[52px] w-full rounded-xl border border-border bg-surface px-4 text-base text-text-primary outline-none placeholder:text-text-secondary focus:border-primary"
            />

            <div className="mt-4 flex gap-3">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  className="h-9 w-9 rounded-full border-2"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "var(--color-text-primary)" : "transparent",
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={!name.trim() || pending}
              className="mt-6 h-[52px] w-full rounded-xl bg-primary text-base font-bold text-white disabled:opacity-50"
            >
              {pending ? "Creating…" : "Create"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
