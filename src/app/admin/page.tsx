import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, machines, errorCodes, knowledgeArticles } from "@/db/schema";
import { count } from "drizzle-orm";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";

// 🌟 ဒီ Page ကို Build လုပ်တဲ့အခါ Static မလုပ်ခိုင်းဘူး (Runtime မှာပဲ ခေါ်မယ်)

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session?.user) redirect("/admin/login");
  if (session.user.role === "user") redirect("/");

  let stats = { users: 0, machines: 0, errors: 0, articles: 0 };
  try {
    const [u, m, e, a] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(machines),
      db.select({ count: count() }).from(errorCodes),
      db.select({ count: count() }).from(knowledgeArticles),
    ]);
    stats = {
      users: Number(u[0]?.count || 0),
      machines: Number(m[0]?.count || 0),
      errors: Number(e[0]?.count || 0),
      articles: Number(a[0]?.count || 0),
    };
  } catch {}

  const statCards = [
    { label: "Users", value: stats.users, href: "/admin/users", color: "var(--nx-primary)" },
    { label: "Machines", value: stats.machines, href: "/admin/content/machines", color: "var(--nx-accent)" },
    { label: "Error Codes", value: stats.errors, href: "/admin/content/errors", color: "var(--nx-warning)" },
    { label: "Articles", value: stats.articles, href: "/admin/content/library", color: "var(--nx-success)" },
  ];

  const quickActions = [
    { label: "Edit Home Page", href: "/admin/content/home", desc: "Hero text, image, search config", icon: "home" },
    { label: "Add Machine", href: "/admin/content/machines", desc: "Register new arcade machine", icon: "cpu" },
    { label: "Add Error Code", href: "/admin/content/errors", desc: "Create error record", icon: "alert" },
    { label: "Upload Media", href: "/admin/media", desc: "Manage images and assets", icon: "image", disabled: true },
  ];

  const icons: Record<string, React.ReactNode> = {
    home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    cpu: <><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/></>,
    alert: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
    image: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></>,
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Welcome back, {session.user.name || "Admin"}</h2>
          <p className="text-sm text-[var(--nx-text-muted-updated)] mt-1">Here&apos;s an overview of your platform.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {statCards.map((s) => (
            <Link key={s.label} href={s.href} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 hover:border-[var(--nx-accent)] transition-colors">
              <p className="text-[10px] uppercase tracking-wider text-[var(--nx-text-muted-updated)] mb-2">{s.label}</p>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </Link>
          ))}
        </div>

        <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((a) => {
            if (a.disabled) {
              return (
                <div key={a.href} className="flex items-center gap-4 p-4 bg-[var(--nx-bg-card)]/50 border border-dashed border-[var(--nx-border-updated)] rounded-xl opacity-50 cursor-not-allowed">
                  <div className="w-10 h-10 rounded-lg bg-[var(--nx-bg-surface-deep)] flex items-center justify-center text-[var(--nx-text-muted-updated)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[a.icon]}</svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--nx-text-muted-updated)]">{a.label}</p>
                    <p className="text-xs text-[var(--nx-text-muted-updated)]">{a.desc} (Soon)</p>
                  </div>
                </div>
              );
            }
            return (
              <Link key={a.href} href={a.href} className="flex items-center gap-4 p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-accent)] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[var(--nx-accent)]/10 flex items-center justify-center text-[var(--nx-accent)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[a.icon]}</svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{a.label}</p>
                  <p className="text-xs text-[var(--nx-text-muted-updated)]">{a.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
