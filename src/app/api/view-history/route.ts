import { NextResponse } from "next/server";
import { db } from "@/db";
import { libraryViewHistory, knowledgeArticles, articleContent } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, desc } from "drizzle-orm";

// POST: Article ကို ကြည့်ခဲ့တာ မှတ်တမ်းတင်မယ်
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });

  const { articleId } = await req.json();
  if (!articleId) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    // ရှိပြီးသားလား စစ်
    const existing = await db
      .select()
      .from(libraryViewHistory)
      .where(and(eq(libraryViewHistory.userId, session.user.id), eq(libraryViewHistory.articleId, articleId)))
      .limit(1);

    if (existing.length > 0) {
      // ရှိရင် အချိန်ပြောင်းမယ် (အပေါ်ဆုံးရောက်အောင်)
      await db.update(libraryViewHistory)
        .set({ viewedAt: new Date() })
        .where(eq(libraryViewHistory.id, existing[0].id));
    } else {
      // မရှိရင် အသစ်ထည့်မယ်
      await db.insert(libraryViewHistory).values({ userId: session.user.id, articleId });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// GET: User ရဲ့ ကြည့်ခဲ့တဲ့ History
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: true, data: [] });

  const history = await db
    .select({
      articleId: libraryViewHistory.articleId,
      viewedAt: libraryViewHistory.viewedAt,
      slug: knowledgeArticles.slug,
      category: knowledgeArticles.category,
      coverImageUrl: knowledgeArticles.coverImageUrl,
      title: articleContent.title,
    })
    .from(libraryViewHistory)
    .innerJoin(knowledgeArticles, eq(knowledgeArticles.id, libraryViewHistory.articleId))
    .leftJoin(articleContent, eq(articleContent.articleId, libraryViewHistory.articleId))
    .where(eq(libraryViewHistory.userId, session.user.id))
    .orderBy(desc(libraryViewHistory.viewedAt))
    .limit(10);

  // ထပ်နေတဲ့ articleId တွေ ဖျက်မယ်
  const unique = [];
  const seen = new Set();
  for (const h of history) {
    if (!seen.has(h.articleId)) {
      seen.add(h.articleId);
      unique.push(h);
    }
  }

  return NextResponse.json({ ok: true, data: unique });
}
