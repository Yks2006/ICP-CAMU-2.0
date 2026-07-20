"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { fetchAuthProfile, type AuthProfile } from "@/lib/client-auth";
import { formatStudentEmail } from "@/lib/format-student-email";
import { getPastelTone, PORTAL_SECTION_TONES } from "@/lib/pastel-palette";
import { cn } from "@/lib/utils";

type ProfileField = {
  label: string;
  value: string;
  wide?: boolean;
  toneIndex: number;
};

function ProfileItem({ label, value, wide, toneIndex }: ProfileField) {
  const tone = getPastelTone(toneIndex);

  return (
    <div
      className={cn(
        "portal-card rounded-xl border px-3 py-2.5",
        tone.card,
        wide && "lg:col-span-2",
      )}
    >
      <p className={cn("text-[10px] font-medium uppercase tracking-wide", tone.label)}>
        {label}
      </p>
      <p className="text-body-sm font-body-sm mt-1 break-words font-semibold text-on-surface">
        {value || "—"}
      </p>
    </div>
  );
}

export function StudentProfileSummary() {
  const [profile, setProfile] = useState<AuthProfile | null>(null);

  useEffect(() => {
    fetchAuthProfile().then(setProfile);
  }, []);

  if (!profile || profile.role !== "student") {
    return null;
  }

  const primaryFields: ProfileField[] = [
    { label: "Student Name", value: profile.fullName, toneIndex: 0 },
    { label: "Student Status", value: profile.studentStatus ?? "", toneIndex: 1 },
    { label: "Student ID", value: profile.studentId, toneIndex: 2 },
    { label: "Student Email", value: formatStudentEmail(profile.email), toneIndex: 3 },
  ];

  const academicFields: ProfileField[] = [
    { label: "Degree Level", value: profile.degreeLevel ?? "", toneIndex: 4 },
    { label: "Department", value: profile.department ?? "", toneIndex: 5 },
    { label: "Program Name", value: profile.programName ?? "", wide: true, toneIndex: 3 },
    { label: "Institution", value: profile.institution ?? "", wide: true, toneIndex: 4 },
  ];

  return (
    <section
      className={cn(
        "portal-section rounded-xl p-4",
        PORTAL_SECTION_TONES.profile,
      )}
    >
      <div className="mb-3 flex items-center gap-2 border-b border-pastel-blue-border/60 pb-3">
        <MaterialIcon icon="badge" className="text-pastel-blue-text text-lg" />
        <h3 className="text-headline-sm font-headline-sm text-primary">Student Information</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-label-sm font-label-sm mb-2 uppercase tracking-wide text-on-surface-variant">
            Personal Details
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {primaryFields.map((field) => (
              <ProfileItem key={field.label} {...field} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-label-sm font-label-sm mb-2 uppercase tracking-wide text-on-surface-variant">
            Academic Details
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {academicFields.map((field) => (
              <ProfileItem key={field.label} {...field} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
