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
      title: articleContent.title,
    })
    .from(libraryBookmarks)
    .innerJoin(knowledgeArticles, eq(knowledgeArticles.id, libraryBookmarks.articleId))
    .leftJoin(articleContent, eq(articleContent.articleId, libraryBookmarks.articleId))
    .where(eq(libraryBookmarks.userId, session.user.id));

  // Article တစ်ခုတည်းအတွက် content နှစ်ခုရှိရင် (en/my) ပထမတစ်ခုကိုပဲ ယူမယ်
  const uniqueBookmarks = [];
  const seen = new Set();
  for (const b of bookmarks) {
    if (!seen.has(b.articleId)) {
      seen.add(b.articleId);
      uniqueBookmarks.push(b);
    }
  }

  return NextResponse.json({ ok: true, data: uniqueBookmarks });
}

// POST: Bookmark အသစ် ထည့်/ဖျက်
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { articleId } = await req.json();
  if (!articleId) return NextResponse.json({ ok: false, error: "Missing articleId" }, { status: 400 });

  const existing = await db
    .select()
    .from(libraryBookmarks)
    .where(and(eq(libraryBookmarks.userId, session.user.id), eq(libraryBookmarks.articleId, articleId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(libraryBookmarks).where(eq(libraryBookmarks.id, existing[0].id));
    return NextResponse.json({ ok: true, action: "removed" });
  } else {
    await db.insert(libraryBookmarks).values({ userId: session.user.id, articleId });
    return NextResponse.json({ ok: true, action: "added" });
  }
}
