import type { CourseSubject } from "@/lib/course-dataset";
import {
  buildEnrollmentTimetableEvents,
  type TimetableEvent,
} from "@/lib/timetable-events";
import { addDays, toDateKey } from "@/lib/timetable-week";
import type { StudentEnrollment } from "@/lib/student-enrollments";

export type AttendanceStatus = "present" | "absent" | "pending";

export type AttendanceEvent = TimetableEvent & {
  courseId: string;
  courseCode: string;
  courseName: string;
  status: AttendanceStatus;
  sessionEndAt: Date;
};

export type AttendanceOverview = {
  events: AttendanceEvent[];
  presentCount: number;
  totalCount: number;
  percentage: number;
};

export type AttendanceViewMode = "week" | "month";

export type AttendanceHeatmapColumn = {
  key: string;
  label: string;
};

export type CourseSessionMonthAttendance = {
  sessionLabel: string;
  presentCount: number;
  totalCount: number;
  percentage: number;
};

export type CourseMonthAttendanceSummary = {
  courseId: string;
  courseCode: string;
  courseName: string;
  presentCount: number;
  totalCount: number;
  percentage: number;
  sessions: CourseSessionMonthAttendance[];
};

const ATTENDANCE_EVENT_ID = /^(.+)-(\d{4}-\d{2}-\d{2})-(lecture|tutorial)$/;

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getAttendanceSessionEndAt(
  event: Pick<TimetableEvent, "weekMonday" | "dayIndex" | "endHour" | "endMinute">,
) {
  const sessionDate = addDays(parseDateKey(event.weekMonday), event.dayIndex);
  sessionDate.setHours(event.endHour, event.endMinute ?? 0, 0, 0);
  return sessionDate;
}

export function resolveAttendanceStatus(
  eventId: string,
  sessionEndAt: Date,
  scannedEventIds: Set<string>,
  now: Date = new Date(),
): AttendanceStatus {
  if (now < sessionEndAt) {
    return "pending";
  }

  return scannedEventIds.has(eventId) ? "present" : "absent";
}

function parseAttendanceEventId(eventId: string) {
  const match = eventId.match(ATTENDANCE_EVENT_ID);
  if (!match) {
    return null;
  }

  return {
    courseId: match[1],
    weekKey: match[2],
  };
}

function getFinalizedEvents(events: AttendanceEvent[]) {
  return events.filter((event) => event.status !== "pending");
}

function summarizeAttendanceEvents(events: AttendanceEvent[]) {
  const finalized = getFinalizedEvents(events);
  const presentCount = finalized.filter((event) => event.status === "present").length;
  const totalCount = finalized.length;

  return {
    presentCount,
    totalCount,
    percentage: totalCount === 0 ? 0 : Math.round((presentCount / totalCount) * 100),
  };
}

export function buildMonthCourseAttendanceSummaries(
  monthEvents: AttendanceEvent[],
): CourseMonthAttendanceSummary[] {
  const byCourse = new Map<string, AttendanceEvent[]>();

  monthEvents.forEach((event) => {
    const existing = byCourse.get(event.courseId);
    if (existing) {
      existing.push(event);
      return;
    }

    byCourse.set(event.courseId, [event]);
  });

  return Array.from(byCourse.entries())
    .map(([courseId, events]) => {
      const representative = events[0];
      const sessionGroups = new Map<string, AttendanceEvent[]>();

      events.forEach((event) => {
        const existing = sessionGroups.get(event.tag);
        if (existing) {
          existing.push(event);
          return;
        }

        sessionGroups.set(event.tag, [event]);
      });

      return {
        courseId,
        courseCode: representative.courseCode,
        courseName: representative.courseName,
        ...summarizeAttendanceEvents(events),
        sessions: Array.from(sessionGroups.entries())
          .map(([sessionLabel, sessionEvents]) => ({
            sessionLabel,
            ...summarizeAttendanceEvents(sessionEvents),
          }))
          .sort((left, right) => left.sessionLabel.localeCompare(right.sessionLabel)),
      };
    })
    .sort((left, right) => left.courseCode.localeCompare(right.courseCode));
}

