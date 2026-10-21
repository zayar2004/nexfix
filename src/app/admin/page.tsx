import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, machines, errorCodes, knowledgeArticles, libraryContentReports, adminAuditLogs, libraryPdfs } from "@/db/schema";
import { count, eq, desc } from "drizzle-orm";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";
import { Users, Monitor, AlertTriangle, BookOpen, CheckCircle, FileText, Settings, Plus, ShieldAlert, File, Clock, Activity } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role === "user") redirect("/");

  let stats = { 
    users: 0, machines: 0, errors: 0, articles: 0, 
    published: 0, draft: 0, pdfs: 0, reports: 0 
  };
  
  try {
    const [u, m, e, a, pub, drf, pdf, rep] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(machines),
      db.select({ count: count() }).from(errorCodes),
      db.select({ count: count() }).from(knowledgeArticles),
      db.select({ count: count() }).from(knowledgeArticles).where(eq(knowledgeArticles.status, 'published')),
      db.select({ count: count() }).from(knowledgeArticles).where(eq(knowledgeArticles.status, 'draft')),
      db.select({ count: count() }).from(libraryPdfs),
      db.select({ count: count() }).from(libraryContentReports).where(eq(libraryContentReports.status, 'pending')),
    ]);
    stats = {
      users: Number(u[0]?.count || 0),
      machines: Number(m[0]?.count || 0),
      errors: Number(e[0]?.count || 0),
      articles: Number(a[0]?.count || 0),
      published: Number(pub[0]?.count || 0),
      draft: Number(drf[0]?.count || 0),
      pdfs: Number(pdf[0]?.count || 0),
      reports: Number(rep[0]?.count || 0),
    };
  } catch (err) {
    console.error("Stats Error:", err);
  }

  // Recent Logs
  let recentLogs: any[] = [];
  try {
    recentLogs = await db.select().from(adminAuditLogs).orderBy(desc(adminAuditLogs.createdAt)).limit(5);
  } catch {}

  // Recent Articles
  let recentArticles: any[] = [];
  try {
    recentArticles = await db.select().from(knowledgeArticles).orderBy(desc(knowledgeArticles.createdAt)).limit(5);
  } catch {}

  const statCards = [
    { label: "Total Users", value: stats.users, href: "/admin/users", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Machines", value: stats.machines, href: "/admin/content/machines", icon: Monitor, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { label: "Error Codes", value: stats.errors, href: "/admin/content/errors", icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "Total Articles", value: stats.articles, href: "/admin/content/library/list", icon: BookOpen, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Published", value: stats.published, href: "/admin/content/library/list", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Drafts", value: stats.draft, href: "/admin/content/library/list", icon: FileText, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "PDF Manuals", value: stats.pdfs, href: "/admin/content/pdfs", icon: File, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Pending Reports", value: stats.reports, href: "/admin/content/reports", icon: ShieldAlert, color: stats.reports > 0 ? "text-red-400" : "text-gray-400", bg: stats.reports > 0 ? "bg-red-400/10" : "bg-gray-400/10" },
  ];

  const quickActions = [
    { label: "New Article", href: "/admin/content/library", desc: "Add Knowledge Library article" },
    { label: "Add Error Code", href: "/admin/content/errors", desc: "Create error record" },
    { label: "Add Machine", href: "/admin/content/machines", desc: "Register new arcade machine" },
    { label: "Upload PDF", href: "/admin/content/pdfs", desc: "Add manual or document" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-xs text-[var(--nx-text-muted-updated)]">Welcome back, {session.user.name || "Admin"}</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href} className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-3 hover:border-[var(--nx-cyan)] transition group flex flex-col">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                  <Icon size={16} className={stat.color} />
                </div>
                <p className="text-xl font-bold text-white mb-0.5">{stat.value}</p>
                <p className="text-[10px] font-medium text-[var(--nx-text-muted-updated)] group-hover:text-[var(--nx-cyan)] transition line-clamp-1">{stat.label}</p>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Quick Actions */}
          <div>
            <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href} className="flex items-center justify-between p-3 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-cyan)] transition group">
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm group-hover:text-[var(--nx-cyan)] transition">{action.label}</span>
                    <span className="text-[10px] text-[var(--nx-text-muted-updated)]">{action.desc}</span>
                  </div>
                  <Plus size={16} className="text-[var(--nx-text-muted-updated)] group-hover:text-[var(--nx-cyan)]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Recent Activity */}
          <div>
            <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wide flex items-center justify-between">
              Recent Activity
              <Link href="/admin/audit" className="text-[10px] text-[var(--nx-cyan)] hover:underline normal-case">View All</Link>
            </h2>
            <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-3 flex flex-col gap-3 min-h-[200px]">
              {recentLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--nx-text-muted-updated)] py-8">
                  <Clock size={24} className="opacity-30 mb-2" />
                  <p className="text-xs">No recent activity</p>
                </div>
              ) : (
                recentLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--nx-cyan)] mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{log.details || log.entityType}</p>
                      <p className="text-[10px] text-[var(--nx-text-muted-updated)]">
                        {new Date(log.createdAt).toLocaleDateString()} • {log.action}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Articles */}
        <h2 className="text-sm font-bold text-white mt-6 mb-3 uppercase tracking-wide">Recently Added Articles</h2>
        <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl overflow-hidden">
          {recentArticles.length === 0 ? (
            <p className="text-center text-[var(--nx-text-muted-updated)] text-xs py-6">No articles yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-[var(--nx-border-updated)]">
              {recentArticles.map((a) => (
                <Link key={a.id} href={`/admin/content/library?id=${a.id}`} className="flex items-center justify-between p-3 hover:bg-[var(--nx-bg-base-deep)] transition">
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{a.slug}</p>
                    <p className="text-[10px] text-[var(--nx-text-muted-updated)]">{a.category || "Uncategorized"}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    a.status === "published" ? "text-green-400 border-green-400/30" : "text-yellow-400 border-yellow-400/30"
                  }`}>{a.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
