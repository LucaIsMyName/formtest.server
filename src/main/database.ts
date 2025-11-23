import Database from "better-sqlite3";
import { app } from "electron";
import { join } from "path";
import { randomUUID } from "crypto";
import type { Form, PaymentMethod, GlobalSetting, TestRun, ExportData, ImportOptions, ImportResult } from "../common/types";
import { encrypt, decrypt, isEncrypted } from "./utils/encryption";

let db: Database.Database;

/**
 * Migrate test_runs table to add UUID column
 */
function migrateTestRunUuid(): void {
  console.log("Database: Checking for test_runs UUID column...");
  
  try {
    const columns = db.prepare("PRAGMA table_info(test_runs)").all() as Array<{name: string}>;
    const hasUuid = columns.some(col => col.name === 'uuid');
    
    if (!hasUuid) {
      console.log("Database: Adding uuid column to test_runs...");
      db.exec("ALTER TABLE test_runs ADD COLUMN uuid TEXT");
      
      // Generate UUIDs for existing records
      const runs = db.prepare("SELECT id FROM test_runs WHERE uuid IS NULL").all() as Array<{id: number}>;
      const updateStmt = db.prepare("UPDATE test_runs SET uuid = ? WHERE id = ?");
      
      let updatedCount = 0;
      db.transaction(() => {
        for (const run of runs) {
          updateStmt.run(randomUUID(), run.id);
          updatedCount++;
        }
      })();
      
      console.log(`Database: Added UUIDs to ${updatedCount} existing test runs`);
    }
    
    // Always ensure unique index exists (idempotent)
    db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_test_runs_uuid ON test_runs(uuid)");
  } catch (error) {
    console.error("Database: UUID migration error:", error);
  }
}

/**
 * Migrate existing tables to add icon columns
 */
