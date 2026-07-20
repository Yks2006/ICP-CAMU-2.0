"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { COURSE_SUBJECTS } from "@/lib/course-dataset";
import {
  buildStudentAssignments,
  filterStudentAssignments,
  type DueDateFilter,
  type StatusFilter,
  type StudentAssignment,
} from "@/lib/course-assignments";
import {
  ASSIGNMENT_SUBMISSIONS_STORAGE_KEY,
  persistAssignmentSubmissions,
  readAssignmentSubmissions,
  type AssignmentSubmission,
} from "@/lib/student-assignment-submissions";
import { useStudentEnrollments } from "@/hooks/useStudentEnrollments";

export function useStudentAssignments() {
  const { enrolledIds, enrolledCourses, semesterStart, isReady } = useStudentEnrollments();
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [now, setNow] = useState(() => new Date());

  const syncSubmissions = useCallback(() => {
    setSubmissions(readAssignmentSubmissions());
  }, []);

  useEffect(() => {
    syncSubmissions();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ASSIGNMENT_SUBMISSIONS_STORAGE_KEY) {
        syncSubmissions();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [syncSubmissions]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const assignments = useMemo(
    () =>
      buildStudentAssignments(
        enrolledIds,
        COURSE_SUBJECTS,
        semesterStart,
        submissions,
        now,
      ),
    [enrolledIds, semesterStart, submissions, now],
  );

  const submitAssignment = useCallback(
    (assignmentId: string) => {
      setSubmissions((current) => {
        if (current.some((item) => item.assignmentId === assignmentId)) {
          return current;
        }

        const next: AssignmentSubmission[] = [
          ...current,
          { assignmentId, submittedAt: new Date().toISOString() },
        ];

        persistAssignmentSubmissions(next);
        return next;
      });
    },
    [],
  );

  const pendingCount = assignments.filter((item) => item.status === "pending").length;
  const overdueCount = assignments.filter((item) => item.status === "overdue").length;

  return {
    assignments,
    enrolledCourses,
    isReady,
    now,
    pendingCount,
    overdueCount,
    submitAssignment,
    filterAssignments: (
      courseId: string,
      status: StatusFilter,
      dueDate: DueDateFilter,
      selectedDateKey?: string | null,
    ) =>
      filterStudentAssignments(assignments, {
        courseId,
        status,
        dueDate,
        selectedDateKey,
        now,
      }),
  };
}

export type { StudentAssignment, DueDateFilter, StatusFilter };
