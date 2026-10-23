import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public Path တွေကို ကျော်မယ်
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // NextAuth ရဲ့ တရားဝင် Session ကို ဖတ်မယ်
  const session = await auth();
  
  // Session မရှိရင် Login Page ကို ပို့မယ်
  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin ဟုတ်မဟုတ် စစ်မယ်
  const role = session.user.role as string | undefined;
  const isAdmin =
    role === "staff" || role === "senior_admin" || role === "super_admin";

  // isApproved မဖြစ်ရင် (Admin မဟုတ်ရင်) /pending-approval ကို ပို့မယ်
  const isApproved = (session.user as any).isApproved;
  if (!isApproved && !isAdmin) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, error: "Pending approval" },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/pending-approval", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon-192.png|icon-512.png|manifest.json|sw.js).*)",
  ],
};
