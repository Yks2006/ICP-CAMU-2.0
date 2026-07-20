import type { PortalNotification } from "@/lib/portal-notifications";

export const NOTIFICATION_DELETED_STORAGE_KEY = "camu-portal-notification-deleted";

export type DeletedNotificationRecord = PortalNotification & {
  deletedAt: string;
  wasRead: boolean;
};

export function readDeletedNotifications(): DeletedNotificationRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(NOTIFICATION_DELETED_STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as DeletedNotificationRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistDeletedNotifications(records: DeletedNotificationRecord[]) {
  window.localStorage.setItem(NOTIFICATION_DELETED_STORAGE_KEY, JSON.stringify(records));
}

export function readDeletedNotificationIds() {
  return new Set(readDeletedNotifications().map((record) => record.id));
}
