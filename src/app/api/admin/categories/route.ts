import { NextResponse } from "next/server";
import { db } from "@/db";
import { libraryCategories } from "@/db/schema";
import { auth } from "@/auth";
import { eq, asc } from "drizzle-orm";

// GET: Categories အားလုံး
export async function GET() {
  const categories = await db.select().from(libraryCategories).orderBy(asc(libraryCategories.sortOrder));
  return NextResponse.json({ ok: true, data: categories });
}

// POST: Category အသစ်
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role as string)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { name, slug, description, icon, sortOrder } = await req.json();
  if (!name || !slug) return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });

  try {
    await db.insert(libraryCategories).values({ name, slug, description, icon, sortOrder });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}

// DELETE: Category ဖျက်
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || !["senior_admin", "super_admin"].includes(session.user.role as string)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing ID" }, { status: 400 });

  await db.delete(libraryCategories).where(eq(libraryCategories.id, id));
  return NextResponse.json({ ok: true });
}
