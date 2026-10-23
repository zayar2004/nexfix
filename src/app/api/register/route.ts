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

function generatePublicId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "USR";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "This email is already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 10);

    let publicId = generatePublicId();
    let attempts = 0;
    while (attempts < 5) {
      const [dup] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.publicId, publicId))
        .limit(1);
      if (!dup) break;
      publicId = generatePublicId();
      attempts++;
    }

    const [newUser] = await db
      .insert(users)
      .values({
        publicId,
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
