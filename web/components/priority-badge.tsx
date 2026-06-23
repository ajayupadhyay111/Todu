import type { Priority } from "@/lib/types";

const LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const COLORS: Record<Priority, string> = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#6B7280",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const color = COLORS[priority];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: `${color}22`, color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {LABELS[priority]}
    </span>
  );
}
