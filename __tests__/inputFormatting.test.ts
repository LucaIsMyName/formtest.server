import { describe, it, expect } from 'vitest';

// Import the formatting functions
// Note: We'll test the logic directly since the component uses these internally
type NumberFormatType = "IBAN" | "BIC" | "CreditCardNumber" | "UntilDate" | "CVV";

// Copy of formatForDisplay for testing
const formatForDisplay = (value: string, type: NumberFormatType): string => {
  if (!value) return "";
  
  const clean = value.replace(/[^a-zA-Z0-9]/g, "");
  
  switch (type) {
    case "IBAN":
      return clean
        .toUpperCase()
        .slice(0, 34)
        .replace(/(.{4})/g, "$1 ")
        .trim();
    
    case "BIC":
      return clean
        .toUpperCase()
        .slice(0, 11)
        .replace(/(.{4})/g, "$1 ")
        .trim();
    
    case "CreditCardNumber":
      return clean
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(.{4})/g, "$1 ")
        .trim();
    
    case "UntilDate":
      const digits = clean.replace(/\D/g, "").slice(0, 4);
      if (digits.length <= 2) return digits;
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    
    case "CVV":
      return clean.replace(/\D/g, "").slice(0, 4);
    
    default:
      return value;
  }
};

// Copy of stripFormatting for testing
const stripFormatting = (value: string, type: NumberFormatType): string => {
  if (!value) return "";
  
  switch (type) {
    case "IBAN":
    case "BIC":
      return value.replace(/\s/g, "").toUpperCase();
    
    case "CreditCardNumber":
    case "CVV":
      return value.replace(/\D/g, "");
    
    case "UntilDate":
      return value.replace(/\D/g, "");
    
    default:
      return value;
  }
};

describe('Input Formatting - formatForDisplay', () => {
  describe('IBAN formatting', () => {
    it('should format IBAN with spaces every 4 characters', () => {
      expect(formatForDisplay('AT89370400440532013000', 'IBAN')).toBe('AT89 3704 0044 0532 0130 00');
    });

    it('should convert IBAN to uppercase', () => {
      expect(formatForDisplay('at89370400440532013000', 'IBAN')).toBe('AT89 3704 0044 0532 0130 00');
    });

    it('should handle partial IBAN', () => {
      expect(formatForDisplay('AT89', 'IBAN')).toBe('AT89');
      expect(formatForDisplay('AT893704', 'IBAN')).toBe('AT89 3704');
    });

    it('should strip existing spaces and reformat', () => {
      expect(formatForDisplay('AT89 3704 0044', 'IBAN')).toBe('AT89 3704 0044');
    });

    it('should limit to 34 characters', () => {
      const longIban = 'AT89370400440532013000123456789012345';
      const result = formatForDisplay(longIban, 'IBAN');
      expect(result.replace(/\s/g, '').length).toBeLessThanOrEqual(34);
    });

    it('should handle empty string', () => {
      expect(formatForDisplay('', 'IBAN')).toBe('');
    });
  });

  describe('BIC formatting', () => {
    it('should format BIC with spaces every 4 characters', () => {
      expect(formatForDisplay('RLNWATWW', 'BIC')).toBe('RLNW ATWW');
    });

    it('should convert BIC to uppercase', () => {
      expect(formatForDisplay('rlnwatww', 'BIC')).toBe('RLNW ATWW');
    });

    it('should handle 11-character BIC', () => {
      expect(formatForDisplay('RLNWATWWXXX', 'BIC')).toBe('RLNW ATWW XXX');
    });

    it('should limit to 11 characters', () => {
      const longBic = 'RLNWATWWXXXYYY';
      const result = formatForDisplay(longBic, 'BIC');
      expect(result.replace(/\s/g, '').length).toBeLessThanOrEqual(11);
    });
  });

  describe('CreditCardNumber formatting', () => {
    it('should format credit card with spaces every 4 digits', () => {
      expect(formatForDisplay('4242424242424242', 'CreditCardNumber')).toBe('4242 4242 4242 4242');
    });

    it('should handle partial card number', () => {
      expect(formatForDisplay('4242', 'CreditCardNumber')).toBe('4242');
      expect(formatForDisplay('42424242', 'CreditCardNumber')).toBe('4242 4242');
    });

    it('should strip non-digits', () => {
      expect(formatForDisplay('4242-4242-4242-4242', 'CreditCardNumber')).toBe('4242 4242 4242 4242');
    });

    it('should limit to 16 digits', () => {
      const longNumber = '42424242424242421234';
      const result = formatForDisplay(longNumber, 'CreditCardNumber');
      expect(result.replace(/\s/g, '').length).toBe(16);
    });
  });

  describe('UntilDate formatting', () => {
    it('should format as MM/YY', () => {
      expect(formatForDisplay('1230', 'UntilDate')).toBe('12/30');
    });

    it('should handle partial input', () => {
      expect(formatForDisplay('1', 'UntilDate')).toBe('1');
      expect(formatForDisplay('12', 'UntilDate')).toBe('12');
      expect(formatForDisplay('123', 'UntilDate')).toBe('12/3');
    });

    it('should strip non-digits', () => {
      expect(formatForDisplay('12/30', 'UntilDate')).toBe('12/30');
    });

    it('should limit to 4 digits', () => {
      expect(formatForDisplay('123456', 'UntilDate')).toBe('12/34');
    });
  });

  describe('CVV formatting', () => {
    it('should keep only digits', () => {
      expect(formatForDisplay('123', 'CVV')).toBe('123');
    });

    it('should handle 4-digit CVV (Amex)', () => {
      expect(formatForDisplay('1234', 'CVV')).toBe('1234');
    });

    it('should strip non-digits', () => {
      expect(formatForDisplay('12a3', 'CVV')).toBe('123');
    });

    it('should limit to 4 digits', () => {
      expect(formatForDisplay('12345', 'CVV')).toBe('1234');
    });
  });
});

