import { NextResponse } from "next/server";
import { db } from "@/db";
import { presence } from "@/db/schema";
import { gte, count } from "drizzle-orm";

export async function GET() {
  try {
    const ninetySecondsAgo = new Date(Date.now() - 90 * 1000);
    const [result] = await db
      .select({ count: count() })
      .from(presence)
      .where(gte(presence.lastHeartbeat, ninetySecondsAgo));

    // Browser ကို ၅ မိနစ်ကြာ မှတ်ထားခိုင်းမယ် (Database ကို ထပ်ခါထပ်ခါ မမေးတော့ဘူး)
    return NextResponse.json(
      { ok: true, count: Number(result?.count || 0) },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );
  } catch {
    return NextResponse.json({ ok: true, count: 0 });
  }
}
