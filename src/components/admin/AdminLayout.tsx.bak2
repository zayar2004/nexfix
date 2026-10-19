import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { AdminLangProvider } from "@/lib/admin-lang-context";

export function AdminLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <AdminLangProvider>
      <div className="flex min-h-screen bg-[var(--nx-bg-base-deep)]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopbar title={title} />
          <main className="flex-1 p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminLangProvider>
  );
}
