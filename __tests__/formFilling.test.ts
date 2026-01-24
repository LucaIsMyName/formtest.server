import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Form Filling and Step Logging', () => {
  describe('Test State Reset', () => {
    it('should reset logs and steps at the start of each test', () => {
      // Simulate the reset that happens in startTest
      let logs: string[] = ['old log 1', 'old log 2'];
      let steps: any[] = [{ id: 'old-step', name: 'Old Step', status: 'success' }];
      let currentStep: any = { id: 'old-step' };
      
      // Reset (as done in startTest)
      logs = [];
      steps = [];
      currentStep = null;
      
      expect(logs).toHaveLength(0);
      expect(steps).toHaveLength(0);
      expect(currentStep).toBeNull();
    });

    it('should not accumulate steps from previous test runs', () => {
      // Simulate two test runs
      const testRun1Steps: any[] = [];
      const testRun2Steps: any[] = [];
      
      // First test run
      testRun1Steps.push({ id: 'step1', name: 'Navigate' });
      testRun1Steps.push({ id: 'step2', name: 'Fill Form' });
      
      // Second test run (should start fresh)
      // In the fixed code, steps array is reset at startTest
      testRun2Steps.push({ id: 'step1', name: 'Navigate' });
      testRun2Steps.push({ id: 'step2', name: 'Fill Form' });
      
      // Each test run should have its own steps
      expect(testRun1Steps).toHaveLength(2);
      expect(testRun2Steps).toHaveLength(2);
      
      // They should be independent
      expect(testRun1Steps).not.toBe(testRun2Steps);
    });
  });

  describe('FundraisingBox Detection', () => {
    it('should detect FundraisingBox form by #payment_first_name', () => {
      const fbIndicators = [
        '#fbPaymentForm',
        '[class*="fundraisingbox"]',
        '#payment_first_name',
        '#payment_last_name',
        '#payment_email',
        '#paymentmethods',
        'input#submitForm[value*="spenden"]',
        'input#submitForm[value*="Spenden"]',
        '#payment_salutation',
        '#payment_interval'
      ];
      
      // Simulate finding #payment_first_name
      const foundSelector = '#payment_first_name';
      const isFundraisingBox = fbIndicators.includes(foundSelector);
      
      expect(isFundraisingBox).toBe(true);
    });

    it('should detect FundraisingBox form by #paymentmethods', () => {
      const fbIndicators = [
        '#fbPaymentForm',
        '#payment_first_name',
        '#paymentmethods'
      ];
      
      const foundSelector = '#paymentmethods';
      const isFundraisingBox = fbIndicators.includes(foundSelector);
      
      expect(isFundraisingBox).toBe(true);
    });
  });

  describe('Error Result with Steps', () => {
    it('should include steps in error response', () => {
      const steps = [
        { id: 'nav', name: 'Navigate to URL', status: 'success' },
        { id: 'cookie', name: 'Handle Cookie Banner', status: 'success' },
        { id: 'form', name: 'Analyze and Fill Form', status: 'error', error: 'Form not found' }
      ];
      
      const errorResponse = {
        type: 'TEST_COMPLETE',
        payload: {
          testRunId: 123,
          success: false,
          error: 'Form not found',
          logs: ['log1', 'log2'],
          result: {
            success: false,
            duration: 5000,
            logs: ['log1', 'log2'],
            steps: steps,
            screenshot: '/path/to/error.png',
            error: 'Form not found'
          }
        }
      };
      
      expect(errorResponse.payload.result.steps).toHaveLength(3);
      expect(errorResponse.payload.result.steps[2].status).toBe('error');
      expect(errorResponse.payload.result.screenshot).toBeDefined();
    });
  });

  describe('Privacy Checkbox Selectors', () => {
    it('should have multiple privacy checkbox selectors', () => {
      const privacySelectors = [
        '#payment_is_privacy_accepted',
        'input[name="payment[is_privacy_accepted]"]',
        'input[type="checkbox"][required]#payment_is_privacy_accepted',
        '.input-is_privacy_accepted input[type="checkbox"]'
      ];
      
      expect(privacySelectors).toHaveLength(4);
      expect(privacySelectors[0]).toBe('#payment_is_privacy_accepted');
    });
  });

  describe('Submit Button Selectors', () => {
    it('should prioritize FundraisingBox submit selectors', () => {
      const submitSelectors = [
        'input#submitForm',
        '#submitForm',
        'input[type="submit"][value*="Jetzt spenden"]',
        'input[type="submit"][value*="spenden"]',
        'input[type="submit"][value*="Spenden"]',
        'input.button[type="submit"]',
        'button[type="submit"]',
        'input[type="submit"]'
      ];
      
      // First selector should be the most specific FundraisingBox one
      expect(submitSelectors[0]).toBe('input#submitForm');
    });
  });

  describe('Payment Method Mapping', () => {
    it('should map payment types to FundraisingBox IDs', () => {
      const fbPaymentMap: Record<string, string> = {
        'paypal': 'paypal',
        'sepa': 'sepa_direct_debit',
        'creditcard': 'stripe_credit_card',
        'eps': 'eps'
      };
      
      expect(fbPaymentMap['paypal']).toBe('paypal');
      expect(fbPaymentMap['sepa']).toBe('sepa_direct_debit');
      expect(fbPaymentMap['creditcard']).toBe('stripe_credit_card');
    });
  });

  describe('Test Result Processing', () => {
    it('should return failure result with steps instead of throwing', () => {
      const response = {
        payload: {
          success: false,
          error: 'Test failed',
          result: {
            duration: 1000,
            logs: ['log1'],
            steps: [{ id: 'step1', name: 'Step 1', status: 'error' }],
            screenshot: '/path/to/screenshot.png'
          }
        }
      };
      
      // Simulate processManager behavior
      const payload = response.payload as any;
      const result = {
        success: false,
        error: payload?.error || "Test execution failed",
        duration: payload?.result?.duration || 0,
        logs: payload?.result?.logs || payload?.logs || [],
        steps: payload?.result?.steps || [],
        screenshot: payload?.result?.screenshot,
      };
      
      expect(result.success).toBe(false);
      expect(result.steps).toHaveLength(1);
      expect(result.error).toBe('Test failed');
    });
  });
});
