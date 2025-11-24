import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Form, PaymentMethod, TestRun, ImportOptions, TestSchedule } from '../common/types'

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
    set: (key: string, value: string, description?: string) => ipcRenderer.invoke('settings:set', key, value, description)
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
    deleteAll: () => ipcRenderer.invoke('testRuns:deleteAll')
  },

  // Test execution
  tests: {
    run: (formIds: number[], paymentMethodIds: number[]) => ipcRenderer.invoke('tests:run', formIds, paymentMethodIds)
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

  // Toast notifications
  toast: {
    show: (type: 'success' | 'error' | 'info' | 'warning', message: string, description?: string) => 
      ipcRenderer.invoke('toast:show', type, message, description),
    onDisplay: (callback: (data: { type: string; message: string; description?: string }) => void) => {
      ipcRenderer.on('toast:display', (_, data) => callback(data));
      return () => ipcRenderer.removeAllListeners('toast:display');
    }
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
