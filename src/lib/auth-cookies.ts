import type { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  AUTH_EMAIL_COOKIE,
  AUTH_NAME_COOKIE,
  AUTH_ROLE_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth-session";

type SessionUser = {
  email: string;
  full_name: string;
  role: "admin" | "student";
};

export function setAuthSessionCookies(response: NextResponse, user: SessionUser) {
  const cookieOptions = {
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    sameSite: "lax" as const,
  };

  response.cookies.set(AUTH_COOKIE, "true", cookieOptions);
  response.cookies.set(AUTH_EMAIL_COOKIE, user.email, cookieOptions);
  response.cookies.set(AUTH_NAME_COOKIE, user.full_name ?? "", cookieOptions);
  response.cookies.set(AUTH_ROLE_COOKIE, user.role, cookieOptions);
}

export function clearAuthSessionCookies(response: NextResponse) {
  const clearOptions = { path: "/", maxAge: 0 };

  response.cookies.set(AUTH_COOKIE, "", clearOptions);
  response.cookies.set(AUTH_EMAIL_COOKIE, "", clearOptions);
  response.cookies.set(AUTH_NAME_COOKIE, "", clearOptions);
  response.cookies.set(AUTH_ROLE_COOKIE, "", clearOptions);
}
