import { NextResponse } from "next/server";
import { db } from "@/db";
import { libraryPdfs } from "@/db/schema";
import { auth } from "@/auth";
import { uploadToS3 } from "@/lib/s3";
import { eq } from "drizzle-orm";

// GET: PDF တွေကို ကြည့်ခြင်း
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const pdfs = await db.select().from(libraryPdfs);
  return NextResponse.json({ ok: true, data: pdfs });
}

// POST: PDF တင်ခြင်း
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role as string)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const articleId = formData.get("articleId") as string;
  const machineId = formData.get("machineId") as string;

  if (!file || !title) {
    return NextResponse.json({ ok: false, error: "Missing file or title" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `pdfs/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    
    // S3 သို့ တင်မယ်
    await uploadToS3(key, buffer, file.type);
    
    // Database သို့ သိမ်းမယ်
    await db.insert(libraryPdfs).values({
      title,
      description: description || null,
      articleId: articleId || null,
      machineId: machineId || null,
      storageKey: key,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Upload failed" }, { status: 500 });
  }
}

// DELETE: PDF ဖျက်ခြင်း
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || !["senior_admin", "super_admin"].includes(session.user.role as string)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing ID" }, { status: 400 });

  await db.delete(libraryPdfs).where(eq(libraryPdfs.id, id));
  return NextResponse.json({ ok: true });
}
