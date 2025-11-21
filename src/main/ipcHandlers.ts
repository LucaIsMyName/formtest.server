import { ipcMain } from 'electron'
import { formQueries, paymentMethodQueries, settingsQueries, testRunQueries } from './database'
import type { Form, PaymentMethod, GlobalSetting, TestRun } from '../common/types'

export function setupIpcHandlers(): void {
  // Form handlers
  ipcMain.handle('forms:getAll', () => formQueries.getAll())
  ipcMain.handle('forms:getById', (_, id: number) => formQueries.getById(id))
  ipcMain.handle('forms:create', (_, form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) => formQueries.create(form))
  ipcMain.handle('forms:update', (_, id: number, form: Partial<Form>) => formQueries.update(id, form))
  ipcMain.handle('forms:delete', (_, id: number) => formQueries.delete(id))

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
