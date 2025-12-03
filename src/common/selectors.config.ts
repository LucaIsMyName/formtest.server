/**
 * Centralized Selector Configuration
 * 
 * This file contains all hardcoded selectors used by the test runner.
 * These serve as defaults that can be overridden by:
 * 1. Per-form field mappings (highest priority)
 * 2. Global selector overrides in Settings (medium priority)
 * 3. These defaults (lowest priority)
 */

export interface SelectorCategory {
  [key: string]: string[];
}

export interface FieldPurposePattern {
  pattern: RegExp;
  purpose: string;
  confidence: number;
}

export interface SelectorConfig {
  // Form detection patterns
  formDetection: {
    fundraisingBox: string[];
    genericForm: string[];
  };

  // Cookie consent handling
  cookieConsent: {
    banners: string[];
    acceptButtons: string[];
  };

  // Iframe detection for embedded forms
  iframeDetection: string[];

  // Form field selectors (defaults)
  formFields: {
    amount: string[];
    customAmount: string[];
    interval: string[];
    salutation: string[];
    firstName: string[];
    lastName: string[];
    email: string[];
    country: string[];
    privacy: string[];
    newsletter: string[];
    birthday: string[];
    phone: string[];
    address: string[];
    city: string[];
    zipCode: string[];
  };

  // Payment method selectors
  paymentMethods: {
    sepa: string[];
    creditcard: string[];
    paypal: string[];
    eps: string[];
  };

  // Payment field selectors
  paymentFields: {
    // SEPA
    iban: string[];
    accountHolder: string[];
    // Credit Card
    cardNumber: string[];
    cardHolder: string[];
    expiryDate: string[];
    cvv: string[];
    // EPS
    bankSelect: string[];
  };

  // Submit button selectors
  submitButtons: string[];

  // Success detection patterns
  successPatterns: {
    redirectUrls: string[];
    successMessages: string[];
    successSelectors: string[];
  };

  // Field purpose detection patterns (regex)
  fieldPurposePatterns: FieldPurposePattern[];

  // Payment type to FundraisingBox ID mapping
  paymentTypeMapping: Record<string, string>;

  // Default values for test data
  defaultValues: {
    country: string;
    salutation: string;
    testIban: string;
    testCardNumber: string;
    testCvv: string;
    testExpiryDate: string;
    bankCode: string;
    bankName: string;
  };
}

