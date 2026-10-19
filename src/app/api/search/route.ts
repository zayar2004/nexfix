import { NextResponse } from "next/server";
import { and, eq, ilike, inArray, SQL } from "drizzle-orm";
import { db } from "@/db";
import { machines, errorCodes, media, mediaVideos } from "@/db/schema";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const machineName = searchParams.get("machine")?.trim() || "";
    const errorCode = searchParams.get("code")?.trim() || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");

    // --- 1. Machine Condition ---
    let targetMachineIds: string[] | null = null;
    
    if (machineName) {
      // Find machines matching the name
      const matchedMachines = await db
        .select({ id: machines.id })
        .from(machines)
        .where(and(eq(machines.status, "published"), ilike(machines.name, `%${machineName}%`)));

      if (matchedMachines.length === 0) {
        // If machine name provided but no machine found, return empty
        return NextResponse.json({ ok: true, results: [], total: 0, exactMatch: false });
      }
      
      targetMachineIds = matchedMachines.map(m => m.id);
    }

    // --- 2. Error Code Condition ---
    const errorConditions: SQL[] = [eq(errorCodes.status, "published")];
    
    if (targetMachineIds) {
      errorConditions.push(inArray(errorCodes.machineId, targetMachineIds));
    }

    let exactMatch = false;
    if (errorCode) {
      // Check for exact match first
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

    // --- 3. Fetch Errors ---
    const errorResults = await db
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

    // --- 4. Fetch Media ---
    const errorIds = errorResults.map((e) => e.id);
    let allMedia: any[] = [];
    let allVideos: any[] = [];

    if (errorIds.length > 0) {
      allMedia = await db.select().from(media).where(inArray(media.ownerId, errorIds));
      allVideos = await db.select().from(mediaVideos).where(inArray(mediaVideos.ownerId, errorIds));
    }

    const S3_URL = process.env.NEXT_PUBLIC_S3_URL || "";

    // --- 5. Combine Results ---
    const resultsWithMedia = errorResults.map((err) => {
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
        media: errMedia,
        videos: errVideos,
      };
    });

    return NextResponse.json({ 
      ok: true, 
      results: resultsWithMedia, 
      total: resultsWithMedia.length, 
      exactMatch 
    });

  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ ok: false, error: "Search failed" }, { status: 500 });
  }
}
