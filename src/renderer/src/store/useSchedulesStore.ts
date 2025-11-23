import { create } from "zustand";
import { TestSchedule } from "../../../common/types";

interface SchedulesState {
  schedules: TestSchedule[];
  isLoading: boolean;
  error: string | null;
  loadSchedules: () => Promise<void>;
  createSchedule: (schedule: { name: string; formId: number; paymentMethodId: number; cronExpression: string; isActive: boolean }) => Promise<void>;
  updateSchedule: (id: number, schedule: Partial<TestSchedule>) => Promise<void>;
  deleteSchedule: (id: number) => Promise<void>;
  runScheduleNow: (id: number) => Promise<void>;
}

export const useSchedulesStore = create<SchedulesState>((set, get) => ({
  schedules: [],
  isLoading: false,
  error: null,

  loadSchedules: async () => {
    set({ isLoading: true, error: null });
    try {
      const schedules = await window.api.testSchedules.getAll();
      set({ schedules, isLoading: false });
    } catch (error) {
      set({ error: "Failed to load schedules", isLoading: false });
    }
  },

  createSchedule: async (schedule) => {
    set({ isLoading: true, error: null });
    try {
      await window.api.testSchedules.create(schedule);
      await get().loadSchedules();
    } catch (error) {
      set({ error: "Failed to create schedule", isLoading: false });
      throw error;
    }
  },

  updateSchedule: async (id, schedule) => {
    set({ isLoading: true, error: null });
    try {
      await window.api.testSchedules.update(id, schedule);
      await get().loadSchedules();
    } catch (error) {
      set({ error: "Failed to update schedule", isLoading: false });
      throw error;
    }
  },

  deleteSchedule: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await window.api.testSchedules.delete(id);
      await get().loadSchedules();
    } catch (error) {
      set({ error: "Failed to delete schedule", isLoading: false });
      throw error;
    }
  },

  runScheduleNow: async (id) => {
    // Don't set global loading state as this is a background action
    // The user might want to continue interacting with the UI
    try {
      await window.api.testSchedules.runNow(id);
      // Optionally reload schedules to update "last run" time, but give it a moment
      // for the backend to update the DB
      setTimeout(() => {
        get().loadSchedules();
      }, 500);
    } catch (error) {
      console.error("Failed to run schedule now:", error);
      throw error;
    }
  },
}));
