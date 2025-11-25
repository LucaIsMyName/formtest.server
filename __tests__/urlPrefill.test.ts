/**
 * Tests for FundraisingBox URL prefilling feature
 * 
 * FundraisingBox forms support URL parameters:
 * - amount: Donation amount (e.g., 50, 100)
 * - interval: Payment frequency (0=one-time, 1=monthly, 4=quarterly, 12=yearly)
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Mock the buildPrefilledUrl logic for testing
function buildPrefilledUrl(
  formUrl: string,
  fieldMappings: Array<{ fieldType: string; value?: string }> = [],
  config: { defaultDonationAmount?: string; defaultInterval?: string } = {}
): string {
  const url = new URL(formUrl);
  
  // Check if this is a FundraisingBox URL
  const isFundraisingBox = url.hostname.includes('fundraisingbox') || 
                           url.hostname.includes('fbbox') ||
                           formUrl.includes('fundraisingbox');
  
  if (!isFundraisingBox) {
    return formUrl;
  }

  // Get amount from field mapping or settings
  const amountMapping = fieldMappings.find(m => m.fieldType === 'amount' || m.fieldType === 'customAmount');
  const amount = amountMapping?.value || config.defaultDonationAmount || '50';
  
  // Get interval from field mapping or settings
  const intervalMapping = fieldMappings.find(m => m.fieldType === 'interval');
  let interval = intervalMapping?.value || config.defaultInterval || '0';
  
  // Map interval names to FundraisingBox values if needed
  const intervalMap: Record<string, string> = {
    'einmalig': '0',
    'one-time': '0',
    'onetime': '0',
    'monatlich': '1',
    'monthly': '1',
    'quartal': '4',
    'quarterly': '4',
    'jährlich': '12',
    'yearly': '12',
    'annual': '12'
  };
  
  // Convert named interval to number if needed
  if (isNaN(parseInt(interval))) {
    interval = intervalMap[interval.toLowerCase()] || '0';
  }

  // Add parameters (only if not already present)
  if (!url.searchParams.has('amount')) {
    url.searchParams.set('amount', amount);
  }
  
  if (!url.searchParams.has('interval')) {
    url.searchParams.set('interval', interval);
  }

  return url.toString();
}

describe('FundraisingBox URL Prefilling', () => {
  describe('URL Detection', () => {
    it('should detect fundraisingbox.com URLs', () => {
      const url = 'https://secure.fundraisingbox.com/app/payment?hash=abc123';
      const result = buildPrefilledUrl(url);
      expect(result).toContain('amount=');
      expect(result).toContain('interval=');
    });

    it('should detect fbbox URLs', () => {
      const url = 'https://secure.fbbox.com/app/payment?hash=abc123';
      const result = buildPrefilledUrl(url);
      expect(result).toContain('amount=');
    });

    it('should NOT modify non-FundraisingBox URLs', () => {
      const url = 'https://example.com/donate';
      const result = buildPrefilledUrl(url);
      expect(result).toBe(url);
      expect(result).not.toContain('amount=');
    });
  });

  describe('Amount Prefilling', () => {
    const baseUrl = 'https://secure.fundraisingbox.com/app/payment?hash=abc123';

    it('should use default amount (50) when no mapping or config', () => {
      const result = buildPrefilledUrl(baseUrl);
      expect(result).toContain('amount=50');
    });

    it('should use config defaultDonationAmount as fallback', () => {
      const result = buildPrefilledUrl(baseUrl, [], { defaultDonationAmount: '100' });
      expect(result).toContain('amount=100');
    });

    it('should prioritize field mapping over config', () => {
      const result = buildPrefilledUrl(
        baseUrl,
        [{ fieldType: 'amount', value: '200' }],
        { defaultDonationAmount: '100' }
      );
      expect(result).toContain('amount=200');
    });

    it('should use customAmount field mapping', () => {
      const result = buildPrefilledUrl(
        baseUrl,
        [{ fieldType: 'customAmount', value: '75' }]
      );
      expect(result).toContain('amount=75');
    });

    it('should NOT override existing amount param', () => {
      const urlWithAmount = 'https://secure.fundraisingbox.com/app/payment?hash=abc123&amount=999';
      const result = buildPrefilledUrl(urlWithAmount, [], { defaultDonationAmount: '100' });
      expect(result).toContain('amount=999');
      expect(result).not.toContain('amount=100');
    });
  });

  describe('Interval Prefilling', () => {
    const baseUrl = 'https://secure.fundraisingbox.com/app/payment?hash=abc123';

    it('should use default interval (0 = one-time) when no mapping or config', () => {
      const result = buildPrefilledUrl(baseUrl);
      expect(result).toContain('interval=0');
    });

    it('should use config defaultInterval as fallback', () => {
      const result = buildPrefilledUrl(baseUrl, [], { defaultInterval: '1' });
      expect(result).toContain('interval=1');
    });

    it('should prioritize field mapping over config', () => {
      const result = buildPrefilledUrl(
        baseUrl,
        [{ fieldType: 'interval', value: '12' }],
        { defaultInterval: '1' }
      );
      expect(result).toContain('interval=12');
    });

    it('should NOT override existing interval param', () => {
      const urlWithInterval = 'https://secure.fundraisingbox.com/app/payment?hash=abc123&interval=4';
      const result = buildPrefilledUrl(urlWithInterval, [], { defaultInterval: '1' });
      expect(result).toContain('interval=4');
      expect(result).not.toContain('interval=1');
    });
  });

  describe('Interval Name Mapping', () => {
    const baseUrl = 'https://secure.fundraisingbox.com/app/payment?hash=abc123';

    it('should convert "einmalig" to 0', () => {
      const result = buildPrefilledUrl(baseUrl, [{ fieldType: 'interval', value: 'einmalig' }]);
      expect(result).toContain('interval=0');
    });

    it('should convert "monthly" to 1', () => {
      const result = buildPrefilledUrl(baseUrl, [{ fieldType: 'interval', value: 'monthly' }]);
      expect(result).toContain('interval=1');
    });

    it('should convert "monatlich" to 1', () => {
      const result = buildPrefilledUrl(baseUrl, [{ fieldType: 'interval', value: 'monatlich' }]);
      expect(result).toContain('interval=1');
    });

    it('should convert "quarterly" to 4', () => {
      const result = buildPrefilledUrl(baseUrl, [{ fieldType: 'interval', value: 'quarterly' }]);
      expect(result).toContain('interval=4');
    });

    it('should convert "yearly" to 12', () => {
      const result = buildPrefilledUrl(baseUrl, [{ fieldType: 'interval', value: 'yearly' }]);
      expect(result).toContain('interval=12');
    });

    it('should convert "jährlich" to 12', () => {
      const result = buildPrefilledUrl(baseUrl, [{ fieldType: 'interval', value: 'jährlich' }]);
      expect(result).toContain('interval=12');
    });

    it('should handle case-insensitive interval names', () => {
      const result = buildPrefilledUrl(baseUrl, [{ fieldType: 'interval', value: 'MONTHLY' }]);
      expect(result).toContain('interval=1');
    });

    it('should default to 0 for unknown interval names', () => {
      const result = buildPrefilledUrl(baseUrl, [{ fieldType: 'interval', value: 'unknown' }]);
      expect(result).toContain('interval=0');
    });
  });

  describe('Combined Parameters', () => {
    const baseUrl = 'https://secure.fundraisingbox.com/app/payment?hash=abc123';

    it('should add both amount and interval', () => {
      const result = buildPrefilledUrl(
        baseUrl,
        [
          { fieldType: 'amount', value: '150' },
          { fieldType: 'interval', value: '1' }
        ]
      );
      expect(result).toContain('amount=150');
      expect(result).toContain('interval=1');
    });

    it('should preserve existing URL parameters', () => {
      const urlWithHash = 'https://secure.fundraisingbox.com/app/payment?hash=abc123&campaign=test';
      const result = buildPrefilledUrl(urlWithHash);
      expect(result).toContain('hash=abc123');
      expect(result).toContain('campaign=test');
      expect(result).toContain('amount=');
      expect(result).toContain('interval=');
    });
  });
});
