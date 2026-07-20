import { NextResponse } from "next/server";
import { validateActivateAccountForm } from "@/lib/auth-validation";
import { findUserByEmail, setUserPassword, userNeedsPasswordSetup } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      confirmPassword?: string;
    };

    const email = body.email ?? "";
    const password = body.password ?? "";
    const confirmPassword = body.confirmPassword ?? "";

    const errors = validateActivateAccountForm(email, password, confirmPassword);
    if (errors.email || errors.password || errors.confirmPassword) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          errors: {
            email: "No student account found for this email. Contact your administrator.",
          },
        },
        { status: 404 },
      );
    }

    if (user.role !== "student") {
      return NextResponse.json(
        {
          ok: false,
          errors: {
            email: "This account cannot be activated here.",
          },
        },
        { status: 403 },
      );
    }

    if (!userNeedsPasswordSetup(user)) {
      return NextResponse.json(
        {
          ok: false,
          errors: {
            email: "This account already has a password. Please sign in instead.",
          },
        },
        { status: 409 },
      );
    }

    const updated = await setUserPassword(email, hashPassword(password));
    if (!updated) {
      return NextResponse.json(
        {
          ok: false,
          errors: {
            password: "Unable to set password. Please try again.",
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Activate account failed:", error);
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
