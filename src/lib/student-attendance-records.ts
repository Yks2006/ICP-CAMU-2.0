export type AttendanceScanRecord = {
  eventId: string;
  scannedAt: string;
};

export const ATTENDANCE_SCANS_STORAGE_KEY = "camu-portal-attendance-scans";

export function readAttendanceScans(): AttendanceScanRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(ATTENDANCE_SCANS_STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as AttendanceScanRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistAttendanceScans(scans: AttendanceScanRecord[]) {
  window.localStorage.setItem(ATTENDANCE_SCANS_STORAGE_KEY, JSON.stringify(scans));
}

export function hasAttendanceScan(eventId: string, scans: AttendanceScanRecord[]) {
  return scans.some((scan) => scan.eventId === eventId);
}

export function recordAttendanceScan(eventId: string) {
  const scans = readAttendanceScans();
  if (hasAttendanceScan(eventId, scans)) {
    return scans;
  }

  const next = [
    ...scans,
    {
      eventId,
      scannedAt: new Date().toISOString(),
    },
  ];

  persistAttendanceScans(next);
  return next;
}
