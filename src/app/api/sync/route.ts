import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { machines, errorCodes, errorContent, knowledgeArticles, articleContent, media, mediaVideos, homepageConfig } from "@/db/schema";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [
      allMachines,
      allErrorCodes,
      allContents,
      allArticles,
      allArticleContents,
      allMedia,
      allVideos,
      allHomepage
    ] = await Promise.all([
      db.select().from(machines).where(eq(machines.status, "published")),
      db.select().from(errorCodes).where(eq(errorCodes.status, "published")),
      db.select().from(errorContent),
      db.select().from(knowledgeArticles).where(eq(knowledgeArticles.status, "published")),
      db.select().from(articleContent),
      db.select().from(media).where(eq(media.status, "approved")),
      db.select().from(mediaVideos),
      db.select().from(homepageConfig).where(eq(homepageConfig.isPublished, "published"))
    ]);

    const S3_URL = process.env.NEXT_PUBLIC_S3_URL || "";
    
    // All Media တွေကို URL ပါ ထည့်မယ်
    const mediaWithUrls = allMedia.map(m => ({
      ...m,
      url: m.storageKey.startsWith("http") ? m.storageKey : `${S3_URL}/${m.storageKey}`,
    }));

    // Article Media တွေကို သီးသန့် ခွဲထုတ်မယ်
    const articleMedia = allMedia
      .filter(m => m.ownerType === "article")
      .map(m => ({
        ...m,
        url: m.storageKey.startsWith("http") ? m.storageKey : `${S3_URL}/${m.storageKey}`
      }));

    const homepageMy = allHomepage.find(h => h.locale === "my");
    const homepageEn = allHomepage.find(h => h.locale === "en");
    const homepage = homepageEn || homepageMy || null;

    // Stats for Quick Stats
    const stats = {
      totalErrors: allErrorCodes.length,
      totalMachines: allMachines.length,
      totalArticles: allArticles.length,
    };

    return NextResponse.json({
      ok: true,
      data: {
        machines: allMachines,
        errorCodes: allErrorCodes,
        errorContents: allContents,
        articles: allArticles,
        articleContents: allArticleContents,
        media: mediaWithUrls,
        mediaVideos: allVideos,
        articleMedia: articleMedia,
        homepage,
        stats,
        lastSyncedAt: Date.now(),
      },
    });
  } catch (error) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ ok: false, error: "Sync failed" }, { status: 500 });
  }
}
