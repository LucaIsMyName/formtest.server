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
    delete: (id) => electron.ipcRenderer.invoke("forms:delete", id)
  },
  // Payment method operations
  paymentMethods: {
    getAll: () => electron.ipcRenderer.invoke("paymentMethods:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("paymentMethods:getById", id),
    create: (method) => electron.ipcRenderer.invoke("paymentMethods:create", method),
    update: (id, method) => electron.ipcRenderer.invoke("paymentMethods:update", id, method),
    delete: (id) => electron.ipcRenderer.invoke("paymentMethods:delete", id)
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
    updateStatus: (id, status, errorMessage, durationMs) => electron.ipcRenderer.invoke("testRuns:updateStatus", id, status, errorMessage, durationMs)
  },
  // Test execution
  tests: {
    run: (formIds, paymentMethodIds) => electron.ipcRenderer.invoke("tests:run", formIds, paymentMethodIds)
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
