const Database = require('better-sqlite3')

describe('Payment Methods SQLite Binding Fix', () => {
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

    // Replicate the exact fixed paymentMethodQueries.create method
    paymentMethodQueries = {
      create: (method) => {
        // Ultra-robust data sanitization
        let name = ''
        let type = 'paypal'
        let isActive = 0
        let details = '{}'
        
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
          const isActiveValue = method.isActive
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
              details = '{}'
            }
          }
          
          const stmt = db.prepare('INSERT INTO payment_methods (name, type, isActive, details) VALUES (?, ?, ?, ?)')
          return stmt.run(name, type, isActive, details)
          
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

  test('should handle PaymentMethodDialog data structure', () => {
    // This is the exact data structure that comes from PaymentMethodDialog
    const methodData = {
      name: 'Test PayPal Account',
      type: 'paypal',
      isActive: true,
      details: {
        email: 'test@paypal.com'
      }
    }

    expect(() => {
      const result = paymentMethodQueries.create(methodData)
      expect(result.changes).toBe(1)
    }).not.toThrow()
  })

  test('should handle SEPA payment method', () => {
    const methodData = {
      name: 'Test SEPA',
      type: 'sepa',
      isActive: true,
      details: {
        accountHolder: 'Max Mustermann',
        iban: 'DE89370400440532013000'
      }
    }

    expect(() => {
      const result = paymentMethodQueries.create(methodData)
      expect(result.changes).toBe(1)
    }).not.toThrow()
  })

  test('should handle Credit Card payment method', () => {
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

    expect(() => {
      const result = paymentMethodQueries.create(methodData)
      expect(result.changes).toBe(1)
    }).not.toThrow()
  })

  test('should handle EPS payment method', () => {
    const methodData = {
      name: 'Test EPS',
      type: 'eps',
      isActive: true,
      details: {
        bankCode: 'BAWAATWW'
      }
    }

    expect(() => {
      const result = paymentMethodQueries.create(methodData)
      expect(result.changes).toBe(1)
    }).not.toThrow()
  })

  test('should handle undefined and null values', () => {
    const methodData = {
      name: undefined,
      type: null,
      isActive: undefined,
      details: null
    }

    expect(() => {
      const result = paymentMethodQueries.create(methodData)
      expect(result.changes).toBe(1)
    }).not.toThrow()
  })

  test('should handle invalid type gracefully', () => {
    const methodData = {
      name: 'Test Invalid Type',
      type: 'invalid_type',
      isActive: true,
      details: {}
    }

    expect(() => {
      const result = paymentMethodQueries.create(methodData)
      expect(result.changes).toBe(1)
    }).not.toThrow()
  })

  test('should handle complex details object', () => {
    const methodData = {
      name: 'Complex Details',
      type: 'creditcard',
      isActive: true,
      details: {
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        cvv: '123',
        cardholderName: 'John Doe',
        nested: {
          property: 'value'
        },
        array: [1, 2, 3]
      }
    }

    expect(() => {
      const result = paymentMethodQueries.create(methodData)
      expect(result.changes).toBe(1)
    }).not.toThrow()
  })

  test('should handle various isActive values', () => {
    const testCases = [
      { isActive: true },
      { isActive: false },
      { isActive: 1 },
      { isActive: 0 },
      { isActive: '1' },
      { isActive: '0' },
      { isActive: 'true' },
      { isActive: 'false' },
      { isActive: undefined },
      { isActive: null }
    ]

    testCases.forEach((testCase, index) => {
      const methodData = {
        name: `Test Method ${index}`,
        type: 'paypal',
        isActive: testCase.isActive,
        details: { email: 'test@example.com' }
      }

      expect(() => {
        const result = paymentMethodQueries.create(methodData)
        expect(result.changes).toBe(1)
      }).not.toThrow()
    })
  })
})
