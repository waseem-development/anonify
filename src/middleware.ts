// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Main middleware function
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Redirect to dashboard if the user is already authenticated
  // and trying to access sign-in or sign-up pages ONLY
  if (
    token &&
    (url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('/sign-up'))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow access to verify page even if authenticated (needed for verification process)
  if (token && url.pathname.startsWith('/verify')) {
    if (token.isVerified) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // ALLOW authenticated users to access home, pricing, about, and other public pages
  return NextResponse.next();
}

// Apply withAuth for additional authentication handling
export default withAuth(
  function middleware() {
    // Additional middleware logic if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// ✅ Updated matcher: exclude static files and public assets
export const config = {
  matcher: [
    // Apply middleware only to pages that need auth
    '/dashboard/:path*',
    '/sign-in',
    '/sign-up',
    '/verify/:path*',
    // Exclude static assets and public files
    '/((?!_next/static|_next/image|favicon.ico|site.webmanifest).*)',
  ],
};
