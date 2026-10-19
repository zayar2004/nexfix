import { NextResponse } from "next/server";
import { and, eq, ilike, inArray, SQL } from "drizzle-orm";
import { db } from "@/db";
import { machines, errorCodes, errorContent } from "@/db/schema";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const machineName = searchParams.get("machine")?.trim() || "";
    const errorCode = searchParams.get("code")?.trim() || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");

    const machineConditions: SQL[] = [eq(machines.status, "published")];
    if (machineName) machineConditions.push(ilike(machines.name, `%${machineName}%`));

    const machineResults = await db
      .select({ id: machines.id, name: machines.name, code: machines.code })
      .from(machines)
      .where(and(...machineConditions))
      .limit(limit);

    const machineIds = machineResults.map((m) => m.id);
    if (machineIds.length === 0 && (machineName || errorCode)) {
      return NextResponse.json({ ok: true, results: [], total: 0, exactMatch: false });
    }

    let exactMatch = false;
    const errorConditions: SQL[] = [eq(errorCodes.status, "published")];
    if (machineIds.length > 0) errorConditions.push(inArray(errorCodes.machineId, machineIds));

    if (errorCode) {
      const exact = await db
        .select({ id: errorCodes.id })
        .from(errorCodes)
        .where(and(...errorConditions, eq(errorCodes.code, errorCode)))
        .limit(1);
      if (exact.length > 0) {
        exactMatch = true;
        errorConditions.push(eq(errorCodes.code, errorCode));
      } else {
        errorConditions.push(ilike(errorCodes.code, `%${errorCode}%`));
      }
    }

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

    const errorIds = errorResults.map((e) => e.id);
    const contents = errorIds.length > 0
      ? await db.select().from(errorContent).where(inArray(errorContent.errorCodeId, errorIds))
      : [];

    const contentMap = new Map<string, (typeof contents)[0]>();
    for (const c of contents) {
      const existing = contentMap.get(c.errorCodeId);
      if (!existing || c.locale === "my") contentMap.set(c.errorCodeId, c);
    }

    const results = errorResults.map((e) => ({
      ...e,
      cause: contentMap.get(e.id)?.cause || null,
      solution: contentMap.get(e.id)?.solution || null,
      safety: contentMap.get(e.id)?.safety || null,
    }));

    return NextResponse.json({ ok: true, results, total: results.length, exactMatch });
  } catch (error: unknown) {
    console.error("Search API Error:", error);
    
    // Catch connection reset errors specifically
    if (typeof error === 'object' && error !== null && (('code' in error && error.code === 'ECONNRESET') || ('cause' in error && typeof error.cause === 'object' && error.cause !== null && 'code' in error.cause && error.cause.code === 'ECONNRESET'))) {
      return NextResponse.json(
        { ok: false, error: "Database connection lost. Please try again." }, 
        { status: 503 } // Service Unavailable
      );
    }
    
    return NextResponse.json({ ok: false, error: "Search failed" }, { status: 500 });
  }
}
