import { describe, it, expect } from 'vitest';

describe('Slow Motion Setting', () => {
  it('should parse slow_motion setting correctly', () => {
    const settings = {
      headless_mode: 'false',
      test_timeout: '30000',
      slow_motion: '500',
      default_donation_amount: '50',
      default_interval: '0'
    };

    const config = {
      headless: settings.headless_mode === 'true',
      timeout: parseInt(settings.test_timeout || '30000'),
      slowMo: parseInt(settings.slow_motion || '0'),
      browser: 'chromium',
      viewport: { width: 1280, height: 720 },
      defaultAmount: settings.default_donation_amount || '50',
      defaultInterval: settings.default_interval || '0'
    };

    expect(config.headless).toBe(false);
    expect(config.slowMo).toBe(500);
    expect(config.timeout).toBe(30000);
  });

  it('should default to 0 when slow_motion is not set', () => {
    const settings = {
      headless_mode: 'true',
      test_timeout: '30000',
      // slow_motion not set
    } as Record<string, string>;

    const slowMo = parseInt(settings.slow_motion || '0');
    expect(slowMo).toBe(0);
  });

  it('should handle various slow motion values', () => {
    const testCases = [
      { input: '0', expected: 0 },
      { input: '250', expected: 250 },
      { input: '500', expected: 500 },
      { input: '1000', expected: 1000 },
      { input: '2000', expected: 2000 },
    ];

    testCases.forEach(({ input, expected }) => {
      const slowMo = parseInt(input || '0');
      expect(slowMo).toBe(expected);
    });
  });
});
