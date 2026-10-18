import { NextResponse } from "next/server";
import { db } from "@/db";
import { errorCodes, errorContent } from "@/db/schema";
import { auth } from "@/auth";
import { z } from "zod";

const schema = z.object({
  machineId: z.string().uuid(),
  code: z.string().min(1),
  title: z.string().min(1),
  videoUrl: z.string().url().optional().or(z.literal("")),
  cause: z.string().optional(),
  troubleshooting: z.string().optional(),
  solution: z.string().optional(),
  safety: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }
  const data = await db.select().from(errorCodes);
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

  const { cause, troubleshooting, solution, safety, ...errorData } = result.data;

  const [newError] = await db.insert(errorCodes).values({
    machineId: errorData.machineId,
    code: errorData.code,
    title: errorData.title,
    videoUrl: errorData.videoUrl || null,
  }).returning();

  if (cause || solution || troubleshooting || safety) {
    await db.insert(errorContent).values({
      errorCodeId: newError.id,
      locale: "en",
      cause: cause || null,
      troubleshooting: troubleshooting || null,
      solution: solution || null,
      safety: safety || null,
    });
  }

  return NextResponse.json({ ok: true, data: newError });
}
