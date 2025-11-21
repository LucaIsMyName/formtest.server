"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const Database = require("better-sqlite3");
const icon = path.join(__dirname, "../../resources/icon.png");
let db;
function initDatabase() {
  const dbPath = path.join(electron.app.getPath("userData"), "formtest.db");
  db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      hash TEXT,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('paypal', 'sepa', 'creditcard', 'eps')),
      isActive BOOLEAN DEFAULT 1,
      details TEXT NOT NULL, -- JSON string with encrypted credentials
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS global_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS test_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      formId INTEGER NOT NULL,
      paymentMethodId INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE', 'SKIPPED', 'RUNNING')),
      errorMessage TEXT,
      screenshotPath TEXT,
      logDetails TEXT,
      durationMs INTEGER,
      runAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (formId) REFERENCES forms (id),
      FOREIGN KEY (paymentMethodId) REFERENCES payment_methods (id)
    );

    CREATE INDEX IF NOT EXISTS idx_test_runs_form ON test_runs(formId);
    CREATE INDEX IF NOT EXISTS idx_test_runs_payment ON test_runs(paymentMethodId);
    CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
  `);
  const defaultSettings = [
    { key: "default_donation_amount", value: "50", description: "Default donation amount in EUR" },
    { key: "default_interval", value: "0", description: "Default donation interval (0=once, 1=monthly)" },
    { key: "test_timeout", value: "30000", description: "Test timeout in milliseconds" },
    { key: "headless_mode", value: "true", description: "Run tests in headless mode" }
  ];
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO global_settings (key, value, description) 
    VALUES (?, ?, ?)
  `);
  for (const setting of defaultSettings) {
    insertSetting.run(setting.key, setting.value, setting.description);
  }
}
const formQueries = {
  getAll: () => db.prepare("SELECT * FROM forms ORDER BY name").all(),
  getById: (id) => db.prepare("SELECT * FROM forms WHERE id = ?").get(id),
  create: (form) => db.prepare("INSERT INTO forms (name, url, hash, isActive) VALUES (?, ?, ?, ?)").run(form.name, form.url, form.hash, form.isActive),
  update: (id, form) => db.prepare("UPDATE forms SET name = ?, url = ?, hash = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?").run(form.name, form.url, form.hash, form.isActive, id),
  delete: (id) => db.prepare("DELETE FROM forms WHERE id = ?").run(id)
};
const paymentMethodQueries = {
  getAll: () => db.prepare("SELECT * FROM payment_methods ORDER BY name").all(),
  getById: (id) => db.prepare("SELECT * FROM payment_methods WHERE id = ?").get(id),
  create: (method) => db.prepare("INSERT INTO payment_methods (name, type, isActive, details) VALUES (?, ?, ?, ?)").run(method.name, method.type, method.isActive, JSON.stringify(method.details)),
  update: (id, method) => db.prepare("UPDATE payment_methods SET name = ?, type = ?, isActive = ?, details = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?").run(method.name, method.type, method.isActive, JSON.stringify(method.details), id),
  delete: (id) => db.prepare("DELETE FROM payment_methods WHERE id = ?").run(id)
};
const settingsQueries = {
  getAll: () => db.prepare("SELECT * FROM global_settings ORDER BY key").all(),
  get: (key) => db.prepare("SELECT * FROM global_settings WHERE key = ?").get(key),
  set: (key, value, description) => db.prepare("INSERT OR REPLACE INTO global_settings (key, value, description) VALUES (?, ?, ?)").run(key, value, description)
};
const testRunQueries = {
  getAll: () => db.prepare("SELECT * FROM test_runs ORDER BY runAt DESC").all(),
  getById: (id) => db.prepare("SELECT * FROM test_runs WHERE id = ?").get(id),
  getByForm: (formId) => db.prepare("SELECT * FROM test_runs WHERE formId = ? ORDER BY runAt DESC").all(formId),
  create: (testRun) => db.prepare("INSERT INTO test_runs (formId, paymentMethodId, status, errorMessage, screenshotPath, logDetails, durationMs) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    testRun.formId,
    testRun.paymentMethodId,
    testRun.status,
    testRun.errorMessage,
    testRun.screenshotPath,
    testRun.logDetails,
    testRun.durationMs
  ),
  updateStatus: (id, status, errorMessage, durationMs) => db.prepare("UPDATE test_runs SET status = ?, errorMessage = ?, durationMs = ? WHERE id = ?").run(status, errorMessage, durationMs, id)
};
function setupIpcHandlers() {
  electron.ipcMain.handle("forms:getAll", () => formQueries.getAll());
  electron.ipcMain.handle("forms:getById", (_, id) => formQueries.getById(id));
  electron.ipcMain.handle("forms:create", (_, form) => formQueries.create(form));
  electron.ipcMain.handle("forms:update", (_, id, form) => formQueries.update(id, form));
  electron.ipcMain.handle("forms:delete", (_, id) => formQueries.delete(id));
  electron.ipcMain.handle("paymentMethods:getAll", () => paymentMethodQueries.getAll());
  electron.ipcMain.handle("paymentMethods:getById", (_, id) => paymentMethodQueries.getById(id));
  electron.ipcMain.handle("paymentMethods:create", (_, method) => paymentMethodQueries.create(method));
  electron.ipcMain.handle("paymentMethods:update", (_, id, method) => paymentMethodQueries.update(id, method));
  electron.ipcMain.handle("paymentMethods:delete", (_, id) => paymentMethodQueries.delete(id));
  electron.ipcMain.handle("settings:getAll", () => settingsQueries.getAll());
  electron.ipcMain.handle("settings:get", (_, key) => settingsQueries.get(key));
  electron.ipcMain.handle("settings:set", (_, key, value, description) => settingsQueries.set(key, value, description));
  electron.ipcMain.handle("testRuns:getAll", () => testRunQueries.getAll());
  electron.ipcMain.handle("testRuns:getById", (_, id) => testRunQueries.getById(id));
  electron.ipcMain.handle("testRuns:getByForm", (_, formId) => testRunQueries.getByForm(formId));
  electron.ipcMain.handle("testRuns:create", (_, testRun) => testRunQueries.create(testRun));
  electron.ipcMain.handle("testRuns:updateStatus", (_, id, status, errorMessage, durationMs) => testRunQueries.updateStatus(id, status, errorMessage, durationMs));
  electron.ipcMain.handle("tests:run", async (_, formIds, paymentMethodIds) => {
    console.log("Running tests for forms:", formIds, "with payment methods:", paymentMethodIds);
    return { success: true, message: "Test execution started" };
  });
}
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.formtest.server");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  initDatabase();
  setupIpcHandlers();
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
