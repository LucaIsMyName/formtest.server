import { describe, it, expect, beforeEach } from 'vitest';

// Mock TestRunner class for testing step functionality
class MockTestRunner {
  constructor() {
    this.steps = [];
    this.currentStep = null;
    this.logs = [];
  }

  log(message, metadata = {}) {
    this.logs.push({ message, metadata, timestamp: new Date().toISOString() });
  }

  startStep(stepId, stepName, metadata = {}) {
    const step = {
      id: stepId,
      name: stepName,
      status: 'running',
      startTime: new Date().toISOString(),
      metadata
    };
    
    this.steps.push(step);
    this.currentStep = step;
    this.log(`STEP_START: ${stepName}`, { stepId, metadata });
    return step;
  }

  completeStep(stepId, status = 'success', message = '', metadata = {}) {
    const step = this.steps.find(s => s.id === stepId);
    if (step) {
      step.status = status;
      step.endTime = new Date().toISOString();
      step.duration = new Date(step.endTime) - new Date(step.startTime);
      step.message = message;
      step.metadata = { ...step.metadata, ...metadata };
      
      this.log(`STEP_COMPLETE: ${step.name} - ${status}`, { 
        stepId, 
        duration: step.duration,
        message,
        metadata 
      });
    }
    
    if (this.currentStep?.id === stepId) {
      this.currentStep = null;
    }
  }

  failStep(stepId, error, metadata = {}) {
    const step = this.steps.find(s => s.id === stepId);
    if (step) {
      step.error = error;
    }
    this.completeStep(stepId, 'error', error, metadata);
  }

  skipStep(stepId, reason, metadata = {}) {
    this.completeStep(stepId, 'skipped', reason, metadata);
  }

  detectPaymentProvider(url) {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('paypal')) return 'PayPal';
    if (lowerUrl.includes('stripe')) return 'Stripe';
    if (lowerUrl.includes('klarna')) return 'Klarna';
    return 'Unknown';
  }
}

