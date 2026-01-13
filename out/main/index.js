"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const Database = require("better-sqlite3");
const crypto = require("crypto");
const keytar = require("keytar");
const fs = require("fs");
const child_process = require("child_process");
const events = require("events");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const http = require("http");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const keytar__namespace = /* @__PURE__ */ _interopNamespaceDefault(keytar);
const cron__namespace = /* @__PURE__ */ _interopNamespaceDefault(cron);
const SERVICE_NAME = "FormTestServer";
const ACCOUNT_NAME = "payment-encryption-key";
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH$1 = 32;
const IV_LENGTH = 16;
const SALT_LENGTH$1 = 64;
async function getEncryptionKey() {
  try {
    const existingKey = await keytar__namespace.getPassword(SERVICE_NAME, ACCOUNT_NAME);
    if (existingKey) {
      console.log("Encryption: Using existing encryption key from keychain");
      return Buffer.from(existingKey, "hex");
    }
    console.log("Encryption: Generating new encryption key");
    const newKey = crypto.randomBytes(KEY_LENGTH$1);
    await keytar__namespace.setPassword(SERVICE_NAME, ACCOUNT_NAME, newKey.toString("hex"));
    console.log("Encryption: New key stored in keychain");
    return newKey;
  } catch (error) {
    console.error("Encryption: Failed to access keychain:", error);
    throw new Error("Failed to initialize encryption key");
  }
}
async function encrypt(plaintext) {
  try {
    const plaintextStr = typeof plaintext === "string" ? plaintext : JSON.stringify(plaintext);
    const masterKey = await getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH$1);
    const key = crypto.scryptSync(masterKey, salt, KEY_LENGTH$1);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintextStr, "utf8", "base64");
    encrypted += cipher.final("base64");
    const authTag = cipher.getAuthTag();
    const result = [
      iv.toString("base64"),
      authTag.toString("base64"),
      salt.toString("base64"),
      encrypted
    ].join(":");
    return result;
  } catch (error) {
    console.error("Encryption: Failed to encrypt data:", error);
    throw new Error("Encryption failed");
  }
}
async function decrypt(encryptedData) {
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 4) {
      throw new Error("Invalid encrypted data format");
    }
    const [ivBase64, authTagBase64, saltBase64, ciphertext] = parts;
    const iv = Buffer.from(ivBase64, "base64");
    const authTag = Buffer.from(authTagBase64, "base64");
    const salt = Buffer.from(saltBase64, "base64");
    const masterKey = await getEncryptionKey();
    const key = crypto.scryptSync(masterKey, salt, KEY_LENGTH$1);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(ciphertext, "base64", "utf8");
    decrypted += decipher.final("utf8");
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    console.error("Encryption: Failed to decrypt data:", error);
    throw new Error("Decryption failed");
  }
}
function isEncrypted(data) {
  if (typeof data !== "string") return false;
  const parts = data.split(":");
  return parts.length === 4;
}
const SELECTOR_CONFIG = {
  // Form detection patterns
  formDetection: {
    fundraisingBox: [
      "#fbPaymentForm",
      '[class*="fundraisingbox"]',
      "#payment_first_name",
      "#payment_last_name",
      "#payment_email",
      "#paymentmethods",
      'input#submitForm[value*="spenden"]',
      'input#submitForm[value*="Spenden"]',
      "#payment_salutation",
      "#payment_interval"
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
      "#ccm-widget",
      ".ccm-modal",
      '[class*="cookie"]',
      '[id*="cookie"]',
      "#onetrust-consent-sdk",
      ".cookie-banner",
      ".cookie-consent",
      "#cookiebanner",
      '[data-testid="cookie-banner"]',
      // Usercentrics Consent Management Platform
      "#uc-center-container",
      '[data-testid="uc-default-wall"]',
      '[id*="uc-"]',
      '[data-testid*="uc-"]'
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
      "#accept-all-cookies",
      ".accept-cookies",
      'button[class*="accept"]',
      // Usercentrics Consent Management Platform
      '[data-testid="uc-accept-all-button"]',
      'button[data-testid="uc-accept-all-button"]'
    ]
  },
  // Iframe detection for embedded forms
  iframeDetection: [
    'iframe[src*="fundraisingbox"]',
    'iframe[src*="secure.fundraisingbox.com"]',
    "iframe#fundraisingbox",
    'iframe[name*="fundraising"]',
    'iframe[src*="spenden"]',
    'iframe[src*="donation"]',
    'iframe[src*="payment"]'
  ],
  // Form field selectors (defaults)
  formFields: {
    amount: [
      "#payment_amount_suggestion-0",
      "#payment_amount_suggestion-1",
      "#payment_amount_suggestion-2",
      'label.choice input[name="amountChoice"]',
      ".choices-grid label.choice:first-child",
      'input[name*="amount"]',
      '[data-field="amount"]'
    ],
    customAmount: [
      "#payment_customAmount",
      'input[name*="customAmount"]',
      'input[name*="custom_amount"]',
      'input[type="number"][name*="amount"]'
    ],
    interval: [
      "#payment_interval",
      'select[name*="interval"]',
      'select[name*="frequency"]',
      '[data-field="interval"]'
    ],
    salutation: [
      "#payment_salutation",
      'select[name*="salutation"]',
      'select[name*="anrede"]',
      'select[name*="title"]'
    ],
    firstName: [
      "#payment_first_name",
      'input[name*="first_name"]',
      'input[name*="firstname"]',
      'input[name*="vorname"]',
      'input[placeholder*="Vorname"]',
      '[data-field="firstName"]'
    ],
    lastName: [
      "#payment_last_name",
      'input[name*="last_name"]',
      'input[name*="lastname"]',
      'input[name*="nachname"]',
      'input[placeholder*="Nachname"]',
      '[data-field="lastName"]'
    ],
    email: [
      "#payment_email",
      'input[type="email"]',
      'input[name*="email"]',
      'input[name*="mail"]',
      'input[placeholder*="E-Mail"]',
      '[data-field="email"]'
    ],
    country: [
      "#payment_donation_custom_field_8542",
      "#payment_country",
      'select[name*="country"]',
      'select[name*="land"]',
      '[data-field="country"]'
    ],
    privacy: [
      "#payment_is_privacy_accepted",
      'input[name="payment[is_privacy_accepted]"]',
      'input[type="checkbox"][required]#payment_is_privacy_accepted',
      '.input-is_privacy_accepted input[type="checkbox"]',
      'input[name*="privacy"]',
      'input[name*="datenschutz"]',
      '[data-field="privacy"]'
    ],
    newsletter: [
      "#payment_donation_custom_field_8543_Nein",
      'input[name="payment[donation_custom_field_8543]"][value="Nein"]',
      'input[type="radio"][value="Nein"]',
      'input[name*="newsletter"]',
      '[data-field="newsletter"]'
    ],
    birthday: [
      "#payment_birthday",
      'input[name*="birthday"]',
      'input[name*="geburt"]',
      'input[type="date"]',
      '[data-field="birthday"]'
    ],
    phone: [
      "#payment_phone",
      'input[type="tel"]',
      'input[name*="phone"]',
      'input[name*="telefon"]',
      'input[placeholder*="Telefon"]',
      '[data-field="phone"]'
    ],
    address: [
      "#payment_address",
      'input[name*="address"]',
      'input[name*="street"]',
      'input[name*="strasse"]',
      'input[name*="adresse"]',
      '[data-field="address"]'
    ],
    city: [
      "#payment_city",
      'input[name*="city"]',
      'input[name*="stadt"]',
      'input[name*="ort"]',
      '[data-field="city"]'
    ],
    zipCode: [
      "#payment_zip",
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
      "#paymentmethods input#sepa_direct_debit",
      'label.paymentmethod[for="sepa_direct_debit"]',
      'input[name="paymentmethods"][id="sepa_direct_debit"]',
      '[data-payment="sepa"]',
      'input[value*="sepa"]'
    ],
    creditcard: [
      '#paymentmethods label[for="stripe_credit_card"]',
      "#paymentmethods input#stripe_credit_card",
      'label.paymentmethod[for="stripe_credit_card"]',
      'input[name="paymentmethods"][id="stripe_credit_card"]',
      '[data-payment="creditcard"]',
      '[data-payment="credit_card"]',
      'input[value*="credit"]',
      'input[value*="card"]'
    ],
    paypal: [
      '#paymentmethods label[for="paypal"]',
      "#paymentmethods input#paypal",
      'label.paymentmethod[for="paypal"]',
      'input[name="paymentmethods"][id="paypal"]',
      '[data-payment="paypal"]',
      'input[value*="paypal"]'
    ],
    eps: [
      '#paymentmethods label[for="eps"]',
      "#paymentmethods input#eps",
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
      "#payment_bank_iban",
      'input[name*="bank_iban"]',
      'input[name*="iban"]',
      'input[placeholder*="IBAN"]',
      '[data-field="iban"]'
    ],
    accountHolder: [
      "#payment_bank_account_owner",
      'input[name*="bank_account_owner"]',
      'input[name*="account"][name*="holder"]',
      'input[name*="kontoinhaber"]',
      'input[placeholder*="Kontoinhaber"]',
      '[data-field="accountHolder"]'
    ],
    // Credit Card
    cardNumber: [
      "#cardnumber",
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
      "#payment_eps_bank",
      'select[name*="eps_bank"]',
      'select[name*="bank"]',
      'select[name*="eps"]',
      '[data-field="bankSelect"]'
    ]
  },
  // Submit button selectors
  submitButtons: [
    "input#submitForm",
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
      "paypal.com",
      "stripe.com/pay",
      "checkout.stripe.com",
      "klarna.com",
      "sofort.com",
      "giropay.de",
      "eps-ueberweisung.at",
      // Success page paths (must be different from form URL)
      "secure.fundraisingbox.com/success",
      "/thank-you",
      "/danke",
      "/success",
      "/confirmation",
      "/vielen-dank",
      "/spende-abgeschlossen"
    ],
    successMessages: [
      "Vielen Dank",
      "Thank you",
      "Spende erfolgreich",
      "Donation successful",
      "Zahlung erfolgreich",
      "Payment successful",
      "Ihre Spende wurde",
      "Your donation has been",
      "Bestätigung",
      "Confirmation"
    ],
    successSelectors: [
      ".success-message",
      ".thank-you",
      '[data-testid="success"]',
      ".donation-success",
      "#success-page"
    ]
  },
  // Field purpose detection patterns (regex)
  fieldPurposePatterns: [
    { pattern: /email|e-mail|mail/i, purpose: "email", confidence: 0.9 },
    { pattern: /firstname|vorname|first.name/i, purpose: "firstName", confidence: 0.9 },
    { pattern: /lastname|nachname|last.name|surname|familienname/i, purpose: "lastName", confidence: 0.9 },
    { pattern: /phone|telefon|tel|mobile|handy/i, purpose: "phone", confidence: 0.8 },
    { pattern: /address|adresse|street|strasse|straße/i, purpose: "address", confidence: 0.8 },
    { pattern: /city|stadt|ort/i, purpose: "city", confidence: 0.8 },
    { pattern: /zip|plz|postal/i, purpose: "zipCode", confidence: 0.8 },
    { pattern: /country|land|nation/i, purpose: "country", confidence: 0.8 },
    { pattern: /amount|betrag|summe|spende/i, purpose: "amount", confidence: 0.9 },
    { pattern: /iban/i, purpose: "iban", confidence: 0.9 },
    { pattern: /bic|swift/i, purpose: "bic", confidence: 0.9 },
    { pattern: /date|datum|birth|geburt/i, purpose: "date", confidence: 0.8 },
    { pattern: /salutation|anrede|title/i, purpose: "salutation", confidence: 0.8 }
  ],
  // Payment type to FundraisingBox ID mapping
  paymentTypeMapping: {
    "paypal": "paypal",
    "sepa": "sepa_direct_debit",
    "creditcard": "stripe_credit_card",
    "credit_card": "stripe_credit_card",
    "visa": "stripe_credit_card",
    "mastercard": "stripe_credit_card",
    "eps": "eps"
  },
  // Default values for test data
  // use FBox defaults in the future!!!!
  defaultValues: {
    country: "AT",
    salutation: "Mr.",
    testIban: "AT89370400440532013000",
    testCardNumber: "4111111111111111",
    testCvv: "123",
    testExpiryDate: "12/25",
    bankCode: "ASPKAT2LXXX",
    bankName: "Erste Bank und Sparkassen"
  }
};
function mergeSelectorsConfig(baseConfig, overrides) {
  const merged = JSON.parse(JSON.stringify(baseConfig));
  for (const override of overrides) {
    if (!override.isActive) continue;
    const category = override.category;
    const key = override.key;
    if (category in merged && typeof merged[category] === "object") {
      const categoryObj = merged[category];
      if (key in categoryObj && Array.isArray(categoryObj[key])) {
        categoryObj[key] = [...override.selectors, ...categoryObj[key]];
      }
    }
  }
  return merged;
}
function getConfigurableCategories() {
  return [
    {
      category: "formFields",
      keys: Object.keys(SELECTOR_CONFIG.formFields),
      label: "Formularfelder"
    },
    {
      category: "paymentMethods",
      keys: Object.keys(SELECTOR_CONFIG.paymentMethods),
      label: "Zahlungsmethoden"
    },
    {
      category: "paymentFields",
      keys: Object.keys(SELECTOR_CONFIG.paymentFields),
      label: "Zahlungsfelder"
    },
    {
      category: "cookieConsent",
      keys: Object.keys(SELECTOR_CONFIG.cookieConsent),
      label: "Cookie-Zustimmung"
    },
    {
      category: "successPatterns",
      keys: Object.keys(SELECTOR_CONFIG.successPatterns),
      label: "Erfolgs-Erkennung"
    },
    {
      category: "formDetection",
      keys: Object.keys(SELECTOR_CONFIG.formDetection),
      label: "Formular-Erkennung"
    }
  ];
}
let db;
function migrateTestRunUuid() {
  console.log("Database: Checking for test_runs UUID column...");
  try {
    const columns = db.prepare("PRAGMA table_info(test_runs)").all();
    const hasUuid = columns.some((col) => col.name === "uuid");
    if (!hasUuid) {
      console.log("Database: Adding uuid column to test_runs...");
      db.exec("ALTER TABLE test_runs ADD COLUMN uuid TEXT");
      const runs = db.prepare("SELECT id FROM test_runs WHERE uuid IS NULL").all();
      const updateStmt = db.prepare("UPDATE test_runs SET uuid = ? WHERE id = ?");
      let updatedCount = 0;
      db.transaction(() => {
        for (const run of runs) {
          updateStmt.run(crypto.randomUUID(), run.id);
          updatedCount++;
        }
      })();
      console.log(`Database: Added UUIDs to ${updatedCount} existing test runs`);
    }
    db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_test_runs_uuid ON test_runs(uuid)");
  } catch (error) {
    console.error("Database: UUID migration error:", error);
  }
}
function migrateTestRunSteps() {
  console.log("Database: Checking for test_runs steps column...");
  try {
    const columns = db.prepare("PRAGMA table_info(test_runs)").all();
    const hasSteps = columns.some((col) => col.name === "steps");
    if (!hasSteps) {
      console.log("Database: Adding steps column to test_runs...");
      db.exec("ALTER TABLE test_runs ADD COLUMN steps TEXT DEFAULT '[]'");
      const updateStmt = db.prepare("UPDATE test_runs SET steps = '[]' WHERE steps IS NULL");
      const result = updateStmt.run();
      console.log(`Database: Initialized steps column for ${result.changes} existing test runs`);
    }
  } catch (error) {
    console.error("Database: Steps migration error:", error);
  }
}
function migrateTestScheduleIcon() {
  console.log("Database: Checking for test_schedules icon column...");
  try {
    const columns = db.prepare("PRAGMA table_info(test_schedules)").all();
    const hasIcon = columns.some((col) => col.name === "icon");
    if (!hasIcon) {
      console.log("Database: Adding icon column to test_schedules...");
      db.exec("ALTER TABLE test_schedules ADD COLUMN icon TEXT DEFAULT 'Play'");
      const updateStmt = db.prepare("UPDATE test_schedules SET icon = 'Play' WHERE icon IS NULL");
      const result = updateStmt.run();
      console.log(`Database: Initialized icon column for ${result.changes} existing schedules`);
    }
  } catch (error) {
    console.error("Database: Schedule icon migration error:", error);
  }
}
function migrateTestRunNotes() {
  console.log("Database: Checking for test_runs notes column...");
  try {
    const columns = db.prepare("PRAGMA table_info(test_runs)").all();
    const hasNotes = columns.some((col) => col.name === "notes");
    if (!hasNotes) {
      console.log("Database: Adding notes column to test_runs...");
      db.exec("ALTER TABLE test_runs ADD COLUMN notes TEXT DEFAULT ''");
      const updateStmt = db.prepare("UPDATE test_runs SET notes = '' WHERE notes IS NULL");
      const result = updateStmt.run();
      console.log(`Database: Initialized notes column for ${result.changes} existing test runs`);
    }
  } catch (error) {
    console.error("Database: Test run notes migration error:", error);
  }
}
function migrateTestRunStoppedStatus() {
  console.log("Database: Checking for test_runs status constraint...");
  try {
    const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='test_runs'").get();
    const needsMigration = tableInfo && (!tableInfo.sql.includes("'STOPPED'") || !tableInfo.sql.includes("'QUEUED'"));
    if (needsMigration) {
      console.log("Database: Migrating test_runs table to add STOPPED/QUEUED status...");
      db.transaction(() => {
        db.exec(`
          CREATE TABLE test_runs_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT,
            formId INTEGER,
            paymentMethodId INTEGER,
            status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE', 'SKIPPED', 'RUNNING', 'STOPPED', 'QUEUED')),
            errorMessage TEXT,
            logDetails TEXT,
            steps TEXT DEFAULT '[]',
            durationMs INTEGER,
            isScheduled INTEGER DEFAULT 0,
            notes TEXT DEFAULT '',
            runAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (formId) REFERENCES forms (id) ON DELETE SET NULL,
            FOREIGN KEY (paymentMethodId) REFERENCES payment_methods (id) ON DELETE SET NULL
          );
        `);
        db.exec(`
          INSERT INTO test_runs_new (id, uuid, formId, paymentMethodId, status, errorMessage, logDetails, steps, durationMs, isScheduled, notes, runAt)
          SELECT id, uuid, formId, paymentMethodId, status, errorMessage, logDetails, steps, durationMs, isScheduled, notes, runAt
          FROM test_runs;
        `);
        db.exec(`
          DROP TABLE test_runs;
          ALTER TABLE test_runs_new RENAME TO test_runs;
        `);
        db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_test_runs_uuid ON test_runs(uuid)");
      })();
      console.log("Database: Successfully migrated test_runs table to support STOPPED/QUEUED status");
    } else {
      console.log("Database: test_runs table already supports all statuses");
    }
  } catch (error) {
    console.error("Database: Status migration error:", error);
  }
}
function migrateTestRunScheduled() {
  console.log("Database: Checking for test_runs isScheduled column...");
  try {
    const columns = db.prepare("PRAGMA table_info(test_runs)").all();
    const hasIsScheduled = columns.some((col) => col.name === "isScheduled");
    if (!hasIsScheduled) {
      console.log("Database: Adding isScheduled column to test_runs...");
      db.exec("ALTER TABLE test_runs ADD COLUMN isScheduled INTEGER DEFAULT 0");
      const updateStmt = db.prepare("UPDATE test_runs SET isScheduled = 0 WHERE isScheduled IS NULL");
      const result = updateStmt.run();
      console.log(`Database: Initialized isScheduled column for ${result.changes} existing test runs`);
    }
  } catch (error) {
    console.error("Database: Test run scheduled migration error:", error);
  }
}
function migrateTestRunAmountInterval() {
  console.log("Database: Checking for test_runs amount/interval columns...");
  try {
    const columns = db.prepare("PRAGMA table_info(test_runs)").all();
    const hasAmount = columns.some((col) => col.name === "amount");
    const hasInterval = columns.some((col) => col.name === "interval");
    if (!hasAmount) {
      console.log("Database: Adding amount column to test_runs...");
      db.exec("ALTER TABLE test_runs ADD COLUMN amount TEXT");
      console.log("Database: Amount column added to test_runs");
    }
    if (!hasInterval) {
      console.log("Database: Adding interval column to test_runs...");
      db.exec("ALTER TABLE test_runs ADD COLUMN interval TEXT");
      console.log("Database: Interval column added to test_runs");
    }
  } catch (error) {
    console.error("Database: Test run amount/interval migration error:", error);
  }
}
function migrateCustomScripts() {
  console.log("Database: Checking for custom_scripts tables...");
  try {
    const customScriptsExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='custom_scripts'"
    ).get();
    if (!customScriptsExists) {
      console.log("Database: Creating custom_scripts table...");
      db.exec(`
        CREATE TABLE custom_scripts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          code TEXT NOT NULL,
          hookPoint TEXT NOT NULL CHECK (hookPoint IN (
            'before_navigation', 'after_navigation',
            'before_cookie_banner', 'after_cookie_banner',
            'before_form_fill', 'after_form_fill',
            'before_payment', 'after_payment',
            'before_submit', 'after_submit',
            'on_success', 'on_error'
          )),
          isActive INTEGER DEFAULT 1,
          isGlobal INTEGER DEFAULT 0,
          stopOnError INTEGER DEFAULT 0,
          timeout INTEGER DEFAULT 30000,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX idx_custom_scripts_hook ON custom_scripts(hookPoint);
        CREATE INDEX idx_custom_scripts_active ON custom_scripts(isActive);
        CREATE INDEX idx_custom_scripts_global ON custom_scripts(isGlobal);
      `);
      console.log("Database: custom_scripts table created");
    }
    const formScriptsExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='form_scripts'"
    ).get();
    if (!formScriptsExists) {
      console.log("Database: Creating form_scripts table...");
      db.exec(`
        CREATE TABLE form_scripts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          formId INTEGER NOT NULL,
          scriptId INTEGER NOT NULL,
          executionOrder INTEGER DEFAULT 0,
          FOREIGN KEY (formId) REFERENCES forms(id) ON DELETE CASCADE,
          FOREIGN KEY (scriptId) REFERENCES custom_scripts(id) ON DELETE CASCADE,
          UNIQUE(formId, scriptId)
        );
        
        CREATE INDEX idx_form_scripts_form ON form_scripts(formId);
        CREATE INDEX idx_form_scripts_script ON form_scripts(scriptId);
      `);
      console.log("Database: form_scripts table created");
    }
    console.log("Database: Custom scripts migration complete");
  } catch (error) {
    console.error("Database: Custom scripts migration error:", error);
  }
}
function migrateQualityTestResults() {
  console.log("Database: Checking for quality test results columns...");
  try {
    const columns = db.prepare("PRAGMA table_info(test_runs)").all();
    const hasSeoResults = columns.some((col) => col.name === "seoResults");
    const hasA11yResults = columns.some((col) => col.name === "accessibilityResults");
    if (!hasSeoResults) {
      console.log("Database: Adding seoResults column to test_runs...");
      db.exec("ALTER TABLE test_runs ADD COLUMN seoResults TEXT");
      console.log("Database: seoResults column added to test_runs");
    }
    if (!hasA11yResults) {
      console.log("Database: Adding accessibilityResults column to test_runs...");
      db.exec("ALTER TABLE test_runs ADD COLUMN accessibilityResults TEXT");
      console.log("Database: accessibilityResults column added to test_runs");
    }
  } catch (error) {
    console.error("Database: Quality test results migration error:", error);
  }
}
function migrateScheduleQualityOptions() {
  console.log("Database: Checking for schedule quality test options columns...");
  try {
    const columns = db.prepare("PRAGMA table_info(test_schedules)").all();
    const hasEnableSeoTest = columns.some((col) => col.name === "enableSeoTest");
    const hasEnableA11yTest = columns.some((col) => col.name === "enableAccessibilityTest");
    if (!hasEnableSeoTest) {
      console.log("Database: Adding enableSeoTest column to test_schedules...");
      db.exec("ALTER TABLE test_schedules ADD COLUMN enableSeoTest INTEGER DEFAULT 0");
      console.log("Database: enableSeoTest column added to test_schedules");
    }
    if (!hasEnableA11yTest) {
      console.log("Database: Adding enableAccessibilityTest column to test_schedules...");
      db.exec("ALTER TABLE test_schedules ADD COLUMN enableAccessibilityTest INTEGER DEFAULT 0");
      console.log("Database: enableAccessibilityTest column added to test_schedules");
    }
  } catch (error) {
    console.error("Database: Schedule quality options migration error:", error);
  }
}
function migrateAIChatTables() {
  console.log("Database: Checking for AI chat tables...");
  try {
    const aiChatsExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='ai_chats'"
    ).get();
    if (!aiChatsExists) {
      console.log("Database: Creating ai_chats table...");
      db.exec(`
        CREATE TABLE ai_chats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL DEFAULT 'Neuer Chat',
          context TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX idx_ai_chats_created ON ai_chats(createdAt);
      `);
      console.log("Database: ai_chats table created");
    }
    const aiMessagesExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='ai_messages'"
    ).get();
    if (!aiMessagesExists) {
      console.log("Database: Creating ai_messages table...");
      db.exec(`
        CREATE TABLE ai_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          chatId INTEGER NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
          content TEXT NOT NULL,
          metadata TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (chatId) REFERENCES ai_chats(id) ON DELETE CASCADE
        );
        
        CREATE INDEX idx_ai_messages_chat ON ai_messages(chatId);
        CREATE INDEX idx_ai_messages_created ON ai_messages(createdAt);
      `);
      console.log("Database: ai_messages table created");
    }
    console.log("Database: AI chat tables migration complete");
  } catch (error) {
    console.error("Database: AI chat tables migration error:", error);
  }
}
function migrateFormFieldMappings() {
  console.log("Database: Checking for forms fieldMappings column...");
  try {
    const columns = db.prepare("PRAGMA table_info(forms)").all();
    const hasFieldMappings = columns.some((col) => col.name === "fieldMappings");
    if (!hasFieldMappings) {
      console.log("Database: Adding fieldMappings column to forms...");
      db.exec("ALTER TABLE forms ADD COLUMN fieldMappings TEXT DEFAULT '[]'");
      const updateStmt = db.prepare("UPDATE forms SET fieldMappings = '[]' WHERE fieldMappings IS NULL");
      const result = updateStmt.run();
      console.log(`Database: Initialized fieldMappings column for ${result.changes} existing forms`);
    }
  } catch (error) {
    console.error("Database: Form fieldMappings migration error:", error);
  }
}
function migrateIconColumns() {
  console.log("Database: Checking for icon columns...");
  try {
    const formsInfo = db.prepare("PRAGMA table_info(forms)").all();
    const hasFormsIcon = formsInfo.some((col) => col.name === "icon");
    if (!hasFormsIcon) {
      console.log("Database: Adding icon column to forms...");
      db.exec("ALTER TABLE forms ADD COLUMN icon TEXT DEFAULT 'FileText'");
      console.log("Database: Icon column added to forms");
    }
    const pmInfo = db.prepare("PRAGMA table_info(payment_methods)").all();
    const hasPmIcon = pmInfo.some((col) => col.name === "icon");
    if (!hasPmIcon) {
      console.log("Database: Adding icon column to payment_methods...");
      db.exec("ALTER TABLE payment_methods ADD COLUMN icon TEXT");
      db.exec(`
        UPDATE payment_methods 
        SET icon = CASE 
          WHEN type = 'paypal' THEN 'CreditCard'
          WHEN type = 'sepa' THEN 'Building2'
          WHEN type = 'creditcard' THEN 'CreditCard'
          WHEN type = 'eps' THEN 'Landmark'
          ELSE 'CreditCard'
        END
        WHERE icon IS NULL
      `);
      console.log("Database: Icon column added to payment_methods with default values");
    }
    console.log("Database: Icon columns migration complete");
  } catch (error) {
    console.error("Database: Icon migration error:", error);
  }
}
async function migratePaymentMethodEncryption() {
  console.log("Database: Checking for unencrypted payment methods...");
  try {
    const methods = db.prepare("SELECT id, details FROM payment_methods").all();
    let migratedCount = 0;
    for (const method of methods) {
      if (!isEncrypted(method.details)) {
        console.log(`Database: Migrating payment method ${method.id} to encrypted format`);
        try {
          const detailsObj = JSON.parse(method.details);
          const encryptedDetails = await encrypt(detailsObj);
          db.prepare("UPDATE payment_methods SET details = ? WHERE id = ?").run(encryptedDetails, method.id);
          migratedCount++;
        } catch (error) {
          console.error(`Database: Failed to migrate payment method ${method.id}:`, error);
        }
      }
    }
    if (migratedCount > 0) {
      console.log(`Database: Successfully migrated ${migratedCount} payment method(s) to encrypted format`);
    } else {
      console.log("Database: No unencrypted payment methods found");
    }
  } catch (error) {
    console.error("Database: Error during payment method migration:", error);
    throw error;
  }
}
function initDatabase() {
  console.log("=== INITIALIZING DATABASE ===");
  const dbPath = path.join(electron.app.getPath("userData"), "formtest.db");
  console.log("Database: Path:", dbPath);
  try {
    db = new Database(dbPath);
    console.log("Database: SQLite connection established");
    db.pragma("foreign_keys = ON");
    console.log("Database: Foreign key constraints enabled");
    db.pragma("journal_mode = WAL");
    console.log("Database: WAL mode enabled");
  } catch (dbError) {
    console.error("Database: Failed to create SQLite connection:", dbError);
    throw dbError;
  }
  db.exec(`
    CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      hash TEXT,
      icon TEXT DEFAULT 'FileText',
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('paypal', 'sepa', 'creditcard', 'eps')),
      icon TEXT,
      isActive BOOLEAN DEFAULT 1,
      details TEXT NOT NULL, -- JSON string with encrypted credentials
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS global_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS test_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT,
      formId INTEGER,
      paymentMethodId INTEGER,
      status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE', 'SKIPPED', 'RUNNING', 'STOPPED', 'QUEUED')),
      errorMessage TEXT,
      logDetails TEXT,
      durationMs INTEGER,
      runAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (formId) REFERENCES forms (id) ON DELETE SET NULL,
      FOREIGN KEY (paymentMethodId) REFERENCES payment_methods (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS test_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      formId INTEGER NOT NULL,
      paymentMethodId INTEGER NOT NULL,
      cronExpression TEXT NOT NULL,
      isActive BOOLEAN DEFAULT 1,
      lastRun DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (formId) REFERENCES forms (id) ON DELETE CASCADE,
      FOREIGN KEY (paymentMethodId) REFERENCES payment_methods (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('test_complete', 'test_failed', 'info')),
      title TEXT NOT NULL,
      message TEXT,
      testRunId INTEGER,
      isRead BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (testRunId) REFERENCES test_runs (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_test_runs_form ON test_runs(formId);
    CREATE INDEX IF NOT EXISTS idx_test_runs_payment ON test_runs(paymentMethodId);
    CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(isRead);
    CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(createdAt);

    CREATE TABLE IF NOT EXISTS selector_overrides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      key TEXT NOT NULL,
      selectors TEXT NOT NULL,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category, key)
    );

    CREATE INDEX IF NOT EXISTS idx_selector_overrides_category ON selector_overrides(category);
    CREATE INDEX IF NOT EXISTS idx_selector_overrides_active ON selector_overrides(isActive);
  `);
  try {
    const backupExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='test_runs_backup'").get();
    if (backupExists) {
      console.log("Database: Restoring test_runs data from backup...");
      const backupInfo = db.prepare("PRAGMA table_info(test_runs_backup)").all();
      const backupHasUuid = backupInfo.some((col) => col.name === "uuid");
      if (backupHasUuid) {
        db.exec(`
          INSERT INTO test_runs SELECT * FROM test_runs_backup;
          DROP TABLE test_runs_backup;
        `);
      } else {
        db.exec(`
          INSERT INTO test_runs (id, formId, paymentMethodId, status, errorMessage, logDetails, durationMs, runAt)
          SELECT id, formId, paymentMethodId, status, errorMessage, logDetails, durationMs, runAt 
          FROM test_runs_backup;
          DROP TABLE test_runs_backup;
        `);
      }
      console.log("Database: Successfully restored test_runs data and cleaned up backup");
    }
  } catch (error) {
    console.log("Database: No backup to restore");
  }
  const defaultSettings = [
    { key: "default_donation_amount", value: "5", description: "Default donation amount in EUR" },
    { key: "default_interval", value: "0", description: "Default donation interval (0=once, 1=monthly)" },
    { key: "test_timeout", value: "30000", description: "Test timeout in milliseconds" },
    { key: "headless_mode", value: "true", description: "Run tests in headless mode" },
    { key: "slow_motion", value: "0", description: "Slow motion delay in ms (0=off, 500=slow, 1000=very slow)" },
    { key: "theme", value: "system", description: "UI theme preference (system, light, dark)" },
    { key: "test_retention_days", value: "365", description: "Number of days to keep test runs (0=forever)" }
  ];
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO global_settings (key, value, description) 
    VALUES (?, ?, ?)
  `);
  for (const setting of defaultSettings) {
    insertSetting.run(setting.key, setting.value, setting.description);
  }
  console.log("Database: Tables created and default settings inserted");
  migrateTestRunUuid();
  migrateTestRunSteps();
  migrateTestRunScheduled();
  migrateTestRunNotes();
  migrateTestRunStoppedStatus();
  migrateTestScheduleIcon();
  migrateIconColumns();
  migrateFormFieldMappings();
  migrateTestRunAmountInterval();
  migrateCustomScripts();
  migrateQualityTestResults();
  migrateScheduleQualityOptions();
  migrateAIChatTables();
  migratePaymentMethodEncryption().catch((error) => {
    console.error("Database: Failed to migrate payment methods:", error);
  });
  migrateTestRunsToAllowOrphaned();
  migrateRemoveScreenshotColumn();
  migrateTestRunArchiving();
  migrateTestRunTags();
  migrateTagDefinitions();
  migrateFilterPresets();
  cleanupOldTestRuns();
  console.log("Database: Initialization complete");
}
function migrateTestRunsToAllowOrphaned() {
  console.log("Database: Checking for test_runs orphaned support migration...");
  try {
    const columns = db.prepare("PRAGMA table_info(test_runs)").all();
    const formIdColumn = columns.find((col) => col.name === "formId");
    const paymentMethodIdColumn = columns.find((col) => col.name === "paymentMethodId");
    const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='test_runs'").get();
    const hasSetNull = tableInfo?.sql.includes("ON DELETE SET NULL");
    const hasCascade = tableInfo?.sql.includes("ON DELETE CASCADE");
    const needsMigration = hasCascade || !hasSetNull || formIdColumn?.notnull === 1 || paymentMethodIdColumn?.notnull === 1;
    if (needsMigration) {
      console.log("Database: Migrating test_runs table to allow orphaned tests (SET NULL)...");
      db.exec(`
        CREATE TABLE IF NOT EXISTS test_runs_backup_orphaned AS SELECT * FROM test_runs;
      `);
      db.exec(`
        CREATE TABLE test_runs_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uuid TEXT,
          formId INTEGER,
          paymentMethodId INTEGER,
          status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE', 'SKIPPED', 'RUNNING', 'STOPPED', 'QUEUED')),
          errorMessage TEXT,
          logDetails TEXT,
          steps TEXT DEFAULT '[]',
          durationMs INTEGER,
          isScheduled INTEGER DEFAULT 0,
          notes TEXT DEFAULT '',
          runAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          amount TEXT,
          interval TEXT,
          seoResults TEXT,
          accessibilityResults TEXT,
          FOREIGN KEY (formId) REFERENCES forms (id) ON DELETE SET NULL,
          FOREIGN KEY (paymentMethodId) REFERENCES payment_methods (id) ON DELETE SET NULL
        );
      `);
      db.exec(`
        INSERT INTO test_runs_new (
          id, uuid, formId, paymentMethodId, status, errorMessage, logDetails, 
          steps, durationMs, isScheduled, notes, runAt, amount, interval, seoResults, accessibilityResults
        )
        SELECT 
          id, uuid, formId, paymentMethodId, status, errorMessage, logDetails,
          steps, durationMs, isScheduled, notes, runAt, amount, interval, seoResults, accessibilityResults
        FROM test_runs;
      `);
      db.exec(`
        DROP TABLE test_runs;
        ALTER TABLE test_runs_new RENAME TO test_runs;
      `);
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_test_runs_form ON test_runs(formId);
        CREATE INDEX IF NOT EXISTS idx_test_runs_payment ON test_runs(paymentMethodId);
        CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_test_runs_uuid ON test_runs(uuid);
      `);
      db.exec(`DROP TABLE IF EXISTS test_runs_backup_orphaned;`);
      console.log("Database: Successfully migrated test_runs to support orphaned tests");
    } else {
      console.log("Database: test_runs already supports orphaned tests");
    }
  } catch (error) {
    console.error("Database: Error migrating test_runs for orphaned support:", error);
  }
}
function migrateRemoveScreenshotColumn() {
  console.log("Database: Checking for screenshotPath column removal...");
  try {
    const columns = db.prepare("PRAGMA table_info(test_runs)").all();
    const hasScreenshotPath = columns.some((col) => col.name === "screenshotPath");
    if (hasScreenshotPath) {
      console.log("Database: Migrating test_runs table to remove screenshotPath column...");
      db.exec(`
        CREATE TABLE IF NOT EXISTS test_runs_backup_screenshot AS SELECT * FROM test_runs;
      `);
      const allColumns = columns.map((col) => col.name).filter((name) => name !== "screenshotPath");
      const columnList = allColumns.join(", ");
      const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='test_runs'").get();
      if (tableInfo) {
        let newTableSql = tableInfo.sql.replace(/screenshotPath\s+TEXT,?\s*/gi, "");
        newTableSql = newTableSql.replace(/CREATE TABLE\s+"?test_runs"?/i, "CREATE TABLE test_runs_new");
        db.exec(newTableSql);
        db.exec(`
          INSERT INTO test_runs_new (${columnList})
          SELECT ${columnList}
          FROM test_runs;
        `);
        db.exec(`
          DROP TABLE test_runs;
          ALTER TABLE test_runs_new RENAME TO test_runs;
        `);
        db.exec(`
          CREATE INDEX IF NOT EXISTS idx_test_runs_form ON test_runs(formId);
          CREATE INDEX IF NOT EXISTS idx_test_runs_payment ON test_runs(paymentMethodId);
          CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
          CREATE UNIQUE INDEX IF NOT EXISTS idx_test_runs_uuid ON test_runs(uuid);
        `);
        db.exec(`DROP TABLE IF EXISTS test_runs_backup_screenshot;`);
        console.log("Database: Successfully removed screenshotPath column from test_runs");
      }
    } else {
      console.log("Database: screenshotPath column already removed");
    }
  } catch (error) {
    console.error("Database: Error removing screenshotPath column:", error);
  }
}
function migrateTestRunArchiving() {
  console.log("Database: Checking for test_runs isArchived column...");
  try {
    const columns = db.prepare("PRAGMA table_info(test_runs)").all();
    const hasIsArchived = columns.some((col) => col.name === "isArchived");
    if (!hasIsArchived) {
      console.log("Database: Adding isArchived column to test_runs...");
      db.exec("ALTER TABLE test_runs ADD COLUMN isArchived INTEGER DEFAULT 0");
      const updateStmt = db.prepare("UPDATE test_runs SET isArchived = 0 WHERE isArchived IS NULL");
      const result = updateStmt.run();
      console.log(`Database: Initialized isArchived column for ${result.changes} existing test runs`);
    }
  } catch (error) {
    console.error("Database: Test run archiving migration error:", error);
  }
}
function migrateTestRunTags() {
  console.log("Database: Checking for test_runs tags column...");
  try {
    const columns = db.prepare("PRAGMA table_info(test_runs)").all();
    const hasTags = columns.some((col) => col.name === "tags");
    if (!hasTags) {
      console.log("Database: Adding tags column to test_runs...");
      db.exec("ALTER TABLE test_runs ADD COLUMN tags TEXT DEFAULT '[]'");
      const updateStmt = db.prepare("UPDATE test_runs SET tags = '[]' WHERE tags IS NULL");
      const result = updateStmt.run();
      console.log(`Database: Initialized tags column for ${result.changes} existing test runs`);
    }
  } catch (error) {
    console.error("Database: Test run tags migration error:", error);
  }
}
function migrateTagDefinitions() {
  console.log("Database: Checking for tag_definitions table...");
  try {
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='tag_definitions'").get();
    if (!tableExists) {
      console.log("Database: Creating tag_definitions table...");
      db.exec(`
        CREATE TABLE tag_definitions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          color TEXT DEFAULT '#3B82F6',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("Database: Created tag_definitions table");
    }
  } catch (error) {
    console.error("Database: Tag definitions migration error:", error);
  }
}
function migrateFilterPresets() {
  console.log("Database: Checking for filter_presets table...");
  try {
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='filter_presets'").get();
    if (!tableExists) {
      console.log("Database: Creating filter_presets table...");
      db.exec(`
        CREATE TABLE filter_presets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          filterConfig TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("Database: Created filter_presets table");
    }
  } catch (error) {
    console.error("Database: Filter presets migration error:", error);
  }
}
function cleanupOldTestRuns() {
  try {
    const retentionSetting = db.prepare(
      "SELECT value FROM global_settings WHERE key = 'test_retention_days'"
    ).get();
    const retentionDays = parseInt(retentionSetting?.value || "365");
    if (retentionDays <= 0) {
      console.log("Database: Test retention disabled (0 days), skipping cleanup");
      return 0;
    }
    const cutoffDate = /* @__PURE__ */ new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffDateStr = cutoffDate.toISOString();
    console.log(`Database: Cleaning up test runs older than ${retentionDays} days (before ${cutoffDateStr})`);
    const result = db.prepare(
      "DELETE FROM test_runs WHERE runAt < ?"
    ).run(cutoffDateStr);
    if (result.changes > 0) {
      console.log(`Database: Deleted ${result.changes} old test run(s)`);
    } else {
      console.log("Database: No old test runs to clean up");
    }
    return result.changes;
  } catch (error) {
    console.error("Database: Error cleaning up old test runs:", error);
    return 0;
  }
}
function getDatabase() {
  return db;
}
const formQueries = {
  getAll: () => {
    const forms = db.prepare("SELECT * FROM forms ORDER BY name").all();
    return forms.map((form) => ({
      ...form,
      isActive: Boolean(form.isActive),
      fieldMappings: form.fieldMappings ? JSON.parse(form.fieldMappings) : [],
      createdAt: new Date(form.createdAt),
      updatedAt: new Date(form.updatedAt)
    }));
  },
  getById: (id) => {
    const form = db.prepare("SELECT * FROM forms WHERE id = ?").get(id);
    if (!form) return void 0;
    return {
      ...form,
      isActive: Boolean(form.isActive),
      fieldMappings: form.fieldMappings ? JSON.parse(form.fieldMappings) : [],
      createdAt: new Date(form.createdAt),
      updatedAt: new Date(form.updatedAt)
    };
  },
  create: (form) => {
    console.log("Database: Creating form with raw data:", JSON.stringify(form, null, 2));
    console.log("Database: Form data types:", {
      name: typeof form.name,
      url: typeof form.url,
      hash: typeof form.hash,
      isActive: typeof form.isActive
    });
    let name = "";
    let url = "";
    let hash = null;
    let isActive = 0;
    try {
      if (form.name === null || form.name === void 0) {
        name = "";
      } else {
        name = String(form.name).trim();
      }
      if (form.url === null || form.url === void 0) {
        url = "";
      } else {
        url = String(form.url).trim();
      }
      if (form.hash === null || form.hash === void 0 || form.hash === "") {
        hash = null;
      } else {
        const hashStr = String(form.hash).trim();
        hash = hashStr === "" ? null : hashStr;
      }
      const isActiveValue = form.isActive;
      if (isActiveValue === true || isActiveValue === 1 || isActiveValue === "1" || isActiveValue === "true") {
        isActive = 1;
      } else {
        isActive = 0;
      }
      console.log("Database: Final sanitized values:", { name, url, hash, isActive });
      console.log("Database: Final value types:", {
        name: typeof name,
        url: typeof url,
        hash: typeof hash,
        isActive: typeof isActive
      });
      const icon = form.icon ? String(form.icon) : "FileText";
      const fieldMappings = form.fieldMappings ? JSON.stringify(form.fieldMappings) : "[]";
      const stmt = db.prepare("INSERT INTO forms (name, url, hash, icon, isActive, fieldMappings) VALUES (?, ?, ?, ?, ?, ?)");
      const result = stmt.run(name, url, hash, icon, isActive, fieldMappings);
      console.log("Database: Insert result:", result);
      return result;
    } catch (error) {
      console.error("Database: Error in create method:", error);
      console.error("Database: Error details:", {
        originalForm: form,
        sanitizedValues: { name, url, hash, isActive }
      });
      throw error;
    }
  },
  update: (id, form) => {
    console.log("Database: Updating form with data:", { id, form });
    const name = form.name !== void 0 ? String(form.name) : void 0;
    const url = form.url !== void 0 ? String(form.url) : void 0;
    const hash = form.hash !== void 0 ? form.hash && form.hash.trim() ? String(form.hash.trim()) : null : void 0;
    const icon = form.icon !== void 0 ? String(form.icon) : void 0;
    const isActive = form.isActive !== void 0 ? form.isActive === true ? 1 : 0 : void 0;
    const updates = [];
    const values = [];
    if (name !== void 0) {
      updates.push("name = ?");
      values.push(name);
    }
    if (url !== void 0) {
      updates.push("url = ?");
      values.push(url);
    }
    if (hash !== void 0) {
      updates.push("hash = ?");
      values.push(hash);
    }
    if (icon !== void 0) {
      updates.push("icon = ?");
      values.push(icon);
    }
    if (isActive !== void 0) {
      updates.push("isActive = ?");
      values.push(isActive);
    }
    if (form.fieldMappings !== void 0) {
      updates.push("fieldMappings = ?");
      values.push(JSON.stringify(form.fieldMappings));
    }
    updates.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);
    const sql = `UPDATE forms SET ${updates.join(", ")} WHERE id = ?`;
    console.log("Database: Update SQL:", sql, "Values:", values);
    const stmt = db.prepare(sql);
    return stmt.run(...values);
  },
  delete: (id) => {
    console.log("Database: Deleting form with SET NULL for id:", id);
    try {
      const checkTestRuns = db.prepare("SELECT COUNT(*) as count FROM test_runs WHERE formId = ?");
      const testRunCount = checkTestRuns.get(id);
      console.log("Database: Found", testRunCount.count, "test runs for form", id, "(will be orphaned for archive)");
      const deleteForm = db.prepare("DELETE FROM forms WHERE id = ?");
      const result = deleteForm.run(id);
      console.log("Database: Deleted form", id, "and orphaned test runs, result:", result);
      return result;
    } catch (error) {
      console.error("Database: Error deleting form", id, ":", error);
      throw error;
    }
  },
  deleteAll: () => {
    console.log("Database: Deleting all forms");
    return db.prepare("DELETE FROM forms").run();
  }
};
console.log("Database: Initializing paymentMethodQueries...");
const paymentMethodQueries = {
  getAll: async () => {
    const methods = db.prepare("SELECT * FROM payment_methods ORDER BY name").all();
    const decryptedMethods = await Promise.all(
      methods.map(async (method) => {
        let details;
        try {
          if (isEncrypted(method.details)) {
            details = await decrypt(method.details);
          } else {
            details = JSON.parse(method.details);
          }
        } catch (error) {
          console.error("Database: Failed to decrypt payment method details:", error);
          details = {};
        }
        return {
          ...method,
          isActive: Boolean(method.isActive),
          details,
          createdAt: new Date(method.createdAt),
          updatedAt: new Date(method.updatedAt)
        };
      })
    );
    return decryptedMethods;
  },
  getById: async (id) => {
    const method = db.prepare("SELECT * FROM payment_methods WHERE id = ?").get(id);
    if (!method) return void 0;
    let details;
    try {
      if (isEncrypted(method.details)) {
        details = await decrypt(method.details);
      } else {
        details = JSON.parse(method.details);
      }
    } catch (error) {
      console.error("Database: Failed to decrypt payment method details:", error);
      details = {};
    }
    return {
      ...method,
      isActive: Boolean(method.isActive),
      details,
      createdAt: new Date(method.createdAt),
      updatedAt: new Date(method.updatedAt)
    };
  },
  create: async (method) => {
    let name = "";
    let type = "paypal";
    let isActive = 0;
    let details = "{}";
    try {
      if (method.name === null || method.name === void 0) {
        name = "";
      } else {
        name = String(method.name).trim();
      }
      if (method.type === null || method.type === void 0) {
        type = "paypal";
      } else {
        const validTypes = ["paypal", "sepa", "creditcard", "eps"];
        const typeStr = String(method.type).toLowerCase();
        type = validTypes.includes(typeStr) ? typeStr : "paypal";
      }
      const isActiveValue = method.isActive;
      if (isActiveValue === true || isActiveValue === 1 || isActiveValue === "1" || isActiveValue === "true") {
        isActive = 1;
      } else {
        isActive = 0;
      }
      if (method.details === null || method.details === void 0) {
        details = await encrypt({});
      } else {
        try {
          details = await encrypt(method.details);
          console.log("Database: Payment details encrypted successfully");
        } catch (encryptError) {
          console.error("Database: Failed to encrypt details:", encryptError);
          throw new Error("Failed to encrypt payment details");
        }
      }
      const icon = method.icon ? String(method.icon) : null;
      const stmt = db.prepare("INSERT INTO payment_methods (name, type, icon, isActive, details) VALUES (?, ?, ?, ?, ?)");
      return stmt.run(name, type, icon, isActive, details);
    } catch (error) {
      console.error("Database: Error in payment method create method:", error);
      console.error("Database: Payment method error details:", {
        originalMethod: method,
        sanitizedValues: { name, type, isActive, details: "[ENCRYPTED]" }
      });
      throw error;
    }
  },
  update: async (id, method) => {
    console.log("Database: Updating payment method with data:", { id, method });
    const name = method.name !== void 0 ? String(method.name) : void 0;
    const type = method.type !== void 0 ? String(method.type) : void 0;
    const icon = method.icon !== void 0 ? String(method.icon) : void 0;
    const isActive = method.isActive !== void 0 ? method.isActive === true ? 1 : 0 : void 0;
    let details = void 0;
    if (method.details !== void 0) {
      try {
        details = await encrypt(method.details);
        console.log("Database: Payment details encrypted for update");
      } catch (encryptError) {
        console.error("Database: Failed to encrypt details:", encryptError);
        throw new Error("Failed to encrypt payment details");
      }
    }
    const updates = [];
    const values = [];
    if (name !== void 0) {
      updates.push("name = ?");
      values.push(name);
    }
    if (type !== void 0) {
      updates.push("type = ?");
      values.push(type);
    }
    if (icon !== void 0) {
      updates.push("icon = ?");
      values.push(icon);
    }
    if (isActive !== void 0) {
      updates.push("isActive = ?");
      values.push(isActive);
    }
    if (details !== void 0) {
      updates.push("details = ?");
      values.push(details);
    }
    updates.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);
    const sql = `UPDATE payment_methods SET ${updates.join(", ")} WHERE id = ?`;
    console.log("Database: Payment method update SQL:", sql, "Values: [ENCRYPTED]");
    const stmt = db.prepare(sql);
    return stmt.run(...values);
  },
  delete: (id) => {
    console.log("Database: Deleting payment method with SET NULL for id:", id);
    try {
      const checkTestRuns = db.prepare("SELECT COUNT(*) as count FROM test_runs WHERE paymentMethodId = ?");
      const testRunCount = checkTestRuns.get(id);
      console.log("Database: Found", testRunCount.count, "test runs for payment method", id, "(will be orphaned for archive)");
      const deletePaymentMethod = db.prepare("DELETE FROM payment_methods WHERE id = ?");
      const result = deletePaymentMethod.run(id);
      console.log("Database: Deleted payment method", id, "and orphaned test runs, result:", result);
      return result;
    } catch (error) {
      console.error("Database: Error deleting payment method", id, ":", error);
      throw error;
    }
  },
  deleteAll: () => {
    console.log("Database: Deleting all payment methods");
    return db.prepare("DELETE FROM payment_methods").run();
  }
};
const settingsQueries = {
  getAll: () => db.prepare("SELECT * FROM global_settings ORDER BY key").all(),
  get: (key) => db.prepare("SELECT * FROM global_settings WHERE key = ?").get(key),
  set: (key, value, description) => db.prepare("INSERT OR REPLACE INTO global_settings (key, value, description) VALUES (?, ?, ?)").run(key, value, description),
  getApiKey: async () => {
    const encrypted = settingsQueries.get("api_key_encrypted");
    if (!encrypted || !encrypted.value) {
      const legacy = settingsQueries.get("api_key");
      if (legacy && legacy.value && !isEncrypted(legacy.value)) {
        try {
          const encryptedKey = await encrypt(legacy.value);
          settingsQueries.set("api_key_encrypted", encryptedKey, "Encrypted API key");
          settingsQueries.set("api_key", "", "Legacy - use api_key_encrypted");
          return legacy.value;
        } catch (error) {
          console.error("Failed to migrate API key:", error);
          return null;
        }
      }
      return null;
    }
    try {
      return await decrypt(encrypted.value);
    } catch (error) {
      console.error("Failed to decrypt API key:", error);
      return null;
    }
  },
  setApiKey: async (key) => {
    const encrypted = await encrypt(key);
    settingsQueries.set("api_key_encrypted", encrypted, "Encrypted API key");
    const legacy = settingsQueries.get("api_key");
    if (legacy && legacy.value && !isEncrypted(legacy.value)) {
      settingsQueries.set("api_key", "", "Legacy - use api_key_encrypted");
    }
  },
  // Global field defaults - stored as JSON in a single setting
  getFieldDefaults: () => {
    const setting = db.prepare("SELECT value FROM global_settings WHERE key = 'global_field_defaults'").get();
    if (!setting) return {};
    try {
      return JSON.parse(setting.value);
    } catch {
      return {};
    }
  },
  setFieldDefaults: (defaults) => {
    const value = JSON.stringify(defaults);
    return db.prepare("INSERT OR REPLACE INTO global_settings (key, value, description) VALUES (?, ?, ?)").run(
      "global_field_defaults",
      value,
      "Global default field values that override Faker.js"
    );
  }
};
const SALT_LENGTH = 32;
const KEY_LENGTH = 64;
function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password, storedHash) {
  try {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) return false;
    const hashBuffer = Buffer.from(hash, "hex");
    const suppliedHashBuffer = crypto.scryptSync(password, salt, KEY_LENGTH);
    return crypto.timingSafeEqual(hashBuffer, suppliedHashBuffer);
  } catch {
    return false;
  }
}
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1e3;
let sessionUnlockedAt = null;
const passwordQueries = {
  /** Check if master password is enabled */
  isEnabled: () => {
    const setting = settingsQueries.get("master_password_enabled");
    return setting?.value === "true";
  },
  /** Get the stored password hash */
  getHash: () => {
    const setting = settingsQueries.get("master_password_hash");
    return setting?.value || null;
  },
  /** Set master password (hashes it before storing) */
  setPassword: (password) => {
    const hash = hashPassword(password);
    settingsQueries.set("master_password_hash", hash, "Hashed master password");
    settingsQueries.set("master_password_enabled", "true", "Master password protection enabled");
  },
  /** Verify password against stored hash */
  verify: (password) => {
    const storedHash = passwordQueries.getHash();
    if (!storedHash) return false;
    const isValid = verifyPassword(password, storedHash);
    if (isValid) {
      sessionUnlockedAt = Date.now();
    }
    return isValid;
  },
  /** Disable master password (requires current password verification first) */
  disable: (currentPassword) => {
    if (!passwordQueries.verify(currentPassword)) {
      return false;
    }
    settingsQueries.set("master_password_enabled", "false", "Master password protection disabled");
    settingsQueries.set("master_password_hash", "", "Cleared password hash");
    return true;
  },
  /** Change password (requires current password verification first) */
  changePassword: (currentPassword, newPassword) => {
    if (!passwordQueries.verify(currentPassword)) {
      return false;
    }
    const hash = hashPassword(newPassword);
    settingsQueries.set("master_password_hash", hash, "Hashed master password");
    return true;
  },
  /** Check if session is unlocked and not expired */
  isSessionUnlocked: () => {
    if (sessionUnlockedAt === null) return false;
    const now = Date.now();
    const elapsed = now - sessionUnlockedAt;
    if (elapsed >= SESSION_TIMEOUT_MS) {
      sessionUnlockedAt = null;
      return false;
    }
    return true;
  },
  /** Check if session has expired (without locking it) */
  checkSessionExpiry: () => {
    if (sessionUnlockedAt === null) return false;
    const now = Date.now();
    const elapsed = now - sessionUnlockedAt;
    return elapsed < SESSION_TIMEOUT_MS;
  },
  /** Reset session (for testing or manual lock) */
  lockSession: () => {
    sessionUnlockedAt = null;
  },
  /** Unlock session without password (emergency reset - hold Shift on startup) */
  emergencyReset: () => {
    settingsQueries.set("master_password_enabled", "false", "Master password protection disabled");
    settingsQueries.set("master_password_hash", "", "Cleared password hash");
    sessionUnlockedAt = Date.now();
  }
};
const testRunQueries = {
  getAll: (includeArchived = false) => {
    let query = "SELECT * FROM test_runs";
    if (!includeArchived) {
      query += " WHERE isArchived = 0 OR isArchived IS NULL";
    }
    query += " ORDER BY runAt DESC";
    const rows = db.prepare(query).all();
    return rows.map((row) => ({
      ...row,
      steps: row.steps ? JSON.parse(row.steps) : [],
      isScheduled: Boolean(row.isScheduled),
      isArchived: Boolean(row.isArchived),
      tags: row.tags ? JSON.parse(row.tags) : [],
      seoResults: row.seoResults ? JSON.parse(row.seoResults) : void 0,
      accessibilityResults: row.accessibilityResults ? JSON.parse(row.accessibilityResults) : void 0
    }));
  },
  getById: (id) => {
    const row = db.prepare("SELECT * FROM test_runs WHERE id = ?").get(id);
    if (!row) return void 0;
    return {
      ...row,
      steps: row.steps ? JSON.parse(row.steps) : [],
      isScheduled: Boolean(row.isScheduled),
      isArchived: Boolean(row.isArchived),
      tags: row.tags ? JSON.parse(row.tags) : [],
      seoResults: row.seoResults ? JSON.parse(row.seoResults) : void 0,
      accessibilityResults: row.accessibilityResults ? JSON.parse(row.accessibilityResults) : void 0
    };
  },
  getByForm: (formId) => {
    const rows = db.prepare("SELECT * FROM test_runs WHERE formId = ? ORDER BY runAt DESC").all(formId);
    return rows.map((row) => ({
      ...row,
      steps: row.steps ? JSON.parse(row.steps) : [],
      isScheduled: Boolean(row.isScheduled),
      isArchived: Boolean(row.isArchived),
      tags: row.tags ? JSON.parse(row.tags) : [],
      seoResults: row.seoResults ? JSON.parse(row.seoResults) : void 0,
      accessibilityResults: row.accessibilityResults ? JSON.parse(row.accessibilityResults) : void 0
    }));
  },
  create: (testRun) => db.prepare("INSERT INTO test_runs (uuid, formId, paymentMethodId, status, errorMessage, logDetails, steps, durationMs, isScheduled, amount, interval, seoResults, accessibilityResults, isArchived, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
    testRun.uuid,
    testRun.formId,
    testRun.paymentMethodId,
    testRun.status,
    testRun.errorMessage,
    testRun.logDetails,
    JSON.stringify(testRun.steps || []),
    testRun.durationMs,
    testRun.isScheduled ? 1 : 0,
    testRun.amount,
    testRun.interval,
    testRun.seoResults ? JSON.stringify(testRun.seoResults) : null,
    testRun.accessibilityResults ? JSON.stringify(testRun.accessibilityResults) : null,
    testRun.isArchived ? 1 : 0,
    JSON.stringify(testRun.tags || [])
  ),
  updateStatus: (id, status, errorMessage, durationMs, steps) => {
    const stmt = db.prepare("UPDATE test_runs SET status = ?, errorMessage = ?, durationMs = ?, steps = ? WHERE id = ? AND status != 'STOPPED'");
    return stmt.run(status, errorMessage, durationMs, JSON.stringify(steps || []), id);
  },
  updateQualityResults: (id, seoResults, accessibilityResults) => {
    const stmt = db.prepare("UPDATE test_runs SET seoResults = ?, accessibilityResults = ? WHERE id = ?");
    return stmt.run(
      seoResults ? JSON.stringify(seoResults) : null,
      accessibilityResults ? JSON.stringify(accessibilityResults) : null,
      id
    );
  },
  updateNotes: (id, notes) => {
    const stmt = db.prepare("UPDATE test_runs SET notes = ? WHERE id = ?");
    return stmt.run(notes, id);
  },
  archive: (id) => {
    const stmt = db.prepare("UPDATE test_runs SET isArchived = 1 WHERE id = ?");
    return stmt.run(id);
  },
  unarchive: (id) => {
    const stmt = db.prepare("UPDATE test_runs SET isArchived = 0 WHERE id = ?");
    return stmt.run(id);
  },
  archiveBulk: (ids) => {
    if (ids.length === 0) return { changes: 0 };
    const placeholders = ids.map(() => "?").join(",");
    const stmt = db.prepare(`UPDATE test_runs SET isArchived = 1 WHERE id IN (${placeholders})`);
    return stmt.run(...ids);
  },
  unarchiveBulk: (ids) => {
    if (ids.length === 0) return { changes: 0 };
    const placeholders = ids.map(() => "?").join(",");
    const stmt = db.prepare(`UPDATE test_runs SET isArchived = 0 WHERE id IN (${placeholders})`);
    return stmt.run(...ids);
  },
  updateTags: (id, tags) => {
    const stmt = db.prepare("UPDATE test_runs SET tags = ? WHERE id = ?");
    return stmt.run(JSON.stringify(tags), id);
  },
  stop: (id) => {
    const testRun = db.prepare("SELECT runAt, status FROM test_runs WHERE id = ?").get(id);
    let durationMs = 0;
    if (testRun && testRun.status === "RUNNING") {
      const runAtStr = String(testRun.runAt);
      let startTime;
      if (!runAtStr.includes("T") && !runAtStr.includes("Z")) {
        startTime = (/* @__PURE__ */ new Date(runAtStr.replace(" ", "T") + "Z")).getTime();
      } else {
        startTime = new Date(runAtStr).getTime();
      }
      durationMs = Date.now() - startTime;
    }
    const stmt = db.prepare("UPDATE test_runs SET status = 'STOPPED', durationMs = ? WHERE id = ? AND status IN ('RUNNING', 'QUEUED')");
    return stmt.run(durationMs, id);
  },
  delete: (id) => {
    const stmt = db.prepare("DELETE FROM test_runs WHERE id = ?");
    return stmt.run(id);
  },
  deleteAll: () => {
    return db.prepare("DELETE FROM test_runs").run();
  },
  deleteTestRuns: (ids) => {
    if (ids.length === 0) return { changes: 0 };
    const placeholders = ids.map(() => "?").join(",");
    const stmt = db.prepare(`DELETE FROM test_runs WHERE id IN (${placeholders})`);
    return stmt.run(...ids);
  },
  getInterruptedTestsWithDetails: () => {
    const rows = db.prepare(`
      SELECT 
        tr.id,
        tr.formId,
        tr.paymentMethodId,
        tr.status,
        tr.runAt,
        f.name as formName,
        pm.name as paymentMethodName
      FROM test_runs tr
      LEFT JOIN forms f ON tr.formId = f.id
      LEFT JOIN payment_methods pm ON tr.paymentMethodId = pm.id
      WHERE tr.status IN ('RUNNING', 'QUEUED')
        AND tr.formId IS NOT NULL
        AND tr.paymentMethodId IS NOT NULL
      ORDER BY tr.runAt DESC
    `).all();
    return rows.map((row) => ({
      id: row.id,
      formId: row.formId,
      paymentMethodId: row.paymentMethodId,
      formName: row.formName || `Form #${row.formId}`,
      paymentMethodName: row.paymentMethodName || `PM #${row.paymentMethodId}`,
      status: row.status,
      runAt: new Date(row.runAt)
    }));
  }
};
const testScheduleQueries = {
  getAll: () => {
    const schedules = db.prepare("SELECT * FROM test_schedules ORDER BY createdAt DESC").all();
    return schedules.map((s) => ({
      ...s,
      isActive: Boolean(s.isActive),
      enableSeoTest: Boolean(s.enableSeoTest),
      enableAccessibilityTest: Boolean(s.enableAccessibilityTest),
      lastRun: s.lastRun ? new Date(s.lastRun) : void 0,
      createdAt: new Date(s.createdAt)
    }));
  },
  getById: (id) => {
    const s = db.prepare("SELECT * FROM test_schedules WHERE id = ?").get(id);
    if (!s) return void 0;
    return {
      ...s,
      isActive: Boolean(s.isActive),
      enableSeoTest: Boolean(s.enableSeoTest),
      enableAccessibilityTest: Boolean(s.enableAccessibilityTest),
      lastRun: s.lastRun ? new Date(s.lastRun) : void 0,
      createdAt: new Date(s.createdAt)
    };
  },
  create: (schedule) => {
    return db.prepare("INSERT INTO test_schedules (name, formId, paymentMethodId, cronExpression, isActive, icon, enableSeoTest, enableAccessibilityTest) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
      schedule.name,
      schedule.formId,
      schedule.paymentMethodId,
      schedule.cronExpression,
      schedule.isActive ? 1 : 0,
      schedule.icon || "Play",
      schedule.enableSeoTest ? 1 : 0,
      schedule.enableAccessibilityTest ? 1 : 0
    );
  },
  update: (id, schedule) => {
    const updates = [];
    const values = [];
    if (schedule.name !== void 0) {
      updates.push("name = ?");
      values.push(schedule.name);
    }
    if (schedule.formId !== void 0) {
      updates.push("formId = ?");
      values.push(schedule.formId);
    }
    if (schedule.paymentMethodId !== void 0) {
      updates.push("paymentMethodId = ?");
      values.push(schedule.paymentMethodId);
    }
    if (schedule.cronExpression !== void 0) {
      updates.push("cronExpression = ?");
      values.push(schedule.cronExpression);
    }
    if (schedule.isActive !== void 0) {
      updates.push("isActive = ?");
      values.push(schedule.isActive ? 1 : 0);
    }
    if (schedule.icon !== void 0) {
      updates.push("icon = ?");
      values.push(schedule.icon);
    }
    if (schedule.lastRun !== void 0) {
      updates.push("lastRun = ?");
      values.push(schedule.lastRun.toISOString());
    }
    if (schedule.enableSeoTest !== void 0) {
      updates.push("enableSeoTest = ?");
      values.push(schedule.enableSeoTest ? 1 : 0);
    }
    if (schedule.enableAccessibilityTest !== void 0) {
      updates.push("enableAccessibilityTest = ?");
      values.push(schedule.enableAccessibilityTest ? 1 : 0);
    }
    if (updates.length === 0) return { changes: 0 };
    values.push(id);
    return db.prepare(`UPDATE test_schedules SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  },
  delete: (id) => {
    return db.prepare("DELETE FROM test_schedules WHERE id = ?").run(id);
  },
  deleteAll: () => {
    return db.prepare("DELETE FROM test_schedules").run();
  }
};
const exportQueries = {
  async exportAll(options) {
    console.log("Database: Exporting data with options:", options);
    const exportData = {
      version: "1.0.0",
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      schemaVersion: 1,
      data: {}
    };
    try {
      if (options.includeForms) {
        exportData.data.forms = formQueries.getAll();
        console.log(`Database: Exported ${exportData.data.forms.length} forms`);
      }
      if (options.includePaymentMethods) {
        const methods = await paymentMethodQueries.getAll();
        exportData.data.paymentMethods = methods;
        console.log(`Database: Exported ${exportData.data.paymentMethods?.length || 0} payment methods`);
      }
      if (options.includeTestRuns) {
        exportData.data.testRuns = testRunQueries.getAll();
        console.log(`Database: Exported ${exportData.data.testRuns.length} test runs`);
      }
      if (options.includeSchedules) {
        exportData.data.testSchedules = testScheduleQueries.getAll();
        console.log(`Database: Exported ${exportData.data.testSchedules.length} schedules`);
      }
      if (options.includeSettings) {
        exportData.data.settings = settingsQueries.getAll();
        console.log(`Database: Exported ${exportData.data.settings.length} settings`);
      }
      return exportData;
    } catch (error) {
      console.error("Database: Export failed:", error);
      throw error;
    }
  }
};
const importQueries = {
  async importOverwrite(data, options) {
    console.log("Database: Starting overwrite import");
    const result = {
      success: true,
      imported: { forms: 0, paymentMethods: 0, testRuns: 0, schedules: 0, settings: 0 },
      skipped: { forms: 0, paymentMethods: 0, testRuns: 0, schedules: 0, settings: 0 },
      errors: [],
      warnings: []
    };
    try {
      db.exec("BEGIN TRANSACTION");
      if (options.includeForms && data.data.forms) {
        db.exec("DELETE FROM forms");
        console.log("Database: Cleared forms table");
      }
      if (options.includePaymentMethods && data.data.paymentMethods) {
        db.exec("DELETE FROM payment_methods");
        console.log("Database: Cleared payment_methods table");
      }
      if (options.includeTestRuns && data.data.testRuns) {
        db.exec("DELETE FROM test_runs");
        console.log("Database: Cleared test_runs table");
      }
      if (options.includeSchedules && data.data.testSchedules) {
        db.exec("DELETE FROM test_schedules");
        console.log("Database: Cleared test_schedules table");
      }
      if (options.includeSettings && data.data.settings) {
        db.exec("DELETE FROM global_settings WHERE key != 'theme'");
        console.log("Database: Cleared settings (kept theme)");
      }
      if (options.includeForms && data.data.forms) {
        for (const form of data.data.forms) {
          try {
            const formData = {
              name: form.name,
              url: form.url,
              hash: form.hash || null,
              icon: form.icon || "FileText",
              isActive: form.isActive
            };
            formQueries.create(formData);
            result.imported.forms++;
          } catch (error) {
            result.errors.push(`Failed to import form "${form.name}": ${error.message}`);
          }
        }
      }
      if (options.includePaymentMethods && data.data.paymentMethods) {
        for (const pm of data.data.paymentMethods) {
          try {
            const pmData = {
              name: pm.name,
              type: pm.type,
              icon: pm.icon || void 0,
              isActive: pm.isActive,
              details: pm.details
              // Already decrypted, will be encrypted by create()
            };
            await paymentMethodQueries.create(pmData);
            result.imported.paymentMethods++;
          } catch (error) {
            result.errors.push(`Failed to import payment method "${pm.name}": ${error.message}`);
          }
        }
      }
      if (options.includeTestRuns && data.data.testRuns) {
        for (const tr of data.data.testRuns) {
          try {
            testRunQueries.create({
              uuid: tr.uuid || crypto.randomUUID(),
              formId: tr.formId,
              paymentMethodId: tr.paymentMethodId,
              status: tr.status,
              errorMessage: tr.errorMessage,
              logDetails: tr.logDetails,
              durationMs: tr.durationMs
            });
            result.imported.testRuns++;
          } catch (error) {
            result.errors.push(`Failed to import test run: ${error.message}`);
          }
        }
      }
      if (options.includeSchedules && data.data.testSchedules) {
        for (const schedule of data.data.testSchedules) {
          try {
            testScheduleQueries.create({
              name: schedule.name,
              formId: schedule.formId,
              paymentMethodId: schedule.paymentMethodId,
              cronExpression: schedule.cronExpression,
              isActive: schedule.isActive,
              icon: schedule.icon
            });
            result.imported.schedules++;
          } catch (error) {
            result.errors.push(`Failed to import schedule "${schedule.name}": ${error.message}`);
          }
        }
      }
      if (options.includeSettings && data.data.settings) {
        for (const setting of data.data.settings) {
          try {
            if (setting.key !== "theme") {
              settingsQueries.set(setting.key, setting.value, setting.description);
              result.imported.settings++;
            }
          } catch (error) {
            result.errors.push(`Failed to import setting "${setting.key}": ${error.message}`);
          }
        }
      }
      db.exec("COMMIT");
      console.log("Database: Overwrite import completed successfully");
    } catch (error) {
      db.exec("ROLLBACK");
      result.success = false;
      result.errors.push(`Import failed: ${error.message}`);
      console.error("Database: Import failed, rolled back:", error);
    }
    return result;
  },
  async importMerge(data, options) {
    console.log("Database: Starting merge import");
    const result = {
      success: true,
      imported: { forms: 0, paymentMethods: 0, testRuns: 0, schedules: 0, settings: 0 },
      skipped: { forms: 0, paymentMethods: 0, testRuns: 0, schedules: 0, settings: 0 },
      errors: [],
      warnings: []
    };
    const idMap = {
      forms: /* @__PURE__ */ new Map(),
      paymentMethods: /* @__PURE__ */ new Map()
    };
    try {
      db.exec("BEGIN TRANSACTION");
      if (options.includeForms && data.data.forms) {
        const existingForms = formQueries.getAll();
        for (const importedForm of data.data.forms) {
          try {
            const existing = existingForms.find(
              (f) => f.name === importedForm.name && f.url === importedForm.url
            );
            if (existing) {
              const isDifferent = existing.hash !== importedForm.hash || existing.icon !== importedForm.icon || existing.isActive !== importedForm.isActive;
              if (isDifferent) {
                formQueries.update(existing.id, {
                  hash: importedForm.hash || null,
                  icon: importedForm.icon || "FileText",
                  isActive: importedForm.isActive
                });
                result.imported.forms++;
                idMap.forms.set(importedForm.id, existing.id);
                result.warnings.push(`Updated form "${importedForm.name}"`);
              } else {
                result.skipped.forms++;
                idMap.forms.set(importedForm.id, existing.id);
              }
            } else {
              const newForm = formQueries.create({
                name: importedForm.name,
                url: importedForm.url,
                hash: importedForm.hash || null,
                icon: importedForm.icon || "FileText",
                isActive: importedForm.isActive
              });
              result.imported.forms++;
              idMap.forms.set(importedForm.id, Number(newForm.lastInsertRowid));
            }
          } catch (error) {
            result.errors.push(`Failed to merge form "${importedForm.name}": ${error.message}`);
          }
        }
      }
      if (options.includePaymentMethods && data.data.paymentMethods) {
        const existingMethods = await paymentMethodQueries.getAll();
        for (const importedPM of data.data.paymentMethods) {
          try {
            const existing = existingMethods.find(
              (pm) => pm.name === importedPM.name && pm.type === importedPM.type
            );
            if (existing) {
              await paymentMethodQueries.update(existing.id, {
                icon: importedPM.icon || void 0,
                isActive: importedPM.isActive,
                details: importedPM.details
                // Already decrypted, will be encrypted by update()
              });
              result.imported.paymentMethods++;
              idMap.paymentMethods.set(importedPM.id, existing.id);
              result.warnings.push(`Updated payment method "${importedPM.name}"`);
            } else {
              const newPM = await paymentMethodQueries.create({
                name: importedPM.name,
                type: importedPM.type,
                icon: importedPM.icon || void 0,
                isActive: importedPM.isActive,
                details: importedPM.details
                // Already decrypted, will be encrypted by create()
              });
              result.imported.paymentMethods++;
              idMap.paymentMethods.set(importedPM.id, Number(newPM.lastInsertRowid));
            }
          } catch (error) {
            result.errors.push(`Failed to merge payment method "${importedPM.name}": ${error.message}`);
          }
        }
      }
      if (options.includeTestRuns && data.data.testRuns) {
        const existingTestRuns = testRunQueries.getAll();
        for (const tr of data.data.testRuns) {
          try {
            const newFormId = idMap.forms.get(tr.formId) || tr.formId;
            const newPaymentMethodId = idMap.paymentMethods.get(tr.paymentMethodId) || tr.paymentMethodId;
            const existing = tr.uuid ? existingTestRuns.find((r) => r.uuid === tr.uuid) : null;
            if (!existing) {
              testRunQueries.create({
                uuid: tr.uuid || crypto.randomUUID(),
                formId: newFormId,
                paymentMethodId: newPaymentMethodId,
                status: tr.status,
                errorMessage: tr.errorMessage,
                logDetails: tr.logDetails,
                durationMs: tr.durationMs
              });
              result.imported.testRuns++;
            } else {
              result.skipped.testRuns++;
            }
          } catch (error) {
            result.errors.push(`Failed to merge test run: ${error.message}`);
          }
        }
      }
      if (options.includeSchedules && data.data.testSchedules) {
        const existingSchedules = testScheduleQueries.getAll();
        for (const schedule of data.data.testSchedules) {
          try {
            const newFormId = idMap.forms.get(schedule.formId) || schedule.formId;
            const newPaymentMethodId = idMap.paymentMethods.get(schedule.paymentMethodId) || schedule.paymentMethodId;
            const existing = existingSchedules.find((s) => s.name === schedule.name);
            if (existing) {
              testScheduleQueries.update(existing.id, {
                formId: newFormId,
                paymentMethodId: newPaymentMethodId,
                cronExpression: schedule.cronExpression,
                isActive: schedule.isActive,
                icon: schedule.icon
              });
              result.imported.schedules++;
              result.warnings.push(`Updated schedule "${schedule.name}"`);
            } else {
              testScheduleQueries.create({
                name: schedule.name,
                formId: newFormId,
                paymentMethodId: newPaymentMethodId,
                cronExpression: schedule.cronExpression,
                isActive: schedule.isActive,
                icon: schedule.icon
              });
              result.imported.schedules++;
            }
          } catch (error) {
            result.errors.push(`Failed to merge schedule "${schedule.name}": ${error.message}`);
          }
        }
      }
      if (options.includeSettings && data.data.settings) {
        for (const setting of data.data.settings) {
          try {
            if (setting.key !== "theme") {
              const existing = settingsQueries.get(setting.key);
              if (existing && existing.value !== setting.value) {
                settingsQueries.set(setting.key, setting.value, setting.description);
                result.imported.settings++;
                result.warnings.push(`Updated setting "${setting.key}"`);
              } else if (!existing) {
                settingsQueries.set(setting.key, setting.value, setting.description);
                result.imported.settings++;
              } else {
                result.skipped.settings++;
              }
            }
          } catch (error) {
            result.errors.push(`Failed to merge setting "${setting.key}": ${error.message}`);
          }
        }
      }
      db.exec("COMMIT");
      console.log("Database: Merge import completed successfully");
    } catch (error) {
      db.exec("ROLLBACK");
      result.success = false;
      result.errors.push(`Merge import failed: ${error.message}`);
      console.error("Database: Merge import failed, rolled back:", error);
    }
    return result;
  }
};
const tagQueries = {
  getAll: () => {
    const rows = db.prepare("SELECT * FROM tag_definitions ORDER BY name ASC").all();
    return rows.map((row) => ({
      ...row,
      createdAt: new Date(row.createdAt)
    }));
  },
  getById: (id) => {
    const row = db.prepare("SELECT * FROM tag_definitions WHERE id = ?").get(id);
    if (!row) return void 0;
    return {
      ...row,
      createdAt: new Date(row.createdAt)
    };
  },
  create: (name, color = "#3B82F6") => {
    const stmt = db.prepare("INSERT INTO tag_definitions (name, color) VALUES (?, ?)");
    const result = stmt.run(name, color);
    return tagQueries.getById(result.lastInsertRowid);
  },
  update: (id, name, color) => {
    const stmt = db.prepare("UPDATE tag_definitions SET name = ?, color = ? WHERE id = ?");
    stmt.run(name, color, id);
    return tagQueries.getById(id);
  },
  delete: (id) => {
    const stmt = db.prepare("DELETE FROM tag_definitions WHERE id = ?");
    return stmt.run(id);
  }
};
const filterPresetQueries = {
  getAll: () => {
    const rows = db.prepare("SELECT * FROM filter_presets ORDER BY name ASC").all();
    return rows.map((row) => ({
      ...row,
      filterConfig: JSON.parse(row.filterConfig),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));
  },
  getById: (id) => {
    const row = db.prepare("SELECT * FROM filter_presets WHERE id = ?").get(id);
    if (!row) return void 0;
    return {
      ...row,
      filterConfig: JSON.parse(row.filterConfig),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  },
  create: (name, filterConfig) => {
    const stmt = db.prepare("INSERT INTO filter_presets (name, filterConfig) VALUES (?, ?)");
    const result = stmt.run(name, JSON.stringify(filterConfig));
    return filterPresetQueries.getById(result.lastInsertRowid);
  },
  update: (id, name, filterConfig) => {
    const stmt = db.prepare("UPDATE filter_presets SET name = ?, filterConfig = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?");
    stmt.run(name, JSON.stringify(filterConfig), id);
    return filterPresetQueries.getById(id);
  },
  delete: (id) => {
    const stmt = db.prepare("DELETE FROM filter_presets WHERE id = ?");
    return stmt.run(id);
  }
};
const notificationQueries = {
  getAll: () => {
    const notifications = db.prepare("SELECT * FROM notifications ORDER BY createdAt DESC").all();
    return notifications.map((n) => ({
      ...n,
      isRead: Boolean(n.isRead),
      createdAt: new Date(n.createdAt)
    }));
  },
  getUnread: () => {
    const notifications = db.prepare("SELECT * FROM notifications WHERE isRead = 0 ORDER BY createdAt DESC").all();
    return notifications.map((n) => ({
      ...n,
      isRead: Boolean(n.isRead),
      createdAt: new Date(n.createdAt)
    }));
  },
  getUnreadCount: () => {
    const result = db.prepare("SELECT COUNT(*) as count FROM notifications WHERE isRead = 0").get();
    return result.count;
  },
  create: (notification) => {
    const stmt = db.prepare("INSERT INTO notifications (type, title, message, testRunId) VALUES (?, ?, ?, ?)");
    const result = stmt.run(notification.type, notification.title, notification.message || null, notification.testRunId || null);
    return result.lastInsertRowid;
  },
  markAsRead: (id) => {
    const stmt = db.prepare("UPDATE notifications SET isRead = 1 WHERE id = ?");
    stmt.run(id);
  },
  markAllAsRead: () => {
    const stmt = db.prepare("UPDATE notifications SET isRead = 1 WHERE isRead = 0");
    stmt.run();
  },
  delete: (id) => {
    const stmt = db.prepare("DELETE FROM notifications WHERE id = ?");
    stmt.run(id);
  },
  deleteAll: () => {
    const stmt = db.prepare("DELETE FROM notifications");
    stmt.run();
  }
};
const selectorOverrideQueries = {
  getAll: () => {
    const overrides = db.prepare("SELECT * FROM selector_overrides ORDER BY category, key").all();
    return overrides.map((o) => ({
      ...o,
      selectors: JSON.parse(o.selectors),
      isActive: Boolean(o.isActive),
      createdAt: new Date(o.createdAt),
      updatedAt: new Date(o.updatedAt)
    }));
  },
  getByCategory: (category) => {
    const overrides = db.prepare("SELECT * FROM selector_overrides WHERE category = ? ORDER BY key").all(category);
    return overrides.map((o) => ({
      ...o,
      selectors: JSON.parse(o.selectors),
      isActive: Boolean(o.isActive),
      createdAt: new Date(o.createdAt),
      updatedAt: new Date(o.updatedAt)
    }));
  },
  getById: (id) => {
    const override = db.prepare("SELECT * FROM selector_overrides WHERE id = ?").get(id);
    if (!override) return void 0;
    return {
      ...override,
      selectors: JSON.parse(override.selectors),
      isActive: Boolean(override.isActive),
      createdAt: new Date(override.createdAt),
      updatedAt: new Date(override.updatedAt)
    };
  },
  getActive: () => {
    const overrides = db.prepare("SELECT * FROM selector_overrides WHERE isActive = 1 ORDER BY category, key").all();
    return overrides.map((o) => ({
      ...o,
      selectors: JSON.parse(o.selectors),
      isActive: Boolean(o.isActive),
      createdAt: new Date(o.createdAt),
      updatedAt: new Date(o.updatedAt)
    }));
  },
  create: (override) => {
    const stmt = db.prepare(`
      INSERT INTO selector_overrides (category, key, selectors, isActive)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      override.category,
      override.key,
      JSON.stringify(override.selectors),
      override.isActive !== false ? 1 : 0
    );
    return result;
  },
  update: (id, override) => {
    const updates = [];
    const values = [];
    if (override.selectors !== void 0) {
      updates.push("selectors = ?");
      values.push(JSON.stringify(override.selectors));
    }
    if (override.isActive !== void 0) {
      updates.push("isActive = ?");
      values.push(override.isActive ? 1 : 0);
    }
    if (updates.length === 0) return;
    updates.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);
    const stmt = db.prepare(`UPDATE selector_overrides SET ${updates.join(", ")} WHERE id = ?`);
    return stmt.run(...values);
  },
  upsert: (override) => {
    const stmt = db.prepare(`
      INSERT INTO selector_overrides (category, key, selectors, isActive)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(category, key) DO UPDATE SET
        selectors = excluded.selectors,
        isActive = excluded.isActive,
        updatedAt = CURRENT_TIMESTAMP
    `);
    return stmt.run(
      override.category,
      override.key,
      JSON.stringify(override.selectors),
      override.isActive !== false ? 1 : 0
    );
  },
  delete: (id) => {
    const stmt = db.prepare("DELETE FROM selector_overrides WHERE id = ?");
    return stmt.run(id);
  },
  deleteByKey: (category, key) => {
    const stmt = db.prepare("DELETE FROM selector_overrides WHERE category = ? AND key = ?");
    return stmt.run(category, key);
  },
  deleteAll: () => {
    const stmt = db.prepare("DELETE FROM selector_overrides");
    return stmt.run();
  }
};
function getMergedSelectorConfig() {
  const overrides = selectorOverrideQueries.getActive();
  return mergeSelectorsConfig(SELECTOR_CONFIG, overrides);
}
function getBaseSelectorConfig() {
  return SELECTOR_CONFIG;
}
const customScriptQueries = {
  getAll: () => {
    const scripts = db.prepare("SELECT * FROM custom_scripts ORDER BY name").all();
    return scripts.map((s) => ({
      ...s,
      isActive: Boolean(s.isActive),
      isGlobal: Boolean(s.isGlobal),
      stopOnError: Boolean(s.stopOnError),
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt)
    }));
  },
  getById: (id) => {
    const script = db.prepare("SELECT * FROM custom_scripts WHERE id = ?").get(id);
    if (!script) return void 0;
    return {
      ...script,
      isActive: Boolean(script.isActive),
      isGlobal: Boolean(script.isGlobal),
      stopOnError: Boolean(script.stopOnError),
      createdAt: new Date(script.createdAt),
      updatedAt: new Date(script.updatedAt)
    };
  },
  getByHookPoint: (hookPoint) => {
    const scripts = db.prepare(
      "SELECT * FROM custom_scripts WHERE hookPoint = ? AND isActive = 1 ORDER BY name"
    ).all(hookPoint);
    return scripts.map((s) => ({
      ...s,
      isActive: Boolean(s.isActive),
      isGlobal: Boolean(s.isGlobal),
      stopOnError: Boolean(s.stopOnError),
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt)
    }));
  },
  getGlobalScripts: () => {
    const scripts = db.prepare(
      "SELECT * FROM custom_scripts WHERE isGlobal = 1 AND isActive = 1 ORDER BY hookPoint, name"
    ).all();
    return scripts.map((s) => ({
      ...s,
      isActive: Boolean(s.isActive),
      isGlobal: Boolean(s.isGlobal),
      stopOnError: Boolean(s.stopOnError),
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt)
    }));
  },
  getByFormId: (formId) => {
    const scripts = db.prepare(`
      SELECT cs.*, fs.executionOrder
      FROM custom_scripts cs
      INNER JOIN form_scripts fs ON cs.id = fs.scriptId
      WHERE fs.formId = ? AND cs.isActive = 1
      ORDER BY cs.hookPoint, fs.executionOrder, cs.name
    `).all(formId);
    return scripts.map((s) => ({
      ...s,
      isActive: Boolean(s.isActive),
      isGlobal: Boolean(s.isGlobal),
      stopOnError: Boolean(s.stopOnError),
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt)
    }));
  },
  getScriptsForTest: (formId) => {
    const scripts = db.prepare(`
      SELECT DISTINCT cs.*, COALESCE(fs.executionOrder, 0) as executionOrder
      FROM custom_scripts cs
      LEFT JOIN form_scripts fs ON cs.id = fs.scriptId AND fs.formId = ?
      WHERE cs.isActive = 1 AND (cs.isGlobal = 1 OR fs.formId IS NOT NULL)
      ORDER BY cs.hookPoint, executionOrder, cs.name
    `).all(formId);
    return scripts.map((s) => ({
      ...s,
      isActive: Boolean(s.isActive),
      isGlobal: Boolean(s.isGlobal),
      stopOnError: Boolean(s.stopOnError),
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt)
    }));
  },
  create: (script) => {
    const stmt = db.prepare(`
      INSERT INTO custom_scripts (name, description, code, hookPoint, isActive, isGlobal, stopOnError, timeout)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      script.name,
      script.description || null,
      script.code,
      script.hookPoint,
      script.isActive ? 1 : 0,
      script.isGlobal ? 1 : 0,
      script.stopOnError ? 1 : 0,
      script.timeout || 3e4
    );
    return { ...result, id: result.lastInsertRowid };
  },
  update: (id, script) => {
    const updates = [];
    const values = [];
    if (script.name !== void 0) {
      updates.push("name = ?");
      values.push(script.name);
    }
    if (script.description !== void 0) {
      updates.push("description = ?");
      values.push(script.description);
    }
    if (script.code !== void 0) {
      updates.push("code = ?");
      values.push(script.code);
    }
    if (script.hookPoint !== void 0) {
      updates.push("hookPoint = ?");
      values.push(script.hookPoint);
    }
    if (script.isActive !== void 0) {
      updates.push("isActive = ?");
      values.push(script.isActive ? 1 : 0);
    }
    if (script.isGlobal !== void 0) {
      updates.push("isGlobal = ?");
      values.push(script.isGlobal ? 1 : 0);
    }
    if (script.stopOnError !== void 0) {
      updates.push("stopOnError = ?");
      values.push(script.stopOnError ? 1 : 0);
    }
    if (script.timeout !== void 0) {
      updates.push("timeout = ?");
      values.push(script.timeout);
    }
    if (updates.length === 0) return;
    updates.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);
    const stmt = db.prepare(`UPDATE custom_scripts SET ${updates.join(", ")} WHERE id = ?`);
    return stmt.run(...values);
  },
  delete: (id) => {
    const stmt = db.prepare("DELETE FROM custom_scripts WHERE id = ?");
    return stmt.run(id);
  },
  deleteAll: () => {
    const stmt = db.prepare("DELETE FROM custom_scripts");
    return stmt.run();
  }
};
const formScriptQueries = {
  getByFormId: (formId) => {
    const rows = db.prepare(
      "SELECT * FROM form_scripts WHERE formId = ? ORDER BY executionOrder"
    ).all(formId);
    return rows;
  },
  getByScriptId: (scriptId) => {
    const rows = db.prepare(
      "SELECT * FROM form_scripts WHERE scriptId = ?"
    ).all(scriptId);
    return rows;
  },
  attach: (formId, scriptId, executionOrder = 0) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO form_scripts (formId, scriptId, executionOrder)
      VALUES (?, ?, ?)
    `);
    return stmt.run(formId, scriptId, executionOrder);
  },
  detach: (formId, scriptId) => {
    const stmt = db.prepare(
      "DELETE FROM form_scripts WHERE formId = ? AND scriptId = ?"
    );
    return stmt.run(formId, scriptId);
  },
  detachAllFromForm: (formId) => {
    const stmt = db.prepare("DELETE FROM form_scripts WHERE formId = ?");
    return stmt.run(formId);
  },
  detachAllFromScript: (scriptId) => {
    const stmt = db.prepare("DELETE FROM form_scripts WHERE scriptId = ?");
    return stmt.run(scriptId);
  },
  updateOrder: (formId, scriptId, executionOrder) => {
    const stmt = db.prepare(
      "UPDATE form_scripts SET executionOrder = ? WHERE formId = ? AND scriptId = ?"
    );
    return stmt.run(executionOrder, formId, scriptId);
  }
};
const aiChatQueries = {
  getAll: () => {
    const chats = db.prepare("SELECT * FROM ai_chats ORDER BY updatedAt DESC").all();
    return chats.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt)
    }));
  },
  getById: (id) => {
    const chat = db.prepare("SELECT * FROM ai_chats WHERE id = ?").get(id);
    if (!chat) return void 0;
    return {
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt)
    };
  },
  create: (title = "Neuer Chat", context) => {
    const stmt = db.prepare(`
      INSERT INTO ai_chats (title, context)
      VALUES (?, ?)
    `);
    const result = stmt.run(title, context || null);
    return aiChatQueries.getById(Number(result.lastInsertRowid));
  },
  updateTitle: (id, title) => {
    const stmt = db.prepare(`
      UPDATE ai_chats SET title = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `);
    return stmt.run(title, id);
  },
  updateTimestamp: (id) => {
    const stmt = db.prepare(`
      UPDATE ai_chats SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `);
    return stmt.run(id);
  },
  delete: (id) => {
    const stmt = db.prepare("DELETE FROM ai_chats WHERE id = ?");
    return stmt.run(id);
  },
  deleteAll: () => {
    const stmt = db.prepare("DELETE FROM ai_chats");
    return stmt.run();
  }
};
const aiMessageQueries = {
  getByChatId: (chatId) => {
    const messages = db.prepare(
      "SELECT * FROM ai_messages WHERE chatId = ? ORDER BY createdAt ASC"
    ).all(chatId);
    return messages.map((m) => ({
      ...m,
      createdAt: new Date(m.createdAt)
    }));
  },
  create: (chatId, role, content, metadata) => {
    const stmt = db.prepare(`
      INSERT INTO ai_messages (chatId, role, content, metadata)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(chatId, role, content, metadata || null);
    aiChatQueries.updateTimestamp(chatId);
    const message = db.prepare("SELECT * FROM ai_messages WHERE id = ?").get(Number(result.lastInsertRowid));
    return {
      ...message,
      createdAt: new Date(message.createdAt)
    };
  },
  delete: (id) => {
    const stmt = db.prepare("DELETE FROM ai_messages WHERE id = ?");
    return stmt.run(id);
  },
  deleteByChatId: (chatId) => {
    const stmt = db.prepare("DELETE FROM ai_messages WHERE chatId = ?");
    return stmt.run(chatId);
  }
};
const database = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  aiChatQueries,
  aiMessageQueries,
  cleanupOldTestRuns,
  customScriptQueries,
  exportQueries,
  filterPresetQueries,
  formQueries,
  formScriptQueries,
  getBaseSelectorConfig,
  getDatabase,
  getMergedSelectorConfig,
  importQueries,
  initDatabase,
  notificationQueries,
  passwordQueries,
  paymentMethodQueries,
  selectorOverrideQueries,
  settingsQueries,
  tagQueries,
  testRunQueries,
  testScheduleQueries
}, Symbol.toStringTag, { value: "Module" }));
function sanitizeError(error) {
  console.error("Error details (server-side only):", error);
  if (error instanceof Error) {
    const message = error.message;
    if (message.includes("SQLITE") || message.includes("database")) {
      return {
        message: "Ein Datenbankfehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        code: "DATABASE_ERROR"
      };
    }
    if (message.includes("encrypt") || message.includes("decrypt") || message.includes("keychain")) {
      return {
        message: "Ein Verschlüsselungsfehler ist aufgetreten. Bitte überprüfen Sie Ihre Systemeinstellungen.",
        code: "ENCRYPTION_ERROR"
      };
    }
    if (message.includes("ECONNREFUSED") || message.includes("ENOTFOUND") || message.includes("timeout")) {
      return {
        message: "Netzwerkfehler: Verbindung konnte nicht hergestellt werden.",
        code: "NETWORK_ERROR"
      };
    }
    if (message.includes("ENOENT") || message.includes("EACCES") || message.includes("permission")) {
      return {
        message: "Dateisystemfehler: Datei oder Verzeichnis nicht gefunden oder keine Berechtigung.",
        code: "FILE_ERROR"
      };
    }
    let sanitizedMessage = message.replace(/\/[^\s]+/g, "[path]").replace(/\\[^\s]+/g, "[path]").replace(/at\s+[^\s]+\s+\([^)]+\)/g, "").replace(/node_modules[^\s]*/g, "[module]").replace(/src\/[^\s]*/g, "[source]").trim();
    if (!sanitizedMessage || sanitizedMessage.length === 0) {
      sanitizedMessage = "Ein unerwarteter Fehler ist aufgetreten.";
    }
    return {
      message: sanitizedMessage,
      code: error.name || "UNKNOWN_ERROR"
    };
  }
  if (typeof error === "string") {
    return {
      message: error,
      code: "STRING_ERROR"
    };
  }
  if (error && typeof error === "object" && "message" in error) {
    const objError = error;
    if (typeof objError.message === "string") {
      return sanitizeError(new Error(objError.message));
    }
  }
  return {
    message: "Ein unerwarteter Fehler ist aufgetreten.",
    code: "UNKNOWN_ERROR"
  };
}
class TestProcessManager extends events.EventEmitter {
  constructor() {
    super();
    this.process = null;
    this.messageQueue = /* @__PURE__ */ new Map();
    this.isRunning = false;
    this.messageId = 0;
    this.buffer = "";
  }
  async startProcess() {
    if (this.isRunning) {
      console.log("Stopping existing test process before starting new one...");
      await this.stopProcess();
    }
    console.log("Starting test runner process...");
    try {
      const fs2 = require("fs");
      let runnerPath = null;
      if (process.resourcesPath) {
        const extraResourcesPath = path.join(process.resourcesPath, "testRunner", "runner.js");
        if (fs2.existsSync(extraResourcesPath)) {
          runnerPath = extraResourcesPath;
          console.log(`Using packaged app extraResources path: ${runnerPath}`);
        }
      }
      if (!runnerPath) {
        const buildPath = path.join(__dirname, "testRunner", "runner.js");
        if (fs2.existsSync(buildPath)) {
          runnerPath = buildPath;
          console.log(`Using production build path: ${runnerPath}`);
        }
      }
      if (!runnerPath) {
        const devPath = path.join(process.cwd(), "src", "main", "testRunner", "runner.js");
        if (fs2.existsSync(devPath)) {
          runnerPath = devPath;
          console.log(`Using development runner path: ${runnerPath}`);
        }
      }
      if (!runnerPath || !fs2.existsSync(runnerPath)) {
        const attemptedPaths = [
          process.resourcesPath ? path.join(process.resourcesPath, "testRunner", "runner.js") : null,
          path.join(__dirname, "testRunner", "runner.js"),
          path.join(process.cwd(), "src", "main", "testRunner", "runner.js")
        ].filter(Boolean);
        throw new Error(`Runner script not found. Attempted paths:
${attemptedPaths.map((p) => `  - ${p}`).join("\n")}`);
      }
      const runnerDir = path.dirname(runnerPath);
      this.process = child_process.spawn("node", [runnerPath], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: runnerDir,
        // Increase memory limit for Playwright
        env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=4096" }
      });
      this.isRunning = true;
      this.process.stdout?.on("data", (data) => {
        this.buffer += data.toString();
        const lines = this.buffer.split("\n");
        this.buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const message = JSON.parse(line);
            this.handleMessage(message);
          } catch (error) {
            console.log("Test runner output:", line);
          }
        }
      });
      this.process.stderr?.on("data", (data) => {
        console.log("Test runner log:", data.toString());
      });
      this.process.on("exit", (code, signal) => {
        console.log(`Test runner process exited with code ${code}, signal ${signal}`);
        this.isRunning = false;
        this.process = null;
        for (const { reject, timeout } of this.messageQueue.values()) {
          clearTimeout(timeout);
          reject(new Error("Process exited unexpectedly"));
        }
        this.messageQueue.clear();
        this.emit("processExit", { code, signal });
      });
      this.process.on("error", (error) => {
        console.error("Test runner process error:", error);
        this.isRunning = false;
        this.emit("processError", error);
      });
      let pingAttempts = 0;
      const maxPingAttempts = 3;
      while (pingAttempts < maxPingAttempts) {
        try {
          await this.ping();
          console.log("Test runner process started successfully");
          return;
        } catch (pingError) {
          pingAttempts++;
          console.log(`Ping attempt ${pingAttempts}/${maxPingAttempts} failed: ${pingError}`);
          if (pingAttempts < maxPingAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1e3));
          }
        }
      }
      throw new Error("Failed to establish communication with test runner after multiple attempts");
    } catch (error) {
      console.error("Failed to start test runner process:", error);
      this.isRunning = false;
      if (this.process) {
        try {
          this.process.kill("SIGKILL");
        } catch (e) {
        }
        this.process = null;
      }
      throw error;
    }
  }
  async stopProcess() {
    if (!this.isRunning || !this.process) {
      return;
    }
    console.log("Stopping test runner process...");
    try {
      this.process.kill("SIGTERM");
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      if (this.isRunning) {
        this.process.kill("SIGKILL");
      }
    } catch (error) {
      console.error("Error stopping test runner process:", error);
    }
    this.isRunning = false;
    this.process = null;
  }
  async runTest(testRunId, form, paymentMethod, settings, qualityTestOptions, retryCount = 0) {
    const maxRetries = 0;
    const testTimeout = parseInt(settings.test_timeout || "180000");
    try {
      console.log(`Starting test ${testRunId}: ${form.name} with ${paymentMethod.name} (attempt ${retryCount + 1}/${maxRetries + 1})`);
      const startTimeout = 15e3;
      const startPromise = this.startProcess();
      const startTimeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Process start timeout")), startTimeout)
      );
      try {
        await Promise.race([startPromise, startTimeoutPromise]);
      } catch (startError) {
        console.error(`Failed to start process: ${startError}`);
        throw new Error(`Failed to start test runner: ${startError instanceof Error ? startError.message : startError}`);
      }
      const selectorConfig = getMergedSelectorConfig();
      const globalFieldDefaults = settingsQueries.getFieldDefaults();
      console.log("ProcessManager: Global field defaults:", JSON.stringify(globalFieldDefaults));
      const appPath = electron.app.getAppPath();
      const basePath = appPath.includes(".asar") ? path.join(appPath, "..", "..") : appPath;
      const message = {
        id: this.generateMessageId(),
        type: "START_TEST",
        payload: {
          testRunId,
          form,
          paymentMethod,
          settings,
          selectorConfig,
          globalFieldDefaults,
          qualityTestOptions,
          basePath
        }
      };
      const response = await this.sendMessage(message, testTimeout + 3e4);
      await this.stopProcess();
      if (response.payload?.success) {
        return {
          success: true,
          duration: response.payload.result?.duration || 0,
          logs: response.payload.result?.logs || [],
          steps: response.payload.result?.steps || [],
          formAnalysis: response.payload.result?.formAnalysis,
          seoResults: response.payload.result?.seoResults,
          accessibilityResults: response.payload.result?.accessibilityResults
        };
      } else {
        return {
          success: false,
          error: response.payload?.error || "Test execution failed",
          duration: response.payload?.result?.duration || 0,
          logs: response.payload?.result?.logs || response.payload?.logs || [],
          steps: response.payload?.result?.steps || [],
          seoResults: response.payload?.result?.seoResults,
          accessibilityResults: response.payload?.result?.accessibilityResults
        };
      }
    } catch (error) {
      console.error(`Test ${testRunId} attempt ${retryCount + 1} failed:`, error);
      if (retryCount < maxRetries) {
        const backoffMs = Math.min(3e3 * Math.pow(2, retryCount), 1e4);
        console.log(`Retrying test ${testRunId} in ${backoffMs}ms (attempt ${retryCount + 2}/${maxRetries + 1})...`);
        if (this.isRunning || this.process) {
          console.log("Force stopping process before retry...");
          try {
            this.process?.kill("SIGKILL");
          } catch (e) {
          }
          this.isRunning = false;
          this.process = null;
          for (const { reject, timeout } of this.messageQueue.values()) {
            clearTimeout(timeout);
            reject(new Error("Process force stopped for retry"));
          }
          this.messageQueue.clear();
        }
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        return this.runTest(testRunId, form, paymentMethod, settings, qualityTestOptions, retryCount + 1);
      }
      const sanitized = sanitizeError(error);
      return {
        success: false,
        error: sanitized.message,
        duration: 0,
        logs: [`Failed after ${maxRetries + 1} attempts: ${sanitized.message}`]
      };
    }
  }
  async ping() {
    const message = {
      id: this.generateMessageId(),
      type: "PING"
    };
    await this.sendMessage(message, 5e3);
  }
  sendMessage(message, timeoutMs = 3e4) {
    return new Promise((resolve, reject) => {
      if (!this.process || !this.isRunning) {
        reject(new Error("Test process not running"));
        return;
      }
      const timeout = setTimeout(() => {
        this.messageQueue.delete(message.id);
        reject(new Error(`Message timeout: ${message.type}`));
      }, timeoutMs);
      this.messageQueue.set(message.id, { resolve, reject, timeout });
      try {
        const messageStr = JSON.stringify(message) + "\n";
        this.process.stdin?.write(messageStr);
      } catch (error) {
        this.messageQueue.delete(message.id);
        clearTimeout(timeout);
        reject(error);
      }
    });
  }
  handleMessage(message) {
    const handler = this.messageQueue.get(message.id);
    if (handler) {
      clearTimeout(handler.timeout);
      this.messageQueue.delete(message.id);
      if (message.type === "ERROR") {
        handler.reject(new Error(message.payload?.error || "Unknown error"));
      } else {
        handler.resolve(message);
      }
    } else {
      this.emit("message", message);
    }
  }
  generateMessageId() {
    return `msg_${++this.messageId}_${Date.now()}`;
  }
  isProcessRunning() {
    return this.isRunning;
  }
}
let processManager = null;
function getTestProcessManager() {
  if (!processManager) {
    processManager = new TestProcessManager();
    process.on("exit", () => {
      processManager?.stopProcess();
    });
    process.on("SIGINT", () => {
      processManager?.stopProcess();
      process.exit(0);
    });
    process.on("SIGTERM", () => {
      processManager?.stopProcess();
      process.exit(0);
    });
  }
  return processManager;
}
class EmailService {
  constructor() {
    this.transporter = null;
    this.config = null;
  }
  /**
   * Load email configuration from database settings
   */
  loadConfig() {
    const getSettingValue = (key, defaultValue) => {
      const setting = settingsQueries.get(key);
      return setting?.value || defaultValue;
    };
    this.config = {
      enabled: getSettingValue("email_enabled", "false") === "true",
      smtpHost: getSettingValue("email_smtp_host", ""),
      smtpPort: parseInt(getSettingValue("email_smtp_port", "587")),
      smtpSecure: getSettingValue("email_smtp_secure", "false") === "true",
      smtpUser: getSettingValue("email_smtp_user", ""),
      smtpPass: getSettingValue("email_smtp_pass", ""),
      fromEmail: getSettingValue("email_from_email", ""),
      fromName: getSettingValue("email_from_name", "FormTest Server"),
      toEmail: getSettingValue("email_to_email", ""),
      notifyOnSuccess: getSettingValue("email_notify_success", "false") === "true",
      notifyOnFailure: getSettingValue("email_notify_failure", "true") === "true"
    };
    return this.config;
  }
  /**
   * Initialize the email transporter
   */
  async initialize() {
    const config = this.loadConfig();
    if (!config.enabled) {
      console.log("EmailService: Email notifications are disabled");
      return false;
    }
    if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
      console.log("EmailService: SMTP configuration incomplete");
      return false;
    }
    try {
      this.transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass
        }
      });
      await this.transporter.verify();
      console.log("EmailService: SMTP connection verified successfully");
      return true;
    } catch (error) {
      console.error("EmailService: Failed to initialize SMTP connection:", error);
      this.transporter = null;
      return false;
    }
  }
  /**
   * Send a test result notification email
   */
  async sendTestResultNotification(result) {
    const config = this.loadConfig();
    if (!config.enabled) {
      return false;
    }
    if (result.status === "SUCCESS" && !config.notifyOnSuccess) {
      return false;
    }
    if ((result.status === "FAILURE" || result.status === "STOPPED") && !config.notifyOnFailure) {
      return false;
    }
    if (!this.transporter) {
      const initialized = await this.initialize();
      if (!initialized) {
        return false;
      }
    }
    const isSuccess = result.status === "SUCCESS";
    const statusEmoji = isSuccess ? "✅" : "❌";
    const statusText = isSuccess ? "Erfolgreich" : result.status === "STOPPED" ? "Gestoppt" : "Fehlgeschlagen";
    const duration = result.durationMs ? `${(result.durationMs / 1e3).toFixed(1)}s` : "N/A";
    const subject = `${statusEmoji} FormTest: ${result.formName} × ${result.paymentMethodName} - ${statusText}`;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { padding: 20px; background: ${isSuccess ? "#10b981" : "#ef4444"}; color: white; }
    .header h1 { margin: 0; font-size: 20px; }
    .content { padding: 20px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .info-label { color: #666; }
    .info-value { font-weight: 500; }
    .error-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 12px; margin-top: 16px; color: #991b1b; }
    .footer { padding: 16px 20px; background: #f9fafb; color: #666; font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${statusEmoji} Test ${statusText}</h1>
    </div>
    <div class="content">
      <div class="info-row">
        <span class="info-label">Formular</span>
        <span class="info-value">${result.formName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Bezahlmethode</span>
        <span class="info-value">${result.paymentMethodName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status</span>
        <span class="info-value">${statusText}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Dauer</span>
        <span class="info-value">${duration}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Zeitpunkt</span>
        <span class="info-value">${new Date(result.runAt).toLocaleString("de-DE")}</span>
      </div>
      ${result.errorMessage ? `
      <div class="error-box">
        <strong>Fehlermeldung:</strong><br>
        ${result.errorMessage}
      </div>
      ` : ""}
    </div>
    <div class="footer">
      Diese E-Mail wurde automatisch von FormTest Server gesendet.
    </div>
  </div>
</body>
</html>
    `;
    const textContent = `
Test ${statusText}: ${result.formName} × ${result.paymentMethodName}

Status: ${statusText}
Dauer: ${duration}
Zeitpunkt: ${new Date(result.runAt).toLocaleString("de-DE")}
${result.errorMessage ? `
Fehler: ${result.errorMessage}` : ""}

--
FormTest Server
    `;
    try {
      await this.transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: config.toEmail,
        subject,
        text: textContent,
        html: htmlContent
      });
      console.log(`EmailService: Notification sent for test ${result.testRunId}`);
      return true;
    } catch (error) {
      console.error("EmailService: Failed to send notification:", error);
      return false;
    }
  }
  /**
   * Test the email configuration by sending a test email
   */
  async sendTestEmail() {
    const config = this.loadConfig();
    if (!config.smtpHost || !config.toEmail) {
      return { success: false, message: "SMTP-Konfiguration unvollständig" };
    }
    try {
      const initialized = await this.initialize();
      if (!initialized) {
        return { success: false, message: "SMTP-Verbindung fehlgeschlagen" };
      }
      await this.transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: config.toEmail,
        subject: "🧪 FormTest Server - Test E-Mail",
        text: "Dies ist eine Test-E-Mail von FormTest Server. Wenn Sie diese E-Mail erhalten, funktioniert die E-Mail-Konfiguration korrekt.",
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>🧪 Test E-Mail</h2>
            <p>Dies ist eine Test-E-Mail von FormTest Server.</p>
            <p>Wenn Sie diese E-Mail erhalten, funktioniert die E-Mail-Konfiguration korrekt.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">FormTest Server</p>
          </div>
        `
      });
      return { success: true, message: "Test-E-Mail erfolgreich gesendet" };
    } catch (error) {
      return { success: false, message: `Fehler: ${error.message}` };
    }
  }
}
const emailService = new EmailService();
async function runSingleTest(testRunId, form, paymentMethod, settings, qualityTestOptions) {
  console.log(`Running test ${testRunId}: ${form.name} with ${paymentMethod.name}`);
  const testRun = testRunQueries.getById(testRunId);
  const isScheduled = testRun?.isScheduled;
  try {
    const processManager2 = getTestProcessManager();
    const result = await processManager2.runTest(testRunId, form, paymentMethod, settings, qualityTestOptions);
    await testRunQueries.updateStatus(testRunId, result.success ? "SUCCESS" : "FAILURE", result.error, result.duration, result.steps);
    if (result.seoResults || result.accessibilityResults) {
      testRunQueries.updateQualityResults(testRunId, result.seoResults, result.accessibilityResults);
      console.log(`Test ${testRunId} quality results: SEO=${result.seoResults?.score ?? "N/A"}, A11y=${result.accessibilityResults?.score ?? "N/A"}`);
    }
    console.log(`Test ${testRunId} completed: ${result.success ? "SUCCESS" : "FAILURE"} with ${result.steps?.length || 0} steps`);
    if (isScheduled) {
      notificationQueries.create({
        type: result.success ? "test_complete" : "test_failed",
        title: result.success ? "Autopilot Test erfolgreich" : "Autopilot Test fehlgeschlagen",
        message: `${form.name} × ${paymentMethod.name}`,
        testRunId
      });
      const allWindows = electron.BrowserWindow.getAllWindows();
      allWindows.forEach((window) => {
        window.webContents.send("notifications:updated");
      });
      emailService.sendTestResultNotification({
        testRunId,
        formName: form.name,
        paymentMethodName: paymentMethod.name,
        status: result.success ? "SUCCESS" : "FAILURE",
        errorMessage: result.error,
        durationMs: result.duration,
        runAt: /* @__PURE__ */ new Date()
      }).catch((err) => console.error("Failed to send email notification:", err));
    }
  } catch (error) {
    console.error(`Test ${testRunId} failed with error:`, error);
    const sanitized = sanitizeError(error);
    const errorSteps = [
      {
        id: "test-error",
        name: "Test fehlgeschlagen",
        status: "error",
        startTime: (/* @__PURE__ */ new Date()).toISOString(),
        endTime: (/* @__PURE__ */ new Date()).toISOString(),
        duration: 0,
        message: sanitized.message,
        error: sanitized.message
      }
    ];
    await testRunQueries.updateStatus(testRunId, "FAILURE", sanitized.message, 0, errorSteps);
    if (isScheduled) {
      notificationQueries.create({
        type: "test_failed",
        title: "Autopilot Test fehlgeschlagen",
        message: `${form.name} × ${paymentMethod.name}`,
        testRunId
      });
      const allWindows = electron.BrowserWindow.getAllWindows();
      allWindows.forEach((window) => {
        window.webContents.send("notifications:updated");
      });
      emailService.sendTestResultNotification({
        testRunId,
        formName: form.name,
        paymentMethodName: paymentMethod.name,
        status: "FAILURE",
        errorMessage: sanitized.message,
        runAt: /* @__PURE__ */ new Date()
      }).catch((err) => console.error("Failed to send email notification:", err));
    }
  }
}
async function createAndRunTest(formId, paymentMethodId, qualityTestOptions) {
  try {
    const form = formQueries.getById(formId);
    const paymentMethod = await paymentMethodQueries.getById(paymentMethodId);
    if (!form || !paymentMethod) {
      throw new Error(`Form ${formId} or PaymentMethod ${paymentMethodId} not found`);
    }
    const settings = settingsQueries.getAll();
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    const testRun = testRunQueries.create({
      uuid: crypto.randomUUID(),
      formId: form.id,
      paymentMethodId: paymentMethod.id,
      status: "QUEUED",
      logDetails: JSON.stringify([`Autopilot test queued for ${form.name} with ${paymentMethod.name}`]),
      errorMessage: void 0,
      durationMs: void 0,
      isScheduled: true,
      amount: settingsMap["default_donation_amount"] || "5",
      interval: settingsMap["default_interval"] || "0"
    });
    const testRunId = testRun.lastInsertRowid;
    const testQueue = getTestQueue();
    testQueue.enqueue(testRunId, form, paymentMethod, settingsMap, qualityTestOptions);
    console.log(`[Scheduler] Test ${testRunId} added to queue for ${form.name} × ${paymentMethod.name}`);
    return testRunId;
  } catch (error) {
    console.error("Failed to create and run scheduled test:", error);
    throw error;
  }
}
class TestQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.currentTest = null;
  }
  /**
   * Reset queue state without marking tests as STOPPED
   * Used when app closes - keeps tests in RUNNING/QUEUED state for recovery dialog
   */
  resetState() {
    this.queue = [];
    this.currentTest = null;
    this.isProcessing = false;
    console.log("[TestQueue] State reset (tests remain in RUNNING/QUEUED state in database)");
  }
  /**
   * Add a test to the queue
   */
  enqueue(testRunId, form, paymentMethod, settings, qualityTestOptions) {
    const queuedTest = {
      testRunId,
      form,
      paymentMethod,
      settings,
      qualityTestOptions,
      addedAt: Date.now()
    };
    this.queue.push(queuedTest);
    console.log(`[TestQueue] Added test ${testRunId} to queue. Queue length: ${this.queue.length}`);
    if (!this.isProcessing) {
      this.processNext();
    }
  }
  /**
   * Process the next test in the queue
   */
  async processNext() {
    if (this.isProcessing) {
      console.log("[TestQueue] Already processing a test, waiting...");
      return;
    }
    if (this.queue.length === 0) {
      console.log("[TestQueue] Queue is empty, nothing to process");
      return;
    }
    this.isProcessing = true;
    this.currentTest = this.queue.shift();
    const { testRunId, form, paymentMethod, settings, qualityTestOptions } = this.currentTest;
    const waitTime = Date.now() - this.currentTest.addedAt;
    console.log(`[TestQueue] Starting test ${testRunId} (waited ${waitTime}ms in queue). Remaining in queue: ${this.queue.length}`);
    try {
      const dbTest = testRunQueries.getById(testRunId);
      if (!dbTest || dbTest.status !== "QUEUED") {
        console.log(`[TestQueue] Test ${testRunId} is no longer QUEUED in database (status: ${dbTest?.status || "missing"}), skipping`);
        this.currentTest = null;
        this.isProcessing = false;
        if (this.queue.length > 0) {
          this.processNext();
        }
        return;
      }
      testRunQueries.updateStatus(testRunId, "RUNNING");
      await runSingleTest(testRunId, form, paymentMethod, settings, qualityTestOptions);
      console.log(`[TestQueue] Test ${testRunId} completed`);
    } catch (error) {
      console.error(`[TestQueue] Test ${testRunId} failed with error:`, error);
      const dbTest = testRunQueries.getById(testRunId);
      if (dbTest && dbTest.status === "RUNNING") {
        testRunQueries.updateStatus(testRunId, "FAILURE", error instanceof Error ? error.message : String(error));
      }
    } finally {
      this.currentTest = null;
      this.isProcessing = false;
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (this.queue.length > 0) {
        this.processNext();
      } else {
        this.recoverStuckTests();
      }
    }
  }
  /**
   * Recover tests that are QUEUED in database but not in memory queue
   * This can happen if the app restarts or queue gets out of sync
   */
  async recoverStuckTests() {
    if (this.isProcessing) {
      return;
    }
    const allTests = testRunQueries.getAll();
    const queuedTests = allTests.filter((t) => t.status === "QUEUED");
    if (queuedTests.length === 0) {
      return;
    }
    console.log(`[TestQueue] Found ${queuedTests.length} QUEUED test(s) in database that are not in memory queue - recovering...`);
    const { formQueries: formQueries2, paymentMethodQueries: paymentMethodQueries2 } = await Promise.resolve().then(() => database);
    const { settingsQueries: settingsQueries2 } = await Promise.resolve().then(() => database);
    const { customScriptQueries: customScriptQueries2 } = await Promise.resolve().then(() => database);
    for (const test of queuedTests) {
      if (this.queue.some((q) => q.testRunId === test.id)) {
        continue;
      }
      const form = formQueries2.getById(test.formId || 0);
      const paymentMethod = await paymentMethodQueries2.getById(test.paymentMethodId || 0);
      if (!form || !paymentMethod) {
        console.log(`[TestQueue] Skipping orphaned test ${test.id} (form or payment method missing)`);
        continue;
      }
      const settings = settingsQueries2.getAll();
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      const customScripts = customScriptQueries2.getScriptsForTest(form.id);
      const settingsWithScripts = { ...settingsMap, customScripts };
      console.log(`[TestQueue] Re-enqueuing test ${test.id} (${form.name} × ${paymentMethod.name})`);
      this.queue.push({
        testRunId: test.id,
        form,
        paymentMethod,
        settings: settingsWithScripts,
        qualityTestOptions: void 0,
        addedAt: Date.now()
      });
    }
    if (this.queue.length > 0 && !this.isProcessing) {
      console.log(`[TestQueue] Starting recovery processing for ${this.queue.length} test(s)`);
      this.processNext();
    }
  }
  /**
   * Manually trigger queue processing
   * Useful when user wants to start processing queued tests
   */
  async triggerProcessing() {
    await this.recoverStuckTests();
    if (!this.isProcessing && this.queue.length > 0) {
      this.processNext();
    }
  }
  /**
   * Get current queue status with detailed info
   * Cross-references with database to ensure consistency
   */
  getStatus() {
    if (this.currentTest && this.isProcessing) {
      const dbTest = testRunQueries.getById(this.currentTest.testRunId);
      if (!dbTest || dbTest.status !== "RUNNING") {
        console.log(`[TestQueue] Sync fix: currentTest ${this.currentTest.testRunId} is ${dbTest?.status || "missing"} in DB, resetting queue state`);
        this.currentTest = null;
        this.isProcessing = false;
        if (this.queue.length > 0) {
          console.log(`[TestQueue] Attempting to continue processing after sync fix`);
          this.processNext();
        }
      }
    }
    const validQueue = this.queue.filter((t) => {
      const dbTest = testRunQueries.getById(t.testRunId);
      if (!dbTest || dbTest.status !== "QUEUED") {
        console.log(`[TestQueue] Sync fix: removing ${t.testRunId} from queue (DB status: ${dbTest?.status || "missing"})`);
        return false;
      }
      return true;
    });
    if (validQueue.length !== this.queue.length) {
      this.queue = validQueue;
    }
    if (!this.isProcessing && this.queue.length > 0) {
      console.log(`[TestQueue] Queue has ${this.queue.length} items but not processing - starting processing`);
      this.processNext();
    }
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      currentTestId: this.currentTest?.testRunId || null,
      currentTestName: this.currentTest ? `${this.currentTest.form.name} × ${this.currentTest.paymentMethod.name}` : null,
      queuedTests: this.queue.map((t) => ({
        testRunId: t.testRunId,
        formName: t.form.name,
        paymentMethodName: t.paymentMethod.name
      })),
      totalPending: this.queue.length + (this.isProcessing ? 1 : 0)
    };
  }
  /**
   * Remove a specific test from the queue by its testRunId
   * Does NOT update database - caller is responsible for that
   */
  removeFromQueue(testRunId) {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter((t) => t.testRunId !== testRunId);
    const removed = this.queue.length < initialLength;
    if (removed) {
      console.log(`[TestQueue] Removed test ${testRunId} from queue`);
    }
    return removed;
  }
  /**
   * Clear the queue (does not stop current test)
   * Updates database status for cleared tests to STOPPED
   */
  clear() {
    const clearedIds = this.queue.map((t) => t.testRunId);
    const stoppedSteps = [
      {
        id: "queue-cleared",
        name: "Aus Warteschlange entfernt",
        status: "stopped",
        startTime: (/* @__PURE__ */ new Date()).toISOString(),
        endTime: (/* @__PURE__ */ new Date()).toISOString(),
        duration: 0,
        message: "Test wurde aus der Warteschlange entfernt bevor er gestartet wurde"
      }
    ];
    for (const testRunId of clearedIds) {
      testRunQueries.updateStatus(testRunId, "STOPPED", void 0, 0, stoppedSteps);
    }
    this.queue = [];
    console.log(`[TestQueue] Cleared ${clearedIds.length} tests from queue`);
    return { clearedIds };
  }
  /**
   * Stop the currently running test and clear the queue
   * This kills the browser process and marks the test as STOPPED
   */
  async stopAll() {
    const currentTestId = this.currentTest?.testRunId || null;
    const wasProcessing = this.isProcessing;
    this.currentTest = null;
    this.isProcessing = false;
    const { clearedIds } = this.clear();
    if (currentTestId && wasProcessing) {
      console.log(`[TestQueue] Stopping current test ${currentTestId}...`);
      try {
        const processManager2 = getTestProcessManager();
        await processManager2.stopProcess();
        const stoppedSteps = [
          {
            id: "test-stopped",
            name: "Test gestoppt",
            status: "stopped",
            startTime: (/* @__PURE__ */ new Date()).toISOString(),
            endTime: (/* @__PURE__ */ new Date()).toISOString(),
            duration: 0,
            message: "Test wurde vom Benutzer manuell gestoppt"
          }
        ];
        testRunQueries.updateStatus(currentTestId, "STOPPED", void 0, 0, stoppedSteps);
        console.log(`[TestQueue] Test ${currentTestId} stopped`);
      } catch (error) {
        console.error(`[TestQueue] Error stopping test ${currentTestId}:`, error);
      }
    }
    console.log(`[TestQueue] stopAll complete. Queue state: isProcessing=${this.isProcessing}, currentTest=${this.currentTest}`);
    return { stoppedId: currentTestId, clearedIds };
  }
}
let testQueueInstance = null;
function getTestQueue() {
  if (!testQueueInstance) {
    testQueueInstance = new TestQueue();
  }
  return testQueueInstance;
}
class SchedulerService {
  constructor() {
    this.jobs = /* @__PURE__ */ new Map();
  }
  /**
   * Initialize scheduler by loading all active jobs from database
   */
  init() {
    console.log("Scheduler: Initializing...");
    const schedules = testScheduleQueries.getAll();
    console.log(`Scheduler: Found ${schedules.length} schedules`);
    for (const schedule of schedules) {
      if (schedule.isActive) {
        this.scheduleJob(schedule);
      }
    }
    console.log(`Scheduler: Started ${this.jobs.size} active jobs`);
  }
  /**
   * Schedule a new cron job
   */
  scheduleJob(schedule) {
    this.stopJob(schedule.id);
    if (!cron__namespace.validate(schedule.cronExpression)) {
      console.error(`Scheduler: Invalid cron expression for schedule ${schedule.id}: ${schedule.cronExpression}`);
      return;
    }
    console.log(`Scheduler: Scheduling job ${schedule.id} (${schedule.name}) with cron: ${schedule.cronExpression}`);
    const task = cron__namespace.schedule(schedule.cronExpression, async () => {
      console.log(`Scheduler: Executing job ${schedule.id} (${schedule.name})...`);
      try {
        const qualityTestOptions = {
          enableSeoTest: schedule.enableSeoTest || false,
          enableAccessibilityTest: schedule.enableAccessibilityTest || false
        };
        await createAndRunTest(schedule.formId, schedule.paymentMethodId, qualityTestOptions);
        testScheduleQueries.update(schedule.id, { lastRun: /* @__PURE__ */ new Date() });
        console.log(`Scheduler: Job ${schedule.id} execution initiated successfully`);
      } catch (error) {
        console.error(`Scheduler: Job ${schedule.id} failed to start:`, error);
      }
    });
    this.jobs.set(schedule.id, task);
  }
  /**
   * Manually execute a job immediately
   */
  async runJobNow(id) {
    const schedule = testScheduleQueries.getById(id);
    if (!schedule) {
      throw new Error(`Schedule with ID ${id} not found`);
    }
    console.log(`Scheduler: Manually executing job ${schedule.id} (${schedule.name})...`);
    try {
      const qualityTestOptions = {
        enableSeoTest: schedule.enableSeoTest || false,
        enableAccessibilityTest: schedule.enableAccessibilityTest || false
      };
      await createAndRunTest(schedule.formId, schedule.paymentMethodId, qualityTestOptions);
      testScheduleQueries.update(schedule.id, { lastRun: /* @__PURE__ */ new Date() });
      console.log(`Scheduler: Manual job ${schedule.id} execution initiated successfully`);
      return { success: true };
    } catch (error) {
      console.error(`Scheduler: Manual job ${schedule.id} failed to start:`, error);
      throw error;
    }
  }
  /**
   * Stop a scheduled job
   */
  stopJob(id) {
    const job = this.jobs.get(id);
    if (job) {
      job.stop();
      this.jobs.delete(id);
      console.log(`Scheduler: Stopped job ${id}`);
    }
  }
  /**
   * Reload a job (e.g. after update)
   */
  reloadJob(id) {
    const schedule = testScheduleQueries.getById(id);
    if (schedule) {
      if (schedule.isActive) {
        this.scheduleJob(schedule);
      } else {
        this.stopJob(id);
      }
    }
  }
}
const scheduler = new SchedulerService();
let server = null;
let apiKey = null;
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => body += chunk.toString());
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key"
  });
  res.end(JSON.stringify(data));
}
function authenticate(req) {
  const providedKey = req.headers["x-api-key"];
  if (!apiKey || !providedKey) return false;
  return providedKey === apiKey;
}
async function handleRequest(req, res) {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const path2 = url.pathname;
  const method = req.method || "GET";
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key"
    });
    res.end();
    return;
  }
  if (path2 === "/api/health" && method === "GET") {
    sendJson(res, 200, {
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0.0"
    });
    return;
  }
  if (!authenticate(req)) {
    sendJson(res, 401, { error: "Unauthorized", message: "Invalid or missing X-API-Key header" });
    return;
  }
  try {
    if (path2 === "/api/forms" && method === "GET") {
      const forms = formQueries.getAll();
      sendJson(res, 200, {
        success: true,
        count: forms.length,
        data: forms.map((f) => ({
          id: f.id,
          name: f.name,
          url: f.url,
          isActive: f.isActive
        }))
      });
      return;
    }
    if (path2 === "/api/payment-methods" && method === "GET") {
      const methods = await paymentMethodQueries.getAll();
      sendJson(res, 200, {
        success: true,
        count: methods.length,
        data: methods.map((m) => ({
          id: m.id,
          name: m.name,
          type: m.type,
          isActive: m.isActive
          // Note: details are intentionally excluded for security
        }))
      });
      return;
    }
    if (path2 === "/api/schedules" && method === "GET") {
      const schedules = testScheduleQueries.getAll();
      sendJson(res, 200, {
        success: true,
        count: schedules.length,
        data: schedules.map((s) => ({
          id: s.id,
          name: s.name,
          formId: s.formId,
          paymentMethodId: s.paymentMethodId,
          cronExpression: s.cronExpression,
          isActive: s.isActive,
          lastRun: s.lastRun
        }))
      });
      return;
    }
    if (path2 === "/api/tests/run" && method === "POST") {
      const body = await parseBody(req);
      const { formIds, paymentMethodIds } = body;
      if (!formIds || !Array.isArray(formIds) || formIds.length === 0) {
        sendJson(res, 400, { error: "Bad Request", message: "formIds array is required" });
        return;
      }
      if (!paymentMethodIds || !Array.isArray(paymentMethodIds) || paymentMethodIds.length === 0) {
        sendJson(res, 400, { error: "Bad Request", message: "paymentMethodIds array is required" });
        return;
      }
      const forms = formQueries.getAll().filter((f) => formIds.includes(f.id));
      const methods = await paymentMethodQueries.getAll();
      const filteredMethods = methods.filter((m) => paymentMethodIds.includes(m.id));
      if (forms.length === 0) {
        sendJson(res, 404, { error: "Not Found", message: "No forms found with provided IDs" });
        return;
      }
      if (filteredMethods.length === 0) {
        sendJson(res, 404, { error: "Not Found", message: "No payment methods found with provided IDs" });
        return;
      }
      const allSettings = settingsQueries.getAll();
      const settingsMap = {};
      allSettings.forEach((s) => {
        settingsMap[s.key] = s.value;
      });
      const testIds = [];
      const testUuids = [];
      const queuedTests = [];
      const db2 = getDatabase();
      db2.transaction(() => {
        for (const form of forms) {
          for (const pm of filteredMethods) {
            const uuid = crypto.randomUUID();
            const result = testRunQueries.create({
              uuid,
              formId: form.id,
              paymentMethodId: pm.id,
              status: "QUEUED",
              errorMessage: void 0,
              logDetails: void 0,
              steps: [],
              durationMs: void 0,
              isScheduled: false,
              amount: settingsMap["default_donation_amount"] || "5",
              interval: settingsMap["default_interval"] || "0"
            });
            const testId = result.lastInsertRowid;
            testIds.push(testId);
            testUuids.push(uuid);
            queuedTests.push({ testId, uuid, form, pm });
          }
        }
      })();
      for (const { testId, form, pm } of queuedTests) {
        getTestQueue().enqueue(testId, form, pm, settingsMap);
      }
      sendJson(res, 200, {
        success: true,
        message: `${testIds.length} test(s) queued`,
        testIds,
        testUuids
      });
      return;
    }
    if (path2 === "/api/tests" && method === "GET") {
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const status = url.searchParams.get("status");
      let tests = testRunQueries.getAll();
      if (status) {
        tests = tests.filter((t) => t.status === status.toUpperCase());
      }
      tests = tests.slice(0, Math.min(limit, 100));
      sendJson(res, 200, {
        success: true,
        count: tests.length,
        data: tests.map((t) => ({
          id: t.id,
          uuid: t.uuid,
          formId: t.formId,
          paymentMethodId: t.paymentMethodId,
          status: t.status,
          durationMs: t.durationMs,
          runAt: t.runAt,
          errorMessage: t.errorMessage
        }))
      });
      return;
    }
    const testByIdMatch = path2.match(/^\/api\/tests\/(\d+)$/);
    if (testByIdMatch && method === "GET") {
      const testId = parseInt(testByIdMatch[1]);
      const test = testRunQueries.getById(testId);
      if (!test) {
        sendJson(res, 404, { error: "Not Found", message: "Test not found" });
        return;
      }
      sendJson(res, 200, {
        success: true,
        data: {
          id: test.id,
          uuid: test.uuid,
          formId: test.formId,
          paymentMethodId: test.paymentMethodId,
          status: test.status,
          durationMs: test.durationMs,
          runAt: test.runAt,
          errorMessage: test.errorMessage,
          steps: test.steps,
          notes: test.notes
        }
      });
      return;
    }
    const testStatusMatch = path2.match(/^\/api\/tests\/(\d+)\/status$/);
    if (testStatusMatch && method === "GET") {
      const testId = parseInt(testStatusMatch[1]);
      const test = testRunQueries.getById(testId);
      if (!test) {
        sendJson(res, 404, { error: "Not Found", message: "Test not found" });
        return;
      }
      sendJson(res, 200, {
        success: true,
        data: {
          id: test.id,
          uuid: test.uuid,
          status: test.status,
          durationMs: test.durationMs,
          errorMessage: test.errorMessage
        }
      });
      return;
    }
    const testByUuidMatch = path2.match(/^\/api\/tests\/uuid\/([a-f0-9-]+)$/i);
    if (testByUuidMatch && method === "GET") {
      const uuid = testByUuidMatch[1];
      const tests = testRunQueries.getAll();
      const test = tests.find((t) => t.uuid === uuid);
      if (!test) {
        sendJson(res, 404, { error: "Not Found", message: "Test not found" });
        return;
      }
      sendJson(res, 200, {
        success: true,
        data: {
          id: test.id,
          uuid: test.uuid,
          formId: test.formId,
          paymentMethodId: test.paymentMethodId,
          status: test.status,
          durationMs: test.durationMs,
          runAt: test.runAt,
          errorMessage: test.errorMessage,
          steps: test.steps
        }
      });
      return;
    }
    if (path2 === "/api/queue/status" && method === "GET") {
      const status = getTestQueue().getStatus();
      sendJson(res, 200, {
        success: true,
        data: status
      });
      return;
    }
    sendJson(res, 404, { error: "Not Found", message: `Unknown endpoint: ${method} ${path2}` });
  } catch (error) {
    console.error("[API] Error handling request:", error);
    const sanitized = sanitizeError(error);
    sendJson(res, 500, {
      error: "Internal Server Error",
      message: sanitized.message
    });
  }
}
async function startApiServer(port, key) {
  return new Promise(async (resolve, reject) => {
    if (server) {
      console.log("[API] Server already running");
      resolve();
      return;
    }
    try {
      await settingsQueries.setApiKey(key);
      apiKey = key;
    } catch (error) {
      console.error("[API] Failed to encrypt API key:", error);
      reject(new Error("Failed to store API key"));
      return;
    }
    server = http.createServer((req, res) => {
      handleRequest(req, res).catch((error) => {
        console.error("[API] Unhandled error:", error);
        sendJson(res, 500, { error: "Internal Server Error" });
      });
    });
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`[API] Port ${port} is already in use`);
        reject(new Error(`Port ${port} is already in use`));
      } else {
        reject(error);
      }
    });
    server.listen(port, "127.0.0.1", () => {
      console.log(`[API] Server running on http://127.0.0.1:${port}`);
      resolve();
    });
  });
}
function stopApiServer() {
  return new Promise((resolve) => {
    if (!server) {
      resolve();
      return;
    }
    server.close(() => {
      console.log("[API] Server stopped");
      server = null;
      apiKey = null;
      resolve();
    });
  });
}
function isApiServerRunning() {
  return server !== null && server.listening;
}
function generateApiKey() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}
class BaseAIProvider {
  constructor(config) {
    this.config = config;
  }
}
class OpenAIProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.baseUrl = "https://api.openai.com/v1";
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }
  get name() {
    return "OpenAI";
  }
  async chat(messages, systemPrompt) {
    const allMessages = [];
    if (systemPrompt) {
      allMessages.push({ role: "system", content: systemPrompt });
    }
    allMessages.push(...messages);
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 4096
      })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
    }
    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || "",
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens
      } : void 0
    };
  }
  async streamChat(messages, systemPrompt, callbacks) {
    const allMessages = [];
    if (systemPrompt) {
      allMessages.push({ role: "system", content: systemPrompt });
    }
    allMessages.push(...messages);
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: true
      })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
    }
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }
    const decoder = new TextDecoder();
    let fullContent = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || "";
              if (content) {
                fullContent += content;
                callbacks.onToken?.(content);
              }
            } catch {
            }
          }
        }
      }
      callbacks.onComplete?.(fullContent);
    } catch (error) {
      callbacks.onError?.(error);
      throw error;
    }
  }
  async validateKey() {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          "Authorization": `Bearer ${this.config.apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  async getAvailableModels() {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          "Authorization": `Bearer ${this.config.apiKey}`
        }
      });
      if (!response.ok) return this.getDefaultModels();
      const data = await response.json();
      const chatModels = data.data.filter((m) => m.id.includes("gpt")).map((m) => m.id).sort();
      return chatModels.length > 0 ? chatModels : this.getDefaultModels();
    } catch {
      return this.getDefaultModels();
    }
  }
  getDefaultModels() {
    return ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"];
  }
}
class AnthropicProvider extends BaseAIProvider {
  constructor() {
    super(...arguments);
    this.baseUrl = "https://api.anthropic.com/v1";
  }
  get name() {
    return "Anthropic";
  }
  async chat(messages, systemPrompt) {
    const anthropicMessages = messages.filter((m) => m.role !== "system").map((m) => ({
      role: m.role,
      content: m.content
    }));
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: 4096,
        system: systemPrompt || "",
        messages: anthropicMessages
      })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(error.error?.message || `Anthropic API error: ${response.status}`);
    }
    const data = await response.json();
    return {
      content: data.content[0]?.text || "",
      usage: data.usage ? {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens
      } : void 0
    };
  }
  async streamChat(messages, systemPrompt, callbacks) {
    const anthropicMessages = messages.filter((m) => m.role !== "system").map((m) => ({
      role: m.role,
      content: m.content
    }));
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: 4096,
        system: systemPrompt || "",
        messages: anthropicMessages,
        stream: true
      })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(error.error?.message || `Anthropic API error: ${response.status}`);
    }
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }
    const decoder = new TextDecoder();
    let fullContent = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta") {
                const content = parsed.delta?.text || "";
                if (content) {
                  fullContent += content;
                  callbacks.onToken?.(content);
                }
              }
            } catch {
            }
          }
        }
      }
      callbacks.onComplete?.(fullContent);
    } catch (error) {
      callbacks.onError?.(error);
      throw error;
    }
  }
  async validateKey() {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1,
          messages: [{ role: "user", content: "Hi" }]
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  async getAvailableModels() {
    return [
      "claude-sonnet-4-20250514",
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307"
    ];
  }
}
class GoogleProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
  }
  get name() {
    return "Google";
  }
  async chat(messages, systemPrompt) {
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));
    const body = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096
      }
    };
    if (systemPrompt) {
      body.systemInstruction = {
        parts: [{ text: systemPrompt }]
      };
    }
    const response = await fetch(
      `${this.baseUrl}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(error.error?.message || `Google API error: ${response.status}`);
    }
    const data = await response.json();
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
      usage: data.usageMetadata ? {
        promptTokens: data.usageMetadata.promptTokenCount || 0,
        completionTokens: data.usageMetadata.candidatesTokenCount || 0
      } : void 0
    };
  }
  async streamChat(messages, systemPrompt, callbacks) {
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));
    const body = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096
      }
    };
    if (systemPrompt) {
      body.systemInstruction = {
        parts: [{ text: systemPrompt }]
      };
    }
    const response = await fetch(
      `${this.baseUrl}/models/${this.config.model}:streamGenerateContent?key=${this.config.apiKey}&alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(error.error?.message || `Google API error: ${response.status}`);
    }
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }
    const decoder = new TextDecoder();
    let fullContent = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
              if (content) {
                fullContent += content;
                callbacks.onToken?.(content);
              }
            } catch {
            }
          }
        }
      }
      callbacks.onComplete?.(fullContent);
    } catch (error) {
      callbacks.onError?.(error);
      throw error;
    }
  }
  async validateKey() {
    try {
      const response = await fetch(
        `${this.baseUrl}/models?key=${this.config.apiKey}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }
  async getAvailableModels() {
    try {
      const response = await fetch(
        `${this.baseUrl}/models?key=${this.config.apiKey}`
      );
      if (!response.ok) return this.getDefaultModels();
      const data = await response.json();
      const models = data.models?.filter((m) => m.supportedGenerationMethods?.includes("generateContent"))?.map((m) => m.name.replace("models/", ""))?.filter((name) => name.includes("gemini"))?.sort() || [];
      return models.length > 0 ? models : this.getDefaultModels();
    } catch {
      return this.getDefaultModels();
    }
  }
  getDefaultModels() {
    return [
      "gemini-2.0-flash",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b"
    ];
  }
}
class OllamaProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.baseUrl = config.baseUrl || "http://localhost:11434";
  }
  get name() {
    return "Ollama";
  }
  async chat(messages, systemPrompt) {
    const allMessages = [];
    if (systemPrompt) {
      allMessages.push({ role: "system", content: systemPrompt });
    }
    allMessages.push(...messages);
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: allMessages,
        stream: false
      })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Ollama API error: ${response.status}`);
    }
    const data = await response.json();
    return {
      content: data.message?.content || "",
      usage: data.eval_count ? {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0
      } : void 0
    };
  }
  async streamChat(messages, systemPrompt, callbacks) {
    const allMessages = [];
    if (systemPrompt) {
      allMessages.push({ role: "system", content: systemPrompt });
    }
    allMessages.push(...messages);
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: allMessages,
        stream: true
      })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Ollama API error: ${response.status}`);
    }
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }
    const decoder = new TextDecoder();
    let fullContent = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            const content = parsed.message?.content || "";
            if (content) {
              fullContent += content;
              callbacks.onToken?.(content);
            }
          } catch {
          }
        }
      }
      callbacks.onComplete?.(fullContent);
    } catch (error) {
      callbacks.onError?.(error);
      throw error;
    }
  }
  async validateKey() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }
  async getAvailableModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return this.getDefaultModels();
      const data = await response.json();
      const models = data.models?.map((m) => m.name) || [];
      return models.length > 0 ? models : this.getDefaultModels();
    } catch {
      return this.getDefaultModels();
    }
  }
  getDefaultModels() {
    return [
      "llama3.2",
      "llama3.1",
      "mistral",
      "codellama",
      "phi3",
      "gemma2"
    ];
  }
}
const SYSTEM_PROMPT = `Du bist ein hilfreicher Assistent für die FormTest Server Anwendung - eine Desktop-App zum automatisierten Testen von Spendenformularen.

WICHTIG - DEINE BESCHRÄNKUNGEN:
Du kannst NUR Daten aus der App abrufen, analysieren und präsentieren. Du kannst KEINE Aktionen ausführen wie:
- ❌ Tests starten oder ausführen
- ❌ Formulare oder Bezahlmethoden erstellen/bearbeiten
- ❌ Zeitpläne erstellen oder ändern
- ❌ Einstellungen ändern
- ❌ Irgendwelche Systemänderungen vornehmen

DEINE FÄHIGKEITEN (NUR DATENANALYSE):
✅ Formulare, Bezahlmethoden, Tests und Zeitpläne suchen und analysieren
✅ Testdaten zusammenfassen und Trends erkennen
✅ Probleme identifizieren und analysieren (warum Tests fehlgeschlagen sind)
✅ Statistiken und Daten in aggregierter und kuratierter Form präsentieren
✅ Daten aus verschiedenen Tests und Zeiträumen kombinieren und vergleichen
✅ Fragen zur Anwendung beantworten
✅ Formular-Analyse mit Empfehlungen zur Verbesserung der Erfolgsrate
✅ Beste und schlechteste Formular+Bezahlmethode Kombinationen analysieren
✅ Zeitreihen-Analysen (Trends über Zeit)
✅ Fehleranalyse (warum bestimmte Tests fehlgeschlagen sind)

SPEZIELLE ANALYSEN:
- Du hast Zugriff auf Statistiken zu Formular+Bezahlmethode Kombinationen
- Nutze diese für Empfehlungen welche Kombinationen gut/schlecht funktionieren
- Bei Formular-Analysen: Gib konkrete Handlungsempfehlungen basierend auf Daten
- Analysiere Fehlermeldungen und Test-Logs um Ursachen zu identifizieren

AUSGABEFORMAT - SEHR WICHTIG:
Du MUSST deine Antwort als JSON-Array von Blöcken formatieren. Jeder Block hat einen "type" und weitere Felder.

VERFÜGBARE BLOCK-TYPEN:

1. Überschrift:
{"type": "heading", "level": 2, "content": "Überschrift Text"}

2. Text (für Erklärungen, Markdown erlaubt):
{"type": "text", "content": "Dein Text hier mit **Markdown** Formatierung"}

3. Tabelle:
{"type": "table", "headers": ["Spalte1", "Spalte2"], "rows": [["Wert1", "Wert2"], ["Wert3", "Wert4"]]}

4. Chart (für visuelle Datenanalyse):
{"type": "chart", "chartType": "pie", "title": "Titel", "data": [{"name": "Label", "value": 123}]}
- chartType kann "pie", "bar" oder "line" sein
- Nutze "pie" für Verteilungen (Erfolg/Fehler, Aktiv/Inaktiv)
- Nutze "bar" für Vergleiche (Tests pro Formular, etc.)
- Nutze "line" für Zeitreihen (Trends über Zeit, Erfolgsrate über Tage)

5. Liste:
{"type": "list", "items": ["Item 1", "Item 2"], "ordered": false}

6. Code Block (für Code-Snippets):
{"type": "code", "language": "javascript", "content": "const x = 1;"}
- language: javascript, typescript, json, python, bash, sql, etc.

7. Link (für Navigation zu Tests, Formularen, etc.):
{"type": "link", "text": "Test #1234", "url": "/test-results?testId=1234", "internal": true}
- Nutze Links für Test-IDs, Formular-Namen, Bezahlmethoden
- "internal": true für App-Navigation, false für externe URLs
- Interne URLs: /test-results, /forms, /payment-methods, /dashboard

8. Follow-up Vorschläge (IMMER am Ende hinzufügen!):
{"type": "suggestions", "items": ["Vorschlag 1", "Vorschlag 2", "Vorschlag 3"]}
- Füge IMMER 2-3 relevante Follow-up Fragen am Ende hinzu
- Die Vorschläge sollten zum Kontext der Antwort passen
- WICHTIG: Vorschläge müssen NUR für Datenanalyse sein (keine Aktionen wie "Test starten")

9. Quick Action (für vorgeschlagene Aktionen):
{"type": "action", "label": "Test starten", "action": "startTest", "params": {"formId": 1, "paymentMethodId": 2}}
- Nutze Actions um dem Benutzer konkrete Aktionen vorzuschlagen
- Verfügbare Actions: "startTest", "viewForm", "viewTest", "viewPaymentMethod"
- params enthalten die notwendigen IDs für die Aktion
- WICHTIG: Actions sind nur Vorschläge, der Benutzer muss klicken

BEISPIEL-ANTWORT für "Analysiere die Testergebnisse":
[
  {"type": "heading", "level": 2, "content": "Testergebnisse Analyse"},
  {"type": "chart", "chartType": "pie", "title": "Erfolgsrate", "data": [{"name": "Erfolgreich", "value": 208}, {"name": "Fehlgeschlagen", "value": 29}]},
  {"type": "table", "headers": ["Kategorie", "Anzahl", "Prozent"], "rows": [["Erfolgreich", "208", "88%"], ["Fehlgeschlagen", "29", "12%"]]},
  {"type": "heading", "level": 3, "content": "Fazit"},
  {"type": "text", "content": "Die Erfolgsrate von 88% ist gut. Die fehlgeschlagenen Tests sollten untersucht werden."},
  {"type": "suggestions", "items": ["Analysiere fehlgeschlagene Tests im Detail", "Welches Formular hat die meisten Fehler?", "Zeige Erfolgsrate der letzten 7 Tage"]}
]

LINKS:
- Für URLs in Tabellen und Text nutze Markdown-Links: [Linktext](https://url.com)
- Formulare haben URLs - zeige diese als klickbare Links
- Interne App-Links: [Formulare](/forms), [Tests](/test-results), [Bezahlmethoden](/payment-methods)

REGELN:
- Antworte IMMER als JSON-Array, auch für einfache Antworten
- KEINE Kommentare im JSON (// oder /* */ sind NICHT erlaubt!)
- Nutze Charts bei Analysen und Statistiken
- Nutze Tabellen für detaillierte Daten
- Zeige URLs immer als klickbare Links
- Antworte in der Sprache des Nutzers
- Sei präzise und kompakt

KONTEXT:
Du hast Zugriff auf aktuelle App-Daten wie Formulare, Bezahlmethoden, Testergebnisse und Zeitpläne.`;
class AIService {
  constructor() {
    this.provider = null;
    this.settings = null;
  }
  /**
   * Load AI settings from database
   */
  async loadSettings() {
    const enabled = settingsQueries.get("ai_enabled")?.value === "true";
    const provider = settingsQueries.get("ai_provider")?.value || "openai";
    const encryptedKey = settingsQueries.get("ai_api_key")?.value || "";
    const model = settingsQueries.get("ai_model")?.value || this.getDefaultModel(provider);
    const ollamaBaseUrl = settingsQueries.get("ai_ollama_url")?.value || "http://localhost:11434";
    let apiKey2 = "";
    if (encryptedKey) {
      try {
        apiKey2 = await decrypt(encryptedKey);
      } catch {
        apiKey2 = encryptedKey;
      }
    }
    this.settings = {
      enabled,
      provider,
      apiKey: apiKey2,
      model,
      ollamaBaseUrl
    };
    if (enabled && (apiKey2 || provider === "ollama")) {
      this.initProvider();
    }
    return this.settings;
  }
  /**
   * Update AI settings
   */
  async updateSettings(updates) {
    if (updates.enabled !== void 0) {
      settingsQueries.set("ai_enabled", String(updates.enabled), "AI assistant enabled");
    }
    if (updates.provider !== void 0) {
      settingsQueries.set("ai_provider", updates.provider, "AI provider (openai, anthropic, google, ollama)");
    }
    if (updates.apiKey !== void 0) {
      const encryptedKey = updates.apiKey ? await encrypt(updates.apiKey) : "";
      settingsQueries.set("ai_api_key", encryptedKey, "AI API key (encrypted)");
    }
    if (updates.model !== void 0) {
      settingsQueries.set("ai_model", updates.model, "AI model name");
    }
    if (updates.ollamaBaseUrl !== void 0) {
      settingsQueries.set("ai_ollama_url", updates.ollamaBaseUrl, "Ollama server URL");
    }
    return this.loadSettings();
  }
  /**
   * Get current settings
   */
  getSettings() {
    return this.settings;
  }
  /**
   * Check if AI is enabled and configured
   */
  isConfigured() {
    if (!this.settings) return false;
    if (!this.settings.enabled) return false;
    if (this.settings.provider === "ollama") return true;
    return Boolean(this.settings.apiKey);
  }
  /**
   * Initialize the AI provider based on settings
   */
  initProvider() {
    if (!this.settings) return;
    const config = {
      apiKey: this.settings.apiKey,
      model: this.settings.model,
      baseUrl: this.settings.provider === "ollama" ? this.settings.ollamaBaseUrl : void 0
    };
    switch (this.settings.provider) {
      case "openai":
        this.provider = new OpenAIProvider(config);
        break;
      case "anthropic":
        this.provider = new AnthropicProvider(config);
        break;
      case "google":
        this.provider = new GoogleProvider(config);
        break;
      case "ollama":
        this.provider = new OllamaProvider(config);
        break;
      default:
        this.provider = null;
    }
  }
  /**
   * Get default model for a provider
   */
  getDefaultModel(provider) {
    switch (provider) {
      case "openai":
        return "gpt-4o-mini";
      case "anthropic":
        return "claude-3-5-sonnet-20241022";
      case "google":
        return "gemini-1.5-flash";
      case "ollama":
        return "llama3.2";
      default:
        return "gpt-4o-mini";
    }
  }
  /**
   * Validate API key for a provider
   */
  async validateKey(provider, apiKey2, ollamaUrl) {
    const config = {
      apiKey: apiKey2,
      model: this.getDefaultModel(provider),
      baseUrl: provider === "ollama" ? ollamaUrl || "http://localhost:11434" : void 0
    };
    let testProvider;
    switch (provider) {
      case "openai":
        testProvider = new OpenAIProvider(config);
        break;
      case "anthropic":
        testProvider = new AnthropicProvider(config);
        break;
      case "google":
        testProvider = new GoogleProvider(config);
        break;
      case "ollama":
        testProvider = new OllamaProvider(config);
        break;
      default:
        return false;
    }
    return testProvider.validateKey();
  }
  /**
   * Get available models for a provider
   */
  async getModels(provider, apiKey2, ollamaUrl) {
    const config = {
      apiKey: apiKey2 || this.settings?.apiKey || "",
      model: this.getDefaultModel(provider),
      baseUrl: provider === "ollama" ? ollamaUrl || this.settings?.ollamaBaseUrl || "http://localhost:11434" : void 0
    };
    let testProvider;
    switch (provider) {
      case "openai":
        testProvider = new OpenAIProvider(config);
        break;
      case "anthropic":
        testProvider = new AnthropicProvider(config);
        break;
      case "google":
        testProvider = new GoogleProvider(config);
        break;
      case "ollama":
        testProvider = new OllamaProvider(config);
        break;
      default:
        return [];
    }
    return testProvider.getAvailableModels();
  }
  /**
   * Build context data from app state
   */
  async buildContextData() {
    const forms = formQueries.getAll().map((f) => ({
      id: f.id,
      name: f.name,
      url: f.url,
      isActive: f.isActive
    }));
    const allPaymentMethods = await paymentMethodQueries.getAll();
    const paymentMethods = allPaymentMethods.map((pm) => ({
      id: pm.id,
      name: pm.name,
      type: pm.type,
      isActive: pm.isActive
    }));
    const allTests = testRunQueries.getAll();
    const recentTests = {
      total: allTests.length,
      success: allTests.filter((t) => t.status === "SUCCESS").length,
      failed: allTests.filter((t) => t.status === "FAILURE").length,
      successRate: allTests.length > 0 ? Math.round(allTests.filter((t) => t.status === "SUCCESS").length / allTests.length * 100) : 0
    };
    const schedules = testScheduleQueries.getAll().map((s) => ({
      id: s.id,
      name: s.name,
      isActive: s.isActive,
      cronExpression: s.cronExpression
    }));
    return { forms, paymentMethods, recentTests, schedules };
  }
  /**
   * Get detailed test results for AI context
   */
  getDetailedTestResults() {
    const allTests = testRunQueries.getAll();
    const forms = formQueries.getAll();
    return allTests.slice(0, 50).map((t) => {
      const form = forms.find((f) => f.id === t.formId);
      return {
        formName: form?.name || `Form #${t.formId}`,
        paymentMethodId: t.paymentMethodId,
        status: t.status,
        error: t.errorMessage || void 0,
        runAt: t.runAt instanceof Date ? t.runAt.toISOString() : String(t.runAt)
      };
    });
  }
  /**
   * Get form + payment method combination statistics
   */
  async getCombinationStats() {
    const allTests = testRunQueries.getAll();
    const forms = formQueries.getAll();
    const paymentMethods = await paymentMethodQueries.getAll();
    const combinations = /* @__PURE__ */ new Map();
    for (const test of allTests) {
      const form = forms.find((f) => f.id === test.formId);
      const pm = paymentMethods.find((p) => p.id === test.paymentMethodId);
      const key = `${test.formId}-${test.paymentMethodId}`;
      if (!combinations.has(key)) {
        combinations.set(key, {
          formName: form?.name || `Form #${test.formId}`,
          paymentMethod: pm?.name || `PM #${test.paymentMethodId}`,
          total: 0,
          success: 0,
          failed: 0
        });
      }
      const combo = combinations.get(key);
      combo.total++;
      if (test.status === "SUCCESS") combo.success++;
      if (test.status === "FAILURE") combo.failed++;
    }
    return Array.from(combinations.values()).map((c) => ({
      ...c,
      successRate: c.total > 0 ? Math.round(c.success / c.total * 100) : 0
    })).sort((a, b) => b.total - a.total);
  }
  /**
   * Build context string for AI prompt
   */
  /**
   * Analyze user query to determine what context is relevant
   * Returns an object indicating which data should be included
   */
  analyzeQuery(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    const formKeywords = ["formular", "form", "formulare", "spendenformular"];
    const paymentKeywords = ["bezahlmethode", "payment", "zahlung", "bezahlung", "paypal", "eps", "stripe"];
    const testKeywords = ["test", "testergebnis", "ergebnis", "erfolg", "fehlgeschlagen", "fehler"];
    const errorKeywords = ["fehler", "error", "fehlgeschlagen", "failed", "problem", "warum"];
    const combinationKeywords = ["kombination", "combination", "zusammen", "paar"];
    const scheduleKeywords = ["zeitplan", "schedule", "cron", "automatisch"];
    const dateKeywords = ["tag", "tage", "woche", "monat", "letzte", "letzten", "recent", "trend"];
    const isFormSpecific = formKeywords.some((kw) => lowerMessage.includes(kw));
    const isPaymentSpecific = paymentKeywords.some((kw) => lowerMessage.includes(kw));
    const isDateRangeQuery = dateKeywords.some((kw) => lowerMessage.includes(kw));
    const needsForms = isFormSpecific || lowerMessage.includes("formular");
    const needsPaymentMethods = isPaymentSpecific || lowerMessage.includes("bezahlmethode") || lowerMessage.includes("payment");
    const needsTests = testKeywords.some((kw) => lowerMessage.includes(kw)) || needsForms || needsPaymentMethods;
    const needsErrors = errorKeywords.some((kw) => lowerMessage.includes(kw));
    const needsCombinations = combinationKeywords.some((kw) => lowerMessage.includes(kw)) || needsForms && needsPaymentMethods;
    const needsSchedules = scheduleKeywords.some((kw) => lowerMessage.includes(kw));
    let testLimit = 10;
    if (needsErrors) {
      testLimit = 50;
    } else if (isDateRangeQuery) {
      testLimit = 100;
    } else if (needsTests && (isFormSpecific || isPaymentSpecific)) {
      testLimit = 30;
    } else if (needsTests) {
      testLimit = 20;
    }
    return {
      needsForms,
      needsPaymentMethods,
      needsTests,
      needsErrors,
      needsCombinations,
      needsSchedules,
      testLimit,
      isFormSpecific,
      isPaymentSpecific,
      isDateRangeQuery
    };
  }
  async buildContextString(userMessage) {
    const data = await this.buildContextData();
    const detailedTests = this.getDetailedTestResults();
    const failedTests = detailedTests.filter((t) => t.status === "FAILURE");
    const combinationStats = await this.getCombinationStats();
    const queryAnalysis = userMessage ? this.analyzeQuery(userMessage) : {
      needsForms: true,
      needsPaymentMethods: true,
      needsTests: true,
      needsErrors: true,
      needsCombinations: true,
      needsSchedules: true,
      testLimit: 10,
      isFormSpecific: false,
      isPaymentSpecific: false
    };
    const sortedByRate = [...combinationStats].filter((c) => c.total >= 3).sort((a, b) => b.successRate - a.successRate);
    const bestCombos = sortedByRate.slice(0, 5);
    const worstCombos = sortedByRate.slice(-5).reverse();
    const parts = [];
    parts.push("AKTUELLE APP-DATEN:");
    parts.push("");
    if (queryAnalysis.needsForms) {
      const activeForms = data.forms.filter((f) => f.isActive);
      const inactiveForms = data.forms.filter((f) => !f.isActive);
      if (queryAnalysis.isFormSpecific) {
        parts.push(`FORMULARE (${data.forms.length}):`);
        parts.push(`${data.forms.map((f) => `[id:${f.id}] "${f.name}" ${f.isActive ? "✓" : "✗"} ${f.url}`).join("\n") || "- Keine Formulare vorhanden"}`);
      } else {
        parts.push(`FORMULARE: ${activeForms.length} aktiv, ${inactiveForms.length} inaktiv`);
        if (activeForms.length > 0) {
          parts.push(`Aktiv: ${activeForms.map((f) => f.name).join(", ")}`);
        }
      }
      parts.push("");
    } else {
      parts.push(`FORMULARE: ${data.forms.length} (${data.forms.filter((f) => f.isActive).length} aktiv)`);
      parts.push("");
    }
    if (queryAnalysis.needsPaymentMethods) {
      const activePayments = data.paymentMethods.filter((pm) => pm.isActive);
      const inactivePayments = data.paymentMethods.filter((pm) => !pm.isActive);
      if (queryAnalysis.isPaymentSpecific) {
        parts.push(`BEZAHLMETHODEN (${data.paymentMethods.length}):`);
        parts.push(`${data.paymentMethods.map((pm) => `[id:${pm.id}] "${pm.name}" (${pm.type}) ${pm.isActive ? "✓" : "✗"}`).join("\n") || "- Keine Bezahlmethoden vorhanden"}`);
      } else {
        parts.push(`BEZAHLMETHODEN: ${activePayments.length} aktiv, ${inactivePayments.length} inaktiv`);
        if (activePayments.length > 0) {
          parts.push(`Aktiv: ${activePayments.map((pm) => pm.name).join(", ")}`);
        }
      }
      parts.push("");
    } else {
      parts.push(`BEZAHLMETHODEN: ${data.paymentMethods.length} (${data.paymentMethods.filter((pm) => pm.isActive).length} aktiv)`);
      parts.push("");
    }
    if (queryAnalysis.needsTests) {
      parts.push(`TESTERGEBNISSE (letzte 30 Tage):`);
      parts.push(`Gesamt: ${data.recentTests.total}, Erfolg: ${data.recentTests.success} (${data.recentTests.successRate}%), Fehler: ${data.recentTests.failed}`);
      const testLimit = queryAnalysis.testLimit;
      const relevantTests = detailedTests.slice(0, testLimit);
      if (queryAnalysis.needsErrors && failedTests.length > 0) {
        parts.push("");
        parts.push(`FEHLGESCHLAGENE TESTS (${Math.min(failedTests.length, testLimit)}):`);
        parts.push(failedTests.slice(0, testLimit).map((t) => `[id:${t.id}] ${t.formName} + ${t.paymentMethod}: "${t.error || "Unbekannter Fehler"}" (${t.runAt})`).join("\n"));
      }
      if (relevantTests.length > 0) {
        parts.push("");
        parts.push(`LETZTE ${relevantTests.length} TESTS:`);
        parts.push(relevantTests.map((t) => `[id:${t.id}] ${t.formName} + ${t.paymentMethod}: ${t.status} (${t.runAt})`).join("\n"));
      }
      parts.push("");
    } else {
      parts.push(`TESTERGEBNISSE: ${data.recentTests.total} Tests, ${data.recentTests.successRate}% Erfolgsrate`);
      parts.push("");
    }
    if (queryAnalysis.needsCombinations) {
      parts.push(`BESTE KOMBINATIONEN (mind. 3 Tests):`);
      parts.push(bestCombos.map((c) => `${c.formName} + ${c.paymentMethod}: ${c.successRate}% (${c.success}/${c.total})`).join("\n") || "- Keine Daten");
      parts.push("");
      parts.push(`SCHLECHTESTE KOMBINATIONEN (mind. 3 Tests):`);
      parts.push(worstCombos.map((c) => `${c.formName} + ${c.paymentMethod}: ${c.successRate}% (${c.success}/${c.total})`).join("\n") || "- Keine Daten");
      parts.push("");
    }
    if (queryAnalysis.needsSchedules) {
      parts.push(`ZEITPLÄNE (${data.schedules.length}):`);
      parts.push(data.schedules.map((s) => `${s.name}: ${s.cronExpression} (${s.isActive ? "aktiv" : "inaktiv"})`).join("\n") || "- Keine Zeitpläne vorhanden");
    }
    return parts.join("\n");
  }
  /**
   * Send a chat message and get a response
   */
  async chat(messages) {
    if (!this.provider) {
      await this.loadSettings();
      if (!this.provider) {
        throw new Error("AI ist nicht konfiguriert. Bitte konfiguriere einen AI-Provider in den Einstellungen.");
      }
    }
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()?.content;
    const contextString = await this.buildContextString(lastUserMessage);
    const fullSystemPrompt = `${SYSTEM_PROMPT}

${contextString}`;
    return this.provider.chat(messages, fullSystemPrompt);
  }
  /**
   * Stream a chat response
   */
  async streamChat(messages, callbacks) {
    if (!this.provider) {
      await this.loadSettings();
      if (!this.provider) {
        throw new Error("AI ist nicht konfiguriert. Bitte konfiguriere einen AI-Provider in den Einstellungen.");
      }
    }
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()?.content;
    const contextString = await this.buildContextString(lastUserMessage);
    const fullSystemPrompt = `${SYSTEM_PROMPT}

${contextString}`;
    return this.provider.streamChat(messages, fullSystemPrompt, callbacks);
  }
}
const aiService = new AIService();
function handleError(error, context) {
  console.error(`IPC Error - ${context}:`, error);
  const sanitized = sanitizeError(error);
  throw new Error(sanitized.message);
}
function setupIpcHandlers() {
  electron.ipcMain.handle("forms:getAll", async () => {
    try {
      return formQueries.getAll();
    } catch (error) {
      handleError(error, "forms:getAll");
    }
  });
  electron.ipcMain.handle("forms:getById", async (_, id) => {
    try {
      return formQueries.getById(id);
    } catch (error) {
      handleError(error, "forms:getById");
    }
  });
  electron.ipcMain.handle("forms:create", async (_, form) => {
    try {
      return formQueries.create(form);
    } catch (error) {
      handleError(error, "forms:create");
    }
  });
  electron.ipcMain.handle("forms:update", async (_, id, form) => {
    try {
      return formQueries.update(id, form);
    } catch (error) {
      handleError(error, "forms:update");
    }
  });
  electron.ipcMain.handle("forms:delete", async (_, id) => {
    try {
      return formQueries.delete(id);
    } catch (error) {
      handleError(error, "forms:delete");
    }
  });
  electron.ipcMain.handle("forms:deleteAll", async () => {
    try {
      return formQueries.deleteAll();
    } catch (error) {
      handleError(error, "forms:deleteAll");
    }
  });
  electron.ipcMain.handle("paymentMethods:getAll", async () => {
    try {
      return await paymentMethodQueries.getAll();
    } catch (error) {
      console.error("IPC Error - paymentMethods:getAll:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("paymentMethods:getById", async (_, id) => {
    try {
      return await paymentMethodQueries.getById(id);
    } catch (error) {
      console.error("IPC Error - paymentMethods:getById:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("paymentMethods:create", async (_, method) => {
    try {
      return await paymentMethodQueries.create(method);
    } catch (error) {
      console.error("IPC Error - paymentMethods:create:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("paymentMethods:update", async (_, id, method) => {
    try {
      return await paymentMethodQueries.update(id, method);
    } catch (error) {
      console.error("IPC Error - paymentMethods:update:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("paymentMethods:delete", async (_, id) => {
    try {
      return paymentMethodQueries.delete(id);
    } catch (error) {
      console.error("IPC Error - paymentMethods:delete:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("paymentMethods:deleteAll", async () => {
    try {
      return paymentMethodQueries.deleteAll();
    } catch (error) {
      console.error("IPC Error - paymentMethods:deleteAll:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("settings:getAll", () => settingsQueries.getAll());
  electron.ipcMain.handle("settings:get", (_, key) => settingsQueries.get(key));
  electron.ipcMain.handle("settings:set", (_, key, value, description) => settingsQueries.set(key, value, description));
  electron.ipcMain.handle("settings:getFieldDefaults", () => settingsQueries.getFieldDefaults());
  electron.ipcMain.handle("settings:setFieldDefaults", (_, defaults) => settingsQueries.setFieldDefaults(defaults));
  electron.ipcMain.handle("testRuns:getAll", (_, includeArchived) => testRunQueries.getAll(includeArchived));
  electron.ipcMain.handle("testRuns:getById", (_, id) => testRunQueries.getById(id));
  electron.ipcMain.handle("testRuns:getByForm", (_, formId) => testRunQueries.getByForm(formId));
  electron.ipcMain.handle("testRuns:create", (_, testRun) => testRunQueries.create({ ...testRun, uuid: testRun.uuid || crypto.randomUUID() }));
  electron.ipcMain.handle("testRuns:updateStatus", (_, id, status, errorMessage, durationMs) => testRunQueries.updateStatus(id, status, errorMessage, durationMs));
  electron.ipcMain.handle("testRuns:delete", (_, id) => testRunQueries.delete(id));
  electron.ipcMain.handle("testRuns:deleteAll", () => testRunQueries.deleteAll());
  electron.ipcMain.handle("testRuns:updateNotes", (_, id, notes) => testRunQueries.updateNotes(id, notes));
  electron.ipcMain.handle("testRuns:archive", (_, id) => testRunQueries.archive(id));
  electron.ipcMain.handle("testRuns:unarchive", (_, id) => testRunQueries.unarchive(id));
  electron.ipcMain.handle("testRuns:archiveBulk", (_, ids) => testRunQueries.archiveBulk(ids));
  electron.ipcMain.handle("testRuns:unarchiveBulk", (_, ids) => testRunQueries.unarchiveBulk(ids));
  electron.ipcMain.handle("testRuns:updateTags", (_, id, tags) => testRunQueries.updateTags(id, tags));
  electron.ipcMain.handle("tags:getAll", () => tagQueries.getAll());
  electron.ipcMain.handle("tags:getById", (_, id) => tagQueries.getById(id));
  electron.ipcMain.handle("tags:create", (_, name, color) => tagQueries.create(name, color));
  electron.ipcMain.handle("tags:update", (_, id, name, color) => tagQueries.update(id, name, color));
  electron.ipcMain.handle("tags:delete", (_, id) => tagQueries.delete(id));
  electron.ipcMain.handle("filterPresets:getAll", () => filterPresetQueries.getAll());
  electron.ipcMain.handle("filterPresets:getById", (_, id) => filterPresetQueries.getById(id));
  electron.ipcMain.handle("filterPresets:create", (_, name, filterConfig) => filterPresetQueries.create(name, filterConfig));
  electron.ipcMain.handle("filterPresets:update", (_, id, name, filterConfig) => filterPresetQueries.update(id, name, filterConfig));
  electron.ipcMain.handle("filterPresets:delete", (_, id) => filterPresetQueries.delete(id));
  electron.ipcMain.handle("testRuns:stop", (_, id) => {
    const testQueue = getTestQueue();
    testQueue.removeFromQueue(id);
    return testRunQueries.stop(id);
  });
  electron.ipcMain.handle("testRuns:cleanup", () => {
    const deleted = cleanupOldTestRuns();
    return { success: true, deleted };
  });
  electron.ipcMain.handle("testRuns:getInterrupted", () => {
    try {
      return testRunQueries.getInterruptedTestsWithDetails();
    } catch (error) {
      console.error("IPC Error - testRuns:getInterrupted:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("testRuns:retryInterrupted", async (_, testIds) => {
    try {
      if (!testIds || testIds.length === 0) {
        return { success: false, message: "No test IDs provided" };
      }
      const testQueue = getTestQueue();
      const settings = settingsQueries.getAll();
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      let retriedCount = 0;
      const errors = [];
      for (const testId of testIds) {
        try {
          const testRun = testRunQueries.getById(testId);
          if (!testRun) {
            errors.push(`Test ${testId} not found`);
            continue;
          }
          if (!testRun.formId || !testRun.paymentMethodId) {
            errors.push(`Test ${testId} is orphaned (form/pm deleted)`);
            continue;
          }
          const form = formQueries.getById(testRun.formId);
          const paymentMethod = await paymentMethodQueries.getById(testRun.paymentMethodId);
          if (!form || !paymentMethod) {
            errors.push(`Test ${testId}: form or payment method not found`);
            continue;
          }
          const customScripts = customScriptQueries.getScriptsForTest(form.id);
          const settingsWithScripts = { ...settingsMap, customScripts };
          const newTestRun = testRunQueries.create({
            uuid: crypto.randomUUID(),
            formId: form.id,
            paymentMethodId: paymentMethod.id,
            status: "QUEUED",
            logDetails: JSON.stringify([`Retried test for ${form.name} with ${paymentMethod.name}`]),
            errorMessage: void 0,
            durationMs: void 0,
            isScheduled: testRun.isScheduled || false,
            amount: testRun.amount || settingsMap["default_donation_amount"] || "5",
            interval: testRun.interval || settingsMap["default_donation_interval"] || settingsMap["default_interval"] || "0"
          });
          const newTestRunId = newTestRun.lastInsertRowid;
          testQueue.enqueue(newTestRunId, form, paymentMethod, settingsWithScripts);
          testRunQueries.delete(testId);
          retriedCount++;
        } catch (error) {
          errors.push(`Test ${testId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      return {
        success: retriedCount > 0,
        message: retriedCount > 0 ? `Retried ${retriedCount} test${retriedCount > 1 ? "s" : ""}${errors.length > 0 ? `, ${errors.length} failed` : ""}` : `Failed to retry tests: ${errors.join(", ")}`,
        retried: retriedCount,
        errors: errors.length > 0 ? errors : void 0
      };
    } catch (error) {
      console.error("IPC Error - testRuns:retryInterrupted:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("testRuns:dismissInterrupted", (_, testIds) => {
    try {
      if (!testIds || testIds.length === 0) {
        return { success: false, deleted: 0 };
      }
      const result = testRunQueries.deleteTestRuns(testIds);
      return { success: true, deleted: result.changes };
    } catch (error) {
      console.error("IPC Error - testRuns:dismissInterrupted:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("toast:show", (event, type, message, description) => {
    event.sender.send("toast:display", { type, message, description });
  });
  electron.ipcMain.handle("tests:run", async (_, formIds, paymentMethodIds, options) => {
    try {
      console.log("Starting test execution for forms:", formIds, "with payment methods:", paymentMethodIds, "options:", options);
      const testRunIds = [];
      const forms = formIds.map((id) => formQueries.getById(id)).filter((form) => form !== void 0);
      const paymentMethodPromises = paymentMethodIds.map((id) => paymentMethodQueries.getById(id));
      const paymentMethodsResolved = await Promise.all(paymentMethodPromises);
      const paymentMethods = paymentMethodsResolved.filter((pm) => pm !== void 0);
      console.log(`Found ${forms.length} forms and ${paymentMethods.length} payment methods`);
      const settings = settingsQueries.getAll();
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      if (options?.customAmount) {
        settingsMap["default_donation_amount"] = options.customAmount;
      }
      if (options?.customInterval) {
        settingsMap["default_donation_interval"] = options.customInterval;
      }
      for (const form of forms) {
        const customScripts = customScriptQueries.getScriptsForTest(form.id);
        for (const paymentMethod of paymentMethods) {
          console.log(`Creating test run for form "${form.name}" with payment method "${paymentMethod.name}"`);
          const testRun = testRunQueries.create({
            uuid: crypto.randomUUID(),
            formId: form.id,
            paymentMethodId: paymentMethod.id,
            status: "QUEUED",
            logDetails: JSON.stringify([`Test queued for ${form.name} with ${paymentMethod.name}`]),
            errorMessage: void 0,
            durationMs: void 0,
            isScheduled: false,
            amount: settingsMap["default_donation_amount"] || "5",
            interval: settingsMap["default_donation_interval"] || settingsMap["default_interval"] || "0"
          });
          testRunIds.push(testRun.lastInsertRowid);
          const testQueue = getTestQueue();
          const settingsWithScripts = { ...settingsMap, customScripts };
          const qualityTestOptions = {
            enableSeoTest: options?.enableSeoTest || false,
            enableAccessibilityTest: options?.enableAccessibilityTest || false
          };
          testQueue.enqueue(testRun.lastInsertRowid, form, paymentMethod, settingsWithScripts, qualityTestOptions);
        }
      }
      return {
        success: true,
        message: `Started ${testRunIds.length} test runs`,
        testRunIds
      };
    } catch (error) {
      console.error("Test execution error:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("testQueue:getStatus", () => {
    const testQueue = getTestQueue();
    return testQueue.getStatus();
  });
  electron.ipcMain.handle("testQueue:clear", () => {
    const testQueue = getTestQueue();
    testQueue.clear();
    return { success: true };
  });
  electron.ipcMain.handle("testQueue:stopAll", async () => {
    const testQueue = getTestQueue();
    const result = await testQueue.stopAll();
    return { success: true, ...result };
  });
  electron.ipcMain.handle("testQueue:triggerProcessing", async () => {
    const testQueue = getTestQueue();
    await testQueue.triggerProcessing();
    return { success: true };
  });
  electron.ipcMain.handle("database:export", async (_event, options) => {
    try {
      console.log("IPC: Exporting database with options:", options);
      const exportData = await exportQueries.exportAll(options);
      const { filePath, canceled } = await electron.dialog.showSaveDialog({
        title: "Datenbank exportieren",
        defaultPath: `formtest-export-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`,
        filters: [
          { name: "JSON Files", extensions: ["json"] },
          { name: "All Files", extensions: ["*"] }
        ]
      });
      if (canceled || !filePath) {
        return { success: false, message: "Export cancelled" };
      }
      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), "utf-8");
      console.log(`IPC: Successfully exported to ${filePath}`);
      return {
        success: true,
        message: `Daten erfolgreich exportiert nach ${filePath}`,
        filePath
      };
    } catch (error) {
      console.error("IPC Error - database:export:", error);
      return {
        success: false,
        message: `Export fehlgeschlagen: ${error.message}`
      };
    }
  });
  electron.ipcMain.handle("database:import", async (_event, mode, options) => {
    try {
      console.log("IPC: Importing database with mode:", mode, "options:", options);
      const { filePaths, canceled } = await electron.dialog.showOpenDialog({
        title: "Datenbank importieren",
        filters: [
          { name: "JSON Files", extensions: ["json"] },
          { name: "All Files", extensions: ["*"] }
        ],
        properties: ["openFile"]
      });
      if (canceled || filePaths.length === 0) {
        return {
          success: false,
          imported: { forms: 0, paymentMethods: 0, testRuns: 0, settings: 0 },
          skipped: { forms: 0, paymentMethods: 0, testRuns: 0, settings: 0 },
          errors: [],
          warnings: []
        };
      }
      const filePath = filePaths[0];
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const importData = JSON.parse(fileContent);
      if (!importData.version || !importData.data) {
        return {
          success: false,
          imported: { forms: 0, paymentMethods: 0, testRuns: 0, settings: 0 },
          skipped: { forms: 0, paymentMethods: 0, testRuns: 0, settings: 0 },
          errors: ["Ungültiges Dateiformat"],
          warnings: []
        };
      }
      let result;
      if (mode === "overwrite") {
        result = await importQueries.importOverwrite(importData, options);
      } else {
        result = await importQueries.importMerge(importData, options);
      }
      console.log("IPC: Import completed:", result);
      return result;
    } catch (error) {
      console.error("IPC Error - database:import:", error);
      return {
        success: false,
        imported: { forms: 0, paymentMethods: 0, testRuns: 0, settings: 0 },
        skipped: { forms: 0, paymentMethods: 0, testRuns: 0, settings: 0 },
        errors: [`Import fehlgeschlagen: ${error.message}`],
        warnings: []
      };
    }
  });
  electron.ipcMain.handle("testSchedules:getAll", () => testScheduleQueries.getAll());
  electron.ipcMain.handle("testSchedules:getById", (_, id) => testScheduleQueries.getById(id));
  electron.ipcMain.handle("testSchedules:runNow", async (_, id) => {
    try {
      return await scheduler.runJobNow(id);
    } catch (error) {
      console.error("IPC Error - testSchedules:runNow:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("testSchedules:create", (_, schedule) => {
    const result = testScheduleQueries.create(schedule);
    const id = result.lastInsertRowid;
    scheduler.reloadJob(id);
    return result;
  });
  electron.ipcMain.handle("testSchedules:update", (_, id, schedule) => {
    const result = testScheduleQueries.update(id, schedule);
    scheduler.reloadJob(id);
    return result;
  });
  electron.ipcMain.handle("testSchedules:delete", (_, id) => {
    scheduler.stopJob(id);
    return testScheduleQueries.delete(id);
  });
  electron.ipcMain.handle("testSchedules:deleteAll", () => {
    const schedules = testScheduleQueries.getAll();
    for (const schedule of schedules) {
      scheduler.stopJob(schedule.id);
    }
    return testScheduleQueries.deleteAll();
  });
  electron.ipcMain.handle("notifications:getAll", () => {
    return notificationQueries.getAll();
  });
  electron.ipcMain.handle("notifications:getUnread", () => {
    return notificationQueries.getUnread();
  });
  electron.ipcMain.handle("notifications:getUnreadCount", () => {
    return notificationQueries.getUnreadCount();
  });
  electron.ipcMain.handle("notifications:markAsRead", (_, id) => {
    return notificationQueries.markAsRead(id);
  });
  electron.ipcMain.handle("notifications:markAllAsRead", () => {
    return notificationQueries.markAllAsRead();
  });
  electron.ipcMain.handle("notifications:delete", (_, id) => {
    return notificationQueries.delete(id);
  });
  electron.ipcMain.handle("notifications:deleteAll", () => {
    return notificationQueries.deleteAll();
  });
  electron.ipcMain.handle("selectorOverrides:getAll", () => {
    return selectorOverrideQueries.getAll();
  });
  electron.ipcMain.handle("selectorOverrides:getByCategory", (_, category) => {
    return selectorOverrideQueries.getByCategory(category);
  });
  electron.ipcMain.handle("selectorOverrides:getById", (_, id) => {
    return selectorOverrideQueries.getById(id);
  });
  electron.ipcMain.handle("selectorOverrides:getActive", () => {
    return selectorOverrideQueries.getActive();
  });
  electron.ipcMain.handle("selectorOverrides:create", (_, override) => {
    return selectorOverrideQueries.create(override);
  });
  electron.ipcMain.handle("selectorOverrides:update", (_, id, override) => {
    return selectorOverrideQueries.update(id, override);
  });
  electron.ipcMain.handle("selectorOverrides:upsert", (_, override) => {
    return selectorOverrideQueries.upsert(override);
  });
  electron.ipcMain.handle("selectorOverrides:delete", (_, id) => {
    return selectorOverrideQueries.delete(id);
  });
  electron.ipcMain.handle("selectorOverrides:deleteByKey", (_, category, key) => {
    return selectorOverrideQueries.deleteByKey(category, key);
  });
  electron.ipcMain.handle("selectorOverrides:deleteAll", () => {
    return selectorOverrideQueries.deleteAll();
  });
  electron.ipcMain.handle("selectorConfig:getMerged", () => {
    return getMergedSelectorConfig();
  });
  electron.ipcMain.handle("selectorConfig:getBase", () => {
    return getBaseSelectorConfig();
  });
  electron.ipcMain.handle("selectorConfig:getCategories", () => {
    return getConfigurableCategories();
  });
  electron.ipcMain.handle("email:testConnection", async () => {
    return await emailService.sendTestEmail();
  });
  electron.ipcMain.handle("email:getConfig", () => {
    return emailService.loadConfig();
  });
  electron.ipcMain.handle("api:start", async (_, port, apiKey2) => {
    try {
      await startApiServer(port, apiKey2);
      return { success: true };
    } catch (error) {
      console.error("IPC Error - api:start:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  });
  electron.ipcMain.handle("api:stop", async () => {
    try {
      await stopApiServer();
      return { success: true };
    } catch (error) {
      console.error("IPC Error - api:stop:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  });
  electron.ipcMain.handle("api:status", () => {
    return { running: isApiServerRunning() };
  });
  electron.ipcMain.handle("api:generateKey", () => {
    return generateApiKey();
  });
  electron.ipcMain.handle("password:isEnabled", () => {
    return passwordQueries.isEnabled();
  });
  electron.ipcMain.handle("password:isSessionUnlocked", () => {
    return passwordQueries.isSessionUnlocked();
  });
  electron.ipcMain.handle("password:verify", (_, password) => {
    try {
      const isValid = passwordQueries.verify(password);
      return { success: isValid, error: isValid ? void 0 : "Falsches Passwort" };
    } catch (error) {
      console.error("IPC Error - password:verify:", error);
      return { success: false, error: "Fehler bei der Passwort-Überprüfung" };
    }
  });
  electron.ipcMain.handle("password:set", (_, password) => {
    try {
      passwordQueries.setPassword(password);
      return { success: true };
    } catch (error) {
      console.error("IPC Error - password:set:", error);
      const sanitized = sanitizeError(error);
      return { success: false, error: sanitized.message };
    }
  });
  electron.ipcMain.handle("password:change", (_, currentPassword, newPassword) => {
    try {
      const success = passwordQueries.changePassword(currentPassword, newPassword);
      return { success, error: success ? void 0 : "Aktuelles Passwort ist falsch" };
    } catch (error) {
      console.error("IPC Error - password:change:", error);
      const sanitized = sanitizeError(error);
      return { success: false, error: sanitized.message };
    }
  });
  electron.ipcMain.handle("password:disable", (_, currentPassword) => {
    try {
      const success = passwordQueries.disable(currentPassword);
      return { success, error: success ? void 0 : "Passwort ist falsch" };
    } catch (error) {
      console.error("IPC Error - password:disable:", error);
      const sanitized = sanitizeError(error);
      return { success: false, error: sanitized.message };
    }
  });
  electron.ipcMain.handle("password:emergencyReset", () => {
    try {
      passwordQueries.emergencyReset();
      return { success: true };
    } catch (error) {
      console.error("IPC Error - password:emergencyReset:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  });
  electron.ipcMain.handle("customScripts:getAll", async () => {
    try {
      return customScriptQueries.getAll();
    } catch (error) {
      console.error("IPC Error - customScripts:getAll:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("customScripts:getById", async (_, id) => {
    try {
      return customScriptQueries.getById(id);
    } catch (error) {
      console.error("IPC Error - customScripts:getById:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("customScripts:getByHookPoint", async (_, hookPoint) => {
    try {
      return customScriptQueries.getByHookPoint(hookPoint);
    } catch (error) {
      console.error("IPC Error - customScripts:getByHookPoint:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("customScripts:getGlobal", async () => {
    try {
      return customScriptQueries.getGlobalScripts();
    } catch (error) {
      console.error("IPC Error - customScripts:getGlobal:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("customScripts:getByFormId", async (_, formId) => {
    try {
      return customScriptQueries.getByFormId(formId);
    } catch (error) {
      console.error("IPC Error - customScripts:getByFormId:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("customScripts:getForTest", async (_, formId) => {
    try {
      return customScriptQueries.getScriptsForTest(formId);
    } catch (error) {
      console.error("IPC Error - customScripts:getForTest:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("customScripts:create", async (_, script) => {
    try {
      return customScriptQueries.create(script);
    } catch (error) {
      console.error("IPC Error - customScripts:create:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("customScripts:update", async (_, id, script) => {
    try {
      return customScriptQueries.update(id, script);
    } catch (error) {
      console.error("IPC Error - customScripts:update:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("customScripts:delete", async (_, id) => {
    try {
      return customScriptQueries.delete(id);
    } catch (error) {
      console.error("IPC Error - customScripts:delete:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("customScripts:deleteAll", async () => {
    try {
      return customScriptQueries.deleteAll();
    } catch (error) {
      console.error("IPC Error - customScripts:deleteAll:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("customScripts:validate", async (_, code) => {
    try {
      new Function("ctx", `with(ctx) { ${code} }`);
      return { valid: true, errors: [], warnings: [] };
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : "Syntax error"],
        warnings: []
      };
    }
  });
  electron.ipcMain.handle("formScripts:getByFormId", async (_, formId) => {
    try {
      return formScriptQueries.getByFormId(formId);
    } catch (error) {
      console.error("IPC Error - formScripts:getByFormId:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("formScripts:attach", async (_, formId, scriptId, executionOrder) => {
    try {
      return formScriptQueries.attach(formId, scriptId, executionOrder || 0);
    } catch (error) {
      console.error("IPC Error - formScripts:attach:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("formScripts:detach", async (_, formId, scriptId) => {
    try {
      return formScriptQueries.detach(formId, scriptId);
    } catch (error) {
      console.error("IPC Error - formScripts:detach:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("formScripts:updateOrder", async (_, formId, scriptId, executionOrder) => {
    try {
      return formScriptQueries.updateOrder(formId, scriptId, executionOrder);
    } catch (error) {
      console.error("IPC Error - formScripts:updateOrder:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ai:getSettings", async () => {
    try {
      return await aiService.loadSettings();
    } catch (error) {
      console.error("IPC Error - ai:getSettings:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ai:updateSettings", async (_, settings) => {
    try {
      return await aiService.updateSettings(settings);
    } catch (error) {
      console.error("IPC Error - ai:updateSettings:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ai:validateKey", async (_, provider, apiKey2, ollamaUrl) => {
    try {
      return await aiService.validateKey(provider, apiKey2, ollamaUrl);
    } catch (error) {
      console.error("IPC Error - ai:validateKey:", error);
      return false;
    }
  });
  electron.ipcMain.handle("ai:getModels", async (_, provider, apiKey2, ollamaUrl) => {
    try {
      return await aiService.getModels(provider, apiKey2, ollamaUrl);
    } catch (error) {
      console.error("IPC Error - ai:getModels:", error);
      return [];
    }
  });
  electron.ipcMain.handle("ai:isConfigured", async () => {
    try {
      await aiService.loadSettings();
      return aiService.isConfigured();
    } catch (error) {
      console.error("IPC Error - ai:isConfigured:", error);
      return false;
    }
  });
  electron.ipcMain.handle("ai:chats:getAll", async () => {
    try {
      return aiChatQueries.getAll();
    } catch (error) {
      console.error("IPC Error - ai:chats:getAll:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ai:chats:getById", async (_, id) => {
    try {
      return aiChatQueries.getById(id);
    } catch (error) {
      console.error("IPC Error - ai:chats:getById:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ai:chats:create", async (_, title, context) => {
    try {
      return aiChatQueries.create(title, context);
    } catch (error) {
      console.error("IPC Error - ai:chats:create:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ai:chats:updateTitle", async (_, id, title) => {
    try {
      return aiChatQueries.updateTitle(id, title);
    } catch (error) {
      console.error("IPC Error - ai:chats:updateTitle:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ai:chats:delete", async (_, id) => {
    try {
      return aiChatQueries.delete(id);
    } catch (error) {
      console.error("IPC Error - ai:chats:delete:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ai:chats:deleteAll", async () => {
    try {
      return aiChatQueries.deleteAll();
    } catch (error) {
      console.error("IPC Error - ai:chats:deleteAll:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ai:messages:getByChatId", async (_, chatId) => {
    try {
      return aiMessageQueries.getByChatId(chatId);
    } catch (error) {
      console.error("IPC Error - ai:messages:getByChatId:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ai:messages:send", async (_, chatId, content) => {
    try {
      const userMessage = aiMessageQueries.create(chatId, "user", content);
      const allMessages = aiMessageQueries.getByChatId(chatId);
      const chatMessages = allMessages.map((m) => ({
        role: m.role,
        content: m.content
      }));
      const response = await aiService.chat(chatMessages);
      let metadata = null;
      if (response.usage) {
        metadata = JSON.stringify({ usage: response.usage });
      }
      const assistantMessage = aiMessageQueries.create(chatId, "assistant", response.content, metadata);
      return {
        userMessage,
        assistantMessage,
        usage: response.usage
      };
    } catch (error) {
      console.error("IPC Error - ai:messages:send:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("ai:messages:sendStream", async (event, chatId, content) => {
    try {
      const userMessage = aiMessageQueries.create(chatId, "user", content);
      const mainWindow2 = getMainWindow();
      if (!mainWindow2) {
        throw new Error("Main window not available");
      }
      const allMessages = aiMessageQueries.getByChatId(chatId);
      const chatMessages = allMessages.map((m) => ({
        role: m.role,
        content: m.content
      }));
      let fullContent = "";
      await aiService.streamChat(chatMessages, {
        onToken: (token) => {
          fullContent += token;
          mainWindow2.webContents.send("ai:stream:token", { chatId, token });
        },
        onComplete: async (content2) => {
          fullContent = content2;
          const assistantMessage = aiMessageQueries.create(chatId, "assistant", fullContent);
          mainWindow2.webContents.send("ai:stream:complete", {
            chatId,
            assistantMessage
          });
        },
        onError: (error) => {
          console.error("Stream error:", error);
          mainWindow2.webContents.send("ai:stream:error", {
            chatId,
            error: error.message
          });
        }
      });
      return { userMessage };
    } catch (error) {
      console.error("IPC Error - ai:messages:sendStream:", error);
      const mainWindow2 = getMainWindow();
      if (mainWindow2) {
        mainWindow2.webContents.send("ai:stream:error", {
          chatId,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
      throw error;
    }
  });
  electron.ipcMain.handle("ai:context:getData", async () => {
    try {
      return await aiService.buildContextData();
    } catch (error) {
      console.error("IPC Error - ai:context:getData:", error);
      throw error;
    }
  });
}
let mainWindow;
function getMainWindow() {
  return mainWindow || null;
}
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 700,
    minWidth: 1090,
    minHeight: 500,
    // maxHeight: 1080,
    // maxWidth: 1340,
    show: false,
    frame: false,
    // Remove OS frame
    titleBarStyle: "hidden",
    // Hide title bar
    trafficLightPosition: { x: -1e3, y: -1e3 },
    // Hide traffic lights completely
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.formtest.server");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  initDatabase();
  setupIpcHandlers();
  scheduler.init();
  const testQueue = getTestQueue();
  setTimeout(() => {
    testQueue.getStatus();
  }, 2e3);
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("before-quit", async (event) => {
  try {
    const interruptedTests = testRunQueries.getInterruptedTestsWithDetails();
    if (interruptedTests.length > 0) {
      console.log(`[App] Found ${interruptedTests.length} interrupted tests on app close - will be shown in recovery dialog on next startup`);
      const processManager2 = getTestProcessManager();
      try {
        await processManager2.stopProcess();
      } catch (error) {
        console.error("[App] Error stopping test process:", error);
      }
      const testQueue = getTestQueue();
      try {
        testQueue.resetState();
      } catch (error) {
        console.error("[App] Error resetting test queue:", error);
      }
    }
  } catch (error) {
    console.error("[App] Error in before-quit handler:", error);
  }
});
electron.ipcMain.handle("window-minimize", () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});
electron.ipcMain.handle("window-maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});
electron.ipcMain.handle("window-close", () => {
  if (mainWindow) {
    mainWindow.close();
  }
});
electron.ipcMain.handle("window-is-maximized", () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});
exports.getMainWindow = getMainWindow;
