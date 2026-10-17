"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <main className="min-h-screen bg-[var(--nx-bg-base)]">
      <header className="sticky top-0 z-10 border-b border-[var(--nx-border)] bg-[var(--nx-bg-surface)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-[var(--nx-primary)]">NEXFIX</h1>
            <p className="text-xs text-[var(--nx-text-muted)]">Diagnose. Repair. Connect.</p>
          </div>
          <div className="flex items-center gap-2">
            {status === "authenticated" && session?.user ? (
              <>
                <Badge variant="success" dot>{session.user.email}</Badge>
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

      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>
              {status === "authenticated" ? `Welcome, ${session.user.name || session.user.email}!` : "Welcome to NEXFIX"}
            </CardTitle>
          </CardHeader>
          <CardBody>
            {status === "authenticated" ? (
              <div className="flex flex-col gap-2">
                <p>You are signed in successfully.</p>
                <div className="flex flex-col gap-1 text-xs">
                  <p>User ID: <code className="text-[var(--nx-primary)]">{session.user.id}</code></p>
                  <p>Role: <Badge variant="info" dot>{session.user.role}</Badge></p>
                </div>
              </div>
            ) : (
              <p>Please sign in or register to access all features.</p>
            )}
          </CardBody>
          <CardFooter>
            {status !== "authenticated" && (
              <Link href="/register"><Button variant="primary">Get Started</Button></Link>
            )}
          </CardFooter>
        </Card>

        {status === "authenticated" && (
          <Card>
            <CardHeader><CardTitle>Next Steps</CardTitle></CardHeader>
            <CardBody>
              <ul className="list-disc pl-4 text-sm">
                <li>Phase 3: Home Search (Local Database)</li>
                <li>Phase 4: Knowledge Library</li>
                <li>Phase 5: Private Excel</li>
                <li>Phase 6: Notes & Reminders</li>
                <li>Phase 7: Public Chat</li>
              </ul>
            </CardBody>
          </Card>
        )}
      </div>
    </main>
  );
}
