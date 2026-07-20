"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { TimetableExportGrid } from "@/components/TimetableExportGrid";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStudentEnrollments } from "@/hooks/useStudentEnrollments";
import { COURSE_SUBJECTS } from "@/lib/course-dataset";
import {
  downloadTimetableSchedule,
  type ScheduleFormat,
} from "@/lib/timetable-export";
import {
  formatTimetableEventTime,
  getTimetableEventStyle,
  TIMETABLE_AXIS_LABEL_CLASS,
  TIMETABLE_SLOT_HEIGHT,
  TIMETABLE_TIME_SLOTS,
} from "@/lib/timetable-grid-utils";
import {
  buildEnrollmentTimetableEvents,
  buildTemplateTimetableEvents,
  getSemesterEndMonday,
  type TimetableEvent,
} from "@/lib/timetable-events";
import {
  addDays,
  buildWeekDays,
  formatWeekRange,
  getWeekMonday,
  isDateInWeek,
  toDateKey,
} from "@/lib/timetable-week";
import { cn } from "@/lib/utils";

const DOWNLOAD_FORMATS: { value: ScheduleFormat; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
];

const EXPORT_FILENAME = "weekly-class-schedule";

function getMinutesFromHour(hour: number, minute = 0) {
  return hour * 60 + minute;
}

