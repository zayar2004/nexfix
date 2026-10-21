"use client";

import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";
import { Bookmark, User, Settings, HelpCircle, Info, ChevronRight, ShieldCheck, LogOut } from "lucide-react";

export default function MorePage() {
  const { t } = useSettings();

  const menuItems = [
    { label: "My Bookmarks", href: "/bookmarks", icon: Bookmark, color: "var(--nx-cyan)" },
    { label: "Profile", href: "/profile", icon: User, color: "var(--nx-cyan)" },
    { label: "Settings", href: "/settings", icon: Settings, color: "var(--nx-cyan)" },
    { label: "Help & Support", href: "/help", icon: HelpCircle, color: "var(--nx-cyan)" },
    { label: "About NEXFIX", href: "/about", icon: Info, color: "var(--nx-cyan)" },
  ];

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      
      <main className="max-w-3xl mx-auto p-4 py-6">
        <h1 className="text-2xl font-bold text-[var(--nx-text-primary)] mb-6">More</h1>

        <div className="flex flex-col gap-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className="flex items-center gap-3 p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-cyan)] transition group"
              >
                <Icon size={20} className="text-[var(--nx-text-muted-updated)] group-hover:text-[var(--nx-cyan)] transition" />
                <span className="flex-1 text-[var(--nx-text-primary)] font-medium">{item.label}</span>
                <ChevronRight size={16} className="text-[var(--nx-text-muted-updated)]" />
              </Link>
            );
          })}

          {/* Admin Portal Link */}
          <Link 
            href="/admin/login" 
            className="flex items-center gap-3 p-4 bg-[var(--nx-accent)]/10 border border-[var(--nx-accent)]/30 rounded-xl hover:bg-[var(--nx-accent)]/20 transition mt-4"
          >
            <ShieldCheck size={20} className="text-[var(--nx-accent)]" />
            <span className="flex-1 text-[var(--nx-accent)] font-bold">Admin Portal</span>
            <ChevronRight size={16} className="text-[var(--nx-accent)]" />
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-[var(--nx-text-muted-updated)]">NEXFIX v1.0.0</p>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
