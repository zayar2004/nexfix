"use client";

export function Progress({ value }: { value: number }) {
  return (
    <div className="w-full mt-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-[var(--nx-text-muted-updated)]">Progress</span>
        <span className="text-xs font-bold text-[var(--nx-accent)]">{value}%</span>
      </div>
      <div className="w-full h-2 bg-[var(--nx-bg-base-deep)] rounded-full overflow-hidden border border-[var(--nx-border-updated)]">
        <div 
          className="h-full bg-[var(--nx-accent)] transition-all duration-300 rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
