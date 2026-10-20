import { NextResponse } from "next/server";
import { and, eq, ilike, inArray, or, SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  machines,
  errorCodes,
  media,
  mediaVideos,
  knowledgeArticles,
  articleContent,
} from "@/db/schema";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const machineName = searchParams.get("machine")?.trim() || "";
    const errorCode = searchParams.get("code")?.trim() || "";
    const q = searchParams.get("q")?.trim() || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");

    const S3_URL = process.env.NEXT_PUBLIC_S3_URL || "";

    // ===== PART A: ERROR SEARCH (existing logic) =====
    let targetMachineIds: string[] | null = null;

    if (machineName) {
      const matchedMachines = await db
        .select({ id: machines.id })
        .from(machines)
        .where(and(eq(machines.status, "published"), ilike(machines.name, `%${machineName}%`)));

      if (matchedMachines.length === 0) {
        // No machine match, but still check articles if q is present
        targetMachineIds = [];
      } else {
        targetMachineIds = matchedMachines.map((m) => m.id);
      }
    }

    const errorConditions: SQL[] = [eq(errorCodes.status, "published")];
    if (targetMachineIds && targetMachineIds.length > 0) {
      errorConditions.push(inArray(errorCodes.machineId, targetMachineIds));
    }

    let exactMatch = false;
    if (errorCode) {
      const exactCheck = await db
        .select({ id: errorCodes.id })
        .from(errorCodes)
        .where(and(...errorConditions, eq(errorCodes.code, errorCode)))
        .limit(1);

      if (exactCheck.length > 0) {
        exactMatch = true;
        errorConditions.push(eq(errorCodes.code, errorCode));
      } else {
        errorConditions.push(ilike(errorCodes.code, `%${errorCode}%`));
      }
    }

    let errorResults: any[] = [];
    // Only run error query if we have some filter (machine or code)
    if (machineName || errorCode) {
      if (!(targetMachineIds && targetMachineIds.length === 0)) {
        errorResults = await db
          .select({
            id: errorCodes.id,
            code: errorCodes.code,
            title: errorCodes.title,
            machineId: errorCodes.machineId,
            machineName: machines.name,
            machineCode: machines.code,
          })
          .from(errorCodes)
          .innerJoin(machines, eq(machines.id, errorCodes.machineId))
          .where(and(...errorConditions))
          .limit(limit)
          .offset(offset);
      }
    }

    const errorIds = errorResults.map((e) => e.id);
    let allMedia: any[] = [];
    let allVideos: any[] = [];

    if (errorIds.length > 0) {
      allMedia = await db.select().from(media).where(inArray(media.ownerId, errorIds));
      allVideos = await db.select().from(mediaVideos).where(inArray(mediaVideos.ownerId, errorIds));
    }

    const errorResultsWithMedia = errorResults.map((err) => {
      const errMedia = allMedia
        .filter((m) => m.ownerId === err.id)
        .map((m) => ({
          id: m.id,
          url: m.storageKey.startsWith("http") ? m.storageKey : `${S3_URL}/${m.storageKey}`,
          mime: m.mime,
        }));

      const errVideos = allVideos
        .filter((v) => v.ownerId === err.id)
        .map((v) => ({
          id: v.id,
          url: v.youtubeUrl,
          title: v.title,
        }));

      return {
        ...err,
        type: "error" as const,
        media: errMedia,
        videos: errVideos,
      };
    });

    // ===== PART B: ARTICLE SEARCH (new) =====
    let articleResults: any[] = [];
    if (q) {
      const matchedArticles = await db
        .select({
          id: knowledgeArticles.id,
          slug: knowledgeArticles.slug,
          category: knowledgeArticles.category,
          coverImageUrl: knowledgeArticles.coverImageUrl,
          title: articleContent.title,
          summary: articleContent.summary,
        })
        .from(knowledgeArticles)
        .innerJoin(articleContent, eq(articleContent.articleId, knowledgeArticles.id))
        .where(
          and(
            eq(knowledgeArticles.status, "published"),
            or(
              ilike(articleContent.title, `%${q}%`),
              ilike(articleContent.summary, `%${q}%`),
              ilike(articleContent.body, `%${q}%`),
              ilike(knowledgeArticles.category, `%${q}%`)
            )
          )
        )
        .limit(limit)
        .offset(offset);

      articleResults = matchedArticles.map((a) => ({
        ...a,
        type: "article" as const,
        coverImageUrl: a.coverImageUrl
          ? a.coverImageUrl.startsWith("http")
            ? a.coverImageUrl
            : `${S3_URL}/${a.coverImageUrl}`
          : null,
      }));
    }

    // ===== COMBINE RESULTS (errors first, then articles) =====
    const combined = [...errorResultsWithMedia, ...articleResults];

    return NextResponse.json({
      ok: true,
      results: combined,
      total: combined.length,
      exactMatch,
    });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ ok: false, error: "Search failed" }, { status: 500 });
  }
}
