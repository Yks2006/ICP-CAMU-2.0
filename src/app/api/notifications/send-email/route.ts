import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE, AUTH_EMAIL_COOKIE } from "@/lib/auth-session";
import { findUserByEmail } from "@/lib/db";
import {
  buildNotificationEmail,
  type NotificationEmailItem,
} from "@/lib/notification-email";
import { sendNotificationEmail } from "@/lib/email-transport";

type SendEmailBody = {
  notifications?: NotificationEmailItem[];
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    if (cookieStore.get(AUTH_COOKIE)?.value !== "true") {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const email = cookieStore.get(AUTH_EMAIL_COOKIE)?.value;
    if (!email) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
    }

    const body = (await request.json()) as SendEmailBody;
    const notifications = body.notifications ?? [];

    if (notifications.length === 0) {
      return NextResponse.json({ ok: false, message: "No notifications to send" }, { status: 400 });
    }

    const delivery = buildNotificationEmail({
      recipientName: user.full_name?.trim() ?? "Student",
      recipientEmail: user.email,
      notifications,
    });

    const sendResult = await sendNotificationEmail(delivery);
    if (!sendResult.ok) {
      console.error("[notification-email:failed]", sendResult.error);
      return NextResponse.json({ ok: false, message: sendResult.error }, { status: 503 });
    }

    console.info("[notification-email:delivered]", {
      from: `${sendResult.delivery.senderName} <${sendResult.delivery.senderAddress}>`,
      to: sendResult.delivery.recipientEmail,
      intendedRecipient: delivery.recipientEmail,
      studentId: user.student_id,
      subject: sendResult.delivery.subject,
      notificationIds: notifications.map((item) => item.id),
      sentAt: sendResult.delivery.sentAt,
      bodyPreview: sendResult.delivery.previewText,
    });

    return NextResponse.json({
      ok: true,
      delivery: sendResult.delivery,
    });
  } catch (error) {
    console.error("Failed to send notification email:", error);
    return NextResponse.json({ ok: false, message: "Failed to send email" }, { status: 500 });
  }
}
