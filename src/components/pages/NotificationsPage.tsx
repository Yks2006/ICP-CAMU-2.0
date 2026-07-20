"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { NotificationBellPopover } from "@/components/NotificationBellPopover";
import { MaterialIcon } from "@/components/MaterialIcon";
import { Button } from "@/components/ui/button";
import { useStudentNotifications } from "@/contexts/StudentNotificationsContext";
import type { DeletedStudentNotification } from "@/contexts/StudentNotificationsContext";
import {
  filterNotifications,
  NOTIFICATION_CATEGORY_FILTERS,
  NOTIFICATION_TIME_FILTERS,
  type NotificationCategoryFilter,
  type NotificationTimeFilter,
} from "@/lib/notification-filters";
import {
  persistNotificationLayoutView,
  readNotificationLayoutView,
} from "@/lib/notification-layout-preference";
import {
  formatNotificationTimestamp,
  NOTIFICATION_CATEGORY_META,
  type PortalNotification,
} from "@/lib/portal-notifications";
import { cn } from "@/lib/utils";

type MailboxFilter = "inbox" | "deleted";
type LayoutView = "list" | "grid";

const MAILBOX_FILTERS: Array<{ value: MailboxFilter; label: string }> = [
  { value: "inbox", label: "Inbox" },
  { value: "deleted", label: "Deleted" },
];

