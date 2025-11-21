import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import type { Form, PaymentMethod, GlobalSetting, TestRun } from '../common/types'

let db: Database.Database

export function initDatabase(): void {
  console.log('=== INITIALIZING DATABASE ===')
  const dbPath = join(app.getPath('userData'), 'formtest.db')
  console.log('Database: Path:', dbPath)
  
  try {
    db = new Database(dbPath)
    console.log('Database: SQLite connection established')
  } catch (dbError) {
    console.error('Database: Failed to create SQLite connection:', dbError)
    throw dbError
  }

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
  
  console.log('Database: Tables created and default settings inserted')
  console.log('Database: Initialization complete')
}

export function getDatabase(): Database.Database {
  return db
}

// Form operations
export const formQueries = {
  getAll: () => {
    const forms = db.prepare('SELECT * FROM forms ORDER BY name').all() as any[]
    return forms.map(form => ({
      ...form,
      isActive: Boolean(form.isActive),
      createdAt: new Date(form.createdAt),
      updatedAt: new Date(form.updatedAt)
    })) as Form[]
  },
  getById: (id: number) => {
    const form = db.prepare('SELECT * FROM forms WHERE id = ?').get(id) as any
    if (!form) return undefined
    return {
      ...form,
      isActive: Boolean(form.isActive),
      createdAt: new Date(form.createdAt),
      updatedAt: new Date(form.updatedAt)
    } as Form
  },
  create: (form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Database: Creating form with raw data:', JSON.stringify(form, null, 2))
    console.log('Database: Form data types:', {
      name: typeof form.name,
      url: typeof form.url, 
      hash: typeof form.hash,
      isActive: typeof form.isActive
    })
    
    // Ultra-robust data sanitization
    let name: string = ''
    let url: string = ''
    let hash: string | null = null
    let isActive: number = 0
    
    try {
      // Handle name
      if (form.name === null || form.name === undefined) {
        name = ''
      } else {
        name = String(form.name).trim()
      }
      
      // Handle URL
      if (form.url === null || form.url === undefined) {
        url = ''
      } else {
        url = String(form.url).trim()
      }
      
      // Handle hash - be very explicit about null vs undefined vs empty string
      if (form.hash === null || form.hash === undefined || form.hash === '') {
        hash = null
      } else {
        const hashStr = String(form.hash).trim()
        hash = hashStr === '' ? null : hashStr
      }
      
      // Handle isActive - be very explicit about boolean conversion
      // Use any type to handle potential type mismatches from IPC
      const isActiveValue = form.isActive as any
      if (isActiveValue === true || isActiveValue === 1 || isActiveValue === '1' || isActiveValue === 'true') {
        isActive = 1
      } else {
        isActive = 0
      }
      
      console.log('Database: Final sanitized values:', { name, url, hash, isActive })
      console.log('Database: Final value types:', {
        name: typeof name,
        url: typeof url,
        hash: typeof hash,
        isActive: typeof isActive
      })
      
      const stmt = db.prepare('INSERT INTO forms (name, url, hash, isActive) VALUES (?, ?, ?, ?)')
      const result = stmt.run(name, url, hash, isActive)
      console.log('Database: Insert result:', result)
      return result
      
    } catch (error) {
      console.error('Database: Error in create method:', error)
      console.error('Database: Error details:', {
        originalForm: form,
        sanitizedValues: { name, url, hash, isActive }
      })
      throw error
    }
  },
  update: (id: number, form: Partial<Form>) => {
    console.log('Database: Updating form with data:', { id, form })
    
    // Ensure all values are proper SQLite types
    const name = form.name !== undefined ? String(form.name) : undefined
    const url = form.url !== undefined ? String(form.url) : undefined
    const hash = form.hash !== undefined ? (form.hash && form.hash.trim() ? String(form.hash.trim()) : null) : undefined
    const isActive = form.isActive !== undefined ? (form.isActive === true ? 1 : 0) : undefined
    
    // Only update fields that are provided
    const updates = []
    const values = []
    
    if (name !== undefined) { updates.push('name = ?'); values.push(name) }
    if (url !== undefined) { updates.push('url = ?'); values.push(url) }
    if (hash !== undefined) { updates.push('hash = ?'); values.push(hash) }
    if (isActive !== undefined) { updates.push('isActive = ?'); values.push(isActive) }
    
    updates.push('updatedAt = CURRENT_TIMESTAMP')
    values.push(id)
    
    const sql = `UPDATE forms SET ${updates.join(', ')} WHERE id = ?`
    console.log('Database: Update SQL:', sql, 'Values:', values)
    
    const stmt = db.prepare(sql)
    return stmt.run(...values)
  },
  delete: (id: number) => db.prepare('DELETE FROM forms WHERE id = ?').run(id)
}

