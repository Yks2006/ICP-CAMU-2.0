import { NextResponse } from "next/server";
import { validateLoginForm } from "@/lib/auth-validation";
import { setAuthSessionCookies } from "@/lib/auth-cookies";
import { findUserByEmail, userNeedsPasswordSetup } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email ?? "";
    const password = body.password ?? "";

    const errors = validateLoginForm(email, password);
    if (errors.email || errors.password) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          errors: {
            password: "Invalid email or password.",
          },
        },
        { status: 401 },
      );
    }

    if (userNeedsPasswordSetup(user)) {
      return NextResponse.json(
        {
          ok: false,
          requiresPasswordSetup: true,
          errors: {
            password: "Your account has no password yet. Please set your password first.",
          },
        },
        { status: 403 },
      );
    }

    if (!verifyPassword(password, user.password_hash!)) {
      return NextResponse.json(
        {
          ok: false,
          errors: {
            password: "Invalid email or password.",
          },
        },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });

    setAuthSessionCookies(response, user);
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json(
      {
        ok: false,
        errors: {
          password: "Unable to connect to the database. Check MySQL and .env settings.",
        },
      },
      { status: 500 },
    );
  }
}
