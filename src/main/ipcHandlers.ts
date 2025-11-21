import { ipcMain } from 'electron'
import { formQueries, paymentMethodQueries, settingsQueries, testRunQueries } from './database'
import type { Form, PaymentMethod, TestRun } from '../common/types'

export function setupIpcHandlers(): void {
  // Form handlers with error handling
  ipcMain.handle('forms:getAll', async () => {
    try {
      return formQueries.getAll()
    } catch (error) {
      console.error('IPC Error - forms:getAll:', error)
      throw error
    }
  })
  
  ipcMain.handle('forms:getById', async (_, id: number) => {
    try {
      return formQueries.getById(id)
    } catch (error) {
      console.error('IPC Error - forms:getById:', error)
      throw error
    }
  })
  
  ipcMain.handle('forms:create', async (_, form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('IPC Handler - forms:create received:', form)
      const result = formQueries.create(form)
      console.log('IPC Handler - forms:create result:', result)
      return result
    } catch (error) {
      console.error('IPC Error - forms:create:', error)
      throw error
    }
  })
  
  ipcMain.handle('forms:update', async (_, id: number, form: Partial<Form>) => {
    try {
      return formQueries.update(id, form)
    } catch (error) {
      console.error('IPC Error - forms:update:', error)
      throw error
    }
  })
  
  ipcMain.handle('forms:delete', async (_, id: number) => {
    try {
      return formQueries.delete(id)
    } catch (error) {
      console.error('IPC Error - forms:delete:', error)
      throw error
    }
  })

  // Payment method handlers
  ipcMain.handle('paymentMethods:getAll', () => paymentMethodQueries.getAll())
  ipcMain.handle('paymentMethods:getById', (_, id: number) => paymentMethodQueries.getById(id))
  ipcMain.handle('paymentMethods:create', (_, method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>) => paymentMethodQueries.create(method))
  ipcMain.handle('paymentMethods:update', (_, id: number, method: Partial<PaymentMethod>) => paymentMethodQueries.update(id, method))
  ipcMain.handle('paymentMethods:delete', (_, id: number) => paymentMethodQueries.delete(id))

  // Settings handlers
  ipcMain.handle('settings:getAll', () => settingsQueries.getAll())
  ipcMain.handle('settings:get', (_, key: string) => settingsQueries.get(key))
  ipcMain.handle('settings:set', (_, key: string, value: string, description?: string) => settingsQueries.set(key, value, description))

  // Test run handlers
  ipcMain.handle('testRuns:getAll', () => testRunQueries.getAll())
  ipcMain.handle('testRuns:getById', (_, id: number) => testRunQueries.getById(id))
  ipcMain.handle('testRuns:getByForm', (_, formId: number) => testRunQueries.getByForm(formId))
  ipcMain.handle('testRuns:create', (_, testRun: Omit<TestRun, 'id' | 'runAt'>) => testRunQueries.create(testRun))
  ipcMain.handle('testRuns:updateStatus', (_, id: number, status: TestRun['status'], errorMessage?: string, durationMs?: number) => 
    testRunQueries.updateStatus(id, status, errorMessage, durationMs))

  // Test execution handler (placeholder for now)
  ipcMain.handle('tests:run', async (_, formIds: number[], paymentMethodIds: number[]) => {
    // This will be implemented with Playwright integration
    console.log('Running tests for forms:', formIds, 'with payment methods:', paymentMethodIds)
    return { success: true, message: 'Test execution started' }
  })
}
