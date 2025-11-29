import type { Form, PaymentMethod, TestRun, GlobalSetting, ImportOptions, ImportResult, TestSchedule } from '../../../common/types'
import type { SelectorOverride, SelectorConfig } from '../../../common/selectors.config'

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
        getAll: () => Promise<GlobalSetting[]>
        get: (key: string) => Promise<GlobalSetting | undefined>
        set: (key: string, value: string, description?: string) => Promise<void>
      }
      testRuns: {
        getAll: () => Promise<TestRun[]>
        getById: (id: number) => Promise<TestRun | undefined>
        getByForm: (formId: number) => Promise<TestRun[]>
        create: (testRun: Omit<TestRun, 'id' | 'runAt'>) => Promise<TestRun>
        updateStatus: (id: number, status: TestRun['status'], errorMessage?: string, durationMs?: number) => Promise<void>
        delete: (id: number) => Promise<void>
        updateNotes: (id: number, notes: string) => Promise<void>
        stop: (id: number) => Promise<void>
      }
      testSchedules: {
        getAll: () => Promise<TestSchedule[]>
        getById: (id: number) => Promise<TestSchedule | undefined>
        runNow: (id: number) => Promise<any>
        create: (schedule: { name: string; formId: number; paymentMethodId: number; cronExpression: string; isActive: boolean }) => Promise<any>
        update: (id: number, schedule: Partial<TestSchedule>) => Promise<any>
        delete: (id: number) => Promise<void>
      }
      tests: {
        run: (formIds: number[], paymentMethodIds: number[], options?: { customAmount?: string; customInterval?: string }) => Promise<any>
      }
      testQueue: {
        getStatus: () => Promise<{
          queueLength: number;
          isProcessing: boolean;
          currentTestId: number | null;
          currentTestName: string | null;
          queuedTests: { testRunId: number; formName: string; paymentMethodName: string }[];
          totalPending: number;
        }>
        clear: () => Promise<{ success: boolean }>
      }
      windowControls: {
        close: () => Promise<void>
        minimize: () => Promise<void>
        maximize: () => Promise<void>
        isMaximized: () => Promise<boolean>
      }
      database: {
        export: (options: ImportOptions) => Promise<{ success: boolean; message: string; filePath?: string }>
        import: (mode: 'overwrite' | 'merge', options: ImportOptions) => Promise<ImportResult>
      }
      notifications: {
        getAll: () => Promise<any[]>
        getUnread: () => Promise<any[]>
        getUnreadCount: () => Promise<number>
        markAsRead: (id: number) => Promise<void>
        markAllAsRead: () => Promise<void>
        delete: (id: number) => Promise<void>
        deleteAll: () => Promise<void>
        onUpdated: (callback: () => void) => () => void
      }
      selectorOverrides: {
        getAll: () => Promise<SelectorOverride[]>
        getByCategory: (category: string) => Promise<SelectorOverride[]>
        getById: (id: number) => Promise<SelectorOverride | undefined>
        getActive: () => Promise<SelectorOverride[]>
        create: (override: { category: string; key: string; selectors: string[]; isActive?: boolean }) => Promise<any>
        update: (id: number, override: { selectors?: string[]; isActive?: boolean }) => Promise<any>
        upsert: (override: { category: string; key: string; selectors: string[]; isActive?: boolean }) => Promise<any>
        delete: (id: number) => Promise<any>
        deleteByKey: (category: string, key: string) => Promise<any>
        deleteAll: () => Promise<any>
      }
      selectorConfig: {
        getMerged: () => Promise<SelectorConfig>
        getBase: () => Promise<SelectorConfig>
        getCategories: () => Promise<{ category: string; keys: string[]; label: string }[]>
      }
    }
  }
}

export {}
