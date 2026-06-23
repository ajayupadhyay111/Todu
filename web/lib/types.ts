export type Priority = "high" | "medium" | "low";
export type TaskStatusValue = "open" | "done";

/**
 * Client-facing shapes. Timestamps are epoch milliseconds (numbers) so they
 * cross the server/client boundary cleanly and reuse the date helpers from
 * the mobile app verbatim.
 */
export interface ProjectDto {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
  createdAt: number;
}

export interface ProjectWithCounts extends ProjectDto {
  total: number;
  done: number;
}

export interface TaskDto {
  id: string;
  projectId: string | null;
  title: string;
  notes: string | null;
  priority: Priority;
  status: TaskStatusValue;
  dueDate: number | null;
  completedAt: number | null;
  sortOrder: number;
  createdAt: number;
}

export interface ReminderDto {
  id: string;
  taskId: string;
  remindAt: number;
  sent: boolean;
}
