import { NextResponse } from "next/server";
import { clearAuthSessionCookies } from "@/lib/auth-cookies";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAuthSessionCookies(response);
  return response;
}
