import { NextResponse } from "next/server";
import { db } from "@/db";
import { knowledgeArticles, articleContent, mediaVideos, notifications, libraryArticleMachines } from "@/db/schema";
import { auth } from "@/auth";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[\w-]{11}([&\?].*)?$/;

const videoSchema = z.object({
  url: z.string().regex(YOUTUBE_REGEX, "Invalid YouTube URL"),
  title: z.string().max(200).optional().default(""),
  order: z.number().int().min(0).optional().default(0),
});

const createSchema = z.object({
  slug: z.string().max(200).optional(),
  titleEn: z.string().min(1).max(300),
  titleMy: z.string().min(1).max(300),
  bodyEn: z.string().min(1),
  bodyMy: z.string().min(1),
  summaryEn: z.string().optional(),
  summaryMy: z.string().optional(),
  type: z.string().max(30).optional().default("article"),
  status: z.enum(["published", "draft", "archived"]).optional().default("published"),
  category: z.string().max(100).optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  galleryImages: z.array(z.string().url()).optional().default([]),
  videos: z.array(videoSchema).optional().default([]),
  machineId: z.string().uuid().optional(),
});

const patchSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).max(200).optional(),
  titleEn: z.string().min(1).max(300).optional(),
  titleMy: z.string().min(1).max(300).optional(),
  bodyEn: z.string().min(1).optional(),
  bodyMy: z.string().min(1).optional(),
  summaryEn: z.string().optional(),
  summaryMy: z.string().optional(),
  type: z.string().max(30).optional(),
  status: z.enum(["published", "draft", "archived"]).optional(),
  category: z.string().max(100).optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  galleryImages: z.array(z.string().url()).optional(),
  videos: z.array(videoSchema).optional(),
  machineId: z.string().uuid().optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (
    !session?.user ||
    !["staff", "senior_admin", "super_admin"].includes(session.user.role as string)
  ) {
    return null;
  }
  return session;
}

