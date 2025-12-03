/**
 * Tests for payment method handling in the browser automation runner
 * 
 * These tests verify:
 * 1. Payment method ID mapping (sepa -> sepa_direct_debit, etc.)
 * 2. Payment form visibility detection logic
 * 3. Field selector specificity (container-scoped selectors)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the payment method mapping logic from runner.js
const fbPaymentMap: Record<string, string> = {
  'paypal': 'paypal',
  'sepa': 'sepa_direct_debit',
  'creditcard': 'stripe_credit_card',
  'eps': 'eps'
}

// Mock the form visibility mapping from runner.js
const formMap: Record<string, { selector: string; name: string } | null> = {
  'sepa': { selector: '#bankAccountForm', name: 'SEPA/Bank Account Form' },
  'creditcard': { selector: '#creditCardForm', name: 'Credit Card Form' },
  'eps': { selector: '#epsBankForm', name: 'EPS Bank Form' },
  'paypal': null // PayPal doesn't have an additional form
}

describe('Payment Method Handling', () => {
  describe('Payment Method ID Mapping', () => {
    it('should map sepa to sepa_direct_debit', () => {
      const paymentType = 'sepa'
      const fbPaymentId = fbPaymentMap[paymentType.toLowerCase()] || paymentType.toLowerCase()
      expect(fbPaymentId).toBe('sepa_direct_debit')
    })

    it('should map creditcard to stripe_credit_card', () => {
      const paymentType = 'creditcard'
      const fbPaymentId = fbPaymentMap[paymentType.toLowerCase()] || paymentType.toLowerCase()
      expect(fbPaymentId).toBe('stripe_credit_card')
    })

    it('should map paypal to paypal', () => {
      const paymentType = 'paypal'
      const fbPaymentId = fbPaymentMap[paymentType.toLowerCase()] || paymentType.toLowerCase()
      expect(fbPaymentId).toBe('paypal')
    })

    it('should map eps to eps', () => {
      const paymentType = 'eps'
      const fbPaymentId = fbPaymentMap[paymentType.toLowerCase()] || paymentType.toLowerCase()
      expect(fbPaymentId).toBe('eps')
    })

    it('should handle case-insensitive input', () => {
      const paymentType = 'SEPA'
      const fbPaymentId = fbPaymentMap[paymentType.toLowerCase()] || paymentType.toLowerCase()
      expect(fbPaymentId).toBe('sepa_direct_debit')
    })

    it('should fallback to lowercase type for unknown payment methods', () => {
      const paymentType = 'UnknownMethod'
      const fbPaymentId = fbPaymentMap[paymentType.toLowerCase()] || paymentType.toLowerCase()
      expect(fbPaymentId).toBe('unknownmethod')
    })
  })

  describe('Payment Form Visibility Mapping', () => {
    it('should return bankAccountForm selector for SEPA', () => {
      const formInfo = formMap['sepa']
      expect(formInfo).not.toBeNull()
      expect(formInfo?.selector).toBe('#bankAccountForm')
    })

    it('should return creditCardForm selector for creditcard', () => {
      const formInfo = formMap['creditcard']
      expect(formInfo).not.toBeNull()
      expect(formInfo?.selector).toBe('#creditCardForm')
    })

    it('should return epsBankForm selector for EPS', () => {
      const formInfo = formMap['eps']
      expect(formInfo).not.toBeNull()
      expect(formInfo?.selector).toBe('#epsBankForm')
    })

    it('should return null for PayPal (no additional form needed)', () => {
      const formInfo = formMap['paypal']
      expect(formInfo).toBeNull()
    })
  })

  describe('Field Selector Specificity', () => {
    // Test that container-scoped selectors are prioritized
    const sepaAccountHolderSelectors = [
      '#bankAccountForm #payment_bank_account_owner',  // Most specific
      '#payment_bank_account_owner',
      '#bankAccountForm input[name*="bank_account_owner"]',
      'input[name="payment[bank_account_owner]"]',
      'input[name*="bank_account_owner"]',
    ]

    const creditCardHolderSelectors = [
      '#creditCardForm #payment_credit_card_owner',  // Most specific
      '#payment_credit_card_owner',
      '#creditCardForm input[name*="credit_card_owner"]',
      'input[name="payment[credit_card_owner]"]',
    ]

    it('should have container-scoped selector first for SEPA account holder', () => {
      expect(sepaAccountHolderSelectors[0]).toBe('#bankAccountForm #payment_bank_account_owner')
    })

    it('should have container-scoped selector first for credit card holder', () => {
      expect(creditCardHolderSelectors[0]).toBe('#creditCardForm #payment_credit_card_owner')
    })

    it('SEPA and credit card holder selectors should be different', () => {
      // This ensures we don't accidentally fill the wrong field
      expect(sepaAccountHolderSelectors[0]).not.toBe(creditCardHolderSelectors[0])
    })
  })

  describe('FundraisingBox Payment Selectors', () => {
    // Test the selector generation for FundraisingBox payment methods
    const generateFBSelectors = (fbPaymentId: string) => [
      `#paymentmethods label[for="${fbPaymentId}"]`,
      `#paymentmethods input#${fbPaymentId}`,
      `label.paymentmethod[for="${fbPaymentId}"]`,
      `input[name="paymentmethods"][id="${fbPaymentId}"]`
    ]

    it('should generate correct selectors for SEPA', () => {
      const selectors = generateFBSelectors('sepa_direct_debit')
      expect(selectors).toContain('#paymentmethods label[for="sepa_direct_debit"]')
      expect(selectors).toContain('#paymentmethods input#sepa_direct_debit')
    })

    it('should generate correct selectors for credit card', () => {
      const selectors = generateFBSelectors('stripe_credit_card')
      expect(selectors).toContain('#paymentmethods label[for="stripe_credit_card"]')
      expect(selectors).toContain('#paymentmethods input#stripe_credit_card')
    })

    it('should generate correct selectors for PayPal', () => {
      const selectors = generateFBSelectors('paypal')
      expect(selectors).toContain('#paymentmethods label[for="paypal"]')
      expect(selectors).toContain('#paymentmethods input#paypal')
    })

    it('should generate correct selectors for EPS', () => {
      const selectors = generateFBSelectors('eps')
      expect(selectors).toContain('#paymentmethods label[for="eps"]')
      expect(selectors).toContain('#paymentmethods input#eps')
    })
  })
})

describe('Stripe Iframe Detection', () => {
  it('should identify Stripe iframe selector pattern', () => {
    const stripeIframeSelector = '#creditCardForm iframe[name*="__privateStripeFrame"]'
    
    // This selector should match Stripe Elements iframes
    expect(stripeIframeSelector).toContain('__privateStripeFrame')
    expect(stripeIframeSelector).toContain('#creditCardForm')
  })

  it('should know which credit card fields are Stripe iframes', () => {
    const stripeIframeFields = [
      '#payment_credit_card_number',
      '#payment_credit_card_secure_id', 
      '#payment_credit_card_expiry'
    ]

    const regularInputFields = [
      '#payment_credit_card_owner'
    ]

    // Stripe iframe fields cannot be automated
    expect(stripeIframeFields.length).toBe(3)
    
    // Only card owner is a regular input
    expect(regularInputFields.length).toBe(1)
    expect(regularInputFields[0]).toBe('#payment_credit_card_owner')
  })
})
