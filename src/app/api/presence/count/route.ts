import { NextResponse } from "next/server";
import { db } from "@/db";
import { presence } from "@/db/schema";
import { gte, count } from "drizzle-orm";

export async function GET() {
  try {
    // Count users who had a heartbeat in the last 90 seconds
    const ninetySecondsAgo = new Date(Date.now() - 90 * 1000);
    
    const [result] = await db
      .select({ count: count() })
      .from(presence)
      .where(gte(presence.lastHeartbeat, ninetySecondsAgo));

    return NextResponse.json({ ok: true, count: Number(result?.count || 0) });
  } catch {
    return NextResponse.json({ ok: true, count: 0 });
  }
}
