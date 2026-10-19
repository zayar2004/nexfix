import { NextResponse } from "next/server";
import { db } from "@/db";
import { errorCodes, errorContent, machines } from "@/db/schema";
import { auth } from "@/auth";
import { z } from "zod";
import { eq } from "drizzle-orm";

const schema = z.object({
  machineId: z.string().uuid(),
  code: z.string().min(1),
  title: z.string().min(1),
  videoUrl: z.string().url().optional().or(z.literal("")),
  cause: z.string().optional(),
  troubleshooting: z.string().optional(),
  solution: z.string().optional(),
  safety: z.string().optional(),
  notes: z.string().optional(),
});

// GET - Fetch all errors with their content
export async function GET() {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const errors = await db.select().from(errorCodes);
  const contents = await db.select().from(errorContent);
  const machinesList = await db.select().from(machines);

  const data = errors.map((err) => {
    const content = contents.find((c) => c.errorCodeId === err.id && c.locale === "en");
    const machine = machinesList.find((m) => m.id === err.machineId);
    return {
      ...err,
      machineName: machine?.name || "Unknown",
      cause: content?.cause || "",
      troubleshooting: content?.troubleshooting || "",
      solution: content?.solution || "",
      safety: content?.safety || "",
      notes: content?.notes || "",
    };
  });

  return NextResponse.json({ ok: true, data });
}

// POST - Create new error
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ ok: false, error: result.error.issues[0].message }, { status: 400 });

  const { cause, troubleshooting, solution, safety, notes, ...errorData } = result.data;

  const [newError] = await db.insert(errorCodes).values({
    machineId: errorData.machineId,
    code: errorData.code,
    title: errorData.title,
    videoUrl: errorData.videoUrl || null,
  }).returning();

  await db.insert(errorContent).values({
    errorCodeId: newError.id,
    locale: "en",
    cause: cause || null,
    troubleshooting: troubleshooting || null,
    solution: solution || null,
    safety: safety || null,
    notes: notes || null,
  });

  return NextResponse.json({ ok: true, data: newError });
}

// PATCH - Update error
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { id, cause, troubleshooting, solution, safety, notes, ...updateData } = body;

  if (!id) return NextResponse.json({ ok: false, error: "Missing ID" }, { status: 400 });

  // Update error code (excluding id to prevent overwriting)
  const { id: _, ...cleanUpdateData } = updateData;
  await db.update(errorCodes).set(cleanUpdateData).where(eq(errorCodes.id, id));

  // Update or insert error content
  const existing = await db.select().from(errorContent).where(eq(errorContent.errorCodeId, id)).limit(1);
  if (existing.length > 0) {
    await db.update(errorContent).set({
      cause: cause || null,
      troubleshooting: troubleshooting || null,
      solution: solution || null,
      safety: safety || null,
      notes: notes || null,
    }).where(eq(errorContent.errorCodeId, id));
  } else {
    await db.insert(errorContent).values({
      errorCodeId: id,
      locale: "en",
      cause: cause || null,
      troubleshooting: troubleshooting || null,
      solution: solution || null,
      safety: safety || null,
      notes: notes || null,
    });
  }

  return NextResponse.json({ ok: true });
}

// DELETE - Delete error
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || !["senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing ID" }, { status: 400 });

  await db.delete(errorCodes).where(eq(errorCodes.id, id));
  return NextResponse.json({ ok: true });
}
