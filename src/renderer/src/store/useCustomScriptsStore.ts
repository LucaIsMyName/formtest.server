import { create } from "zustand";
import type { CustomScript, FormScript, ScriptHookPoint, ScriptValidationResult } from "../../../common/types";

interface CustomScriptsState {
  scripts: CustomScript[];
  formScripts: Map<number, FormScript[]>; // formId -> FormScript[]
  isLoading: boolean;
  error: string | null;

  // Actions
  loadScripts: () => Promise<void>;
  loadFormScripts: (formId: number) => Promise<void>;
  getScriptById: (id: number) => CustomScript | undefined;
  getScriptsByHookPoint: (hookPoint: ScriptHookPoint) => CustomScript[];
  getGlobalScripts: () => CustomScript[];
  getScriptsForForm: (formId: number) => CustomScript[];
  
  // CRUD
  createScript: (script: Omit<CustomScript, "id" | "createdAt" | "updatedAt">) => Promise<number | null>;
  updateScript: (id: number, script: Partial<CustomScript>) => Promise<void>;
  deleteScript: (id: number) => Promise<void>;
  deleteAllScripts: () => Promise<void>;
  
  // Validation
  validateScript: (code: string) => Promise<ScriptValidationResult>;
  
  // Form-Script associations
  attachScriptToForm: (formId: number, scriptId: number, executionOrder?: number) => Promise<void>;
  detachScriptFromForm: (formId: number, scriptId: number) => Promise<void>;
  updateScriptOrder: (formId: number, scriptId: number, executionOrder: number) => Promise<void>;
}

export const useCustomScriptsStore = create<CustomScriptsState>((set, get) => ({
  scripts: [],
  formScripts: new Map(),
  isLoading: false,
  error: null,

  loadScripts: async () => {
    set({ isLoading: true, error: null });
    try {
      if (!window.api) {
        throw new Error("API not available - make sure you are running in Electron");
      }
      const scripts = await window.api.customScripts.getAll();
      set({ scripts, isLoading: false });
    } catch (error) {
      console.error("Failed to load custom scripts:", error);
      set({ error: error instanceof Error ? error.message : "Failed to load scripts", isLoading: false });
    }
  },

  loadFormScripts: async (formId: number) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      const formScriptsList = await window.api.formScripts.getByFormId(formId);
      set((state) => {
        const newMap = new Map(state.formScripts);
        newMap.set(formId, formScriptsList);
        return { formScripts: newMap };
      });
    } catch (error) {
      console.error(`Failed to load form scripts for form ${formId}:`, error);
    }
  },

  getScriptById: (id: number) => {
    return get().scripts.find((s) => s.id === id);
  },

  getScriptsByHookPoint: (hookPoint: ScriptHookPoint) => {
    return get().scripts.filter((s) => s.hookPoint === hookPoint);
  },

  getGlobalScripts: () => {
    return get().scripts.filter((s) => s.isGlobal);
  },

  getScriptsForForm: (formId: number) => {
    const { scripts, formScripts } = get();
    const associations = formScripts.get(formId) || [];
    const scriptIds = new Set(associations.map((fs) => fs.scriptId));
    
    // Return global scripts + form-specific scripts
    return scripts.filter((s) => s.isGlobal || scriptIds.has(s.id));
  },

  createScript: async (scriptData) => {
    set({ isLoading: true, error: null });
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      const result = await window.api.customScripts.create(scriptData);
      await get().loadScripts();
      return result?.id || null;
    } catch (error) {
      console.error("Failed to create script:", error);
      set({ error: error instanceof Error ? error.message : "Failed to create script", isLoading: false });
      return null;
    }
  },

  updateScript: async (id, scriptData) => {
    set({ isLoading: true, error: null });
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.customScripts.update(id, scriptData);
      await get().loadScripts();
    } catch (error) {
      console.error("Failed to update script:", error);
      set({ error: error instanceof Error ? error.message : "Failed to update script", isLoading: false });
    }
  },

  deleteScript: async (id) => {
    set({ isLoading: true, error: null });
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.customScripts.delete(id);
      await get().loadScripts();
    } catch (error) {
      console.error("Failed to delete script:", error);
      set({ error: error instanceof Error ? error.message : "Failed to delete script", isLoading: false });
    }
  },

  deleteAllScripts: async () => {
    set({ isLoading: true, error: null });
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.customScripts.deleteAll();
      set({ scripts: [], formScripts: new Map(), isLoading: false });
    } catch (error) {
      console.error("Failed to delete all scripts:", error);
      set({ error: error instanceof Error ? error.message : "Failed to delete scripts", isLoading: false });
    }
  },

  validateScript: async (code: string) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      return await window.api.customScripts.validate(code);
    } catch (error) {
      console.error("Failed to validate script:", error);
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : "Validation failed"],
        warnings: [],
      };
    }
  },

  attachScriptToForm: async (formId, scriptId, executionOrder = 0) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.formScripts.attach(formId, scriptId, executionOrder);
      await get().loadFormScripts(formId);
    } catch (error) {
      console.error("Failed to attach script to form:", error);
      set({ error: error instanceof Error ? error.message : "Failed to attach script" });
    }
  },

  detachScriptFromForm: async (formId, scriptId) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.formScripts.detach(formId, scriptId);
      await get().loadFormScripts(formId);
    } catch (error) {
      console.error("Failed to detach script from form:", error);
      set({ error: error instanceof Error ? error.message : "Failed to detach script" });
    }
  },

  updateScriptOrder: async (formId, scriptId, executionOrder) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.formScripts.updateOrder(formId, scriptId, executionOrder);
      await get().loadFormScripts(formId);
    } catch (error) {
      console.error("Failed to update script order:", error);
      set({ error: error instanceof Error ? error.message : "Failed to update order" });
    }
  },
}));
