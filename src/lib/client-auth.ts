export type AuthProfile = {
  fullName: string;
  studentId: string;
  email: string;
  role: "admin" | "student";
  studentStatus?: string;
  degreeLevel?: string;
  department?: string;
  programName?: string;
  institution?: string;
};

export async function fetchAuthProfile(): Promise<AuthProfile | null> {
  try {
    const response = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      ok: boolean;
      fullName?: string;
      studentId?: string;
      email?: string;
      role?: "admin" | "student";
      studentStatus?: string;
      degreeLevel?: string;
      department?: string;
      programName?: string;
      institution?: string;
    };

    if (!data.ok || !data.role) {
      return null;
    }

    return {
      fullName: data.fullName ?? "",
      studentId: data.studentId ?? "",
      email: data.email ?? "",
      role: data.role,
      studentStatus: data.studentStatus,
      degreeLevel: data.degreeLevel,
      department: data.department,
      programName: data.programName,
      institution: data.institution,
    };
  } catch {
    return null;
  }
}
