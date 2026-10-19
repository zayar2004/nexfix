import { NextResponse } from "next/server";
import { db } from "@/db";
import { errorCodes, errorContent, machines, notifications, media, mediaVideos } from "@/db/schema";
import { auth } from "@/auth";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";

const schema = z.object({
  machineName: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1), // Error Name
  solution: z.string().optional(), // Error Fix
  cause: z.string().optional(),
  troubleshooting: z.string().optional(),
  safety: z.string().optional(),
  notes: z.string().optional(),
  imageUrls: z.array(z.string().url()).optional().default([]),
  youtubeUrls: z.array(z.string().url()).optional().default([]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const errors = await db.select().from(errorCodes);
  const contents = await db.select().from(errorContent);
  const machinesList = await db.select().from(machines);
  
  // Fetch all media and videos
  const allMedia = await db.select().from(media).where(eq(media.ownerType, "error"));
  const allVideos = await db.select().from(mediaVideos).where(eq(mediaVideos.ownerType, "error"));

  const S3_URL = process.env.NEXT_PUBLIC_S3_URL || "";

  const data = errors.map((err) => {
    const content = contents.find((c) => c.errorCodeId === err.id && c.locale === "en");
    const machine = machinesList.find((m) => m.id === err.machineId);
    
    // Get images for this error
    const errImages = allMedia
      .filter((m) => m.ownerId === err.id)
      .map((m) => m.storageKey.startsWith("http") ? m.storageKey : `${S3_URL}/${m.storageKey}`);

    // Get videos for this error
    const errVideos = allVideos
      .filter((v) => v.ownerId === err.id)
      .map((v) => v.youtubeUrl);

    return {
      ...err,
      machineName: machine?.name || "Unknown",
      cause: content?.cause || "",
      troubleshooting: content?.troubleshooting || "",
      solution: content?.solution || "",
      safety: content?.safety || "",
      notes: content?.notes || "",
      images: errImages,
      videos: errVideos,
    };
  });

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

  const { machineName, cause, troubleshooting, solution, safety, notes, imageUrls, youtubeUrls, ...errorData } = result.data;

  try {
    // 1. Find or create machine
    let [machine] = await db.select().from(machines).where(eq(machines.name, machineName)).limit(1);
    if (!machine) {
      const machineCode = machineName.toUpperCase().replace(/[^A-Z0-9]/g, "-").substring(0, 50);
      [machine] = await db.insert(machines).values({
        name: machineName,
        code: machineCode,
        status: "published",
      }).returning();
    }

    // 2. Insert error code
    const [newError] = await db.insert(errorCodes).values({
      machineId: machine.id,
      code: errorData.code,
      title: errorData.title,
      status: "published",
    }).returning();

    // 3. Insert error content
    await db.insert(errorContent).values({
      errorCodeId: newError.id,
      locale: "en",
      cause: cause || null,
      troubleshooting: troubleshooting || null,
      solution: solution || null,
      safety: safety || null,
      notes: notes || null,
    });

    // 4. Insert Images
    if (imageUrls && imageUrls.length > 0) {
      await db.insert(media).values(
        imageUrls.map((url) => ({
          ownerType: "error",
          ownerId: newError.id,
          mime: "image/jpeg",
          size: "0",
          storageKey: url,
          status: "approved",
        }))
      );
    }

    // 5. Insert Videos
    if (youtubeUrls && youtubeUrls.length > 0) {
      await db.insert(mediaVideos).values(
        youtubeUrls.map((url, idx) => ({
          ownerType: "error",
          ownerId: newError.id,
          youtubeUrl: url,
          title: "Video",
          displayOrder: String(idx),
        }))
      );
    }

    // 6. Notification
    await db.insert(notifications).values({
      userId: null,
      type: "error_new",
      title: "New Error Code Added",
      message: `${errorData.code} - ${errorData.title} (${machineName}) ကို အသစ်ထည့်သွင်းပြီးပါပြီ။`,
      link: `/errors/${newError.id}`,
    });

    return NextResponse.json({ ok: true, data: newError });
  } catch (err) {
    console.error("POST /api/admin/errors error:", err);
    return NextResponse.json({ ok: false, error: "Failed to create error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { id, machineName, cause, troubleshooting, solution, safety, notes, imageUrls, youtubeUrls, ...updateData } = body;

  if (!id) return NextResponse.json({ ok: false, error: "Missing ID" }, { status: 400 });

  try {
    // 1. Handle machine change
    if (machineName) {
      let [machine] = await db.select().from(machines).where(eq(machines.name, machineName)).limit(1);
      if (!machine) {
        const machineCode = machineName.toUpperCase().replace(/[^A-Z0-9]/g, "-").substring(0, 50);
        [machine] = await db.insert(machines).values({
          name: machineName,
          code: machineCode,
          status: "published",
        }).returning();
      }
      updateData.machineId = machine.id;
    }

    // 2. Update error code
    const { id: _, ...cleanUpdateData } = updateData;
    await db.update(errorCodes).set(cleanUpdateData).where(eq(errorCodes.id, id));

    // 3. Update error content
    const existing = await db.select().from(errorContent).where(eq(errorContent.errorCodeId, id)).limit(1);
    if (existing.length > 0) {
      await db.update(errorContent).set({
        cause: cause || null,
        troubleshooting: troubleshooting || null,
        solution: solution || null,
        safety: safety || null,
        notes: notes || null,
      }).where(eq(errorContent.errorCodeId, id));
    } else {
      await db.insert(errorContent).values({
        errorCodeId: id,
        locale: "en",
        cause: cause || null,
        troubleshooting: troubleshooting || null,
        solution: solution || null,
        safety: safety || null,
        notes: notes || null,
      });
    }

    // 4. Update Images (delete old, insert new)
    await db.delete(media).where(eq(media.ownerId, id));
    if (imageUrls && imageUrls.length > 0) {
      await db.insert(media).values(
        imageUrls.map((url: string) => ({
          ownerType: "error",
          ownerId: id,
          mime: "image/jpeg",
          size: "0",
          storageKey: url,
          status: "approved",
        }))
      );
    }

    // 5. Update Videos (delete old, insert new)
    await db.delete(mediaVideos).where(eq(mediaVideos.ownerId, id));
    if (youtubeUrls && youtubeUrls.length > 0) {
      await db.insert(mediaVideos).values(
        youtubeUrls.map((url: string, idx: number) => ({
          ownerType: "error",
          ownerId: id,
          youtubeUrl: url,
          title: "Video",
          displayOrder: String(idx),
        }))
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/admin/errors error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || !["senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing ID" }, { status: 400 });

  try {
    await db.transaction(async (tx) => {
      await tx.delete(media).where(eq(media.ownerId, id));
      await tx.delete(mediaVideos).where(eq(mediaVideos.ownerId, id));
      await tx.delete(errorContent).where(eq(errorContent.errorCodeId, id));
      await tx.delete(errorCodes).where(eq(errorCodes.id, id));
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Failed to delete" }, { status: 500 });
  }
}
