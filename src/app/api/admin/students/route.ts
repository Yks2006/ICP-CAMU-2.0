import { NextResponse } from "next/server";
import { validateAdminStudentForm } from "@/lib/auth-validation";
import {
  createStudentByAdmin,
  findUserByEmail,
  findUserByStudentId,
  type StudentStatus,
} from "@/lib/db";
import { requireAdminSession } from "@/lib/server-auth";

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ ok: false, message: "Admin access required." }, { status: 403 });
    }

    const body = (await request.json()) as {
      fullName?: string;
      studentId?: string;
      email?: string;
      studentStatus?: string;
      degreeLevel?: string;
      department?: string;
      programName?: string;
      institution?: string;
    };

    const formInput = {
      fullName: body.fullName ?? "",
      studentId: body.studentId ?? "",
      email: body.email ?? "",
      studentStatus: body.studentStatus ?? "",
      degreeLevel: body.degreeLevel ?? "",
      department: body.department ?? "",
      programName: body.programName ?? "",
      institution: body.institution ?? "",
    };

    const errors = validateAdminStudentForm(formInput);
    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    const existingEmail = await findUserByEmail(formInput.email);
    if (existingEmail) {
      return NextResponse.json(
        {
          ok: false,
          errors: { email: "A student with this email already exists." },
        },
        { status: 409 },
      );
    }

    const existingStudentId = await findUserByStudentId(formInput.studentId);
    if (existingStudentId) {
      return NextResponse.json(
        {
          ok: false,
          errors: { studentId: "A student with this ID already exists." },
        },
        { status: 409 },
      );
    }

    await createStudentByAdmin({
      studentId: formInput.studentId,
      email: formInput.email,
      fullName: formInput.fullName,
      studentStatus: formInput.studentStatus as StudentStatus,
      degreeLevel: formInput.degreeLevel,
      department: formInput.department,
      programName: formInput.programName,
      institution: formInput.institution,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin student registration failed:", error);
    return NextResponse.json(
      {
        ok: false,
        errors: {
          email: "Unable to connect to the database. Check MySQL and .env settings.",
        },
      },
      { status: 500 },
    );
  }
}
