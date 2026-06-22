import type { Project, Task } from '@/lib/types';

/**
 * Mock data for building the UI before the Convex backend is wired.
 * Mirrors context/ui-context.md "Sample Data".
 */

export const PROJECTS: Project[] = [
  { id: 'p_client', name: 'Client Work', color: '#6366F1' },
  { id: 'p_office', name: 'Office', color: '#3B82F6' },
  { id: 'p_learning', name: 'Learning', color: '#22C55E' },
  { id: 'p_personal', name: 'Personal', color: '#F59E0B' },
];

export const TASKS: Task[] = [
  {
    id: 't1',
    title: 'Review PR #142 — auth refactor',
    priority: 'high',
    status: 'open',
    projectId: 'p_office',
    dueLabel: 'Overdue',
    overdue: true,
  },
  {
    id: 't2',
    title: 'Book dentist appointment',
    priority: 'medium',
    status: 'open',
    projectId: 'p_personal',
    dueLabel: 'Overdue',
    overdue: true,
  },
  {
    id: 't3',
    title: 'Send Q2 campaign report to client',
    notes: 'Include the engagement numbers and the proposed plan for next quarter.',
    priority: 'high',
    status: 'open',
    projectId: 'p_client',
    dueLabel: '2:00 PM',
  },
  {
    id: 't4',
    title: 'Reply to Mehwish re: landing page',
    priority: 'medium',
    status: 'open',
    projectId: 'p_client',
    dueLabel: '4:30 PM',
  },
  {
    id: 't5',
    title: 'Finish React Native module 4',
    priority: 'low',
    status: 'open',
    projectId: 'p_learning',
    dueLabel: 'Today',
  },
  {
    id: 't6',
    title: 'Stand-up notes sent',
    priority: 'low',
    status: 'done',
    projectId: 'p_office',
    dueLabel: 'Today',
  },
  {
    id: 't7',
    title: 'Draft newsletter for Coder Labs',
    priority: 'medium',
    status: 'open',
    projectId: 'p_client',
    dueLabel: 'Tomorrow',
  },
  {
    id: 't8',
    title: 'Update portfolio site copy',
    priority: 'low',
    status: 'open',
    projectId: 'p_personal',
  },
];

export function projectById(id?: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export function taskById(id: string): Task | undefined {
  return TASKS.find((t) => t.id === id);
}

/** Today = overdue + due-today, sorted with overdue first. */
export function todayTasks(): Task[] {
  return TASKS.filter(
    (t) => t.overdue || t.dueLabel === 'Today',
  ).sort((a, b) => Number(b.overdue ?? false) - Number(a.overdue ?? false));
}

export function tasksByProject(projectId: string): Task[] {
  return TASKS.filter((t) => t.projectId === projectId);
}
