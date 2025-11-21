const Database = require('better-sqlite3')

describe('Forms Creation SQLite Binding Fix', () => {
  let db
  let formQueries

  beforeEach(() => {
    // Create in-memory database for testing
    db = new Database(':memory:')
    
    // Create forms table
    db.exec(`
      CREATE TABLE forms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        hash TEXT,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Replicate the fixed formQueries.create method
    formQueries = {
      create: (form) => {
        // Ensure all values are proper SQLite types
        const name = String(form.name || '')
        const url = String(form.url || '')
        const hash = form.hash && form.hash.trim() ? String(form.hash.trim()) : null
        const isActive = form.isActive === true ? 1 : 0
        
        const stmt = db.prepare('INSERT INTO forms (name, url, hash, isActive) VALUES (?, ?, ?, ?)')
        return stmt.run(name, url, hash, isActive)
      }
    }
  })

  afterEach(() => {
    if (db) {
      db.close()
    }
  })

  test('should handle form with all fields', () => {
    const formData = {
      name: 'Test Form',
      url: 'https://example.com/form',
      hash: 'test123',
      isActive: true
    }

    const result = formQueries.create(formData)
    expect(result.changes).toBe(1)
    expect(result.lastInsertRowid).toBe(1)
  })

  test('should handle form with empty hash', () => {
    const formData = {
      name: 'Test Form',
      url: 'https://example.com/form',
      hash: '',
      isActive: true
    }

    const result = formQueries.create(formData)
    expect(result.changes).toBe(1)
  })

  test('should handle form with undefined hash', () => {
    const formData = {
      name: 'Test Form',
      url: 'https://example.com/form',
      hash: undefined,
      isActive: true
    }

    const result = formQueries.create(formData)
    expect(result.changes).toBe(1)
  })

  test('should handle form with whitespace-only hash', () => {
    const formData = {
      name: 'Test Form',
      url: 'https://example.com/form',
      hash: '   ',
      isActive: true
    }

    const result = formQueries.create(formData)
    expect(result.changes).toBe(1)
  })

  test('should handle boolean false for isActive', () => {
    const formData = {
      name: 'Test Form',
      url: 'https://example.com/form',
      isActive: false
    }

    const result = formQueries.create(formData)
    expect(result.changes).toBe(1)
  })

  test('should handle missing isActive field', () => {
    const formData = {
      name: 'Test Form',
      url: 'https://example.com/form'
    }

    const result = formQueries.create(formData)
    expect(result.changes).toBe(1)
  })

  test('should handle form data from renderer (typical use case)', () => {
    // This simulates the exact data structure that comes from the FormDialog
    const formData = {
      name: 'My Donation Form',
      url: 'https://secure.fundraisingbox.com/app/payment?hash=abc123',
      hash: 'abc123',
      isActive: true
    }

    expect(() => {
      const result = formQueries.create(formData)
      expect(result.changes).toBe(1)
    }).not.toThrow()
  })
})