export function TimetablePage() {
  const exportRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => new Date());
  const [weekMonday, setWeekMonday] = useState(() => getWeekMonday(new Date()));
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const { enrollments, semesterStart, isReady } = useStudentEnrollments();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const semesterStartMonday = useMemo(() => getWeekMonday(semesterStart), [semesterStart]);
  const semesterEndMonday = useMemo(
    () => getSemesterEndMonday(semesterStartMonday),
    [semesterStartMonday],
  );

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
  }, [isReady, semesterStartMonday, semesterEndMonday]);

  const allEnrollmentEvents = useMemo(
    () => buildEnrollmentTimetableEvents(enrollments, COURSE_SUBJECTS, semesterStartMonday),
    [enrollments, semesterStartMonday],
  );

  const templateEvents = useMemo(
    () => buildTemplateTimetableEvents(enrollments, COURSE_SUBJECTS, semesterStartMonday),
    [enrollments, semesterStartMonday],
  );

  const weekDays = useMemo(() => buildWeekDays(weekMonday, now), [weekMonday, now]);
  const weekRangeLabel = formatWeekRange(weekMonday);
  const weekKey = toDateKey(weekMonday);
  const isCurrentWeek = isDateInWeek(now, weekMonday);
  const isAtSemesterStart = weekMonday.getTime() <= semesterStartMonday.getTime();
  const isAtSemesterEnd = weekMonday.getTime() >= semesterEndMonday.getTime();

  const weekEvents = useMemo(
    () => allEnrollmentEvents.filter((event) => event.weekMonday === weekKey),
    [allEnrollmentEvents, weekKey],
  );

  const gridHeight = TIMETABLE_TIME_SLOTS.length * TIMETABLE_SLOT_HEIGHT;
  const firstVisibleHour = TIMETABLE_TIME_SLOTS[0].hour;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

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

  const handleDownload = async (format: ScheduleFormat) => {
    if (!exportRef.current) {
      setDownloadError("Schedule preview is not ready. Please try again.");
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      await downloadTimetableSchedule(exportRef.current, format, EXPORT_FILENAME);
      setDownloadOpen(false);
    } catch (error) {
      console.error("Timetable download failed:", error);
      setDownloadError("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getEventStyle = (event: TimetableEvent) => getTimetableEventStyle(event);

  return (
    <div className="mt-4 flex flex-col">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Weekly Timetable</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Showing enrolled classes for the 3-month semester period.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-surface-container-high p-1">
            <button
              type="button"
              onClick={goToPreviousWeek}
              disabled={isAtSemesterStart}
              className="rounded-lg p-1.5 transition-all hover:bg-surface-container-lowest disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous week"
            >
              <MaterialIcon icon="chevron_left" className="text-[18px]" />
            </button>
            <div className="flex min-w-[190px] items-center justify-center px-3 text-label-md font-bold">
              {weekRangeLabel}
            </div>
            <button
              type="button"
              onClick={goToNextWeek}
              disabled={isAtSemesterEnd}
              className="rounded-lg p-1.5 transition-all hover:bg-surface-container-lowest disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next week"
            >
              <MaterialIcon icon="chevron_right" className="text-[18px]" />
            </button>
          </div>

          <Popover open={downloadOpen} onOpenChange={setDownloadOpen}>
            <PopoverTrigger
              type="button"
              disabled={isDownloading}
              className="inline-flex h-9 items-center rounded-lg border-none bg-[#00346d] px-4 text-sm font-semibold text-white hover:bg-[#124687] disabled:opacity-60"
            >
              <MaterialIcon icon="download" className="mr-1.5 text-[18px]" />
              {isDownloading ? "Downloading..." : "Download Schedule"}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-3">
              <PopoverHeader>
                <PopoverTitle className="text-label-md">Choose file format</PopoverTitle>
                <PopoverDescription className="text-body-sm">
                  Download your weekly class schedule by day.
                </PopoverDescription>
              </PopoverHeader>
              <div className="mt-2 flex flex-col gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDownloadOpen(false);
                    setPreviewOpen(true);
                  }}
                  className="h-9 w-full justify-start border-outline-variant bg-surface-container-low text-label-md hover:bg-pastel-blue/40"
                >
                  <MaterialIcon icon="visibility" className="mr-2 text-[18px] text-primary" />
                  Preview before download
                </Button>
                {DOWNLOAD_FORMATS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    disabled={isDownloading}
                    onClick={() => void handleDownload(option.value)}
                    className="h-9 w-full justify-start border-outline-variant bg-surface-container-low text-label-md hover:bg-pastel-blue/40"
                  >
                    <MaterialIcon icon="description" className="mr-2 text-[18px] text-primary" />
                    Download as {option.label}
                  </Button>
                ))}
                {downloadError && (
                  <p className="text-body-sm text-error" role="alert">
                    {downloadError}
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="portal-section overflow-hidden rounded-xl border border-pastel-blue-border bg-pastel-blue/20 shadow-sm">
        <div className="calendar-grid border-b border-outline-variant bg-surface-container-low/50">
          <div className="flex h-9 items-center justify-center border-r border-outline-variant">
            <MaterialIcon icon="schedule" className="text-[14px] text-outline" />
          </div>
          {weekDays.map((day) => (
            <div
              key={`${weekKey}-${day.label}`}
              className={cn(
                "flex h-9 flex-col items-center justify-center gap-0.5 border-r border-outline-variant last:border-r-0",
                day.today && "bg-primary/5",
                day.weekend && "bg-surface-container-high/30",
              )}
            >
              <span
                className={cn(
                  TIMETABLE_AXIS_LABEL_CLASS,
                  "uppercase tracking-tighter",
                  day.today ? "text-primary" : day.weekend ? "text-outline" : "text-on-surface-variant",
                )}
              >
                {day.label}
              </span>
              <span
                className={cn(
                  TIMETABLE_AXIS_LABEL_CLASS,
                  day.today ? "text-primary" : "text-on-surface",
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
              className="border-r border-outline-variant bg-surface-container-low/20"
              style={{ height: gridHeight }}
            >
              {TIMETABLE_TIME_SLOTS.map((slot, slotIndex) => (
                <div
                  key={slot.label}
                  className={cn(
                    "flex items-start justify-center border-outline-variant/30 pt-0.5",
                    slotIndex < TIMETABLE_TIME_SLOTS.length - 1 && "border-b",
                  )}
                  style={{ height: TIMETABLE_SLOT_HEIGHT }}
                >
                  <span className={cn(TIMETABLE_AXIS_LABEL_CLASS, "uppercase text-on-surface-variant")}>
                    {slot.label}
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
                    "relative border-r border-outline-variant/30 p-1 last:border-r-0",
                    day.today && "bg-primary/5",
                    day.weekend && "bg-surface-container-high/20",
                  )}
                  style={{ height: gridHeight }}
                >
                  {day.weekend ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-label-sm text-outline whitespace-nowrap -rotate-90">No Academic Activities</p>
                    </div>
                  ) : dayEvents.length === 0 ? (
                    <div className="flex h-full items-center justify-center px-2">
                      <p className="text-center text-label-sm text-on-surface-variant">No classes scheduled</p>
                    </div>
                  ) : (
                    dayEvents.map((event) => {
                      const { top, height } = getEventStyle(event);

                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "course-card absolute right-1 left-1 flex flex-col rounded-xl border p-2 shadow-sm",
                            event.cardClass,
                          )}
                          style={{ top, height }}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                              {formatTimetableEventTime(event)}
                            </span>
                            <span className="rounded bg-white/20 px-1 py-0.5 text-[8px] font-bold uppercase">
                              {event.tag}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide opacity-90">
                            {event.courseCode}
                          </p>
                          <h4 className="line-clamp-2 text-label-md font-bold leading-tight">{event.title}</h4>
                          {event.venue && (
                            <p className="mt-0.5 flex items-center gap-1 text-[10px] opacity-90">
                              <MaterialIcon icon="location_on" className="text-[11px]" />
                              {event.venue}
                            </p>
                          )}
                          {event.instructor && (
                            <p className="mt-0.5 flex items-center gap-1 text-[10px] opacity-90">
                              <MaterialIcon icon="person" className="text-[11px]" />
                              {event.instructor}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}

                  {day.today && isCurrentWeek && (
                    <div
                      className="pointer-events-none absolute right-0 left-0 z-20 border-t-2 border-urgent"
                      style={{
                        top:
                          ((nowMinutes - getMinutesFromHour(firstVisibleHour)) / 60) * TIMETABLE_SLOT_HEIGHT,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none fixed top-0 -left-[10000px] w-[1100px]">
        <TimetableExportGrid ref={exportRef} events={templateEvents} />
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant px-5 py-4">
              <div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface">Schedule Preview</h3>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  This is how your downloadable schedule will look. Days are shown by weekday, not by date.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
                aria-label="Close preview"
              >
                <MaterialIcon icon="close" className="text-[20px]" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-5">
              <TimetableExportGrid events={templateEvents} />
            </div>

            <div className="border-t border-outline-variant px-5 py-4">
              <p className="mb-3 text-label-sm text-on-surface-variant">Download as:</p>
              <div className="flex flex-wrap gap-2">
                {DOWNLOAD_FORMATS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    disabled={isDownloading}
                    onClick={() => void handleDownload(option.value)}
                    className="h-9 bg-[#00346d] text-white hover:bg-[#124687]"
                  >
                    <MaterialIcon icon="download" className="mr-1.5 text-[18px]" />
                    {option.label}
                  </Button>
                ))}
              </div>
              {downloadError && (
                <p className="mt-3 text-body-sm text-error" role="alert">
                  {downloadError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
