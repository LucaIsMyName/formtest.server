import { describe, it, expect } from 'vitest';
import type { PaymentMethodDetails } from '../src/common/types';

describe('PaymentMethodDetails', () => {
  describe('Credit Card', () => {
    it('should support all credit card fields including cardholderName', () => {
      const creditCard: PaymentMethodDetails = {
        cardNumber: '4111111111111111',
        cardholderName: 'Max Mustermann',
        expiryDate: '12/30',
        cvv: '123',
      };

      expect(creditCard.cardNumber).toBe('4111111111111111');
      expect(creditCard.cardholderName).toBe('Max Mustermann');
      expect(creditCard.expiryDate).toBe('12/30');
      expect(creditCard.cvv).toBe('123');
    });

    it('should allow cardholderName to be optional', () => {
      const creditCard: PaymentMethodDetails = {
        cardNumber: '4111111111111111',
        expiryDate: '12/30',
        cvv: '123',
      };

      expect(creditCard.cardholderName).toBeUndefined();
    });
  });

  describe('SEPA', () => {
    it('should support all SEPA fields', () => {
      const sepa: PaymentMethodDetails = {
        iban: 'AT89370400440532013000',
        bic: 'RLNWATWW',
        accountHolder: 'Max Mustermann',
      };

      expect(sepa.iban).toBe('AT89370400440532013000');
      expect(sepa.bic).toBe('RLNWATWW');
      expect(sepa.accountHolder).toBe('Max Mustermann');
    });
  });

  describe('PayPal', () => {
    it('should support PayPal email', () => {
      const paypal: PaymentMethodDetails = {
        email: 'test@example.com',
      };

      expect(paypal.email).toBe('test@example.com');
    });
  });

  describe('EPS', () => {
    it('should support EPS bank code', () => {
      const eps: PaymentMethodDetails = {
        bankCode: 'BAWAATWW',
      };

      expect(eps.bankCode).toBe('BAWAATWW');
    });
  });
});
