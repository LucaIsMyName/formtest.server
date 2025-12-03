"use strict";
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
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
async function getEncryptionKey() {
  try {
    const existingKey = await keytar__namespace.getPassword(SERVICE_NAME, ACCOUNT_NAME);
    if (existingKey) {
      console.log("Encryption: Using existing encryption key from keychain");
      return Buffer.from(existingKey, "hex");
    }
    console.log("Encryption: Generating new encryption key");
    const newKey = crypto.randomBytes(KEY_LENGTH);
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
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = crypto.scryptSync(masterKey, salt, KEY_LENGTH);
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
    const key = crypto.scryptSync(masterKey, salt, KEY_LENGTH);
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
      "#accept-all-cookies",
      ".accept-cookies",
      'button[class*="accept"]'
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
  successPatterns: {
    redirectUrls: [
      "diakonie.at",
      "paypal.com",
      "stripe.com",
      "klarna.com",
      "sofort.com",
      "giropay.de",
      "eps-ueberweisung.at",
      "secure.fundraisingbox.com/success",
      "/thank-you",
      "/danke",
      "/success",
      "/confirmation"
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
            formId INTEGER NOT NULL,
            paymentMethodId INTEGER NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE', 'SKIPPED', 'RUNNING', 'STOPPED', 'QUEUED')),
            errorMessage TEXT,
            screenshotPath TEXT,
            logDetails TEXT,
            steps TEXT DEFAULT '[]',
            durationMs INTEGER,
            isScheduled INTEGER DEFAULT 0,
            notes TEXT DEFAULT '',
            runAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (formId) REFERENCES forms (id) ON DELETE CASCADE,
            FOREIGN KEY (paymentMethodId) REFERENCES payment_methods (id) ON DELETE CASCADE
          );
        `);
        db.exec(`
          INSERT INTO test_runs_new (id, uuid, formId, paymentMethodId, status, errorMessage, screenshotPath, logDetails, steps, durationMs, isScheduled, notes, runAt)
          SELECT id, uuid, formId, paymentMethodId, status, errorMessage, screenshotPath, logDetails, steps, durationMs, isScheduled, notes, runAt
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
  } catch (dbError) {
    console.error("Database: Failed to create SQLite connection:", dbError);
    throw dbError;
  }
  try {
    const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='test_runs'").get();
    if (tableInfo && !tableInfo.sql.includes("ON DELETE CASCADE")) {
      console.log("Database: Migrating test_runs table to add CASCADE DELETE...");
      db.exec(`
        CREATE TABLE test_runs_backup AS SELECT * FROM test_runs;
        DROP TABLE test_runs;
      `);
      console.log("Database: Backed up and dropped old test_runs table");
    }
  } catch (error) {
    console.log("Database: No existing test_runs table found, will create new one");
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
      formId INTEGER NOT NULL,
      paymentMethodId INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE', 'SKIPPED', 'RUNNING', 'STOPPED', 'QUEUED')),
      errorMessage TEXT,
      screenshotPath TEXT,
      logDetails TEXT,
      durationMs INTEGER,
      runAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (formId) REFERENCES forms (id) ON DELETE CASCADE,
      FOREIGN KEY (paymentMethodId) REFERENCES payment_methods (id) ON DELETE CASCADE
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
          INSERT INTO test_runs (id, formId, paymentMethodId, status, errorMessage, screenshotPath, logDetails, durationMs, runAt)
          SELECT id, formId, paymentMethodId, status, errorMessage, screenshotPath, logDetails, durationMs, runAt 
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
    { key: "default_donation_amount", value: "50", description: "Default donation amount in EUR" },
    { key: "default_interval", value: "0", description: "Default donation interval (0=once, 1=monthly)" },
    { key: "test_timeout", value: "30000", description: "Test timeout in milliseconds" },
    { key: "headless_mode", value: "true", description: "Run tests in headless mode" },
    { key: "slow_motion", value: "0", description: "Slow motion delay in ms (0=off, 500=slow, 1000=very slow)" },
    { key: "theme", value: "system", description: "UI theme preference (system, light, dark)" }
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
  migratePaymentMethodEncryption().catch((error) => {
    console.error("Database: Failed to migrate payment methods:", error);
  });
  cleanupOrphanedTests();
  console.log("Database: Initialization complete");
}
function cleanupOrphanedTests() {
  try {
    const orphanedTests = db.prepare(
      "SELECT id, status FROM test_runs WHERE status IN ('RUNNING', 'QUEUED')"
    ).all();
    if (orphanedTests.length > 0) {
      console.log(`Database: Found ${orphanedTests.length} orphaned tests from previous session`);
      const updateStmt = db.prepare(
        "UPDATE test_runs SET status = 'STOPPED', errorMessage = ? WHERE id = ?"
      );
      db.transaction(() => {
        for (const test of orphanedTests) {
          updateStmt.run("Test interrupted by app restart", test.id);
        }
      })();
      console.log(`Database: Marked ${orphanedTests.length} orphaned tests as STOPPED`);
    }
  } catch (error) {
    console.error("Database: Error cleaning up orphaned tests:", error);
  }
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
    console.log("Database: Deleting form with CASCADE DELETE for id:", id);
    try {
      const checkTestRuns = db.prepare("SELECT COUNT(*) as count FROM test_runs WHERE formId = ?");
      const testRunCount = checkTestRuns.get(id);
      console.log("Database: Found", testRunCount.count, "test runs for form", id, "(will be auto-deleted)");
      const deleteForm = db.prepare("DELETE FROM forms WHERE id = ?");
      const result = deleteForm.run(id);
      console.log("Database: Deleted form", id, "and cascaded test runs, result:", result);
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
    console.log("Database: Deleting payment method with CASCADE DELETE for id:", id);
    try {
      const checkTestRuns = db.prepare("SELECT COUNT(*) as count FROM test_runs WHERE paymentMethodId = ?");
      const testRunCount = checkTestRuns.get(id);
      console.log("Database: Found", testRunCount.count, "test runs for payment method", id, "(will be auto-deleted)");
      const deletePaymentMethod = db.prepare("DELETE FROM payment_methods WHERE id = ?");
      const result = deletePaymentMethod.run(id);
      console.log("Database: Deleted payment method", id, "and cascaded test runs, result:", result);
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
  set: (key, value, description) => db.prepare("INSERT OR REPLACE INTO global_settings (key, value, description) VALUES (?, ?, ?)").run(key, value, description)
};
const testRunQueries = {
  getAll: () => {
    const rows = db.prepare("SELECT * FROM test_runs ORDER BY runAt DESC").all();
    return rows.map((row) => ({
      ...row,
      steps: row.steps ? JSON.parse(row.steps) : [],
      isScheduled: Boolean(row.isScheduled)
    }));
  },
  getById: (id) => {
    const row = db.prepare("SELECT * FROM test_runs WHERE id = ?").get(id);
    if (!row) return void 0;
    return {
      ...row,
      steps: row.steps ? JSON.parse(row.steps) : [],
      isScheduled: Boolean(row.isScheduled)
    };
  },
  getByForm: (formId) => {
    const rows = db.prepare("SELECT * FROM test_runs WHERE formId = ? ORDER BY runAt DESC").all(formId);
    return rows.map((row) => ({
      ...row,
      steps: row.steps ? JSON.parse(row.steps) : [],
      isScheduled: Boolean(row.isScheduled)
    }));
  },
  create: (testRun) => db.prepare("INSERT INTO test_runs (uuid, formId, paymentMethodId, status, errorMessage, screenshotPath, logDetails, steps, durationMs, isScheduled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(testRun.uuid, testRun.formId, testRun.paymentMethodId, testRun.status, testRun.errorMessage, testRun.screenshotPath, testRun.logDetails, JSON.stringify(testRun.steps || []), testRun.durationMs, testRun.isScheduled ? 1 : 0),
  updateStatus: (id, status, errorMessage, durationMs, steps) => {
    const stmt = db.prepare("UPDATE test_runs SET status = ?, errorMessage = ?, durationMs = ?, steps = ? WHERE id = ? AND status != 'STOPPED'");
    return stmt.run(status, errorMessage, durationMs, JSON.stringify(steps || []), id);
  },
  updateNotes: (id, notes) => {
    const stmt = db.prepare("UPDATE test_runs SET notes = ? WHERE id = ?");
    return stmt.run(notes, id);
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
  }
};
const testScheduleQueries = {
  getAll: () => {
    const schedules = db.prepare("SELECT * FROM test_schedules ORDER BY createdAt DESC").all();
    return schedules.map((s) => ({
      ...s,
      isActive: Boolean(s.isActive),
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
      lastRun: s.lastRun ? new Date(s.lastRun) : void 0,
      createdAt: new Date(s.createdAt)
    };
  },
  create: (schedule) => {
    return db.prepare("INSERT INTO test_schedules (name, formId, paymentMethodId, cronExpression, isActive, icon) VALUES (?, ?, ?, ?, ?, ?)").run(schedule.name, schedule.formId, schedule.paymentMethodId, schedule.cronExpression, schedule.isActive ? 1 : 0, schedule.icon || "Play");
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
              screenshotPath: tr.screenshotPath,
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
                screenshotPath: tr.screenshotPath,
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
      let runnerPath = path.join(__dirname, "testRunner", "runner.js");
      const fs2 = require("fs");
      if (!fs2.existsSync(runnerPath)) {
        runnerPath = path.join(process.cwd(), "src", "main", "testRunner", "runner.js");
        console.log(`Using development runner path: ${runnerPath}`);
      } else {
        console.log(`Using production runner path: ${runnerPath}`);
      }
      if (!fs2.existsSync(runnerPath)) {
        throw new Error(`Runner script not found at: ${runnerPath}`);
      }
      this.process = child_process.spawn("node", [runnerPath], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: process.cwd(),
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
  async runTest(testRunId, form, paymentMethod, settings, retryCount = 0) {
    const maxRetries = 2;
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
      const message = {
        id: this.generateMessageId(),
        type: "START_TEST",
        payload: {
          testRunId,
          form,
          paymentMethod,
          settings,
          selectorConfig
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
          screenshot: response.payload.result?.screenshot,
          formAnalysis: response.payload.result?.formAnalysis
        };
      } else {
        return {
          success: false,
          error: response.payload?.error || "Test execution failed",
          duration: response.payload?.result?.duration || 0,
          logs: response.payload?.result?.logs || response.payload?.logs || [],
          steps: response.payload?.result?.steps || [],
          screenshot: response.payload?.result?.screenshot
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
          }
          this.messageQueue.clear();
        }
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        return this.runTest(testRunId, form, paymentMethod, settings, retryCount + 1);
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: 0,
        logs: [`Failed after ${maxRetries + 1} attempts: ${error}`]
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
async function runSingleTest(testRunId, form, paymentMethod, settings) {
  console.log(`Running test ${testRunId}: ${form.name} with ${paymentMethod.name}`);
  const testRun = testRunQueries.getById(testRunId);
  const isScheduled = testRun?.isScheduled;
  try {
    const processManager2 = getTestProcessManager();
    const result = await processManager2.runTest(testRunId, form, paymentMethod, settings);
    await testRunQueries.updateStatus(testRunId, result.success ? "SUCCESS" : "FAILURE", result.error, result.duration, result.steps);
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
    const errorSteps = [
      {
        id: "test-error",
        name: "Test fehlgeschlagen",
        status: "error",
        startTime: (/* @__PURE__ */ new Date()).toISOString(),
        endTime: (/* @__PURE__ */ new Date()).toISOString(),
        duration: 0,
        message: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.message : String(error)
      }
    ];
    await testRunQueries.updateStatus(testRunId, "FAILURE", error instanceof Error ? error.message : String(error), 0, errorSteps);
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
        errorMessage: error instanceof Error ? error.message : String(error),
        runAt: /* @__PURE__ */ new Date()
      }).catch((err) => console.error("Failed to send email notification:", err));
    }
  }
}
async function createAndRunTest(formId, paymentMethodId) {
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
      screenshotPath: void 0,
      errorMessage: void 0,
      durationMs: void 0,
      isScheduled: true
    });
    const testRunId = testRun.lastInsertRowid;
    const testQueue = getTestQueue();
    testQueue.enqueue(testRunId, form, paymentMethod, settingsMap);
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
   * Add a test to the queue
   */
  enqueue(testRunId, form, paymentMethod, settings) {
    const queuedTest = {
      testRunId,
      form,
      paymentMethod,
      settings,
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
    const { testRunId, form, paymentMethod, settings } = this.currentTest;
    const waitTime = Date.now() - this.currentTest.addedAt;
    console.log(`[TestQueue] Starting test ${testRunId} (waited ${waitTime}ms in queue). Remaining in queue: ${this.queue.length}`);
    try {
      testRunQueries.updateStatus(testRunId, "RUNNING");
      await runSingleTest(testRunId, form, paymentMethod, settings);
      console.log(`[TestQueue] Test ${testRunId} completed`);
    } catch (error) {
      console.error(`[TestQueue] Test ${testRunId} failed with error:`, error);
    } finally {
      this.currentTest = null;
      this.isProcessing = false;
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (this.queue.length > 0) {
        this.processNext();
      }
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
        await createAndRunTest(schedule.formId, schedule.paymentMethodId);
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
      await createAndRunTest(schedule.formId, schedule.paymentMethodId);
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
function setupIpcHandlers() {
  electron.ipcMain.handle("forms:getAll", async () => {
    try {
      return formQueries.getAll();
    } catch (error) {
      console.error("IPC Error - forms:getAll:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("forms:getById", async (_, id) => {
    try {
      return formQueries.getById(id);
    } catch (error) {
      console.error("IPC Error - forms:getById:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("forms:create", async (_, form) => {
    try {
      return formQueries.create(form);
    } catch (error) {
      console.error("IPC Error - forms:create:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("forms:update", async (_, id, form) => {
    try {
      return formQueries.update(id, form);
    } catch (error) {
      console.error("IPC Error - forms:update:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("forms:delete", async (_, id) => {
    try {
      return formQueries.delete(id);
    } catch (error) {
      console.error("IPC Error - forms:delete:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("forms:deleteAll", async () => {
    try {
      return formQueries.deleteAll();
    } catch (error) {
      console.error("IPC Error - forms:deleteAll:", error);
      throw error;
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
  electron.ipcMain.handle("testRuns:getAll", () => testRunQueries.getAll());
  electron.ipcMain.handle("testRuns:getById", (_, id) => testRunQueries.getById(id));
  electron.ipcMain.handle("testRuns:getByForm", (_, formId) => testRunQueries.getByForm(formId));
  electron.ipcMain.handle("testRuns:create", (_, testRun) => testRunQueries.create({ ...testRun, uuid: testRun.uuid || crypto.randomUUID() }));
  electron.ipcMain.handle("testRuns:updateStatus", (_, id, status, errorMessage, durationMs) => testRunQueries.updateStatus(id, status, errorMessage, durationMs));
  electron.ipcMain.handle("testRuns:delete", (_, id) => testRunQueries.delete(id));
  electron.ipcMain.handle("testRuns:deleteAll", () => testRunQueries.deleteAll());
  electron.ipcMain.handle("testRuns:updateNotes", (_, id, notes) => testRunQueries.updateNotes(id, notes));
  electron.ipcMain.handle("testRuns:stop", (_, id) => {
    const testQueue = getTestQueue();
    testQueue.removeFromQueue(id);
    return testRunQueries.stop(id);
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
        for (const paymentMethod of paymentMethods) {
          console.log(`Creating test run for form "${form.name}" with payment method "${paymentMethod.name}"`);
          const testRun = testRunQueries.create({
            uuid: crypto.randomUUID(),
            formId: form.id,
            paymentMethodId: paymentMethod.id,
            status: "QUEUED",
            logDetails: JSON.stringify([`Test queued for ${form.name} with ${paymentMethod.name}`]),
            screenshotPath: void 0,
            errorMessage: void 0,
            durationMs: void 0,
            isScheduled: false
          });
          testRunIds.push(testRun.lastInsertRowid);
          const testQueue = getTestQueue();
          testQueue.enqueue(testRun.lastInsertRowid, form, paymentMethod, settingsMap);
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
}
let mainWindow;
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
