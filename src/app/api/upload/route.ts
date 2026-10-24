import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.NEON_S3_REGION || "us-east-1",
  endpoint: process.env.NEON_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.NEON_S3_ACCESS_KEY || "",
    secretAccessKey: process.env.NEON_S3_SECRET_KEY || "",
  },
  forcePathStyle: true,
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ ok: false, error: "No file" }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const ext = file.name.split(".").pop() || "jpg";
    const key = `notes/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.NEON_S3_BUCKET,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: file.type,
      ACL: "public-read",
    }));

    const url = `${process.env.NEXT_PUBLIC_S3_URL}/${key}`;
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ ok: false, error: "Upload failed" }, { status: 500 });
  }
}
