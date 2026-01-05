"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {
  // Form operations
  forms: {
    getAll: () => electron.ipcRenderer.invoke("forms:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("forms:getById", id),
    create: (form) => electron.ipcRenderer.invoke("forms:create", form),
    update: (id, form) => electron.ipcRenderer.invoke("forms:update", id, form),
    delete: (id) => electron.ipcRenderer.invoke("forms:delete", id),
    deleteAll: () => electron.ipcRenderer.invoke("forms:deleteAll")
  },
  // Payment method operations
  paymentMethods: {
    getAll: () => electron.ipcRenderer.invoke("paymentMethods:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("paymentMethods:getById", id),
    create: (method) => electron.ipcRenderer.invoke("paymentMethods:create", method),
    update: (id, method) => electron.ipcRenderer.invoke("paymentMethods:update", id, method),
    delete: (id) => electron.ipcRenderer.invoke("paymentMethods:delete", id),
    deleteAll: () => electron.ipcRenderer.invoke("paymentMethods:deleteAll")
  },
  // Settings operations
  settings: {
    getAll: () => electron.ipcRenderer.invoke("settings:getAll"),
    get: (key) => electron.ipcRenderer.invoke("settings:get", key),
    set: (key, value, description) => electron.ipcRenderer.invoke("settings:set", key, value, description),
    getFieldDefaults: () => electron.ipcRenderer.invoke("settings:getFieldDefaults"),
    setFieldDefaults: (defaults) => electron.ipcRenderer.invoke("settings:setFieldDefaults", defaults)
  },
  // Test run operations
  testRuns: {
    getAll: () => electron.ipcRenderer.invoke("testRuns:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("testRuns:getById", id),
    getByForm: (formId) => electron.ipcRenderer.invoke("testRuns:getByForm", formId),
    create: (testRun) => electron.ipcRenderer.invoke("testRuns:create", testRun),
    updateStatus: (id, status, errorMessage, durationMs) => electron.ipcRenderer.invoke("testRuns:updateStatus", id, status, errorMessage, durationMs),
    delete: (id) => electron.ipcRenderer.invoke("testRuns:delete", id),
    deleteAll: () => electron.ipcRenderer.invoke("testRuns:deleteAll"),
    updateNotes: (id, notes) => electron.ipcRenderer.invoke("testRuns:updateNotes", id, notes),
    stop: (id) => electron.ipcRenderer.invoke("testRuns:stop", id),
    cleanup: () => electron.ipcRenderer.invoke("testRuns:cleanup"),
    getInterrupted: () => electron.ipcRenderer.invoke("testRuns:getInterrupted"),
    retryInterrupted: (testIds) => electron.ipcRenderer.invoke("testRuns:retryInterrupted", testIds),
    dismissInterrupted: (testIds) => electron.ipcRenderer.invoke("testRuns:dismissInterrupted", testIds)
  },
  // Test execution
  tests: {
    run: (formIds, paymentMethodIds, options) => electron.ipcRenderer.invoke("tests:run", formIds, paymentMethodIds, options)
  },
  // Test queue operations
  testQueue: {
    getStatus: () => electron.ipcRenderer.invoke("testQueue:getStatus"),
    clear: () => electron.ipcRenderer.invoke("testQueue:clear"),
    stopAll: () => electron.ipcRenderer.invoke("testQueue:stopAll")
  },
  // Test schedule operations
  testSchedules: {
    getAll: () => electron.ipcRenderer.invoke("testSchedules:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("testSchedules:getById", id),
    runNow: (id) => electron.ipcRenderer.invoke("testSchedules:runNow", id),
    create: (schedule) => electron.ipcRenderer.invoke("testSchedules:create", schedule),
    update: (id, schedule) => electron.ipcRenderer.invoke("testSchedules:update", id, schedule),
    delete: (id) => electron.ipcRenderer.invoke("testSchedules:delete", id),
    deleteAll: () => electron.ipcRenderer.invoke("testSchedules:deleteAll")
  },
  // Window controls
  windowControls: {
    close: () => electron.ipcRenderer.invoke("window-close"),
    minimize: () => electron.ipcRenderer.invoke("window-minimize"),
    maximize: () => electron.ipcRenderer.invoke("window-maximize"),
    isMaximized: () => electron.ipcRenderer.invoke("window-is-maximized")
  },
  // Database export/import
  database: {
    export: (options) => electron.ipcRenderer.invoke("database:export", options),
    import: (mode, options) => electron.ipcRenderer.invoke("database:import", mode, options)
  },
  // Notifications (in-app notification system)
  notifications: {
    getAll: () => electron.ipcRenderer.invoke("notifications:getAll"),
    getUnread: () => electron.ipcRenderer.invoke("notifications:getUnread"),
    getUnreadCount: () => electron.ipcRenderer.invoke("notifications:getUnreadCount"),
    markAsRead: (id) => electron.ipcRenderer.invoke("notifications:markAsRead", id),
    markAllAsRead: () => electron.ipcRenderer.invoke("notifications:markAllAsRead"),
    delete: (id) => electron.ipcRenderer.invoke("notifications:delete", id),
    deleteAll: () => electron.ipcRenderer.invoke("notifications:deleteAll"),
    onUpdated: (callback) => {
      electron.ipcRenderer.on("notifications:updated", () => callback());
      return () => electron.ipcRenderer.removeAllListeners("notifications:updated");
    }
  },
  // Selector Override operations
  selectorOverrides: {
    getAll: () => electron.ipcRenderer.invoke("selectorOverrides:getAll"),
    getByCategory: (category) => electron.ipcRenderer.invoke("selectorOverrides:getByCategory", category),
    getById: (id) => electron.ipcRenderer.invoke("selectorOverrides:getById", id),
    getActive: () => electron.ipcRenderer.invoke("selectorOverrides:getActive"),
    create: (override) => electron.ipcRenderer.invoke("selectorOverrides:create", override),
    update: (id, override) => electron.ipcRenderer.invoke("selectorOverrides:update", id, override),
    upsert: (override) => electron.ipcRenderer.invoke("selectorOverrides:upsert", override),
    delete: (id) => electron.ipcRenderer.invoke("selectorOverrides:delete", id),
    deleteByKey: (category, key) => electron.ipcRenderer.invoke("selectorOverrides:deleteByKey", category, key),
    deleteAll: () => electron.ipcRenderer.invoke("selectorOverrides:deleteAll")
  },
  // Selector Config operations
  selectorConfig: {
    getMerged: () => electron.ipcRenderer.invoke("selectorConfig:getMerged"),
    getBase: () => electron.ipcRenderer.invoke("selectorConfig:getBase"),
    getCategories: () => electron.ipcRenderer.invoke("selectorConfig:getCategories")
  },
  // Email operations
  email: {
    testConnection: () => electron.ipcRenderer.invoke("email:testConnection"),
    getConfig: () => electron.ipcRenderer.invoke("email:getConfig")
  },
  // API Server operations
  apiServer: {
    start: (port, apiKey) => electron.ipcRenderer.invoke("api:start", port, apiKey),
    stop: () => electron.ipcRenderer.invoke("api:stop"),
    status: () => electron.ipcRenderer.invoke("api:status"),
    generateKey: () => electron.ipcRenderer.invoke("api:generateKey")
  },
  // Master Password operations
  password: {
    isEnabled: () => electron.ipcRenderer.invoke("password:isEnabled"),
    isSessionUnlocked: () => electron.ipcRenderer.invoke("password:isSessionUnlocked"),
    verify: (password) => electron.ipcRenderer.invoke("password:verify", password),
    set: (password) => electron.ipcRenderer.invoke("password:set", password),
    change: (currentPassword, newPassword) => electron.ipcRenderer.invoke("password:change", currentPassword, newPassword),
    disable: (currentPassword) => electron.ipcRenderer.invoke("password:disable", currentPassword),
    emergencyReset: () => electron.ipcRenderer.invoke("password:emergencyReset")
  },
  // Custom Scripts operations
  customScripts: {
    getAll: () => electron.ipcRenderer.invoke("customScripts:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("customScripts:getById", id),
    getByHookPoint: (hookPoint) => electron.ipcRenderer.invoke("customScripts:getByHookPoint", hookPoint),
    getGlobal: () => electron.ipcRenderer.invoke("customScripts:getGlobal"),
    getByFormId: (formId) => electron.ipcRenderer.invoke("customScripts:getByFormId", formId),
    getForTest: (formId) => electron.ipcRenderer.invoke("customScripts:getForTest", formId),
    create: (script) => electron.ipcRenderer.invoke("customScripts:create", script),
    update: (id, script) => electron.ipcRenderer.invoke("customScripts:update", id, script),
    delete: (id) => electron.ipcRenderer.invoke("customScripts:delete", id),
    deleteAll: () => electron.ipcRenderer.invoke("customScripts:deleteAll"),
    validate: (code) => electron.ipcRenderer.invoke("customScripts:validate", code)
  },
  // Form-Script junction operations
  formScripts: {
    getByFormId: (formId) => electron.ipcRenderer.invoke("formScripts:getByFormId", formId),
    attach: (formId, scriptId, executionOrder) => electron.ipcRenderer.invoke("formScripts:attach", formId, scriptId, executionOrder),
    detach: (formId, scriptId) => electron.ipcRenderer.invoke("formScripts:detach", formId, scriptId),
    updateOrder: (formId, scriptId, executionOrder) => electron.ipcRenderer.invoke("formScripts:updateOrder", formId, scriptId, executionOrder)
  },
  // AI operations
  ai: {
    // Settings
    getSettings: () => electron.ipcRenderer.invoke("ai:getSettings"),
    updateSettings: (settings) => electron.ipcRenderer.invoke("ai:updateSettings", settings),
    validateKey: (provider, apiKey, ollamaUrl) => electron.ipcRenderer.invoke("ai:validateKey", provider, apiKey, ollamaUrl),
    getModels: (provider, apiKey, ollamaUrl) => electron.ipcRenderer.invoke("ai:getModels", provider, apiKey, ollamaUrl),
    isConfigured: () => electron.ipcRenderer.invoke("ai:isConfigured"),
    // Chats
    chats: {
      getAll: () => electron.ipcRenderer.invoke("ai:chats:getAll"),
      getById: (id) => electron.ipcRenderer.invoke("ai:chats:getById", id),
      create: (title, context) => electron.ipcRenderer.invoke("ai:chats:create", title, context),
      updateTitle: (id, title) => electron.ipcRenderer.invoke("ai:chats:updateTitle", id, title),
      delete: (id) => electron.ipcRenderer.invoke("ai:chats:delete", id),
      deleteAll: () => electron.ipcRenderer.invoke("ai:chats:deleteAll")
    },
    // Messages
    messages: {
      getByChatId: (chatId) => electron.ipcRenderer.invoke("ai:messages:getByChatId", chatId),
      send: (chatId, content) => electron.ipcRenderer.invoke("ai:messages:send", chatId, content)
    },
    // Context
    context: {
      getData: () => electron.ipcRenderer.invoke("ai:context:getData")
    }
  }
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
    console.log("Preload: API exposed successfully");
  } catch (error) {
    console.error("Preload: Failed to expose API", error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
  console.log("Preload: API attached to window (no context isolation)");
}
