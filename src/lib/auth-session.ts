export const AUTH_COOKIE = "camu-auth";
export const AUTH_EMAIL_COOKIE = "camu-email";
export const AUTH_ROLE_COOKIE = "camu-role";
export const AUTH_NAME_COOKIE = "camu-name";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export const PUBLIC_ROUTES = [
  "/login",
  "/activate-account",
  "/api/auth/login",
  "/api/auth/activate",
] as const;

export const PORTAL_ROUTES = [
  "/",
  "/my-courses",
  "/assignment-dashboard",
  "/timetable",
  "/attendance-dashboard",
  "/notifications",
  "/admin/register-student",
] as const;

export function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
