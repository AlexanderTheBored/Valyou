import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isAuthenticated = request.cookies.has("valyou_auth");
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/auth");

  // Dev-only standalone report harness — reachable without auth for UI work.
  if (process.env.NODE_ENV === "development" && pathname === "/valuation/preview") {
    return NextResponse.next();
  }

  // Unauthenticated user on a protected page → send to login
  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Already logged-in user hitting the login page → send to app
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/map", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
