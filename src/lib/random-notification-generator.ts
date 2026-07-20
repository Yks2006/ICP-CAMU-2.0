import type { NotificationCategory, PortalNotification } from "@/lib/portal-notifications";

const NOTIFICATION_TEMPLATES: Record<
  NotificationCategory,
  Array<{ title: string; message: string; actionLabel?: string; actionHref?: string }>
> = {
  announcement: [
    {
      title: "New Campus Announcement",
      message:
        "The Student Affairs office has posted a new bulletin about semester registration procedures. Review the update in the portal.",
      actionLabel: "Read Announcement",
    },
    {
      title: "Career Fair Registration Open",
      message:
        "Register now for the upcoming university career fair. Early registration gives you priority access to employer booths.",
      actionLabel: "Register Now",
    },
    {
      title: "Student Club Activity Week",
      message:
        "Student clubs are hosting activity booths this week at the main concourse. Join events to earn co-curricular participation credits.",
    },
  ],
  "assignment-deadline": [
    {
      title: "Assignment Deadline Reminder",
      message:
        "Your pending coursework submission is due within 48 hours. Upload your work before the deadline to avoid late penalties.",
      actionLabel: "Go to Assignment",
      actionHref: "/assignment-dashboard",
    },
    {
      title: "Late Submission Window Closing",
      message:
        "The grace period for a recent assignment is ending tonight at 11:59 PM. Submit immediately if you have not completed it.",
      actionLabel: "Submit Now",
      actionHref: "/assignment-dashboard",
    },
  ],
  "timetable-update": [
    {
      title: "Timetable Change Notice",
      message:
        "One of your tutorial sessions has been moved to a new room this week. Check your timetable for the updated venue and time.",
      actionLabel: "View Timetable",
      actionHref: "/timetable",
    },
    {
      title: "Public Holiday Class Adjustment",
      message:
        "Classes scheduled on the upcoming public holiday will be rescheduled. Review your timetable for replacement slots.",
      actionLabel: "Open Timetable",
      actionHref: "/timetable",
    },
  ],
  "fee-payment": [
    {
      title: "Outstanding Fee Reminder",
      message:
        "You have an outstanding semester fee balance. Settle the payment before the due date to avoid registration restrictions.",
      actionLabel: "View Payment Details",
    },
    {
      title: "Payment Confirmation Pending",
      message:
        "Your recent online fee payment is being processed. You will receive another update once the transaction is confirmed.",
    },
  ],
  "course-feedback": [
    {
      title: "Course Feedback Request",
      message:
        "Please share your feedback for one of your enrolled courses. Your responses help improve teaching quality.",
      actionLabel: "Fill Feedback",
    },
    {
      title: "Mid-Semester Survey Available",
      message:
        "A mid-semester course survey is now open. Complete it before the end of this week.",
      actionLabel: "Start Survey",
    },
  ],
  "university-alert": [
    {
      title: "Campus Safety Advisory",
      message:
        "Please follow updated campus safety guidelines during peak hours. Report any concerns to campus security immediately.",
    },
    {
      title: "System Maintenance Alert",
      message:
        "The student portal will undergo scheduled maintenance tonight from 11:00 PM to 1:00 AM. Save your work in advance.",
    },
  ],
  "class-reminder": [
    {
      title: "Class Starting Soon",
      message:
        "Your lecture begins in 30 minutes. Head to your assigned venue and bring any required materials for today's session.",
      actionLabel: "View Timetable",
      actionHref: "/timetable",
    },
    {
      title: "Tutorial Session Reminder",
      message:
        "Your tutorial starts in 30 minutes. Review this week's topic notes before attending the session.",
      actionLabel: "Open Timetable",
      actionHref: "/timetable",
    },
  ],
};

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function createNotificationId() {
  return `generated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function generateRandomNotification(now = new Date()): PortalNotification {
  const category = pickRandom(Object.keys(NOTIFICATION_TEMPLATES) as NotificationCategory[]);
  const template = pickRandom(NOTIFICATION_TEMPLATES[category]);

  return {
    id: createNotificationId(),
    category,
    title: template.title,
    message: template.message,
    createdAt: now.toISOString(),
    actionLabel: template.actionLabel,
    actionHref: template.actionHref,
  };
}
