import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  hint?: string;
}

export function EmptyState({ icon, title, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
      {icon && <div className="text-text-secondary">{icon}</div>}
      <p className="text-base font-semibold text-text-primary">{title}</p>
      {hint && <p className="text-sm text-text-secondary">{hint}</p>}
    </div>
  );
}
