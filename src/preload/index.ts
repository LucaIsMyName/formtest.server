import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Form, PaymentMethod, TestRun, ImportOptions, TestSchedule, GlobalFieldDefaults } from '../common/types'
import type { SelectorOverride, SelectorConfig } from '../common/selectors.config'

// Custom APIs for renderer
const api = {
  // Form operations
  forms: {
    getAll: () => ipcRenderer.invoke('forms:getAll'),
    getById: (id: number) => ipcRenderer.invoke('forms:getById', id),
    create: (form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) => ipcRenderer.invoke('forms:create', form),
    update: (id: number, form: Partial<Form>) => ipcRenderer.invoke('forms:update', id, form),
    delete: (id: number) => ipcRenderer.invoke('forms:delete', id),
    deleteAll: () => ipcRenderer.invoke('forms:deleteAll')
  },

  // Payment method operations
  paymentMethods: {
    getAll: () => ipcRenderer.invoke('paymentMethods:getAll'),
    getById: (id: number) => ipcRenderer.invoke('paymentMethods:getById', id),
    create: (method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>) => ipcRenderer.invoke('paymentMethods:create', method),
    update: (id: number, method: Partial<PaymentMethod>) => ipcRenderer.invoke('paymentMethods:update', id, method),
    delete: (id: number) => ipcRenderer.invoke('paymentMethods:delete', id),
    deleteAll: () => ipcRenderer.invoke('paymentMethods:deleteAll')
  },

  // Settings operations
  settings: {
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: string, description?: string) => ipcRenderer.invoke('settings:set', key, value, description),
    getFieldDefaults: (): Promise<GlobalFieldDefaults> => ipcRenderer.invoke('settings:getFieldDefaults'),
    setFieldDefaults: (defaults: GlobalFieldDefaults) => ipcRenderer.invoke('settings:setFieldDefaults', defaults)
  },

  // Test run operations
  testRuns: {
    getAll: () => ipcRenderer.invoke('testRuns:getAll'),
    getById: (id: number) => ipcRenderer.invoke('testRuns:getById', id),
    getByForm: (formId: number) => ipcRenderer.invoke('testRuns:getByForm', formId),
    create: (testRun: Omit<TestRun, 'id' | 'runAt'>) => ipcRenderer.invoke('testRuns:create', testRun),
    updateStatus: (id: number, status: TestRun['status'], errorMessage?: string, durationMs?: number) => 
      ipcRenderer.invoke('testRuns:updateStatus', id, status, errorMessage, durationMs),
    delete: (id: number) => ipcRenderer.invoke('testRuns:delete', id),
    deleteAll: () => ipcRenderer.invoke('testRuns:deleteAll'),
    updateNotes: (id: number, notes: string) => ipcRenderer.invoke('testRuns:updateNotes', id, notes),
    stop: (id: number) => ipcRenderer.invoke('testRuns:stop', id)
  },

  // Test execution
  tests: {
    run: (formIds: number[], paymentMethodIds: number[], options?: { customAmount?: string; customInterval?: string }) => 
      ipcRenderer.invoke('tests:run', formIds, paymentMethodIds, options)
  },

  // Test queue operations
  testQueue: {
    getStatus: () => ipcRenderer.invoke('testQueue:getStatus'),
    clear: () => ipcRenderer.invoke('testQueue:clear'),
    stopAll: () => ipcRenderer.invoke('testQueue:stopAll')
  },

  // Test schedule operations
  testSchedules: {
    getAll: () => ipcRenderer.invoke('testSchedules:getAll'),
    getById: (id: number) => ipcRenderer.invoke('testSchedules:getById', id),
    runNow: (id: number) => ipcRenderer.invoke('testSchedules:runNow', id),
    create: (schedule: { name: string; formId: number; paymentMethodId: number; cronExpression: string; isActive: boolean }) => ipcRenderer.invoke('testSchedules:create', schedule),
    update: (id: number, schedule: Partial<TestSchedule>) => ipcRenderer.invoke('testSchedules:update', id, schedule),
    delete: (id: number) => ipcRenderer.invoke('testSchedules:delete', id),
    deleteAll: () => ipcRenderer.invoke('testSchedules:deleteAll')
  },

  // Window controls
  windowControls: {
    close: () => ipcRenderer.invoke('window-close'),
    minimize: () => ipcRenderer.invoke('window-minimize'),
    maximize: () => ipcRenderer.invoke('window-maximize'),
    isMaximized: () => ipcRenderer.invoke('window-is-maximized')
  },

  // Database export/import
  database: {
    export: (options: ImportOptions) => ipcRenderer.invoke('database:export', options),
    import: (mode: 'overwrite' | 'merge', options: ImportOptions) => ipcRenderer.invoke('database:import', mode, options)
  },

  // Notifications (in-app notification system)
  notifications: {
    getAll: () => ipcRenderer.invoke('notifications:getAll'),
    getUnread: () => ipcRenderer.invoke('notifications:getUnread'),
    getUnreadCount: () => ipcRenderer.invoke('notifications:getUnreadCount'),
    markAsRead: (id: number) => ipcRenderer.invoke('notifications:markAsRead', id),
    markAllAsRead: () => ipcRenderer.invoke('notifications:markAllAsRead'),
    delete: (id: number) => ipcRenderer.invoke('notifications:delete', id),
    deleteAll: () => ipcRenderer.invoke('notifications:deleteAll'),
    onUpdated: (callback: () => void) => {
      ipcRenderer.on('notifications:updated', () => callback());
      return () => ipcRenderer.removeAllListeners('notifications:updated');
    }
  },

  // Selector Override operations
  selectorOverrides: {
    getAll: (): Promise<SelectorOverride[]> => ipcRenderer.invoke('selectorOverrides:getAll'),
    getByCategory: (category: string): Promise<SelectorOverride[]> => ipcRenderer.invoke('selectorOverrides:getByCategory', category),
    getById: (id: number): Promise<SelectorOverride | undefined> => ipcRenderer.invoke('selectorOverrides:getById', id),
    getActive: (): Promise<SelectorOverride[]> => ipcRenderer.invoke('selectorOverrides:getActive'),
    create: (override: { category: string; key: string; selectors: string[]; isActive?: boolean }) => 
      ipcRenderer.invoke('selectorOverrides:create', override),
    update: (id: number, override: { selectors?: string[]; isActive?: boolean }) => 
      ipcRenderer.invoke('selectorOverrides:update', id, override),
    upsert: (override: { category: string; key: string; selectors: string[]; isActive?: boolean }) => 
      ipcRenderer.invoke('selectorOverrides:upsert', override),
    delete: (id: number) => ipcRenderer.invoke('selectorOverrides:delete', id),
    deleteByKey: (category: string, key: string) => ipcRenderer.invoke('selectorOverrides:deleteByKey', category, key),
    deleteAll: () => ipcRenderer.invoke('selectorOverrides:deleteAll')
  },

  // Selector Config operations
  selectorConfig: {
    getMerged: (): Promise<SelectorConfig> => ipcRenderer.invoke('selectorConfig:getMerged'),
    getBase: (): Promise<SelectorConfig> => ipcRenderer.invoke('selectorConfig:getBase'),
    getCategories: (): Promise<{ category: string; keys: string[]; label: string }[]> => 
      ipcRenderer.invoke('selectorConfig:getCategories')
  },

  // Email operations
  email: {
    testConnection: (): Promise<{ success: boolean; message: string }> => 
      ipcRenderer.invoke('email:testConnection'),
    getConfig: (): Promise<{
      enabled: boolean;
      smtpHost: string;
      smtpPort: number;
      smtpSecure: boolean;
      smtpUser: string;
      fromEmail: string;
      fromName: string;
      toEmail: string;
      notifyOnSuccess: boolean;
      notifyOnFailure: boolean;
    }> => ipcRenderer.invoke('email:getConfig')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    console.log('Preload: API exposed successfully')
  } catch (error) {
    console.error('Preload: Failed to expose API', error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  console.log('Preload: API attached to window (no context isolation)')
}
