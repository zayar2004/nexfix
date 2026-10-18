import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { machines, errorCodes, errorContent, knowledgeArticles, articleContent, media, mediaVideos } from "@/db/schema";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Database ကို တစ်ပြိုင်နက်တည်း ခေါ်မယ် (ပိုမြန်တယ်)
    const [
      allMachines,
      allErrorCodes,
      allContents,
      allArticles,
      allArticleContents,
      allMedia,
      allVideos
    ] = await Promise.all([
      db.select().from(machines).where(eq(machines.status, "published")),
      db.select().from(errorCodes).where(eq(errorCodes.status, "published")),
      db.select().from(errorContent),
      db.select().from(knowledgeArticles).where(eq(knowledgeArticles.status, "published")),
      db.select().from(articleContent),
      db.select().from(media).where(eq(media.status, "approved")),
      db.select().from(mediaVideos)
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        machines: allMachines,
        errorCodes: allErrorCodes,
        errorContents: allContents,
        articles: allArticles,
        articleContents: allArticleContents,
        media: allMedia,
        mediaVideos: allVideos,
        lastSyncedAt: Date.now(),
      },
    });
  } catch (error) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ ok: false, error: "Sync failed" }, { status: 500 });
  }
}
