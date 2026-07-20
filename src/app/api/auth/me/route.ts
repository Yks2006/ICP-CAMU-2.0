import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE, AUTH_EMAIL_COOKIE } from "@/lib/auth-session";
import { findUserByEmail } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();

    if (cookieStore.get(AUTH_COOKIE)?.value !== "true") {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const email = cookieStore.get(AUTH_EMAIL_COOKIE)?.value;
    if (!email) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      fullName: user.full_name?.trim() ?? "",
      studentId: user.student_id,
      email: user.email,
      role: user.role,
      studentStatus: user.student_status,
      degreeLevel: user.degree_level,
      department: user.department,
      programName: user.program_name,
      institution: user.institution,
    });
  } catch (error) {
    console.error("Failed to load auth profile:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
