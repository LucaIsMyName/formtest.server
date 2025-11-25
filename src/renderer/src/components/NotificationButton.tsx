import React, { useEffect } from "react";
import { Bell, CheckCircle2, XCircle, Info, X, CheckCheck } from "lucide-react";
import { useNotificationsStore, Notification } from "../store/useNotificationsStore";
import { useNavigate, useLocation } from "react-router-dom";
import { formatDateTime } from "../utils/formatters";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const NotificationButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, unreadCount, loadNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationsStore();

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
        return <CheckCircle2 size={14} className="text-green-500" />;
      case "test_failed":
        return <XCircle size={14} className="text-red-500" />;
      default:
        return <Info size={14} className="text-blue-500" />;
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

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="relative p-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
          aria-label="Benachrichtigungen">
          <Bell size={14} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[100] overflow-hidden animate-in fade-in-0 zoom-in-95"
          sideOffset={8}
          align="end">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Benachrichtigungen</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={(e) => { e.preventDefault(); markAllAsRead(); }}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  title="Alle als gelesen markieren">
                  <CheckCheck size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Keine Benachrichtigungen
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <DropdownMenu.Item
                  key={notification.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors outline-none ${
                    !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                  }`}
                  onSelect={() => handleNotificationClick(notification)}>
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notification.isRead ? "font-medium" : ""} text-gray-900 dark:text-white truncate`}>
                        {notification.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          deleteNotification(notification.id);
                        }}
                        className="flex-shrink-0 p-0.5 text-gray-400 hover:text-red-500 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                    {notification.message && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                  )}
                </DropdownMenu.Item>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <DropdownMenu.Item
                className="w-full text-center text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer outline-none"
                onSelect={() => navigate("/test-results")}>
                Alle Testergebnisse anzeigen
              </DropdownMenu.Item>
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default NotificationButton;
