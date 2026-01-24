import { describe, it, expect } from 'vitest';
import type { GlobalFieldDefaults } from '../src/common/types';

describe('GlobalFieldDefaults', () => {
  describe('Type structure', () => {
    it('should allow all expected field types', () => {
      const defaults: GlobalFieldDefaults = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        salutation: 'Mr.',
        country: 'AT',
        birthday: '01.01.1980',
        street: 'Teststraße 1',
        city: 'Wien',
        zip: '1010',
        phone: '+43 1 234567',
        title: 'Dr.',
        company: 'Test GmbH',
        iban: 'AT89370400440532013000',
        accountHolder: 'Test User',
      };

      expect(defaults.firstName).toBe('Test');
      expect(defaults.lastName).toBe('User');
      expect(defaults.email).toBe('test@example.com');
      expect(defaults.country).toBe('AT');
    });

    it('should allow empty object', () => {
      const defaults: GlobalFieldDefaults = {};
      expect(Object.keys(defaults).length).toBe(0);
    });

    it('should allow partial fields', () => {
      const defaults: GlobalFieldDefaults = {
        firstName: 'Luca',
        email: 'luca@example.com',
      };

      expect(defaults.firstName).toBe('Luca');
      expect(defaults.lastName).toBeUndefined();
      expect(defaults.email).toBe('luca@example.com');
    });

    it('should allow custom fields via index signature', () => {
      const defaults: GlobalFieldDefaults = {
        firstName: 'Test',
        customField: 'Custom Value',
      };

      expect(defaults.customField).toBe('Custom Value');
    });
  });

  describe('Priority logic', () => {
    // Simulates the priority logic: Form Mapping > Global Defaults > Faker
    const getFieldValue = (
      fieldType: string,
      formMapping: string | undefined,
      globalDefault: string | undefined,
      fakerValue: string
    ): string => {
      // Priority 1: Form-specific mapping
      if (formMapping) return formMapping;
      // Priority 2: Global default
      if (globalDefault) return globalDefault;
      // Priority 3: Faker fallback
      return fakerValue;
    };

    it('should use form mapping when all three are available', () => {
      const result = getFieldValue(
        'firstName',
        'FormMappingValue',
        'GlobalDefaultValue',
        'FakerValue'
      );
      expect(result).toBe('FormMappingValue');
    });

    it('should use global default when form mapping is not set', () => {
      const result = getFieldValue(
        'firstName',
        undefined,
        'GlobalDefaultValue',
        'FakerValue'
      );
      expect(result).toBe('GlobalDefaultValue');
    });

    it('should use faker when neither form mapping nor global default is set', () => {
      const result = getFieldValue(
        'firstName',
        undefined,
        undefined,
        'FakerValue'
      );
      expect(result).toBe('FakerValue');
    });

    it('should use global default even when faker is available', () => {
      const result = getFieldValue(
        'email',
        undefined,
        'test@company.com',
        'random@faker.com'
      );
      expect(result).toBe('test@company.com');
    });
  });

  describe('Field detection patterns', () => {
    // Simulates analyzeFieldPurpose from runner.js
    const analyzeFieldPurpose = (indicators: string): { purpose: string; confidence: number } => {
      const lower = indicators.toLowerCase();

      if (/email|e-mail|mail/.test(lower)) {
        return { purpose: 'email', confidence: 0.9 };
      }
      if (/firstname|vorname|first.name/.test(lower)) {
        return { purpose: 'firstName', confidence: 0.9 };
      }
      if (/lastname|nachname|last.name|surname/.test(lower)) {
        return { purpose: 'lastName', confidence: 0.9 };
      }
      if (/phone|telefon|(?<![ti])tel|mobile|handy/.test(lower)) {
        // Note: (?<![ti])tel avoids matching 'titel' which should be title
        return { purpose: 'phone', confidence: 0.8 };
      }
      if (/address|adresse|street|strasse|straße/.test(lower)) {
        return { purpose: 'address', confidence: 0.8 };
      }
      if (/city|stadt|ort/.test(lower)) {
        return { purpose: 'city', confidence: 0.8 };
      }
      if (/zip|plz|postal/.test(lower)) {
        return { purpose: 'zipCode', confidence: 0.8 };
      }
      if (/company|firma|unternehmen|organisation/.test(lower)) {
        return { purpose: 'company', confidence: 0.8 };
      }
      if (/title|titel/.test(lower)) {
        return { purpose: 'title', confidence: 0.7 };
      }
      if (/birthday|geburtstag|geburtsdatum|birth/.test(lower)) {
        return { purpose: 'birthday', confidence: 0.8 };
      }
      if (/salutation|anrede/.test(lower)) {
        return { purpose: 'salutation', confidence: 0.8 };
      }

      return { purpose: 'unknown', confidence: 0 };
    };

    it('should detect email fields', () => {
      expect(analyzeFieldPurpose('payment_email').purpose).toBe('email');
      expect(analyzeFieldPurpose('user_e-mail').purpose).toBe('email');
    });

    it('should detect name fields', () => {
      expect(analyzeFieldPurpose('first_name').purpose).toBe('firstName');
      expect(analyzeFieldPurpose('vorname').purpose).toBe('firstName');
      expect(analyzeFieldPurpose('last_name').purpose).toBe('lastName');
      expect(analyzeFieldPurpose('nachname').purpose).toBe('lastName');
    });

    it('should detect address fields', () => {
      expect(analyzeFieldPurpose('street_address').purpose).toBe('address');
      expect(analyzeFieldPurpose('strasse').purpose).toBe('address');
      expect(analyzeFieldPurpose('city').purpose).toBe('city');
      expect(analyzeFieldPurpose('plz').purpose).toBe('zipCode');
    });

    it('should detect company and title fields', () => {
      expect(analyzeFieldPurpose('company_name').purpose).toBe('company');
      expect(analyzeFieldPurpose('firma').purpose).toBe('company');
      expect(analyzeFieldPurpose('title').purpose).toBe('title');
      expect(analyzeFieldPurpose('titel').purpose).toBe('title');
    });

    it('should detect birthday and salutation fields', () => {
      expect(analyzeFieldPurpose('birthday').purpose).toBe('birthday');
      expect(analyzeFieldPurpose('geburtstag').purpose).toBe('birthday');
      expect(analyzeFieldPurpose('salutation').purpose).toBe('salutation');
      expect(analyzeFieldPurpose('anrede').purpose).toBe('salutation');
    });

    it('should return unknown for unrecognized fields', () => {
      expect(analyzeFieldPurpose('random_field').purpose).toBe('unknown');
      expect(analyzeFieldPurpose('xyz123').purpose).toBe('unknown');
    });
  });
});