// Payment method operations
console.log('Database: Initializing paymentMethodQueries...')
export const paymentMethodQueries = {
  getAll: () => {
    const methods = db.prepare('SELECT * FROM payment_methods ORDER BY name').all() as any[]
    return methods.map(method => ({
      ...method,
      isActive: Boolean(method.isActive),
      details: JSON.parse(method.details),
      createdAt: new Date(method.createdAt),
      updatedAt: new Date(method.updatedAt)
    })) as PaymentMethod[]
  },
  getById: (id: number) => {
    const method = db.prepare('SELECT * FROM payment_methods WHERE id = ?').get(id) as any
    if (!method) return undefined
    return {
      ...method,
      isActive: Boolean(method.isActive),
      details: JSON.parse(method.details),
      createdAt: new Date(method.createdAt),
      updatedAt: new Date(method.updatedAt)
    } as PaymentMethod
  },
  create: (method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>) => {
    
    // Ultra-robust data sanitization
    let name: string = ''
    let type: string = 'paypal'
    let isActive: number = 0
    let details: string = '{}'
    
    try {
      // Handle name
      if (method.name === null || method.name === undefined) {
        name = ''
      } else {
        name = String(method.name).trim()
      }
      
      // Handle type
      if (method.type === null || method.type === undefined) {
        type = 'paypal'
      } else {
        const validTypes = ['paypal', 'sepa', 'creditcard', 'eps']
        const typeStr = String(method.type).toLowerCase()
        type = validTypes.includes(typeStr) ? typeStr : 'paypal'
      }
      
      // Handle isActive - be very explicit about boolean conversion
      const isActiveValue = method.isActive as any
      if (isActiveValue === true || isActiveValue === 1 || isActiveValue === '1' || isActiveValue === 'true') {
        isActive = 1
      } else {
        isActive = 0
      }
      
      // Handle details - ensure it's valid JSON
      if (method.details === null || method.details === undefined) {
        details = '{}'
      } else {
        try {
          details = JSON.stringify(method.details)
        } catch (jsonError) {
          console.error('Database: Failed to stringify details:', jsonError)
          details = '{}'
        }
      }
      
      const stmt = db.prepare('INSERT INTO payment_methods (name, type, isActive, details) VALUES (?, ?, ?, ?)')
      return stmt.run(name, type, isActive, details)
      
    } catch (error) {
      console.error('Database: Error in payment method create method:', error)
      console.error('Database: Payment method error details:', {
        originalMethod: method,
        sanitizedValues: { name, type, isActive, details }
      })
      throw error
    }
  },
  update: (id: number, method: Partial<PaymentMethod>) => {
    console.log('Database: Updating payment method with data:', { id, method })
    
    // Ensure all values are proper SQLite types
    const name = method.name !== undefined ? String(method.name) : undefined
    const type = method.type !== undefined ? String(method.type) : undefined
    const isActive = method.isActive !== undefined ? (method.isActive === true ? 1 : 0) : undefined
    const details = method.details !== undefined ? JSON.stringify(method.details) : undefined
    
    // Only update fields that are provided
    const updates = []
    const values = []
    
    if (name !== undefined) { updates.push('name = ?'); values.push(name) }
    if (type !== undefined) { updates.push('type = ?'); values.push(type) }
    if (isActive !== undefined) { updates.push('isActive = ?'); values.push(isActive) }
    if (details !== undefined) { updates.push('details = ?'); values.push(details) }
    
    updates.push('updatedAt = CURRENT_TIMESTAMP')
    values.push(id)
    
    const sql = `UPDATE payment_methods SET ${updates.join(', ')} WHERE id = ?`
    console.log('Database: Payment method update SQL:', sql, 'Values:', values)
    
    const stmt = db.prepare(sql)
    return stmt.run(...values)
  },
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
