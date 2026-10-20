import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { homepageConfig } from "@/db/schema";
import { auth } from "@/auth";

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

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { locale, heroHeading, heroDescription, heroImageUrl, heroImages, heroConfig, isPublished } = body;

    if (!locale || !heroHeading || !heroDescription) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const heroImagesJson = Array.isArray(heroImages) && heroImages.length > 0
      ? JSON.stringify(heroImages)
      : null;

    const heroConfigJson = heroConfig ? JSON.stringify(heroConfig) : null;

    const mainImageUrl = heroImageUrl || (Array.isArray(heroImages) && heroImages.length > 0 ? heroImages[0] : null);

    const existing = await db
      .select()
      .from(homepageConfig)
      .where(eq(homepageConfig.locale, locale))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(homepageConfig)
        .set({
          heroHeading,
          heroDescription,
          heroImageUrl: mainImageUrl,
          heroImages: heroImagesJson,
          heroConfig: heroConfigJson,
          isPublished,
          updatedAt: new Date(),
        })
        .where(eq(homepageConfig.locale, locale));
    } else {
      await db.insert(homepageConfig).values({
        locale,
        heroHeading,
        heroDescription,
        heroImageUrl: mainImageUrl,
        heroImages: heroImagesJson,
        heroConfig: heroConfigJson,
        isPublished,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Home API error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
