import { cookies } from "next/headers";
import { AUTH_COOKIE, AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE } from "@/lib/auth-session";

export type SessionInfo = {
  isAuthenticated: boolean;
  email: string | null;
  role: "admin" | "student" | null;
};

export async function getSession(): Promise<SessionInfo> {
  const cookieStore = await cookies();
  const roleValue = cookieStore.get(AUTH_ROLE_COOKIE)?.value;

  return {
    isAuthenticated: cookieStore.get(AUTH_COOKIE)?.value === "true",
    email: cookieStore.get(AUTH_EMAIL_COOKIE)?.value ?? null,
    role: roleValue === "admin" || roleValue === "student" ? roleValue : null,
  };
}

export async function requireAdminSession() {
  const session = await getSession();

  if (!session.isAuthenticated || session.role !== "admin") {
    return null;
  }

  return session;
}
