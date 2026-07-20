"use client";

import { useMemo, useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

type AssignmentDeadlineCalendarProps = {
  deadlineDates: string[];
  selectedDateKey: string | null;
  onSelectDate: (dateKey: string | null) => void;
  referenceDate?: Date;
};

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildMonthGrid(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells: Array<{ date: Date | null; key: string }> = [];

  for (let index = 0; index < startOffset; index += 1) {
    cells.push({ date: null, key: `empty-start-${index}` });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({ date, key: toDateKey(date) });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, key: `empty-end-${cells.length}` });
  }

  return cells;
}

export function AssignmentDeadlineCalendar({
  deadlineDates,
  selectedDateKey,
  onSelectDate,
  referenceDate = new Date(),
}: AssignmentDeadlineCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1),
  );

  const deadlineSet = useMemo(() => new Set(deadlineDates), [deadlineDates]);
  const monthLabel = visibleMonth.toLocaleDateString("en-MY", {
    month: "long",
    year: "numeric",
  });
  const monthCells = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);
  const todayKey = toDateKey(referenceDate);

  const goToPreviousMonth = () => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  return (
    <div className="portal-section rounded-xl border border-pastel-purple-border bg-pastel-purple/30 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-label-md font-label-md uppercase tracking-wider text-pastel-purple-text">
          Deadlines
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-lg p-1 transition-colors hover:bg-pastel-purple/50"
            aria-label="Previous month"
          >
            <MaterialIcon icon="chevron_left" className="text-[18px]" />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-lg p-1 transition-colors hover:bg-pastel-purple/50"
            aria-label="Next month"
          >
            <MaterialIcon icon="chevron_right" className="text-[18px]" />
          </button>
        </div>
      </div>

      <p className="mb-3 text-label-md font-bold text-on-surface">{monthLabel}</p>

      <div className="mb-3 flex items-center gap-2 text-[11px] text-on-surface-variant">
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded font-bold text-urgent">15</span>
        <span>Red dates have assignment deadlines</span>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label, index) => (
          <span key={`${label}-${index}`} className="text-[10px] font-bold uppercase text-outline">
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {monthCells.map(({ date, key }) => {
          if (!date) {
            return <span key={key} className="py-2 text-label-sm text-outline-variant/40" />;
          }

          const dateKey = toDateKey(date);
          const hasDeadline = deadlineSet.has(dateKey);
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDateKey;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : dateKey)}
              className={cn(
                "relative rounded-lg py-2 text-label-sm font-medium transition-colors",
                isSelected && hasDeadline
                  ? "bg-urgent font-bold text-white ring-2 ring-urgent/30"
                  : isSelected
                    ? "bg-primary font-bold text-on-primary"
                    : hasDeadline
                      ? "bg-urgent/10 font-bold text-urgent hover:bg-urgent/20"
                      : isToday
                        ? "bg-pastel-blue font-bold text-pastel-blue-text"
                        : "text-on-surface hover:bg-surface-container-high",
              )}
              aria-label={`${date.toLocaleDateString("en-MY")}${hasDeadline ? ", assignment deadline" : ""}`}
              aria-current={isSelected ? "date" : undefined}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {selectedDateKey && (
        <button
          type="button"
          onClick={() => onSelectDate(null)}
          className="mt-4 w-full rounded-lg border border-outline-variant py-2 text-label-sm font-label-md text-primary hover:bg-surface-container-low"
        >
          Clear date filter
        </button>
      )}
    </div>
  );
}
