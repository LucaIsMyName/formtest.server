/**
 * Tests for Form Field Mappings feature
 * 
 * This tests the new field mapping functionality that allows users to define
 * custom selectors and values for form fields, overriding automatic detection.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { Form, FormFieldMapping, FieldMappingType, FieldMappingAction } from '../src/common/types';

describe('FormFieldMapping Types', () => {
  describe('FieldMappingType', () => {
    it('should include all expected field types', () => {
      const validTypes: FieldMappingType[] = [
        'amount',
        'customAmount',
        'interval',
        'firstName',
        'lastName',
        'email',
        'salutation',
        'country',
        'paymentMethod',
        'checkbox',
        'radio',
        'iban',
        'accountHolder',
        'birthday',
        'custom'
      ];

      // Type check - this will fail at compile time if types don't match
      validTypes.forEach(type => {
        expect(typeof type).toBe('string');
      });
    });
  });

  describe('FieldMappingAction', () => {
    it('should include all expected actions', () => {
      const validActions: FieldMappingAction[] = [
        'type',
        'click',
        'select',
        'check',
        'waitAndClick'
      ];

      validActions.forEach(action => {
        expect(typeof action).toBe('string');
      });
    });
  });

  describe('FormFieldMapping', () => {
    it('should create a valid field mapping object', () => {
      const mapping: FormFieldMapping = {
        id: 'test-id-123',
        fieldType: 'firstName',
        selector: '#payment_first_name',
        value: 'Max',
        action: 'type',
        waitMs: 500,
        description: 'First name field'
      };

      expect(mapping.id).toBe('test-id-123');
      expect(mapping.fieldType).toBe('firstName');
      expect(mapping.selector).toBe('#payment_first_name');
      expect(mapping.value).toBe('Max');
      expect(mapping.action).toBe('type');
      expect(mapping.waitMs).toBe(500);
      expect(mapping.description).toBe('First name field');
    });

    it('should allow optional fields to be undefined', () => {
      const mapping: FormFieldMapping = {
        id: 'test-id-456',
        fieldType: 'checkbox',
        selector: '#privacy_checkbox',
        action: 'check'
      };

      expect(mapping.value).toBeUndefined();
      expect(mapping.waitMs).toBeUndefined();
      expect(mapping.description).toBeUndefined();
    });
  });

  describe('Form with fieldMappings', () => {
    it('should include fieldMappings array in Form type', () => {
      const form: Partial<Form> = {
        id: 1,
        name: 'Test Form',
        url: 'https://example.com/form',
        isActive: true,
        fieldMappings: [
          {
            id: 'mapping-1',
            fieldType: 'amount',
            selector: '#payment_amount_suggestion-0',
            action: 'click',
            description: '50€ preset button'
          },
          {
            id: 'mapping-2',
            fieldType: 'country',
            selector: '#payment_donation_custom_field_8542',
            value: 'AT',
            action: 'select',
            description: 'Country dropdown'
          }
        ]
      };

      expect(form.fieldMappings).toHaveLength(2);
      expect(form.fieldMappings![0].fieldType).toBe('amount');
      expect(form.fieldMappings![1].value).toBe('AT');
    });

    it('should allow empty fieldMappings array', () => {
      const form: Partial<Form> = {
        id: 2,
        name: 'Form without mappings',
        url: 'https://example.com/form2',
        isActive: true,
        fieldMappings: []
      };

      expect(form.fieldMappings).toHaveLength(0);
    });

    it('should allow undefined fieldMappings', () => {
      const form: Partial<Form> = {
        id: 3,
        name: 'Form without mappings property',
        url: 'https://example.com/form3',
        isActive: true
      };

      expect(form.fieldMappings).toBeUndefined();
    });
  });
});

describe('FundraisingBox Field Mapping Examples', () => {
  it('should create valid mappings for FundraisingBox form', () => {
    const fundraisingBoxMappings: FormFieldMapping[] = [
      // Amount selection (card-style radio)
      {
        id: 'fb-amount',
        fieldType: 'amount',
        selector: '#payment_amount_suggestion-0',
        action: 'click',
        description: '50€ preset amount'
      },
      // Interval dropdown
      {
        id: 'fb-interval',
        fieldType: 'interval',
        selector: '#payment_interval',
        value: '0',
        action: 'select',
        description: 'One-time donation'
      },
      // Salutation dropdown
      {
        id: 'fb-salutation',
        fieldType: 'salutation',
        selector: '#payment_salutation',
        value: 'Mr.',
        action: 'select'
      },
      // Country (custom field)
      {
        id: 'fb-country',
        fieldType: 'country',
        selector: '#payment_donation_custom_field_8542',
        value: 'AT',
        action: 'select',
        description: 'Austria'
      },
      // Payment method (card-style radio)
      {
        id: 'fb-payment',
        fieldType: 'paymentMethod',
        selector: '#paymentmethods label[for="sepa_direct_debit"]',
        action: 'click',
        description: 'SEPA payment'
      },
      // Privacy checkbox
      {
        id: 'fb-privacy',
        fieldType: 'checkbox',
        selector: '#payment_is_privacy_accepted',
        action: 'check',
        description: 'Privacy policy acceptance'
      },
      // Newsletter radio (No)
      {
        id: 'fb-newsletter',
        fieldType: 'radio',
        selector: '#payment_donation_custom_field_8543_Nein',
        action: 'click',
        description: 'Newsletter opt-out'
      }
    ];

    expect(fundraisingBoxMappings).toHaveLength(7);
    
    // Verify each mapping has required fields
    fundraisingBoxMappings.forEach(mapping => {
      expect(mapping.id).toBeDefined();
      expect(mapping.fieldType).toBeDefined();
      expect(mapping.selector).toBeDefined();
      expect(mapping.action).toBeDefined();
    });
  });

  it('should create SEPA payment field mappings', () => {
    const sepaMappings: FormFieldMapping[] = [
      {
        id: 'sepa-holder',
        fieldType: 'accountHolder',
        selector: '#payment_bank_account_owner',
        value: 'Max Mustermann',
        action: 'type'
      },
      {
        id: 'sepa-iban',
        fieldType: 'iban',
        selector: '#payment_bank_iban',
        value: 'AT89370400440532013000',
        action: 'type'
      }
    ];

    expect(sepaMappings[0].fieldType).toBe('accountHolder');
    expect(sepaMappings[1].fieldType).toBe('iban');
    expect(sepaMappings[1].value).toMatch(/^AT/);
  });
});

describe('Field Mapping JSON Serialization', () => {
  it('should serialize and deserialize field mappings correctly', () => {
    const mappings: FormFieldMapping[] = [
      {
        id: 'test-1',
        fieldType: 'firstName',
        selector: '#first_name',
        value: 'Test',
        action: 'type',
        waitMs: 100,
        description: 'Test mapping'
      }
    ];

    const json = JSON.stringify(mappings);
    const parsed = JSON.parse(json) as FormFieldMapping[];

    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe('test-1');
    expect(parsed[0].fieldType).toBe('firstName');
    expect(parsed[0].waitMs).toBe(100);
  });

  it('should handle empty array serialization', () => {
    const mappings: FormFieldMapping[] = [];
    const json = JSON.stringify(mappings);
    
    expect(json).toBe('[]');
    expect(JSON.parse(json)).toEqual([]);
  });
});
