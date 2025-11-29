import { describe, it, expect } from 'vitest';
import { 
  SELECTOR_CONFIG, 
  mergeSelectorsConfig, 
  getConfigurableCategories,
  type SelectorOverride,
  type SelectorConfig 
} from '../src/common/selectors.config';

describe('SELECTOR_CONFIG', () => {
  it('should have all required top-level categories', () => {
    expect(SELECTOR_CONFIG).toHaveProperty('formDetection');
    expect(SELECTOR_CONFIG).toHaveProperty('cookieConsent');
    expect(SELECTOR_CONFIG).toHaveProperty('iframeDetection');
    expect(SELECTOR_CONFIG).toHaveProperty('formFields');
    expect(SELECTOR_CONFIG).toHaveProperty('paymentMethods');
    expect(SELECTOR_CONFIG).toHaveProperty('paymentFields');
    expect(SELECTOR_CONFIG).toHaveProperty('submitButtons');
    expect(SELECTOR_CONFIG).toHaveProperty('successPatterns');
    expect(SELECTOR_CONFIG).toHaveProperty('defaultValues');
  });

  it('should have formDetection with fundraisingBox selectors', () => {
    expect(SELECTOR_CONFIG.formDetection.fundraisingBox).toBeInstanceOf(Array);
    expect(SELECTOR_CONFIG.formDetection.fundraisingBox.length).toBeGreaterThan(0);
    expect(SELECTOR_CONFIG.formDetection.fundraisingBox).toContain('#fbPaymentForm');
  });

  it('should have cookieConsent with banners and acceptButtons', () => {
    expect(SELECTOR_CONFIG.cookieConsent.banners).toBeInstanceOf(Array);
    expect(SELECTOR_CONFIG.cookieConsent.acceptButtons).toBeInstanceOf(Array);
    expect(SELECTOR_CONFIG.cookieConsent.banners.length).toBeGreaterThan(0);
    expect(SELECTOR_CONFIG.cookieConsent.acceptButtons.length).toBeGreaterThan(0);
  });

  it('should have formFields with common field types', () => {
    expect(SELECTOR_CONFIG.formFields.firstName).toBeInstanceOf(Array);
    expect(SELECTOR_CONFIG.formFields.lastName).toBeInstanceOf(Array);
    expect(SELECTOR_CONFIG.formFields.email).toBeInstanceOf(Array);
    expect(SELECTOR_CONFIG.formFields.amount).toBeInstanceOf(Array);
    expect(SELECTOR_CONFIG.formFields.country).toBeInstanceOf(Array);
  });

  it('should have paymentMethods with common payment types', () => {
    expect(SELECTOR_CONFIG.paymentMethods.sepa).toBeInstanceOf(Array);
    expect(SELECTOR_CONFIG.paymentMethods.paypal).toBeInstanceOf(Array);
    expect(SELECTOR_CONFIG.paymentMethods.creditcard).toBeInstanceOf(Array);
    expect(SELECTOR_CONFIG.paymentMethods.eps).toBeInstanceOf(Array);
  });

  it('should have paymentFields for SEPA and credit card', () => {
    expect(SELECTOR_CONFIG.paymentFields.iban).toBeInstanceOf(Array);
    expect(SELECTOR_CONFIG.paymentFields.accountHolder).toBeInstanceOf(Array);
    expect(SELECTOR_CONFIG.paymentFields.cardNumber).toBeInstanceOf(Array);
    expect(SELECTOR_CONFIG.paymentFields.cvv).toBeInstanceOf(Array);
  });

  it('should have submitButtons array', () => {
    expect(SELECTOR_CONFIG.submitButtons).toBeInstanceOf(Array);
    expect(SELECTOR_CONFIG.submitButtons.length).toBeGreaterThan(0);
    expect(SELECTOR_CONFIG.submitButtons).toContain('input#submitForm');
  });

  it('should have successPatterns with redirectUrls and successMessages', () => {
    expect(SELECTOR_CONFIG.successPatterns.redirectUrls).toBeInstanceOf(Array);
    expect(SELECTOR_CONFIG.successPatterns.successMessages).toBeInstanceOf(Array);
    expect(SELECTOR_CONFIG.successPatterns.redirectUrls).toContain('paypal.com');
    expect(SELECTOR_CONFIG.successPatterns.successMessages).toContain('Vielen Dank');
  });

  it('should have defaultValues with test data', () => {
    expect(SELECTOR_CONFIG.defaultValues.testIban).toBe('AT89370400440532013000');
    expect(SELECTOR_CONFIG.defaultValues.testCardNumber).toBe('4111111111111111');
    expect(SELECTOR_CONFIG.defaultValues.country).toBe('AT');
  });
});

