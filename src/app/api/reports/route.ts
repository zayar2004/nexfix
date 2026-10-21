import { NextResponse } from "next/server";
import { db } from "@/db";
import { libraryContentReports } from "@/db/schema";
import { auth } from "@/auth";
import { desc } from "drizzle-orm";

// POST: User က Report တင်ခြင်း
export async function POST(req: Request) {
  const session = await auth();
  const { articleId, reason, description } = await req.json();

  if (!articleId || !reason) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  try {
    await db.insert(libraryContentReports).values({
      articleId,
      userId: session?.user?.id || null,
      reason,
      description: description || null,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Failed to submit report" }, { status: 500 });
  }
}

// GET: Admin က Report တွေကို ကြည့်ခြင်း
export async function GET() {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role as string)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const reports = await db
    .select()
    .from(libraryContentReports)
    .orderBy(desc(libraryContentReports.createdAt));

  return NextResponse.json({ ok: true, data: reports });
}
