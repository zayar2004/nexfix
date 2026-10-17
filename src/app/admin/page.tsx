import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminPage() {
  const session = await auth();

  // 1. Login မဝင်ထားရင် Login ကို ပို့
  if (!session?.user) {
    redirect("/login");
  }

  // 2. Role က 'user' ဖြစ်ရင် Home ကို ပို့
  if (session.user.role === "user") {
    redirect("/");
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--nx-primary)]">Admin Dashboard</h1>
      <p className="mt-4 text-[var(--nx-text-primary)]">
        Welcome {session.user.email}. Your role is: <strong>{session.user.role}</strong>
      </p>
      <p className="mt-2 text-sm text-[var(--nx-text-muted)]">
        (This page is protected by server-side auth check.)
      </p>
    </main>
  );
}
