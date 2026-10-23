import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/auth";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

// GET: User အားလုံး
export async function GET() {
  const session = await auth();
  if (!session?.user || !["senior_admin", "super_admin"].includes(session.user.role as string)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      isApproved: users.isApproved,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return NextResponse.json({ ok: true, data: allUsers });
}

// PATCH: User ကို Approve/Reject လုပ်မယ်
const patchSchema = z.object({
  id: z.string().uuid(),
  isApproved: z.boolean().optional(),
  role: z.enum(["user", "staff", "senior_admin", "super_admin"]).optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || !["super_admin"].includes(session.user.role as string)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ ok: false, error: result.error.issues[0].message }, { status: 400 });
  }

  const { id, ...updates } = result.data;

  try {
    await db.update(users).set(updates).where(eq(users.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Failed to update" }, { status: 500 });
  }
}

// DELETE: User ကို အပြီးဖျက်မယ်
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "super_admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }

  try {
    await db.delete(users).where(eq(users.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Failed to delete" }, { status: 500 });
  }
}
