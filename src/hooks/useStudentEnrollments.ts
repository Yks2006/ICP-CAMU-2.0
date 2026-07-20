"use client";

import { useCallback, useEffect, useState } from "react";
import { COURSE_SUBJECTS, type CourseSubject } from "@/lib/course-dataset";
import {
  ENROLLMENTS_STORAGE_KEY,
  LEGACY_ENROLLMENTS_STORAGE_KEY,
  SEMESTER_START_STORAGE_KEY,
  type StudentEnrollment,
  type TutorialChoice,
} from "@/lib/student-enrollments";
import { getWeekMonday, toDateKey } from "@/lib/timetable-week";

export type { StudentEnrollment, TutorialChoice };

function readEnrollments(): StudentEnrollment[] {
  const stored = window.localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as StudentEnrollment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readSemesterStart(): Date {
  const stored = window.localStorage.getItem(SEMESTER_START_STORAGE_KEY);
  if (stored) {
    const parsed = new Date(stored);
    if (!Number.isNaN(parsed.getTime())) {
      return getWeekMonday(parsed);
    }
  }

  const start = getWeekMonday(new Date());
  window.localStorage.setItem(SEMESTER_START_STORAGE_KEY, start.toISOString());
  return start;
}

function persistEnrollments(enrollments: StudentEnrollment[]) {
  window.localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(enrollments));
}

export function useStudentEnrollments() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [semesterStart, setSemesterStart] = useState<Date>(() => getWeekMonday(new Date()));
  const [isReady, setIsReady] = useState(false);

  const syncFromStorage = useCallback(() => {
    const legacy = window.localStorage.getItem(LEGACY_ENROLLMENTS_STORAGE_KEY);
    if (legacy && !window.localStorage.getItem(ENROLLMENTS_STORAGE_KEY)) {
      try {
        const legacyIds = JSON.parse(legacy) as string[];
        if (Array.isArray(legacyIds)) {
          const migrated = legacyIds.map((courseId) => ({
            courseId,
            selectedTutorial: 1 as TutorialChoice,
            enrolledAt: new Date().toISOString(),
          }));
          persistEnrollments(migrated);
        }
      } catch {
        persistEnrollments([]);
      }
      window.localStorage.removeItem(LEGACY_ENROLLMENTS_STORAGE_KEY);
    }

    setEnrollments(readEnrollments());
    setSemesterStart(readSemesterStart());
    setIsReady(true);
  }, []);

  useEffect(() => {
    syncFromStorage();

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === ENROLLMENTS_STORAGE_KEY ||
        event.key === SEMESTER_START_STORAGE_KEY ||
        event.key === LEGACY_ENROLLMENTS_STORAGE_KEY
      ) {
        syncFromStorage();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [syncFromStorage]);

  const enroll = useCallback((courseId: string, selectedTutorial: TutorialChoice) => {
    setEnrollments((current) => {
      if (current.some((item) => item.courseId === courseId)) {
        return current;
      }

      const next: StudentEnrollment[] = [
        ...current,
        {
          courseId,
          selectedTutorial,
          enrolledAt: new Date().toISOString(),
        },
      ];

      persistEnrollments(next);
      return next;
    });
  }, []);

  const withdraw = useCallback((courseId: string) => {
    setEnrollments((current) => {
      const next = current.filter((item) => item.courseId !== courseId);
      persistEnrollments(next);
      return next;
    });
  }, []);

  const enrolledCourses = enrollments
    .map((enrollment) => {
      const course = COURSE_SUBJECTS.find((item) => item.id === enrollment.courseId);
      if (!course) {
        return null;
      }

      return { enrollment, course };
    })
    .filter((item): item is { enrollment: StudentEnrollment; course: CourseSubject } => item !== null);

  const enrolledIds = enrollments.map((item) => item.courseId);

  return {
    enrollments,
    enrolledIds,
    enrolledCourses,
    semesterStart,
    semesterStartKey: toDateKey(getWeekMonday(semesterStart)),
    enroll,
    withdraw,
    isReady,
    isEnrolled: (courseId: string) => enrolledIds.includes(courseId),
  };
}
