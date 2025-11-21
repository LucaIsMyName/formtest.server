import { ipcMain } from 'electron'
import { formQueries, paymentMethodQueries, settingsQueries, testRunQueries } from './database'
import type { Form, PaymentMethod, TestRun } from '../common/types'

export function setupIpcHandlers(): void {
  console.log('=== SETTING UP IPC HANDLERS ===')
  console.log('IPC Setup: formQueries available:', !!formQueries)
  console.log('IPC Setup: paymentMethodQueries available:', !!paymentMethodQueries)
  console.log('IPC Setup: paymentMethodQueries.create available:', !!paymentMethodQueries?.create)
  
  // Test if we can call paymentMethodQueries.create directly
  try {
    console.log('IPC Setup: Testing paymentMethodQueries object...')
    console.log('IPC Setup: paymentMethodQueries keys:', Object.keys(paymentMethodQueries || {}))
    
    // List all registered IPC handlers
    console.log('IPC Setup: Registering paymentMethods:create handler...')
  } catch (testError) {
    console.error('IPC Setup: Error accessing paymentMethodQueries:', testError)
  }
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

  // Payment method handlers with error handling
  ipcMain.handle('paymentMethods:getAll', async () => {
    try {
      return paymentMethodQueries.getAll()
    } catch (error) {
      console.error('IPC Error - paymentMethods:getAll:', error)
      throw error
    }
  })
  
  ipcMain.handle('paymentMethods:getById', async (_, id: number) => {
    try {
      return paymentMethodQueries.getById(id)
    } catch (error) {
      console.error('IPC Error - paymentMethods:getById:', error)
      throw error
    }
  })
  
  ipcMain.handle('paymentMethods:create', async (_, method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('=== IPC HANDLER START ===')
    console.log('IPC Handler - paymentMethods:create ENTRY POINT reached')
    console.log('IPC Handler - paymentMethods:create received:', JSON.stringify(method, null, 2))
    console.log('IPC Handler - paymentMethodQueries available:', !!paymentMethodQueries)
    console.log('IPC Handler - paymentMethodQueries.create available:', !!paymentMethodQueries?.create)
    
    try {
      console.log('IPC Handler - About to call paymentMethodQueries.create')
      const result = paymentMethodQueries.create(method)
      console.log('IPC Handler - paymentMethods:create result:', result)
      console.log('=== IPC HANDLER SUCCESS ===')
      return result
    } catch (error) {
      console.error('=== IPC HANDLER ERROR ===')
      console.error('IPC Error - paymentMethods:create:', error)
      if (error instanceof Error) {
        console.error('IPC Error - message:', error.message)
        console.error('IPC Error - stack:', error.stack)
      }
      console.error('=== IPC HANDLER ERROR END ===')
      throw error
    }
  })
  
  ipcMain.handle('paymentMethods:update', async (_, id: number, method: Partial<PaymentMethod>) => {
    try {
      return paymentMethodQueries.update(id, method)
    } catch (error) {
      console.error('IPC Error - paymentMethods:update:', error)
      throw error
    }
  })
  
  ipcMain.handle('paymentMethods:delete', async (_, id: number) => {
    try {
      return paymentMethodQueries.delete(id)
    } catch (error) {
      console.error('IPC Error - paymentMethods:delete:', error)
      throw error
    }
  })

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
