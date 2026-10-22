import { NextResponse } from "next/server";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { auth } from "@/auth";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";

const schema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().optional(),
  reminderAt: z.string().datetime().optional().nullable(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly", "yearly"]).default("none"),
});

const patchSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().min(1).max(200).optional(),
    body: z.string().optional().nullable(),
    reminderAt: z.string().datetime().optional().nullable(),
    recurrence: z
      .enum(["none", "daily", "weekly", "monthly", "yearly"])
      .optional(),
    isCompleted: z.boolean().optional(),
  })
  .strict();

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  const data = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, session.user.id))
    .orderBy(desc(notes.createdAt));
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const [created] = await db
    .insert(notes)
    .values({
      userId: session.user.id,
      title: parsed.data.title,
      body: parsed.data.body ?? null,
      reminderAt: parsed.data.reminderAt ? new Date(parsed.data.reminderAt) : null,
      recurrence: parsed.data.recurrence,
    })
    .returning();
  return NextResponse.json({ ok: true, data: created });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id, ...updateData } = parsed.data;
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { ok: false, error: "No fields to update" },
      { status: 400 }
    );
  }

  const patch: Record<string, unknown> = { ...updateData, updatedAt: new Date() };
  if (patch.reminderAt && typeof patch.reminderAt === "string") {
    patch.reminderAt = new Date(patch.reminderAt);
  }

  const [updated] = await db
    .update(notes)
    .set(patch)
    .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing ID" }, { status: 400 });
  }
  await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)));
  return NextResponse.json({ ok: true });
}
