import { create } from "zustand";

export interface Notification {
  id: number;
  type: 'test_complete' | 'test_failed' | 'info';
  title: string;
  message?: string;
  testRunId?: number;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  loadNotifications: () => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAll: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  loadNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      if (!window.api) throw new Error("API not available");
      const notifications = await window.api.notifications.getAll();
      const unreadCount = await window.api.notifications.getUnreadCount();
      set({ 
        notifications: notifications.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        })),
        unreadCount,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  loadUnreadCount: async () => {
    try {
      if (!window.api) return;
      const unreadCount = await window.api.notifications.getUnreadCount();
      set({ unreadCount });
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  },

  markAsRead: async (id: number) => {
    try {
      if (!window.api) throw new Error("API not available");
      await window.api.notifications.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  markAllAsRead: async () => {
    try {
      if (!window.api) throw new Error("API not available");
      await window.api.notifications.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteNotification: async (id: number) => {
    try {
      if (!window.api) throw new Error("API not available");
      await window.api.notifications.delete(id);
      const notification = get().notifications.find((n) => n.id === id);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.isRead 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteAll: async () => {
    try {
      if (!window.api) throw new Error("API not available");
      await window.api.notifications.deleteAll();
      set({ notifications: [], unreadCount: 0 });
    } catch (error: any) {
      set({ error: error.message });
    }
  }
}));
