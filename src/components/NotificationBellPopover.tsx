"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { useStudentNotifications } from "@/contexts/StudentNotificationsContext";
import { cn } from "@/lib/utils";

type NotificationBellPopoverProps = {
  className?: string;
  sendEmail?: boolean;
  icon?: string;
  ariaLabel?: string;
};

export function NotificationBellPopover({
  className,
  sendEmail = true,
  icon = "notifications",
  ariaLabel = "Generate notification",
}: NotificationBellPopoverProps) {
  const { isReady, generateNotification, clearEmailError } = useStudentNotifications();

  const handleClick = () => {
    if (!isReady) {
      return;
    }

    if (sendEmail) {
      clearEmailError();
    }

    generateNotification({ sendEmail });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isReady}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant/70 bg-white/70 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      aria-label={ariaLabel}
    >
      <MaterialIcon icon={icon} className="text-[22px]" />
    </button>
  );
}
