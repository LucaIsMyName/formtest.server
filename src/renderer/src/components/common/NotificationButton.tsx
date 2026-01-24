import React, { useEffect } from "react";
import { Bell, CheckCircle2, XCircle, Info, X, CheckCheck, Trash2 } from "lucide-react";
import { useNotificationsStore, Notification } from "../../store/useNotificationsStore";
import { useNavigate, useLocation } from "react-router-dom";
import { formatDateTime } from "../../utils/formatters";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tooltip from "@radix-ui/react-tooltip";
import Button from "../ui/Button";

const NotificationButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, unreadCount, loadNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAll } = useNotificationsStore();

  // Load notifications on mount and set up listener
  useEffect(() => {
    loadNotifications();
    
    // Listen for notification updates from main process
    const cleanup = window.api?.notifications?.onUpdated?.(() => {
      loadNotifications();
    });

    return cleanup;
  }, [loadNotifications]);

  // Auto-mark as read when on TestResults page
  useEffect(() => {
    if (location.pathname === "/test-results" && unreadCount > 0) {
      markAllAsRead();
    }
  }, [location.pathname, unreadCount, markAllAsRead]);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "test_complete":
        return <CheckCircle2 size={12} className="text-green-500" />;
      case "test_failed":
        return <XCircle size={12} className="text-red-500" />;
      default:
        return <Info size={12} className="text-blue-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.testRunId) {
      navigate(`/test-results?highlight=${notification.testRunId}`);
    }
  };

  // Announce new notifications
  useEffect(() => {
    if (unreadCount > 0) {
      // Announcement will be handled by aria-live region
    }
  }, [unreadCount]);

  return (
    <Tooltip.Provider>
      <AriaLiveRegion level="polite" id="notification-announcements">
        {unreadCount > 0 && `${unreadCount} neue Benachrichtigung${unreadCount !== 1 ? "en" : ""}`}
      </AriaLiveRegion>
      <DropdownMenu.Root>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <DropdownMenu.Trigger asChild>
              <Button
                   variant="secondary"
                    className="p-1.5 !px-1.5 !py-1.5"
                aria-label="Benachrichtigungen">
                <Bell size={14} aria-hidden="true" />
                {unreadCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                    aria-label={`${unreadCount} ungelesene Benachrichtigungen`}
                  >
                    <span aria-hidden="true">{unreadCount > 9 ? "9+" : unreadCount}</span>
                  </span>
                )}
              </Button>
            </DropdownMenu.Trigger>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-neutral-900 dark:bg-neutral-700 text-white text-xs px-2 py-1 rounded shadow-lg z-50"
              sideOffset={5}>
              Benachrichtigungen
              <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-700" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="w-72 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-[100] overflow-hidden animate-in fade-in-0 zoom-in-95"
          sideOffset={8}
          align="end">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
            <h3 className="text-xs font-medium text-neutral-900 dark:text-white">Benachrichtigungen</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={(e) => { e.preventDefault(); markAllAsRead(); }}
                  className="p-1 text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Alle als gelesen markieren">
                  <CheckCheck size={14} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={(e) => { e.preventDefault(); deleteAll(); }}
                  className="p-1 text-neutral-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Alle löschen"
                  aria-label="Alle löschen">
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
                Keine Benachrichtigungen
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <DropdownMenu.Item
                  key={notification.id}
                  className={`flex items-start gap-2 px-3 py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors outline-none ${
                    !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                  }`}
                  onSelect={() => handleNotificationClick(notification)}>
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-[13px] font-normal leading-tight block ${!notification.isRead ? "" : ""} text-neutral-900 dark:text-white truncate`}>
                        {notification.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          deleteNotification(notification.id);
                        }}
                        aria-label="Benachrichtigung löschen"
                        className="flex-shrink-0 p-0.5 text-neutral-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 rounded">
                        <X size={10} />
                      </button>
                    </div>
                    {notification.message && (
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-1">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-1" />
                  )}
                </DropdownMenu.Item>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-3 py-1.5 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
              <DropdownMenu.Item
                className="w-full text-center text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer outline-none"
                onSelect={() => navigate("/test-results")}>
                Alle Testergebnisse anzeigen
              </DropdownMenu.Item>
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </Tooltip.Provider>
  );
};

export default NotificationButton;
