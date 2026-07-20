import type { CourseSubject } from "@/lib/course-dataset";
import {
  buildStudentAssignments,
  formatAssignmentDueDate,
  getAssignmentDueDate,
} from "@/lib/course-assignments";
import { buildClassReminderNotifications } from "@/lib/class-reminder-notifications";
import type { AssignmentSubmission } from "@/lib/student-assignment-submissions";
import type { StudentEnrollment } from "@/lib/student-enrollments";

export type NotificationCategory =
  | "announcement"
  | "assignment-deadline"
  | "timetable-update"
  | "fee-payment"
  | "course-feedback"
  | "university-alert"
  | "class-reminder";

export type PortalNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: string;
  actionLabel?: string;
  actionHref?: string;
};

export const NOTIFICATION_CATEGORY_META: Record<
  NotificationCategory,
  { label: string; icon: string; accentClass: string; iconClass: string; borderClass: string }
> = {
  announcement: {
    label: "Announcement",
    icon: "campaign",
    accentClass: "bg-primary",
    iconClass: "bg-secondary-fixed text-primary",
    borderClass: "border-pastel-blue-border bg-pastel-blue/30",
  },
  "assignment-deadline": {
    label: "Assignment Deadline",
    icon: "assignment_late",
    accentClass: "bg-warning",
    iconClass: "bg-tertiary-fixed text-tertiary",
    borderClass: "border-pastel-yellow-border bg-pastel-yellow/35",
  },
  "timetable-update": {
    label: "Timetable Update",
    icon: "event_note",
    accentClass: "bg-primary",
    iconClass: "bg-secondary-fixed text-primary",
    borderClass: "border-pastel-purple-border bg-pastel-purple/30",
  },
  "fee-payment": {
    label: "Fee Payment",
    icon: "payments",
    accentClass: "bg-success",
    iconClass: "bg-emerald-50 text-success",
    borderClass: "border-pastel-green-border bg-pastel-green/35",
  },
  "course-feedback": {
    label: "Course Feedback",
    icon: "rate_review",
    accentClass: "bg-primary",
    iconClass: "bg-surface-container-high text-on-surface-variant",
    borderClass: "border-pastel-coral-border bg-pastel-coral/30",
  },
  "university-alert": {
    label: "University Alert",
    icon: "warning",
    accentClass: "bg-error",
    iconClass: "bg-error-container text-error",
    borderClass: "border-pastel-coral-border bg-pastel-coral/35",
  },
  "class-reminder": {
    label: "Class Reminder",
    icon: "school",
    accentClass: "bg-warning",
    iconClass: "bg-warning/20 text-warning",
    borderClass: "border-pastel-yellow-border bg-pastel-yellow/40",
  },
};

