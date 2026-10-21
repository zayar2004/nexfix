import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminAuditLogs } from "@/db/schema";
import { auth } from "@/auth";
import { desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user || !["senior_admin", "super_admin"].includes(session.user.role as string)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const logs = await db
    .select()
    .from(adminAuditLogs)
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(100);

  return NextResponse.json({ ok: true, data: logs });
}
