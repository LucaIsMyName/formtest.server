import { ipcMain, dialog } from "electron";
import { writeFileSync, readFileSync } from "fs";
import { randomUUID } from "crypto";
import { formQueries, paymentMethodQueries, settingsQueries, testRunQueries, exportQueries, importQueries, testScheduleQueries, notificationQueries, selectorOverrideQueries, getMergedSelectorConfig, getBaseSelectorConfig, passwordQueries, customScriptQueries, formScriptQueries, cleanupOldTestRuns, aiChatQueries, aiMessageQueries, tagQueries, filterPresetQueries } from "./database";
import type { Form, PaymentMethod, TestRun, ImportOptions, ExportData, TestSchedule, GlobalFieldDefaults, CustomScript, ScriptHookPoint, AIProvider } from "../common/types";
import { getTestQueue } from "./testQueue";
import { scheduler } from "./schedulerService";
import { getConfigurableCategories } from "../common/selectors.config";
import { emailService } from "./emailService";
import { startApiServer, stopApiServer, isApiServerRunning, generateApiKey, getStoredApiKey } from "./apiServer";
import { aiService, ChatMessage } from "./ai";
import { sanitizeError } from "./utils/errorSanitizer";
import { getMainWindow } from "./index";

/**
 * Helper to sanitize and throw errors in IPC handlers
 */
function handleError(error: unknown, context: string): never {
  console.error(`IPC Error - ${context}:`, error);
  const sanitized = sanitizeError(error);
  throw new Error(sanitized.message);
}

