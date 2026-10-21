import { NextResponse } from "next/server";
import { db } from "@/db";
import { libraryPageConfig } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";

// GET: Config ကို ယူမယ်
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") || "en";

  const [config] = await db
    .select()
    .from(libraryPageConfig)
    .where(eq(libraryPageConfig.locale, locale))
    .limit(1);

  return NextResponse.json({ ok: true, data: config || null });
}

// POST: Config ကို save/update လုပ်မယ်
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role as string)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { locale, pageTitle, pageSubtitle, heroLabel, heroTitle, heroDescription, heroCtaText, searchPlaceholder, categoriesTitle, machineFilterTitle, recentlyViewedTitle, popularTitle } = body;

  if (!locale) return NextResponse.json({ ok: false, error: "Missing locale" }, { status: 400 });

  try {
    const existing = await db
      .select()
      .from(libraryPageConfig)
      .where(eq(libraryPageConfig.locale, locale))
      .limit(1);

    const values = {
      locale,
      pageTitle: pageTitle || "Knowledge Library",
      pageSubtitle: pageSubtitle || "Find solutions. Keep machines running.",
      heroLabel: heroLabel || "TECHNICAL KNOWLEDGE",
      heroTitle: heroTitle || "Find Solutions. Keep Machines Running.",
      heroDescription: heroDescription || "Explore error codes, repair guides, machine manuals, and video tutorials.",
      heroCtaText: heroCtaText || "Explore Library",
      searchPlaceholder: searchPlaceholder || "Search machines, error codes, solutions...",
      categoriesTitle: categoriesTitle || "Browse Categories",
      machineFilterTitle: machineFilterTitle || "Filter by Machine",
      recentlyViewedTitle: recentlyViewedTitle || "Recently Viewed",
      popularTitle: popularTitle || "Popular Resources",
      heroImages: body.heroImages || null,
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      await db.update(libraryPageConfig).set(values).where(eq(libraryPageConfig.id, existing[0].id));
    } else {
      await db.insert(libraryPageConfig).values(values);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Failed to save" }, { status: 500 });
  }
}
