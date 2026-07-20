export type TutorialChoice = 1 | 2;

export type StudentEnrollment = {
  courseId: string;
  selectedTutorial: TutorialChoice;
  enrolledAt: string;
};

export const ENROLLMENTS_STORAGE_KEY = "camu-portal-student-enrollments";
export const SEMESTER_START_STORAGE_KEY = "camu-portal-semester-start";
export const LEGACY_ENROLLMENTS_STORAGE_KEY = "camu-portal-enrolled-course-ids";
