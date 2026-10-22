"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function UserBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show back button on main pages
  const hiddenPaths = ["/", "/login", "/register", "/lab"];
  if (hiddenPaths.includes(pathname)) return null;

  return (
    <button 
      onClick={() => router.back()} 
      className="fixed top-4 left-4 z-50 p-2 bg-[var(--nx-bg-surface-deep)]/80 backdrop-blur-md border border-[var(--nx-border-updated)] rounded-full text-white hover:bg-[var(--nx-bg-card)] transition shadow-lg"
      aria-label="Go back"
    >
      <ChevronLeft size={24} />
    </button>
  );
}
