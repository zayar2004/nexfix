"use client";

import { ReactNode } from "react";
import { Button } from "./Button";

export interface ErrorStateProps {
  icon?: ReactNode;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  action?: ReactNode;
}

export function ErrorState({
  icon,
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Retry",
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center" role="alert">
      {icon && <div className="text-[var(--nx-error)]" aria-hidden="true">{icon}</div>}
      <h3 className="text-base font-semibold text-[var(--nx-text-primary)]">{title}</h3>
      {message && <p className="max-w-sm text-sm text-[var(--nx-text-secondary)]">{message}</p>}
      <div className="mt-2 flex items-center gap-2">
        {onRetry && <Button variant="primary" size="md" onClick={onRetry}>{retryLabel}</Button>}
        {action}
      </div>
    </div>
  );
}
