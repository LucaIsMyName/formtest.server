import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import type { Form, PaymentMethod, GlobalSetting, TestRun } from '../common/types'

let db: Database.Database

export function initDatabase(): void {
  const dbPath = join(app.getPath('userData'), 'formtest.db')
  db = new Database(dbPath)

  // Create tables
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
  `)

  // Insert default settings
  const defaultSettings = [
    { key: 'default_donation_amount', value: '50', description: 'Default donation amount in EUR' },
    { key: 'default_interval', value: '0', description: 'Default donation interval (0=once, 1=monthly)' },
    { key: 'test_timeout', value: '30000', description: 'Test timeout in milliseconds' },
    { key: 'headless_mode', value: 'true', description: 'Run tests in headless mode' }
  ]

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO global_settings (key, value, description) 
    VALUES (?, ?, ?)
  `)

  for (const setting of defaultSettings) {
    insertSetting.run(setting.key, setting.value, setting.description)
  }
}

export function getDatabase(): Database.Database {
  return db
}

// Form operations
export const formQueries = {
  getAll: () => db.prepare('SELECT * FROM forms ORDER BY name').all() as Form[],
  getById: (id: number) => db.prepare('SELECT * FROM forms WHERE id = ?').get(id) as Form | undefined,
  create: (form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) => 
    db.prepare('INSERT INTO forms (name, url, hash, isActive) VALUES (?, ?, ?, ?)').run(form.name, form.url, form.hash, form.isActive),
  update: (id: number, form: Partial<Form>) => 
    db.prepare('UPDATE forms SET name = ?, url = ?, hash = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .run(form.name, form.url, form.hash, form.isActive, id),
  delete: (id: number) => db.prepare('DELETE FROM forms WHERE id = ?').run(id)
}

// Payment method operations
export const paymentMethodQueries = {
  getAll: () => db.prepare('SELECT * FROM payment_methods ORDER BY name').all() as PaymentMethod[],
  getById: (id: number) => db.prepare('SELECT * FROM payment_methods WHERE id = ?').get(id) as PaymentMethod | undefined,
  create: (method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>) => 
    db.prepare('INSERT INTO payment_methods (name, type, isActive, details) VALUES (?, ?, ?, ?)').run(method.name, method.type, method.isActive, JSON.stringify(method.details)),
  update: (id: number, method: Partial<PaymentMethod>) => 
    db.prepare('UPDATE payment_methods SET name = ?, type = ?, isActive = ?, details = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .run(method.name, method.type, method.isActive, JSON.stringify(method.details), id),
  delete: (id: number) => db.prepare('DELETE FROM payment_methods WHERE id = ?').run(id)
}

// Global settings operations
export const settingsQueries = {
  getAll: () => db.prepare('SELECT * FROM global_settings ORDER BY key').all() as GlobalSetting[],
  get: (key: string) => db.prepare('SELECT * FROM global_settings WHERE key = ?').get(key) as GlobalSetting | undefined,
  set: (key: string, value: string, description?: string) => 
    db.prepare('INSERT OR REPLACE INTO global_settings (key, value, description) VALUES (?, ?, ?)').run(key, value, description)
}

// Test run operations
export const testRunQueries = {
  getAll: () => db.prepare('SELECT * FROM test_runs ORDER BY runAt DESC').all() as TestRun[],
  getById: (id: number) => db.prepare('SELECT * FROM test_runs WHERE id = ?').get(id) as TestRun | undefined,
  getByForm: (formId: number) => db.prepare('SELECT * FROM test_runs WHERE formId = ? ORDER BY runAt DESC').all(formId) as TestRun[],
  create: (testRun: Omit<TestRun, 'id' | 'runAt'>) => 
    db.prepare('INSERT INTO test_runs (formId, paymentMethodId, status, errorMessage, screenshotPath, logDetails, durationMs) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      testRun.formId, testRun.paymentMethodId, testRun.status, testRun.errorMessage, testRun.screenshotPath, testRun.logDetails, testRun.durationMs
    ),
  updateStatus: (id: number, status: TestRun['status'], errorMessage?: string, durationMs?: number) => 
    db.prepare('UPDATE test_runs SET status = ?, errorMessage = ?, durationMs = ? WHERE id = ?').run(status, errorMessage, durationMs, id)
}
