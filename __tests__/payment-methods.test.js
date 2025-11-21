const Database = require('better-sqlite3')

describe('Payment Methods Database Operations', () => {
  let db
  let paymentMethodQueries

  beforeEach(() => {
    // Create in-memory database for testing
    db = new Database(':memory:')
    
    // Create payment_methods table
    db.exec(`
      CREATE TABLE payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('paypal', 'sepa', 'creditcard', 'eps')),
        isActive BOOLEAN DEFAULT 1,
        details TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Replicate the payment method queries
    paymentMethodQueries = {
      create: (method) => {
        // Ensure all values are proper SQLite types
        const name = String(method.name || '')
        const type = String(method.type || 'paypal')
        const isActive = method.isActive === true ? 1 : 0
        const details = JSON.stringify(method.details || {})
        
        const stmt = db.prepare('INSERT INTO payment_methods (name, type, isActive, details) VALUES (?, ?, ?, ?)')
        return stmt.run(name, type, isActive, details)
      },
      getAll: () => {
        const methods = db.prepare('SELECT * FROM payment_methods ORDER BY name').all()
        return methods.map(method => ({
          ...method,
          isActive: Boolean(method.isActive),
          details: JSON.parse(method.details),
          createdAt: new Date(method.createdAt),
          updatedAt: new Date(method.updatedAt)
        }))
      }
    }
  })

  afterEach(() => {
    if (db) {
      db.close()
    }
  })

  test('should create PayPal payment method', () => {
    const methodData = {
      name: 'Test PayPal',
      type: 'paypal',
      isActive: true,
      details: {
        email: 'test@paypal.com'
      }
    }

    const result = paymentMethodQueries.create(methodData)
    expect(result.changes).toBe(1)
    expect(result.lastInsertRowid).toBe(1)
  })

  test('should create SEPA payment method', () => {
    const methodData = {
      name: 'Test SEPA',
      type: 'sepa',
      isActive: true,
      details: {
        iban: 'DE89370400440532013000',
        bic: 'COBADEFFXXX'
      }
    }

    const result = paymentMethodQueries.create(methodData)
    expect(result.changes).toBe(1)
  })

  test('should create Credit Card payment method', () => {
    const methodData = {
      name: 'Test Credit Card',
      type: 'creditcard',
      isActive: true,
      details: {
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        cvv: '123'
      }
    }

    const result = paymentMethodQueries.create(methodData)
    expect(result.changes).toBe(1)
  })

  test('should create EPS payment method', () => {
    const methodData = {
      name: 'Test EPS',
      type: 'eps',
      isActive: true,
      details: {
        bankCode: 'BAWAATWW'
      }
    }

    const result = paymentMethodQueries.create(methodData)
    expect(result.changes).toBe(1)
  })

  test('should retrieve all payment methods with proper types', () => {
    // Create test payment methods
    paymentMethodQueries.create({
      name: 'PayPal Test',
      type: 'paypal',
      isActive: true,
      details: { email: 'test@paypal.com' }
    })
    
    paymentMethodQueries.create({
      name: 'SEPA Test',
      type: 'sepa',
      isActive: false,
      details: { iban: 'DE89370400440532013000', bic: 'COBADEFFXXX' }
    })

    const methods = paymentMethodQueries.getAll()
    
    expect(methods).toHaveLength(2)
    expect(methods[0].isActive).toBe(true)
    expect(methods[1].isActive).toBe(false)
    expect(typeof methods[0].isActive).toBe('boolean')
    expect(typeof methods[1].isActive).toBe('boolean')
    expect(methods[0].details).toEqual({ email: 'test@paypal.com' })
    expect(methods[1].details).toEqual({ iban: 'DE89370400440532013000', bic: 'COBADEFFXXX' })
  })

  test('should handle empty details object', () => {
    const methodData = {
      name: 'Empty Details',
      type: 'paypal',
      isActive: true,
      details: {}
    }

    expect(() => {
      const result = paymentMethodQueries.create(methodData)
      expect(result.changes).toBe(1)
    }).not.toThrow()
  })
})
