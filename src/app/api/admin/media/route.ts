import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { auth } from "@/auth";
import { randomUUID } from "crypto";
import { desc, eq } from "drizzle-orm";
import { uploadToS3, deleteFromS3 } from "@/lib/s3";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function GET() {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role as string)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }
  
  const data = await db.select().from(media).orderBy(desc(media.createdAt));
  
  // Add full URL to each media item
  const S3_URL = process.env.NEXT_PUBLIC_S3_URL || "";
  const dataWithUrls = data.map(m => ({
    ...m,
    url: `${S3_URL}/${m.storageKey}`
  }));

  return NextResponse.json({ ok: true, data: dataWithUrls });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role as string)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const ownerType = formData.get("ownerType") as string | null;
    const ownerId = formData.get("ownerId") as string | null;

    if (!file) return NextResponse.json({ ok: false, error: "No file" }, { status: 400 });
    if (!ownerType || !ownerId) return NextResponse.json({ ok: false, error: "Missing ownerType or ownerId" }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ ok: false, error: "Invalid file type. Only JPG, PNG, WebP, GIF allowed." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ ok: false, error: "File too large. Max 5MB." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadToS3(fileName, buffer, file.type);

    const [newMedia] = await db.insert(media).values({
      ownerType: ownerType,
      ownerId: ownerId,
      mime: file.type,
      size: String(file.size),
      storageKey: fileName,
      status: "approved",
    }).returning();

    return NextResponse.json({ ok: true, data: { ...newMedia, url: publicUrl } });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ ok: false, error: "Upload failed: " + (err instanceof Error ? err.message : "Unknown") }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || !["senior_admin", "super_admin"].includes(session.user.role as string)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing ID" }, { status: 400 });

  const [record] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (!record) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  try {
    await deleteFromS3(record.storageKey);
  } catch (err) {
    console.error("S3 delete error:", err);
  }

  await db.delete(media).where(eq(media.id, id));
  return NextResponse.json({ ok: true });
}
