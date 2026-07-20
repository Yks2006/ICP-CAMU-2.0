import type { PortalNotification } from "@/lib/portal-notifications";

export const GENERATED_NOTIFICATIONS_STORAGE_KEY = "camu-portal-generated-notifications";

export function readGeneratedNotifications(): PortalNotification[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(GENERATED_NOTIFICATIONS_STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as PortalNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistGeneratedNotifications(notifications: PortalNotification[]) {
  window.localStorage.setItem(
    GENERATED_NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify(notifications),
  );
}

export function prependGeneratedNotification(notification: PortalNotification) {
  const next = [notification, ...readGeneratedNotifications()];
  persistGeneratedNotifications(next);
  return next;
}
