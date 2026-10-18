"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type SearchResult = {
  id: string;
  code: string;
  title: string;
  machineName: string;
  machineCode: string;
  solution: string | null;
};

export default function HomePage() {
  const { data: session, status } = useSession();

  // Section A
  const [machineName, setMachineName] = useState("");
  const [errorCode, setErrorCode] = useState("");

  // Section B
  const [machineCodeInput, setMachineCodeInput] = useState("");

  // Results
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runSearch(params: { machine?: string; code?: string }) {
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const query = new URLSearchParams();
      if (params.machine) query.set("machine", params.machine);
      if (params.code) query.set("code", params.code);
      const res = await fetch(`/api/search?${query.toString()}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Search failed");
      setResults(data.results || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--nx-bg-base)]">
      <header className="sticky top-0 z-10 border-b border-[var(--nx-border)] bg-[var(--nx-bg-surface)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/">
            <h1 className="text-lg font-bold text-[var(--nx-primary)]">NEXFIX</h1>
            <p className="text-xs text-[var(--nx-text-muted)]">Diagnose. Repair. Connect.</p>
          </Link>
          <div className="flex items-center gap-2">
            {status === "authenticated" && session?.user ? (
              <>
                <Badge variant="success" dot>{session.user.role}</Badge>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>Sign Out</Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="secondary" size="sm">Sign In</Button></Link>
                <Link href="/register"><Button variant="primary" size="sm">Register</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
        {/* Section A */}
        <Card variant="elevated">
          <CardHeader><CardTitle>Search Errors</CardTitle></CardHeader>
          <CardBody>
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Machine Name" placeholder="e.g., Tekken 7" value={machineName} onChange={(e) => setMachineName(e.target.value)} />
                <Input label="Error Code" placeholder="e.g., E-001" value={errorCode} onChange={(e) => setErrorCode(e.target.value)} />
              </div>
              <Button variant="primary" onClick={() => runSearch({ machine: machineName, code: errorCode })} loading={loading}>
                Search Errors
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Section B */}
        <Card>
          <CardHeader><CardTitle>Search by Machine Code</CardTitle></CardHeader>
          <CardBody>
            <div className="flex flex-col gap-3">
              <Input label="Machine Code" placeholder="e.g., TK7-001" value={machineCodeInput} onChange={(e) => setMachineCodeInput(e.target.value)} />
              <Button variant="secondary" onClick={() => runSearch({ code: machineCodeInput })}>Find Machine</Button>
            </div>
          </CardBody>
        </Card>

        {/* Results */}
        {error && <Card><CardBody><p className="text-[var(--nx-error)]">{error}</p></CardBody></Card>}

        {loading && <Card><CardBody><p className="text-sm text-[var(--nx-text-muted)]">Searching...</p></CardBody></Card>}

        {!loading && !error && results.length === 0 && (machineName || errorCode || machineCodeInput) && (
          <Card><CardBody><p className="text-sm text-[var(--nx-text-muted)]">No results found.</p></CardBody></Card>
        )}

        {results.map((r) => (
          <Link key={r.id} href={`/errors/${r.id}`}>
            <Card>
              <CardBody>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-lg font-bold text-[var(--nx-primary)]">{r.code}</span>
                  <Badge variant="neutral">{r.machineName} ({r.machineCode})</Badge>
                </div>
                <p className="mt-1 font-semibold text-[var(--nx-text-primary)]">{r.title}</p>
                {r.solution && <p className="mt-1 line-clamp-2 text-sm text-[var(--nx-text-secondary)]">{r.solution}</p>}
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
