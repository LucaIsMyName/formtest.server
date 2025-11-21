import type { Form, PaymentMethod, TestRun } from '../../../common/types'

declare global {
  interface Window {
    api: {
      forms: {
        getAll: () => Promise<Form[]>
        getById: (id: number) => Promise<Form | undefined>
        create: (form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>
        update: (id: number, form: Partial<Form>) => Promise<any>
        delete: (id: number) => Promise<any>
      }
      paymentMethods: {
        getAll: () => Promise<PaymentMethod[]>
        getById: (id: number) => Promise<PaymentMethod | undefined>
        create: (method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>
        update: (id: number, method: Partial<PaymentMethod>) => Promise<any>
        delete: (id: number) => Promise<any>
      }
      settings: {
        getAll: () => Promise<any[]>
        get: (key: string) => Promise<any>
        set: (key: string, value: string, description?: string) => Promise<any>
      }
      testRuns: {
        getAll: () => Promise<TestRun[]>
        getById: (id: number) => Promise<TestRun | undefined>
        getByForm: (formId: number) => Promise<TestRun[]>
        create: (testRun: Omit<TestRun, 'id' | 'runAt'>) => Promise<any>
        updateStatus: (id: number, status: TestRun['status'], errorMessage?: string, durationMs?: number) => Promise<any>
      }
      tests: {
        run: (formIds: number[], paymentMethodIds: number[]) => Promise<any>
      }
    }
  }
}

export {}
