import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { auth } from "@/auth";
import { eq, or, isNull, desc, and } from "drizzle-orm";

// GET - Fetch notifications for current user + global notifications
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const data = await db.select().from(notifications)
    .where(or(eq(notifications.userId, session.user.id), isNull(notifications.userId)))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return NextResponse.json({ ok: true, data });
}

// PATCH - Mark as read
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, markAll } = body;

  if (markAll) {
    await db.update(notifications)
      .set({ isRead: true })
      .where(or(eq(notifications.userId, session.user.id), isNull(notifications.userId)));
  } else if (id) {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  return NextResponse.json({ ok: true });
}

// DELETE - Clear all or one
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    await db.delete(notifications).where(and(eq(notifications.id, id), eq(notifications.userId, session.user.id)));
  } else {
    await db.delete(notifications).where(eq(notifications.userId, session.user.id));
  }

  return NextResponse.json({ ok: true });
}
