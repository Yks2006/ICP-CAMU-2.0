"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ATTENDANCE_SCANS_STORAGE_KEY,
  readAttendanceScans,
  type AttendanceScanRecord,
} from "@/lib/student-attendance-records";

export function useStudentAttendanceScans() {
  const [scans, setScans] = useState<AttendanceScanRecord[]>([]);
  const [isReady, setIsReady] = useState(false);

  const syncFromStorage = useCallback(() => {
    setScans(readAttendanceScans());
    setIsReady(true);
  }, []);

  useEffect(() => {
    syncFromStorage();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ATTENDANCE_SCANS_STORAGE_KEY) {
        syncFromStorage();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [syncFromStorage]);

  const scannedEventIds = useMemo(
    () => new Set(scans.map((scan) => scan.eventId)),
    [scans],
  );

  return {
    scans,
    scannedEventIds,
    isReady,
    refresh: syncFromStorage,
  };
}
