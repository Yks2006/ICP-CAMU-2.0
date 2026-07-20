export const NOTIFICATION_READ_STORAGE_KEY = "camu-portal-notification-read-ids";
export const NOTIFICATION_EMAILED_STORAGE_KEY = "camu-portal-notification-emailed-ids";

function readIdSet(key: string) {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  const stored = window.localStorage.getItem(key);
  if (!stored) {
    return new Set<string>();
  }

  try {
    const parsed = JSON.parse(stored) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set<string>();
  }
}

function writeIdSet(key: string, ids: Set<string>) {
  window.localStorage.setItem(key, JSON.stringify(Array.from(ids)));
}

export function readReadNotificationIds() {
  return readIdSet(NOTIFICATION_READ_STORAGE_KEY);
}

export function readEmailedNotificationIds() {
  return readIdSet(NOTIFICATION_EMAILED_STORAGE_KEY);
}

export function persistReadNotificationIds(ids: Set<string>) {
  writeIdSet(NOTIFICATION_READ_STORAGE_KEY, ids);
}

export function persistEmailedNotificationIds(ids: Set<string>) {
  writeIdSet(NOTIFICATION_EMAILED_STORAGE_KEY, ids);
}
