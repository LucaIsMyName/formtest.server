import { create } from "zustand";

export interface TagDefinition {
  id: number;
  name: string;
  color: string;
  createdAt: Date;
}

interface TagsState {
  tags: TagDefinition[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTags: () => Promise<void>;
  createTag: (name: string, color?: string) => Promise<TagDefinition | null>;
  updateTag: (id: number, name: string, color: string) => Promise<void>;
  deleteTag: (id: number) => Promise<void>;
}

export const useTagsStore = create<TagsState>((set, get) => ({
  tags: [],
  isLoading: false,
  error: null,

  loadTags: async () => {
    set({ isLoading: true, error: null });
    try {
      if (!window.api) {
        throw new Error("API not available - make sure you are running in Electron");
      }
      const tags = await window.api.tags.getAll();
      set({ tags, isLoading: false });
    } catch (error) {
      console.error("Failed to load tags:", error);
      set({ error: error instanceof Error ? error.message : "Failed to load tags", isLoading: false });
    }
  },

  createTag: async (name: string, color: string = '#3B82F6') => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      const newTag = await window.api.tags.create(name, color);
      await get().loadTags();
      return newTag;
    } catch (error) {
      console.error("Failed to create tag:", error);
      set({ error: error instanceof Error ? error.message : "Failed to create tag" });
      return null;
    }
  },

  updateTag: async (id: number, name: string, color: string) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.tags.update(id, name, color);
      await get().loadTags();
    } catch (error) {
      console.error("Failed to update tag:", error);
      set({ error: error instanceof Error ? error.message : "Failed to update tag" });
    }
  },

  deleteTag: async (id: number) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.tags.delete(id);
      await get().loadTags();
    } catch (error) {
      console.error("Failed to delete tag:", error);
      set({ error: error instanceof Error ? error.message : "Failed to delete tag" });
    }
  },
}));

