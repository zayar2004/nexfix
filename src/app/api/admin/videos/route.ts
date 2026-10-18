import { NextResponse } from "next/server";
import { db } from "@/db";
import { mediaVideos } from "@/db/schema";
import { auth } from "@/auth";
import { z } from "zod";
import { eq, and, asc } from "drizzle-orm";

const schema = z.object({
  ownerType: z.enum(["error", "article"]),
  ownerId: z.string().uuid(),
  youtubeUrl: z.string().url(),
  title: z.string().optional(),
});

// Validate YouTube URL
function isValidYouTubeUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
  ];
  return patterns.some((p) => p.test(url));
}

// Extract YouTube Video ID

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const ownerType = searchParams.get("ownerType");
  const ownerId = searchParams.get("ownerId");
  
  if (!ownerType || !ownerId) {
    return NextResponse.json({ ok: false, error: "Missing ownerType or ownerId" }, { status: 400 });
  }

  const data = await db
    .select()
    .from(mediaVideos)
    .where(and(eq(mediaVideos.ownerType, ownerType), eq(mediaVideos.ownerId, ownerId)))
    .orderBy(asc(mediaVideos.displayOrder));

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

  if (!isValidYouTubeUrl(result.data.youtubeUrl)) {
    return NextResponse.json({ ok: false, error: "Invalid YouTube URL" }, { status: 400 });
  }

  const [newVideo] = await db.insert(mediaVideos).values({
    ownerType: result.data.ownerType,
    ownerId: result.data.ownerId,
    youtubeUrl: result.data.youtubeUrl,
    title: result.data.title || null,
  }).returning();

  return NextResponse.json({ ok: true, data: newVideo });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing ID" }, { status: 400 });

  await db.delete(mediaVideos).where(eq(mediaVideos.id, id));
  return NextResponse.json({ ok: true });
}
