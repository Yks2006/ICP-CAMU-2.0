export type NotificationLayoutView = "list" | "grid";

export const NOTIFICATION_LAYOUT_STORAGE_KEY = "camu-portal-notification-layout";

export function readNotificationLayoutView(): NotificationLayoutView {
  if (typeof window === "undefined") {
    return "list";
  }

  const stored = window.localStorage.getItem(NOTIFICATION_LAYOUT_STORAGE_KEY);
  return stored === "grid" ? "grid" : "list";
}

export function persistNotificationLayoutView(view: NotificationLayoutView) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(NOTIFICATION_LAYOUT_STORAGE_KEY, view);
}
