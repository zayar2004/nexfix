import { NextResponse } from "next/server";
import { db } from "@/db";
import { libraryBookmarks, knowledgeArticles, articleContent } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";

// GET: User ရဲ့ Bookmarks တွေကို ယူမယ်
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const bookmarks = await db
    .select({
      id: libraryBookmarks.id,
      articleId: libraryBookmarks.articleId,
      slug: knowledgeArticles.slug,
      category: knowledgeArticles.category,
      coverImageUrl: knowledgeArticles.coverImageUrl,
    })
    .from(libraryBookmarks)
    .innerJoin(knowledgeArticles, eq(knowledgeArticles.id, libraryBookmarks.articleId))
    .where(eq(libraryBookmarks.userId, session.user.id));

  return NextResponse.json({ ok: true, data: bookmarks });
}

// POST: Bookmark အသစ် ထည့်/ဖျက်
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { articleId } = await req.json();
  if (!articleId) return NextResponse.json({ ok: false, error: "Missing articleId" }, { status: 400 });

  // ရှိပြီးသားလား စစ်
  const existing = await db
    .select()
    .from(libraryBookmarks)
    .where(and(eq(libraryBookmarks.userId, session.user.id), eq(libraryBookmarks.articleId, articleId)))
    .limit(1);

  if (existing.length > 0) {
    // ရှိရင် ဖျက်
    await db.delete(libraryBookmarks).where(eq(libraryBookmarks.id, existing[0].id));
    return NextResponse.json({ ok: true, action: "removed" });
  } else {
    // မရှိရင် ထည့်
    await db.insert(libraryBookmarks).values({ userId: session.user.id, articleId });
    return NextResponse.json({ ok: true, action: "added" });
  }
}
