import { describe, it, expect } from 'vitest';

/**
 * Payment Method Validation Rules:
 * - SEPA: All intervals (0=one-time, 1=monthly, 3=quarterly, 12=yearly)
 * - EPS: One-time only (interval=0)
 * - Credit Card: One-time only (interval=0)
 * - PayPal: One-time only (interval=0)
 */

// Payment rules configuration
const PAYMENT_RULES: Record<string, { allowedIntervals: number[]; description: string }> = {
  sepa: { allowedIntervals: [0, 1, 3, 12], description: 'All intervals' },
  eps: { allowedIntervals: [0], description: 'One-time only' },
  creditcard: { allowedIntervals: [0], description: 'One-time only' },
  paypal: { allowedIntervals: [0], description: 'One-time only' },
};

// Interval labels
const INTERVAL_LABELS: Record<number, string> = {
  0: 'One-time',
  1: 'Monthly',
  3: 'Quarterly',
  12: 'Yearly',
};

// Validation function (mirrors the logic in runner.js)
function validatePaymentCombination(paymentType: string, interval: number): { valid: boolean; reason: string } {
  const type = paymentType.toLowerCase();
  const rules = PAYMENT_RULES[type];
  
  if (!rules) {
    return { valid: false, reason: `Unknown payment type: ${paymentType}` };
  }
  
  if (rules.allowedIntervals.includes(interval)) {
    return { 
      valid: true, 
      reason: `${paymentType.toUpperCase()} supports ${INTERVAL_LABELS[interval]} donations` 
    };
  }
  
  return { 
    valid: false, 
    reason: `${paymentType.toUpperCase()} only supports: ${rules.allowedIntervals.map(i => INTERVAL_LABELS[i]).join(', ')}` 
  };
}

// Test runner validation logic (mirrors runner.js)
function shouldSkipSubmission(paymentType: string, interval: number): boolean {
  const isRecurring = interval > 0;
  const isSepa = paymentType.toLowerCase() === 'sepa';
  
  // Skip submission if recurring and not SEPA
  return isRecurring && !isSepa;
}

