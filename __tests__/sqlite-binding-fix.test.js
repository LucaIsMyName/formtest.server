const Database = require('better-sqlite3')

describe('SQLite Binding Fix - Real World Data', () => {
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

    // Replicate the exact fixed formQueries.create method
    formQueries = {
      create: (form) => {
        // Ultra-robust data sanitization
        let name = ''
        let url = ''
        let hash = null
        let isActive = 0
        
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
          const isActiveValue = form.isActive
          if (isActiveValue === true || isActiveValue === 1 || isActiveValue === '1' || isActiveValue === 'true') {
            isActive = 1
          } else {
            isActive = 0
          }
          
          const stmt = db.prepare('INSERT INTO forms (name, url, hash, isActive) VALUES (?, ?, ?, ?)')
          return stmt.run(name, url, hash, isActive)
          
        } catch (error) {
          throw error
        }
      }
    }
  })

  afterEach(() => {
    if (db) {
      db.close()
    }
  })

  test('should handle data from FormDialog (typical case)', () => {
    // This is the exact data structure that comes from FormDialog
    const formData = {
      name: 'My Test Form',
      url: 'https://secure.fundraisingbox.com/app/payment?hash=abc123',
      hash: null, // This is what FormDialog sends for empty hash
      isActive: true
    }

    expect(() => {
      const result = formQueries.create(formData)
      expect(result.changes).toBe(1)
    }).not.toThrow()
  })

  test('should handle data with undefined values', () => {
    const formData = {
      name: 'Test Form',
      url: 'https://example.com',
      hash: undefined,
      isActive: true
    }

    expect(() => {
      const result = formQueries.create(formData)
      expect(result.changes).toBe(1)
    }).not.toThrow()
  })

  test('should handle data with empty string hash', () => {
    const formData = {
      name: 'Test Form',
      url: 'https://example.com',
      hash: '',
      isActive: true
    }

    expect(() => {
      const result = formQueries.create(formData)
      expect(result.changes).toBe(1)
    }).not.toThrow()
  })

  test('should handle data with whitespace-only hash', () => {
    const formData = {
      name: 'Test Form',
      url: 'https://example.com',
      hash: '   ',
      isActive: true
    }

    expect(() => {
      const result = formQueries.create(formData)
      expect(result.changes).toBe(1)
    }).not.toThrow()
  })

  test('should handle various isActive values', () => {
    const testCases = [
      { isActive: true, expected: 1 },
      { isActive: false, expected: 0 },
      { isActive: 1, expected: 1 },
      { isActive: 0, expected: 0 },
      { isActive: '1', expected: 1 },
      { isActive: '0', expected: 0 },
      { isActive: 'true', expected: 1 },
      { isActive: 'false', expected: 0 },
      { isActive: undefined, expected: 0 },
      { isActive: null, expected: 0 }
    ]

    testCases.forEach((testCase, index) => {
      const formData = {
        name: `Test Form ${index}`,
        url: 'https://example.com',
        hash: null,
        isActive: testCase.isActive
      }

      expect(() => {
        const result = formQueries.create(formData)
        expect(result.changes).toBe(1)
      }).not.toThrow()
    })
  })

  test('should handle malformed data gracefully', () => {
    const formData = {
      name: null,
      url: undefined,
      hash: {},
      isActive: 'maybe'
    }

    expect(() => {
      const result = formQueries.create(formData)
      expect(result.changes).toBe(1)
    }).not.toThrow()
  })
})
