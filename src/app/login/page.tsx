"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        // Session ကို Refresh လုပ်ပြီး Approve ဖြစ်မဖြစ် စစ်မယ်
      const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
      const sessionData = await sessionRes.json();
      
      if (sessionData?.user) {
        const isAdmin = ["staff", "senior_admin", "super_admin"].includes(sessionData.user.role);
        if (sessionData.user.isApproved || isAdmin) {
          router.push("/");
        } else {
          router.push("/pending-approval");
        }
      } else {
        router.push("/");
      }
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {justRegistered && (
        <div className="mb-2 rounded-[var(--nx-radius-md)] border border-[var(--nx-success)]/30 bg-[var(--nx-success)]/10 p-3 text-sm text-[var(--nx-success)]">
          Account created! Please sign in.
        </div>
      )}
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        placeholder="Your password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        autoComplete="current-password"
      />

      {error && (
        <div className="rounded-[var(--nx-radius-md)] border border-[var(--nx-error)]/30 bg-[var(--nx-error)]/10 p-3 text-sm text-[var(--nx-error)]" role="alert">
          {error}
        </div>
      )}

      <Button type="submit" variant="primary" loading={loading} fullWidth>
        Sign In
      </Button>

      <p className="text-center text-sm text-[var(--nx-text-muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[var(--nx-primary)] hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--nx-bg-base)] px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <p className="text-sm text-[var(--nx-text-secondary)]">
              Welcome back to NEXFIX
            </p>
          </CardHeader>
          <CardBody>
            <Suspense fallback={<div className="text-center text-sm text-[var(--nx-text-muted)]">Loading...</div>}>
              <LoginForm />
            </Suspense>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