describe('Step Logging Functionality', () => {
  let runner;

  beforeEach(() => {
    runner = new MockTestRunner();
  });

  describe('Step Management', () => {
    it('should create a new step with correct properties', () => {
      const step = runner.startStep('test-step', 'Test Step', { testData: 'value' });

      expect(step).toMatchObject({
        id: 'test-step',
        name: 'Test Step',
        status: 'running',
        metadata: { testData: 'value' }
      });
      expect(step.startTime).toBeDefined();
      expect(runner.steps).toHaveLength(1);
      expect(runner.currentStep).toBe(step);
    });

    it('should complete a step successfully', () => {
      const step = runner.startStep('test-step', 'Test Step');
      
      // Wait a bit to ensure duration > 0
      setTimeout(() => {
        runner.completeStep('test-step', 'success', 'Step completed', { result: 'ok' });

        expect(step.status).toBe('success');
        expect(step.message).toBe('Step completed');
        expect(step.endTime).toBeDefined();
        expect(step.duration).toBeGreaterThan(0);
        expect(step.metadata.result).toBe('ok');
        expect(runner.currentStep).toBeNull();
      }, 10);
    });

    it('should fail a step with error', () => {
      const step = runner.startStep('test-step', 'Test Step');
      runner.failStep('test-step', 'Something went wrong', { errorCode: 500 });

      expect(step.status).toBe('error');
      expect(step.error).toBe('Something went wrong');
      expect(step.message).toBe('Something went wrong');
      expect(step.metadata.errorCode).toBe(500);
    });

    it('should skip a step with reason', () => {
      const step = runner.startStep('test-step', 'Test Step');
      runner.skipStep('test-step', 'Invalid configuration', { reason: 'config_invalid' });

      expect(step.status).toBe('skipped');
      expect(step.message).toBe('Invalid configuration');
      expect(step.metadata.reason).toBe('config_invalid');
    });
  });

  describe('Test Flow Steps', () => {
    it('should handle browser initialization step', () => {
      const step = runner.startStep('browser-init', 'Initialize Browser', {
        browserType: 'chromium',
        headless: false
      });

      runner.completeStep('browser-init', 'success', 'Browser initialized successfully');

      expect(step.name).toBe('Initialize Browser');
      expect(step.metadata.browserType).toBe('chromium');
      expect(step.metadata.headless).toBe(false);
      expect(step.status).toBe('success');
    });

    it('should handle page navigation step', () => {
      const step = runner.startStep('page-navigation', 'Navigate to URL', {
        url: 'https://example.com'
      });

      runner.completeStep('page-navigation', 'success', 'Page loaded in 1500ms', {
        loadTime: 1500,
        strategy: 'domcontentloaded'
      });

      expect(step.metadata.url).toBe('https://example.com');
      expect(step.metadata.loadTime).toBe(1500);
      expect(step.metadata.strategy).toBe('domcontentloaded');
    });

    it('should handle cookie consent step', () => {
      const step = runner.startStep('cookie-handling', 'Handle Cookie Banner');

      runner.completeStep('cookie-handling', 'success', 'Cookie banner accepted', {
        cookieBannerFound: true,
        action: 'accepted',
        buttonSelector: 'button[data-full-consent="true"]'
      });

      expect(step.metadata.cookieBannerFound).toBe(true);
      expect(step.metadata.action).toBe('accepted');
      expect(step.metadata.buttonSelector).toBe('button[data-full-consent="true"]');
    });

    it('should handle form analysis step', () => {
      const step = runner.startStep('form-analysis', 'Analyze Form Structure');

      runner.completeStep('form-analysis', 'success', 'Found 5 form fields', {
        fieldsFound: 5,
        formType: 'donation'
      });

      expect(step.metadata.fieldsFound).toBe(5);
      expect(step.metadata.formType).toBe('donation');
    });

    it('should handle validation step with invalid combination', () => {
      const step = runner.startStep('validation-check', 'Validate Form Data');

      runner.completeStep('validation-check', 'success', 'Invalid recurring payment combination detected', {
        isValid: false,
        validationRules: ['recurring_requires_sepa'],
        interval: 1,
        paymentMethod: 'credit_card'
      });

      expect(step.metadata.isValid).toBe(false);
      expect(step.metadata.validationRules).toContain('recurring_requires_sepa');
      expect(step.metadata.interval).toBe(1);
      expect(step.metadata.paymentMethod).toBe('credit_card');
    });

    it('should handle success detection step', () => {
      const step = runner.startStep('redirect-detection', 'Detect Payment Redirect');

      runner.completeStep('redirect-detection', 'success', 'Redirected to payment provider', {
        redirectUrl: 'https://paypal.com/checkout',
        paymentProvider: runner.detectPaymentProvider('https://paypal.com/checkout')
      });

      expect(step.metadata.redirectUrl).toBe('https://paypal.com/checkout');
      expect(step.metadata.paymentProvider).toBe('PayPal');
    });
  });

  describe('Payment Provider Detection', () => {
    it('should detect PayPal correctly', () => {
      expect(runner.detectPaymentProvider('https://paypal.com/checkout')).toBe('PayPal');
      expect(runner.detectPaymentProvider('https://www.paypal.com/webapps/mpp/home')).toBe('PayPal');
    });

    it('should detect Stripe correctly', () => {
      expect(runner.detectPaymentProvider('https://checkout.stripe.com/pay')).toBe('Stripe');
      expect(runner.detectPaymentProvider('https://js.stripe.com/v3/')).toBe('Stripe');
    });

    it('should detect Klarna correctly', () => {
      expect(runner.detectPaymentProvider('https://klarna.com/payments')).toBe('Klarna');
    });

    it('should return Unknown for unrecognized providers', () => {
      expect(runner.detectPaymentProvider('https://example.com/payment')).toBe('Unknown');
      expect(runner.detectPaymentProvider('https://custom-payment-gateway.com')).toBe('Unknown');
    });
  });

  describe('Step Logging Integration', () => {
    it('should log step start and completion', () => {
      runner.startStep('test-step', 'Test Step', { testData: 'value' });
      runner.completeStep('test-step', 'success', 'Completed successfully');

      expect(runner.logs).toHaveLength(2);
      expect(runner.logs[0].message).toBe('STEP_START: Test Step');
      expect(runner.logs[1].message).toBe('STEP_COMPLETE: Test Step - success');
    });

    it('should include metadata in logs', () => {
      runner.startStep('test-step', 'Test Step', { testData: 'value' });
      runner.completeStep('test-step', 'success', 'Done', { result: 'ok' });

      expect(runner.logs[0].metadata.stepId).toBe('test-step');
      expect(runner.logs[0].metadata.metadata.testData).toBe('value');
      expect(runner.logs[1].metadata.metadata.result).toBe('ok');
    });
  });

  describe('Complete Test Flow', () => {
    it('should handle a complete successful test flow', () => {
      // Browser initialization
      runner.startStep('browser-init', 'Initialize Browser', { browserType: 'chromium' });
      runner.completeStep('browser-init', 'success', 'Browser ready');

      // Page navigation
      runner.startStep('page-navigation', 'Navigate to URL', { url: 'https://example.com' });
      runner.completeStep('page-navigation', 'success', 'Page loaded', { loadTime: 1200 });

      // Cookie handling
      runner.startStep('cookie-handling', 'Handle Cookie Banner');
      runner.completeStep('cookie-handling', 'success', 'No cookie banner detected', { cookieBannerFound: false });

      // Form analysis
      runner.startStep('form-analysis', 'Analyze Form Structure');
      runner.completeStep('form-analysis', 'success', 'Found 4 form fields', { fieldsFound: 4 });

      // Payment selection
      runner.startStep('payment-selection', 'Select Payment Method', { paymentMethod: 'sepa' });
      runner.completeStep('payment-selection', 'success', 'Selected SEPA');

      // Validation
      runner.startStep('validation-check', 'Validate Form Data');
      runner.completeStep('validation-check', 'success', 'Validation passed', { isValid: true });

      // Form submission
      runner.startStep('form-submission', 'Submit Form');
      runner.completeStep('form-submission', 'success', 'Form submitted');

      // Success detection
      runner.startStep('redirect-detection', 'Detect Payment Redirect');
      runner.completeStep('redirect-detection', 'success', 'Redirected to payment provider');

      // Final confirmation
      runner.startStep('success-confirmation', 'Confirm Test Success');
      runner.completeStep('success-confirmation', 'success', 'Test completed successfully');

      expect(runner.steps).toHaveLength(9);
      expect(runner.steps.every(step => step.status === 'success')).toBe(true);
      expect(runner.steps.every(step => step.endTime)).toBe(true);
      expect(runner.steps.every(step => step.duration >= 0)).toBe(true);
    });

    it('should handle a test flow with validation failure', () => {
      // Start normal flow
      runner.startStep('browser-init', 'Initialize Browser');
      runner.completeStep('browser-init', 'success', 'Browser ready');

      runner.startStep('page-navigation', 'Navigate to URL');
      runner.completeStep('page-navigation', 'success', 'Page loaded');

      runner.startStep('form-analysis', 'Analyze Form Structure');
      runner.completeStep('form-analysis', 'success', 'Form analyzed');

      runner.startStep('payment-selection', 'Select Payment Method', { paymentMethod: 'credit_card' });
      runner.completeStep('payment-selection', 'success', 'Payment method selected');

      // Validation fails
      runner.startStep('validation-check', 'Validate Form Data');
      runner.completeStep('validation-check', 'success', 'Invalid recurring payment combination', {
        isValid: false,
        validationRules: ['recurring_requires_sepa']
      });

      // Skip submission steps
      runner.startStep('screenshot-capture', 'Capture Screenshot');
      runner.completeStep('screenshot-capture', 'success', 'Screenshot captured (test skipped)', {
        screenshotType: 'final_skipped'
      });

      expect(runner.steps).toHaveLength(6);
      expect(runner.steps.filter(step => step.status === 'success')).toHaveLength(6);
      
      const validationStep = runner.steps.find(step => step.id === 'validation-check');
      expect(validationStep.metadata.isValid).toBe(false);
    });
  });
});
