"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = { label: string; href: string; icon: string; disabled?: boolean };

const navGroups: { title: string | null; items: NavItem[] }[] = [
  {
    title: null,
    items: [
      { label: "Dashboard", href: "/admin", icon: "grid" },
    ],
  },
  {
    title: "Website Content",
    items: [
      { label: "Home Page", href: "/admin/content/home", icon: "home" },
      { label: "Add Error", href: "/admin/content/errors", icon: "alert-circle" },
      { label: "View Errors", href: "/admin/content/errors/list", icon: "list" },
      { label: "Knowledge Library", href: "/admin/content/library", icon: "book" },
      { label: "Media Library", href: "/admin/media", icon: "image" },
    ],
  },
  {
    title: null,
    items: [
      { label: "Content Version", href: "/admin/versions", icon: "clock", disabled: true },
      { label: "Users", href: "/admin/users", icon: "users", disabled: true },
      { label: "Audit Log", href: "/admin/audit", icon: "list", disabled: true },
      { label: "Settings", href: "/admin/settings", icon: "settings", disabled: true },
    ],
  },
];

const icons: Record<string, React.ReactNode> = {
  grid: <><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></>,
  home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  cpu: <><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/></>,
  "alert-circle": <><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></>,
  book: <><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></>,
  image: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></>,
  clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  list: <><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></>,
  settings: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></>,
};

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-lg text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      </button>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[var(--nx-bg-surface-deep)] border-r border-[var(--nx-border-updated)] z-50 transition-transform lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} overflow-y-auto`}>
        <div className="p-5 border-b border-[var(--nx-border-updated)]">
          <Link href="/admin" className="flex flex-col">
            <div className="flex items-baseline text-2xl font-black tracking-tighter italic">
              <span className="text-white">NEX</span>
              <span className="text-[var(--nx-accent-secondary)]">FIX</span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-[var(--nx-text-muted-updated)] font-semibold">
              Admin Portal
            </span>
          </Link>
        </div>

        <nav className="p-3 flex flex-col gap-4">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.title && (
                <p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-[var(--nx-text-muted-updated)] font-semibold">
                  {group.title}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
                  if (item.disabled) {
                    return (
                      <div key={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--nx-text-muted-updated)] opacity-40 cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[item.icon]}</svg>
                        <span className="text-sm">{item.label}</span>
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-[var(--nx-accent)]/10 text-[var(--nx-accent)]"
                          : "text-[var(--nx-text-secondary-updated)] hover:bg-[var(--nx-bg-card)] hover:text-white"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[item.icon]}</svg>
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--nx-border-updated)] bg-[var(--nx-bg-surface-deep)]">
          <Link href="/" className="flex items-center gap-2 text-sm text-[var(--nx-text-muted-updated)] hover:text-[var(--nx-accent)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Back to User Web
          </Link>
        </div>
      </aside>
    </>
  );
}
