import { NextResponse } from "next/server";
import { db } from "@/db";
import { machines, errorCodes, knowledgeArticles, homepageConfig, errorContent } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
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

    const [lastErrorContent] = await db
      .select({ updatedAt: errorContent.updatedAt })
      .from(errorContent)
      .orderBy(desc(errorContent.updatedAt))
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

    const timestamps = [
      lastMachine?.updatedAt,
      lastError?.updatedAt,
      lastErrorContent?.updatedAt,
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
