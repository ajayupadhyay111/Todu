/** Date helpers — all timestamps are epoch ms (UTC); formatting is local. */

export function startOfToday(now: number = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function endOfToday(now: number = Date.now()): number {
  const d = new Date(now);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export type DueInfo = { label: string; overdue: boolean } | undefined;

/** Human-readable due label + overdue flag for a task's dueDate. */
export function formatDue(dueDate: number | undefined, now: number = Date.now()): DueInfo {
  if (dueDate === undefined) return undefined;

  const startToday = startOfToday(now);
  const endToday = endOfToday(now);
  const startTomorrow = endToday + 1;
  const endTomorrow = endToday + 24 * 60 * 60 * 1000;

  if (dueDate < startToday) return { label: 'Overdue', overdue: true };

  const time = new Date(dueDate).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (dueDate <= endToday) {
    // Midnight = "no specific time" → show "Today", else the time.
    return { label: dueDate === startToday ? 'Today' : time, overdue: false };
  }
  if (dueDate >= startTomorrow && dueDate <= endTomorrow) {
    return { label: 'Tomorrow', overdue: false };
  }
  return {
    label: new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    overdue: false,
  };
}
