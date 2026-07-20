import { AppShell } from "@/components/AppShell";
import { AdminRegisterStudentForm } from "@/components/AdminRegisterStudentForm";
import { MaterialIcon } from "@/components/MaterialIcon";

export const metadata = {
  title: "Register Student | CAMU 2.0 Student Portal",
  description: "Admin-only student registration for CAMU 2.0.",
};

export default function AdminRegisterStudentPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-secondary-container text-primary">
            <MaterialIcon icon="person_add" className="text-xl" />
          </div>
          <div>
            <h1 className="text-headline-lg font-headline-lg text-primary">Register Student</h1>
            <p className="text-body-md text-on-surface-variant">
              Create a student account without a password. The student will set their own password
              before first login.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-pastel-blue-border bg-pastel-blue/25 p-4 custom-shadow">
          <AdminRegisterStudentForm />
        </div>
      </div>
    </AppShell>
  );
}
