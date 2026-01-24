import { create } from "zustand";
import type { Form } from "../../../common/types";

interface FormsState {
  forms: Form[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadForms: () => Promise<void>;
  addForm: (
    form: Omit<Form, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateForm: (id: number, form: Partial<Form>) => Promise<void>;
  deleteForm: (id: number) => Promise<void>;
  toggleFormActive: (id: number) => Promise<void>;
}

export const useFormsStore = create<FormsState>((set, get) => ({
  forms: [],
  isLoading: false,
  error: null,

  loadForms: async () => {
    set({ isLoading: true, error: null });
    try {
      if (!window.api) {
        throw new Error(
          "API not available - make sure you are running in Electron"
        );
      }
      const forms = await window.api.forms.getAll();
      set({ forms, isLoading: false });
    } catch (error) {
      console.error("Failed to load forms:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to load forms",
        isLoading: false,
      });
    }
  },

  addForm: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      if (!window.api) {
        throw new Error(
          "API not available - make sure you are running in Electron"
        );
      }
      console.log("Creating form:", formData);
      await window.api.forms.create(formData);
      await get().loadForms(); // Reload forms after adding
    } catch (error) {
      console.error("Failed to add form:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to add form",
        isLoading: false,
      });
    }
  },

  updateForm: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      await window.api.forms.update(id, formData);
      await get().loadForms(); // Reload forms after updating
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update form",
        isLoading: false,
      });
    }
  },

  deleteForm: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await window.api.forms.delete(id);
      await get().loadForms(); // Reload forms after deleting
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete form",
        isLoading: false,
      });
    }
  },

  toggleFormActive: async (id) => {
    const form = get().forms.find((f) => f.id === id);
    if (form) {
      await get().updateForm(id, { isActive: !form.isActive });
    }
  },
}));

// Window API types are defined in ../types/window.d.ts
