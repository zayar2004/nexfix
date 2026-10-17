import { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-[var(--nx-success)]/15 text-[var(--nx-success)] border-[var(--nx-success)]/30",
  warning: "bg-[var(--nx-warning)]/15 text-[var(--nx-warning)] border-[var(--nx-warning)]/30",
  error: "bg-[var(--nx-error)]/15 text-[var(--nx-error)] border-[var(--nx-error)]/30",
  info: "bg-[var(--nx-info)]/15 text-[var(--nx-info)] border-[var(--nx-info)]/30",
  neutral: "bg-[var(--nx-bg-elevated)] text-[var(--nx-text-secondary)] border-[var(--nx-border)]",
};

const dotStyles: Record<BadgeVariant, string> = {
  success: "bg-[var(--nx-success)]",
  warning: "bg-[var(--nx-warning)]",
  error: "bg-[var(--nx-error)]",
  info: "bg-[var(--nx-info)]",
  neutral: "bg-[var(--nx-text-muted)]",
};

export function Badge({ variant = "neutral", children, dot = false, className = "", ...props }: BadgeProps) {
  return (
    <span
      className={["inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium leading-none", variantStyles[variant], className].join(" ")}
      {...props}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`} aria-hidden="true" />}
      {children}
    </span>
  );
}