async function requireDeleteAdmin() {
  const session = await auth();
  if (
    !session?.user ||
    !["senior_admin", "super_admin"].includes(session.user.role as string)
  ) {
    return null;
  }
  return session;
}

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const [article] = await db
      .select()
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.id, id))
      .limit(1);

    if (!article) {
      return NextResponse.json({ ok: false, error: "Article not found" }, { status: 404 });
    }

    const contents = await db
      .select()
      .from(articleContent)
      .where(eq(articleContent.articleId, id));

    const videos = await db
      .select()
      .from(mediaVideos)
      .where(and(eq(mediaVideos.ownerType, "article"), eq(mediaVideos.ownerId, id)));

    const sortedVideos = videos.sort(
      (a, b) => Number(a.displayOrder) - Number(b.displayOrder)
    );

    const [machineAssoc] = await db
      .select()
      .from(libraryArticleMachines)
      .where(eq(libraryArticleMachines.articleId, id))
      .limit(1);

    return NextResponse.json({
      ok: true,
      data: {
        article: { ...article, machineId: machineAssoc?.machineId || null },
        contents,
        videos: sortedVideos,
      },
    });
  }

  const data = await db.select().from(knowledgeArticles);
  
  // Article တစ်ခုချင်းစီအတွက် Title ကို ဆွဲထုတ်မယ်
  const articlesWithTitles = await Promise.all(data.map(async (article) => {
    const [content] = await db
      .select({ title: articleContent.title })
      .from(articleContent)
      .where(eq(articleContent.articleId, article.id))
      .limit(1);
    return { ...article, title: content?.title || article.slug };
  }));

  return NextResponse.json({ ok: true, data: articlesWithTitles });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const result = createSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const {
    slug: inputSlug, titleEn, titleMy, bodyEn, bodyMy, summaryEn, summaryMy,
    type, status, category, coverImageUrl, videos, machineId
  } = result.data;

  // Slug အလိုအလျောက် ဖန်တီးမယ် (Title ကနေ)
  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const slug = inputSlug || slugify(titleEn) || `article-${Date.now()}`;

  try {
    const newArticle = await db.transaction(async (tx) => {
      const [article] = await tx
        .insert(knowledgeArticles)
        .values({
          slug,
          status: status || "published",
          type: type || "article",
          category: category || null,
          coverImageUrl: coverImageUrl && coverImageUrl !== "" ? coverImageUrl : null,
        })
        .returning();

      await tx.insert(articleContent).values([
        { articleId: article.id, locale: "en", title: titleEn, body: bodyEn, summary: summaryEn || null },
        { articleId: article.id, locale: "my", title: titleMy, body: bodyMy, summary: summaryMy || null },
      ]);

      if (videos && videos.length > 0) {
        await tx.insert(mediaVideos).values(
          videos.map((v, i) => ({
            ownerType: "article",
            ownerId: article.id,
            youtubeUrl: v.url,
            title: v.title || null,
            displayOrder: String(v.order ?? i),
          }))
        );
      }

      if (machineId) {
        await tx.insert(libraryArticleMachines).values({ articleId: article.id, machineId });
      }

      return article;
    });

    await db.insert(notifications).values({
      userId: null,
      type: "article_new",
      title: "New Article Added",
      message: `Knowledge Library မှာ "${titleEn}" ဆိုတဲ့ Article အသစ်တစ်ခု ထည့်သွင်းပြီးပါပြီ။`,
      link: `/library/${newArticle.slug}`,
    });

    return NextResponse.json({ ok: true, data: newArticle });
  } catch (err) {
    console.error("POST /api/admin/library error:", err);
    return NextResponse.json({ ok: false, error: "Failed to create article" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const {
    id, slug, titleEn, titleMy, bodyEn, bodyMy, summaryEn, summaryMy,
    type, status, category, coverImageUrl, videos, machineId
  } = result.data;

  try {
    await db.transaction(async (tx) => {
      const articleUpdate: Record<string, unknown> = { updatedAt: new Date() };
      if (slug !== undefined) articleUpdate.slug = slug;
      if (type !== undefined) articleUpdate.type = type;
      if (status !== undefined) articleUpdate.status = status;
      if (category !== undefined) articleUpdate.category = category || null;
      if (coverImageUrl !== undefined) {
        articleUpdate.coverImageUrl = coverImageUrl && coverImageUrl !== "" ? coverImageUrl : null;
      }
      
      await tx.update(knowledgeArticles).set(articleUpdate).where(eq(knowledgeArticles.id, id));

      // Update English Content
      if (titleEn !== undefined || bodyEn !== undefined || summaryEn !== undefined) {
        const enUpdate: Record<string, unknown> = {};
        if (titleEn !== undefined) enUpdate.title = titleEn;
        if (bodyEn !== undefined) enUpdate.body = bodyEn;
        if (summaryEn !== undefined) enUpdate.summary = summaryEn || null;
        const existingEn = await tx.select().from(articleContent).where(and(eq(articleContent.articleId, id), eq(articleContent.locale, "en"))).limit(1);
        if (existingEn.length > 0) {
          await tx.update(articleContent).set(enUpdate).where(and(eq(articleContent.articleId, id), eq(articleContent.locale, "en")));
        } else if (titleEn && bodyEn) {
          await tx.insert(articleContent).values({ articleId: id, locale: "en", title: titleEn, body: bodyEn, summary: summaryEn || null });
        }
      }

      // Update Myanmar Content
      if (titleMy !== undefined || bodyMy !== undefined || summaryMy !== undefined) {
        const myUpdate: Record<string, unknown> = {};
        if (titleMy !== undefined) myUpdate.title = titleMy;
        if (bodyMy !== undefined) myUpdate.body = bodyMy;
        if (summaryMy !== undefined) myUpdate.summary = summaryMy || null;
        const existingMy = await tx.select().from(articleContent).where(and(eq(articleContent.articleId, id), eq(articleContent.locale, "my"))).limit(1);
        if (existingMy.length > 0) {
          await tx.update(articleContent).set(myUpdate).where(and(eq(articleContent.articleId, id), eq(articleContent.locale, "my")));
        } else if (titleMy && bodyMy) {
          await tx.insert(articleContent).values({ articleId: id, locale: "my", title: titleMy, body: bodyMy, summary: summaryMy || null });
        }
      }

      // Update Videos
      if (videos !== undefined) {
        await tx.delete(mediaVideos).where(and(eq(mediaVideos.ownerType, "article"), eq(mediaVideos.ownerId, id)));
        if (videos.length > 0) {
          await tx.insert(mediaVideos).values(
            videos.map((v, i) => ({
              ownerType: "article", ownerId: id, youtubeUrl: v.url, title: v.title || null, displayOrder: String(v.order ?? i),
            }))
          );
        }
      }

      // Update Machine Association
      if (machineId !== undefined) {
        await tx.delete(libraryArticleMachines).where(eq(libraryArticleMachines.articleId, id));
        if (machineId && machineId !== "") {
          await tx.insert(libraryArticleMachines).values({ articleId: id, machineId });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/admin/library error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await requireDeleteAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing ID" }, { status: 400 });
  }

  try {
    await db.transaction(async (tx) => {
      await tx.delete(mediaVideos).where(and(eq(mediaVideos.ownerType, "article"), eq(mediaVideos.ownerId, id)));
      await tx.delete(libraryArticleMachines).where(eq(libraryArticleMachines.articleId, id));
      await tx.delete(knowledgeArticles).where(eq(knowledgeArticles.id, id));
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/library error:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete article" }, { status: 500 });
  }
}