const FILTER_FIELD_CLASS = "flex min-w-[140px] flex-1 flex-col sm:max-w-[190px]";
const FILTER_LABEL_CLASS = "mb-1 ml-1 text-[10px] font-bold uppercase text-on-surface-variant";
const FILTER_BOX_CLASS =
  "box-border flex h-10 w-full items-center rounded-lg border border-outline-variant bg-white px-3 text-[14px] font-semibold leading-5 text-on-surface outline-none transition-colors focus:border-primary";

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn(FILTER_FIELD_CLASS, className)}>
      <span className={FILTER_LABEL_CLASS}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={cn(FILTER_BOX_CLASS, "py-0")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SelectAllControl({
  checked,
  count,
  onChange,
}: {
  checked: boolean;
  count: number;
  onChange: () => void;
}) {
  return (
    <div className={FILTER_FIELD_CLASS}>
      <span className={FILTER_LABEL_CLASS}>Select all</span>
      <label className={cn(FILTER_BOX_CLASS, "cursor-pointer gap-2 py-0")}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 shrink-0 rounded border-outline-variant text-primary focus:ring-primary"
        />
        <span className="truncate">All ({count})</span>
      </label>
    </div>
  );
}

function ViewToggle({
  layoutView,
  onChange,
}: {
  layoutView: LayoutView;
  onChange: (view: LayoutView) => void;
}) {
  return (
    <div className={FILTER_FIELD_CLASS}>
      <span className={FILTER_LABEL_CLASS}>View</span>
      <div className={cn(FILTER_BOX_CLASS, "flex overflow-hidden p-0")}>
        <button
          type="button"
          onClick={() => onChange("list")}
          className={cn(
            "inline-flex h-full min-h-0 flex-1 items-center justify-center transition-colors",
            layoutView === "list"
              ? "bg-primary text-on-primary"
              : "text-on-surface-variant hover:bg-surface-container-low",
          )}
          aria-label="List view"
          aria-pressed={layoutView === "list"}
        >
          <MaterialIcon icon="view_list" className="text-[18px]" />
        </button>
        <button
          type="button"
          onClick={() => onChange("grid")}
          className={cn(
            "inline-flex h-full min-h-0 flex-1 items-center justify-center border-l border-outline-variant transition-colors",
            layoutView === "grid"
              ? "bg-primary text-on-primary"
              : "text-on-surface-variant hover:bg-surface-container-low",
          )}
          aria-label="Grid view"
          aria-pressed={layoutView === "grid"}
        >
          <MaterialIcon icon="grid_view" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
}

type NotificationItemProps = {
  notification: PortalNotification & { isRead: boolean; deletedAt?: string };
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggleRead?: () => void;
  now: Date;
  showDeletedMeta?: boolean;
};

function NotificationListCard({
  notification,
  isSelected,
  onToggleSelect,
  onToggleRead,
  now,
  showDeletedMeta = false,
}: NotificationItemProps) {
  const meta = NOTIFICATION_CATEGORY_META[notification.category];

  return (
    <div
      className={cn(
        "portal-section group relative flex items-start gap-3 overflow-hidden rounded-xl border p-4 transition-shadow hover:shadow-md sm:gap-4",
        isSelected && "ring-2 ring-primary/30",
        notification.isRead
          ? "border-outline-variant/50 bg-surface-container-low opacity-80"
          : meta.borderClass,
      )}
    >
      {!notification.isRead && (
        <div className={cn("absolute top-0 bottom-0 left-0 w-1", meta.accentClass)} />
      )}

      <label className="mt-1 flex shrink-0 cursor-pointer items-start">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
          aria-label={`Select ${meta.label} notification`}
        />
      </label>

      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
          notification.isRead ? "bg-surface-variant text-outline" : meta.iconClass,
        )}
      >
        <MaterialIcon icon={meta.icon} className="text-[22px]" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h4 className="flex items-center gap-2 text-label-md font-label-md text-on-surface">
            {notification.title}
            {!notification.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
          </h4>
          <span className="shrink-0 text-label-sm text-outline">
            {formatNotificationTimestamp(
              showDeletedMeta && notification.deletedAt
                ? notification.deletedAt
                : notification.createdAt,
              now,
            )}
          </span>
        </div>

        <p className="mt-1 text-label-sm text-primary">{meta.label}</p>
        <p className="mt-1 text-body-md text-on-surface-variant">{notification.message}</p>

        {showDeletedMeta && notification.deletedAt && (
          <p className="mt-2 text-label-sm text-outline">
            Deleted {formatNotificationTimestamp(notification.deletedAt, now)}
          </p>
        )}

        {!showDeletedMeta && onToggleRead && (
          <div className="mt-4 flex flex-wrap gap-3">
            {notification.actionHref ? (
              <Link
                href={notification.actionHref}
                onClick={() => {
                  if (!notification.isRead) {
                    onToggleRead();
                  }
                }}
                className="rounded-lg bg-primary px-4 py-1.5 text-label-sm font-label-sm text-on-primary hover:opacity-90"
              >
                {notification.actionLabel ?? "View"}
              </Link>
            ) : notification.actionLabel ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (!notification.isRead) {
                    onToggleRead();
                  }
                }}
              >
                {notification.actionLabel}
              </Button>
            ) : null}

            <button
              type="button"
              onClick={onToggleRead}
              className="rounded-lg px-4 py-1.5 text-label-sm text-outline hover:text-on-surface"
            >
              {notification.isRead ? "Mark as unread" : "Mark as read"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationGridCard({
  notification,
  isSelected,
  onToggleSelect,
  onToggleRead,
  now,
  showDeletedMeta = false,
}: NotificationItemProps) {
  const meta = NOTIFICATION_CATEGORY_META[notification.category];

  return (
    <div
      className={cn(
        "portal-section relative flex h-full flex-col overflow-hidden rounded-xl border p-4 transition-shadow hover:shadow-md",
        isSelected && "ring-2 ring-primary/30",
        notification.isRead
          ? "border-outline-variant/50 bg-surface-container-low opacity-80"
          : meta.borderClass,
      )}
    >
      {!notification.isRead && (
        <div className={cn("absolute top-0 right-0 left-0 h-1", meta.accentClass)} />
      )}

      <div className="mb-3 flex items-start justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
            aria-label={`Select ${meta.label} notification`}
          />
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              notification.isRead ? "bg-surface-variant text-outline" : meta.iconClass,
            )}
          >
            <MaterialIcon icon={meta.icon} className="text-[18px]" />
          </div>
        </label>
        {!notification.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">{meta.label}</p>
      <h4 className="mt-1 line-clamp-2 text-label-md font-label-md text-on-surface">{notification.title}</h4>
      <p className="mt-2 line-clamp-3 flex-1 text-body-sm text-on-surface-variant">{notification.message}</p>

      <div className="mt-4 space-y-2 border-t border-outline-variant/50 pt-3">
        <p className="text-label-sm text-outline">
          {formatNotificationTimestamp(
            showDeletedMeta && notification.deletedAt ? notification.deletedAt : notification.createdAt,
            now,
          )}
        </p>
        {showDeletedMeta && notification.deletedAt && (
          <p className="text-[11px] text-outline">
            Deleted {formatNotificationTimestamp(notification.deletedAt, now)}
          </p>
        )}
        {!showDeletedMeta && onToggleRead && (
          <button
            type="button"
            onClick={onToggleRead}
            className="text-label-sm text-primary hover:underline"
          >
            {notification.isRead ? "Mark unread" : "Mark read"}
          </button>
        )}
      </div>
    </div>
  );
}

function renderNotificationItem(
  layoutView: LayoutView,
  props: NotificationItemProps,
) {
  return layoutView === "grid" ? (
    <NotificationGridCard {...props} />
  ) : (
    <NotificationListCard {...props} />
  );
}

export function NotificationsPage() {
  const {
    notifications,
    deletedNotifications,
    unreadCount,
    readCount,
    deletedCount,
    emailError,
    isReady,
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
  } = useStudentNotifications();

  const [mailboxFilter, setMailboxFilter] = useState<MailboxFilter>("inbox");
  const [timeFilter, setTimeFilter] = useState<NotificationTimeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategoryFilter>("all");
  const [layoutView, setLayoutView] = useState<LayoutView>(() => readNotificationLayoutView());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleLayoutViewChange = (view: LayoutView) => {
    setLayoutView(view);
    persistNotificationLayoutView(view);
  };

  const mailboxOptions = useMemo(
    () =>
      MAILBOX_FILTERS.map((option) =>
        option.value === "deleted"
          ? { ...option, label: `Deleted (${deletedCount})` }
          : option,
      ),
    [deletedCount],
  );

  const activeNotifications = mailboxFilter === "inbox" ? notifications : deletedNotifications;

  const filteredNotifications = useMemo(
    () => filterNotifications(activeNotifications, timeFilter, categoryFilter, now),
    [activeNotifications, timeFilter, categoryFilter, now],
  );

  const filteredGroupedNotifications = useMemo(() => {
    const groups = new Map<string, typeof filteredNotifications>();

    filteredNotifications.forEach((notification) => {
      const dateSource =
        mailboxFilter === "deleted" && "deletedAt" in notification
          ? (notification as DeletedStudentNotification).deletedAt
          : notification.createdAt;
      const date = new Date(dateSource);
      const label =
        date.toDateString() === now.toDateString()
          ? "Today"
          : date.toDateString() === new Date(now.getTime() - 86400000).toDateString()
            ? "Yesterday"
            : date.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });

      const existing = groups.get(label) ?? [];
      existing.push(notification);
      groups.set(label, existing);
    });

    return Array.from(groups.entries());
  }, [filteredNotifications, mailboxFilter, now]);

  const selectedCount = selectedIds.size;
  const allVisibleSelected =
    filteredNotifications.length > 0 &&
    filteredNotifications.every((notification) => selectedIds.has(notification.id));

  const selectedNotifications = useMemo(
    () => filteredNotifications.filter((notification) => selectedIds.has(notification.id)),
    [filteredNotifications, selectedIds],
  );

  const selectedHasUnread = selectedNotifications.some((notification) => !notification.isRead);
  const selectedHasRead = selectedNotifications.some((notification) => notification.isRead);

  const toggleSelection = (notificationId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(notificationId)) {
        next.delete(notificationId);
      } else {
        next.add(notificationId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(filteredNotifications.map((notification) => notification.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleMailboxChange = (value: MailboxFilter) => {
    setMailboxFilter(value);
    setSelectedIds(new Set());
  };

  const handleMarkSelectedAsRead = () => {
    markSelectedAsRead(Array.from(selectedIds));
    clearSelection();
  };

  const handleMarkSelectedAsUnread = () => {
    markSelectedAsUnread(Array.from(selectedIds));
    clearSelection();
  };

  const handleDeleteSelected = () => {
    deleteNotifications(Array.from(selectedIds));
    clearSelection();
  };

  const handleRestoreSelected = () => {
    restoreNotifications(Array.from(selectedIds));
    clearSelection();
  };

  const handlePermanentDeleteSelected = () => {
    permanentlyDeleteNotifications(Array.from(selectedIds));
    clearSelection();
  };

  const getItemProps = (
    notification: PortalNotification & { isRead: boolean; deletedAt?: string },
  ): NotificationItemProps => ({
    notification,
    isSelected: selectedIds.has(notification.id),
    onToggleSelect: () => toggleSelection(notification.id),
    onToggleRead:
      mailboxFilter === "inbox"
        ? () => (notification.isRead ? markAsUnread(notification.id) : markAsRead(notification.id))
        : undefined,
    now,
    showDeletedMeta: mailboxFilter === "deleted",
  });

  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-headline-lg font-headline-lg text-on-surface">Notifications</h2>
            {mailboxFilter === "inbox" && (
              <div className="flex items-center gap-2">
                <NotificationBellPopover className="h-11 w-11" />
                <NotificationBellPopover
                  className="h-11 w-11"
                  sendEmail={false}
                  icon="mail"
                  ariaLabel="Generate in-app notification"
                />
              </div>
            )}
          </div>
          <p className="mt-1 text-body-md text-outline">
            {isReady ? (
              mailboxFilter === "inbox" ? (
                <>
                  You have <span className="font-bold text-primary">{unreadCount} unread</span> notification
                  {unreadCount === 1 ? "" : "s"} to review.
                </>
              ) : (
                <>
                  <span className="font-bold text-primary">{deletedCount}</span> deleted notification
                  {deletedCount === 1 ? "" : "s"} in trash.
                </>
              )
            ) : (
              "Loading notifications..."
            )}
          </p>
        </div>

        {mailboxFilter === "inbox" && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 rounded-lg border border-primary/20 px-4 py-2 text-label-md font-label-md text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MaterialIcon icon="done_all" className="text-[18px]" />
              Mark all as read
            </button>
            <button
              type="button"
              onClick={markAllAsUnread}
              disabled={readCount === 0 || notifications.length === 0}
              className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-label-md font-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MaterialIcon icon="mark_email_unread" className="text-[18px]" />
              Mark all as unread
            </button>
          </div>
        )}
      </div>

      <div className="portal-section mb-6 rounded-xl border border-outline-variant/60 bg-surface-container-low/60 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <FilterSelect
              label="Mailbox"
              value={mailboxFilter}
              options={mailboxOptions}
              onChange={handleMailboxChange}
            />
            <FilterSelect
              label="Date"
              value={timeFilter}
              options={NOTIFICATION_TIME_FILTERS}
              onChange={setTimeFilter}
            />
            <FilterSelect
              label="Category"
              value={categoryFilter}
              options={NOTIFICATION_CATEGORY_FILTERS}
              onChange={setCategoryFilter}
            />
            <SelectAllControl
              checked={allVisibleSelected}
              count={filteredNotifications.length}
              onChange={toggleSelectAll}
            />
            <ViewToggle layoutView={layoutView} onChange={handleLayoutViewChange} />
          </div>

          {selectedCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-outline-variant/50 pt-4">
              <span className="text-label-sm text-on-surface-variant">{selectedCount} selected</span>
              {mailboxFilter === "inbox" ? (
                <>
                  <button
                    type="button"
                    onClick={handleMarkSelectedAsRead}
                    disabled={!selectedHasUnread}
                    className="rounded-lg border border-primary/20 px-3 py-1.5 text-label-sm font-label-md text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Mark selected as read
                  </button>
                  <button
                    type="button"
                    onClick={handleMarkSelectedAsUnread}
                    disabled={!selectedHasRead}
                    className="rounded-lg border border-outline-variant px-3 py-1.5 text-label-sm font-label-md text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Mark selected as unread
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="rounded-lg border border-pastel-coral-border bg-pastel-coral/30 px-3 py-1.5 text-label-sm font-label-md text-pastel-coral-text hover:bg-pastel-coral/50"
                  >
                    Delete selected
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleRestoreSelected}
                    className="rounded-lg border border-primary/20 px-3 py-1.5 text-label-sm font-label-md text-primary hover:bg-primary/5"
                  >
                    Restore selected
                  </button>
                  <button
                    type="button"
                    onClick={handlePermanentDeleteSelected}
                    className="rounded-lg border border-pastel-coral-border bg-pastel-coral/30 px-3 py-1.5 text-label-sm font-label-md text-pastel-coral-text hover:bg-pastel-coral/50"
                  >
                    Delete permanently
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-lg px-3 py-1.5 text-label-sm text-outline hover:text-on-surface"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {emailError && mailboxFilter === "inbox" && (
        <div className="mb-6 rounded-xl border border-pastel-coral-border bg-pastel-coral/20 px-4 py-3 text-body-sm text-error">
          {emailError}
        </div>
      )}

      {!isReady ? (
        <p className="text-body-md text-on-surface-variant">Loading notifications...</p>
      ) : filteredGroupedNotifications.length === 0 ? (
        <div className="portal-section rounded-xl border border-outline-variant bg-surface-container-low p-8 text-center">
          <MaterialIcon
            icon={mailboxFilter === "deleted" ? "delete_outline" : "notifications_off"}
            className="mb-3 text-[40px] text-outline"
          />
          <h3 className="text-headline-sm font-headline-sm text-on-surface">
            {mailboxFilter === "deleted" ? "No deleted notifications" : "No notifications match your filters"}
          </h3>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            {mailboxFilter === "deleted"
              ? "Deleted notifications will appear here."
              : "Try changing the mailbox, date, or category filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {filteredGroupedNotifications.map(([label, items]) => (
            <section key={label}>
              <div className="mb-4 flex items-center gap-4">
                <h3 className="text-headline-sm font-headline-sm text-on-surface">{label}</h3>
                <div className="h-px flex-1 bg-outline-variant" />
              </div>
              <div
                className={cn(
                  layoutView === "grid"
                    ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
                    : "space-y-3",
                )}
              >
                {items.map((notification) => (
                  <div key={notification.id}>
                    {renderNotificationItem(layoutView, getItemProps(notification))}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
