import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { machines, errorCodes, errorContent, knowledgeArticles, articleContent, media, mediaVideos } from "@/db/schema";

export async function GET() {
  try {
    const allMachines = await db.select().from(machines).where(eq(machines.status, "published"));
    const allErrorCodes = await db.select().from(errorCodes).where(eq(errorCodes.status, "published"));
    const allContents = await db.select().from(errorContent);
    const allArticles = await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.status, "published"));
    const allArticleContents = await db.select().from(articleContent);
    const allMedia = await db.select().from(media).where(eq(media.status, "approved"));
    const allVideos = await db.select().from(mediaVideos);

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
