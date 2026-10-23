import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/pending-approval",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json",
  "/admin-manifest.json",
  "/sw.js",
];

async function verifyToken(token: string) {
  try {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) return null;
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(sessionToken);
  if (!payload || !payload.id) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Database ကနေ လက်ရှိ User ရဲ့ isApproved နဲ့ role ကို စစ်မယ်
  try {
    const [dbUser] = await db
      .select({ isApproved: users.isApproved, role: users.role })
      .from(users)
      .where(eq(users.id, payload.id as string))
      .limit(1);

    if (!dbUser) {
      // User မရှိတော့ရင် Login ကို ပို့မယ်
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const isAdmin = ["staff", "senior_admin", "super_admin"].includes(dbUser.role);

    // ၁။ Revoke ဖြစ်သွားရင် (Approve မဖြစ်ရင်) ချက်ချင်း Log Out လုပ်မယ်
    if (!dbUser.isApproved && !isAdmin) {
      // Session Cookie ကို ဖျက်မယ်
      const response = pathname.startsWith("/api/")
        ? NextResponse.json({ ok: false, error: "Access revoked" }, { status: 403 })
        : NextResponse.redirect(new URL("/pending-approval", request.url));

      response.cookies.delete("authjs.session-token");
      response.cookies.delete("__Secure-authjs.session-token");
      return response;
    }

    // ၂။ Admin Panel ကို ဝင်ခွင့် စစ်မယ်
    if (pathname.startsWith("/admin")) {
      if (!isAdmin) {
        // Admin မဟုတ်ရင် Home ကို ပို့မယ်
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware DB check failed:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon-192.png|icon-512.png|manifest.json|admin-manifest.json|sw.js).*)",
  ],
};
