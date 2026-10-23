import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(1, "Name is required").max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, displayName } = result.data;

    // Email ရှိပြီးသားလား စစ်မယ်
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "ဤ Email ဖြင့် Account ရှိပြီးသားဖြစ်ပါသည်" },
        { status: 400 }
      );
    }

    // Password ကို Hash လုပ်မယ်
    const passwordHash = await hash(password, 10);

    // User အသစ် ဖန်တီးမယ် (isApproved: false)
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        displayName,
        role: "user",
        isApproved: false,
      })
      .returning({ id: users.id, email: users.email });

    return NextResponse.json({ ok: true, data: newUser });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { ok: false, error: "Registration failed" },
      { status: 500 }
    );
  }
}
