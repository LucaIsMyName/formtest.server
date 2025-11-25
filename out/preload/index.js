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
    set: (key, value, description) => electron.ipcRenderer.invoke("settings:set", key, value, description)
  },
  // Test run operations
  testRuns: {
    getAll: () => electron.ipcRenderer.invoke("testRuns:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("testRuns:getById", id),
    getByForm: (formId) => electron.ipcRenderer.invoke("testRuns:getByForm", formId),
    create: (testRun) => electron.ipcRenderer.invoke("testRuns:create", testRun),
    updateStatus: (id, status, errorMessage, durationMs) => electron.ipcRenderer.invoke("testRuns:updateStatus", id, status, errorMessage, durationMs),
    delete: (id) => electron.ipcRenderer.invoke("testRuns:delete", id),
    deleteAll: () => electron.ipcRenderer.invoke("testRuns:deleteAll")
  },
  // Test execution
  tests: {
    run: (formIds, paymentMethodIds) => electron.ipcRenderer.invoke("tests:run", formIds, paymentMethodIds)
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
