import { NOTIFICATION_CATEGORY_META, type NotificationCategory } from "@/lib/portal-notifications";

export const NOTIFICATION_EMAIL_SENDER_NAME = "CAMU 2.0 Student Portal";
export const NOTIFICATION_EMAIL_SENDER_ADDRESS = "notifications@camu-portal.uow.edu.my";

export type NotificationEmailItem = {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
};

export type NotificationEmailPayload = {
  recipientName: string;
  recipientEmail: string;
  notifications: NotificationEmailItem[];
};

export type NotificationEmailDelivery = {
  senderName: string;
  senderAddress: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  previewText: string;
  body: string;
  sentAt: string;
  notificationCount: number;
};

function getCategoryLabel(category: NotificationCategory) {
  return NOTIFICATION_CATEGORY_META[category].label;
}

export function buildNotificationEmail(
  payload: NotificationEmailPayload,
): NotificationEmailDelivery {
  const { recipientName, recipientEmail, notifications } = payload;
  const sentAt = new Date().toISOString();
  const firstName = recipientName.trim().split(/\s+/)[0] || "Student";

  const subject =
    notifications.length === 1
      ? `[CAMU 2.0] ${notifications[0].title}`
      : `[CAMU 2.0] ${notifications.length} new portal notifications`;

  const summaryLines = notifications.map(
    (notification) =>
      `• ${getCategoryLabel(notification.category)} — ${notification.title}: ${notification.message}`,
  );

  const body = [
    `Dear ${firstName},`,
    "",
    "You have new updates waiting in the CAMU 2.0 Student Portal:",
    "",
    ...summaryLines,
    "",
    "Please sign in to review the full details and complete any required actions.",
    "",
    "Portal: https://camu-portal.uow.edu.my/notifications",
    "",
    "—",
    NOTIFICATION_EMAIL_SENDER_NAME,
    "This is an automated message. Please do not reply to this email.",
  ].join("\n");

  const previewText =
    notifications.length === 1
      ? `${getCategoryLabel(notifications[0].category)}: ${notifications[0].message}`
      : `You have ${notifications.length} new notifications including ${getCategoryLabel(notifications[0].category).toLowerCase()} and other portal updates.`;

  return {
    senderName: NOTIFICATION_EMAIL_SENDER_NAME,
    senderAddress: NOTIFICATION_EMAIL_SENDER_ADDRESS,
    recipientEmail,
    recipientName: recipientName.trim() || "Student",
    subject,
    previewText,
    body,
    sentAt,
    notificationCount: notifications.length,
  };
}

export function formatEmailDeliveryTime(isoDate: string) {
  return new Date(isoDate).toLocaleString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