function hoursAgo(hours: number) {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

function daysAgo(days: number, hour = 10) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function buildStaticNotifications(): PortalNotification[] {
  return [
    {
      id: "alert-campus-maintenance",
      category: "university-alert",
      title: "Campus Maintenance Advisory",
      message:
        "Block C will undergo electrical maintenance this Saturday from 8:00 AM to 6:00 PM. Plan alternative study spaces if needed.",
      createdAt: hoursAgo(2),
    },
    {
      id: "announcement-semester-calendar",
      category: "announcement",
      title: "Semester Calendar Published",
      message:
        "The official academic calendar for the current semester is now available. Review key dates for add/drop, mid-semester break, and finals.",
      createdAt: daysAgo(1, 9),
      actionLabel: "View Calendar",
    },
    {
      id: "fee-payment-reminder",
      category: "fee-payment",
      title: "Semester Fee Payment Reminder",
      message:
        "Your semester fee balance is due by the end of this month. Settle outstanding payments to avoid registration holds.",
      createdAt: daysAgo(2, 14),
      actionLabel: "View Payment Details",
    },
    {
      id: "announcement-library-hours",
      category: "announcement",
      title: "Extended Library Hours",
      message:
        "The main library will operate until 11:00 PM on weekdays during the examination preparation period.",
      createdAt: daysAgo(4, 11),
    },
    {
      id: "fee-payment-receipt",
      category: "fee-payment",
      title: "Fee Payment Received",
      message:
        "Transaction ID: TXN-2026-44821. Your recent semester fee instalment has been successfully recorded.",
      createdAt: daysAgo(6, 16),
      actionLabel: "Download Receipt",
    },
    {
      id: "alert-weather-advisory",
      category: "university-alert",
      title: "Severe Weather Advisory",
      message:
        "Heavy rainfall is expected this week. Allow extra travel time and monitor official channels for any class suspension updates.",
      createdAt: daysAgo(5, 8),
    },
  ];
}

function buildEnrollmentNotifications(
  enrolledCourses: CourseSubject[],
  semesterStart: Date,
  submissions: AssignmentSubmission[],
): PortalNotification[] {
  if (enrolledCourses.length === 0) {
    return [];
  }

  const notifications: PortalNotification[] = [];
  const primaryCourse = enrolledCourses[0];
  const secondaryCourse = enrolledCourses[1] ?? enrolledCourses[0];

  const assignments = buildStudentAssignments(
    enrolledCourses.map((course) => course.id),
    enrolledCourses,
    semesterStart,
    submissions,
  );

  const upcomingAssignment = assignments.find((assignment) => assignment.status === "pending");
  if (upcomingAssignment) {
    notifications.push({
      id: `assignment-due-${upcomingAssignment.id}`,
      category: "assignment-deadline",
      title: "Assignment Due Soon",
      message: `${upcomingAssignment.title} (${upcomingAssignment.courseCode}) is due on ${formatAssignmentDueDate(upcomingAssignment.dueDate)}. Submit before the deadline to avoid penalties.`,
      createdAt: hoursAgo(5),
      actionLabel: "Go to Assignment",
      actionHref: "/assignment-dashboard",
    });
  }

  const nextAssignment = assignments.find(
    (assignment) => assignment.status === "pending" && assignment.id !== upcomingAssignment?.id,
  );
  if (nextAssignment) {
    const dueDate = getAssignmentDueDate(semesterStart, nextAssignment.dueWeek);
    notifications.push({
      id: `assignment-upcoming-${nextAssignment.id}`,
      category: "assignment-deadline",
      title: "Upcoming Assignment",
      message: `Prepare for ${nextAssignment.title} in ${nextAssignment.courseCode}. The due date is ${formatAssignmentDueDate(dueDate)}.`,
      createdAt: daysAgo(3, 15),
      actionLabel: "View Assignment",
      actionHref: "/assignment-dashboard",
    });
  }

  notifications.push({
    id: `timetable-venue-${primaryCourse.id}`,
    category: "timetable-update",
    title: "Lecture Venue Updated",
    message: `Your ${primaryCourse.code} lecture venue is confirmed as ${primaryCourse.lectureVenue}. Check your weekly timetable for the full schedule.`,
    createdAt: daysAgo(1, 16),
    actionLabel: "Check Timetable",
    actionHref: "/timetable",
  });

  notifications.push({
    id: `timetable-tutorial-${secondaryCourse.id}`,
    category: "timetable-update",
    title: "Tutorial Schedule Reminder",
    message: `${secondaryCourse.code} tutorial sessions remain on your selected slot this semester. Review any timetable changes in the portal.`,
    createdAt: daysAgo(3, 13),
    actionLabel: "Open Timetable",
    actionHref: "/timetable",
  });

  notifications.push({
    id: `feedback-${primaryCourse.id}`,
    category: "course-feedback",
    title: "Course Feedback Request",
    message: `Share your feedback for ${primaryCourse.name} (${primaryCourse.code}). Your responses help improve teaching quality for future semesters.`,
    createdAt: daysAgo(2, 10),
    actionLabel: "Fill Feedback",
  });

  if (enrolledCourses.length > 1) {
    notifications.push({
      id: `feedback-${secondaryCourse.id}`,
      category: "course-feedback",
      title: "Mid-Semester Course Survey",
      message: `Please complete the mid-semester survey for ${secondaryCourse.name} (${secondaryCourse.code}) before the end of this week.`,
      createdAt: daysAgo(7, 9),
      actionLabel: "Start Survey",
    });
  }

  return notifications;
}

export function buildPortalNotifications(
  enrollments: StudentEnrollment[],
  courses: CourseSubject[],
  semesterStart: Date,
  submissions: AssignmentSubmission[],
  now = new Date(),
): PortalNotification[] {
  const enrolledCourses = courses.filter((course) =>
    enrollments.some((enrollment) => enrollment.courseId === course.id),
  );

  const combined = [
    ...buildClassReminderNotifications(enrollments, courses, semesterStart, now),
    ...buildStaticNotifications(),
    ...buildEnrollmentNotifications(enrolledCourses, semesterStart, submissions),
  ];

  return combined.sort(
    (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );
}

export function formatNotificationTimestamp(isoDate: string, now = new Date()) {
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMinutes < 1) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }
  if (diffHours < 24 && now.toDateString() === date.toDateString()) {
    return `${diffHours}h ago`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit" })}`;
  }

  return date.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getNotificationDateGroup(isoDate: string, now = new Date()) {
  const date = new Date(isoDate);

  if (date.toDateString() === now.toDateString()) {
    return "Today";
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}

export function groupNotificationsByDate<T extends PortalNotification>(
  notifications: T[],
  now = new Date(),
): Array<[string, T[]]> {
  const groups = new Map<string, T[]>();

  notifications.forEach((notification) => {
    const label = getNotificationDateGroup(notification.createdAt, now);
    const existing = groups.get(label) ?? [];
    existing.push(notification);
    groups.set(label, existing);
  });

  return Array.from(groups.entries());
}
