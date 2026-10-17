"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", displayName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Success — redirect to login
      router.push("/login?registered=1");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--nx-bg-base)] px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <p className="text-sm text-[var(--nx-text-secondary)]">
              Join NEXFIX — Diagnose. Repair. Connect.
            </p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="new-password"
                hint="Minimum 8 characters"
              />
              <Input
                label="Display Name (Optional)"
                placeholder="e.g., Aung Aung"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                autoComplete="name"
              />

              {error && (
                <div className="rounded-[var(--nx-radius-md)] border border-[var(--nx-error)]/30 bg-[var(--nx-error)]/10 p-3 text-sm text-[var(--nx-error)]" role="alert">
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" loading={loading} fullWidth>
                Create Account
              </Button>

              <p className="text-center text-sm text-[var(--nx-text-muted)]">
                Already have an account?{" "}
                <Link href="/login" className="text-[var(--nx-primary)] hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
