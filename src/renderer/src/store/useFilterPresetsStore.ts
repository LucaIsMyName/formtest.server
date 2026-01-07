import { create } from "zustand";

export interface FilterPreset {
  id: number;
  name: string;
  filterConfig: any; // JSON object with filter configuration
  createdAt: Date;
  updatedAt: Date;
}

interface FilterPresetsState {
  presets: FilterPreset[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPresets: () => Promise<void>;
  createPreset: (name: string, filterConfig: any) => Promise<FilterPreset | null>;
  updatePreset: (id: number, name: string, filterConfig: any) => Promise<void>;
  deletePreset: (id: number) => Promise<void>;
}

export const useFilterPresetsStore = create<FilterPresetsState>((set, get) => ({
  presets: [],
  isLoading: false,
  error: null,

  loadPresets: async () => {
    set({ isLoading: true, error: null });
    try {
      if (!window.api) {
        throw new Error("API not available - make sure you are running in Electron");
      }
      const presets = await window.api.filterPresets.getAll();
      set({ presets, isLoading: false });
    } catch (error) {
      console.error("Failed to load filter presets:", error);
      set({ error: error instanceof Error ? error.message : "Failed to load filter presets", isLoading: false });
    }
  },

  createPreset: async (name: string, filterConfig: any) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      const newPreset = await window.api.filterPresets.create(name, filterConfig);
      await get().loadPresets();
      return newPreset;
    } catch (error) {
      console.error("Failed to create filter preset:", error);
      set({ error: error instanceof Error ? error.message : "Failed to create filter preset" });
      return null;
    }
  },

  updatePreset: async (id: number, name: string, filterConfig: any) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.filterPresets.update(id, name, filterConfig);
      await get().loadPresets();
    } catch (error) {
      console.error("Failed to update filter preset:", error);
      set({ error: error instanceof Error ? error.message : "Failed to update filter preset" });
    }
  },

  deletePreset: async (id: number) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.filterPresets.delete(id);
      await get().loadPresets();
    } catch (error) {
      console.error("Failed to delete filter preset:", error);
      set({ error: error instanceof Error ? error.message : "Failed to delete filter preset" });
    }
  },
}));



