"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { getLocalData } from "@/lib/local-db";
import { useSettings } from "@/lib/settings-context";

type Notification = {
  id: string;
  title: string;
  body: string;
  type: "article" | "error" | "machine" | "system";
  href: string;
  createdAt: string;
  isRead: boolean;
};

export default function NotificationsPage() {
  const router = useRouter();
  const { t } = useSettings();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🌟 Local Storage ကနေ Notification တွေကို ယူမယ်
    const loadNotifications = async () => {
      const saved = localStorage.getItem("nexfix_notifications_list");
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch {}
      } else {
        // 🌟 ပထမဆုံး ဝင်တာဆိုရင် နောက်ဆုံး Article/Error တွေကို Notification အဖြစ် ဖန်တီးမယ်
        const data = await getLocalData();
        if (data) {
          const newNotifs: Notification[] = [];

          // Articles တွေကို Notification ဖန်တီးမယ်
          if (data.articles && data.articleContents) {
            const contents = data.articleContents as Record<string, unknown>[];
            (data.articles as Record<string, unknown>[]).slice(0, 5).forEach((a) => {
              const content = contents.find(c => c.articleId === a.id && c.locale === "my") || contents.find(c => c.articleId === a.id);
              if (content) {
                newNotifs.push({
                  id: `article-${a.id}`,
                  title: String(content.title),
                  body: content.summary ? String(content.summary) : "New article available",
                  type: "article",
                  href: `/library/${a.slug}`,
                  createdAt: new Date().toISOString(),
                  isRead: false,
                });
              }
            });
          }

          // Errors တွေကို Notification ဖန်တီးမယ်
          if (data.errorCodes && data.machines) {
            (data.errorCodes as Record<string, unknown>[]).slice(0, 5).forEach((e) => {
              const machine = (data.machines as Record<string, unknown>[]).find(m => m.id === e.machineId);
              newNotifs.push({
                id: `error-${e.id}`,
                title: `${machine?.name || "Unknown"} - ${e.code}`,
                body: String(e.title),
                type: "error",
                href: `/errors/${e.id}`,
                createdAt: new Date().toISOString(),
                isRead: false,
              });
            });
          }

          setNotifications(newNotifs);
          localStorage.setItem("nexfix_notifications_list", JSON.stringify(newNotifs));
        }
      }
      setLoading(false);
    };

    loadNotifications();
  }, []);

  const handleMarkRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    localStorage.setItem("nexfix_notifications_list", JSON.stringify(updated));
    updateBadgeCount(updated);
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem("nexfix_notifications_list", JSON.stringify(updated));
    updateBadgeCount(updated);
  };

  const handleClearAll = () => {
    if (!confirm("Clear all notifications?")) return;
    setNotifications([]);
    localStorage.setItem("nexfix_notifications_list", JSON.stringify([]));
    localStorage.setItem("nexfix_notifications", "0");
  };

  const updateBadgeCount = (list: Notification[]) => {
    const unread = list.filter(n => !n.isRead).length;
    localStorage.setItem("nexfix_notifications", String(unread));
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const typeIcons: Record<string, React.ReactNode> = {
    article: <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />,
    error: <><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></>,
    machine: <><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/></>,
    system: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>,
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-6">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--nx-text-primary)]">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-[var(--nx-accent)] font-medium mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-[var(--nx-accent)] font-medium hover:underline">
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={handleClearAll} className="text-xs text-[var(--nx-error)] font-medium hover:underline">
                Clear all
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[var(--nx-accent)] border-t-transparent rounded-full animate-spin"></div></div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center bg-[var(--nx-bg-card)] border border-dashed border-[var(--nx-border-updated)] rounded-xl">
            <div className="w-16 h-16 rounded-full bg-[var(--nx-bg-surface-deep)] flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--nx-text-muted-updated)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            </div>
            <p className="text-[var(--nx-text-muted-updated)] text-sm">No notifications yet</p>
            <p className="text-xs text-[var(--nx-text-muted-updated)] mt-1">New content will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n) => (
              <Link 
                key={n.id} 
                href={n.href}
                onClick={() => handleMarkRead(n.id)}
              >
                <div className={`p-4 rounded-xl border transition-colors flex items-start gap-3 ${
                  n.isRead 
                    ? "bg-[var(--nx-bg-card)] border-[var(--nx-border-updated)] opacity-70" 
                    : "bg-[var(--nx-bg-card)] border-[var(--nx-accent)]/30"
                }`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    n.type === "article" ? "bg-[var(--nx-accent)]/10 text-[var(--nx-accent)]" :
                    n.type === "error" ? "bg-[var(--nx-warning)]/10 text-[var(--nx-warning)]" :
                    "bg-[var(--nx-bg-surface-deep)] text-[var(--nx-text-muted-updated)]"
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{typeIcons[n.type]}</svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold text-sm ${n.isRead ? "text-[var(--nx-text-muted-updated)]" : "text-[var(--nx-text-primary)]"}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-2 h-2 bg-[var(--nx-accent)] rounded-full flex-shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--nx-text-muted-updated)] mt-1 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-[var(--nx-text-muted-updated)] mt-1.5">{formatTime(n.createdAt)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