type BuildAttendanceEventsOptions = {
  scannedEventIds?: Set<string>;
  now?: Date;
};

export function buildAttendanceEvents(
  enrollments: StudentEnrollment[],
  courses: CourseSubject[],
  semesterStartMonday: Date,
  options: BuildAttendanceEventsOptions = {},
): AttendanceEvent[] {
  const courseById = new Map(courses.map((course) => [course.id, course]));
  const scannedEventIds = options.scannedEventIds ?? new Set<string>();
  const now = options.now ?? new Date();

  return buildEnrollmentTimetableEvents(enrollments, courses, semesterStartMonday).flatMap((event) => {
    const parsed = parseAttendanceEventId(event.id);
    if (!parsed) {
      return [];
    }

    const course = courseById.get(parsed.courseId);
    if (!course) {
      return [];
    }

    const sessionEndAt = getAttendanceSessionEndAt(event);

    return [
      {
        ...event,
        courseId: course.id,
        courseCode: course.code,
        courseName: course.name,
        sessionEndAt,
        status: resolveAttendanceStatus(event.id, sessionEndAt, scannedEventIds, now),
      },
    ];
  });
}

export function buildAttendanceOverview(
  enrollments: StudentEnrollment[],
  courses: CourseSubject[],
  semesterStartMonday: Date,
  options: BuildAttendanceEventsOptions = {},
): AttendanceOverview {
  const events = buildAttendanceEvents(enrollments, courses, semesterStartMonday, options);

  return {
    events,
    ...summarizeAttendanceEvents(events),
  };
}

export function filterWeekAttendanceEvents(events: AttendanceEvent[], weekMonday: Date) {
  const weekKey = toDateKey(weekMonday);
  return events.filter((event) => event.weekMonday === weekKey);
}

export function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function clampMonthToSemester(
  monthDate: Date,
  semesterStartMonday: Date,
  semesterEndMonday: Date,
) {
  const monthStart = getMonthStart(monthDate);

  if (monthStart < getMonthStart(semesterStartMonday)) {
    return getMonthStart(semesterStartMonday);
  }

  if (monthStart > getMonthStart(semesterEndMonday)) {
    return getMonthStart(semesterEndMonday);
  }

  return monthStart;
}

function weekOverlapsMonth(weekMonday: Date, monthDate: Date) {
  const monthStart = getMonthStart(monthDate);
  const monthEnd = getMonthEnd(monthDate);
  const weekSunday = addDays(weekMonday, 6);
  weekSunday.setHours(23, 59, 59, 999);

  return weekSunday >= monthStart && weekMonday <= monthEnd;
}

export function getWeekMondaysForMonth(
  monthDate: Date,
  semesterStartMonday: Date,
  semesterEndMonday: Date,
) {
  const columns: AttendanceHeatmapColumn[] = [];
  let cursor = new Date(semesterStartMonday);

  while (cursor <= semesterEndMonday) {
    if (weekOverlapsMonth(cursor, monthDate)) {
      columns.push({
        key: toDateKey(cursor),
        label: cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }

    cursor = addDays(cursor, 7);
  }

  return columns;
}

export function filterMonthAttendanceEvents(
  events: AttendanceEvent[],
  monthDate: Date,
  semesterStartMonday: Date,
  semesterEndMonday: Date,
) {
  const weekKeys = new Set(
    getWeekMondaysForMonth(monthDate, semesterStartMonday, semesterEndMonday).map(
      (column) => column.key,
    ),
  );

  return events.filter((event) => weekKeys.has(event.weekMonday));
}

export function summarizeDisplayedAttendanceEvents(events: AttendanceEvent[]) {
  return summarizeAttendanceEvents(events);
}
