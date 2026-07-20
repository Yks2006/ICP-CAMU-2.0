import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, AUTH_ROLE_COOKIE, isAdminRoute, isPublicRoute } from "@/lib/auth-session";

const ADMIN_HOME = "/admin/register-student";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.get(AUTH_COOKIE)?.value === "true";
  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value;
  const isPublic = isPublicRoute(pathname);

  if (!isAuthenticated && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && (pathname === "/login" || pathname === "/activate-account")) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = role === "admin" ? ADMIN_HOME : "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  if (isAuthenticated && role === "admin" && !isAdminRoute(pathname)) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = ADMIN_HOME;
    adminUrl.search = "";
    return NextResponse.redirect(adminUrl);
  }

  if (isAuthenticated && isAdminRoute(pathname) && role !== "admin") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
