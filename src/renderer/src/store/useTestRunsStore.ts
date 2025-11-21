import { create } from 'zustand'
import type { TestRun } from '../../../common/types'

interface TestRunsState {
  testRuns: TestRun[]
  isLoading: boolean
  error: string | null
  isRunning: boolean
  
  // Actions
  loadTestRuns: () => Promise<void>
  getTestRunsByForm: (formId: number) => Promise<TestRun[]>
  runTests: (formIds: number[], paymentMethodIds: number[]) => Promise<void>
  getTestRunById: (id: number) => Promise<TestRun | undefined>
}

export const useTestRunsStore = create<TestRunsState>((set, get) => ({
  testRuns: [],
  isLoading: false,
  error: null,
  isRunning: false,

  loadTestRuns: async () => {
    set({ isLoading: true, error: null })
    try {
      if (!window.api) {
        throw new Error('API not available - make sure you are running in Electron')
      }
      const testRuns = await window.api.testRuns.getAll()
      set({ testRuns, isLoading: false })
    } catch (error) {
      console.error('Failed to load test runs:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to load test runs', isLoading: false })
    }
  },

  getTestRunsByForm: async (formId: number) => {
    try {
      if (!window.api) {
        throw new Error('API not available')
      }
      return await window.api.testRuns.getByForm(formId)
    } catch (error) {
      console.error('Failed to load test runs for form:', error)
      return []
    }
  },

  runTests: async (formIds: number[], paymentMethodIds: number[]) => {
    set({ isRunning: true, error: null })
    try {
      if (!window.api) {
        throw new Error('API not available - make sure you are running in Electron')
      }
      
      console.log('Starting test execution for forms:', formIds, 'with payment methods:', paymentMethodIds)
      
      const result = await window.api.tests.run(formIds, paymentMethodIds)
      console.log('Test execution result:', result)
      
      // Reload test runs to get the latest results
      await get().loadTestRuns()
      
      set({ isRunning: false })
    } catch (error) {
      console.error('Failed to run tests:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to run tests', 
        isRunning: false 
      })
    }
  },

  getTestRunById: async (id: number) => {
    try {
      if (!window.api) {
        throw new Error('API not available')
      }
      return await window.api.testRuns.getById(id)
    } catch (error) {
      console.error('Failed to get test run:', error)
      return undefined
    }
  }
}))

// Window API types are defined in ../types/window.d.ts