export const SELECTOR_CONFIG: SelectorConfig = {
  // Form detection patterns
  formDetection: {
    fundraisingBox: [
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
    ],
    genericForm: [
      'form[action*="donate"]',
      'form[action*="spenden"]',
      'form[id*="donation"]',
      'form[class*="donation"]'
    ]
  },

  // Cookie consent handling
  cookieConsent: {
    banners: [
      '#ccm-widget',
      '.ccm-modal',
      '[class*="cookie"]',
      '[id*="cookie"]',
      '#onetrust-consent-sdk',
      '.cookie-banner',
      '.cookie-consent',
      '#cookiebanner',
      '[data-testid="cookie-banner"]'
    ],
    acceptButtons: [
      'button[data-full-consent="true"]',
      'button:has-text("Alles annehmen")',
      'button:has-text("Alle akzeptieren")',
      'button:has-text("Accept All")',
      'button:has-text("Akzeptieren")',
      '.ccm--save-settings[data-full-consent="true"]',
      '[data-testid="accept-all"]',
      '[data-cy="accept-all"]',
      '#accept-all-cookies',
      '.accept-cookies',
      'button[class*="accept"]'
    ]
  },

  // Iframe detection for embedded forms
  iframeDetection: [
    'iframe[src*="fundraisingbox"]',
    'iframe[src*="secure.fundraisingbox.com"]',
    'iframe#fundraisingbox',
    'iframe[name*="fundraising"]',
    'iframe[src*="spenden"]',
    'iframe[src*="donation"]',
    'iframe[src*="payment"]'
  ],

  // Form field selectors (defaults)
  formFields: {
    amount: [
      '#payment_amount_suggestion-0',
      '#payment_amount_suggestion-1',
      '#payment_amount_suggestion-2',
      'label.choice input[name="amountChoice"]',
      '.choices-grid label.choice:first-child',
      'input[name*="amount"]',
      '[data-field="amount"]'
    ],
    customAmount: [
      '#payment_customAmount',
      'input[name*="customAmount"]',
      'input[name*="custom_amount"]',
      'input[type="number"][name*="amount"]'
    ],
    interval: [
      '#payment_interval',
      'select[name*="interval"]',
      'select[name*="frequency"]',
      '[data-field="interval"]'
    ],
    salutation: [
      '#payment_salutation',
      'select[name*="salutation"]',
      'select[name*="anrede"]',
      'select[name*="title"]'
    ],
    firstName: [
      '#payment_first_name',
      'input[name*="first_name"]',
      'input[name*="firstname"]',
      'input[name*="vorname"]',
      'input[placeholder*="Vorname"]',
      '[data-field="firstName"]'
    ],
    lastName: [
      '#payment_last_name',
      'input[name*="last_name"]',
      'input[name*="lastname"]',
      'input[name*="nachname"]',
      'input[placeholder*="Nachname"]',
      '[data-field="lastName"]'
    ],
    email: [
      '#payment_email',
      'input[type="email"]',
      'input[name*="email"]',
      'input[name*="mail"]',
      'input[placeholder*="E-Mail"]',
      '[data-field="email"]'
    ],
    country: [
      '#payment_donation_custom_field_8542',
      '#payment_country',
      'select[name*="country"]',
      'select[name*="land"]',
      '[data-field="country"]'
    ],
    privacy: [
      '#payment_is_privacy_accepted',
      'input[name="payment[is_privacy_accepted]"]',
      'input[type="checkbox"][required]#payment_is_privacy_accepted',
      '.input-is_privacy_accepted input[type="checkbox"]',
      'input[name*="privacy"]',
      'input[name*="datenschutz"]',
      '[data-field="privacy"]'
    ],
    newsletter: [
      '#payment_donation_custom_field_8543_Nein',
      'input[name="payment[donation_custom_field_8543]"][value="Nein"]',
      'input[type="radio"][value="Nein"]',
      'input[name*="newsletter"]',
      '[data-field="newsletter"]'
    ],
    birthday: [
      '#payment_birthday',
      'input[name*="birthday"]',
      'input[name*="geburt"]',
      'input[type="date"]',
      '[data-field="birthday"]'
    ],
    phone: [
      '#payment_phone',
      'input[type="tel"]',
      'input[name*="phone"]',
      'input[name*="telefon"]',
      'input[placeholder*="Telefon"]',
      '[data-field="phone"]'
    ],
    address: [
      '#payment_address',
      'input[name*="address"]',
      'input[name*="street"]',
      'input[name*="strasse"]',
      'input[name*="adresse"]',
      '[data-field="address"]'
    ],
    city: [
      '#payment_city',
      'input[name*="city"]',
      'input[name*="stadt"]',
      'input[name*="ort"]',
      '[data-field="city"]'
    ],
    zipCode: [
      '#payment_zip',
      'input[name*="zip"]',
      'input[name*="plz"]',
      'input[name*="postal"]',
      '[data-field="zipCode"]'
    ]
  },

  // Payment method selectors
  paymentMethods: {
    sepa: [
      '#paymentmethods label[for="sepa_direct_debit"]',
      '#paymentmethods input#sepa_direct_debit',
      'label.paymentmethod[for="sepa_direct_debit"]',
      'input[name="paymentmethods"][id="sepa_direct_debit"]',
      '[data-payment="sepa"]',
      'input[value*="sepa"]'
    ],
    creditcard: [
      '#paymentmethods label[for="stripe_credit_card"]',
      '#paymentmethods input#stripe_credit_card',
      'label.paymentmethod[for="stripe_credit_card"]',
      'input[name="paymentmethods"][id="stripe_credit_card"]',
      '[data-payment="creditcard"]',
      '[data-payment="credit_card"]',
      'input[value*="credit"]',
      'input[value*="card"]'
    ],
    paypal: [
      '#paymentmethods label[for="paypal"]',
      '#paymentmethods input#paypal',
      'label.paymentmethod[for="paypal"]',
      'input[name="paymentmethods"][id="paypal"]',
      '[data-payment="paypal"]',
      'input[value*="paypal"]'
    ],
    eps: [
      '#paymentmethods label[for="eps"]',
      '#paymentmethods input#eps',
      'label.paymentmethod[for="eps"]',
      'input[name="paymentmethods"][id="eps"]',
      '[data-payment="eps"]',
      'input[value*="eps"]'
    ]
  },

  // Payment field selectors
  paymentFields: {
    // SEPA
    iban: [
      '#payment_bank_iban',
      'input[name*="bank_iban"]',
      'input[name*="iban"]',
      'input[placeholder*="IBAN"]',
      '[data-field="iban"]'
    ],
    accountHolder: [
      '#payment_bank_account_owner',
      'input[name*="bank_account_owner"]',
      'input[name*="account"][name*="holder"]',
      'input[name*="kontoinhaber"]',
      'input[placeholder*="Kontoinhaber"]',
      '[data-field="accountHolder"]'
    ],
    // Credit Card
    cardNumber: [
      '#cardnumber',
      'input[name*="card"][name*="number"]',
      'input[placeholder*="Kartennummer"]',
      'input[placeholder*="Card number"]',
      '[data-field="cardNumber"]'
    ],
    cardHolder: [
      'input[name*="card"][name*="holder"]',
      'input[name*="owner"]',
      'input[placeholder*="Karteninhaber"]',
      'input[placeholder*="Card holder"]',
      '[data-field="cardHolder"]'
    ],
    expiryDate: [
      'input[name*="expiry"]',
      'input[name*="expire"]',
      'input[placeholder*="MM/YY"]',
      'input[placeholder*="MM/YYYY"]',
      '[data-field="expiryDate"]'
    ],
    cvv: [
      'input[name*="cvv"]',
      'input[name*="cvc"]',
      'input[placeholder*="CVV"]',
      'input[placeholder*="CVC"]',
      '[data-field="cvv"]'
    ],
    // EPS
    bankSelect: [
      '#payment_eps_bank',
      'select[name*="eps_bank"]',
      'select[name*="bank"]',
      'select[name*="eps"]',
      '[data-field="bankSelect"]'
    ]
  },

  // Submit button selectors
  submitButtons: [
    'input#submitForm',
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Spenden")',
    'button:has-text("Jetzt spenden")',
    'button:has-text("Donate")',
    'button:has-text("Weiter")',
    'button:has-text("Submit")',
    'button:has-text("Absenden")',
    'input[value*="Spenden"]',
    'input[value*="spenden"]',
    '[data-action="submit"]'
  ],

  // Success detection patterns
  // NOTE: Don't add the form's own domain here! The runner now requires
  // an actual URL CHANGE to a payment provider or success page.
  successPatterns: {
    redirectUrls: [
      // Payment providers (external redirects)
      'paypal.com',
      'stripe.com/pay',
      'checkout.stripe.com',
      'klarna.com',
      'sofort.com',
      'giropay.de',
      'eps-ueberweisung.at',
      // Success page paths (must be different from form URL)
      'secure.fundraisingbox.com/success',
      '/thank-you',
      '/danke',
      '/success',
      '/confirmation',
      '/vielen-dank',
      '/spende-abgeschlossen'
    ],
    successMessages: [
      'Vielen Dank',
      'Thank you',
      'Spende erfolgreich',
      'Donation successful',
      'Zahlung erfolgreich',
      'Payment successful',
      'Ihre Spende wurde',
      'Your donation has been',
      'Bestätigung',
      'Confirmation'
    ],
    successSelectors: [
      '.success-message',
      '.thank-you',
      '[data-testid="success"]',
      '.donation-success',
      '#success-page'
    ]
  },

  // Field purpose detection patterns (regex)
  fieldPurposePatterns: [
    { pattern: /email|e-mail|mail/i, purpose: 'email', confidence: 0.9 },
    { pattern: /firstname|vorname|first.name/i, purpose: 'firstName', confidence: 0.9 },
    { pattern: /lastname|nachname|last.name|surname|familienname/i, purpose: 'lastName', confidence: 0.9 },
    { pattern: /phone|telefon|tel|mobile|handy/i, purpose: 'phone', confidence: 0.8 },
    { pattern: /address|adresse|street|strasse|straße/i, purpose: 'address', confidence: 0.8 },
    { pattern: /city|stadt|ort/i, purpose: 'city', confidence: 0.8 },
    { pattern: /zip|plz|postal/i, purpose: 'zipCode', confidence: 0.8 },
    { pattern: /country|land|nation/i, purpose: 'country', confidence: 0.8 },
    { pattern: /amount|betrag|summe|spende/i, purpose: 'amount', confidence: 0.9 },
    { pattern: /iban/i, purpose: 'iban', confidence: 0.9 },
    { pattern: /bic|swift/i, purpose: 'bic', confidence: 0.9 },
    { pattern: /date|datum|birth|geburt/i, purpose: 'date', confidence: 0.8 },
    { pattern: /salutation|anrede|title/i, purpose: 'salutation', confidence: 0.8 }
  ],

  // Payment type to FundraisingBox ID mapping
  paymentTypeMapping: {
    'paypal': 'paypal',
    'sepa': 'sepa_direct_debit',
    'creditcard': 'stripe_credit_card',
    'credit_card': 'stripe_credit_card',
    'visa': 'stripe_credit_card',
    'mastercard': 'stripe_credit_card',
    'eps': 'eps'
  },

  // Default values for test data
  // use FBox defaults in the future!!!!
  defaultValues: {
    country: 'AT',
    salutation: 'Mr.',
    testIban: 'AT89370400440532013000',
    testCardNumber: '4111111111111111',
    testCvv: '123',
    testExpiryDate: '12/25',
    bankCode: 'ASPKAT2LXXX',
    bankName: 'Erste Bank und Sparkassen'
  }
};

