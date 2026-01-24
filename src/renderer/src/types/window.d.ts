import type { Form, PaymentMethod, TestRun, GlobalSetting, ImportOptions, ImportResult, TestSchedule, GlobalFieldDefaults, CustomScript, ScriptHookPoint, ScriptValidationResult, FormScript, AIProvider, AISettings, AIChat, AIMessage, AIContextData } from '../../../common/types'
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
        deleteAll: () => Promise<any>
      }
      paymentMethods: {
        getAll: () => Promise<PaymentMethod[]>
        getById: (id: number) => Promise<PaymentMethod | undefined>
        create: (method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>
        update: (id: number, method: Partial<PaymentMethod>) => Promise<any>
        delete: (id: number) => Promise<any>
        deleteAll: () => Promise<any>
      }
      settings: {
        getAll: () => Promise<GlobalSetting[]>
        get: (key: string) => Promise<GlobalSetting | undefined>
        set: (key: string, value: string, description?: string) => Promise<void>
        getFieldDefaults: () => Promise<GlobalFieldDefaults>
        setFieldDefaults: (defaults: GlobalFieldDefaults) => Promise<void>
      }
      testRuns: {
        getAll: (includeArchived?: boolean) => Promise<TestRun[]>
        getById: (id: number) => Promise<TestRun | undefined>
        getByForm: (formId: number) => Promise<TestRun[]>
        create: (testRun: Omit<TestRun, 'id' | 'runAt'>) => Promise<TestRun>
        updateStatus: (id: number, status: TestRun['status'], errorMessage?: string, durationMs?: number) => Promise<void>
        delete: (id: number) => Promise<void>
        deleteAll: () => Promise<void>
        updateNotes: (id: number, notes: string) => Promise<void>
        archive: (id: number) => Promise<void>
        unarchive: (id: number) => Promise<void>
        archiveBulk: (ids: number[]) => Promise<void>
        unarchiveBulk: (ids: number[]) => Promise<void>
        updateTags: (id: number, tags: string[]) => Promise<void>
        stop: (id: number) => Promise<void>
        cleanup: () => Promise<{ success: boolean; deleted: number }>
        getInterrupted: () => Promise<Array<{ id: number; formId: number; paymentMethodId: number; formName: string; paymentMethodName: string; status: 'RUNNING' | 'QUEUED'; runAt: Date }>>
        retryInterrupted: (testIds: number[]) => Promise<{ success: boolean; message: string; retried?: number; errors?: string[] }>
        dismissInterrupted: (testIds: number[]) => Promise<{ success: boolean; deleted: number }>
      }
      tags: {
        getAll: () => Promise<Array<{ id: number; name: string; color: string; createdAt: Date }>>
        getById: (id: number) => Promise<{ id: number; name: string; color: string; createdAt: Date } | undefined>
        create: (name: string, color?: string) => Promise<{ id: number; name: string; color: string; createdAt: Date }>
        update: (id: number, name: string, color: string) => Promise<{ id: number; name: string; color: string; createdAt: Date }>
        delete: (id: number) => Promise<void>
      }
      filterPresets: {
        getAll: () => Promise<Array<{ id: number; name: string; filterConfig: any; createdAt: Date; updatedAt: Date }>>
        getById: (id: number) => Promise<{ id: number; name: string; filterConfig: any; createdAt: Date; updatedAt: Date } | undefined>
        create: (name: string, filterConfig: any) => Promise<{ id: number; name: string; filterConfig: any; createdAt: Date; updatedAt: Date }>
        update: (id: number, name: string, filterConfig: any) => Promise<{ id: number; name: string; filterConfig: any; createdAt: Date; updatedAt: Date }>
        delete: (id: number) => Promise<void>
      }
      testSchedules: {
        getAll: () => Promise<TestSchedule[]>
        getById: (id: number) => Promise<TestSchedule | undefined>
        runNow: (id: number) => Promise<any>
        create: (schedule: { name: string; formId: number; paymentMethodId: number; cronExpression: string; isActive: boolean }) => Promise<any>
        update: (id: number, schedule: Partial<TestSchedule>) => Promise<any>
        delete: (id: number) => Promise<void>
        deleteAll: () => Promise<any>
      }
      tests: {
        run: (formIds: number[], paymentMethodIds: number[], options?: { customAmount?: string; customInterval?: string; enableSeoTest?: boolean; enableAccessibilityTest?: boolean }) => Promise<any>
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
        stopAll: () => Promise<{ success: boolean; stoppedId: number | null; clearedIds: number[] }>
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
      apiServer: {
        start: (port: number, apiKey: string) => Promise<{ success: boolean; error?: string }>
        stop: () => Promise<{ success: boolean; error?: string }>
        status: () => Promise<{ running: boolean }>
        generateKey: () => Promise<string>
      }
      password: {
        isEnabled: () => Promise<boolean>
        isSessionUnlocked: () => Promise<boolean>
        verify: (password: string) => Promise<{ success: boolean; error?: string }>
        set: (password: string) => Promise<{ success: boolean; error?: string }>
        change: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
        disable: (currentPassword: string) => Promise<{ success: boolean; error?: string }>
        emergencyReset: () => Promise<{ success: boolean; error?: string }>
      }
      customScripts: {
        getAll: () => Promise<CustomScript[]>
        getById: (id: number) => Promise<CustomScript | undefined>
        getByHookPoint: (hookPoint: ScriptHookPoint) => Promise<CustomScript[]>
        getGlobal: () => Promise<CustomScript[]>
        getByFormId: (formId: number) => Promise<CustomScript[]>
        getForTest: (formId: number) => Promise<CustomScript[]>
        create: (script: Omit<CustomScript, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>
        update: (id: number, script: Partial<CustomScript>) => Promise<any>
        delete: (id: number) => Promise<any>
        deleteAll: () => Promise<any>
        validate: (code: string) => Promise<ScriptValidationResult>
      }
      formScripts: {
        getByFormId: (formId: number) => Promise<FormScript[]>
        attach: (formId: number, scriptId: number, executionOrder?: number) => Promise<any>
        detach: (formId: number, scriptId: number) => Promise<any>
        updateOrder: (formId: number, scriptId: number, executionOrder: number) => Promise<any>
      }
      ai: {
        getSettings: () => Promise<AISettings>
        updateSettings: (settings: Partial<AISettings>) => Promise<AISettings>
        validateKey: (provider: AIProvider, apiKey: string, ollamaUrl?: string) => Promise<boolean>
        getModels: (provider: AIProvider, apiKey?: string, ollamaUrl?: string) => Promise<string[]>
        isConfigured: () => Promise<boolean>
        chats: {
          getAll: () => Promise<AIChat[]>
          getById: (id: number) => Promise<AIChat | undefined>
          create: (title?: string, context?: string) => Promise<AIChat>
          updateTitle: (id: number, title: string) => Promise<void>
          delete: (id: number) => Promise<void>
          deleteAll: () => Promise<void>
        }
        messages: {
          getByChatId: (chatId: number) => Promise<AIMessage[]>
          send: (chatId: number, content: string) => Promise<{ userMessage: AIMessage; assistantMessage: AIMessage; usage?: { promptTokens: number; completionTokens: number } }>
        }
        context: {
          getData: () => Promise<AIContextData>
        }
      }
    }
  }
}

export {}
