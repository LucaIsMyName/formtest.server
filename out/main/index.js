"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const Database = require("better-sqlite3");
let db;
function initDatabase() {
  console.log("=== INITIALIZING DATABASE ===");
  const dbPath = path.join(electron.app.getPath("userData"), "formtest.db");
  console.log("Database: Path:", dbPath);
  try {
    db = new Database(dbPath);
    console.log("Database: SQLite connection established");
  } catch (dbError) {
    console.error("Database: Failed to create SQLite connection:", dbError);
    throw dbError;
  }
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
  console.log("Database: Tables created and default settings inserted");
  console.log("Database: Initialization complete");
}
const formQueries = {
  getAll: () => {
    const forms = db.prepare("SELECT * FROM forms ORDER BY name").all();
    return forms.map((form) => ({
      ...form,
      isActive: Boolean(form.isActive),
      createdAt: new Date(form.createdAt),
      updatedAt: new Date(form.updatedAt)
    }));
  },
  getById: (id) => {
    const form = db.prepare("SELECT * FROM forms WHERE id = ?").get(id);
    if (!form) return void 0;
    return {
      ...form,
      isActive: Boolean(form.isActive),
      createdAt: new Date(form.createdAt),
      updatedAt: new Date(form.updatedAt)
    };
  },
  create: (form) => {
    console.log("Database: Creating form with raw data:", JSON.stringify(form, null, 2));
    console.log("Database: Form data types:", {
      name: typeof form.name,
      url: typeof form.url,
      hash: typeof form.hash,
      isActive: typeof form.isActive
    });
    let name = "";
    let url = "";
    let hash = null;
    let isActive = 0;
    try {
      if (form.name === null || form.name === void 0) {
        name = "";
      } else {
        name = String(form.name).trim();
      }
      if (form.url === null || form.url === void 0) {
        url = "";
      } else {
        url = String(form.url).trim();
      }
      if (form.hash === null || form.hash === void 0 || form.hash === "") {
        hash = null;
      } else {
        const hashStr = String(form.hash).trim();
        hash = hashStr === "" ? null : hashStr;
      }
      const isActiveValue = form.isActive;
      if (isActiveValue === true || isActiveValue === 1 || isActiveValue === "1" || isActiveValue === "true") {
        isActive = 1;
      } else {
        isActive = 0;
      }
      console.log("Database: Final sanitized values:", { name, url, hash, isActive });
      console.log("Database: Final value types:", {
        name: typeof name,
        url: typeof url,
        hash: typeof hash,
        isActive: typeof isActive
      });
      const stmt = db.prepare("INSERT INTO forms (name, url, hash, isActive) VALUES (?, ?, ?, ?)");
      const result = stmt.run(name, url, hash, isActive);
      console.log("Database: Insert result:", result);
      return result;
    } catch (error) {
      console.error("Database: Error in create method:", error);
      console.error("Database: Error details:", {
        originalForm: form,
        sanitizedValues: { name, url, hash, isActive }
      });
      throw error;
    }
  },
  update: (id, form) => {
    console.log("Database: Updating form with data:", { id, form });
    const name = form.name !== void 0 ? String(form.name) : void 0;
    const url = form.url !== void 0 ? String(form.url) : void 0;
    const hash = form.hash !== void 0 ? form.hash && form.hash.trim() ? String(form.hash.trim()) : null : void 0;
    const isActive = form.isActive !== void 0 ? form.isActive === true ? 1 : 0 : void 0;
    const updates = [];
    const values = [];
    if (name !== void 0) {
      updates.push("name = ?");
      values.push(name);
    }
    if (url !== void 0) {
      updates.push("url = ?");
      values.push(url);
    }
    if (hash !== void 0) {
      updates.push("hash = ?");
      values.push(hash);
    }
    if (isActive !== void 0) {
      updates.push("isActive = ?");
      values.push(isActive);
    }
    updates.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);
    const sql = `UPDATE forms SET ${updates.join(", ")} WHERE id = ?`;
    console.log("Database: Update SQL:", sql, "Values:", values);
    const stmt = db.prepare(sql);
    return stmt.run(...values);
  },
  delete: (id) => db.prepare("DELETE FROM forms WHERE id = ?").run(id)
};
console.log("Database: Initializing paymentMethodQueries...");
const paymentMethodQueries = {
  getAll: () => {
    const methods = db.prepare("SELECT * FROM payment_methods ORDER BY name").all();
    return methods.map((method) => ({
      ...method,
      isActive: Boolean(method.isActive),
      details: JSON.parse(method.details),
      createdAt: new Date(method.createdAt),
      updatedAt: new Date(method.updatedAt)
    }));
  },
  getById: (id) => {
    const method = db.prepare("SELECT * FROM payment_methods WHERE id = ?").get(id);
    if (!method) return void 0;
    return {
      ...method,
      isActive: Boolean(method.isActive),
      details: JSON.parse(method.details),
      createdAt: new Date(method.createdAt),
      updatedAt: new Date(method.updatedAt)
    };
  },
  create: (method) => {
    let name = "";
    let type = "paypal";
    let isActive = 0;
    let details = "{}";
    try {
      if (method.name === null || method.name === void 0) {
        name = "";
      } else {
        name = String(method.name).trim();
      }
      if (method.type === null || method.type === void 0) {
        type = "paypal";
      } else {
        const validTypes = ["paypal", "sepa", "creditcard", "eps"];
        const typeStr = String(method.type).toLowerCase();
        type = validTypes.includes(typeStr) ? typeStr : "paypal";
      }
      const isActiveValue = method.isActive;
      if (isActiveValue === true || isActiveValue === 1 || isActiveValue === "1" || isActiveValue === "true") {
        isActive = 1;
      } else {
        isActive = 0;
      }
      if (method.details === null || method.details === void 0) {
        details = "{}";
      } else {
        try {
          details = JSON.stringify(method.details);
        } catch (jsonError) {
          console.error("Database: Failed to stringify details:", jsonError);
          details = "{}";
        }
      }
      const stmt = db.prepare("INSERT INTO payment_methods (name, type, isActive, details) VALUES (?, ?, ?, ?)");
      return stmt.run(name, type, isActive, details);
    } catch (error) {
      console.error("Database: Error in payment method create method:", error);
      console.error("Database: Payment method error details:", {
        originalMethod: method,
        sanitizedValues: { name, type, isActive, details }
      });
      throw error;
    }
  },
  update: (id, method) => {
    console.log("Database: Updating payment method with data:", { id, method });
    const name = method.name !== void 0 ? String(method.name) : void 0;
    const type = method.type !== void 0 ? String(method.type) : void 0;
    const isActive = method.isActive !== void 0 ? method.isActive === true ? 1 : 0 : void 0;
    const details = method.details !== void 0 ? JSON.stringify(method.details) : void 0;
    const updates = [];
    const values = [];
    if (name !== void 0) {
      updates.push("name = ?");
      values.push(name);
    }
    if (type !== void 0) {
      updates.push("type = ?");
      values.push(type);
    }
    if (isActive !== void 0) {
      updates.push("isActive = ?");
      values.push(isActive);
    }
    if (details !== void 0) {
      updates.push("details = ?");
      values.push(details);
    }
    updates.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);
    const sql = `UPDATE payment_methods SET ${updates.join(", ")} WHERE id = ?`;
    console.log("Database: Payment method update SQL:", sql, "Values:", values);
    const stmt = db.prepare(sql);
    return stmt.run(...values);
  },
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
  updateStatus: (id, status, errorMessage, durationMs) => {
    const stmt = db.prepare("UPDATE test_runs SET status = ?, errorMessage = ?, durationMs = ? WHERE id = ?");
    return stmt.run(status, errorMessage, durationMs, id);
  },
  delete: (id) => {
    const stmt = db.prepare("DELETE FROM test_runs WHERE id = ?");
    return stmt.run(id);
  }
};
async function runSingleTest(testRunId, form, paymentMethod, settings) {
  console.log(`Running test ${testRunId}: ${form.name} with ${paymentMethod.name}`);
  console.log("Test runner temporarily disabled - marking as skipped");
  await testRunQueries.updateStatus(
    testRunId,
    "SKIPPED",
    "Test runner temporarily disabled",
    0
  );
}
function setupIpcHandlers() {
  console.log("=== SETTING UP IPC HANDLERS ===");
  console.log("IPC Setup: formQueries available:", !!formQueries);
  console.log("IPC Setup: paymentMethodQueries available:", !!paymentMethodQueries);
  console.log("IPC Setup: paymentMethodQueries.create available:", !!paymentMethodQueries?.create);
  try {
    console.log("IPC Setup: Testing paymentMethodQueries object...");
    console.log("IPC Setup: paymentMethodQueries keys:", Object.keys(paymentMethodQueries || {}));
    console.log("IPC Setup: Registering paymentMethods:create handler...");
  } catch (testError) {
    console.error("IPC Setup: Error accessing paymentMethodQueries:", testError);
  }
  electron.ipcMain.handle("forms:getAll", async () => {
    try {
      return formQueries.getAll();
    } catch (error) {
      console.error("IPC Error - forms:getAll:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("forms:getById", async (_, id) => {
    try {
      return formQueries.getById(id);
    } catch (error) {
      console.error("IPC Error - forms:getById:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("forms:create", async (_, form) => {
    try {
      console.log("IPC Handler - forms:create received:", form);
      const result = formQueries.create(form);
      console.log("IPC Handler - forms:create result:", result);
      return result;
    } catch (error) {
      console.error("IPC Error - forms:create:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("forms:update", async (_, id, form) => {
    try {
      return formQueries.update(id, form);
    } catch (error) {
      console.error("IPC Error - forms:update:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("forms:delete", async (_, id) => {
    try {
      return formQueries.delete(id);
    } catch (error) {
      console.error("IPC Error - forms:delete:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("paymentMethods:getAll", async () => {
    try {
      return paymentMethodQueries.getAll();
    } catch (error) {
      console.error("IPC Error - paymentMethods:getAll:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("paymentMethods:getById", async (_, id) => {
    try {
      return paymentMethodQueries.getById(id);
    } catch (error) {
      console.error("IPC Error - paymentMethods:getById:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("paymentMethods:create", async (_, method) => {
    console.log("=== IPC HANDLER START ===");
    console.log("IPC Handler - paymentMethods:create ENTRY POINT reached");
    console.log("IPC Handler - paymentMethods:create received:", JSON.stringify(method, null, 2));
    console.log("IPC Handler - paymentMethodQueries available:", !!paymentMethodQueries);
    console.log("IPC Handler - paymentMethodQueries.create available:", !!paymentMethodQueries?.create);
    try {
      console.log("IPC Handler - About to call paymentMethodQueries.create");
      const result = paymentMethodQueries.create(method);
      console.log("IPC Handler - paymentMethods:create result:", result);
      console.log("=== IPC HANDLER SUCCESS ===");
      return result;
    } catch (error) {
      console.error("=== IPC HANDLER ERROR ===");
      console.error("IPC Error - paymentMethods:create:", error);
      if (error instanceof Error) {
        console.error("IPC Error - message:", error.message);
        console.error("IPC Error - stack:", error.stack);
      }
      console.error("=== IPC HANDLER ERROR END ===");
      throw error;
    }
  });
  electron.ipcMain.handle("paymentMethods:update", async (_, id, method) => {
    try {
      return paymentMethodQueries.update(id, method);
    } catch (error) {
      console.error("IPC Error - paymentMethods:update:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("paymentMethods:delete", async (_, id) => {
    try {
      return paymentMethodQueries.delete(id);
    } catch (error) {
      console.error("IPC Error - paymentMethods:delete:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("settings:getAll", () => settingsQueries.getAll());
  electron.ipcMain.handle("settings:get", (_, key) => settingsQueries.get(key));
  electron.ipcMain.handle("settings:set", (_, key, value, description) => settingsQueries.set(key, value, description));
  electron.ipcMain.handle("testRuns:getAll", () => testRunQueries.getAll());
  electron.ipcMain.handle("testRuns:getById", (_, id) => testRunQueries.getById(id));
  electron.ipcMain.handle("testRuns:getByForm", (_, formId) => testRunQueries.getByForm(formId));
  electron.ipcMain.handle("testRuns:create", (_, testRun) => testRunQueries.create(testRun));
  electron.ipcMain.handle("testRuns:updateStatus", (_, id, status, errorMessage, durationMs) => testRunQueries.updateStatus(id, status, errorMessage, durationMs));
  electron.ipcMain.handle("testRuns:delete", (_, id) => testRunQueries.delete(id));
  electron.ipcMain.handle("tests:run", async (_, formIds, paymentMethodIds) => {
    try {
      console.log("Starting test execution for forms:", formIds, "with payment methods:", paymentMethodIds);
      const testRunIds = [];
      const forms = formIds.map((id) => formQueries.getById(id)).filter((form) => form !== void 0);
      const paymentMethods = paymentMethodIds.map((id) => paymentMethodQueries.getById(id)).filter((pm) => pm !== void 0);
      console.log(`Found ${forms.length} forms and ${paymentMethods.length} payment methods`);
      const settings = settingsQueries.getAll();
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      for (const form of forms) {
        for (const paymentMethod of paymentMethods) {
          console.log(`Creating test run for form "${form.name}" with payment method "${paymentMethod.name}"`);
          const testRun = testRunQueries.create({
            formId: form.id,
            paymentMethodId: paymentMethod.id,
            status: "RUNNING",
            logDetails: JSON.stringify([`Test started for ${form.name} with ${paymentMethod.name}`]),
            screenshotPath: void 0,
            errorMessage: void 0,
            durationMs: void 0
          });
          testRunIds.push(testRun.lastInsertRowid);
          setImmediate(async () => {
            await runSingleTest(testRun.lastInsertRowid, form, paymentMethod, settingsMap);
          });
        }
      }
      return {
        success: true,
        message: `Started ${testRunIds.length} test runs`,
        testRunIds
      };
    } catch (error) {
      console.error("Test execution error:", error);
      throw error;
    }
  });
}
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    // ...(process.platform === 'linux' ? { icon } : {}), // TODO: Add proper icon
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
