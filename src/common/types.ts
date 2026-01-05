export type FieldMappingAction = "type" | "click" | "select" | "check" | "waitAndClick";

export type FieldMappingType = "amount" | "customAmount" | "interval" | "firstName" | "lastName" | "email" | "salutation" | "country" | "paymentMethod" | "checkbox" | "radio" | "iban" | "accountHolder" | "birthday" | "street" | "city" | "zip" | "phone" | "title" | "company" | "custom";

/**
 * Global default field values that override Faker.js but are overridden by form-specific mappings.
 * Priority: Form Mapping > Global Default > Faker.js
 */
export interface GlobalFieldDefaults {
  firstName?: string;
  lastName?: string;
  email?: string;
  salutation?: string;
  country?: string;
  birthday?: string;
  street?: string;
  city?: string;
  zip?: string;
  phone?: string;
  title?: string;
  company?: string;
  iban?: string;
  accountHolder?: string;
  // Allow custom fields
  [key: string]: string | undefined;
}

export interface FormFieldMapping {
  id: string; // UUID
  fieldType: FieldMappingType; // Type of field
  selector: string; // CSS selector
  value?: string; // Override faker value (optional)
  action: FieldMappingAction; // Action to perform
  waitMs?: number; // Wait before action (for dynamic content)
  description?: string; // User note
}

