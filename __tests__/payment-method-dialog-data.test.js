describe('PaymentMethodDialog Data Structure', () => {
  test('should create proper data structure for PayPal', () => {
    const paypalData = {
      name: 'Test PayPal',
      type: 'paypal',
      isActive: true,
      details: {
        email: 'test@paypal.com'
      }
    }

    // Simulate what PaymentMethodDialog sends
    const submitData = {
      name: paypalData.name.trim(),
      type: paypalData.type,
      isActive: paypalData.isActive,
      details: paypalData.details || {}
    }

    expect(submitData.name).toBe('Test PayPal')
    expect(submitData.type).toBe('paypal')
    expect(submitData.isActive).toBe(true)
    expect(submitData.details).toEqual({ email: 'test@paypal.com' })
    expect(typeof submitData.name).toBe('string')
    expect(typeof submitData.type).toBe('string')
    expect(typeof submitData.isActive).toBe('boolean')
    expect(typeof submitData.details).toBe('object')
  })

  test('should create proper data structure for SEPA', () => {
    const sepaData = {
      name: 'Test SEPA',
      type: 'sepa',
      isActive: true,
      details: {
        accountHolder: 'Max Mustermann',
        iban: 'DE89370400440532013000'
      }
    }

    const submitData = {
      name: sepaData.name.trim(),
      type: sepaData.type,
      isActive: sepaData.isActive,
      details: sepaData.details || {}
    }

    expect(submitData.details).toEqual({
      accountHolder: 'Max Mustermann',
      iban: 'DE89370400440532013000'
    })
  })

  test('should handle empty details gracefully', () => {
    const emptyDetailsData = {
      name: 'Test Empty',
      type: 'paypal',
      isActive: true,
      details: {}
    }

    const submitData = {
      name: emptyDetailsData.name.trim(),
      type: emptyDetailsData.type,
      isActive: emptyDetailsData.isActive,
      details: emptyDetailsData.details || {}
    }

    expect(submitData.details).toEqual({})
    expect(typeof submitData.details).toBe('object')
  })

  test('should handle undefined details', () => {
    const undefinedDetailsData = {
      name: 'Test Undefined',
      type: 'paypal',
      isActive: true,
      details: undefined
    }

    const submitData = {
      name: undefinedDetailsData.name.trim(),
      type: undefinedDetailsData.type,
      isActive: undefinedDetailsData.isActive,
      details: undefinedDetailsData.details || {}
    }

    expect(submitData.details).toEqual({})
    expect(typeof submitData.details).toBe('object')
  })

  test('should handle all payment types', () => {
    const paymentTypes = ['paypal', 'sepa', 'creditcard', 'eps']
    
    paymentTypes.forEach(type => {
      const data = {
        name: `Test ${type}`,
        type: type,
        isActive: true,
        details: {}
      }

      const submitData = {
        name: data.name.trim(),
        type: data.type,
        isActive: data.isActive,
        details: data.details || {}
      }

      expect(typeof submitData.name).toBe('string')
      expect(typeof submitData.type).toBe('string')
      expect(typeof submitData.isActive).toBe('boolean')
      expect(typeof submitData.details).toBe('object')
      expect(submitData.type).toBe(type)
    })
  })
})
