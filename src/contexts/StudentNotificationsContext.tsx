"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { COURSE_SUBJECTS } from "@/lib/course-dataset";
import { fetchAuthProfile } from "@/lib/client-auth";
import type { NotificationEmailDelivery } from "@/lib/notification-email";
import {
  buildPortalNotifications,
  groupNotificationsByDate,
  type PortalNotification,
} from "@/lib/portal-notifications";
import { generateRandomNotification } from "@/lib/random-notification-generator";
import { readAssignmentSubmissions } from "@/lib/student-assignment-submissions";
import {
  persistGeneratedNotifications,
  readGeneratedNotifications,
} from "@/lib/student-generated-notifications";
import {
  persistDeletedNotifications,
  readDeletedNotifications,
  type DeletedNotificationRecord,
} from "@/lib/student-deleted-notifications";
import {
  persistEmailedNotificationIds,
  persistReadNotificationIds,
  readEmailedNotificationIds,
  readReadNotificationIds,
} from "@/lib/student-notification-state";
import { useStudentEnrollments } from "@/hooks/useStudentEnrollments";

export type StudentNotification = PortalNotification & {
  isRead: boolean;
};

export type DeletedStudentNotification = DeletedNotificationRecord & {
  isRead: boolean;
};

type StudentNotificationsContextValue = {
  notifications: StudentNotification[];
  deletedNotifications: DeletedStudentNotification[];
  groupedNotifications: Array<[string, StudentNotification[]]>;
  groupedDeletedNotifications: Array<[string, DeletedStudentNotification[]]>;
  unreadCount: number;
  readCount: number;
  deletedCount: number;
  studentEmail: string;
  studentName: string;
  emailDelivery: NotificationEmailDelivery | null;
  emailError: string | null;
  isSendingEmail: boolean;
  isReady: boolean;
  now: Date;
  markAsRead: (notificationId: string) => void;
  markAsUnread: (notificationId: string) => void;
  markAllAsRead: () => void;
  markAllAsUnread: () => void;
  markSelectedAsRead: (notificationIds: string[]) => void;
  markSelectedAsUnread: (notificationIds: string[]) => void;
  deleteNotifications: (notificationIds: string[]) => void;
  restoreNotifications: (notificationIds: string[]) => void;
  permanentlyDeleteNotifications: (notificationIds: string[]) => void;
  clearEmailDelivery: () => void;
  clearEmailError: () => void;
  generateNotification: (options?: { sendEmail?: boolean }) => void;
};

const StudentNotificationsContext = createContext<StudentNotificationsContextValue | null>(null);

