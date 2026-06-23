import "server-only";

import { and, asc, eq, lte } from "drizzle-orm";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, tasks } from "@/lib/db/schema";
import { endOfToday } from "@/lib/dates";
import type {
  ProjectDto,
  ProjectWithCounts,
  TaskDto,
} from "@/lib/types";
import type { ProjectRow, TaskRow } from "@/lib/db/schema";

function toProjectDto(row: ProjectRow): ProjectDto {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.getTime(),
  };
}

function toTaskDto(row: TaskRow): TaskDto {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    notes: row.notes,
    priority: row.priority,
    status: row.status,
    dueDate: row.dueDate ? row.dueDate.getTime() : null,
    completedAt: row.completedAt ? row.completedAt.getTime() : null,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.getTime(),
  };
}

/** All projects for the current user, ordered. */
export async function listProjects(): Promise<ProjectDto[]> {
  const ownerId = await requireUserId();
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.ownerId, ownerId))
    .orderBy(asc(projects.sortOrder));
  return rows.map(toProjectDto);
}

/** Projects plus their open/total task counts (Projects screen). */
export async function listProjectsWithCounts(): Promise<ProjectWithCounts[]> {
  const ownerId = await requireUserId();
  const [projectRows, taskRows] = await Promise.all([
    db
      .select()
      .from(projects)
      .where(eq(projects.ownerId, ownerId))
      .orderBy(asc(projects.sortOrder)),
    db.select().from(tasks).where(eq(tasks.ownerId, ownerId)),
  ]);

  return projectRows.map((project) => {
    const owned = taskRows.filter((t) => t.projectId === project.id);
    const done = owned.filter((t) => t.status === "done").length;
    return { ...toProjectDto(project), total: owned.length, done };
  });
}

/** Every task for the current user (Inbox source; the client filters). */
export async function listTasks(): Promise<TaskDto[]> {
  const ownerId = await requireUserId();
  const rows = await db
    .select()
    .from(tasks)
    .where(eq(tasks.ownerId, ownerId))
    .orderBy(asc(tasks.sortOrder));
  return rows
    .map(toTaskDto)
    .sort((a, b) => a.sortOrder - b.sortOrder || b.createdAt - a.createdAt);
}

/** Open tasks due on or before end of the user's local day (overdue included). */
export async function listTodayTasks(): Promise<TaskDto[]> {
  const ownerId = await requireUserId();
  const cutoff = new Date(endOfToday());
  const rows = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.ownerId, ownerId), lte(tasks.dueDate, cutoff)));
  return rows
    .filter((t) => t.status === "open" && t.dueDate !== null)
    .map(toTaskDto)
    .sort((a, b) => (a.dueDate ?? 0) - (b.dueDate ?? 0));
}

/** Single task, or null if missing / not owned by the current user. */
export async function getTask(taskId: string): Promise<TaskDto | null> {
  const ownerId = await requireUserId();
  const rows = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.ownerId, ownerId)))
    .limit(1);
  return rows[0] ? toTaskDto(rows[0]) : null;
}
