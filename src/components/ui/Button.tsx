"use client";

import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 " +
  "disabled:cursor-not-allowed select-none";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--nx-primary)] text-white hover:bg-[var(--nx-primary-hover)] " +
    "active:bg-[var(--nx-primary-active)] focus-visible:ring-[var(--nx-focus-ring)]",
  secondary:
    "bg-[var(--nx-bg-elevated)] text-[var(--nx-text-primary)] " +
    "border border-[var(--nx-border)] hover:bg-[var(--nx-bg-surface)] " +
    "focus-visible:ring-[var(--nx-focus-ring)]",
  ghost:
    "bg-transparent text-[var(--nx-text-primary)] hover:bg-[var(--nx-bg-elevated)] " +
    "focus-visible:ring-[var(--nx-focus-ring)]",
  danger:
    "bg-[var(--nx-error)] text-white hover:opacity-90 active:opacity-80 " +
    "focus-visible:ring-[var(--nx-error)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-[var(--nx-radius-sm)]",
  md: "h-11 px-4 text-base rounded-[var(--nx-radius-md)]",
  lg: "h-13 px-6 text-base rounded-[var(--nx-radius-md)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", loading = false, iconLeft, iconRight, fullWidth, className = "", children, disabled, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={[baseStyles, variantStyles[variant], sizeStyles[size], fullWidth ? "w-full" : "", className].filter(Boolean).join(" ")}
        {...props}
      >
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
        )}
        {!loading && iconLeft}
        {children}
        {!loading && iconRight}
      </button>
    );
  }
);
