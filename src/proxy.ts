import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Self-host escape hatch: when NEXT_PUBLIC_DISABLE_AUTH=true, skip the login
  // gate entirely so the UI is reachable without a backend. Note: pages that
  // call the backend API will still fail without a valid token — this only
  // removes the redirect wall, it does not fake a session.
  if (process.env.NEXT_PUBLIC_DISABLE_AUTH === "true") {
    return NextResponse.next();
  }

  const isAuthenticated = request.cookies.has("valyou_auth");
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
