"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";

/** Create a project, appended to the end of the user's ordered list. */
export async function createProject(input: { name: string; color: string }) {
  const ownerId = await requireUserId();
  const name = input.name.trim();
  if (!name) throw new Error("Project name required.");

  const existing = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.ownerId, ownerId));

  await db.insert(projects).values({
    ownerId,
    name,
    color: input.color,
    sortOrder: existing.length,
  });

  revalidatePath("/projects");
  revalidatePath("/inbox");
}

export async function updateProject(input: {
  projectId: string;
  name?: string;
  color?: string;
}) {
  const ownerId = await requireUserId();
  const patch: { name?: string; color?: string } = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new Error("Project name required.");
    patch.name = name;
  }
  if (input.color !== undefined) patch.color = input.color;

  await db
    .update(projects)
    .set(patch)
    .where(and(eq(projects.id, input.projectId), eq(projects.ownerId, ownerId)));

  revalidatePath("/projects");
}

/** Delete a project; its tasks fall back to Inbox (projectId set null via FK). */
export async function deleteProject(input: { projectId: string }) {
  const ownerId = await requireUserId();
  await db
    .delete(projects)
    .where(and(eq(projects.id, input.projectId), eq(projects.ownerId, ownerId)));

  revalidatePath("/projects");
  revalidatePath("/inbox");
}
