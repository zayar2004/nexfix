import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { machines, errorCodes, errorContent } from "@/db/schema";

export async function GET() {
  try {
    // 1. Get all published machines
    const allMachines = await db
      .select()
      .from(machines)
      .where(eq(machines.status, "published"));

    // 2. Get all published error codes
    const allErrorCodes = await db
      .select()
      .from(errorCodes)
      .where(eq(errorCodes.status, "published"));

    // 3. Get all error content
    const allContents = await db.select().from(errorContent);

    return NextResponse.json({
      ok: true,
      data: {
        machines: allMachines,
        errorCodes: allErrorCodes,
        errorContents: allContents,
        lastSyncedAt: Date.now(),
      },
    });
  } catch (error) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ ok: false, error: "Sync failed" }, { status: 500 });
  }
}
