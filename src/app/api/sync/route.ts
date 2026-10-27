import { NextResponse } from "next/server";
import { eq, gt, or } from "drizzle-orm";
import { db } from "@/db";
import { machines, errorCodes, errorContent, knowledgeArticles, articleContent, media, mediaVideos, homepageConfig } from "@/db/schema";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { auth } from "@/auth";
import { users } from "@/db/schema";

export async function GET(req: Request) {
  try {
    // User ကို စစ်မယ်
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // User ရဲ့ isApproved ကို စစ်မယ်
    const [user] = await db
      .select({ isApproved: users.isApproved, role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    // Admin/Super Admin ဖြစ်ရင် ချက်ချင်း ခွင့်ပြုမယ်
    const isAdmin = user?.role === "staff" || user?.role === "senior_admin" || user?.role === "super_admin";
    const isApproved = user?.isApproved || isAdmin;

    // Approve မလုပ်ရသေးရင် Data မပို့ဘူး
    if (!isApproved) {
      return NextResponse.json({ ok: true, data: { pendingApproval: true } });
    }

    // ?since= Param ကို ဖတ်
    const { searchParams } = new URL(req.url);
    const sinceParam = searchParams.get("since");
    const sinceDate = sinceParam ? new Date(parseInt(sinceParam)) : null;

    // Query တွေကို ပြင်
    const machinesQuery = db.select().from(machines).where(eq(machines.status, "published"));
    const errorCodesQuery = db.select().from(errorCodes).where(eq(errorCodes.status, "published"));
    const errorContentQuery = db.select().from(errorContent);
    const articlesQuery = db.select().from(knowledgeArticles).where(eq(knowledgeArticles.status, "published"));
    const articleContentQuery = db.select().from(articleContent);
    const mediaQuery = db.select().from(media).where(eq(media.status, "approved"));
    const videosQuery = db.select().from(mediaVideos);
    const homepageQuery = db.select().from(homepageConfig).where(eq(homepageConfig.isPublished, "published"));

    // Incremental Sync — since ရှိရင် Filter
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
      sinceDate
        ? db.select().from(machines).where(
            or(
              gt(machines.updatedAt, sinceDate),
              gt(machines.archivedAt, sinceDate)
            )
          )
        : machinesQuery,
      sinceDate
        ? db.select().from(errorCodes).where(
            or(
              gt(errorCodes.updatedAt, sinceDate),
              gt(errorCodes.archivedAt, sinceDate)
            )
          )
        : errorCodesQuery,
      sinceDate
        ? db.select().from(errorContent).where(gt(errorContent.updatedAt, sinceDate))
        : errorContentQuery,
      sinceDate
        ? db.select().from(knowledgeArticles).where(gt(knowledgeArticles.updatedAt, sinceDate))
        : articlesQuery,
      articleContentQuery,
      mediaQuery,
      videosQuery,
      homepageQuery
    ]);

    // ဖျက်လိုက်တဲ့ Data (archivedAt ပါရင်) ကို သီးသန့် ခွဲ
    const deletedMachines = allMachines.filter(m => m.archivedAt).map(m => m.id);
    const deletedErrorCodes = allErrorCodes.filter(e => e.archivedAt).map(e => e.id);
    const deletedArticles = allArticles.filter(a => (a as any).archivedAt).map(a => a.id);

    // Active Data ပဲ ပြန် (archivedAt မပါ)
    const activeMachines = allMachines.filter(m => !m.archivedAt);
    const activeErrorCodes = allErrorCodes.filter(e => !e.archivedAt);
    const activeArticles = allArticles.filter(a => !(a as any).archivedAt);

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
      totalErrors: activeErrorCodes.length,
      totalMachines: activeMachines.length,
      totalArticles: activeArticles.length,
    };

    // Server Timestamp ကို တွက်ချက်
    const timestamps: number[] = [];
    activeMachines.forEach(m => { if (m.updatedAt) timestamps.push(new Date(m.updatedAt).getTime()); });
    activeErrorCodes.forEach(e => { if (e.updatedAt) timestamps.push(new Date(e.updatedAt).getTime()); });
    allContents.forEach(c => { if (c.updatedAt) timestamps.push(new Date(c.updatedAt).getTime()); });
    activeArticles.forEach(a => { if (a.updatedAt) timestamps.push(new Date(a.updatedAt).getTime()); });

    const lastSyncedAt = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();

    return NextResponse.json({
      ok: true,
      data: {
        machines: activeMachines,
        errorCodes: activeErrorCodes,
        errorContents: allContents,
        articles: activeArticles,
        articleContents: allArticleContents,
        media: mediaWithUrls,
        mediaVideos: allVideos,
        articleMedia: articleMedia,
        homepage,
        stats,
        lastSyncedAt,
        // Tombstone Data
        deleted: {
          machines: deletedMachines,
          errorCodes: deletedErrorCodes,
          articles: deletedArticles,
        },
      },
    });
  } catch (error) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ ok: false, error: "Sync failed" }, { status: 500 });
  }
}
