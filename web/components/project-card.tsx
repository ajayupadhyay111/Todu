import { ChevronRightIcon } from "@/components/icons";

interface ProjectCardProps {
  name: string;
  color: string;
  total: number;
  done: number;
}

export function ProjectCard({ name, color, total, done }: ProjectCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-4">
      <span
        className="h-3.5 w-3.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1">
        <p className="text-base font-semibold text-text-primary">{name}</p>
        <p className="mt-0.5 text-[13px] text-text-secondary">
          {total === 0
            ? "No tasks"
            : `${done}/${total} done`}
        </p>
      </div>
      <ChevronRightIcon size={18} className="text-text-secondary" />
    </div>
  );
}