export interface Form {
  id: number;
  name: string;
  url: string;
  hash?: string | null;
  icon?: string;
  isActive: boolean;
  fieldMappings?: FormFieldMapping[]; // Custom field mappings for this form
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethodDetails {
  // PayPal
  email?: string;

  // SEPA
  iban?: string;
  bic?: string; // Optional - kept for other form providers
  accountHolder?: string; // Kontoinhaber - required for FundraisingBox SEPA

  // Credit Card
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;

  // EPS
  bankCode?: string;

  // Common
  [key: string]: any;
}

export interface PaymentMethod {
  id: number;
  name: string;
  type: "paypal" | "sepa" | "creditcard" | "eps";
  icon?: string;
  isActive: boolean;
  details: PaymentMethodDetails; // Encrypted JSON data
  createdAt: Date;
  updatedAt: Date;
}

export interface GlobalSetting {
  key: string;
  value: string;
  description: string;
}

export interface TestStep {
  id: string;
  name: string;
  status: "pending" | "running" | "success" | "error" | "skipped" | "stopped";
  startTime: string;
  endTime?: string;
  duration?: number;
  message?: string;
  metadata?: Record<string, any>;
  error?: string;
}

export interface TestRun {
  id: number;
  uuid: string;
  formId: number | null;  // Can be null if form was deleted (orphaned test for archive)
  paymentMethodId: number | null;  // Can be null if payment method was deleted (orphaned test for archive)
  status: "SUCCESS" | "FAILURE" | "SKIPPED" | "RUNNING" | "STOPPED" | "QUEUED";
  errorMessage?: string;
  screenshotPath?: string;
  logDetails?: string;
  steps?: TestStep[];
  durationMs?: number;
  isScheduled?: boolean;
  notes?: string;
  amount?: string;    // Test amount in EUR
  interval?: string;  // Test interval (0=one-time, 1=monthly, etc.)
  // Quality test results (optional, stored as JSON)
  seoResults?: SeoTestResult;
  accessibilityResults?: AccessibilityTestResult;
  runAt: Date;
}

export interface TestSchedule {
  id: number;
  name: string;
  formId: number;
  paymentMethodId: number;
  cronExpression: string;
  isActive: boolean;
  icon?: string;
  lastRun?: Date;
  nextRun?: Date; // Computed property, not in DB
  // Quality test options for scheduled tests
  enableSeoTest?: boolean;
  enableAccessibilityTest?: boolean;
  createdAt: Date;
}

export interface FormSelectors {
  amount: string[];
  customAmount: string[];
  interval: string[];
  salutation: string[];
  firstName: string[];
  lastName: string[];
  email: string[];
  country: string[];
  paymentMethods: Record<string, string[]>;
}

export interface TestConfig {
  headless: boolean;
  timeout: number;
  number: number;
  parallel: boolean;
}

export interface UserData {
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  birthday?: string;
  company?: string;
}

export interface ExportData {
  version: string;
  exportedAt: string;
  schemaVersion: number;
  data: {
    forms?: Form[];
    paymentMethods?: PaymentMethod[];
    testRuns?: TestRun[];
    testSchedules?: TestSchedule[];
    settings?: GlobalSetting[];
  };
}

export interface ImportOptions {
  includeForms: boolean;
  includePaymentMethods: boolean;
  includeTestRuns: boolean;
  includeSchedules: boolean;
  includeSettings: boolean;
}

export interface ImportResult {
  success: boolean;
  imported: {
    forms: number;
    paymentMethods: number;
    testRuns: number;
    schedules: number;
    settings: number;
  };
  skipped: {
    forms: number;
    paymentMethods: number;
    testRuns: number;
    schedules: number;
    settings: number;
  };
  errors: string[];
  warnings: string[];
}

// ============================================
// Custom Scripts Types
// ============================================

/**
 * Hook points where custom scripts can be executed during a test run.
 * Scripts are executed in order at each hook point.
 */
export type ScriptHookPoint =
  | "before_navigation"    // Before page.goto()
  | "after_navigation"     // After page loads
  | "before_cookie_banner" // Before cookie handling
  | "after_cookie_banner"  // After cookie handling
  | "before_form_fill"     // Before form analysis and filling
  | "after_form_fill"      // After fields are filled
  | "before_payment"       // Before payment method selection
  | "after_payment"        // After payment method handling
  | "before_submit"        // Before form submission
  | "after_submit"         // After submission
  | "on_success"           // On successful redirect detection
  | "on_error";            // When any error occurs

/**
 * Custom script definition
 */
export interface CustomScript {
  id: number;
  name: string;
  description?: string;
  code: string;
  hookPoint: ScriptHookPoint;
  isActive: boolean;
  isGlobal: boolean;        // If true, runs for all forms
  stopOnError: boolean;     // If true, test fails when script fails
  timeout: number;          // Max execution time in ms
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Junction table for form-specific script assignments
 */
export interface FormScript {
  id: number;
  formId: number;
  scriptId: number;
  executionOrder: number;   // Order of execution at the hook point
}

/**
 * Result of a custom script execution
 */
export interface ScriptExecutionResult {
  scriptId: number;
  scriptName: string;
  hookPoint: ScriptHookPoint;
  success: boolean;
  duration: number;
  error?: string;
  logs: string[];
}

/**
 * Validation result for script code
 */
export interface ScriptValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================
// SEO & Accessibility Quality Tests Types
// ============================================

/**
 * Options for enabling quality tests during a test run
 */
export interface QualityTestOptions {
  enableSeoTest: boolean;
  enableAccessibilityTest: boolean;
}

/**
 * Individual SEO issue found during analysis
 */
export interface SeoIssue {
  type: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  element?: string; // CSS selector or element description
}

/**
 * SEO analysis result
 */
export interface SeoTestResult {
  score: number; // 0-100
  issues: SeoIssue[];
  passedChecks: string[];
  metadata: {
    title?: string;
    description?: string;
    h1Count: number;
    imgCount: number;
    imgWithoutAlt: number;
    hasViewport: boolean;
    hasCanonical: boolean;
    hasOpenGraph: boolean;
  };
}

/**
 * Individual accessibility violation node
 */
export interface AccessibilityViolationNode {
  html: string;
  target: string[];
  failureSummary?: string;
}

/**
 * Individual accessibility violation
 */
export interface AccessibilityViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  nodes: AccessibilityViolationNode[];
}

/**
 * Accessibility analysis result (WCAG 2.1 Level AA)
 */
export interface AccessibilityTestResult {
  score: number; // 0-100
  violations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  metadata: {
    wcagLevel: 'A' | 'AA' | 'AAA';
    totalChecks: number;
  };
}

// ============================================
// AI Types
// ============================================

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'ollama';

export interface AISettings {
  enabled: boolean;
  provider: AIProvider;
  apiKey: string;
  model: string;
  ollamaBaseUrl?: string;
}

export interface AIChat {
  id: number;
  title: string;
  context?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  id: number;
  chatId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: string | null;
  createdAt: Date;
}

export interface AIContextData {
  forms: { id: number; name: string; url: string; isActive: boolean }[];
  paymentMethods: { id: number; name: string; type: string; isActive: boolean }[];
  recentTests: {
    total: number;
    success: number;
    failed: number;
    successRate: number;
  };
  schedules: { id: number; name: string; isActive: boolean; cronExpression: string }[];
}
