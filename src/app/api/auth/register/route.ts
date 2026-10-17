import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

// 1. Input Validation Schema
const registerSchema = z.object({
  email: z.string().email("Invalid email format").max(255),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().max(100).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 2. Validate Body
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, displayName } = result.data;

    // 3. Check for existing user (Duplicate Protection)
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { ok: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    // 4. Hash Password (Secure Hashing)
    const passwordHash = await hash(password, 12);

    // 5. Generate Public ID (e.g., NXF-XXXXX)
    const publicId = `NXF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 6. Insert User (Default role is 'user' — NO elevated roles allowed)
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        displayName: displayName || null,
        publicId,
        // role: defaults to 'user' (D-51 LOCKED)
      })
      .returning({
        id: users.id,
        email: users.email,
        publicId: users.publicId,
        role: users.role,
      });

    // 7. Success Response
    return NextResponse.json(
      { ok: true, user: newUser },
      { status: 201 }
    );

  } catch (error) {
    console.error("Register API Error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
