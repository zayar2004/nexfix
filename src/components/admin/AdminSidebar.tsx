"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Home, AlertCircle, List, BookOpen, Image as ImageIcon, FolderOpen, FileText, Users, Clock, Settings, Menu, X, ShieldAlert } from "lucide-react";

const iconMap: Record<string, any> = {
  "grid": LayoutDashboard,
  "home": Home,
  "alert-circle": AlertCircle,
  "list": List,
  "book": BookOpen,
  "image": ImageIcon,
  "folder": FolderOpen,
  "file": FileText,
  "users": Users,
  "clock": Clock,
  "settings": Settings,
  "shield": ShieldAlert,
};

type NavItem = { label: string; href: string; icon: string; disabled?: boolean };

const sections = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/admin", icon: "grid" },
    ]
  },
  {
    title: "Content Management",
    items: [
      { label: "Home Page", href: "/admin/content/home", icon: "home" },
      { label: "Machines", href: "/admin/content/machines", icon: "list" },
      { label: "Add Error", href: "/admin/content/errors", icon: "alert-circle" },
      { label: "View Errors", href: "/admin/content/errors/list", icon: "list" },
      { label: "Knowledge Library", href: "/admin/content/library", icon: "book" },
      { label: "Library List", href: "/admin/content/library/list", icon: "list" },
      { label: "Content Reports", href: "/admin/content/reports", icon: "shield" },
      { label: "Media Library", href: "/admin/media", icon: "image" },
    ]
  },
  {
    title: "System",
    items: [
      { label: "Content Version", href: "/admin/versions", icon: "clock", disabled: true },
      { label: "Users", href: "/admin/users", icon: "users", disabled: true },
      { label: "Audit Log", href: "/admin/audit", icon: "list" },
      { label: "Settings", href: "/admin/settings", icon: "settings", disabled: true },
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-lg text-white"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[var(--nx-bg-base-deep)] border-r border-[var(--nx-border-updated)] z-50 overflow-y-auto transition-transform duration-300
        lg:relative lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-[var(--nx-border-updated)]">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-2xl font-black text-[var(--nx-cyan)] tracking-tighter">NEXFIX</span>
            <span className="text-[10px] font-bold text-[var(--nx-text-muted-updated)] uppercase tracking-wider bg-[var(--nx-bg-card)] px-1.5 py-0.5 rounded">Admin</span>
          </Link>
        </div>

        <nav className="p-4 flex flex-col gap-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-[10px] font-bold text-[var(--nx-text-muted-updated)] uppercase tracking-wider mb-2 px-3">
                {section.title}
              </h3>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const Icon = iconMap[item.icon] || List;
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  
                  if (item.disabled) {
                    return (
                      <div key={item.label} className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--nx-text-muted-updated)] opacity-40 cursor-not-allowed">
                        <Icon size={16} />
                        <span className="text-sm">{item.label}</span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive 
                          ? "bg-[var(--nx-cyan)]/10 text-[var(--nx-cyan)] font-bold" 
                          : "text-[var(--nx-text-primary)] hover:bg-[var(--nx-bg-card)]"
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-[var(--nx-border-updated)]">
          <Link href="/" className="flex items-center gap-2 text-sm text-[var(--nx-text-muted-updated)] hover:text-[var(--nx-accent)] transition-colors">
            <Home size={16} /> Back to User Web
          </Link>
        </div>
      </aside>
    </>
  );
}
