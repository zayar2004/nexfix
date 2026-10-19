import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/auth";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

// GET: List all users (Super Admin မဟုတ်ရင် Admin ကို မပြဘူး)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role as string)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
    }

    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        publicId: users.publicId,
        displayName: users.displayName,
        role: users.role,
        createdAt: users.createdAt,
        lastSeenAt: users.lastSeenAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return NextResponse.json({ ok: true, data: allUsers });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Failed to load users" }, { status: 500 });
  }
}

// PATCH: Change user role (Super Admin ပဲ ပြောင်းလို့ရမယ်)
const updateSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["user", "staff", "senior_admin", "super_admin"]),
});

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ ok: false, error: "Only Super Admin can change roles" }, { status: 403 });
    }

    const body = await req.json();
    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }

    // 🌟 ကိုယ့်ကိုယ်ကို ပြောင်းလို့မရဘူး
    if (result.data.id === session.user.id) {
      return NextResponse.json({ ok: false, error: "You cannot change your own role" }, { status: 400 });
    }

    // 🌟 Super Admin တစ်ယောက်ပဲ ရှိရမယ် (အခြား Super Admin ကို ဖျက်ချင်ရင် မရ)
    if (result.data.role === "super_admin") {
      return NextResponse.json({ ok: false, error: "Cannot promote to Super Admin" }, { status: 400 });
    }

    await db.update(users).set({ role: result.data.role }).where(eq(users.id, result.data.id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Failed to update" }, { status: 500 });
  }
}
