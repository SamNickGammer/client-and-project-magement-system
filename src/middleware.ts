import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-env";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon") ||
    pathname.includes("public");

  if (token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);

      // If valid token and trying to access login, redirect to dashboard
      if (pathname.startsWith("/login")) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Allow access to other routes (protected or not)
      // If it's a public route, we've already verified the token, so allow access.
      // If it's a protected route, token is valid, so allow access.
      return NextResponse.next();
    } catch {
      // Token invalid/expired - continue to checks below
      // If trying to access protected route, it will be caught by the !token check or fall through
      // If trying to access a public route, it will be allowed by the isPublicRoute check.
    }
  }

  // Unprotected routes allow through if no token or token invalid
  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Auth Error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
