import { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated";
  padding?: "sm" | "md" | "lg";
  children: ReactNode;
}

const paddingStyles = { sm: "p-3", md: "p-4", lg: "p-6" };

export function Card({ variant = "default", padding = "md", className = "", children, ...props }: CardProps) {
  return (
    <div
      className={[
        "rounded-[var(--nx-radius-lg)] border border-[var(--nx-border)]",
        variant === "elevated" ? "bg-[var(--nx-bg-elevated)]" : "bg-[var(--nx-bg-surface)]",
        paddingStyles[padding],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mb-3 flex flex-col gap-1 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-base font-semibold text-[var(--nx-text-primary)] ${className}`}>{children}</h3>;
}

export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`text-sm text-[var(--nx-text-secondary)] ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mt-4 flex items-center gap-2 ${className}`}>{children}</div>;
}
