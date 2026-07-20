import type { NotificationCategory, PortalNotification } from "@/lib/portal-notifications";
import { NOTIFICATION_CATEGORY_META } from "@/lib/portal-notifications";

export type NotificationTimeFilter =
  | "all"
  | "today"
  | "yesterday"
  | "three-days-ago"
  | "one-week-ago";

export type NotificationCategoryFilter = "all" | NotificationCategory;

export const NOTIFICATION_TIME_FILTERS: Array<{ value: NotificationTimeFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "three-days-ago", label: "3 Days Ago" },
  { value: "one-week-ago", label: "1 Week Ago" },
];

export const NOTIFICATION_CATEGORY_FILTERS: Array<{
  value: NotificationCategoryFilter;
  label: string;
}> = [
  { value: "all", label: "All Categories" },
  ...Object.entries(NOTIFICATION_CATEGORY_META).map(([value, meta]) => ({
    value: value as NotificationCategory,
    label: meta.label,
  })),
];

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isSameDay(first: Date, second: Date) {
  return startOfDay(first).getTime() === startOfDay(second).getTime();
}

export function matchesNotificationTimeFilter(
  createdAt: string,
  filter: NotificationTimeFilter,
  now = new Date(),
) {
  if (filter === "all") {
    return true;
  }

  const created = new Date(createdAt);
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 3);
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  switch (filter) {
    case "today":
      return isSameDay(created, now);
    case "yesterday":
      return isSameDay(created, yesterday);
    case "three-days-ago":
      return isSameDay(created, threeDaysAgo);
    case "one-week-ago":
      return created >= oneWeekAgo && created < threeDaysAgo;
    default:
      return true;
  }
}

export function matchesNotificationCategoryFilter(
  category: NotificationCategory,
  filter: NotificationCategoryFilter,
) {
  return filter === "all" || category === filter;
}

export function filterNotifications<T extends PortalNotification>(
  notifications: T[],
  timeFilter: NotificationTimeFilter,
  categoryFilter: NotificationCategoryFilter,
  now = new Date(),
) {
  return notifications.filter(
    (notification) =>
      matchesNotificationTimeFilter(notification.createdAt, timeFilter, now) &&
      matchesNotificationCategoryFilter(notification.category, categoryFilter),
  );
}
