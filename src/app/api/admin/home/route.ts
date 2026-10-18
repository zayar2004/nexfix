import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { homepageConfig } from "@/db/schema";
import { auth } from "@/auth";

// GET: Fetch current config (for Admin editor)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";

    const [config] = await db
      .select()
      .from(homepageConfig)
      .where(eq(homepageConfig.locale, locale))
      .limit(1);

    return NextResponse.json({ ok: true, config: config || null });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

// POST: Save or Update config
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { locale, heroHeading, heroDescription, heroImageUrl, isPublished } = body;

    if (!locale || !heroHeading || !heroDescription || !heroImageUrl) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(homepageConfig)
      .where(eq(homepageConfig.locale, locale))
      .limit(1);

    if (existing.length > 0) {
      // Update
      await db
        .update(homepageConfig)
        .set({ heroHeading, heroDescription, heroImageUrl, isPublished, updatedAt: new Date() })
        .where(eq(homepageConfig.locale, locale));
    } else {
      // Insert
      await db.insert(homepageConfig).values({
        locale, heroHeading, heroDescription, heroImageUrl, isPublished,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
