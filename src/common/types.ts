export interface Form {
  id: number;
  name: string;
  url: string;
  hash?: string | null;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethodDetails {
  // PayPal
  email?: string;
  
  // SEPA
  iban?: string;
  bic?: string;
  
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
  type: 'paypal' | 'sepa' | 'creditcard' | 'eps';
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
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
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
  formId: number;
  paymentMethodId: number;
  status: 'SUCCESS' | 'FAILURE' | 'SKIPPED' | 'RUNNING';
  errorMessage?: string;
  screenshotPath?: string;
  logDetails?: string;
  steps?: TestStep[];
  durationMs?: number;
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
  retries: number;
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
    settings?: GlobalSetting[];
  };
}

export interface ImportOptions {
  includeForms: boolean;
  includePaymentMethods: boolean;
  includeTestRuns: boolean;
  includeSettings: boolean;
}

export interface ImportResult {
  success: boolean;
  imported: {
    forms: number;
    paymentMethods: number;
    testRuns: number;
    settings: number;
  };
  skipped: {
    forms: number;
    paymentMethods: number;
    testRuns: number;
    settings: number;
  };
  errors: string[];
  warnings: string[];
}
