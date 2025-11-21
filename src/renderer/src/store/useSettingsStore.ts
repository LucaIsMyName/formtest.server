import { create } from 'zustand'
import type { GlobalSetting } from '../../../common/types'

interface SettingsState {
  settings: GlobalSetting[]
  isLoading: boolean
  error: string | null
  
  // Actions
  loadSettings: () => Promise<void>
  getSetting: (key: string) => GlobalSetting | undefined
  updateSetting: (key: string, value: string, description?: string) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: [],
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null })
    try {
      if (!window.api) {
        throw new Error('API not available - make sure you are running in Electron')
      }
      const settings = await window.api.settings.getAll()
      set({ settings, isLoading: false })
    } catch (error) {
      console.error('Failed to load settings:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to load settings', isLoading: false })
    }
  },

  getSetting: (key: string) => {
    return get().settings.find(setting => setting.key === key)
  },

  updateSetting: async (key: string, value: string, description?: string) => {
    set({ isLoading: true, error: null })
    try {
      if (!window.api) {
        throw new Error('API not available - make sure you are running in Electron')
      }
      await window.api.settings.set(key, value, description)
      await get().loadSettings() // Reload settings after updating
    } catch (error) {
      console.error('Failed to update setting:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to update setting', isLoading: false })
    }
  }
}))

// Window API types are defined in ../types/window.d.ts
