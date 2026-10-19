"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function AdminLoginForm() {
  const router = useRouter();
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
        // Login အောင်မြင်ရင် Admin Dashboard ကို ပို့မယ်
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-6 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-black tracking-tighter italic">
            <span className="text-white">NEX</span><span className="text-[var(--nx-accent-secondary)]">FIX</span>
          </h1>
          <p className="text-sm text-[var(--nx-text-muted-updated)] mt-1">Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Admin Email" 
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
            className="w-full h-12 bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg px-4 focus:outline-none focus:border-[var(--nx-accent)]" 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={(e) => setForm({ ...form, password: e.target.value })} 
            className="w-full h-12 bg-[var(--nx-bg-base-deep)] text-white border border-[var(--nx-border-updated)] rounded-lg px-4 focus:outline-none focus:border-[var(--nx-accent)]" 
            required 
          />
          
          {error && <p className="text-[var(--nx-error)] text-sm text-center">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full h-12 bg-[var(--nx-accent)] text-black font-bold rounded-lg hover:brightness-110 transition-colors mt-2"
          >
            {loading ? "Signing in..." : "Sign In as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--nx-bg-base-deep)] flex items-center justify-center text-white">Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