export function setupIpcHandlers(): void {
  // Form handlers with error handling
  ipcMain.handle("forms:getAll", async () => {
    try {
      return formQueries.getAll();
    } catch (error) {
      handleError(error, "forms:getAll");
    }
  });

  ipcMain.handle("forms:getById", async (_, id: number) => {
    try {
      return formQueries.getById(id);
    } catch (error) {
      handleError(error, "forms:getById");
    }
  });

  ipcMain.handle("forms:create", async (_, form: Omit<Form, "id" | "createdAt" | "updatedAt">) => {
    try {
      return formQueries.create(form);
    } catch (error) {
      handleError(error, "forms:create");
    }
  });

  ipcMain.handle("forms:update", async (_, id: number, form: Partial<Form>) => {
    try {
      return formQueries.update(id, form);
    } catch (error) {
      handleError(error, "forms:update");
    }
  });

  ipcMain.handle("forms:delete", async (_, id: number) => {
    try {
      return formQueries.delete(id);
    } catch (error) {
      handleError(error, "forms:delete");
    }
  });

  ipcMain.handle("forms:deleteAll", async () => {
    try {
      return formQueries.deleteAll();
    } catch (error) {
      handleError(error, "forms:deleteAll");
    }
  });

  // Payment method handlers with error handling
  ipcMain.handle("paymentMethods:getAll", async () => {
    try {
      return await paymentMethodQueries.getAll();
    } catch (error) {
      console.error("IPC Error - paymentMethods:getAll:", error);
      throw error;
    }
  });

  ipcMain.handle("paymentMethods:getById", async (_, id: number) => {
    try {
      return await paymentMethodQueries.getById(id);
    } catch (error) {
      console.error("IPC Error - paymentMethods:getById:", error);
      throw error;
    }
  });

  ipcMain.handle("paymentMethods:create", async (_, method: Omit<PaymentMethod, "id" | "createdAt" | "updatedAt">) => {
    try {
      return await paymentMethodQueries.create(method);
    } catch (error) {
      console.error("IPC Error - paymentMethods:create:", error);
      throw error;
    }
  });

  ipcMain.handle("paymentMethods:update", async (_, id: number, method: Partial<PaymentMethod>) => {
    try {
      return await paymentMethodQueries.update(id, method);
    } catch (error) {
      console.error("IPC Error - paymentMethods:update:", error);
      throw error;
    }
  });

  ipcMain.handle("paymentMethods:delete", async (_, id: number) => {
    try {
      return paymentMethodQueries.delete(id);
    } catch (error) {
      console.error("IPC Error - paymentMethods:delete:", error);
      throw error;
    }
  });

  ipcMain.handle("paymentMethods:deleteAll", async () => {
    try {
      return paymentMethodQueries.deleteAll();
    } catch (error) {
      console.error("IPC Error - paymentMethods:deleteAll:", error);
      throw error;
    }
  });

  // Settings handlers
  ipcMain.handle("settings:getAll", () => settingsQueries.getAll());
  ipcMain.handle("settings:get", (_, key: string) => settingsQueries.get(key));
  ipcMain.handle("settings:set", (_, key: string, value: string, description?: string) => settingsQueries.set(key, value, description));
  
  // Global field defaults handlers
  ipcMain.handle("settings:getFieldDefaults", () => settingsQueries.getFieldDefaults());
  ipcMain.handle("settings:setFieldDefaults", (_, defaults: GlobalFieldDefaults) => settingsQueries.setFieldDefaults(defaults));

  // Test run handlers
  ipcMain.handle("testRuns:getAll", (_, includeArchived?: boolean) => testRunQueries.getAll(includeArchived));
  ipcMain.handle("testRuns:getById", (_, id: number) => testRunQueries.getById(id));
  ipcMain.handle("testRuns:getByForm", (_, formId: number) => testRunQueries.getByForm(formId));
  ipcMain.handle("testRuns:create", (_, testRun: Omit<TestRun, "id" | "runAt">) => testRunQueries.create({ ...testRun, uuid: testRun.uuid || randomUUID() }));
  ipcMain.handle("testRuns:updateStatus", (_, id: number, status: TestRun["status"], errorMessage?: string, durationMs?: number) => testRunQueries.updateStatus(id, status, errorMessage, durationMs));
  ipcMain.handle("testRuns:delete", (_, id: number) => testRunQueries.delete(id));
  ipcMain.handle("testRuns:deleteAll", () => testRunQueries.deleteAll());
  ipcMain.handle("testRuns:updateNotes", (_, id: number, notes: string) => testRunQueries.updateNotes(id, notes));
  ipcMain.handle("testRuns:archive", (_, id: number) => testRunQueries.archive(id));
  ipcMain.handle("testRuns:unarchive", (_, id: number) => testRunQueries.unarchive(id));
  ipcMain.handle("testRuns:archiveBulk", (_, ids: number[]) => testRunQueries.archiveBulk(ids));
  ipcMain.handle("testRuns:unarchiveBulk", (_, ids: number[]) => testRunQueries.unarchiveBulk(ids));
  ipcMain.handle("testRuns:updateTags", (_, id: number, tags: string[]) => testRunQueries.updateTags(id, tags));
  
  // Tag handlers
  ipcMain.handle("tags:getAll", () => tagQueries.getAll());
  ipcMain.handle("tags:getById", (_, id: number) => tagQueries.getById(id));
  ipcMain.handle("tags:create", (_, name: string, color?: string) => tagQueries.create(name, color));
  ipcMain.handle("tags:update", (_, id: number, name: string, color: string) => tagQueries.update(id, name, color));
  ipcMain.handle("tags:delete", (_, id: number) => tagQueries.delete(id));
  
  // Filter preset handlers
  ipcMain.handle("filterPresets:getAll", () => filterPresetQueries.getAll());
  ipcMain.handle("filterPresets:getById", (_, id: number) => filterPresetQueries.getById(id));
  ipcMain.handle("filterPresets:create", (_, name: string, filterConfig: any) => filterPresetQueries.create(name, filterConfig));
  ipcMain.handle("filterPresets:update", (_, id: number, name: string, filterConfig: any) => filterPresetQueries.update(id, name, filterConfig));
  ipcMain.handle("filterPresets:delete", (_, id: number) => filterPresetQueries.delete(id));
  ipcMain.handle("testRuns:stop", (_, id: number) => {
    // Remove from queue if it's a queued test
    const testQueue = getTestQueue();
    testQueue.removeFromQueue(id);
    // Update database status
    return testRunQueries.stop(id);
  });

  // Test run cleanup handler
  ipcMain.handle("testRuns:cleanup", () => {
    const deleted = cleanupOldTestRuns();
    return { success: true, deleted };
  });

  // Interrupted tests handlers
  ipcMain.handle("testRuns:getInterrupted", () => {
    try {
      return testRunQueries.getInterruptedTestsWithDetails();
    } catch (error) {
      console.error("IPC Error - testRuns:getInterrupted:", error);
      throw error;
    }
  });

  ipcMain.handle("testRuns:retryInterrupted", async (_, testIds: number[]) => {
    try {
      if (!testIds || testIds.length === 0) {
        return { success: false, message: "No test IDs provided" };
      }

      const testQueue = getTestQueue();
      const settings = settingsQueries.getAll();
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      let retriedCount = 0;
      const errors: string[] = [];

      for (const testId of testIds) {
        try {
          // Get the interrupted test
          const testRun = testRunQueries.getById(testId);
          if (!testRun) {
            errors.push(`Test ${testId} not found`);
            continue;
          }

          // Verify form and payment method still exist
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

          // Fetch custom scripts for this form
          const customScripts = customScriptQueries.getScriptsForTest(form.id);
          const settingsWithScripts = { ...settingsMap, customScripts };

          // Create new test run with QUEUED status
          const newTestRun = testRunQueries.create({
            uuid: randomUUID(),
            formId: form.id,
            paymentMethodId: paymentMethod.id,
            status: "QUEUED",
            logDetails: JSON.stringify([`Retried test for ${form.name} with ${paymentMethod.name}`]),
            errorMessage: undefined,
            durationMs: undefined,
            isScheduled: testRun.isScheduled || false,
            amount: testRun.amount || settingsMap['default_donation_amount'] || '5',
            interval: testRun.interval || settingsMap['default_donation_interval'] || settingsMap['default_interval'] || '0',
          });

          const newTestRunId = newTestRun.lastInsertRowid as number;

          // Add to queue
          testQueue.enqueue(newTestRunId, form, paymentMethod, settingsWithScripts);

          // Delete old interrupted test run
          testRunQueries.delete(testId);
          retriedCount++;
        } catch (error) {
          errors.push(`Test ${testId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      return {
        success: retriedCount > 0,
        message: retriedCount > 0 
          ? `Retried ${retriedCount} test${retriedCount > 1 ? 's' : ''}${errors.length > 0 ? `, ${errors.length} failed` : ''}`
          : `Failed to retry tests: ${errors.join(', ')}`,
        retried: retriedCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error("IPC Error - testRuns:retryInterrupted:", error);
      throw error;
    }
  });

  ipcMain.handle("testRuns:dismissInterrupted", (_, testIds: number[]) => {
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

  // Toast notification handlers
  ipcMain.handle("toast:show", (event, type: 'success' | 'error' | 'info' | 'warning', message: string, description?: string) => {
    // Send toast notification to renderer
    event.sender.send('toast:display', { type, message, description });
  });

  // Test execution handlers
  ipcMain.handle("tests:run", async (_, formIds: number[], paymentMethodIds: number[], options?: { customAmount?: string; customInterval?: string; enableSeoTest?: boolean; enableAccessibilityTest?: boolean }) => {
    try {
      console.log("Starting test execution for forms:", formIds, "with payment methods:", paymentMethodIds, "options:", options);

      const testRunIds: number[] = [];

      // Get forms and payment methods from database
      const forms = formIds.map((id) => formQueries.getById(id)).filter((form): form is Form => form !== undefined);
      
      // Payment methods are now async due to encryption
      const paymentMethodPromises = paymentMethodIds.map((id) => paymentMethodQueries.getById(id));
      const paymentMethodsResolved = await Promise.all(paymentMethodPromises);
      const paymentMethods = paymentMethodsResolved.filter((pm): pm is PaymentMethod => pm !== undefined);

      console.log(`Found ${forms.length} forms and ${paymentMethods.length} payment methods`);

      // Get settings for test configuration
      const settings = settingsQueries.getAll();
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      // Override settings with custom options if provided
      if (options?.customAmount) {
        settingsMap['default_donation_amount'] = options.customAmount;
      }
      if (options?.customInterval) {
        settingsMap['default_donation_interval'] = options.customInterval;
      }

      // Create test runs for each combination
      for (const form of forms) {
        // Fetch custom scripts for this form (global + form-specific)
        const customScripts = customScriptQueries.getScriptsForTest(form.id);
        
        for (const paymentMethod of paymentMethods) {
          console.log(`Creating test run for form "${form.name}" with payment method "${paymentMethod.name}"`);

          const testRun = testRunQueries.create({
            uuid: randomUUID(),
            formId: form.id,
            paymentMethodId: paymentMethod.id,
            status: "QUEUED",
            logDetails: JSON.stringify([`Test queued for ${form.name} with ${paymentMethod.name}`]),
            errorMessage: undefined,
            durationMs: undefined,
            isScheduled: false,
            amount: settingsMap['default_donation_amount'] || '5',
            interval: settingsMap['default_donation_interval'] || settingsMap['default_interval'] || '0',
          });

          testRunIds.push(testRun.lastInsertRowid as number);

          // Add test to the queue - tests will run sequentially to prevent log mixing
          // Include custom scripts in settings for the runner
          const testQueue = getTestQueue();
          const settingsWithScripts = { ...settingsMap, customScripts };
          
          // Build quality test options from request options
          const qualityTestOptions = {
            enableSeoTest: options?.enableSeoTest || false,
            enableAccessibilityTest: options?.enableAccessibilityTest || false,
          };
          
          testQueue.enqueue(testRun.lastInsertRowid as number, form, paymentMethod, settingsWithScripts, qualityTestOptions);
        }
      }

      return {
        success: true,
        message: `Started ${testRunIds.length} test runs`,
        testRunIds,
      };
    } catch (error) {
      console.error("Test execution error:", error);
      throw error;
    }
  });

  // Test queue status handlers
  ipcMain.handle("testQueue:getStatus", () => {
    const testQueue = getTestQueue();
    return testQueue.getStatus();
  });

  ipcMain.handle("testQueue:clear", () => {
    const testQueue = getTestQueue();
    testQueue.clear();
    return { success: true };
  });

  ipcMain.handle("testQueue:stopAll", async () => {
    const testQueue = getTestQueue();
    const result = await testQueue.stopAll();
    return { success: true, ...result };
  });

  ipcMain.handle("testQueue:triggerProcessing", async () => {
    const testQueue = getTestQueue();
    await testQueue.triggerProcessing();
    return { success: true };
  });

  // Export/Import handlers
  ipcMain.handle("database:export", async (_event, options: ImportOptions) => {
    try {
      console.log("IPC: Exporting database with options:", options);
      
      // Get export data
      const exportData = await exportQueries.exportAll(options);
      
      // Show save dialog
      const { filePath, canceled } = await dialog.showSaveDialog({
        title: "Datenbank exportieren",
        defaultPath: `formtest-export-${new Date().toISOString().split('T')[0]}.json`,
        filters: [
          { name: "JSON Files", extensions: ["json"] },
          { name: "All Files", extensions: ["*"] }
        ]
      });
      
      if (canceled || !filePath) {
        return { success: false, message: "Export cancelled" };
      }
      
      // Write to file
      writeFileSync(filePath, JSON.stringify(exportData, null, 2), "utf-8");
      
      console.log(`IPC: Successfully exported to ${filePath}`);
      return { 
        success: true, 
        message: `Daten erfolgreich exportiert nach ${filePath}`,
        filePath 
      };
    } catch (error: any) {
      console.error("IPC Error - database:export:", error);
      return { 
        success: false, 
        message: `Export fehlgeschlagen: ${error.message}` 
      };
    }
  });

  ipcMain.handle("database:import", async (_event, mode: "overwrite" | "merge", options: ImportOptions) => {
    try {
      console.log("IPC: Importing database with mode:", mode, "options:", options);
      
      // Show open dialog
      const { filePaths, canceled } = await dialog.showOpenDialog({
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
      
      // Read and parse file
      const fileContent = readFileSync(filePath, "utf-8");
      const importData: ExportData = JSON.parse(fileContent);
      
      // Validate data structure
      if (!importData.version || !importData.data) {
        return {
          success: false,
          imported: { forms: 0, paymentMethods: 0, testRuns: 0, settings: 0 },
          skipped: { forms: 0, paymentMethods: 0, testRuns: 0, settings: 0 },
          errors: ["Ungültiges Dateiformat"],
          warnings: []
        };
      }
      
      // Import based on mode
      let result;
      if (mode === "overwrite") {
        result = await importQueries.importOverwrite(importData, options);
      } else {
        result = await importQueries.importMerge(importData, options);
      }
      
      console.log("IPC: Import completed:", result);
      return result;
    } catch (error: any) {
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

  // Test schedule handlers
  ipcMain.handle("testSchedules:getAll", () => testScheduleQueries.getAll());
  
  ipcMain.handle("testSchedules:getById", (_, id: number) => testScheduleQueries.getById(id));
  
  ipcMain.handle("testSchedules:runNow", async (_, id: number) => {
    try {
      return await scheduler.runJobNow(id);
    } catch (error) {
      console.error("IPC Error - testSchedules:runNow:", error);
      throw error;
    }
  });

  ipcMain.handle("testSchedules:create", (_, schedule: { name: string; formId: number; paymentMethodId: number; cronExpression: string; isActive: boolean }) => {
    const result = testScheduleQueries.create(schedule);
    const id = result.lastInsertRowid as number;
    // Start the job immediately if active
    scheduler.reloadJob(id);
    return result;
  });
  
  ipcMain.handle("testSchedules:update", (_, id: number, schedule: Partial<TestSchedule>) => {
    const result = testScheduleQueries.update(id, schedule);
    // Reload the job configuration
    scheduler.reloadJob(id);
    return result;
  });
  
  ipcMain.handle("testSchedules:delete", (_, id: number) => {
    // Stop the job first
    scheduler.stopJob(id);
    return testScheduleQueries.delete(id);
  });

  ipcMain.handle("testSchedules:deleteAll", () => {
    // Stop all jobs first (using private access via reflection or just recreate scheduler?)
    // Better to just reload all after delete or stop all known ones if we can track them.
    // The scheduler service doesn't expose stopAll, but we can iterate over getAll() before deleting.
    
    const schedules = testScheduleQueries.getAll();
    for (const schedule of schedules) {
      scheduler.stopJob(schedule.id);
    }
    return testScheduleQueries.deleteAll();
  });

  // Notification handlers
  ipcMain.handle("notifications:getAll", () => {
    return notificationQueries.getAll();
  });

  ipcMain.handle("notifications:getUnread", () => {
    return notificationQueries.getUnread();
  });

  ipcMain.handle("notifications:getUnreadCount", () => {
    return notificationQueries.getUnreadCount();
  });

  ipcMain.handle("notifications:markAsRead", (_, id: number) => {
    return notificationQueries.markAsRead(id);
  });

  ipcMain.handle("notifications:markAllAsRead", () => {
    return notificationQueries.markAllAsRead();
  });

  ipcMain.handle("notifications:delete", (_, id: number) => {
    return notificationQueries.delete(id);
  });

  ipcMain.handle("notifications:deleteAll", () => {
    return notificationQueries.deleteAll();
  });

  // Selector Override handlers
  ipcMain.handle("selectorOverrides:getAll", () => {
    return selectorOverrideQueries.getAll();
  });

  ipcMain.handle("selectorOverrides:getByCategory", (_, category: string) => {
    return selectorOverrideQueries.getByCategory(category);
  });

  ipcMain.handle("selectorOverrides:getById", (_, id: number) => {
    return selectorOverrideQueries.getById(id);
  });

  ipcMain.handle("selectorOverrides:getActive", () => {
    return selectorOverrideQueries.getActive();
  });

  ipcMain.handle("selectorOverrides:create", (_, override: { category: string; key: string; selectors: string[]; isActive?: boolean }) => {
    return selectorOverrideQueries.create(override);
  });

  ipcMain.handle("selectorOverrides:update", (_, id: number, override: { selectors?: string[]; isActive?: boolean }) => {
    return selectorOverrideQueries.update(id, override);
  });

  ipcMain.handle("selectorOverrides:upsert", (_, override: { category: string; key: string; selectors: string[]; isActive?: boolean }) => {
    return selectorOverrideQueries.upsert(override);
  });

  ipcMain.handle("selectorOverrides:delete", (_, id: number) => {
    return selectorOverrideQueries.delete(id);
  });

  ipcMain.handle("selectorOverrides:deleteByKey", (_, category: string, key: string) => {
    return selectorOverrideQueries.deleteByKey(category, key);
  });

  ipcMain.handle("selectorOverrides:deleteAll", () => {
    return selectorOverrideQueries.deleteAll();
  });

  // Selector Config handlers
  ipcMain.handle("selectorConfig:getMerged", () => {
    return getMergedSelectorConfig();
  });

  ipcMain.handle("selectorConfig:getBase", () => {
    return getBaseSelectorConfig();
  });

  ipcMain.handle("selectorConfig:getCategories", () => {
    return getConfigurableCategories();
  });

  // Email handlers
  ipcMain.handle("email:testConnection", async () => {
    return await emailService.sendTestEmail();
  });

  ipcMain.handle("email:getConfig", () => {
    return emailService.loadConfig();
  });

  // API Server handlers
  ipcMain.handle("api:start", async (_, port: number, apiKey: string) => {
    try {
      await startApiServer(port, apiKey);
      return { success: true };
    } catch (error) {
      console.error("IPC Error - api:start:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  });

  ipcMain.handle("api:stop", async () => {
    try {
      await stopApiServer();
      return { success: true };
    } catch (error) {
      console.error("IPC Error - api:stop:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  });

  ipcMain.handle("api:status", () => {
    return { running: isApiServerRunning() };
  });

  ipcMain.handle("api:generateKey", () => {
    return generateApiKey();
  });

  // Master Password handlers
  ipcMain.handle("password:isEnabled", () => {
    return passwordQueries.isEnabled();
  });

  ipcMain.handle("password:isSessionUnlocked", () => {
    return passwordQueries.isSessionUnlocked();
  });

  ipcMain.handle("password:verify", (_, password: string) => {
    try {
      const isValid = passwordQueries.verify(password);
      return { success: isValid, error: isValid ? undefined : "Falsches Passwort" };
    } catch (error) {
      console.error("IPC Error - password:verify:", error);
      return { success: false, error: "Fehler bei der Passwort-Überprüfung" };
    }
  });

  ipcMain.handle("password:set", (_, password: string) => {
    try {
      passwordQueries.setPassword(password);
      return { success: true };
    } catch (error) {
      console.error("IPC Error - password:set:", error);
      const sanitized = sanitizeError(error);
      return { success: false, error: sanitized.message };
    }
  });

  ipcMain.handle("password:change", (_, currentPassword: string, newPassword: string) => {
    try {
      const success = passwordQueries.changePassword(currentPassword, newPassword);
      return { success, error: success ? undefined : "Aktuelles Passwort ist falsch" };
    } catch (error) {
      console.error("IPC Error - password:change:", error);
      const sanitized = sanitizeError(error);
      return { success: false, error: sanitized.message };
    }
  });

  ipcMain.handle("password:disable", (_, currentPassword: string) => {
    try {
      const success = passwordQueries.disable(currentPassword);
      return { success, error: success ? undefined : "Passwort ist falsch" };
    } catch (error) {
      console.error("IPC Error - password:disable:", error);
      const sanitized = sanitizeError(error);
      return { success: false, error: sanitized.message };
    }
  });

  ipcMain.handle("password:emergencyReset", () => {
    try {
      passwordQueries.emergencyReset();
      return { success: true };
    } catch (error) {
      console.error("IPC Error - password:emergencyReset:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  });

  // ============================================
  // Custom Scripts handlers
  // ============================================

  ipcMain.handle("customScripts:getAll", async () => {
    try {
      return customScriptQueries.getAll();
    } catch (error) {
      console.error("IPC Error - customScripts:getAll:", error);
      throw error;
    }
  });

  ipcMain.handle("customScripts:getById", async (_, id: number) => {
    try {
      return customScriptQueries.getById(id);
    } catch (error) {
      console.error("IPC Error - customScripts:getById:", error);
      throw error;
    }
  });

  ipcMain.handle("customScripts:getByHookPoint", async (_, hookPoint: ScriptHookPoint) => {
    try {
      return customScriptQueries.getByHookPoint(hookPoint);
    } catch (error) {
      console.error("IPC Error - customScripts:getByHookPoint:", error);
      throw error;
    }
  });

  ipcMain.handle("customScripts:getGlobal", async () => {
    try {
      return customScriptQueries.getGlobalScripts();
    } catch (error) {
      console.error("IPC Error - customScripts:getGlobal:", error);
      throw error;
    }
  });

  ipcMain.handle("customScripts:getByFormId", async (_, formId: number) => {
    try {
      return customScriptQueries.getByFormId(formId);
    } catch (error) {
      console.error("IPC Error - customScripts:getByFormId:", error);
      throw error;
    }
  });

  ipcMain.handle("customScripts:getForTest", async (_, formId: number) => {
    try {
      return customScriptQueries.getScriptsForTest(formId);
    } catch (error) {
      console.error("IPC Error - customScripts:getForTest:", error);
      throw error;
    }
  });

  ipcMain.handle("customScripts:create", async (_, script: Omit<CustomScript, "id" | "createdAt" | "updatedAt">) => {
    try {
      return customScriptQueries.create(script);
    } catch (error) {
      console.error("IPC Error - customScripts:create:", error);
      throw error;
    }
  });

  ipcMain.handle("customScripts:update", async (_, id: number, script: Partial<CustomScript>) => {
    try {
      return customScriptQueries.update(id, script);
    } catch (error) {
      console.error("IPC Error - customScripts:update:", error);
      throw error;
    }
  });

  ipcMain.handle("customScripts:delete", async (_, id: number) => {
    try {
      return customScriptQueries.delete(id);
    } catch (error) {
      console.error("IPC Error - customScripts:delete:", error);
      throw error;
    }
  });

  ipcMain.handle("customScripts:deleteAll", async () => {
    try {
      return customScriptQueries.deleteAll();
    } catch (error) {
      console.error("IPC Error - customScripts:deleteAll:", error);
      throw error;
    }
  });

  // Validate script code (basic syntax check)
  ipcMain.handle("customScripts:validate", async (_, code: string) => {
    try {
      // Try to parse the code as a function body
      new Function('ctx', `with(ctx) { ${code} }`);
      return { valid: true, errors: [], warnings: [] };
    } catch (error) {
      return { 
        valid: false, 
        errors: [error instanceof Error ? error.message : "Syntax error"], 
        warnings: [] 
      };
    }
  });

  // ============================================
  // Form-Script junction handlers
  // ============================================

  ipcMain.handle("formScripts:getByFormId", async (_, formId: number) => {
    try {
      return formScriptQueries.getByFormId(formId);
    } catch (error) {
      console.error("IPC Error - formScripts:getByFormId:", error);
      throw error;
    }
  });

  ipcMain.handle("formScripts:attach", async (_, formId: number, scriptId: number, executionOrder?: number) => {
    try {
      return formScriptQueries.attach(formId, scriptId, executionOrder || 0);
    } catch (error) {
      console.error("IPC Error - formScripts:attach:", error);
      throw error;
    }
  });

  ipcMain.handle("formScripts:detach", async (_, formId: number, scriptId: number) => {
    try {
      return formScriptQueries.detach(formId, scriptId);
    } catch (error) {
      console.error("IPC Error - formScripts:detach:", error);
      throw error;
    }
  });

  ipcMain.handle("formScripts:updateOrder", async (_, formId: number, scriptId: number, executionOrder: number) => {
    try {
      return formScriptQueries.updateOrder(formId, scriptId, executionOrder);
    } catch (error) {
      console.error("IPC Error - formScripts:updateOrder:", error);
      throw error;
    }
  });

  // ============================================
  // AI Settings handlers
  // ============================================

  ipcMain.handle("ai:getSettings", async () => {
    try {
      return await aiService.loadSettings();
    } catch (error) {
      console.error("IPC Error - ai:getSettings:", error);
      throw error;
    }
  });

  ipcMain.handle("ai:updateSettings", async (_, settings: Partial<{ enabled: boolean; provider: AIProvider; apiKey: string; model: string; ollamaBaseUrl: string }>) => {
    try {
      return await aiService.updateSettings(settings);
    } catch (error) {
      console.error("IPC Error - ai:updateSettings:", error);
      throw error;
    }
  });

  ipcMain.handle("ai:validateKey", async (_, provider: AIProvider, apiKey: string, ollamaUrl?: string) => {
    try {
      return await aiService.validateKey(provider, apiKey, ollamaUrl);
    } catch (error) {
      console.error("IPC Error - ai:validateKey:", error);
      return false;
    }
  });

  ipcMain.handle("ai:getModels", async (_, provider: AIProvider, apiKey?: string, ollamaUrl?: string) => {
    try {
      return await aiService.getModels(provider, apiKey, ollamaUrl);
    } catch (error) {
      console.error("IPC Error - ai:getModels:", error);
      return [];
    }
  });

  ipcMain.handle("ai:isConfigured", async () => {
    try {
      await aiService.loadSettings();
      return aiService.isConfigured();
    } catch (error) {
      console.error("IPC Error - ai:isConfigured:", error);
      return false;
    }
  });

  // ============================================
  // AI Chat handlers
  // ============================================

  ipcMain.handle("ai:chats:getAll", async () => {
    try {
      return aiChatQueries.getAll();
    } catch (error) {
      console.error("IPC Error - ai:chats:getAll:", error);
      throw error;
    }
  });

  ipcMain.handle("ai:chats:getById", async (_, id: number) => {
    try {
      return aiChatQueries.getById(id);
    } catch (error) {
      console.error("IPC Error - ai:chats:getById:", error);
      throw error;
    }
  });

  ipcMain.handle("ai:chats:create", async (_, title?: string, context?: string) => {
    try {
      return aiChatQueries.create(title, context);
    } catch (error) {
      console.error("IPC Error - ai:chats:create:", error);
      throw error;
    }
  });

  ipcMain.handle("ai:chats:updateTitle", async (_, id: number, title: string) => {
    try {
      return aiChatQueries.updateTitle(id, title);
    } catch (error) {
      console.error("IPC Error - ai:chats:updateTitle:", error);
      throw error;
    }
  });

  ipcMain.handle("ai:chats:delete", async (_, id: number) => {
    try {
      return aiChatQueries.delete(id);
    } catch (error) {
      console.error("IPC Error - ai:chats:delete:", error);
      throw error;
    }
  });

  ipcMain.handle("ai:chats:deleteAll", async () => {
    try {
      return aiChatQueries.deleteAll();
    } catch (error) {
      console.error("IPC Error - ai:chats:deleteAll:", error);
      throw error;
    }
  });

  // ============================================
  // AI Message handlers
  // ============================================

  ipcMain.handle("ai:messages:getByChatId", async (_, chatId: number) => {
    try {
      return aiMessageQueries.getByChatId(chatId);
    } catch (error) {
      console.error("IPC Error - ai:messages:getByChatId:", error);
      throw error;
    }
  });

  ipcMain.handle("ai:messages:send", async (_, chatId: number, content: string) => {
    try {
      // Save user message
      const userMessage = aiMessageQueries.create(chatId, 'user', content);
      
      // Get all messages for context
      const allMessages = aiMessageQueries.getByChatId(chatId);
      const chatMessages: ChatMessage[] = allMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));
      
      // Get AI response
      const response = await aiService.chat(chatMessages);
      
      // Save assistant message with usage metadata
      let metadata = null;
      if (response.usage) {
        metadata = JSON.stringify({ usage: response.usage });
      }
      const assistantMessage = aiMessageQueries.create(chatId, 'assistant', response.content, metadata);
      
      return {
        userMessage,
        assistantMessage,
        usage: response.usage,
      };
    } catch (error) {
      console.error("IPC Error - ai:messages:send:", error);
      throw error;
    }
  });

  ipcMain.handle("ai:messages:sendStream", async (event, chatId: number, content: string) => {
    try {
      // Save user message
      const userMessage = aiMessageQueries.create(chatId, 'user', content);
      const mainWindow = getMainWindow();
      
      if (!mainWindow) {
        throw new Error("Main window not available");
      }

      // Get all messages for context
      const allMessages = aiMessageQueries.getByChatId(chatId);
      const chatMessages: ChatMessage[] = allMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));
      
      let fullContent = '';

      // Stream AI response
      await aiService.streamChat(chatMessages, {
        onToken: (token: string) => {
          fullContent += token;
          mainWindow.webContents.send('ai:stream:token', { chatId, token });
        },
        onComplete: async (content: string) => {
          fullContent = content;
          // Save assistant message (usage not available in streaming, will be estimated if needed)
          const assistantMessage = aiMessageQueries.create(chatId, 'assistant', fullContent);
          mainWindow.webContents.send('ai:stream:complete', { 
            chatId, 
            assistantMessage
          });
        },
        onError: (error: Error) => {
          console.error("Stream error:", error);
          mainWindow.webContents.send('ai:stream:error', { 
            chatId, 
            error: error.message 
          });
        }
      });

      return { userMessage };
    } catch (error) {
      console.error("IPC Error - ai:messages:sendStream:", error);
      const mainWindow = getMainWindow();
      if (mainWindow) {
        mainWindow.webContents.send('ai:stream:error', { 
          chatId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
      throw error;
    }
  });

  ipcMain.handle("ai:context:getData", async () => {
    try {
      return await aiService.buildContextData();
    } catch (error) {
      console.error("IPC Error - ai:context:getData:", error);
      throw error;
    }
  });
}
