import { chromium, firefox, webkit, Browser, BrowserContext, Page } from "playwright";
import type { Form, PaymentMethod } from "../common/types";
import { createFormAutomation, FormAnalysis } from "./formAutomation";

export interface TestConfig {
  headless: boolean;
  timeout: number;
  browser: "chromium" | "firefox" | "webkit";
  viewport: { width: number; height: number };
  defaultAmount: string;
  defaultInterval: string;
}

export interface TestResult {
  success: boolean;
  error?: string;
  screenshot?: string;
  duration: number;
  logs: string[];
  formData?: Record<string, any>;
}

export class FormTestRunner {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: TestConfig;
  private logs: string[] = [];

  constructor(config: TestConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    this.log("Initializing test runner...");

    try {
      // Launch browser based on config
      switch (this.config.browser) {
        case "chromium":
          this.browser = await chromium.launch({
            headless: this.config.headless,
            args: ["--disable-web-security", "--disable-features=VizDisplayCompositor"],
          });
          break;
        case "firefox":
          this.browser = await firefox.launch({ headless: this.config.headless });
          break;
        case "webkit":
          this.browser = await webkit.launch({ headless: this.config.headless });
          break;
        default:
          throw new Error(`Unsupported browser: ${this.config.browser}`);
      }

      // Create browser context
      this.context = await this.browser.newContext({
        viewport: this.config.viewport,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      });

      // Create page
      this.page = await this.context.newPage();

      // Set timeout
      this.page.setDefaultTimeout(this.config.timeout);

      this.log("Test runner initialized successfully");
    } catch (error) {
      this.log(`Failed to initialize test runner: ${error}`);
      throw error;
    }
  }