function migrateIconColumns(): void {
  console.log("Database: Checking for icon columns...");
  
  try {
    // Check if forms.icon exists
    const formsInfo = db.prepare("PRAGMA table_info(forms)").all() as Array<{name: string}>;
    const hasFormsIcon = formsInfo.some(col => col.name === 'icon');
    
    if (!hasFormsIcon) {
      console.log("Database: Adding icon column to forms...");
      db.exec("ALTER TABLE forms ADD COLUMN icon TEXT DEFAULT 'FileText'");
      console.log("Database: Icon column added to forms");
    }
    
    // Check if payment_methods.icon exists
    const pmInfo = db.prepare("PRAGMA table_info(payment_methods)").all() as Array<{name: string}>;
    const hasPmIcon = pmInfo.some(col => col.name === 'icon');
    
    if (!hasPmIcon) {
      console.log("Database: Adding icon column to payment_methods...");
      db.exec("ALTER TABLE payment_methods ADD COLUMN icon TEXT");
      
      // Set default icons based on type
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

/**
 * Migrate existing unencrypted payment methods to encrypted format
 */
async function migratePaymentMethodEncryption(): Promise<void> {
  console.log("Database: Checking for unencrypted payment methods...");
  
  try {
    const methods = db.prepare("SELECT id, details FROM payment_methods").all() as Array<{ id: number; details: string }>;
    
    let migratedCount = 0;
    
    for (const method of methods) {
      // Check if already encrypted
      if (!isEncrypted(method.details)) {
        console.log(`Database: Migrating payment method ${method.id} to encrypted format`);
        
        try {
          // Parse the unencrypted JSON
          const detailsObj = JSON.parse(method.details);
          
          // Encrypt it
          const encryptedDetails = await encrypt(detailsObj);
          
          // Update in database
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

export function initDatabase(): void {
  console.log("=== INITIALIZING DATABASE ===");
  const dbPath = join(app.getPath("userData"), "formtest.db");
  console.log("Database: Path:", dbPath);

  try {
    db = new Database(dbPath);
    console.log("Database: SQLite connection established");

    // Enable foreign key constraints
    db.pragma("foreign_keys = ON");
    console.log("Database: Foreign key constraints enabled");
  } catch (dbError) {
    console.error("Database: Failed to create SQLite connection:", dbError);
    throw dbError;
  }

  // Check if we need to migrate the test_runs table for CASCADE DELETE
  try {
    const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='test_runs'").get() as { sql: string } | undefined;
    if (tableInfo && !tableInfo.sql.includes("ON DELETE CASCADE")) {
      console.log("Database: Migrating test_runs table to add CASCADE DELETE...");

      // Backup existing data
      db.exec(`
        CREATE TABLE test_runs_backup AS SELECT * FROM test_runs;
        DROP TABLE test_runs;
      `);
      console.log("Database: Backed up and dropped old test_runs table");
    }
  } catch (error) {
    console.log("Database: No existing test_runs table found, will create new one");
  }

  // Create tables
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
      status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE', 'SKIPPED', 'RUNNING')),
      errorMessage TEXT,
      screenshotPath TEXT,
      logDetails TEXT,
      durationMs INTEGER,
      runAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (formId) REFERENCES forms (id) ON DELETE CASCADE,
      FOREIGN KEY (paymentMethodId) REFERENCES payment_methods (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_test_runs_form ON test_runs(formId);
    CREATE INDEX IF NOT EXISTS idx_test_runs_payment ON test_runs(paymentMethodId);
    CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
  `);

  // Restore backed up data if migration occurred
  try {
    const backupExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='test_runs_backup'").get();
    if (backupExists) {
      console.log("Database: Restoring test_runs data from backup...");
      // Check if backup has uuid column
      const backupInfo = db.prepare("PRAGMA table_info(test_runs_backup)").all() as Array<{name: string}>;
      const backupHasUuid = backupInfo.some(col => col.name === 'uuid');
      
      if (backupHasUuid) {
        db.exec(`
          INSERT INTO test_runs SELECT * FROM test_runs_backup;
          DROP TABLE test_runs_backup;
        `);
      } else {
        // Restore without uuid, migration will handle it
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

  // Insert default settings
  const defaultSettings = [
    { key: "default_donation_amount", value: "50", description: "Default donation amount in EUR" },
    { key: "default_interval", value: "0", description: "Default donation interval (0=once, 1=monthly)" },
    { key: "test_timeout", value: "30000", description: "Test timeout in milliseconds" },
    { key: "headless_mode", value: "true", description: "Run tests in headless mode" },
    { key: "theme", value: "system", description: "UI theme preference (system, light, dark)" },
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO global_settings (key, value, description) 
    VALUES (?, ?, ?)
  `);

  for (const setting of defaultSettings) {
    insertSetting.run(setting.key, setting.value, setting.description);
  }

  console.log("Database: Tables created and default settings inserted");
  
  // Migrate UUIDs
  migrateTestRunUuid();

  // Migrate icon columns
  migrateIconColumns();
  
  // Migrate existing unencrypted payment methods
  migratePaymentMethodEncryption().catch((error) => {
    console.error("Database: Failed to migrate payment methods:", error);
  });
  
  console.log("Database: Initialization complete");
}

export function getDatabase(): Database.Database {
  return db;
}

// Form operations
export const formQueries = {
  getAll: () => {
    const forms = db.prepare("SELECT * FROM forms ORDER BY name").all() as any[];
    return forms.map((form) => ({
      ...form,
      isActive: Boolean(form.isActive),
      createdAt: new Date(form.createdAt),
      updatedAt: new Date(form.updatedAt),
    })) as Form[];
  },
  getById: (id: number) => {
    const form = db.prepare("SELECT * FROM forms WHERE id = ?").get(id) as any;
    if (!form) return undefined;
    return {
      ...form,
      isActive: Boolean(form.isActive),
      createdAt: new Date(form.createdAt),
      updatedAt: new Date(form.updatedAt),
    } as Form;
  },
  create: (form: Omit<Form, "id" | "createdAt" | "updatedAt">) => {
    console.log("Database: Creating form with raw data:", JSON.stringify(form, null, 2));
    console.log("Database: Form data types:", {
      name: typeof form.name,
      url: typeof form.url,
      hash: typeof form.hash,
      isActive: typeof form.isActive,
    });

    // Ultra-robust data sanitization
    let name: string = "";
    let url: string = "";
    let hash: string | null = null;
    let isActive: number = 0;

    try {
      // Handle name
      if (form.name === null || form.name === undefined) {
        name = "";
      } else {
        name = String(form.name).trim();
      }

      // Handle URL
      if (form.url === null || form.url === undefined) {
        url = "";
      } else {
        url = String(form.url).trim();
      }

      // Handle hash - be very explicit about null vs undefined vs empty string
      if (form.hash === null || form.hash === undefined || form.hash === "") {
        hash = null;
      } else {
        const hashStr = String(form.hash).trim();
        hash = hashStr === "" ? null : hashStr;
      }

      // Handle isActive - be very explicit about boolean conversion
      // Use any type to handle potential type mismatches from IPC
      const isActiveValue = form.isActive as any;
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
        isActive: typeof isActive,
      });

      const icon = form.icon ? String(form.icon) : 'FileText';
      const stmt = db.prepare("INSERT INTO forms (name, url, hash, icon, isActive) VALUES (?, ?, ?, ?, ?)");
      const result = stmt.run(name, url, hash, icon, isActive);
      console.log("Database: Insert result:", result);
      return result;
    } catch (error) {
      console.error("Database: Error in create method:", error);
      console.error("Database: Error details:", {
        originalForm: form,
        sanitizedValues: { name, url, hash, isActive },
      });
      throw error;
    }
  },
  update: (id: number, form: Partial<Form>) => {
    console.log("Database: Updating form with data:", { id, form });

    // Ensure all values are proper SQLite types
    const name = form.name !== undefined ? String(form.name) : undefined;
    const url = form.url !== undefined ? String(form.url) : undefined;
    const hash = form.hash !== undefined ? (form.hash && form.hash.trim() ? String(form.hash.trim()) : null) : undefined;
    const icon = form.icon !== undefined ? String(form.icon) : undefined;
    const isActive = form.isActive !== undefined ? (form.isActive === true ? 1 : 0) : undefined;

    // Only update fields that are provided
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (url !== undefined) {
      updates.push("url = ?");
      values.push(url);
    }
    if (hash !== undefined) {
      updates.push("hash = ?");
      values.push(hash);
    }
    if (icon !== undefined) {
      updates.push("icon = ?");
      values.push(icon);
    }
    if (isActive !== undefined) {
      updates.push("isActive = ?");
      values.push(isActive);
    }

    updates.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    const sql = `UPDATE forms SET ${updates.join(", ")} WHERE id = ?`;
    console.log("Database: Update SQL:", sql, "Values:", values);

    const stmt = db.prepare(sql);
    return stmt.run(...values);
  },
  delete: (id: number) => {
    console.log("Database: Deleting form with CASCADE DELETE for id:", id);

    try {
      // Check if there are any test runs for this form (for logging)
      const checkTestRuns = db.prepare("SELECT COUNT(*) as count FROM test_runs WHERE formId = ?");
      const testRunCount = checkTestRuns.get(id) as { count: number };
      console.log("Database: Found", testRunCount.count, "test runs for form", id, "(will be auto-deleted)");

      // Delete the form - CASCADE DELETE will automatically delete related test runs
      const deleteForm = db.prepare("DELETE FROM forms WHERE id = ?");
      const result = deleteForm.run(id);
      console.log("Database: Deleted form", id, "and cascaded test runs, result:", result);

      return result;
    } catch (error) {
      console.error("Database: Error deleting form", id, ":", error);
      throw error;
    }
  },
};

// Payment method operations
console.log("Database: Initializing paymentMethodQueries...");
export const paymentMethodQueries = {
  getAll: async () => {
    const methods = db.prepare("SELECT * FROM payment_methods ORDER BY name").all() as any[];
    const decryptedMethods = await Promise.all(
      methods.map(async (method) => {
        let details;
        try {
          // Check if details are encrypted
          if (isEncrypted(method.details)) {
            details = await decrypt(method.details);
          } else {
            // Legacy unencrypted data
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
          updatedAt: new Date(method.updatedAt),
        };
      })
    );
    return decryptedMethods as PaymentMethod[];
  },
  getById: async (id: number) => {
    const method = db.prepare("SELECT * FROM payment_methods WHERE id = ?").get(id) as any;
    if (!method) return undefined;
    
    let details;
    try {
      // Check if details are encrypted
      if (isEncrypted(method.details)) {
        details = await decrypt(method.details);
      } else {
        // Legacy unencrypted data
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
      updatedAt: new Date(method.updatedAt),
    } as PaymentMethod;
  },
  create: async (method: Omit<PaymentMethod, "id" | "createdAt" | "updatedAt">) => {
    // Ultra-robust data sanitization
    let name: string = "";
    let type: string = "paypal";
    let isActive: number = 0;
    let details: string = "{}";

    try {
      // Handle name
      if (method.name === null || method.name === undefined) {
        name = "";
      } else {
        name = String(method.name).trim();
      }

      // Handle type
      if (method.type === null || method.type === undefined) {
        type = "paypal";
      } else {
        const validTypes = ["paypal", "sepa", "creditcard", "eps"];
        const typeStr = String(method.type).toLowerCase();
        type = validTypes.includes(typeStr) ? typeStr : "paypal";
      }

      // Handle isActive - be very explicit about boolean conversion
      const isActiveValue = method.isActive as any;
      if (isActiveValue === true || isActiveValue === 1 || isActiveValue === "1" || isActiveValue === "true") {
        isActive = 1;
      } else {
        isActive = 0;
      }

      // Handle details - encrypt sensitive data
      if (method.details === null || method.details === undefined) {
        details = await encrypt({});
      } else {
        try {
          // Encrypt the payment details
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
        sanitizedValues: { name, type, isActive, details: "[ENCRYPTED]" },
      });
      throw error;
    }
  },
  update: async (id: number, method: Partial<PaymentMethod>) => {
    console.log("Database: Updating payment method with data:", { id, method });

    // Ensure all values are proper SQLite types
    const name = method.name !== undefined ? String(method.name) : undefined;
    const type = method.type !== undefined ? String(method.type) : undefined;
    const icon = method.icon !== undefined ? String(method.icon) : undefined;
    const isActive = method.isActive !== undefined ? (method.isActive === true ? 1 : 0) : undefined;
    let details: string | undefined = undefined;
    
    // Encrypt details if provided
    if (method.details !== undefined) {
      try {
        details = await encrypt(method.details);
        console.log("Database: Payment details encrypted for update");
      } catch (encryptError) {
        console.error("Database: Failed to encrypt details:", encryptError);
        throw new Error("Failed to encrypt payment details");
      }
    }

    // Only update fields that are provided
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (type !== undefined) {
      updates.push("type = ?");
      values.push(type);
    }
    if (icon !== undefined) {
      updates.push("icon = ?");
      values.push(icon);
    }
    if (isActive !== undefined) {
      updates.push("isActive = ?");
      values.push(isActive);
    }
    if (details !== undefined) {
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
  delete: (id: number) => {
    console.log("Database: Deleting payment method with CASCADE DELETE for id:", id);

    try {
      // Check if there are any test runs for this payment method (for logging)
      const checkTestRuns = db.prepare("SELECT COUNT(*) as count FROM test_runs WHERE paymentMethodId = ?");
      const testRunCount = checkTestRuns.get(id) as { count: number };
      console.log("Database: Found", testRunCount.count, "test runs for payment method", id, "(will be auto-deleted)");

      // Delete the payment method - CASCADE DELETE will automatically delete related test runs
      const deletePaymentMethod = db.prepare("DELETE FROM payment_methods WHERE id = ?");
      const result = deletePaymentMethod.run(id);
      console.log("Database: Deleted payment method", id, "and cascaded test runs, result:", result);

      return result;
    } catch (error) {
      console.error("Database: Error deleting payment method", id, ":", error);
      throw error;
    }
  },
};

// Global settings operations
export const settingsQueries = {
  getAll: () => db.prepare("SELECT * FROM global_settings ORDER BY key").all() as GlobalSetting[],
  get: (key: string) => db.prepare("SELECT * FROM global_settings WHERE key = ?").get(key) as GlobalSetting | undefined,
  set: (key: string, value: string, description?: string) => db.prepare("INSERT OR REPLACE INTO global_settings (key, value, description) VALUES (?, ?, ?)").run(key, value, description),
};

export const testRunQueries = {
  getAll: () => db.prepare("SELECT * FROM test_runs ORDER BY runAt DESC").all() as TestRun[],
  getById: (id: number) => db.prepare("SELECT * FROM test_runs WHERE id = ?").get(id) as TestRun | undefined,
  getByForm: (formId: number) => db.prepare("SELECT * FROM test_runs WHERE formId = ? ORDER BY runAt DESC").all(formId) as TestRun[],
  create: (testRun: Omit<TestRun, "id" | "runAt">) => db.prepare("INSERT INTO test_runs (uuid, formId, paymentMethodId, status, errorMessage, screenshotPath, logDetails, durationMs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(testRun.uuid, testRun.formId, testRun.paymentMethodId, testRun.status, testRun.errorMessage, testRun.screenshotPath, testRun.logDetails, testRun.durationMs),
  updateStatus: (id: number, status: TestRun["status"], errorMessage?: string, durationMs?: number) => {
    const stmt = db.prepare("UPDATE test_runs SET status = ?, errorMessage = ?, durationMs = ? WHERE id = ?");
    return stmt.run(status, errorMessage, durationMs, id);
  },
  delete: (id: number) => {
    const stmt = db.prepare("DELETE FROM test_runs WHERE id = ?");
    return stmt.run(id);
  },
};

// Export/Import operations
export const exportQueries = {
  async exportAll(options: ImportOptions): Promise<ExportData> {
    console.log("Database: Exporting data with options:", options);
    
    const exportData: ExportData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
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
        // Payment methods are already decrypted by getAll()
        exportData.data.paymentMethods = methods;
        console.log(`Database: Exported ${exportData.data.paymentMethods?.length || 0} payment methods`);
      }

      if (options.includeTestRuns) {
        exportData.data.testRuns = testRunQueries.getAll();
        console.log(`Database: Exported ${exportData.data.testRuns.length} test runs`);
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

export const importQueries = {
  async importOverwrite(data: ExportData, options: ImportOptions): Promise<ImportResult> {
    console.log("Database: Starting overwrite import");
    
    const result: ImportResult = {
      success: true,
      imported: { forms: 0, paymentMethods: 0, testRuns: 0, settings: 0 },
      skipped: { forms: 0, paymentMethods: 0, testRuns: 0, settings: 0 },
      errors: [],
      warnings: []
    };

    try {
      db.exec("BEGIN TRANSACTION");

      // Delete existing data for selected tables
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

      if (options.includeSettings && data.data.settings) {
        // Keep theme setting
        db.exec("DELETE FROM global_settings WHERE key != 'theme'");
        console.log("Database: Cleared settings (kept theme)");
      }

      // Import forms
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
          } catch (error: any) {
            result.errors.push(`Failed to import form "${form.name}": ${error.message}`);
          }
        }
      }

      // Import payment methods
      if (options.includePaymentMethods && data.data.paymentMethods) {
        for (const pm of data.data.paymentMethods) {
          try {
            // Re-encrypt with current machine's key
            const pmData = {
              name: pm.name,
              type: pm.type,
              icon: pm.icon || undefined,
              isActive: pm.isActive,
              details: pm.details // Already decrypted, will be encrypted by create()
            };
            await paymentMethodQueries.create(pmData);
            result.imported.paymentMethods++;
          } catch (error: any) {
            result.errors.push(`Failed to import payment method "${pm.name}": ${error.message}`);
          }
        }
      }

      // Import test runs
      if (options.includeTestRuns && data.data.testRuns) {
        for (const tr of data.data.testRuns) {
          try {
            testRunQueries.create({
              uuid: (tr as any).uuid || randomUUID(),
              formId: tr.formId,
              paymentMethodId: tr.paymentMethodId,
              status: tr.status,
              errorMessage: tr.errorMessage,
              screenshotPath: tr.screenshotPath,
              logDetails: tr.logDetails,
              durationMs: tr.durationMs
            });
            result.imported.testRuns++;
          } catch (error: any) {
            result.errors.push(`Failed to import test run: ${error.message}`);
          }
        }
      }

      // Import settings
      if (options.includeSettings && data.data.settings) {
        for (const setting of data.data.settings) {
          try {
            if (setting.key !== 'theme') { // Skip theme to keep user's preference
              settingsQueries.set(setting.key, setting.value, setting.description);
              result.imported.settings++;
            }
          } catch (error: any) {
            result.errors.push(`Failed to import setting "${setting.key}": ${error.message}`);
          }
        }
      }

      db.exec("COMMIT");
      console.log("Database: Overwrite import completed successfully");
    } catch (error) {
      db.exec("ROLLBACK");
      result.success = false;
      result.errors.push(`Import failed: ${(error as any).message}`);
      console.error("Database: Import failed, rolled back:", error);
    }

    return result;
  },

  async importMerge(data: ExportData, options: ImportOptions): Promise<ImportResult> {
    console.log("Database: Starting merge import");
    
    const result: ImportResult = {
      success: true,
      imported: { forms: 0, paymentMethods: 0, testRuns: 0, settings: 0 },
      skipped: { forms: 0, paymentMethods: 0, testRuns: 0, settings: 0 },
      errors: [],
      warnings: []
    };

    const idMap = {
      forms: new Map<number, number>(),
      paymentMethods: new Map<number, number>()
    };

    try {
      db.exec("BEGIN TRANSACTION");

      // Merge forms
      if (options.includeForms && data.data.forms) {
        const existingForms = formQueries.getAll();
        
        for (const importedForm of data.data.forms) {
          try {
            // Check if form exists (by name + url)
            const existing = existingForms.find(
              f => f.name === importedForm.name && f.url === importedForm.url
            );

            if (existing) {
              // Check if different
              const isDifferent = 
                existing.hash !== importedForm.hash ||
                existing.icon !== importedForm.icon ||
                existing.isActive !== importedForm.isActive;

              if (isDifferent) {
                // Update existing
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
              // Create new
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
          } catch (error: any) {
            result.errors.push(`Failed to merge form "${importedForm.name}": ${error.message}`);
          }
        }
      }

      // Merge payment methods
      if (options.includePaymentMethods && data.data.paymentMethods) {
        const existingMethods = await paymentMethodQueries.getAll();
        
        for (const importedPM of data.data.paymentMethods) {
          try {
            // Check if exists (by name + type)
            const existing = existingMethods.find(
              (pm: PaymentMethod) => pm.name === importedPM.name && pm.type === importedPM.type
            );

            if (existing) {
              // Always update payment methods in merge mode (details might have changed)
              await paymentMethodQueries.update(existing.id, {
                icon: importedPM.icon || undefined,
                isActive: importedPM.isActive,
                details: importedPM.details // Already decrypted, will be encrypted by update()
              });
              result.imported.paymentMethods++;
              idMap.paymentMethods.set(importedPM.id, existing.id);
              result.warnings.push(`Updated payment method "${importedPM.name}"`);
            } else {
              // Create new
              const newPM = await paymentMethodQueries.create({
                name: importedPM.name,
                type: importedPM.type,
                icon: importedPM.icon || undefined,
                isActive: importedPM.isActive,
                details: importedPM.details // Already decrypted, will be encrypted by create()
              });
              result.imported.paymentMethods++;
              idMap.paymentMethods.set(importedPM.id, Number(newPM.lastInsertRowid));
            }
          } catch (error: any) {
            result.errors.push(`Failed to merge payment method "${importedPM.name}": ${error.message}`);
          }
        }
      }

      // Merge test runs (with ID remapping)
      if (options.includeTestRuns && data.data.testRuns) {
        const existingTestRuns = testRunQueries.getAll();
        
        for (const tr of data.data.testRuns) {
          try {
            // Map form and payment method IDs
            const newFormId = idMap.forms.get(tr.formId) || tr.formId;
            const newPaymentMethodId = idMap.paymentMethods.get(tr.paymentMethodId) || tr.paymentMethodId;

            // Check if test run exists (by uuid if available, or fallback logic)
            const existing = tr.uuid ? existingTestRuns.find(r => r.uuid === tr.uuid) : null;

            if (!existing) {
              testRunQueries.create({
                uuid: (tr as any).uuid || randomUUID(),
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
          } catch (error: any) {
            result.errors.push(`Failed to merge test run: ${error.message}`);
          }
        }
      }

      // Merge settings
      if (options.includeSettings && data.data.settings) {
        for (const setting of data.data.settings) {
          try {
            if (setting.key !== 'theme') {
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
          } catch (error: any) {
            result.errors.push(`Failed to merge setting "${setting.key}": ${error.message}`);
          }
        }
      }

      db.exec("COMMIT");
      console.log("Database: Merge import completed successfully");
    } catch (error) {
      db.exec("ROLLBACK");
      result.success = false;
      result.errors.push(`Merge import failed: ${(error as any).message}`);
      console.error("Database: Merge import failed, rolled back:", error);
    }

    return result;
  }
};
