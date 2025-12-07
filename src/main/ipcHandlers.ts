import { ipcMain, dialog } from "electron";
import { writeFileSync, readFileSync } from "fs";
import { randomUUID } from "crypto";
import { formQueries, paymentMethodQueries, settingsQueries, testRunQueries, exportQueries, importQueries, testScheduleQueries, notificationQueries, selectorOverrideQueries, getMergedSelectorConfig, getBaseSelectorConfig, passwordQueries } from "./database";
import type { Form, PaymentMethod, TestRun, ImportOptions, ExportData, TestSchedule, GlobalFieldDefaults } from "../common/types";
import { getTestQueue } from "./testQueue";
import { scheduler } from "./schedulerService";
import { getConfigurableCategories } from "../common/selectors.config";
import { emailService } from "./emailService";
import { startApiServer, stopApiServer, isApiServerRunning, generateApiKey } from "./apiServer";

export function setupIpcHandlers(): void {
  // Form handlers with error handling
  ipcMain.handle("forms:getAll", async () => {
    try {
      return formQueries.getAll();
    } catch (error) {
      console.error("IPC Error - forms:getAll:", error);
      throw error;
    }
  });

  ipcMain.handle("forms:getById", async (_, id: number) => {
    try {
      return formQueries.getById(id);
    } catch (error) {
      console.error("IPC Error - forms:getById:", error);
      throw error;
    }
  });

  ipcMain.handle("forms:create", async (_, form: Omit<Form, "id" | "createdAt" | "updatedAt">) => {
    try {
      return formQueries.create(form);
    } catch (error) {
      console.error("IPC Error - forms:create:", error);
      throw error;
    }
  });

  ipcMain.handle("forms:update", async (_, id: number, form: Partial<Form>) => {
    try {
      return formQueries.update(id, form);
    } catch (error) {
      console.error("IPC Error - forms:update:", error);
      throw error;
    }
  });

  ipcMain.handle("forms:delete", async (_, id: number) => {
    try {
      return formQueries.delete(id);
    } catch (error) {
      console.error("IPC Error - forms:delete:", error);
      throw error;
    }
  });

  ipcMain.handle("forms:deleteAll", async () => {
    try {
      return formQueries.deleteAll();
    } catch (error) {
      console.error("IPC Error - forms:deleteAll:", error);
      throw error;
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
  ipcMain.handle("testRuns:getAll", () => testRunQueries.getAll());
  ipcMain.handle("testRuns:getById", (_, id: number) => testRunQueries.getById(id));
  ipcMain.handle("testRuns:getByForm", (_, formId: number) => testRunQueries.getByForm(formId));
  ipcMain.handle("testRuns:create", (_, testRun: Omit<TestRun, "id" | "runAt">) => testRunQueries.create({ ...testRun, uuid: testRun.uuid || randomUUID() }));
  ipcMain.handle("testRuns:updateStatus", (_, id: number, status: TestRun["status"], errorMessage?: string, durationMs?: number) => testRunQueries.updateStatus(id, status, errorMessage, durationMs));
  ipcMain.handle("testRuns:delete", (_, id: number) => testRunQueries.delete(id));
  ipcMain.handle("testRuns:deleteAll", () => testRunQueries.deleteAll());
  ipcMain.handle("testRuns:updateNotes", (_, id: number, notes: string) => testRunQueries.updateNotes(id, notes));
  ipcMain.handle("testRuns:stop", (_, id: number) => {
    // Remove from queue if it's a queued test
    const testQueue = getTestQueue();
    testQueue.removeFromQueue(id);
    // Update database status
    return testRunQueries.stop(id);
  });

  // Toast notification handlers
  ipcMain.handle("toast:show", (event, type: 'success' | 'error' | 'info' | 'warning', message: string, description?: string) => {
    // Send toast notification to renderer
    event.sender.send('toast:display', { type, message, description });
  });

  // Test execution handlers
  ipcMain.handle("tests:run", async (_, formIds: number[], paymentMethodIds: number[], options?: { customAmount?: string; customInterval?: string }) => {
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
        for (const paymentMethod of paymentMethods) {
          console.log(`Creating test run for form "${form.name}" with payment method "${paymentMethod.name}"`);

          const testRun = testRunQueries.create({
            uuid: randomUUID(),
            formId: form.id,
            paymentMethodId: paymentMethod.id,
            status: "QUEUED",
            logDetails: JSON.stringify([`Test queued for ${form.name} with ${paymentMethod.name}`]),
            screenshotPath: undefined,
            errorMessage: undefined,
            durationMs: undefined,
            isScheduled: false,
          });

          testRunIds.push(testRun.lastInsertRowid as number);

          // Add test to the queue - tests will run sequentially to prevent log mixing
          const testQueue = getTestQueue();
          testQueue.enqueue(testRun.lastInsertRowid as number, form, paymentMethod, settingsMap);
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
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  });

  ipcMain.handle("password:change", (_, currentPassword: string, newPassword: string) => {
    try {
      const success = passwordQueries.changePassword(currentPassword, newPassword);
      return { success, error: success ? undefined : "Aktuelles Passwort ist falsch" };
    } catch (error) {
      console.error("IPC Error - password:change:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  });

  ipcMain.handle("password:disable", (_, currentPassword: string) => {
    try {
      const success = passwordQueries.disable(currentPassword);
      return { success, error: success ? undefined : "Passwort ist falsch" };
    } catch (error) {
      console.error("IPC Error - password:disable:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
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
}
