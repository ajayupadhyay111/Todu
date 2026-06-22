/** Shared domain types — mirror context/data-model.md. */

export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'open' | 'done';

export interface Project {
  id: string;
  name: string;
  /** hex color for the project dot/label */
  color: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: Priority;
  status: TaskStatus;
  projectId?: string;
  /** human-readable due label for display (e.g. "2:00 PM", "Tomorrow") */
  dueLabel?: string;
  /** true when the task is past due */
  overdue?: boolean;
}
