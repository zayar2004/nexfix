"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Library", href: "/library", icon: "book" },
  { label: "Chat", href: "/chat", icon: "message-circle" },
  { label: "Notes", href: "/notes", icon: "calendar" },
  { label: "More", href: "/more", icon: "more-horizontal" },
];

const icons: Record<string, React.ReactNode> = {
  home: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  book: <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />,
  "message-circle": <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  calendar: <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />,
  "more-horizontal": <><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></>,
};

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--nx-bg-base-deep)] border-t border-[var(--nx-border-updated)] pb-[var(--nx-bottom-nav-safe-area)]">
      <div className="flex justify-around items-center h-[var(--nx-bottom-nav-height)] px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
                isActive ? "text-[var(--nx-accent)]" : "text-[var(--nx-text-muted-updated)] hover:text-[var(--nx-text-secondary-updated)]"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {icons[item.icon]}
              </svg>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
