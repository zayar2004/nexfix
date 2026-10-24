import { NextResponse } from "next/server";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().optional().nullable(),
  reminderAt: z.string().datetime().optional().nullable(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly", "yearly"]).optional().default("none"),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional().default("normal"),
  reminderEnabled: z.boolean().optional().default(true),
  reminderIntervalMinutes: z.number().int().min(1).max(1440).optional().default(15),
  timezone: z.string().optional().default("Asia/Yangon"),
  imageUrls: z.array(z.string()).optional().default([]),
});

const patchSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  body: z.string().optional().nullable(),
  reminderAt: z.string().datetime().optional().nullable(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly", "yearly"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  reminderEnabled: z.boolean().optional(),
  reminderIntervalMinutes: z.number().int().min(1).max(1440).optional(),
  reminderStatus: z.enum(["pending", "paused", "done", "skipped"]).optional(),
  isCompleted: z.boolean().optional(),
  nextReminderAt: z.string().datetime().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
  imageUrls: z.array(z.string()).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const userNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, session.user.id))
    .orderBy(desc(notes.createdAt));

  return NextResponse.json({ ok: true, data: userNotes });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = createSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ ok: false, error: result.error.issues[0].message }, { status: 400 });
  }

  const data = result.data;
  try {
    let nextReminderAt: Date | null = null;
    if (data.reminderEnabled && data.reminderAt) {
      nextReminderAt = new Date(data.reminderAt);
    }

    const [newNote] = await db
      .insert(notes)
      .values({
        userId: session.user.id,
        title: data.title,
        body: data.body || null,
        reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
        recurrence: data.recurrence || "none",
        priority: data.priority || "normal",
        reminderEnabled: data.reminderEnabled ?? true,
        reminderIntervalMinutes: String(data.reminderIntervalMinutes || 15),
        timezone: data.timezone || "Asia/Yangon",
        nextReminderAt,
        reminderStatus: "pending",
        imageUrls: data.imageUrls || [],
      })
      .returning();

    return NextResponse.json({ ok: true, data: newNote });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json({ ok: false, error: "Failed to create" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ ok: false, error: result.error.issues[0].message }, { status: 400 });
  }

  const { id, ...updates } = result.data;
  const data: Record<string, any> = { ...updates, updatedAt: new Date() };
  
  if (updates.reminderAt) data.reminderAt = new Date(updates.reminderAt);
  if (updates.nextReminderAt) data.nextReminderAt = new Date(updates.nextReminderAt);
  if (updates.completedAt) data.completedAt = new Date(updates.completedAt);
  if (updates.isCompleted) data.completedAt = new Date();

  try {
    const [updated] = await db
      .update(notes)
      .set(data)
      .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  try {
    await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, session.user.id)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Failed to delete" }, { status: 500 });
  }
}
