"use client";

import { AdminLangSwitcher } from "./AdminLangSwitcher";

export function AdminTopbar({ title }: { title: string }) {
  return (
    <header className="h-16 border-b border-[var(--nx-border-updated)] bg-[var(--nx-bg-surface-deep)] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <h1 className="text-lg font-bold text-white truncate ml-12 lg:ml-0">{title}</h1>
      <div className="flex items-center gap-3">
        <AdminLangSwitcher />
      </div>
    </header>
  );
}
