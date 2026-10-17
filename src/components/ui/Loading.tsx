"use client";

export interface LoadingProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  fullPage?: boolean;
}

const sizeMap = { sm: "h-4 w-4 border-2", md: "h-6 w-6 border-2", lg: "h-10 w-10 border-[3px]" };

export function Loading({ size = "md", label = "Loading...", fullPage = false }: LoadingProps) {
  const spinner = (
    <div
      className={["animate-spin rounded-full border-[var(--nx-border)] border-t-[var(--nx-primary)]", sizeMap[size]].join(" ")}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        {spinner}
        {label && <p className="text-sm text-[var(--nx-text-muted)]">{label}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {spinner}
      {label && <span className="text-sm text-[var(--nx-text-secondary)]">{label}</span>}
    </div>
  );
}

export function Skeleton({ className = "", width, height }: { className?: string; width?: string; height?: string }) {
  return (
    <div
      className={["animate-pulse rounded-[var(--nx-radius-sm)] bg-[var(--nx-bg-elevated)]", className].join(" ")}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