  async runFormTest(form: Form, paymentMethod: PaymentMethod): Promise<TestResult> {
    const startTime = Date.now();
    this.logs = [];

    try {
      if (!this.page) {
        throw new Error("Test runner not initialized");
      }

      this.log(`Starting test for form: ${form.name} with payment method: ${paymentMethod.name}`);

      // Navigate to form
      this.log(`Navigating to: ${form.url}`);
      await this.page.goto(form.url, { waitUntil: "networkidle" });

      // Take initial screenshot
      await this.page.screenshot({
        path: `screenshots/initial-${Date.now()}.png`,
        fullPage: true,
      });

      // Analyze and fill form with intelligent automation
      const formAnalysis = await this.fillFormData();

      // Handle payment method specific logic using form analysis
      await this.handlePaymentMethod(paymentMethod, formAnalysis);

      // Submit form (but don't actually complete payment)
      await this.submitForm();

      // Take final screenshot
      const finalScreenshotPath = `screenshots/final-${Date.now()}.png`;
      await this.page.screenshot({
        path: finalScreenshotPath,
        fullPage: true,
      });

      const duration = Date.now() - startTime;
      this.log(`Test completed successfully in ${duration}ms`);

      return {
        success: true,
        duration,
        logs: [...this.logs],
        screenshot: finalScreenshotPath,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.log(`Test failed: ${errorMessage}`);

      // Take error screenshot
      let errorScreenshot: string | undefined;
      try {
        if (this.page) {
          errorScreenshot = `screenshots/error-${Date.now()}.png`;
          await this.page.screenshot({
            path: errorScreenshot,
            fullPage: true,
          });
        }
      } catch (screenshotError) {
        this.log(`Failed to take error screenshot: ${screenshotError}`);
      }

      return {
        success: false,
        error: errorMessage,
        duration,
        logs: [...this.logs],
        screenshot: errorScreenshot,
      };
    }
  }

  private async fillFormData(): Promise<FormAnalysis> {
    if (!this.page) throw new Error("Page not available");

    this.log("Analyzing and filling form intelligently...");

    // Create form automation tools
    const { detector, filler } = createFormAutomation(this.page, "de");

    // Analyze the form structure
    const analysis = await detector.analyzeForm();
    this.log(`Form analysis complete: Found ${analysis.fields.length} fields, payment methods: ${analysis.detectedPaymentMethods.join(", ")}`);

    // Prepare custom data based on config
    const customData = {
      amount: this.config.defaultAmount,
      betrag: this.config.defaultAmount,
      spende: this.config.defaultAmount,
      interval: this.config.defaultInterval,
      zahlungsintervall: this.config.defaultInterval,
    };

    // Fill the form intelligently
    await filler.fillFormIntelligently(analysis.fields, customData);

    this.log("Intelligent form filling completed");
    return analysis;
  }

  private async tryFillField(selector: string, value: string): Promise<void> {
    if (!this.page) return;

    try {
      const element = await this.page.$(selector);
      if (element) {
        await element.fill(value);
        this.log(`Filled field ${selector} with: ${value}`);
      }
    } catch (error) {
      this.log(`Could not fill field ${selector}: ${error}`);
    }
  }

  private async handlePaymentMethod(paymentMethod: PaymentMethod, formAnalysis: FormAnalysis): Promise<void> {
    if (!this.page) throw new Error("Page not available");

    this.log(`Handling payment method: ${paymentMethod.type}`);
    this.log(`Form has payment section: ${formAnalysis.hasPaymentSection}`);
    this.log(`Detected payment methods: ${formAnalysis.detectedPaymentMethods.join(", ")}`);

    // Check if the form supports this payment method
    if (formAnalysis.hasPaymentSection && !formAnalysis.detectedPaymentMethods.includes(paymentMethod.type)) {
      this.log(`Warning: Payment method ${paymentMethod.type} not detected in form`);
    }

    switch (paymentMethod.type) {
      case "paypal":
        await this.handlePayPal(paymentMethod);
        break;
      case "sepa":
        await this.handleSEPA(paymentMethod);
        break;
      case "creditcard":
        await this.handleCreditCard(paymentMethod);
        break;
      case "eps":
        await this.handleEPS(paymentMethod);
        break;
      default:
        throw new Error(`Unsupported payment method: ${paymentMethod.type}`);
    }
  }

  private async handlePayPal(_paymentMethod: PaymentMethod): Promise<void> {
    this.log("Selecting PayPal payment method");

    // Try to select PayPal option
    await this.tryClickElement('input[value*="paypal"], button[data-payment*="paypal"]');

    // PayPal usually redirects to their site, so we'll stop here for testing
    this.log("PayPal payment method selected");
  }

  private async handleSEPA(paymentMethod: PaymentMethod): Promise<void> {
    this.log("Handling SEPA payment method");

    // Select SEPA option
    await this.tryClickElement('input[value*="sepa"], input[value*="lastschrift"]');

    // Fill SEPA details
    const details = paymentMethod.details as any;
    if (details.iban) {
      await this.tryFillField('input[name*="iban"], input[id*="iban"]', details.iban);
    }
    if (details.bic) {
      await this.tryFillField('input[name*="bic"], input[id*="bic"]', details.bic);
    }

    this.log("SEPA details filled");
  }

  private async handleCreditCard(_paymentMethod: PaymentMethod): Promise<void> {
    this.log("Handling Credit Card payment method");

    // Select credit card option
    await this.tryClickElement('input[value*="credit"], input[value*="karte"]');

    // Note: Credit card fields are often in iframes (Stripe, etc.)
    // This would need more sophisticated handling in a real implementation
    this.log("Credit card payment method selected");
  }

  private async handleEPS(paymentMethod: PaymentMethod): Promise<void> {
    this.log("Handling EPS payment method");

    // Select EPS option
    await this.tryClickElement('input[value*="eps"]');

    // Select bank if specified
    const details = paymentMethod.details as any;
    if (details.bankCode) {
      await this.tryFillField('select[name*="bank"], select[id*="bank"]', details.bankCode);
    }

    this.log("EPS payment method configured");
  }

  private async tryClickElement(selector: string): Promise<void> {
    if (!this.page) return;

    try {
      const element = await this.page.$(selector);
      if (element) {
        await element.click();
        this.log(`Clicked element: ${selector}`);
      }
    } catch (error) {
      this.log(`Could not click element ${selector}: ${error}`);
    }
  }

  private async submitForm(): Promise<void> {
    if (!this.page) throw new Error("Page not available");

    this.log("Looking for submit button...");

    // Try different submit button selectors
    const submitSelectors = ['button[type="submit"]', 'input[type="submit"]', 'button:has-text("Spenden")', 'button:has-text("Jetzt spenden")', 'button:has-text("Weiter")', ".submit-button", "#submit"];

    for (const selector of submitSelectors) {
      try {
        const button = await this.page.$(selector);
        if (button && (await button.isVisible())) {
          this.log(`Found submit button: ${selector}`);

          // Don't actually click to avoid real transactions
          // await button.click()
          this.log("Submit button found but not clicked (test mode)");
          return;
        }
      } catch (error) {
        continue;
      }
    }

    this.log("No submit button found");
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    this.logs.push(logMessage);
    console.log(logMessage);
  }

  async cleanup(): Promise<void> {
    this.log("Cleaning up test runner...");

    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }

      if (this.context) {
        await this.context.close();
        this.context = null;
      }

      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }

      this.log("Test runner cleaned up");
    } catch (error) {
      this.log(`Error during cleanup: ${error}`);
    }
  }
}

// Factory function to create test runner with settings from database
export async function createTestRunner(settings?: Record<string, string>): Promise<FormTestRunner> {
  const config: TestConfig = {
    headless: settings?.headless_mode === "true",
    timeout: parseInt(settings?.test_timeout || "30000"),
    browser: "chromium", // Default to chromium
    viewport: { width: 1280, height: 720 },
    defaultAmount: settings?.default_donation_amount || "5",
    defaultInterval: settings?.default_interval || "0",
  };

  return new FormTestRunner(config);
}
