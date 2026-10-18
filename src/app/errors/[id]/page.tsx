import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { errorCodes, errorContent, machines } from "@/db/schema";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

export default async function ErrorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [result] = await db
    .select({
      id: errorCodes.id,
      code: errorCodes.code,
      title: errorCodes.title,
      machineName: machines.name,
      machineCode: machines.code,
      status: errorCodes.status,
    })
    .from(errorCodes)
    .innerJoin(machines, eq(machines.id, errorCodes.machineId))
    .where(eq(errorCodes.id, id))
    .limit(1);

  if (!result || result.status !== "published") notFound();

  const contents = await db.select().from(errorContent).where(eq(errorContent.errorCodeId, id));

  return (
    <main className="min-h-screen bg-[var(--nx-bg-base)] px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-[var(--nx-primary)] hover:underline">← Back to Search</Link>

        <Card variant="elevated" padding="lg" className="mt-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="info" dot>Error Code</Badge>
              <span className="text-2xl font-mono font-bold text-[var(--nx-primary)]">{result.code}</span>
            </div>
            <CardTitle>{result.title}</CardTitle>
            <p className="text-sm text-[var(--nx-text-secondary)]">
              Machine: <strong>{result.machineName}</strong> ({result.machineCode})
            </p>
          </CardHeader>
        </Card>

        {contents.length === 0 && (
          <Card padding="lg" className="mt-4">
            <CardBody>No detailed information available yet.</CardBody>
          </Card>
        )}

        {contents.map((content) => (
          <Card key={content.id} padding="lg" className="mt-4">
            <CardBody>
              <p className="mb-2 text-xs uppercase tracking-wide text-[var(--nx-text-muted)]">
                Language: {content.locale}
              </p>
              {content.safety && (
                <div className="mb-4 rounded-[var(--nx-radius-md)] border border-[var(--nx-warning)]/30 bg-[var(--nx-warning)]/10 p-3">
                  <p className="text-sm font-semibold text-[var(--nx-warning)]">⚠ Safety</p>
                  <p className="mt-1 text-sm text-[var(--nx-text-primary)]">{content.safety}</p>
                </div>
              )}
              {content.cause && (
                <section className="mb-4">
                  <h3 className="font-semibold text-[var(--nx-text-primary)]">Cause</h3>
                  <p className="mt-1 text-sm text-[var(--nx-text-secondary)] whitespace-pre-wrap">{content.cause}</p>
                </section>
              )}
              {content.troubleshooting && (
                <section className="mb-4">
                  <h3 className="font-semibold text-[var(--nx-text-primary)]">Troubleshooting</h3>
                  <p className="mt-1 text-sm text-[var(--nx-text-secondary)] whitespace-pre-wrap">{content.troubleshooting}</p>
                </section>
              )}
              {content.solution && (
                <section className="mb-4">
                  <h3 className="font-semibold text-[var(--nx-success)]">Solution</h3>
                  <p className="mt-1 text-sm text-[var(--nx-text-secondary)] whitespace-pre-wrap">{content.solution}</p>
                </section>
              )}
              {content.notes && (
                <section>
                  <h3 className="font-semibold text-[var(--nx-text-primary)]">Notes</h3>
                  <p className="mt-1 text-sm text-[var(--nx-text-secondary)] whitespace-pre-wrap">{content.notes}</p>
                </section>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </main>
  );
}
