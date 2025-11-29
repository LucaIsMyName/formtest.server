import { create } from "zustand";
import type { SelectorOverride, SelectorConfig } from "../../../common/selectors.config";

interface ConfigurableCategory {
  category: string;
  keys: string[];
  label: string;
}

interface SelectorsState {
  // State
  overrides: SelectorOverride[];
  baseConfig: SelectorConfig | null;
  mergedConfig: SelectorConfig | null;
  categories: ConfigurableCategory[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadOverrides: () => Promise<void>;
  loadBaseConfig: () => Promise<void>;
  loadMergedConfig: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadAll: () => Promise<void>;
  
  createOverride: (override: { category: string; key: string; selectors: string[]; isActive?: boolean }) => Promise<void>;
  updateOverride: (id: number, override: { selectors?: string[]; isActive?: boolean }) => Promise<void>;
  upsertOverride: (override: { category: string; key: string; selectors: string[]; isActive?: boolean }) => Promise<void>;
  deleteOverride: (id: number) => Promise<void>;
  deleteOverrideByKey: (category: string, key: string) => Promise<void>;
  deleteAllOverrides: () => Promise<void>;

  // Helpers
  getOverridesByCategory: (category: string) => SelectorOverride[];
  getOverrideByKey: (category: string, key: string) => SelectorOverride | undefined;
  getDefaultSelectors: (category: string, key: string) => string[];
  getMergedSelectors: (category: string, key: string) => string[];
}

export const useSelectorsStore = create<SelectorsState>((set, get) => ({
  // Initial state
  overrides: [],
  baseConfig: null,
  mergedConfig: null,
  categories: [],
  isLoading: false,
  error: null,

  // Load all overrides
  loadOverrides: async () => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      const overrides = await window.api.selectorOverrides.getAll();
      set({ overrides });
    } catch (error) {
      console.error("Failed to load selector overrides:", error);
      set({ error: error instanceof Error ? error.message : "Failed to load overrides" });
    }
  },

  // Load base config (defaults)
  loadBaseConfig: async () => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      const baseConfig = await window.api.selectorConfig.getBase();
      set({ baseConfig });
    } catch (error) {
      console.error("Failed to load base config:", error);
      set({ error: error instanceof Error ? error.message : "Failed to load base config" });
    }
  },

  // Load merged config (defaults + overrides)
  loadMergedConfig: async () => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      const mergedConfig = await window.api.selectorConfig.getMerged();
      set({ mergedConfig });
    } catch (error) {
      console.error("Failed to load merged config:", error);
      set({ error: error instanceof Error ? error.message : "Failed to load merged config" });
    }
  },

  // Load configurable categories
  loadCategories: async () => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      const categories = await window.api.selectorConfig.getCategories();
      set({ categories });
    } catch (error) {
      console.error("Failed to load categories:", error);
      set({ error: error instanceof Error ? error.message : "Failed to load categories" });
    }
  },

  // Load everything
  loadAll: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().loadOverrides(),
        get().loadBaseConfig(),
        get().loadMergedConfig(),
        get().loadCategories()
      ]);
    } finally {
      set({ isLoading: false });
    }
  },

  // Create a new override
  createOverride: async (override) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.selectorOverrides.create(override);
      await get().loadOverrides();
      await get().loadMergedConfig();
    } catch (error) {
      console.error("Failed to create override:", error);
      set({ error: error instanceof Error ? error.message : "Failed to create override" });
      throw error;
    }
  },

  // Update an existing override
  updateOverride: async (id, override) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.selectorOverrides.update(id, override);
      await get().loadOverrides();
      await get().loadMergedConfig();
    } catch (error) {
      console.error("Failed to update override:", error);
      set({ error: error instanceof Error ? error.message : "Failed to update override" });
      throw error;
    }
  },

  // Upsert an override (create or update)
  upsertOverride: async (override) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.selectorOverrides.upsert(override);
      await get().loadOverrides();
      await get().loadMergedConfig();
    } catch (error) {
      console.error("Failed to upsert override:", error);
      set({ error: error instanceof Error ? error.message : "Failed to upsert override" });
      throw error;
    }
  },

  // Delete an override by ID
  deleteOverride: async (id) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.selectorOverrides.delete(id);
      await get().loadOverrides();
      await get().loadMergedConfig();
    } catch (error) {
      console.error("Failed to delete override:", error);
      set({ error: error instanceof Error ? error.message : "Failed to delete override" });
      throw error;
    }
  },

  // Delete an override by category and key
  deleteOverrideByKey: async (category, key) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.selectorOverrides.deleteByKey(category, key);
      await get().loadOverrides();
      await get().loadMergedConfig();
    } catch (error) {
      console.error("Failed to delete override:", error);
      set({ error: error instanceof Error ? error.message : "Failed to delete override" });
      throw error;
    }
  },

  // Delete all overrides
  deleteAllOverrides: async () => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.selectorOverrides.deleteAll();
      await get().loadOverrides();
      await get().loadMergedConfig();
    } catch (error) {
      console.error("Failed to delete all overrides:", error);
      set({ error: error instanceof Error ? error.message : "Failed to delete all overrides" });
      throw error;
    }
  },

  // Helper: Get overrides for a specific category
  getOverridesByCategory: (category) => {
    return get().overrides.filter(o => o.category === category);
  },

  // Helper: Get a specific override by category and key
  getOverrideByKey: (category, key) => {
    return get().overrides.find(o => o.category === category && o.key === key);
  },

  // Helper: Get default selectors for a category/key
  getDefaultSelectors: (category, key) => {
    const config = get().baseConfig;
    if (!config) return [];

    const categoryObj = config[category as keyof SelectorConfig];
    if (!categoryObj || typeof categoryObj !== 'object') return [];

    const selectors = (categoryObj as Record<string, unknown>)[key];
    if (Array.isArray(selectors)) {
      return selectors as string[];
    }
    return [];
  },

  // Helper: Get merged selectors (user overrides + defaults)
  getMergedSelectors: (category, key) => {
    const config = get().mergedConfig;
    if (!config) return [];

    const categoryObj = config[category as keyof SelectorConfig];
    if (!categoryObj || typeof categoryObj !== 'object') return [];

    const selectors = (categoryObj as Record<string, unknown>)[key];
    if (Array.isArray(selectors)) {
      return selectors as string[];
    }
    return [];
  }
}));
