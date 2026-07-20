export type ScheduleSlot = {
  dayIndex: number;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  raw: string;
};

const DAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export function parseScheduleSlot(raw: string): ScheduleSlot | null {
  const match = raw.trim().match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const [, day, startHour, startMinute, endHour, endMinute] = match;

  return {
    dayIndex: DAY_INDEX[day],
    startHour: Number(startHour),
    startMinute: Number(startMinute),
    endHour: Number(endHour),
    endMinute: Number(endMinute),
    raw,
  };
}

function slotToMinutes(hour: number, minute: number) {
  return hour * 60 + minute;
}

export function slotsClash(first: ScheduleSlot, second: ScheduleSlot) {
  if (first.dayIndex !== second.dayIndex) {
    return false;
  }

  const firstStart = slotToMinutes(first.startHour, first.startMinute);
  const firstEnd = slotToMinutes(first.endHour, first.endMinute);
  const secondStart = slotToMinutes(second.startHour, second.startMinute);
  const secondEnd = slotToMinutes(second.endHour, second.endMinute);

  return firstStart < secondEnd && secondStart < firstEnd;
}

export function slotClashesWithAny(slot: ScheduleSlot | null, occupiedSlots: ScheduleSlot[]) {
  if (!slot) {
    return false;
  }

  return occupiedSlots.some((occupied) => slotsClash(slot, occupied));
}

export function getEnrollmentScheduleSlots(
  lecture: string,
  tutorial: string,
): ScheduleSlot[] {
  const lectureSlot = parseScheduleSlot(lecture);
  const tutorialSlot = parseScheduleSlot(tutorial);

  return [lectureSlot, tutorialSlot].filter((slot): slot is ScheduleSlot => slot !== null);
}
