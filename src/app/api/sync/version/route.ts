import { NextResponse } from "next/server";
import { db } from "@/db";
import { machines, errorCodes, knowledgeArticles, homepageConfig } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // နောက်ဆုံး Update ဖြစ်တဲ့ အချိန်ကို စစ်မယ်
    const [lastMachine] = await db
      .select({ updatedAt: machines.updatedAt })
      .from(machines)
      .orderBy(desc(machines.updatedAt))
      .limit(1);

    const [lastError] = await db
      .select({ updatedAt: errorCodes.updatedAt })
      .from(errorCodes)
      .orderBy(desc(errorCodes.updatedAt))
      .limit(1);

    const [lastArticle] = await db
      .select({ updatedAt: knowledgeArticles.updatedAt })
      .from(knowledgeArticles)
      .orderBy(desc(knowledgeArticles.updatedAt))
      .limit(1);

    const [lastHome] = await db
      .select({ updatedAt: homepageConfig.updatedAt })
      .from(homepageConfig)
      .orderBy(desc(homepageConfig.updatedAt))
      .limit(1);

    // အားလုံးထဲက အသစ်ဆုံး Timestamp ကို ယူမယ်
    const timestamps = [
      lastMachine?.updatedAt,
      lastError?.updatedAt,
      lastArticle?.updatedAt,
      lastHome?.updatedAt,
    ].filter(Boolean).map((t) => new Date(t!).getTime());

    const lastUpdated = timestamps.length > 0 ? Math.max(...timestamps) : 0;

    return NextResponse.json({ ok: true, lastUpdated });
  } catch (err) {
    console.error("Version check error:", err);
    return NextResponse.json({ ok: false, lastUpdated: 0 });
  }
}
