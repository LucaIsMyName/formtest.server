import Database from "better-sqlite3";
import { app } from "electron";
import { join } from "path";
import { randomUUID, scryptSync, randomBytes, timingSafeEqual } from "crypto";
import type { Form, PaymentMethod, GlobalSetting, TestRun, ExportData, ImportOptions, ImportResult, GlobalFieldDefaults, CustomScript, FormScript, ScriptHookPoint } from "../common/types";
import { encrypt, decrypt, isEncrypted } from "./utils/encryption";
import { SELECTOR_CONFIG, mergeSelectorsConfig, type SelectorOverride, type SelectorConfig } from "../common/selectors.config";

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
 * Migrate test_runs table to add steps column
 */
function migrateTestRunSteps(): void {
  console.log("Database: Checking for test_runs steps column...");
  
  try {
    const columns = db.prepare("PRAGMA table_info(test_runs)").all() as Array<{name: string}>;
    const hasSteps = columns.some(col => col.name === 'steps');
    
    if (!hasSteps) {
      console.log("Database: Adding steps column to test_runs...");
      db.exec("ALTER TABLE test_runs ADD COLUMN steps TEXT DEFAULT '[]'");
      
      // Initialize existing records with empty steps array
      const updateStmt = db.prepare("UPDATE test_runs SET steps = '[]' WHERE steps IS NULL");
      const result = updateStmt.run();
      
      console.log(`Database: Initialized steps column for ${result.changes} existing test runs`);
    }
  } catch (error) {
    console.error("Database: Steps migration error:", error);
  }
}

/**
 * Migrate test_schedules table to add icon column
 */
function migrateTestScheduleIcon(): void {
  console.log("Database: Checking for test_schedules icon column...");
  
  try {
    const columns = db.prepare("PRAGMA table_info(test_schedules)").all() as Array<{name: string}>;
    const hasIcon = columns.some(col => col.name === 'icon');
    
    if (!hasIcon) {
      console.log("Database: Adding icon column to test_schedules...");
      db.exec("ALTER TABLE test_schedules ADD COLUMN icon TEXT DEFAULT 'Play'");
      
      // Initialize existing records with default icon
      const updateStmt = db.prepare("UPDATE test_schedules SET icon = 'Play' WHERE icon IS NULL");
      const result = updateStmt.run();
      
      console.log(`Database: Initialized icon column for ${result.changes} existing schedules`);
    }
  } catch (error) {
    console.error("Database: Schedule icon migration error:", error);
  }
}

/**
 * Migrate test_runs table to add notes column
 */
function migrateTestRunNotes(): void {
  console.log("Database: Checking for test_runs notes column...");
  
  try {
    const columns = db.prepare("PRAGMA table_info(test_runs)").all() as Array<{name: string}>;
    const hasNotes = columns.some(col => col.name === 'notes');
    
    if (!hasNotes) {
      console.log("Database: Adding notes column to test_runs...");
      db.exec("ALTER TABLE test_runs ADD COLUMN notes TEXT DEFAULT ''");
      
      // Initialize existing records with empty notes
      const updateStmt = db.prepare("UPDATE test_runs SET notes = '' WHERE notes IS NULL");
      const result = updateStmt.run();
      
      console.log(`Database: Initialized notes column for ${result.changes} existing test runs`);
    }
  } catch (error) {
    console.error("Database: Test run notes migration error:", error);
  }
}

/**
 * Migrate test_runs table to add STOPPED and QUEUED status to CHECK constraint
 */
