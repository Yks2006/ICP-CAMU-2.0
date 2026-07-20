"use client";

import { forwardRef } from "react";
import type { TimetableEvent } from "@/lib/timetable-events";
import {
  formatTimetableEventTime,
  getTimetableEventStyle,
  TIMETABLE_SLOT_HEIGHT,
  TIMETABLE_TIME_SLOTS,
} from "@/lib/timetable-grid-utils";
import { buildTemplateWeekDays } from "@/lib/timetable-week";
import { cn } from "@/lib/utils";

type TimetableExportGridProps = {
  events: TimetableEvent[];
  className?: string;
};

export const TimetableExportGrid = forwardRef<HTMLDivElement, TimetableExportGridProps>(
  function TimetableExportGrid({ events, className }, ref) {
    const weekDays = buildTemplateWeekDays();
    const gridHeight = TIMETABLE_TIME_SLOTS.length * TIMETABLE_SLOT_HEIGHT;

    return (
      <div
        ref={ref}
        data-timetable-export
        className={cn(
          "flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm",
          className,
        )}
      >
        <div className="border-b border-[#00346d] bg-[#00346d] px-4 py-3 text-white">
          <h3 className="text-headline-sm font-headline-sm">Weekly Class Schedule</h3>
          <p className="text-body-sm text-white/80">Enrolled classes by day of the week</p>
        </div>

        <div className="calendar-grid border-b border-outline-variant bg-[#00346d] text-white">
          <div className="flex h-12 items-center justify-center border-r border-white/20 px-2 text-center text-label-sm font-bold uppercase">
            Time
          </div>
          {weekDays.map((day) => (
            <div
              key={day.label}
              className={cn(
                "flex h-12 items-center justify-center border-r border-white/20 px-2 text-center text-label-sm font-bold last:border-r-0",
                day.weekend && "bg-[#124687]",
              )}
            >
              {day.label}
            </div>
          ))}
        </div>

        <div data-timetable-scroll className="relative overflow-visible">
          <div className="calendar-grid" style={{ minHeight: gridHeight }}>
            <div className="border-r border-outline-variant bg-surface-container-low/30">
              {TIMETABLE_TIME_SLOTS.map((slot) => (
                <div
                  key={slot.label}
                  className="flex items-start justify-center border-b border-outline-variant/40 pt-2"
                  style={{ height: TIMETABLE_SLOT_HEIGHT }}
                >
                  <span className="text-[11px] font-bold uppercase text-on-surface-variant">{slot.label}</span>
                </div>
              ))}
            </div>

            {weekDays.map((day, dayIndex) => {
              const dayEvents = events.filter((event) => event.dayIndex === dayIndex);

              return (
                <div
                  key={day.label}
                  className={cn(
                    "relative border-r border-outline-variant/40 p-1 last:border-r-0",
                    day.weekend && "bg-[#f5efe6]",
                  )}
                  style={{ height: gridHeight }}
                >
                  {day.weekend ? (
                    <div className="flex h-full items-center justify-center px-2">
                      <p className="text-center text-label-sm text-on-surface-variant">No classes scheduled</p>
                    </div>
                  ) : dayEvents.length === 0 ? (
                    <div className="flex h-full items-center justify-center px-2">
                      <p className="text-center text-label-sm text-on-surface-variant">No classes scheduled</p>
                    </div>
                  ) : (
                    dayEvents.map((event) => {
                      const { top, height } = getTimetableEventStyle(event);

                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "course-card absolute right-1 left-1 flex flex-col rounded-lg border p-2 shadow-sm",
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
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);
