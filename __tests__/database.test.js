/**
 * @vitest-environment node
 */
const Database = require('better-sqlite3')

// Mock database for testing
let db
let mockFormQueries

describe('Database Form Operations', () => {
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

    // Mock form queries with test database
    mockFormQueries = {
      getAll: () => {
        const forms = db.prepare('SELECT * FROM forms ORDER BY name').all()
        return forms.map(form => ({
          ...form,
          isActive: Boolean(form.isActive),
          createdAt: new Date(form.createdAt),
          updatedAt: new Date(form.updatedAt)
        }))
      },
      create: (form) => {
        const stmt = db.prepare('INSERT INTO forms (name, url, hash, isActive) VALUES (?, ?, ?, ?)')
        return stmt.run(
          form.name || '',
          form.url || '',
          form.hash || null,
          form.isActive ? 1 : 0
        )
      },
      getById: (id) => {
        const form = db.prepare('SELECT * FROM forms WHERE id = ?').get(id)
        if (!form) return undefined
        return {
          ...form,
          isActive: Boolean(form.isActive),
          createdAt: new Date(form.createdAt),
          updatedAt: new Date(form.updatedAt)
        }
      }
    }
  })

  afterEach(() => {
    db.close()
  })

  test('should create form with proper data types', () => {
    const formData = {
      name: 'Test Form',
      url: 'https://example.com/form',
      hash: 'test123',
      isActive: true
    }

    const result = mockFormQueries.create(formData)
    expect(result.changes).toBe(1)
    expect(result.lastInsertRowid).toBe(1)
  })

  test('should handle boolean conversion for isActive', () => {
    const formData = {
      name: 'Test Form',
      url: 'https://example.com/form',
      isActive: false
    }

    mockFormQueries.create(formData)
    const form = mockFormQueries.getById(1)
    
    expect(form.isActive).toBe(false)
    expect(typeof form.isActive).toBe('boolean')
  })

  test('should handle null hash values', () => {
    const formData = {
      name: 'Test Form',
      url: 'https://example.com/form',
      hash: undefined,
      isActive: true
    }

    mockFormQueries.create(formData)
    const form = mockFormQueries.getById(1)
    
    expect(form.hash).toBeNull()
  })

  test('should convert dates properly', () => {
    const formData = {
      name: 'Test Form',
      url: 'https://example.com/form',
      isActive: true
    }

    mockFormQueries.create(formData)
    const form = mockFormQueries.getById(1)
    
    expect(form.createdAt).toBeInstanceOf(Date)
    expect(form.updatedAt).toBeInstanceOf(Date)
  })

  test('should retrieve all forms with proper types', () => {
    // Create test forms
    mockFormQueries.create({
      name: 'Form 1',
      url: 'https://example.com/form1',
      isActive: true
    })
    
    mockFormQueries.create({
      name: 'Form 2', 
      url: 'https://example.com/form2',
      isActive: false
    })

    const forms = mockFormQueries.getAll()
    
    expect(forms).toHaveLength(2)
    expect(forms[0].isActive).toBe(true)
    expect(forms[1].isActive).toBe(false)
    expect(typeof forms[0].isActive).toBe('boolean')
    expect(typeof forms[1].isActive).toBe('boolean')
  })
})