function migrateTestRunStoppedStatus(): void {
  console.log("Database: Checking for test_runs status constraint...");
  
  try {
    // Check if the table has the old CHECK constraint (without STOPPED or QUEUED)
    const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='test_runs'").get() as { sql: string } | undefined;
    
    const needsMigration = tableInfo && (
      !tableInfo.sql.includes("'STOPPED'") || 
      !tableInfo.sql.includes("'QUEUED'")
    );
    
    if (needsMigration) {
      console.log("Database: Migrating test_runs table to add STOPPED/QUEUED status...");
      
      db.transaction(() => {
        // Create new table with updated CHECK constraint including QUEUED
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
        
        // Copy data from old table
        db.exec(`
          INSERT INTO test_runs_new (id, uuid, formId, paymentMethodId, status, errorMessage, screenshotPath, logDetails, steps, durationMs, isScheduled, notes, runAt)
          SELECT id, uuid, formId, paymentMethodId, status, errorMessage, screenshotPath, logDetails, steps, durationMs, isScheduled, notes, runAt
          FROM test_runs;
        `);
        
        // Drop old table and rename new one
        db.exec(`
          DROP TABLE test_runs;
          ALTER TABLE test_runs_new RENAME TO test_runs;
        `);
        
        // Recreate index
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

/**
 * Migrate test_runs table to add isScheduled column
 */
function migrateTestRunScheduled(): void {
  console.log("Database: Checking for test_runs isScheduled column...");
  
  try {
    const columns = db.prepare("PRAGMA table_info(test_runs)").all() as Array<{name: string}>;
    const hasIsScheduled = columns.some(col => col.name === 'isScheduled');
    
    if (!hasIsScheduled) {
      console.log("Database: Adding isScheduled column to test_runs...");
      db.exec("ALTER TABLE test_runs ADD COLUMN isScheduled INTEGER DEFAULT 0");
      
      // Initialize existing records as manual tests (not scheduled)
      const updateStmt = db.prepare("UPDATE test_runs SET isScheduled = 0 WHERE isScheduled IS NULL");
      const result = updateStmt.run();
      
      console.log(`Database: Initialized isScheduled column for ${result.changes} existing test runs`);
    }
  } catch (error) {
    console.error("Database: Test run scheduled migration error:", error);
  }
}

/**
 * Migrate test_runs table to add amount and interval columns
 */
function migrateTestRunAmountInterval(): void {
  console.log("Database: Checking for test_runs amount/interval columns...");
  
  try {
    const columns = db.prepare("PRAGMA table_info(test_runs)").all() as Array<{name: string}>;
    const hasAmount = columns.some(col => col.name === 'amount');
    const hasInterval = columns.some(col => col.name === 'interval');
    
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

/**
 * Migrate to add custom_scripts and form_scripts tables
 */
function migrateCustomScripts(): void {
  console.log("Database: Checking for custom_scripts tables...");
  
  try {
    // Check if custom_scripts table exists
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
    
    // Check if form_scripts junction table exists
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

/**
 * Migrate test_runs table to add SEO and Accessibility results columns
 */
function migrateQualityTestResults(): void {
  console.log("Database: Checking for quality test results columns...");
  
  try {
    const columns = db.prepare("PRAGMA table_info(test_runs)").all() as Array<{name: string}>;
    const hasSeoResults = columns.some(col => col.name === 'seoResults');
    const hasA11yResults = columns.some(col => col.name === 'accessibilityResults');
    
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

/**
 * Migrate test_schedules table to add quality test options columns
 */
function migrateScheduleQualityOptions(): void {
  console.log("Database: Checking for schedule quality test options columns...");
  
  try {
    const columns = db.prepare("PRAGMA table_info(test_schedules)").all() as Array<{name: string}>;
    const hasEnableSeoTest = columns.some(col => col.name === 'enableSeoTest');
    const hasEnableA11yTest = columns.some(col => col.name === 'enableAccessibilityTest');
    
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

/**
 * Migrate to add AI chat tables
 */
function migrateAIChatTables(): void {
  console.log("Database: Checking for AI chat tables...");
  
  try {
    // Check if ai_chats table exists
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
    
    // Check if ai_messages table exists
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

/**
 * Migrate forms table to add fieldMappings column
 */
function migrateFormFieldMappings(): void {
  console.log("Database: Checking for forms fieldMappings column...");
  
  try {
    const columns = db.prepare("PRAGMA table_info(forms)").all() as Array<{name: string}>;
    const hasFieldMappings = columns.some(col => col.name === 'fieldMappings');
    
    if (!hasFieldMappings) {
      console.log("Database: Adding fieldMappings column to forms...");
      db.exec("ALTER TABLE forms ADD COLUMN fieldMappings TEXT DEFAULT '[]'");
      
      // Initialize existing records with empty array
      const updateStmt = db.prepare("UPDATE forms SET fieldMappings = '[]' WHERE fieldMappings IS NULL");
      const result = updateStmt.run();
      
      console.log(`Database: Initialized fieldMappings column for ${result.changes} existing forms`);
    }
  } catch (error) {
    console.error("Database: Form fieldMappings migration error:", error);
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
    
    // Enable WAL mode for better concurrent read/write performance
    db.pragma("journal_mode = WAL");
    console.log("Database: WAL mode enabled");
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
    { key: "default_donation_amount", value: "5", description: "Default donation amount in EUR" },
    { key: "default_interval", value: "0", description: "Default donation interval (0=once, 1=monthly)" },
    { key: "test_timeout", value: "30000", description: "Test timeout in milliseconds" },
    { key: "headless_mode", value: "true", description: "Run tests in headless mode" },
    { key: "slow_motion", value: "0", description: "Slow motion delay in ms (0=off, 500=slow, 1000=very slow)" },
    { key: "theme", value: "system", description: "UI theme preference (system, light, dark)" },
    { key: "test_retention_days", value: "365", description: "Number of days to keep test runs (0=forever)" },
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

  // Migrate steps column
  migrateTestRunSteps();

  // Migrate test run scheduled column
  migrateTestRunScheduled();

  // Migrate test run notes column
  migrateTestRunNotes();

  // Migrate test_runs to support STOPPED status
  migrateTestRunStoppedStatus();

  // Migrate schedule icon column
  migrateTestScheduleIcon();

  // Migrate icon columns
  migrateIconColumns();
  
  // Migrate form fieldMappings column
  migrateFormFieldMappings();
  
  // Migrate test run amount/interval columns
  migrateTestRunAmountInterval();
  
  // Migrate custom scripts tables
  migrateCustomScripts();
  
  // Migrate quality test results columns
  migrateQualityTestResults();
  
  // Migrate schedule quality options columns
  migrateScheduleQualityOptions();
  
  // Migrate AI chat tables
  migrateAIChatTables();
  
  // Migrate existing unencrypted payment methods
  migratePaymentMethodEncryption().catch((error) => {
    console.error("Database: Failed to migrate payment methods:", error);
  });
  
  // Clean up orphaned tests (RUNNING/QUEUED from previous session)
  cleanupOrphanedTests();
  
  // Clean up old test runs based on retention policy
  cleanupOldTestRuns();
  
  console.log("Database: Initialization complete");
}

/**
 * Clean up tests that were left in RUNNING or QUEUED state from a previous session
 * These tests were interrupted by app crash/restart and should be marked as STOPPED
 */
function cleanupOrphanedTests(): void {
  try {
    const orphanedTests = db.prepare(
      "SELECT id, status FROM test_runs WHERE status IN ('RUNNING', 'QUEUED')"
    ).all() as Array<{ id: number; status: string }>;
    
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

/**
 * Clean up old test runs based on retention policy
 * Deletes test runs older than the configured retention period
 * @returns Number of deleted test runs
 */
export function cleanupOldTestRuns(): number {
  try {
    const retentionSetting = db.prepare(
      "SELECT value FROM global_settings WHERE key = 'test_retention_days'"
    ).get() as { value: string } | undefined;
    
    const retentionDays = parseInt(retentionSetting?.value || "365");
    
    // 0 means keep forever
    if (retentionDays <= 0) {
      console.log("Database: Test retention disabled (0 days), skipping cleanup");
      return 0;
    }
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffDateStr = cutoffDate.toISOString();
    
    console.log(`Database: Cleaning up test runs older than ${retentionDays} days (before ${cutoffDateStr})`);
    
    // Delete old test runs (notifications will cascade delete)
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
      fieldMappings: form.fieldMappings ? JSON.parse(form.fieldMappings) : [],
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
      fieldMappings: form.fieldMappings ? JSON.parse(form.fieldMappings) : [],
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
      const fieldMappings = form.fieldMappings ? JSON.stringify(form.fieldMappings) : '[]';
      const stmt = db.prepare("INSERT INTO forms (name, url, hash, icon, isActive, fieldMappings) VALUES (?, ?, ?, ?, ?, ?)");
      const result = stmt.run(name, url, hash, icon, isActive, fieldMappings);
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
    if (form.fieldMappings !== undefined) {
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
  deleteAll: () => {
    console.log("Database: Deleting all forms");
    // This will cascade delete test runs and schedules
    return db.prepare("DELETE FROM forms").run();
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
  deleteAll: () => {
    console.log("Database: Deleting all payment methods");
    // This will cascade delete test runs and schedules
    return db.prepare("DELETE FROM payment_methods").run();
  },
};

// Global settings operations
export const settingsQueries = {
  getAll: () => db.prepare("SELECT * FROM global_settings ORDER BY key").all() as GlobalSetting[],
  get: (key: string) => db.prepare("SELECT * FROM global_settings WHERE key = ?").get(key) as GlobalSetting | undefined,
  set: (key: string, value: string, description?: string) => db.prepare("INSERT OR REPLACE INTO global_settings (key, value, description) VALUES (?, ?, ?)").run(key, value, description),
  
  // Global field defaults - stored as JSON in a single setting
  getFieldDefaults: (): GlobalFieldDefaults => {
    const setting = db.prepare("SELECT value FROM global_settings WHERE key = 'global_field_defaults'").get() as { value: string } | undefined;
    if (!setting) return {};
    try {
      return JSON.parse(setting.value) as GlobalFieldDefaults;
    } catch {
      return {};
    }
  },
  
  setFieldDefaults: (defaults: GlobalFieldDefaults) => {
    const value = JSON.stringify(defaults);
    return db.prepare("INSERT OR REPLACE INTO global_settings (key, value, description) VALUES (?, ?, ?)").run(
      'global_field_defaults',
      value,
      'Global default field values that override Faker.js'
    );
  },
};

// Password management using Node's built-in crypto
const SALT_LENGTH = 32;
const KEY_LENGTH = 64;

function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const hashBuffer = Buffer.from(hash, 'hex');
    const suppliedHashBuffer = scryptSync(password, salt, KEY_LENGTH);
    return timingSafeEqual(hashBuffer, suppliedHashBuffer);
  } catch {
    return false;
  }
}

// Session state - tracks if password has been verified this session
let sessionUnlocked = false;

export const passwordQueries = {
  /** Check if master password is enabled */
  isEnabled: (): boolean => {
    const setting = settingsQueries.get('master_password_enabled');
    return setting?.value === 'true';
  },
  
  /** Get the stored password hash */
  getHash: (): string | null => {
    const setting = settingsQueries.get('master_password_hash');
    return setting?.value || null;
  },
  
  /** Set master password (hashes it before storing) */
  setPassword: (password: string): void => {
    const hash = hashPassword(password);
    settingsQueries.set('master_password_hash', hash, 'Hashed master password');
    settingsQueries.set('master_password_enabled', 'true', 'Master password protection enabled');
  },
  
  /** Verify password against stored hash */
  verify: (password: string): boolean => {
    const storedHash = passwordQueries.getHash();
    if (!storedHash) return false;
    const isValid = verifyPassword(password, storedHash);
    if (isValid) {
      sessionUnlocked = true;
    }
    return isValid;
  },
  
  /** Disable master password (requires current password verification first) */
  disable: (currentPassword: string): boolean => {
    if (!passwordQueries.verify(currentPassword)) {
      return false;
    }
    settingsQueries.set('master_password_enabled', 'false', 'Master password protection disabled');
    settingsQueries.set('master_password_hash', '', 'Cleared password hash');
    return true;
  },
  
  /** Change password (requires current password verification first) */
  changePassword: (currentPassword: string, newPassword: string): boolean => {
    if (!passwordQueries.verify(currentPassword)) {
      return false;
    }
    const hash = hashPassword(newPassword);
    settingsQueries.set('master_password_hash', hash, 'Hashed master password');
    return true;
  },
  
  /** Check if session is unlocked */
  isSessionUnlocked: (): boolean => {
    return sessionUnlocked;
  },
  
  /** Reset session (for testing or manual lock) */
  lockSession: (): void => {
    sessionUnlocked = false;
  },
  
  /** Unlock session without password (emergency reset - hold Shift on startup) */
  emergencyReset: (): void => {
    settingsQueries.set('master_password_enabled', 'false', 'Master password protection disabled');
    settingsQueries.set('master_password_hash', '', 'Cleared password hash');
    sessionUnlocked = true;
  },
};

export const testRunQueries = {
  getAll: () => {
    const rows = db.prepare("SELECT * FROM test_runs ORDER BY runAt DESC").all() as any[];
    return rows.map(row => ({
      ...row,
      steps: row.steps ? JSON.parse(row.steps) : [],
      isScheduled: Boolean(row.isScheduled),
      seoResults: row.seoResults ? JSON.parse(row.seoResults) : undefined,
      accessibilityResults: row.accessibilityResults ? JSON.parse(row.accessibilityResults) : undefined,
    })) as TestRun[];
  },
  getById: (id: number) => {
    const row = db.prepare("SELECT * FROM test_runs WHERE id = ?").get(id) as any;
    if (!row) return undefined;
    return {
      ...row,
      steps: row.steps ? JSON.parse(row.steps) : [],
      isScheduled: Boolean(row.isScheduled),
      seoResults: row.seoResults ? JSON.parse(row.seoResults) : undefined,
      accessibilityResults: row.accessibilityResults ? JSON.parse(row.accessibilityResults) : undefined,
    } as TestRun;
  },
  getByForm: (formId: number) => {
    const rows = db.prepare("SELECT * FROM test_runs WHERE formId = ? ORDER BY runAt DESC").all(formId) as any[];
    return rows.map(row => ({
      ...row,
      steps: row.steps ? JSON.parse(row.steps) : [],
      isScheduled: Boolean(row.isScheduled),
      seoResults: row.seoResults ? JSON.parse(row.seoResults) : undefined,
      accessibilityResults: row.accessibilityResults ? JSON.parse(row.accessibilityResults) : undefined,
    })) as TestRun[];
  },
  create: (testRun: Omit<TestRun, "id" | "runAt">) => db.prepare("INSERT INTO test_runs (uuid, formId, paymentMethodId, status, errorMessage, screenshotPath, logDetails, steps, durationMs, isScheduled, amount, interval, seoResults, accessibilityResults) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
    testRun.uuid, 
    testRun.formId, 
    testRun.paymentMethodId, 
    testRun.status, 
    testRun.errorMessage, 
    testRun.screenshotPath, 
    testRun.logDetails, 
    JSON.stringify(testRun.steps || []), 
    testRun.durationMs, 
    testRun.isScheduled ? 1 : 0, 
    testRun.amount, 
    testRun.interval,
    testRun.seoResults ? JSON.stringify(testRun.seoResults) : null,
    testRun.accessibilityResults ? JSON.stringify(testRun.accessibilityResults) : null
  ),
  updateStatus: (id: number, status: TestRun["status"], errorMessage?: string, durationMs?: number, steps?: TestRun["steps"], screenshotPath?: string) => {
    // Don't overwrite STOPPED status - if a test was manually stopped, keep that status
    // This prevents the runner from changing STOPPED to FAILURE when it eventually completes
    const stmt = db.prepare("UPDATE test_runs SET status = ?, errorMessage = ?, durationMs = ?, steps = ?, screenshotPath = ? WHERE id = ? AND status != 'STOPPED'");
    return stmt.run(status, errorMessage, durationMs, JSON.stringify(steps || []), screenshotPath || null, id);
  },
  updateQualityResults: (id: number, seoResults?: any, accessibilityResults?: any) => {
    const stmt = db.prepare("UPDATE test_runs SET seoResults = ?, accessibilityResults = ? WHERE id = ?");
    return stmt.run(
      seoResults ? JSON.stringify(seoResults) : null,
      accessibilityResults ? JSON.stringify(accessibilityResults) : null,
      id
    );
  },
  updateNotes: (id: number, notes: string) => {
    const stmt = db.prepare("UPDATE test_runs SET notes = ? WHERE id = ?");
    return stmt.run(notes, id);
  },
  stop: (id: number) => {
    // Get the test run to calculate duration and check status
    const testRun = db.prepare("SELECT runAt, status FROM test_runs WHERE id = ?").get(id) as { runAt: string; status: string } | undefined;
    let durationMs = 0;
    if (testRun && testRun.status === 'RUNNING') {
      // SQLite stores CURRENT_TIMESTAMP as UTC in format "YYYY-MM-DD HH:MM:SS"
      // JavaScript parses strings without timezone as LOCAL time, so we need to parse as UTC
      const runAtStr = String(testRun.runAt);
      let startTime: number;
      if (!runAtStr.includes('T') && !runAtStr.includes('Z')) {
        // Add 'Z' to indicate UTC
        startTime = new Date(runAtStr.replace(' ', 'T') + 'Z').getTime();
      } else {
        startTime = new Date(runAtStr).getTime();
      }
      durationMs = Date.now() - startTime;
    }
    // Allow stopping both RUNNING and QUEUED tests
    const stmt = db.prepare("UPDATE test_runs SET status = 'STOPPED', durationMs = ? WHERE id = ? AND status IN ('RUNNING', 'QUEUED')");
    return stmt.run(durationMs, id);
  },
  delete: (id: number) => {
    const stmt = db.prepare("DELETE FROM test_runs WHERE id = ?");
    return stmt.run(id);
  },
  deleteAll: () => {
    return db.prepare("DELETE FROM test_runs").run();
  },
};

export const testScheduleQueries = {
  getAll: () => {
    const schedules = db.prepare("SELECT * FROM test_schedules ORDER BY createdAt DESC").all() as any[];
    return schedules.map((s) => ({
      ...s,
      isActive: Boolean(s.isActive),
      enableSeoTest: Boolean(s.enableSeoTest),
      enableAccessibilityTest: Boolean(s.enableAccessibilityTest),
      lastRun: s.lastRun ? new Date(s.lastRun) : undefined,
      createdAt: new Date(s.createdAt),
    }));
  },
  getById: (id: number) => {
    const s = db.prepare("SELECT * FROM test_schedules WHERE id = ?").get(id) as any;
    if (!s) return undefined;
    return {
      ...s,
      isActive: Boolean(s.isActive),
      enableSeoTest: Boolean(s.enableSeoTest),
      enableAccessibilityTest: Boolean(s.enableAccessibilityTest),
      lastRun: s.lastRun ? new Date(s.lastRun) : undefined,
      createdAt: new Date(s.createdAt),
    };
  },
  create: (schedule: { name: string; formId: number; paymentMethodId: number; cronExpression: string; isActive: boolean; icon?: string; enableSeoTest?: boolean; enableAccessibilityTest?: boolean }) => {
    return db.prepare("INSERT INTO test_schedules (name, formId, paymentMethodId, cronExpression, isActive, icon, enableSeoTest, enableAccessibilityTest) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
      schedule.name, 
      schedule.formId, 
      schedule.paymentMethodId, 
      schedule.cronExpression, 
      schedule.isActive ? 1 : 0, 
      schedule.icon || 'Play',
      schedule.enableSeoTest ? 1 : 0,
      schedule.enableAccessibilityTest ? 1 : 0
    );
  },
  update: (id: number, schedule: Partial<{ name: string; formId: number; paymentMethodId: number; cronExpression: string; isActive: boolean; icon: string; lastRun: Date; enableSeoTest: boolean; enableAccessibilityTest: boolean }>) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (schedule.name !== undefined) { updates.push("name = ?"); values.push(schedule.name); }
    if (schedule.formId !== undefined) { updates.push("formId = ?"); values.push(schedule.formId); }
    if (schedule.paymentMethodId !== undefined) { updates.push("paymentMethodId = ?"); values.push(schedule.paymentMethodId); }
    if (schedule.cronExpression !== undefined) { updates.push("cronExpression = ?"); values.push(schedule.cronExpression); }
    if (schedule.isActive !== undefined) { updates.push("isActive = ?"); values.push(schedule.isActive ? 1 : 0); }
    if (schedule.icon !== undefined) { updates.push("icon = ?"); values.push(schedule.icon); }
    if (schedule.lastRun !== undefined) { updates.push("lastRun = ?"); values.push(schedule.lastRun.toISOString()); }
    if (schedule.enableSeoTest !== undefined) { updates.push("enableSeoTest = ?"); values.push(schedule.enableSeoTest ? 1 : 0); }
    if (schedule.enableAccessibilityTest !== undefined) { updates.push("enableAccessibilityTest = ?"); values.push(schedule.enableAccessibilityTest ? 1 : 0); }

    if (updates.length === 0) return { changes: 0 };

    values.push(id);
    return db.prepare(`UPDATE test_schedules SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  },
  delete: (id: number) => {
    return db.prepare("DELETE FROM test_schedules WHERE id = ?").run(id);
  },
  deleteAll: () => {
    return db.prepare("DELETE FROM test_schedules").run();
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

export const importQueries = {
  async importOverwrite(data: ExportData, options: ImportOptions): Promise<ImportResult> {
    console.log("Database: Starting overwrite import");
    
    const result: ImportResult = {
      success: true,
      imported: { forms: 0, paymentMethods: 0, testRuns: 0, schedules: 0, settings: 0 },
      skipped: { forms: 0, paymentMethods: 0, testRuns: 0, schedules: 0, settings: 0 },
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

      if (options.includeSchedules && data.data.testSchedules) {
        db.exec("DELETE FROM test_schedules");
        console.log("Database: Cleared test_schedules table");
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

      // Import schedules
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
          } catch (error: any) {
            result.errors.push(`Failed to import schedule "${schedule.name}": ${error.message}`);
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
      imported: { forms: 0, paymentMethods: 0, testRuns: 0, schedules: 0, settings: 0 },
      skipped: { forms: 0, paymentMethods: 0, testRuns: 0, schedules: 0, settings: 0 },
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

      // Merge schedules (with ID remapping)
      if (options.includeSchedules && data.data.testSchedules) {
        const existingSchedules = testScheduleQueries.getAll();
        
        for (const schedule of data.data.testSchedules) {
          try {
            // Map form and payment method IDs
            const newFormId = idMap.forms.get(schedule.formId) || schedule.formId;
            const newPaymentMethodId = idMap.paymentMethods.get(schedule.paymentMethodId) || schedule.paymentMethodId;

            // Check if schedule exists by name
            const existing = existingSchedules.find(s => s.name === schedule.name);

            if (existing) {
              // Update existing schedule
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
              // Create new schedule
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
          } catch (error: any) {
            result.errors.push(`Failed to merge schedule "${schedule.name}": ${error.message}`);
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

// Notification type
export interface Notification {
  id: number;
  type: 'test_complete' | 'test_failed' | 'info';
  title: string;
  message?: string;
  testRunId?: number;
  isRead: boolean;
  createdAt: Date;
}

// Notification operations
export const notificationQueries = {
  getAll: () => {
    const notifications = db.prepare("SELECT * FROM notifications ORDER BY createdAt DESC").all() as any[];
    return notifications.map((n) => ({
      ...n,
      isRead: Boolean(n.isRead),
      createdAt: new Date(n.createdAt),
    })) as Notification[];
  },
  
  getUnread: () => {
    const notifications = db.prepare("SELECT * FROM notifications WHERE isRead = 0 ORDER BY createdAt DESC").all() as any[];
    return notifications.map((n) => ({
      ...n,
      isRead: Boolean(n.isRead),
      createdAt: new Date(n.createdAt),
    })) as Notification[];
  },
  
  getUnreadCount: () => {
    const result = db.prepare("SELECT COUNT(*) as count FROM notifications WHERE isRead = 0").get() as { count: number };
    return result.count;
  },
  
  create: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    const stmt = db.prepare("INSERT INTO notifications (type, title, message, testRunId) VALUES (?, ?, ?, ?)");
    const result = stmt.run(notification.type, notification.title, notification.message || null, notification.testRunId || null);
    return result.lastInsertRowid as number;
  },
  
  markAsRead: (id: number) => {
    const stmt = db.prepare("UPDATE notifications SET isRead = 1 WHERE id = ?");
    stmt.run(id);
  },
  
  markAllAsRead: () => {
    const stmt = db.prepare("UPDATE notifications SET isRead = 1 WHERE isRead = 0");
    stmt.run();
  },
  
  delete: (id: number) => {
    const stmt = db.prepare("DELETE FROM notifications WHERE id = ?");
    stmt.run(id);
  },
  
  deleteAll: () => {
    const stmt = db.prepare("DELETE FROM notifications");
    stmt.run();
  }
};

// Selector Override operations
export const selectorOverrideQueries = {
  getAll: (): SelectorOverride[] => {
    const overrides = db.prepare("SELECT * FROM selector_overrides ORDER BY category, key").all() as any[];
    return overrides.map((o) => ({
      ...o,
      selectors: JSON.parse(o.selectors),
      isActive: Boolean(o.isActive),
      createdAt: new Date(o.createdAt),
      updatedAt: new Date(o.updatedAt),
    }));
  },

  getByCategory: (category: string): SelectorOverride[] => {
    const overrides = db.prepare("SELECT * FROM selector_overrides WHERE category = ? ORDER BY key").all(category) as any[];
    return overrides.map((o) => ({
      ...o,
      selectors: JSON.parse(o.selectors),
      isActive: Boolean(o.isActive),
      createdAt: new Date(o.createdAt),
      updatedAt: new Date(o.updatedAt),
    }));
  },

  getById: (id: number): SelectorOverride | undefined => {
    const override = db.prepare("SELECT * FROM selector_overrides WHERE id = ?").get(id) as any;
    if (!override) return undefined;
    return {
      ...override,
      selectors: JSON.parse(override.selectors),
      isActive: Boolean(override.isActive),
      createdAt: new Date(override.createdAt),
      updatedAt: new Date(override.updatedAt),
    };
  },

  getActive: (): SelectorOverride[] => {
    const overrides = db.prepare("SELECT * FROM selector_overrides WHERE isActive = 1 ORDER BY category, key").all() as any[];
    return overrides.map((o) => ({
      ...o,
      selectors: JSON.parse(o.selectors),
      isActive: Boolean(o.isActive),
      createdAt: new Date(o.createdAt),
      updatedAt: new Date(o.updatedAt),
    }));
  },

  create: (override: { category: string; key: string; selectors: string[]; isActive?: boolean }) => {
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

  update: (id: number, override: { selectors?: string[]; isActive?: boolean }) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (override.selectors !== undefined) {
      updates.push("selectors = ?");
      values.push(JSON.stringify(override.selectors));
    }
    if (override.isActive !== undefined) {
      updates.push("isActive = ?");
      values.push(override.isActive ? 1 : 0);
    }

    if (updates.length === 0) return;

    updates.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    const stmt = db.prepare(`UPDATE selector_overrides SET ${updates.join(", ")} WHERE id = ?`);
    return stmt.run(...values);
  },

  upsert: (override: { category: string; key: string; selectors: string[]; isActive?: boolean }) => {
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

  delete: (id: number) => {
    const stmt = db.prepare("DELETE FROM selector_overrides WHERE id = ?");
    return stmt.run(id);
  },

  deleteByKey: (category: string, key: string) => {
    const stmt = db.prepare("DELETE FROM selector_overrides WHERE category = ? AND key = ?");
    return stmt.run(category, key);
  },

  deleteAll: () => {
    const stmt = db.prepare("DELETE FROM selector_overrides");
    return stmt.run();
  }
};

// Get merged selector config (base + user overrides)
export function getMergedSelectorConfig(): SelectorConfig {
  const overrides = selectorOverrideQueries.getActive();
  return mergeSelectorsConfig(SELECTOR_CONFIG, overrides);
}

// Get base selector config (no overrides)
export function getBaseSelectorConfig(): SelectorConfig {
  return SELECTOR_CONFIG;
}

// ============================================
// Custom Scripts Operations
// ============================================

export const customScriptQueries = {
  getAll: (): CustomScript[] => {
    const scripts = db.prepare("SELECT * FROM custom_scripts ORDER BY name").all() as any[];
    return scripts.map((s) => ({
      ...s,
      isActive: Boolean(s.isActive),
      isGlobal: Boolean(s.isGlobal),
      stopOnError: Boolean(s.stopOnError),
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
    }));
  },

  getById: (id: number): CustomScript | undefined => {
    const script = db.prepare("SELECT * FROM custom_scripts WHERE id = ?").get(id) as any;
    if (!script) return undefined;
    return {
      ...script,
      isActive: Boolean(script.isActive),
      isGlobal: Boolean(script.isGlobal),
      stopOnError: Boolean(script.stopOnError),
      createdAt: new Date(script.createdAt),
      updatedAt: new Date(script.updatedAt),
    };
  },

  getByHookPoint: (hookPoint: ScriptHookPoint): CustomScript[] => {
    const scripts = db.prepare(
      "SELECT * FROM custom_scripts WHERE hookPoint = ? AND isActive = 1 ORDER BY name"
    ).all(hookPoint) as any[];
    return scripts.map((s) => ({
      ...s,
      isActive: Boolean(s.isActive),
      isGlobal: Boolean(s.isGlobal),
      stopOnError: Boolean(s.stopOnError),
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
    }));
  },

  getGlobalScripts: (): CustomScript[] => {
    const scripts = db.prepare(
      "SELECT * FROM custom_scripts WHERE isGlobal = 1 AND isActive = 1 ORDER BY hookPoint, name"
    ).all() as any[];
    return scripts.map((s) => ({
      ...s,
      isActive: Boolean(s.isActive),
      isGlobal: Boolean(s.isGlobal),
      stopOnError: Boolean(s.stopOnError),
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
    }));
  },

  getByFormId: (formId: number): CustomScript[] => {
    const scripts = db.prepare(`
      SELECT cs.*, fs.executionOrder
      FROM custom_scripts cs
      INNER JOIN form_scripts fs ON cs.id = fs.scriptId
      WHERE fs.formId = ? AND cs.isActive = 1
      ORDER BY cs.hookPoint, fs.executionOrder, cs.name
    `).all(formId) as any[];
    return scripts.map((s) => ({
      ...s,
      isActive: Boolean(s.isActive),
      isGlobal: Boolean(s.isGlobal),
      stopOnError: Boolean(s.stopOnError),
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
    }));
  },

  getScriptsForTest: (formId: number): CustomScript[] => {
    // Get both global scripts and form-specific scripts, ordered by hook point
    const scripts = db.prepare(`
      SELECT DISTINCT cs.*, COALESCE(fs.executionOrder, 0) as executionOrder
      FROM custom_scripts cs
      LEFT JOIN form_scripts fs ON cs.id = fs.scriptId AND fs.formId = ?
      WHERE cs.isActive = 1 AND (cs.isGlobal = 1 OR fs.formId IS NOT NULL)
      ORDER BY cs.hookPoint, executionOrder, cs.name
    `).all(formId) as any[];
    return scripts.map((s) => ({
      ...s,
      isActive: Boolean(s.isActive),
      isGlobal: Boolean(s.isGlobal),
      stopOnError: Boolean(s.stopOnError),
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
    }));
  },

  create: (script: Omit<CustomScript, "id" | "createdAt" | "updatedAt">) => {
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
      script.timeout || 30000
    );
    return { ...result, id: result.lastInsertRowid };
  },

  update: (id: number, script: Partial<CustomScript>) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (script.name !== undefined) {
      updates.push("name = ?");
      values.push(script.name);
    }
    if (script.description !== undefined) {
      updates.push("description = ?");
      values.push(script.description);
    }
    if (script.code !== undefined) {
      updates.push("code = ?");
      values.push(script.code);
    }
    if (script.hookPoint !== undefined) {
      updates.push("hookPoint = ?");
      values.push(script.hookPoint);
    }
    if (script.isActive !== undefined) {
      updates.push("isActive = ?");
      values.push(script.isActive ? 1 : 0);
    }
    if (script.isGlobal !== undefined) {
      updates.push("isGlobal = ?");
      values.push(script.isGlobal ? 1 : 0);
    }
    if (script.stopOnError !== undefined) {
      updates.push("stopOnError = ?");
      values.push(script.stopOnError ? 1 : 0);
    }
    if (script.timeout !== undefined) {
      updates.push("timeout = ?");
      values.push(script.timeout);
    }

    if (updates.length === 0) return;

    updates.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    const stmt = db.prepare(`UPDATE custom_scripts SET ${updates.join(", ")} WHERE id = ?`);
    return stmt.run(...values);
  },

  delete: (id: number) => {
    const stmt = db.prepare("DELETE FROM custom_scripts WHERE id = ?");
    return stmt.run(id);
  },

  deleteAll: () => {
    const stmt = db.prepare("DELETE FROM custom_scripts");
    return stmt.run();
  },
};

// Form-Script junction table operations
export const formScriptQueries = {
  getByFormId: (formId: number): FormScript[] => {
    const rows = db.prepare(
      "SELECT * FROM form_scripts WHERE formId = ? ORDER BY executionOrder"
    ).all(formId) as any[];
    return rows;
  },

  getByScriptId: (scriptId: number): FormScript[] => {
    const rows = db.prepare(
      "SELECT * FROM form_scripts WHERE scriptId = ?"
    ).all(scriptId) as any[];
    return rows;
  },

  attach: (formId: number, scriptId: number, executionOrder: number = 0) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO form_scripts (formId, scriptId, executionOrder)
      VALUES (?, ?, ?)
    `);
    return stmt.run(formId, scriptId, executionOrder);
  },

  detach: (formId: number, scriptId: number) => {
    const stmt = db.prepare(
      "DELETE FROM form_scripts WHERE formId = ? AND scriptId = ?"
    );
    return stmt.run(formId, scriptId);
  },

  detachAllFromForm: (formId: number) => {
    const stmt = db.prepare("DELETE FROM form_scripts WHERE formId = ?");
    return stmt.run(formId);
  },

  detachAllFromScript: (scriptId: number) => {
    const stmt = db.prepare("DELETE FROM form_scripts WHERE scriptId = ?");
    return stmt.run(scriptId);
  },

  updateOrder: (formId: number, scriptId: number, executionOrder: number) => {
    const stmt = db.prepare(
      "UPDATE form_scripts SET executionOrder = ? WHERE formId = ? AND scriptId = ?"
    );
    return stmt.run(executionOrder, formId, scriptId);
  },
};

// ============================================
// AI Chat Operations
// ============================================

export interface AIChat {
  id: number;
  title: string;
  context: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  id: number;
  chatId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: string | null;
  createdAt: Date;
}

export const aiChatQueries = {
  getAll: (): AIChat[] => {
    const chats = db.prepare("SELECT * FROM ai_chats ORDER BY updatedAt DESC").all() as any[];
    return chats.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    }));
  },

  getById: (id: number): AIChat | undefined => {
    const chat = db.prepare("SELECT * FROM ai_chats WHERE id = ?").get(id) as any;
    if (!chat) return undefined;
    return {
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
    };
  },

  create: (title: string = "Neuer Chat", context?: string): AIChat => {
    const stmt = db.prepare(`
      INSERT INTO ai_chats (title, context)
      VALUES (?, ?)
    `);
    const result = stmt.run(title, context || null);
    return aiChatQueries.getById(Number(result.lastInsertRowid))!;
  },

  updateTitle: (id: number, title: string) => {
    const stmt = db.prepare(`
      UPDATE ai_chats SET title = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `);
    return stmt.run(title, id);
  },

  updateTimestamp: (id: number) => {
    const stmt = db.prepare(`
      UPDATE ai_chats SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `);
    return stmt.run(id);
  },

  delete: (id: number) => {
    const stmt = db.prepare("DELETE FROM ai_chats WHERE id = ?");
    return stmt.run(id);
  },

  deleteAll: () => {
    const stmt = db.prepare("DELETE FROM ai_chats");
    return stmt.run();
  },
};

export const aiMessageQueries = {
  getByChatId: (chatId: number): AIMessage[] => {
    const messages = db.prepare(
      "SELECT * FROM ai_messages WHERE chatId = ? ORDER BY createdAt ASC"
    ).all(chatId) as any[];
    return messages.map((m) => ({
      ...m,
      createdAt: new Date(m.createdAt),
    }));
  },

  create: (chatId: number, role: 'user' | 'assistant' | 'system', content: string, metadata?: string): AIMessage => {
    const stmt = db.prepare(`
      INSERT INTO ai_messages (chatId, role, content, metadata)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(chatId, role, content, metadata || null);
    
    // Update chat timestamp
    aiChatQueries.updateTimestamp(chatId);
    
    const message = db.prepare("SELECT * FROM ai_messages WHERE id = ?").get(Number(result.lastInsertRowid)) as any;
    return {
      ...message,
      createdAt: new Date(message.createdAt),
    };
  },

  delete: (id: number) => {
    const stmt = db.prepare("DELETE FROM ai_messages WHERE id = ?");
    return stmt.run(id);
  },

  deleteByChatId: (chatId: number) => {
    const stmt = db.prepare("DELETE FROM ai_messages WHERE chatId = ?");
    return stmt.run(chatId);
  },
};
