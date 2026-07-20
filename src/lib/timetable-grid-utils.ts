import type { TimetableEvent } from "@/lib/timetable-events";

export const TIMETABLE_SLOT_HEIGHT = 96;
export const ATTENDANCE_SLOT_HEIGHT = 48;
export const TIMETABLE_AXIS_LABEL_CLASS = "text-[11px] font-bold leading-none";

export const TIMETABLE_TIME_SLOTS = [
  { label: "08:00 AM", hour: 8 },
  { label: "09:00 AM", hour: 9 },
  { label: "10:00 AM", hour: 10 },
  { label: "11:00 AM", hour: 11 },
  { label: "12:00 PM", hour: 12 },
  { label: "01:00 PM", hour: 13 },
  { label: "02:00 PM", hour: 14 },
  { label: "03:00 PM", hour: 15 },
  { label: "04:00 PM", hour: 16 },
  { label: "05:00 PM", hour: 17 },
] as const;

function getMinutesFromHour(hour: number, minute = 0) {
  return hour * 60 + minute;
}

function eventStartMinutes(event: TimetableEvent) {
  return getMinutesFromHour(event.startHour, event.startMinute ?? 0);
}

export function formatTimetableEventTime(event: TimetableEvent) {
  const format = (hour: number, minute = 0) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const minuteLabel = minute > 0 ? `:${minute.toString().padStart(2, "0")}` : ":00";
    return `${displayHour}${minuteLabel} ${period}`;
  };

  return `${format(event.startHour, event.startMinute ?? 0)} - ${format(event.endHour, event.endMinute ?? 0)}`;
}

export function getTimetableEventStyle(
  event: TimetableEvent,
  slotHeight: number = TIMETABLE_SLOT_HEIGHT,
) {
  const firstVisibleHour = TIMETABLE_TIME_SLOTS[0].hour;
  const top =
    ((eventStartMinutes(event) - getMinutesFromHour(firstVisibleHour)) / 60) * slotHeight;
  const height =
    ((getMinutesFromHour(event.endHour, event.endMinute ?? 0) - eventStartMinutes(event)) / 60) *
    slotHeight;

  return { top: Math.max(0, top), height: Math.max(height, slotHeight - 4) };
}
