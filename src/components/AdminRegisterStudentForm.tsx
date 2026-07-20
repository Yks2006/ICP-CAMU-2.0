"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEGREE_LEVEL_OPTIONS,
  INSTITUTION_NAME,
  STUDENT_STATUS_OPTIONS,
  validateAdminStudentForm,
  validateStudentEmail,
  validateStudentId,
} from "@/lib/auth-validation";

const selectClassName =
  "flex h-9 w-full rounded-md border border-outline-variant bg-surface-container-low px-3 text-body-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20";

export function AdminRegisterStudentForm() {
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [studentStatus, setStudentStatus] = useState<(typeof STUDENT_STATUS_OPTIONS)[number]>("Active");
  const [degreeLevel, setDegreeLevel] = useState("");
  const [department, setDepartment] = useState("");
  const [programName, setProgramName] = useState("");
  const [institution] = useState(INSTITUTION_NAME);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [successMessage, setSuccessMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(undefined);

    const formErrors = validateAdminStudentForm({
      fullName,
      studentId,
      email,
      studentStatus,
      degreeLevel,
      department,
      programName,
      institution,
    });

    setErrors(formErrors);
    if (Object.values(formErrors).some(Boolean)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          fullName,
          studentId,
          email,
          studentStatus,
          degreeLevel,
          department,
          programName,
          institution,
        }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        errors?: Record<string, string | undefined>;
      };

      if (!response.ok) {
        setErrors(data.errors ?? {});
        return;
      }

      setSuccessMessage(
        "Student account created. The student can now set their password using their student email.",
      );
      setFullName("");
      setStudentId("");
      setEmail("");
      setStudentStatus("Active");
      setDegreeLevel("");
      setDepartment("");
      setProgramName("");
      setErrors({});
    } catch {
      setErrors({ email: "Unable to register student. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {successMessage && (
        <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-label-sm text-success">
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Student Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="h-9 border-outline-variant bg-surface-container-low"
          />
          {errors.fullName && <p className="text-label-sm text-error">{errors.fullName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="studentId">Student ID</Label>
          <Input
            id="studentId"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value.toUpperCase())}
            onBlur={() => setErrors((prev) => ({ ...prev, studentId: validateStudentId(studentId) }))}
            className="h-9 border-outline-variant bg-surface-container-low"
          />
          {errors.studentId && <p className="text-label-sm text-error">{errors.studentId}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="email">Student Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setErrors((prev) => ({ ...prev, email: validateStudentEmail(email) }))}
            className="h-9 border-outline-variant bg-surface-container-low"
          />
          {errors.email && <p className="text-label-sm text-error">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="studentStatus">Student Status</Label>
          <select
            id="studentStatus"
            value={studentStatus}
            onChange={(event) =>
              setStudentStatus(event.target.value as (typeof STUDENT_STATUS_OPTIONS)[number])
            }
            className={selectClassName}
          >
            {STUDENT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.studentStatus && <p className="text-label-sm text-error">{errors.studentStatus}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="degreeLevel">Degree Level</Label>
          <select
            id="degreeLevel"
            value={degreeLevel}
            onChange={(event) => setDegreeLevel(event.target.value)}
            className={selectClassName}
          >
            <option value="">Select degree level</option>
            {DEGREE_LEVEL_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          {errors.degreeLevel && <p className="text-label-sm text-error">{errors.degreeLevel}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="h-9 border-outline-variant bg-surface-container-low"
          />
          {errors.department && <p className="text-label-sm text-error">{errors.department}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="programName">Program Name</Label>
          <Input
            id="programName"
            value={programName}
            onChange={(event) => setProgramName(event.target.value)}
            className="h-9 border-outline-variant bg-surface-container-low"
          />
          {errors.programName && <p className="text-label-sm text-error">{errors.programName}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="institution">Institution</Label>
          <Input
            id="institution"
            value={institution}
            readOnly
            className="h-11 border-outline-variant bg-surface-container text-on-surface-variant"
          />
          {errors.institution && <p className="text-label-sm text-error">{errors.institution}</p>}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-9 border-none bg-[#00346d] px-5 text-sm font-semibold text-white hover:bg-[#124687] disabled:opacity-60"
      >
        <MaterialIcon icon="person_add" className="mr-2" />
        {isSubmitting ? "Registering..." : "Register Student"}
      </Button>
    </form>
  );
}
