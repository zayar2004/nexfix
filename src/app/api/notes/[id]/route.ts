import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// GET — Note တစ်ခုကို ဆွဲထုတ်မယ်
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)))
    .limit(1);

  if (!note) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: note });
}

// PATCH — Note ကို ပြင်မယ်
const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().nullable().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  reminderEnabled: z.boolean().optional(),
  reminderAt: z.string().nullable().optional(),
  reminderIntervalMinutes: z.number().min(1).max(1440).optional(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly", "yearly"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const result = patchSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ ok: false, error: result.error.issues[0].message }, { status: 400 });
  }

  const updates: Record<string, any> = { ...result.data };
  
  if (updates.reminderAt) {
    updates.reminderAt = new Date(updates.reminderAt);
  }
  updates.updatedAt = new Date();

  try {
    const [updated] = await db
      .update(notes)
      .set(updates)
      .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Failed to update" }, { status: 500 });
  }
}

// DELETE — Note ကို ဖျက်မယ်
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)));

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Failed to delete" }, { status: 500 });
  }
}