describe('mergeSelectorsConfig', () => {
  it('should return base config structure when no overrides provided', () => {
    const merged = mergeSelectorsConfig(SELECTOR_CONFIG, []);
    // Note: JSON.parse/stringify doesn't preserve RegExp, so we check structure
    expect(merged.formFields.email).toEqual(SELECTOR_CONFIG.formFields.email);
    expect(merged.submitButtons).toEqual(SELECTOR_CONFIG.submitButtons);
    expect(merged.successPatterns.redirectUrls).toEqual(SELECTOR_CONFIG.successPatterns.redirectUrls);
  });

  it('should prepend user selectors to existing selectors', () => {
    const overrides: SelectorOverride[] = [
      {
        id: 1,
        category: 'formFields' as keyof SelectorConfig,
        key: 'email',
        selectors: ['#custom-email', '.my-email-field'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const merged = mergeSelectorsConfig(SELECTOR_CONFIG, overrides);
    
    // User selectors should be first (higher priority)
    expect(merged.formFields.email[0]).toBe('#custom-email');
    expect(merged.formFields.email[1]).toBe('.my-email-field');
    // Original selectors should still be present
    expect(merged.formFields.email).toContain('#payment_email');
  });

  it('should ignore inactive overrides', () => {
    const overrides: SelectorOverride[] = [
      {
        id: 1,
        category: 'formFields' as keyof SelectorConfig,
        key: 'email',
        selectors: ['#inactive-selector'],
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const merged = mergeSelectorsConfig(SELECTOR_CONFIG, overrides);
    
    // Inactive override should not be applied
    expect(merged.formFields.email[0]).not.toBe('#inactive-selector');
    expect(merged.formFields.email).not.toContain('#inactive-selector');
  });

  it('should handle multiple overrides for different categories', () => {
    const overrides: SelectorOverride[] = [
      {
        id: 1,
        category: 'formFields' as keyof SelectorConfig,
        key: 'firstName',
        selectors: ['#my-first-name'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        category: 'paymentMethods' as keyof SelectorConfig,
        key: 'sepa',
        selectors: ['#my-sepa-button'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const merged = mergeSelectorsConfig(SELECTOR_CONFIG, overrides);
    
    expect(merged.formFields.firstName[0]).toBe('#my-first-name');
    expect(merged.paymentMethods.sepa[0]).toBe('#my-sepa-button');
  });

  it('should not modify the original config', () => {
    const originalEmailSelectors = [...SELECTOR_CONFIG.formFields.email];
    
    const overrides: SelectorOverride[] = [
      {
        id: 1,
        category: 'formFields' as keyof SelectorConfig,
        key: 'email',
        selectors: ['#new-selector'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mergeSelectorsConfig(SELECTOR_CONFIG, overrides);
    
    // Original should be unchanged
    expect(SELECTOR_CONFIG.formFields.email).toEqual(originalEmailSelectors);
  });
});

describe('getConfigurableCategories', () => {
  it('should return array of configurable categories', () => {
    const categories = getConfigurableCategories();
    
    expect(categories).toBeInstanceOf(Array);
    expect(categories.length).toBeGreaterThan(0);
  });

  it('should have category, keys, and label for each item', () => {
    const categories = getConfigurableCategories();
    
    for (const cat of categories) {
      expect(cat).toHaveProperty('category');
      expect(cat).toHaveProperty('keys');
      expect(cat).toHaveProperty('label');
      expect(cat.keys).toBeInstanceOf(Array);
      expect(typeof cat.label).toBe('string');
    }
  });

  it('should include formFields category', () => {
    const categories = getConfigurableCategories();
    const formFieldsCategory = categories.find(c => c.category === 'formFields');
    
    expect(formFieldsCategory).toBeDefined();
    expect(formFieldsCategory?.keys).toContain('email');
    expect(formFieldsCategory?.keys).toContain('firstName');
    expect(formFieldsCategory?.label).toBe('Formularfelder');
  });

  it('should include successPatterns category', () => {
    const categories = getConfigurableCategories();
    const successCategory = categories.find(c => c.category === 'successPatterns');
    
    expect(successCategory).toBeDefined();
    expect(successCategory?.keys).toContain('redirectUrls');
    expect(successCategory?.keys).toContain('successMessages');
  });
});
