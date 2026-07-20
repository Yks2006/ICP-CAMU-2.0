"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useStudentAttendanceScans } from "@/hooks/useStudentAttendanceScans";
import { useStudentEnrollments } from "@/hooks/useStudentEnrollments";
import { COURSE_SUBJECTS } from "@/lib/course-dataset";
import {
  buildAttendanceEvents,
  buildMonthCourseAttendanceSummaries,
  clampMonthToSemester,
  filterMonthAttendanceEvents,
  filterWeekAttendanceEvents,
  formatMonthLabel,
  getMonthStart,
  summarizeDisplayedAttendanceEvents,
  type AttendanceEvent,
  type AttendanceStatus,
  type AttendanceViewMode,
  type CourseMonthAttendanceSummary,
} from "@/lib/student-attendance";
import {
  ATTENDANCE_SLOT_HEIGHT,
  getTimetableEventStyle,
  TIMETABLE_AXIS_LABEL_CLASS,
  TIMETABLE_TIME_SLOTS,
} from "@/lib/timetable-grid-utils";
import { getSemesterEndMonday } from "@/lib/timetable-events";
import {
  addDays,
  buildWeekDays,
  formatWeekRange,
  getWeekMonday,
  toDateKey,
} from "@/lib/timetable-week";
import { cn } from "@/lib/utils";

type AttendanceSummaryCardProps = {
  isReady: boolean;
};

const AXIS_LABEL_CLASS = TIMETABLE_AXIS_LABEL_CLASS;

function formatCompactHour(hour: number) {
  return `${hour}:00`;
}

function attendanceBlockClass(status: AttendanceStatus) {
  switch (status) {
    case "present":
      return "border-[#124687] bg-primary-container text-on-primary-container";
    case "absent":
      return "border-[#b85c54] bg-[#c96f63] text-white";
    case "pending":
      return "border-dashed border-[#7a8ea8] bg-[#d8e0ea] text-[#3a4d63]";
  }
}

function attendanceStatusLabel(status: AttendanceStatus) {
  switch (status) {
    case "present":
      return "Present";
    case "absent":
      return "Absent";
    case "pending":
      return "Not recorded yet";
  }
}

function AttendanceSessionBlock({ event }: { event: AttendanceEvent }) {
  const { top, height } = getTimetableEventStyle(event, ATTENDANCE_SLOT_HEIGHT);

  return (
    <div
      className={cn(
        "absolute right-0.5 left-0.5 flex flex-col items-center justify-center rounded-lg border px-1 py-0.5 text-center shadow-sm",
        attendanceBlockClass(event.status),
      )}
      style={{ top, height }}
      title={`${event.courseCode} • ${event.courseName} • ${event.tag} • ${attendanceStatusLabel(event.status)}`}
    >
      <p className="line-clamp-1 text-[12px] font-bold leading-tight">{event.courseCode}</p>
      <p className="line-clamp-2 text-[11px] leading-snug opacity-90">{event.courseName}</p>
    </div>
  );
}

