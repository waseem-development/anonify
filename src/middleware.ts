// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Main middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🚫 Skip middleware for:
  // 1. API routes
  // 2. Next.js internal assets
  // 3. Favicon / webmanifest
  // 4. RSC / prefetch requests
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/site.webmanifest")
  ) {
    return NextResponse.next();
  }

  // Get session token
  const token = await getToken({ req: request });

  // Redirect logged-in users away from auth pages
  if (token && (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow access to verify page
  if (pathname.startsWith("/verify")) {
    if (token?.isVerified) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Allow all other pages
  return NextResponse.next();
}

// ✅ Only apply middleware to pages that need auth
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sign-in",
    "/sign-up",
    "/verify/:path*",
  ],
};