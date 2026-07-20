import type { CourseSubject } from "@/lib/course-dataset";
import { parseScheduleSlot } from "@/lib/course-schedule";
import type { PortalNotification } from "@/lib/portal-notifications";
import { getSemesterEndMonday } from "@/lib/timetable-events";
import { getWeekMonday, toDateKey } from "@/lib/timetable-week";
import type { StudentEnrollment } from "@/lib/student-enrollments";

export const CLASS_REMINDER_MINUTES_BEFORE = 30;

function getTodayDayIndex(now: Date) {
  const day = now.getDay();
  return day === 0 ? 6 : day - 1;
}

function setTimeOnDate(date: Date, hour: number, minute: number) {
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

export function formatClassTimeLabel(hour: number, minute: number) {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const minuteLabel = minute > 0 ? `:${String(minute).padStart(2, "0")}` : ":00";
  return `${displayHour}${minuteLabel} ${period}`;
}

function isWithinSemesterWeekday(now: Date, semesterStart: Date) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const semesterMonday = getWeekMonday(semesterStart);
  semesterMonday.setHours(0, 0, 0, 0);
  const semesterEnd = getSemesterEndMonday(semesterStart);
  semesterEnd.setHours(23, 59, 59, 999);

  const dayIndex = getTodayDayIndex(now);
  const isWeekday = dayIndex >= 0 && dayIndex <= 4;

  return isWeekday && today >= semesterMonday && today <= semesterEnd;
}

type ClassSession = {
  course: CourseSubject;
  sessionType: "lecture" | "tutorial";
  slot: NonNullable<ReturnType<typeof parseScheduleSlot>>;
  venue: string;
};

function buildClassReminderMessage(
  session: ClassSession,
  classStart: Date,
  now: Date,
) {
  const timeLabel = formatClassTimeLabel(session.slot.startHour, session.slot.startMinute);
  const minutesUntil = Math.max(0, Math.round((classStart.getTime() - now.getTime()) / 60_000));
  const sessionLabel = session.sessionType === "lecture" ? "lecture" : "tutorial";

  if (minutesUntil === 0) {
    return `Your ${session.course.code} ${sessionLabel} for ${session.course.name} is starting now at ${session.venue}.`;
  }

  return `Your ${session.course.code} ${sessionLabel} for ${session.course.name} starts at ${timeLabel} in ${session.venue}. Please head to class in ${minutesUntil} minute${minutesUntil === 1 ? "" : "s"}.`;
}

export function buildClassReminderNotifications(
  enrollments: StudentEnrollment[],
  courses: CourseSubject[],
  semesterStart: Date,
  now = new Date(),
): PortalNotification[] {
  if (!isWithinSemesterWeekday(now, semesterStart) || enrollments.length === 0) {
    return [];
  }

  const todayDayIndex = getTodayDayIndex(now);
  const dateKey = toDateKey(now);
  const notifications: PortalNotification[] = [];

  enrollments.forEach((enrollment) => {
    const course = courses.find((item) => item.id === enrollment.courseId);
    if (!course) {
      return;
    }

    const tutorialSchedule =
      enrollment.selectedTutorial === 1 ? course.tutorial1 : course.tutorial2;
    const tutorialVenue =
      enrollment.selectedTutorial === 1 ? course.tutorial1Venue : course.tutorial2Venue;

    const sessionCandidates = [
      {
        course,
        sessionType: "lecture" as const,
        schedule: course.lecture,
        venue: course.lectureVenue,
      },
      {
        course,
        sessionType: "tutorial" as const,
        schedule: tutorialSchedule,
        venue: tutorialVenue,
      },
    ];

    sessionCandidates.forEach(({ course: subject, sessionType, schedule, venue }) => {
      const slot = parseScheduleSlot(schedule);
      if (!slot) {
        return;
      }

      const session: ClassSession = {
        course: subject,
        sessionType,
        slot,
        venue,
      };

      if (session.slot.dayIndex !== todayDayIndex) {
        return;
      }

      const classStart = setTimeOnDate(now, session.slot.startHour, session.slot.startMinute);
      const classEnd = setTimeOnDate(now, session.slot.endHour, session.slot.endMinute);
      const reminderStart = new Date(classStart.getTime() - CLASS_REMINDER_MINUTES_BEFORE * 60_000);

      if (now < reminderStart || now >= classEnd) {
        return;
      }

      notifications.push({
        id: `class-reminder-${dateKey}-${course.id}-${session.sessionType}`,
        category: "class-reminder",
        title: "Class Starting Soon",
        message: buildClassReminderMessage(session, classStart, now),
        createdAt: reminderStart.toISOString(),
        actionLabel: "View Timetable",
        actionHref: "/timetable",
      });
    });
  });

  return notifications.sort(
    (first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime(),
  );
}
