import { NextResponse } from "next/server";
import { db } from "@/db";
import { errorCodes, errorContent, machines, notifications, media, mediaVideos } from "@/db/schema";
import { auth } from "@/auth";
import { z } from "zod";
import { eq } from "drizzle-orm";

const schema = z.object({
  machineName: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
  videoUrl: z.string().url().optional().or(z.literal("")),
  cause: z.string().optional(),
  troubleshooting: z.string().optional(),
  solution: z.string().optional(),
  safety: z.string().optional(),
  notes: z.string().optional(),
  // Arrays for multiple media
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

  const data = errors.map((err) => {
    const content = contents.find((c) => c.errorCodeId === err.id && c.locale === "en");
    const machine = machinesList.find((m) => m.id === err.machineId);
    return {
      ...err,
      machineName: machine?.name || "Unknown",
      cause: content?.cause || "",
      troubleshooting: content?.troubleshooting || "",
      solution: content?.solution || "",
      safety: content?.safety || "",
      notes: content?.notes || "",
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
      videoUrl: errorData.videoUrl || null,
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

    // 4. Insert Multiple Images if provided
    if (imageUrls && imageUrls.length > 0) {
      await db.insert(media).values(
        imageUrls.map((url, idx) => ({
          ownerType: "error",
          ownerId: newError.id,
          mime: "image/jpeg",
          size: "0",
          storageKey: url,
          status: "approved",
        }))
      );
    }

    // 5. Insert Multiple Videos if provided
    if (youtubeUrls && youtubeUrls.length > 0) {
      await db.insert(mediaVideos).values(
        youtubeUrls.map((url, idx) => ({
          ownerType: "error",
          ownerId: newError.id,
          youtubeUrl: url,
          title: "Added with Error",
          displayOrder: String(idx),
        }))
      );
    }

    // 6. Create Notification
    await db.insert(notifications).values({
      userId: null,
      type: "error_new",
      title: "New Error Code Added",
      message: `${errorData.code} - ${errorData.title} (${machineName}) ကို အသစ်ထည့်သွင်းပြီးပါပြီ။`,
      link: `/error/${newError.id}`,
    });

    return NextResponse.json({ ok: true, data: newError });
  } catch (err) {
    console.error("POST /api/admin/errors error:", err);
    return NextResponse.json({ ok: false, error: "Failed to create error" }, { status: 500 });
  }
}
