"use client";

import { forwardRef, useId, InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className = "", ...props },
  ref
) {
  // 🌟 useId() ကို သုံးမယ် - Server နဲ့ Client မှာ တူညီတဲ့ ID ထုတ်ပေးတယ်
  const generatedId = useId();
  const inputId = id || `nx-input-${generatedId}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--nx-text-primary)]">
          {label}
          {props.required && (<span className="ml-1 text-[var(--nx-error)]" aria-hidden="true">*</span>)}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={[error ? errorId : "", hint ? hintId : ""].filter(Boolean).join(" ") || undefined}
        className={[
          "h-12 w-full rounded-[var(--nx-radius-md)] px-3 text-base",
          "bg-[var(--nx-bg-elevated)] text-[var(--nx-text-primary)]",
          "border transition-colors placeholder:text-[var(--nx-text-muted)]",
          "focus-visible:outline-none focus-visible:ring-2",
          error ? "border-[var(--nx-error)] focus-visible:ring-[var(--nx-error)]" : "border-[var(--nx-border)] focus-visible:ring-[var(--nx-focus-ring)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        ].join(" ")}
        {...props}
      />
      {error && (<p id={errorId} className="text-sm text-[var(--nx-error)]" role="alert">{error}</p>)}
      {!error && hint && (<p id={hintId} className="text-sm text-[var(--nx-text-muted)]">{hint}</p>)}
    </div>
  );
});