function useStudentNotificationsState(): StudentNotificationsContextValue {
  const { enrollments, semesterStart, isReady: enrollmentsReady } = useStudentEnrollments();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [emailedIds, setEmailedIds] = useState<Set<string>>(new Set());
  const [generatedNotifications, setGeneratedNotifications] = useState<PortalNotification[]>([]);
  const [deletedRecords, setDeletedRecords] = useState<DeletedNotificationRecord[]>([]);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [emailDelivery, setEmailDelivery] = useState<NotificationEmailDelivery | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const syncState = useCallback(() => {
    setReadIds(readReadNotificationIds());
    setEmailedIds(readEmailedNotificationIds());
  }, []);

  useEffect(() => {
    syncState();
    setGeneratedNotifications(readGeneratedNotifications());
    setDeletedRecords(readDeletedNotifications());
    setIsReady(true);
  }, [syncState]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAuthProfile().then((profile) => {
      if (profile?.email) {
        setStudentEmail(profile.email);
      }
      if (profile?.fullName) {
        setStudentName(profile.fullName);
      }
    });
  }, []);

  const portalNotifications = useMemo(() => {
    if (!enrollmentsReady) {
      return [];
    }

    return buildPortalNotifications(
      enrollments,
      COURSE_SUBJECTS,
      semesterStart,
      readAssignmentSubmissions(),
      now,
    );
  }, [enrollments, enrollmentsReady, semesterStart, now]);

  const deletedIds = useMemo(() => new Set(deletedRecords.map((record) => record.id)), [deletedRecords]);

  const allNotifications = useMemo(() => {
    const combined = [...generatedNotifications, ...portalNotifications].filter(
      (notification) => !deletedIds.has(notification.id),
    );
    return combined.sort(
      (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    );
  }, [generatedNotifications, portalNotifications, deletedIds]);

  const visibleNotifications = useMemo<StudentNotification[]>(
    () =>
      allNotifications.map((notification) => ({
        ...notification,
        isRead: readIds.has(notification.id),
      })),
    [allNotifications, readIds],
  );

  const unreadCount = visibleNotifications.filter((notification) => !notification.isRead).length;
  const readCount = visibleNotifications.length - unreadCount;

  const deletedNotifications = useMemo<DeletedStudentNotification[]>(
    () =>
      [...deletedRecords]
        .sort((first, second) => new Date(second.deletedAt).getTime() - new Date(first.deletedAt).getTime())
        .map((record) => ({
          ...record,
          isRead: record.wasRead,
        })),
    [deletedRecords],
  );

  const deleteNotifications = useCallback(
    (notificationIds: string[]) => {
      if (notificationIds.length === 0) {
        return;
      }

      const idSet = new Set(notificationIds);
      const toDelete = visibleNotifications.filter((notification) => idSet.has(notification.id));
      if (toDelete.length === 0) {
        return;
      }

      const deletedAt = new Date().toISOString();
      setDeletedRecords((current) => {
        const existingIds = new Set(current.map((record) => record.id));
        const next = [
          ...toDelete
            .filter((notification) => !existingIds.has(notification.id))
            .map((notification) => ({
              id: notification.id,
              category: notification.category,
              title: notification.title,
              message: notification.message,
              createdAt: notification.createdAt,
              actionLabel: notification.actionLabel,
              actionHref: notification.actionHref,
              deletedAt,
              wasRead: notification.isRead,
            })),
          ...current,
        ];
        persistDeletedNotifications(next);
        return next;
      });

      setGeneratedNotifications((current) => {
        const next = current.filter((notification) => !idSet.has(notification.id));
        persistGeneratedNotifications(next);
        return next;
      });
    },
    [visibleNotifications],
  );

  const restoreNotifications = useCallback(
    (notificationIds: string[]) => {
      if (notificationIds.length === 0) {
        return;
      }

      const idSet = new Set(notificationIds);
      const toRestore = deletedRecords.filter((record) => idSet.has(record.id));
      if (toRestore.length === 0) {
        return;
      }

      setDeletedRecords((current) => {
        const next = current.filter((record) => !idSet.has(record.id));
        persistDeletedNotifications(next);
        return next;
      });

      setGeneratedNotifications((current) => {
        const existingIds = new Set(current.map((notification) => notification.id));
        const restoredGenerated = toRestore
          .filter((record) => record.id.startsWith("generated-") && !existingIds.has(record.id))
          .map(({ deletedAt, wasRead, ...notification }) => notification);
        if (restoredGenerated.length === 0) {
          return current;
        }
        const next = [...restoredGenerated, ...current].sort(
          (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
        );
        persistGeneratedNotifications(next);
        return next;
      });

      setReadIds((current) => {
        const next = new Set(current);
        toRestore.forEach((record) => {
          if (record.wasRead) {
            next.add(record.id);
          } else {
            next.delete(record.id);
          }
        });
        persistReadNotificationIds(next);
        return next;
      });
    },
    [deletedRecords],
  );

  const permanentlyDeleteNotifications = useCallback((notificationIds: string[]) => {
    if (notificationIds.length === 0) {
      return;
    }

    const idSet = new Set(notificationIds);
    setDeletedRecords((current) => {
      const next = current.filter((record) => !idSet.has(record.id));
      persistDeletedNotifications(next);
      return next;
    });
  }, []);

  const sendEmailForNotifications = useCallback(
    async (notifications: StudentNotification[]) => {
      if (notifications.length === 0) {
        return;
      }

      setIsSendingEmail(true);
      setEmailError(null);

      try {
        const response = await fetch("/api/notifications/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            notifications: notifications.map((notification) => ({
              id: notification.id,
              title: notification.title,
              message: notification.message,
              category: notification.category,
            })),
          }),
        });

        const data = (await response.json()) as {
          ok: boolean;
          delivery?: NotificationEmailDelivery;
          message?: string;
        };

        if (data.ok && data.delivery) {
          setEmailedIds((current) => {
            const next = new Set(current);
            notifications.forEach((notification) => next.add(notification.id));
            persistEmailedNotificationIds(next);
            return next;
          });
          setEmailDelivery(data.delivery);
          return;
        }

        setEmailError(data.message ?? "Failed to send notification email.");
      } catch (error) {
        console.error("Notification email dispatch failed:", error);
        setEmailError("Failed to send notification email through Resend.");
      } finally {
        setIsSendingEmail(false);
      }
    },
    [],
  );

  const generateNotification = useCallback((options?: { sendEmail?: boolean }) => {
    const generated = generateRandomNotification(now);
    const studentNotification: StudentNotification = {
      ...generated,
      isRead: false,
    };

    setGeneratedNotifications((current) => {
      const next = [generated, ...current];
      persistGeneratedNotifications(next);
      return next;
    });

    if (options?.sendEmail !== false) {
      void sendEmailForNotifications([studentNotification]);
    }
  }, [now, sendEmailForNotifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setReadIds((current) => {
      if (current.has(notificationId)) {
        return current;
      }

      const next = new Set(current);
      next.add(notificationId);
      persistReadNotificationIds(next);
      return next;
    });
  }, []);

  const markAsUnread = useCallback((notificationId: string) => {
    setReadIds((current) => {
      if (!current.has(notificationId)) {
        return current;
      }

      const next = new Set(current);
      next.delete(notificationId);
      persistReadNotificationIds(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((current) => {
      const next = new Set(current);
      visibleNotifications.forEach((notification) => next.add(notification.id));
      persistReadNotificationIds(next);
      return next;
    });
  }, [visibleNotifications]);

  const markAllAsUnread = useCallback(() => {
    setReadIds((current) => {
      const next = new Set(current);
      visibleNotifications.forEach((notification) => next.delete(notification.id));
      persistReadNotificationIds(next);
      return next;
    });
  }, [visibleNotifications]);

  const markSelectedAsRead = useCallback((notificationIds: string[]) => {
    if (notificationIds.length === 0) {
      return;
    }

    setReadIds((current) => {
      const next = new Set(current);
      notificationIds.forEach((notificationId) => next.add(notificationId));
      persistReadNotificationIds(next);
      return next;
    });
  }, []);

  const markSelectedAsUnread = useCallback((notificationIds: string[]) => {
    if (notificationIds.length === 0) {
      return;
    }

    setReadIds((current) => {
      const next = new Set(current);
      notificationIds.forEach((notificationId) => next.delete(notificationId));
      persistReadNotificationIds(next);
      return next;
    });
  }, []);

  const groupedNotifications = useMemo(
    () => groupNotificationsByDate(visibleNotifications, now),
    [visibleNotifications, now],
  );

  const groupedDeletedNotifications = useMemo(() => {
    const grouped = groupNotificationsByDate(
      deletedNotifications.map((notification) => ({
        ...notification,
        createdAt: notification.deletedAt,
      })),
      now,
    );

    return grouped.map(([label, items]) => [
      label,
      items.map(
        (item) =>
          deletedNotifications.find((notification) => notification.id === item.id) ?? {
            ...item,
            deletedAt: item.createdAt,
            wasRead: false,
            isRead: false,
          },
      ),
    ] as [string, DeletedStudentNotification[]]);
  }, [deletedNotifications, now]);

  return {
    notifications: visibleNotifications,
    deletedNotifications,
    groupedNotifications,
    groupedDeletedNotifications,
    unreadCount,
    readCount,
    deletedCount: deletedNotifications.length,
    studentEmail,
    studentName,
    emailDelivery,
    emailError,
    isSendingEmail,
    isReady: isReady && enrollmentsReady,
    now,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    markAllAsUnread,
    markSelectedAsRead,
    markSelectedAsUnread,
    deleteNotifications,
    restoreNotifications,
    permanentlyDeleteNotifications,
    clearEmailDelivery: () => setEmailDelivery(null),
    clearEmailError: () => setEmailError(null),
    generateNotification,
  };
}

export function StudentNotificationsProvider({ children }: { children: ReactNode }) {
  const value = useStudentNotificationsState();
  return (
    <StudentNotificationsContext.Provider value={value}>{children}</StudentNotificationsContext.Provider>
  );
}

export function useStudentNotifications() {
  const context = useContext(StudentNotificationsContext);
  if (!context) {
    throw new Error("useStudentNotifications must be used within StudentNotificationsProvider");
  }
  return context;
}
