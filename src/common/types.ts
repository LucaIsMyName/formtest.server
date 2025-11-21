export interface Form {
  id: number;
  name: string;
  url: string;
  hash?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: number;
  name: string;
  type: 'paypal' | 'sepa' | 'creditcard' | 'eps';
  isActive: boolean;
  details: Record<string, any>; // Encrypted payment credentials
  createdAt: Date;
  updatedAt: Date;
}

export interface GlobalSetting {
  key: string;
  value: string;
  description: string;
}

export interface TestRun {
  id: number;
  formId: number;
  paymentMethodId: number;
  status: 'SUCCESS' | 'FAILURE' | 'SKIPPED' | 'RUNNING';
  errorMessage?: string;
  screenshotPath?: string;
  logDetails?: string;
  durationMs?: number;
  runAt: Date;
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
