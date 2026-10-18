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

// GET: List user's notes (or from local)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const data = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, session.user.id))
    .orderBy(desc(notes.createdAt));
  return NextResponse.json({ ok: true, data });
}

// POST: Create note
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ ok: false, error: result.error.issues[0].message }, { status: 400 });

  const [newNote] = await db.insert(notes).values({
    userId: session.user.id,
    title: result.data.title,
    body: result.data.body || null,
    reminderAt: result.data.reminderAt ? new Date(result.data.reminderAt) : null,
    recurrence: result.data.recurrence,
  }).returning();

  return NextResponse.json({ ok: true, data: newNote });
}

// PATCH: Update note (mark done, edit)
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { id, ...updateData } = body;
  if (!id) return NextResponse.json({ ok: false, error: "Missing ID" }, { status: 400 });

  const [updated] = await db
    .update(notes)
    .set({ ...updateData, updatedAt: new Date() })
    .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)))
    .returning();

  if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, data: updated });
}

// DELETE: Remove note
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing ID" }, { status: 400 });

  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, session.user.id)));
  return NextResponse.json({ ok: true });
}