function MonthCourseAttendanceBox({ summary }: { summary: CourseMonthAttendanceSummary }) {
  return (
    <div className="flex h-full min-w-0 flex-col rounded-xl border border-[#124687]/20 bg-surface-container-low p-3 shadow-sm">
      <p className="truncate text-label-sm font-label-md text-primary-container">{summary.courseCode}</p>
      <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-[11px] leading-snug text-on-surface-variant">
        {summary.courseName}
      </p>

      <div className="mt-3">
        <p className="text-headline-sm font-headline-sm text-primary-container">
          {summary.totalCount === 0 ? "—" : `${summary.percentage}%`}
        </p>
        <p className="mt-0.5 text-[10px] text-on-surface-variant">
          {summary.totalCount === 0
            ? "No completed sessions yet"
            : `${summary.presentCount} / ${summary.totalCount} attended`}
        </p>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-outline-variant/50">
        <div
          className="h-full rounded-full bg-primary-container transition-all"
          style={{ width: summary.totalCount === 0 ? "0%" : `${summary.percentage}%` }}
        />
      </div>

      <div className="mt-3 space-y-2">
        {summary.sessions.map((session) => (
          <div
            key={`${summary.courseId}-${session.sessionLabel}`}
            className="rounded-lg border border-outline-variant bg-surface-container-high px-2 py-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
                {session.sessionLabel}
              </p>
              <p className="text-[10px] font-bold text-primary-container">
                {session.totalCount === 0 ? "—" : `${session.percentage}%`}
              </p>
            </div>
            <p className="mt-0.5 text-[9px] text-on-surface-variant">
              {session.totalCount === 0
                ? "No completed sessions"
                : `${session.presentCount}/${session.totalCount}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AttendanceSummaryCard({ isReady }: AttendanceSummaryCardProps) {
  const { enrollments, semesterStart } = useStudentEnrollments();
  const { scannedEventIds, isReady: scansReady } = useStudentAttendanceScans();
  const [viewMode, setViewMode] = useState<AttendanceViewMode>("week");
  const [weekMonday, setWeekMonday] = useState(() => getWeekMonday(new Date()));
  const [viewMonth, setViewMonth] = useState(() => getMonthStart(new Date()));
  const [now, setNow] = useState(() => new Date());
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const semesterStartMonday = useMemo(() => getWeekMonday(semesterStart), [semesterStart]);
  const semesterEndMonday = useMemo(
    () => getSemesterEndMonday(semesterStartMonday),
    [semesterStartMonday],
  );
  const semesterMonthStart = useMemo(() => getMonthStart(semesterStartMonday), [semesterStartMonday]);
  const semesterMonthEnd = useMemo(() => getMonthStart(semesterEndMonday), [semesterEndMonday]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    setWeekMonday((current) => {
      if (current < semesterStartMonday) {
        return semesterStartMonday;
      }

      if (current > semesterEndMonday) {
        return semesterEndMonday;
      }

      return current;
    });

    setViewMonth((current) =>
      clampMonthToSemester(current, semesterStartMonday, semesterEndMonday),
    );
  }, [isReady, semesterStartMonday, semesterEndMonday]);

  const allEvents = useMemo(
    () =>
      buildAttendanceEvents(enrollments, COURSE_SUBJECTS, semesterStartMonday, {
        scannedEventIds,
        now,
      }),
    [enrollments, now, scannedEventIds, semesterStartMonday],
  );

  const weekDays = useMemo(() => buildWeekDays(weekMonday, today), [weekMonday, today]);
  const weekRangeLabel = formatWeekRange(weekMonday);
  const monthRangeLabel = formatMonthLabel(viewMonth);
  const weekKey = toDateKey(weekMonday);
  const isAtSemesterStart = weekMonday.getTime() <= semesterStartMonday.getTime();
  const isAtSemesterEnd = weekMonday.getTime() >= semesterEndMonday.getTime();
  const isAtSemesterMonthStart = viewMonth.getTime() <= semesterMonthStart.getTime();
  const isAtSemesterMonthEnd = viewMonth.getTime() >= semesterMonthEnd.getTime();
  const attendanceReady = isReady && scansReady;
  const hasEnrollments = enrollments.length > 0;

  const monthEvents = useMemo(
    () =>
      filterMonthAttendanceEvents(allEvents, viewMonth, semesterStartMonday, semesterEndMonday),
    [allEvents, semesterEndMonday, semesterStartMonday, viewMonth],
  );

  const weekEvents = useMemo(
    () => filterWeekAttendanceEvents(allEvents, weekMonday),
    [allEvents, weekMonday],
  );

  const monthCourseSummaries = useMemo(
    () => buildMonthCourseAttendanceSummaries(monthEvents),
    [monthEvents],
  );

  const summary = useMemo(() => {
    if (viewMode === "month") {
      return summarizeDisplayedAttendanceEvents(monthEvents);
    }

    return summarizeDisplayedAttendanceEvents(weekEvents);
  }, [monthEvents, viewMode, weekEvents]);

  const gridHeight = ATTENDANCE_SLOT_HEIGHT * TIMETABLE_TIME_SLOTS.length;
  const hasViewContent = viewMode === "week" ? weekEvents.length > 0 : monthCourseSummaries.length > 0;

  const goToPreviousWeek = () => {
    setWeekMonday((current) => {
      const next = addDays(current, -7);
      return next < semesterStartMonday ? semesterStartMonday : next;
    });
  };

  const goToNextWeek = () => {
    setWeekMonday((current) => {
      const next = addDays(current, 7);
      return next > semesterEndMonday ? semesterEndMonday : next;
    });
  };

  const goToPreviousMonth = () => {
    setViewMonth((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() - 1, 1);
      return clampMonthToSemester(next, semesterStartMonday, semesterEndMonday);
    });
  };

  const goToNextMonth = () => {
    setViewMonth((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      return clampMonthToSemester(next, semesterStartMonday, semesterEndMonday);
    });
  };

  return (
    <div className="portal-section overflow-hidden rounded-xl border border-[#124687]/20 bg-[#c5ddb8] shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#124687]/15 bg-[#b8cfb0]/90 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-headline-sm font-headline-sm text-on-surface">Attendance Summary</h3>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {viewMode === "week"
              ? "Classes before session end show as not recorded. Present or absent appears only after class ends and QR attendance is submitted or missed."
              : "Monthly attendance counts only completed sessions with recorded QR attendance."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-[#a8bf9c] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all",
                viewMode === "week"
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface hover:bg-[#c5ddb8]",
              )}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all",
                viewMode === "month"
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface hover:bg-[#c5ddb8]",
              )}
            >
              Month
            </button>
          </div>

          <div className="flex rounded-xl bg-[#a8bf9c] p-0.5">
            <button
              type="button"
              onClick={viewMode === "week" ? goToPreviousWeek : goToPreviousMonth}
              disabled={
                !attendanceReady ||
                (viewMode === "week" ? isAtSemesterStart : isAtSemesterMonthStart)
              }
              className="rounded-lg p-1 transition-all hover:bg-[#c5ddb8] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={viewMode === "week" ? "Previous week" : "Previous month"}
            >
              <MaterialIcon icon="chevron_left" className="text-[16px]" />
            </button>
            <div className="flex min-w-[170px] items-center justify-center px-2 text-[11px] font-bold text-on-surface">
              {viewMode === "week" ? weekRangeLabel : monthRangeLabel}
            </div>
            <button
              type="button"
              onClick={viewMode === "week" ? goToNextWeek : goToNextMonth}
              disabled={!attendanceReady || (viewMode === "week" ? isAtSemesterEnd : isAtSemesterMonthEnd)}
              className="rounded-lg p-1 transition-all hover:bg-[#c5ddb8] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={viewMode === "week" ? "Next week" : "Next month"}
            >
              <MaterialIcon icon="chevron_right" className="text-[16px]" />
            </button>
          </div>
        </div>
      </div>

      {!attendanceReady ? (
        <p className="px-5 py-8 text-body-md text-on-surface-variant">Loading attendance summaries...</p>
      ) : !hasEnrollments ? (
        <div className="mx-5 mb-5 rounded-xl border border-outline-variant bg-surface-container-low px-6 py-8 text-center">
          <p className="text-body-md text-on-surface-variant">
            You are not enrolled in any classes yet. Enroll from{" "}
            <Link href="/my-courses" className="font-label-md text-primary hover:underline">
              My Courses
            </Link>{" "}
            to view attendance summaries here.
          </p>
        </div>
      ) : !hasViewContent ? (
        <div className="mx-5 mb-5 rounded-xl border border-outline-variant bg-surface-container-low px-6 py-8 text-center">
          <p className="text-body-md text-on-surface-variant">
            No classes scheduled for this {viewMode === "week" ? "week" : "month"}.
          </p>
        </div>
      ) : viewMode === "month" ? (
        <>
          <div className="overflow-x-auto px-5 pb-1">
            <div
              className="grid grid-rows-1 gap-3"
              style={{
                gridTemplateColumns:
                  monthCourseSummaries.length > 5
                    ? `repeat(${monthCourseSummaries.length}, minmax(160px, 1fr))`
                    : "repeat(5, minmax(0, 1fr))",
              }}
            >
              {monthCourseSummaries.map((courseSummary) => (
                <MonthCourseAttendanceBox key={courseSummary.courseId} summary={courseSummary} />
              ))}
            </div>
          </div>

          <div className="mx-5 mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-4 text-label-sm">
            <p className="text-on-surface-variant">Monthly attendance by enrolled course</p>
            <div className="text-right">
              <p className="text-on-surface-variant">
                {summary.totalCount === 0
                  ? "No completed sessions this month"
                  : `This month: ${summary.presentCount} present / ${summary.totalCount} completed sessions`}
              </p>
              <p className="font-label-md text-primary-container">
                {summary.totalCount === 0 ? "—" : `${summary.percentage}% monthly attendance`}
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mx-5 mb-5 overflow-hidden rounded-xl border border-[#124687]/20 bg-surface-container">
            <div className="calendar-grid border-b border-outline-variant bg-surface-container-high">
              <div className="flex h-9 items-center justify-center border-r border-outline-variant">
                <MaterialIcon icon="schedule" className="text-[14px] text-outline" />
              </div>
              {weekDays.map((day) => (
                <div
                  key={`${weekKey}-header-${day.label}`}
                  className={cn(
                    "flex h-9 flex-col items-center justify-center gap-0.5 border-r border-outline-variant last:border-r-0",
                    day.today && "bg-primary-container/10",
                    day.weekend && "bg-surface-container-high",
                  )}
                >
                  <span
                    className={cn(
                      AXIS_LABEL_CLASS,
                      "uppercase tracking-tighter",
                      day.today ? "text-primary-container" : day.weekend ? "text-outline" : "text-on-surface-variant",
                    )}
                  >
                    {day.label}
                  </span>
                  <span
                    className={cn(
                      AXIS_LABEL_CLASS,
                      day.today ? "text-primary-container" : "text-on-surface",
                    )}
                  >
                    {day.date}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative overflow-hidden">
              <div className="calendar-grid" style={{ height: gridHeight }}>
                <div
                  className="border-r border-outline-variant bg-surface-container-high"
                  style={{ height: gridHeight }}
                >
                  {TIMETABLE_TIME_SLOTS.map((slot, slotIndex) => (
                    <div
                      key={slot.label}
                      className={cn(
                        "flex items-start justify-center border-outline-variant/30 pt-0.5",
                        slotIndex < TIMETABLE_TIME_SLOTS.length - 1 && "border-b",
                      )}
                      style={{ height: ATTENDANCE_SLOT_HEIGHT }}
                    >
                      <span className={cn(AXIS_LABEL_CLASS, "text-on-surface-variant")}>
                        {formatCompactHour(slot.hour)}
                      </span>
                    </div>
                  ))}
                </div>

                {weekDays.map((day, dayIndex) => {
                  const dayEvents = weekEvents.filter((event) => event.dayIndex === dayIndex);

                  return (
                    <div
                      key={`${weekKey}-col-${day.label}`}
                      className={cn(
                        "relative border-r border-outline-variant/30 p-0.5 last:border-r-0",
                        day.today && "bg-primary-container/8",
                        day.weekend && "bg-surface-container-high/70",
                      )}
                      style={{ height: gridHeight }}
                    >
                      {day.weekend ? (
                        <div className="flex h-full items-center justify-center">
                          <p className="-rotate-90 whitespace-nowrap text-[10px] text-outline">
                            No Academic Activities
                          </p>
                        </div>
                      ) : (
                        dayEvents.map((event) => <AttendanceSessionBlock key={event.id} event={event} />)
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mx-5 mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-4 text-label-sm">
            <div className="flex items-center gap-4 text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-[#124687] bg-primary-container" />
                Present
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-[#b85c54] bg-[#c96f63]" />
                Absent
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-dashed border-[#7a8ea8] bg-[#d8e0ea]" />
                Not recorded
              </span>
            </div>
            <div className="text-right">
              <p className="text-on-surface-variant">
                {summary.totalCount === 0
                  ? "No completed sessions this week"
                  : `This week: ${summary.presentCount} present / ${summary.totalCount} completed sessions`}
              </p>
              <p className="font-label-md text-primary-container">
                {summary.totalCount === 0 ? "—" : `${summary.percentage}% weekly attendance`}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
