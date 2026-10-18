import { NextResponse } from "next/server";
import { db } from "@/db";
import { knowledgeArticles, articleContent } from "@/db/schema";
import { auth } from "@/auth";
import { z } from "zod";
import { eq } from "drizzle-orm";

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

  const [newArticle] = await db.insert(knowledgeArticles).values({ slug, status: "published" }).returning();

  await db.insert(articleContent).values([
    { articleId: newArticle.id, locale: "en", title: titleEn, body: bodyEn },
    { articleId: newArticle.id, locale: "my", title: titleMy, body: bodyMy },
  ]);

  return NextResponse.json({ ok: true, data: newArticle });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }
  
  const body = await req.json();
  const { id, ...updateData } = body;
  if (!id) return NextResponse.json({ ok: false, error: "Missing ID" }, { status: 400 });

  const { slug, titleEn, titleMy, bodyEn, bodyMy } = updateData;

  // 1. Update article slug
  if (slug) {
    await db.update(knowledgeArticles).set({ slug, updatedAt: new Date() }).where(eq(knowledgeArticles.id, id));
  }

  // 2. Update content (EN)
  if (titleEn && bodyEn) {
    await db.update(articleContent)
      .set({ title: titleEn, body: bodyEn })
      .where(eq(articleContent.articleId, id) && eq(articleContent.locale, "en"));
  }

  // 3. Update content (MY)
  if (titleMy && bodyMy) {
    await db.update(articleContent)
      .set({ title: titleMy, body: bodyMy })
      .where(eq(articleContent.articleId, id) && eq(articleContent.locale, "my"));
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || !["senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing ID" }, { status: 400 });

  // Delete article (will cascade to article_content)
  await db.delete(knowledgeArticles).where(eq(knowledgeArticles.id, id));
  return NextResponse.json({ ok: true });
}
