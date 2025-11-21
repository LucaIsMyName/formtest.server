import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Form, PaymentMethod, TestRun } from '../common/types'

// Custom APIs for renderer
const api = {
  // Form operations
  forms: {
    getAll: () => ipcRenderer.invoke('forms:getAll'),
    getById: (id: number) => ipcRenderer.invoke('forms:getById', id),
    create: (form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) => ipcRenderer.invoke('forms:create', form),
    update: (id: number, form: Partial<Form>) => ipcRenderer.invoke('forms:update', id, form),
    delete: (id: number) => ipcRenderer.invoke('forms:delete', id)
  },

  // Payment method operations
  paymentMethods: {
    getAll: () => ipcRenderer.invoke('paymentMethods:getAll'),
    getById: (id: number) => ipcRenderer.invoke('paymentMethods:getById', id),
    create: (method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>) => ipcRenderer.invoke('paymentMethods:create', method),
    update: (id: number, method: Partial<PaymentMethod>) => ipcRenderer.invoke('paymentMethods:update', id, method),
    delete: (id: number) => ipcRenderer.invoke('paymentMethods:delete', id)
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
    delete: (id: number) => ipcRenderer.invoke('testRuns:delete', id)
  },

  // Test execution
  tests: {
    run: (formIds: number[], paymentMethodIds: number[]) => ipcRenderer.invoke('tests:run', formIds, paymentMethodIds)
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
