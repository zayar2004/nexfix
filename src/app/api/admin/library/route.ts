import { NextResponse } from "next/server";
import { db } from "@/db";
import { knowledgeArticles, articleContent, mediaVideos, notifications } from "@/db/schema";
import { auth } from "@/auth";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { validateSlug } from "@/lib/slug";

const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[\w-]{11}([&\?].*)?$/;

const videoSchema = z.object({
  url: z.string().regex(YOUTUBE_REGEX, "Invalid YouTube URL"),
  title: z.string().max(200).optional().default(""),
  order: z.number().int().min(0).optional().default(0),
});

const createSchema = z.object({
  slug: z.string().min(1).max(200),
  titleEn: z.string().min(1).max(300),
  titleMy: z.string().min(1).max(300),
  bodyEn: z.string().min(1),
  bodyMy: z.string().min(1),
  summaryEn: z.string().optional(),
  summaryMy: z.string().optional(),
  category: z.string().max(100).optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  galleryImages: z.array(z.string().url()).optional().default([]),
  videos: z.array(videoSchema).optional().default([]),
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
  category: z.string().max(100).optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  galleryImages: z.array(z.string().url()).optional(),
  videos: z.array(videoSchema).optional(),
});

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

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

    return NextResponse.json({
      ok: true,
      data: { article, contents, videos: sortedVideos },
    });
  }

  const data = await db.select().from(knowledgeArticles);
  return NextResponse.json({ ok: true, data });
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

  // Validate slug format
  const slugError = validateSlug(result.data.slug);
  if (slugError) {
    return NextResponse.json({ ok: false, error: slugError }, { status: 400 });
  }

  const {
    slug,
    titleEn,
    titleMy,
    bodyEn,
    bodyMy,
    summaryEn,
    summaryMy,
    category,
    coverImageUrl,
    galleryImages,
    videos,
  } = result.data;

  try {
    const newArticle = await db.transaction(async (tx) => {
      const [article] = await tx
        .insert(knowledgeArticles)
        .values({
          slug,
          status: "published",
          category: category || null,
          coverImageUrl: coverImageUrl && coverImageUrl !== "" ? coverImageUrl : null,
          galleryImages: galleryImages && galleryImages.length > 0 ? JSON.stringify(galleryImages) : null,
        })
        .returning();

      await tx.insert(articleContent).values([
        {
          articleId: article.id,
          locale: "en",
          title: titleEn,
          body: bodyEn,
          summary: summaryEn || null,
        },
        {
          articleId: article.id,
          locale: "my",
          title: titleMy,
          body: bodyMy,
          summary: summaryMy || null,
        },
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

      return article;
    });

    // 🔔 Create Global Notification for New Article
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
    return NextResponse.json(
      { ok: false, error: "Failed to create article" },
      { status: 500 }
    );
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

  // Validate slug format if provided
  if (result.data.slug) {
    const slugError = validateSlug(result.data.slug);
    if (slugError) {
      return NextResponse.json({ ok: false, error: slugError }, { status: 400 });
    }
  }

  const {
    id,
    slug,
    titleEn,
    titleMy,
    bodyEn,
    bodyMy,
    summaryEn,
    summaryMy,
    category,
    coverImageUrl,
    galleryImages,
    videos,
  } = result.data;

  try {
    await db.transaction(async (tx) => {
      const articleUpdate: Record<string, unknown> = { updatedAt: new Date() };
      if (slug !== undefined) articleUpdate.slug = slug;
      if (category !== undefined) articleUpdate.category = category || null;
      if (coverImageUrl !== undefined) {
        articleUpdate.coverImageUrl =
          coverImageUrl && coverImageUrl !== "" ? coverImageUrl : null;
      }
      if (galleryImages !== undefined) {
        articleUpdate.galleryImages =
          galleryImages && galleryImages.length > 0 ? JSON.stringify(galleryImages) : null;
      }
      await tx
        .update(knowledgeArticles)
        .set(articleUpdate)
        .where(eq(knowledgeArticles.id, id));

      if (titleEn !== undefined || bodyEn !== undefined || summaryEn !== undefined) {
        const enUpdate: Record<string, unknown> = {};
        if (titleEn !== undefined) enUpdate.title = titleEn;
        if (bodyEn !== undefined) enUpdate.body = bodyEn;
        if (summaryEn !== undefined) enUpdate.summary = summaryEn || null;

        const existing = await tx
          .select()
          .from(articleContent)
          .where(and(eq(articleContent.articleId, id), eq(articleContent.locale, "en")))
          .limit(1);

        if (existing.length > 0) {
          await tx
            .update(articleContent)
            .set(enUpdate)
            .where(and(eq(articleContent.articleId, id), eq(articleContent.locale, "en")));
        } else if (titleEn && bodyEn) {
          await tx.insert(articleContent).values({
            articleId: id,
            locale: "en",
            title: titleEn,
            body: bodyEn,
            summary: summaryEn || null,
          });
        }
      }

      if (titleMy !== undefined || bodyMy !== undefined || summaryMy !== undefined) {
        const myUpdate: Record<string, unknown> = {};
        if (titleMy !== undefined) myUpdate.title = titleMy;
        if (bodyMy !== undefined) myUpdate.body = bodyMy;
        if (summaryMy !== undefined) myUpdate.summary = summaryMy || null;

        const existing = await tx
          .select()
          .from(articleContent)
          .where(and(eq(articleContent.articleId, id), eq(articleContent.locale, "my")))
          .limit(1);

        if (existing.length > 0) {
          await tx
            .update(articleContent)
            .set(myUpdate)
            .where(and(eq(articleContent.articleId, id), eq(articleContent.locale, "my")));
        } else if (titleMy && bodyMy) {
          await tx.insert(articleContent).values({
            articleId: id,
            locale: "my",
            title: titleMy,
            body: bodyMy,
            summary: summaryMy || null,
          });
        }
      }

      if (videos !== undefined) {
        await tx
          .delete(mediaVideos)
          .where(and(eq(mediaVideos.ownerType, "article"), eq(mediaVideos.ownerId, id)));

        if (videos.length > 0) {
          await tx.insert(mediaVideos).values(
            videos.map((v, i) => ({
              ownerType: "article",
              ownerId: id,
              youtubeUrl: v.url,
              title: v.title || null,
              displayOrder: String(v.order ?? i),
            }))
          );
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/admin/library error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update article" },
      { status: 500 }
    );
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
      await tx
        .delete(mediaVideos)
        .where(and(eq(mediaVideos.ownerType, "article"), eq(mediaVideos.ownerId, id)));

      await tx.delete(knowledgeArticles).where(eq(knowledgeArticles.id, id));
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/library error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
