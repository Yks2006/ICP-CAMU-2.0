"use client";

import { AttendanceSummaryCard } from "@/components/AttendanceSummaryCard";
import { useStudentEnrollments } from "@/hooks/useStudentEnrollments";

export function AttendanceDashboardPage() {
  const { isReady } = useStudentEnrollments();

  return (
    <>
      <div className="mb-8">
        <h2 className="text-headline-lg font-headline-lg text-primary">Attendance Management</h2>
        <p className="text-body-lg text-on-surface-variant">Track your academic presence and log daily attendance.</p>
      </div>

      <AttendanceSummaryCard isReady={isReady} />
    </>
  );
}
