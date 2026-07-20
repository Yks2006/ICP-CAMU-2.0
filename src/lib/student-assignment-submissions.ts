export type AssignmentSubmission = {
  assignmentId: string;
  submittedAt: string;
};

export const ASSIGNMENT_SUBMISSIONS_STORAGE_KEY = "camu-portal-assignment-submissions";

export function readAssignmentSubmissions(): AssignmentSubmission[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(ASSIGNMENT_SUBMISSIONS_STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as AssignmentSubmission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistAssignmentSubmissions(submissions: AssignmentSubmission[]) {
  window.localStorage.setItem(ASSIGNMENT_SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
}

export function isAssignmentSubmitted(
  assignmentId: string,
  submissions: AssignmentSubmission[],
) {
  return submissions.some((item) => item.assignmentId === assignmentId);
}