describe('Payment Method Validation', () => {
  describe('SEPA Payment Method', () => {
    it('should allow one-time donations (interval=0)', () => {
      const result = validatePaymentCombination('sepa', 0);
      expect(result.valid).toBe(true);
      expect(shouldSkipSubmission('sepa', 0)).toBe(false);
    });

    it('should allow monthly donations (interval=1)', () => {
      const result = validatePaymentCombination('sepa', 1);
      expect(result.valid).toBe(true);
      expect(shouldSkipSubmission('sepa', 1)).toBe(false);
    });

    it('should allow quarterly donations (interval=3)', () => {
      const result = validatePaymentCombination('sepa', 3);
      expect(result.valid).toBe(true);
      expect(shouldSkipSubmission('sepa', 3)).toBe(false);
    });

    it('should allow yearly donations (interval=12)', () => {
      const result = validatePaymentCombination('sepa', 12);
      expect(result.valid).toBe(true);
      expect(shouldSkipSubmission('sepa', 12)).toBe(false);
    });
  });

  describe('EPS Payment Method', () => {
    it('should allow one-time donations (interval=0)', () => {
      const result = validatePaymentCombination('eps', 0);
      expect(result.valid).toBe(true);
      expect(shouldSkipSubmission('eps', 0)).toBe(false);
    });

    it('should NOT allow monthly donations (interval=1)', () => {
      const result = validatePaymentCombination('eps', 1);
      expect(result.valid).toBe(false);
      expect(shouldSkipSubmission('eps', 1)).toBe(true);
    });

    it('should NOT allow quarterly donations (interval=3)', () => {
      const result = validatePaymentCombination('eps', 3);
      expect(result.valid).toBe(false);
      expect(shouldSkipSubmission('eps', 3)).toBe(true);
    });

    it('should NOT allow yearly donations (interval=12)', () => {
      const result = validatePaymentCombination('eps', 12);
      expect(result.valid).toBe(false);
      expect(shouldSkipSubmission('eps', 12)).toBe(true);
    });
  });

  describe('Credit Card Payment Method', () => {
    it('should allow one-time donations (interval=0)', () => {
      const result = validatePaymentCombination('creditcard', 0);
      expect(result.valid).toBe(true);
      expect(shouldSkipSubmission('creditcard', 0)).toBe(false);
    });

    it('should NOT allow monthly donations (interval=1)', () => {
      const result = validatePaymentCombination('creditcard', 1);
      expect(result.valid).toBe(false);
      expect(shouldSkipSubmission('creditcard', 1)).toBe(true);
    });

    it('should NOT allow quarterly donations (interval=3)', () => {
      const result = validatePaymentCombination('creditcard', 3);
      expect(result.valid).toBe(false);
      expect(shouldSkipSubmission('creditcard', 3)).toBe(true);
    });

    it('should NOT allow yearly donations (interval=12)', () => {
      const result = validatePaymentCombination('creditcard', 12);
      expect(result.valid).toBe(false);
      expect(shouldSkipSubmission('creditcard', 12)).toBe(true);
    });
  });

  describe('PayPal Payment Method', () => {
    it('should allow one-time donations (interval=0)', () => {
      const result = validatePaymentCombination('paypal', 0);
      expect(result.valid).toBe(true);
      expect(shouldSkipSubmission('paypal', 0)).toBe(false);
    });

    it('should NOT allow monthly donations (interval=1)', () => {
      const result = validatePaymentCombination('paypal', 1);
      expect(result.valid).toBe(false);
      expect(shouldSkipSubmission('paypal', 1)).toBe(true);
    });

    it('should NOT allow quarterly donations (interval=3)', () => {
      const result = validatePaymentCombination('paypal', 3);
      expect(result.valid).toBe(false);
      expect(shouldSkipSubmission('paypal', 3)).toBe(true);
    });

    it('should NOT allow yearly donations (interval=12)', () => {
      const result = validatePaymentCombination('paypal', 12);
      expect(result.valid).toBe(false);
      expect(shouldSkipSubmission('paypal', 12)).toBe(true);
    });
  });

  describe('Case Insensitivity', () => {
    it('should handle uppercase payment types', () => {
      expect(validatePaymentCombination('SEPA', 0).valid).toBe(true);
      expect(validatePaymentCombination('EPS', 0).valid).toBe(true);
      expect(validatePaymentCombination('PAYPAL', 0).valid).toBe(true);
      expect(validatePaymentCombination('CREDITCARD', 0).valid).toBe(true);
    });

    it('should handle mixed case payment types', () => {
      expect(validatePaymentCombination('Sepa', 1).valid).toBe(true);
      expect(validatePaymentCombination('PayPal', 0).valid).toBe(true);
      expect(validatePaymentCombination('CreditCard', 0).valid).toBe(true);
    });
  });

  describe('Unknown Payment Types', () => {
    it('should reject unknown payment types', () => {
      const result = validatePaymentCombination('bitcoin', 0);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Unknown payment type');
    });
  });

  describe('Test Matrix - All Valid Combinations', () => {
    const validCombinations = [
      // SEPA - all intervals
      { payment: 'sepa', interval: 0, expected: true },
      { payment: 'sepa', interval: 1, expected: true },
      { payment: 'sepa', interval: 3, expected: true },
      { payment: 'sepa', interval: 12, expected: true },
      // EPS - one-time only
      { payment: 'eps', interval: 0, expected: true },
      { payment: 'eps', interval: 1, expected: false },
      { payment: 'eps', interval: 3, expected: false },
      { payment: 'eps', interval: 12, expected: false },
      // Credit Card - one-time only
      { payment: 'creditcard', interval: 0, expected: true },
      { payment: 'creditcard', interval: 1, expected: false },
      { payment: 'creditcard', interval: 3, expected: false },
      { payment: 'creditcard', interval: 12, expected: false },
      // PayPal - one-time only
      { payment: 'paypal', interval: 0, expected: true },
      { payment: 'paypal', interval: 1, expected: false },
      { payment: 'paypal', interval: 3, expected: false },
      { payment: 'paypal', interval: 12, expected: false },
    ];

    validCombinations.forEach(({ payment, interval, expected }) => {
      it(`${payment.toUpperCase()} + ${INTERVAL_LABELS[interval]} should be ${expected ? 'VALID' : 'INVALID'}`, () => {
        const result = validatePaymentCombination(payment, interval);
        expect(result.valid).toBe(expected);
      });
    });
  });
});
