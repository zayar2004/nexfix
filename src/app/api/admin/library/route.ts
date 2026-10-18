import { NextResponse } from "next/server";
import { db } from "@/db";
import { knowledgeArticles, articleContent } from "@/db/schema";
import { auth } from "@/auth";
import { z } from "zod";

const schema = z.object({
  slug: z.string().min(1),
  titleEn: z.string().min(1),
  titleMy: z.string().min(1),
  bodyEn: z.string().min(1),
  bodyMy: z.string().min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }
  const data = await db.select().from(knowledgeArticles);
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ ok: false, error: result.error.issues[0].message }, { status: 400 });

  const { slug, titleEn, titleMy, bodyEn, bodyMy } = result.data;

  // 1. Insert Article
  const [newArticle] = await db.insert(knowledgeArticles).values({ slug, status: "published" }).returning();

  // 2. Insert Content (EN + MY)
  await db.insert(articleContent).values([
    { articleId: newArticle.id, locale: "en", title: titleEn, body: bodyEn },
    { articleId: newArticle.id, locale: "my", title: titleMy, body: bodyMy },
  ]);

  return NextResponse.json({ ok: true, data: newArticle });
}
