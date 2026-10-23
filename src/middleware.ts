import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Login မလိုအပ်တဲ့ Page တွေ
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
  "/sw.js",
];

// Approve မလုပ်ရင် ခွင့်ပြုရမယ့် Page (pending-approval ကို ပို့ဖို့ လိုတဲ့ အတွက်)
const PENDING_ALLOWED_PATHS = [
  "/pending-approval",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json",
  "/sw.js",
];

async function verifyToken(token: string) {
  try {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) return null;
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public Path တွေကို ကျော်မယ်
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    // /pending-approval ကို ဝင်ပြီးသားဆိုရင် session ရှိမရှိ စစ်ဖို့ မလိုဘူး
    if (pathname.startsWith("/pending-approval")) {
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  // Auth Token / Session Cookie ကို စစ်မယ်
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  // Session မရှိရင် Login Page ကို ပို့မယ်
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // JWT ကို decode လုပ်ပြီး isApproved ကို စစ်မယ်
  const payload = await verifyToken(sessionToken);

  // Token မမှန်ရင် Login Page ကို ပို့မယ်
  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin/Super Admin ဖြစ်ရင် ချက်ချင်း ခွင့်ပြုမယ်
  const role = payload.role as string | undefined;
  const isAdmin =
    role === "staff" || role === "senior_admin" || role === "super_admin";

  // isApproved မဖြစ်ရင် (Admin မဟုတ်ရင်) /pending-approval ကို ပို့မယ်
  const isApproved = payload.isApproved as boolean | undefined;
  if (!isApproved && !isAdmin) {
    // API Route တွေဆိုရင် 403 ပြန်မယ်
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, error: "Pending approval" },
        { status: 403 }
      );
    }
    // Page တွေဆိုရင် /pending-approval ကို ပို့မယ်
    return NextResponse.redirect(new URL("/pending-approval", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon-192.png|icon-512.png|manifest.json|sw.js).*)",
  ],
};