// Type for selector override stored in database
export interface SelectorOverride {
  id: number;
  category: keyof SelectorConfig;
  key: string;
  selectors: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to merge configs (user overrides take priority)
export function mergeSelectorsConfig(
  baseConfig: SelectorConfig,
  overrides: SelectorOverride[]
): SelectorConfig {
  const merged = JSON.parse(JSON.stringify(baseConfig)) as SelectorConfig;

  for (const override of overrides) {
    if (!override.isActive) continue;

    const category = override.category as keyof SelectorConfig;
    const key = override.key;

    if (category in merged && typeof merged[category] === 'object') {
      const categoryObj = merged[category] as Record<string, unknown>;
      if (key in categoryObj && Array.isArray(categoryObj[key])) {
        // Prepend user selectors (they take priority)
        categoryObj[key] = [...override.selectors, ...(categoryObj[key] as string[])];
      }
    }
  }

  return merged;
}

// Helper to get all configurable categories for UI
export function getConfigurableCategories(): { category: string; keys: string[]; label: string }[] {
  return [
    {
      category: 'formFields',
      keys: Object.keys(SELECTOR_CONFIG.formFields),
      label: 'Formularfelder'
    },
    {
      category: 'paymentMethods',
      keys: Object.keys(SELECTOR_CONFIG.paymentMethods),
      label: 'Zahlungsmethoden'
    },
    {
      category: 'paymentFields',
      keys: Object.keys(SELECTOR_CONFIG.paymentFields),
      label: 'Zahlungsfelder'
    },
    {
      category: 'cookieConsent',
      keys: Object.keys(SELECTOR_CONFIG.cookieConsent),
      label: 'Cookie-Zustimmung'
    },
    {
      category: 'successPatterns',
      keys: Object.keys(SELECTOR_CONFIG.successPatterns),
      label: 'Erfolgs-Erkennung'
    },
    {
      category: 'formDetection',
      keys: Object.keys(SELECTOR_CONFIG.formDetection),
      label: 'Formular-Erkennung'
    }
  ];
}
