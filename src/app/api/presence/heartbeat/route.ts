import { NextResponse } from "next/server";
import { db } from "@/db";
import { presence } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: true, message: "Guest - not tracked" });
    }

    // Upsert: Insert or Update heartbeat
    const existing = await db
      .select()
      .from(presence)
      .where(eq(presence.userId, session.user.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(presence)
        .set({ lastHeartbeat: new Date() })
        .where(eq(presence.userId, session.user.id));
    } else {
      await db.insert(presence).values({ userId: session.user.id });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
