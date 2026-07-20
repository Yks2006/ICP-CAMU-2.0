export function getWeekMonday(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatWeekRange(weekMonday: Date): string {
  const weekSunday = addDays(weekMonday, 6);
  const start = weekMonday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const end = weekSunday.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${start} - ${end}`;
}

export type WeekDay = {
  label: string;
  date: string;
  dateObj: Date;
  today: boolean;
  weekend: boolean;
};

export function buildWeekDays(weekMonday: Date, today: Date): WeekDay[] {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return labels.map((label, index) => {
    const dateObj = addDays(weekMonday, index);

    return {
      label,
      date: `${dateObj.getDate()}`,
      dateObj,
      today: toDateKey(dateObj) === toDateKey(today),
      weekend: index >= 5,
    };
  });
}

export function isDateInWeek(date: Date, weekMonday: Date): boolean {
  const weekSunday = addDays(weekMonday, 6);
  weekSunday.setHours(23, 59, 59, 999);
  return date >= weekMonday && date <= weekSunday;
}

export const TEMPLATE_WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type TemplateWeekDay = {
  label: (typeof TEMPLATE_WEEKDAY_LABELS)[number];
  weekend: boolean;
};

export function buildTemplateWeekDays(): TemplateWeekDay[] {
  return TEMPLATE_WEEKDAY_LABELS.map((label, index) => ({
    label,
    weekend: index >= 5,
  }));
}
