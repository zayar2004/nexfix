import { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center" role="status">
      {icon && <div className="text-[var(--nx-text-muted)]" aria-hidden="true">{icon}</div>}
      <h3 className="text-base font-semibold text-[var(--nx-text-primary)]">{title}</h3>
      {description && <p className="max-w-sm text-sm text-[var(--nx-text-secondary)]">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