describe('Input Formatting - stripFormatting', () => {
  describe('IBAN stripping', () => {
    it('should remove spaces and uppercase', () => {
      expect(stripFormatting('AT89 3704 0044 0532 0130 00', 'IBAN')).toBe('AT89370400440532013000');
    });

    it('should handle lowercase input', () => {
      expect(stripFormatting('at89 3704 0044', 'IBAN')).toBe('AT8937040044');
    });
  });

  describe('BIC stripping', () => {
    it('should remove spaces and uppercase', () => {
      expect(stripFormatting('RLNW ATWW', 'BIC')).toBe('RLNWATWW');
    });
  });

  describe('CreditCardNumber stripping', () => {
    it('should remove spaces and keep only digits', () => {
      expect(stripFormatting('4242 4242 4242 4242', 'CreditCardNumber')).toBe('4242424242424242');
    });
  });

  describe('UntilDate stripping', () => {
    it('should remove slash and keep only digits', () => {
      expect(stripFormatting('12/30', 'UntilDate')).toBe('1230');
    });
  });

  describe('CVV stripping', () => {
    it('should keep only digits', () => {
      expect(stripFormatting('123', 'CVV')).toBe('123');
    });
  });
});

describe('Round-trip formatting', () => {
  it('IBAN: format -> strip should return original clean value', () => {
    const original = 'AT89370400440532013000';
    const formatted = formatForDisplay(original, 'IBAN');
    const stripped = stripFormatting(formatted, 'IBAN');
    expect(stripped).toBe(original);
  });

  it('CreditCardNumber: format -> strip should return original clean value', () => {
    const original = '4242424242424242';
    const formatted = formatForDisplay(original, 'CreditCardNumber');
    const stripped = stripFormatting(formatted, 'CreditCardNumber');
    expect(stripped).toBe(original);
  });

  it('UntilDate: format -> strip should return original clean value', () => {
    const original = '1230';
    const formatted = formatForDisplay(original, 'UntilDate');
    const stripped = stripFormatting(formatted, 'UntilDate');
    expect(stripped).toBe(original);
  });
});
