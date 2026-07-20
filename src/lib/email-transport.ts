import { Resend } from "resend";
import type { NotificationEmailDelivery } from "@/lib/notification-email";
import { NOTIFICATION_EMAIL_SENDER_NAME } from "@/lib/notification-email";

type SendEmailResult =
  | { ok: true; delivery: NotificationEmailDelivery }
  | { ok: false; error: string };

const DEFAULT_RESEND_FROM = `${NOTIFICATION_EMAIL_SENDER_NAME} <onboarding@resend.dev>`;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildHtmlBody(delivery: NotificationEmailDelivery) {
  const paragraphs = delivery.body
    .split("\n")
    .map((line) => (line.trim() ? `<p style="margin:0 0 12px;">${escapeHtml(line)}</p>` : "<br />"))
    .join("");

  return `<!DOCTYPE html>
<html>
  <body style="font-family:Segoe UI,Arial,sans-serif;color:#1f2937;line-height:1.5;">
    ${paragraphs}
  </body>
</html>`;
}

export function getResendConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY?.trim() ?? "",
    from: process.env.RESEND_FROM?.trim() || DEFAULT_RESEND_FROM,
    testEmail: process.env.RESEND_TEST_EMAIL?.trim().toLowerCase() ?? "",
  };
}

export function isResendTestSender(from = getResendConfig().from) {
  return /@resend\.dev>\s*$/.test(from) || from.includes("@resend.dev");
}

export function isResendTestModeActive() {
  const { testEmail, from } = getResendConfig();
  return Boolean(testEmail) && isResendTestSender(from);
}

export function getResendSetupMessage() {
  return "Add RESEND_API_KEY and RESEND_TEST_EMAIL to .env.local, restart the dev server, then click the notification icon again.";
}

function applyResendTestDelivery(delivery: NotificationEmailDelivery): NotificationEmailDelivery {
  const { testEmail } = getResendConfig();

  if (!isResendTestModeActive() || !testEmail) {
    return delivery;
  }

  if (delivery.recipientEmail.trim().toLowerCase() === testEmail) {
    return delivery;
  }

  return {
    ...delivery,
    recipientEmail: testEmail,
  };
}

function formatResendError(message: string, intendedRecipient: string) {
  if (!message.includes("only send testing emails to your own email address")) {
    return message;
  }

  const { testEmail } = getResendConfig();

  if (testEmail) {
    return `Resend test mode could not deliver the email. Confirm RESEND_TEST_EMAIL=${testEmail} matches your Resend account email, then restart the dev server.`;
  }

  return `Resend test sender can only email your Resend account (for example kiansoon2006@gmail.com). Set RESEND_TEST_EMAIL in .env.local for test delivery, or verify a domain at resend.com/domains to send to ${intendedRecipient}.`;
}

export async function sendNotificationEmail(
  delivery: NotificationEmailDelivery,
): Promise<SendEmailResult> {
  const { apiKey, from } = getResendConfig();

  if (!apiKey) {
    return {
      ok: false,
      error: `Resend is not configured. ${getResendSetupMessage()}`,
    };
  }

  const outboundDelivery = applyResendTestDelivery(delivery);
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: outboundDelivery.recipientEmail,
    subject: outboundDelivery.subject,
    text: outboundDelivery.body,
    html: buildHtmlBody(outboundDelivery),
  });

  if (error) {
    return {
      ok: false,
      error: formatResendError(error.message, delivery.recipientEmail),
    };
  }

  return { ok: true, delivery: outboundDelivery };
}
