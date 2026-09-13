import { NextRequest, NextResponse } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";

// Public routes that never require auth
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/logout",
];

// Routes that start with these prefixes are public (public check-in pages)
const PUBLIC_PREFIXES = [
  "/checkin/",       // public self-check-in per programme
  "/_next/",
  "/favicon",
];

// Public API endpoints used by the public-facing pages
const PUBLIC_API_PATHS = [
  "/api/registrations",  // POST - public registration submission
  "/api/checkin",        // POST - public self check-in
];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  // Allow GET on public API routes (programmes for public check-in pages)
  if (pathname.startsWith("/api/programmes") && request.method === "GET") {
    return NextResponse.next();
  }

  // Allow POST on public submission APIs
  if (
    PUBLIC_API_PATHS.some((p) => pathname.startsWith(p)) &&
    request.method === "POST"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Attach user info to headers so API routes can read without re-verifying
  const response = NextResponse.next();
  response.headers.set("x-user-id", session.userId);
  response.headers.set("x-user-role", session.role);
  response.headers.set("x-user-email", session.email);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
