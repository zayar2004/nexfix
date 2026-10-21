import { NextResponse } from "next/server";
import { db } from "@/db";
import { libraryViewHistory } from "@/db/schema";
import { count, eq } from "drizzle-orm";

// GET: Article တစ်ခုချင်းစီရဲ့ View Count ကို ပြန်ပေးမယ်
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get("articleId");

  try {
    if (articleId) {
      const [result] = await db
        .select({ count: count() })
        .from(libraryViewHistory)
        .where(eq(libraryViewHistory.articleId, articleId));
      return NextResponse.json({ ok: true, count: Number(result?.count || 0) });
    }

    // Article အားလုံးအတွက် Count
    const all = await db
      .select({ articleId: libraryViewHistory.articleId, count: count() })
      .from(libraryViewHistory)
      .groupBy(libraryViewHistory.articleId);
    
    return NextResponse.json({ ok: true, data: all });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}
