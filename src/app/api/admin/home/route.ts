import { NextResponse } from "next/server";
import { db } from "@/db";
import { homepageConfig } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") || "en";

  const config = await db.select().from(homepageConfig).where(eq(homepageConfig.locale, locale)).limit(1);
  return NextResponse.json({ ok: true, config: config[0] || null });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { locale, ...data } = body;

  const existing = await db.select().from(homepageConfig).where(eq(homepageConfig.locale, locale)).limit(1);

  // Replace empty strings with null to avoid showing default values
  Object.keys(data).forEach(key => {
    if (data[key] === "") data[key] = null;
  });

  if (existing.length > 0) {
    await db.update(homepageConfig).set(data).where(eq(homepageConfig.locale, locale));
  } else {
    await db.insert(homepageConfig).values({ locale, ...data });
  }

  return NextResponse.json({ ok: true });
}
