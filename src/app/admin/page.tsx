import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role === "user") redirect("/");

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <Link href="/admin/content/home" className="p-6 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-accent)]">
            <h2 className="text-lg font-semibold text-white">Home Page</h2>
            <p className="text-sm text-[var(--nx-text-muted-updated)]">Edit hero text and image.</p>
          </Link>
          
          <Link href="/admin/content/machines" className="p-6 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-accent)]">
            <h2 className="text-lg font-semibold text-white">Machines</h2>
            <p className="text-sm text-[var(--nx-text-muted-updated)]">Add or edit machines.</p>
          </Link>
          
          <Link href="/admin/content/errors" className="p-6 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-accent)]">
            <h2 className="text-lg font-semibold text-white">Error Codes</h2>
            <p className="text-sm text-[var(--nx-text-muted-updated)]">Add or edit error codes.</p>
          </Link>

          {/* Library Link အသစ် ထည့်ပြီး */}
          <Link href="/admin/content/library" className="p-6 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-accent)]">
            <h2 className="text-lg font-semibold text-white">Knowledge Library</h2>
            <p className="text-sm text-[var(--nx-text-muted-updated)]">Add or edit articles.</p>
          </Link>

        </div>
      </div>
    </div>
  );
}
