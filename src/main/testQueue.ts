/**
 * Test Queue System
 * 
 * Ensures tests run sequentially (one at a time) to prevent:
 * 1. Log/step mixing between concurrent tests
 * 2. Browser context conflicts
 * 3. Race conditions in the singleton TestRunner
 */

import { runSingleTest } from "./testExecutor";
import { testRunQueries } from "./database";
import { getTestProcessManager } from "./testRunner/processManager";
import type { Form, PaymentMethod, CustomScript, QualityTestOptions } from "../common/types";

// Extended settings type that includes custom scripts
export interface TestSettings extends Record<string, any> {
  customScripts?: CustomScript[];
}

interface QueuedTest {
  testRunId: number;
  form: Form;
  paymentMethod: PaymentMethod;
  settings: TestSettings;
  qualityTestOptions?: QualityTestOptions;
  addedAt: number;
}

class TestQueue {
  private queue: QueuedTest[] = [];
  private isProcessing = false;
  private currentTest: QueuedTest | null = null;

  /**
   * Reset queue state without marking tests as STOPPED
   * Used when app closes - keeps tests in RUNNING/QUEUED state for recovery dialog
   */
  resetState(): void {
    this.queue = [];
    this.currentTest = null;
    this.isProcessing = false;
    console.log("[TestQueue] State reset (tests remain in RUNNING/QUEUED state in database)");
  }

  /**
   * Add a test to the queue
   */
  enqueue(testRunId: number, form: Form, paymentMethod: PaymentMethod, settings: TestSettings, qualityTestOptions?: QualityTestOptions): void {
    const queuedTest: QueuedTest = {
      testRunId,
      form,
      paymentMethod,
      settings,
      qualityTestOptions,
      addedAt: Date.now()
    };

    this.queue.push(queuedTest);
    console.log(`[TestQueue] Added test ${testRunId} to queue. Queue length: ${this.queue.length}`);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processNext();
    }
  }

  /**
   * Process the next test in the queue
   */
  private async processNext(): Promise<void> {
    if (this.isProcessing) {
      console.log("[TestQueue] Already processing a test, waiting...");
      return;
    }

    if (this.queue.length === 0) {
      console.log("[TestQueue] Queue is empty, nothing to process");
      return;
    }

    this.isProcessing = true;
    this.currentTest = this.queue.shift()!;

    const { testRunId, form, paymentMethod, settings, qualityTestOptions } = this.currentTest;
    const waitTime = Date.now() - this.currentTest.addedAt;

    console.log(`[TestQueue] Starting test ${testRunId} (waited ${waitTime}ms in queue). Remaining in queue: ${this.queue.length}`);

    try {
      // Verify test is still QUEUED in database before starting
      const dbTest = testRunQueries.getById(testRunId);
      if (!dbTest || dbTest.status !== 'QUEUED') {
        console.log(`[TestQueue] Test ${testRunId} is no longer QUEUED in database (status: ${dbTest?.status || 'missing'}), skipping`);
        this.currentTest = null;
        this.isProcessing = false;
        // Continue processing next test
        if (this.queue.length > 0) {
          this.processNext();
        }
        return;
      }

      // Update status from QUEUED to RUNNING when test actually starts
      testRunQueries.updateStatus(testRunId, "RUNNING");
      
      // Run the test - this is synchronous from the queue's perspective
      await runSingleTest(testRunId, form, paymentMethod, settings, qualityTestOptions);
      console.log(`[TestQueue] Test ${testRunId} completed`);
    } catch (error) {
      console.error(`[TestQueue] Test ${testRunId} failed with error:`, error);
      // Ensure test is marked as FAILURE if it failed
      const dbTest = testRunQueries.getById(testRunId);
      if (dbTest && dbTest.status === 'RUNNING') {
        testRunQueries.updateStatus(testRunId, "FAILURE", error instanceof Error ? error.message : String(error));
      }
    } finally {
      this.currentTest = null;
      this.isProcessing = false;

      // Small delay between tests to ensure clean state
      await new Promise(resolve => setTimeout(resolve, 500));

      // ALWAYS process next test if any - ensures queue never gets stuck
      if (this.queue.length > 0) {
        this.processNext();
      } else {
        // Check database for any QUEUED tests that might not be in memory queue
        this.recoverStuckTests();
      }
    }
  }

  /**
   * Recover tests that are QUEUED in database but not in memory queue
   * This can happen if the app restarts or queue gets out of sync
   */
  private async recoverStuckTests(): Promise<void> {
    // Check if we're already processing
    if (this.isProcessing) {
      return;
    }

    // Get all QUEUED tests from database
    const allTests = testRunQueries.getAll();
    const queuedTests = allTests.filter(t => t.status === 'QUEUED');
    
    if (queuedTests.length === 0) {
      return;
    }

    console.log(`[TestQueue] Found ${queuedTests.length} QUEUED test(s) in database that are not in memory queue - recovering...`);

    // Get forms and payment methods for queued tests
    const { formQueries, paymentMethodQueries } = await import('./database');
    const { settingsQueries } = await import('./database');
    const { customScriptQueries } = await import('./database');
    
    for (const test of queuedTests) {
      // Skip if already in queue
      if (this.queue.some(q => q.testRunId === test.id)) {
        continue;
      }

      const form = formQueries.getById(test.formId || 0);
      const paymentMethod = await paymentMethodQueries.getById(test.paymentMethodId || 0);

      // Skip orphaned tests (form or payment method deleted)
      if (!form || !paymentMethod) {
        console.log(`[TestQueue] Skipping orphaned test ${test.id} (form or payment method missing)`);
        continue;
      }

      // Get settings
      const settings = settingsQueries.getAll();
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      // Get custom scripts
      const customScripts = customScriptQueries.getScriptsForTest(form.id);
      const settingsWithScripts = { ...settingsMap, customScripts };

      // Re-enqueue the test
      console.log(`[TestQueue] Re-enqueuing test ${test.id} (${form.name} × ${paymentMethod.name})`);
      this.queue.push({
        testRunId: test.id,
        form,
        paymentMethod,
        settings: settingsWithScripts,
        qualityTestOptions: undefined,
        addedAt: Date.now()
      });
    }

    // Start processing if we added tests
    if (this.queue.length > 0 && !this.isProcessing) {
      console.log(`[TestQueue] Starting recovery processing for ${this.queue.length} test(s)`);
      this.processNext();
    }
  }

  /**
   * Manually trigger queue processing
   * Useful when user wants to start processing queued tests
   */
  async triggerProcessing(): Promise<void> {
    // First recover any stuck tests
    await this.recoverStuckTests();
    
    // Then start processing if not already
    if (!this.isProcessing && this.queue.length > 0) {
      this.processNext();
    }
  }

  /**
   * Get current queue status with detailed info
   * Cross-references with database to ensure consistency
   */
  getStatus(): { 
    queueLength: number; 
    isProcessing: boolean; 
    currentTestId: number | null;
    currentTestName: string | null;
    queuedTests: { testRunId: number; formName: string; paymentMethodName: string }[];
    totalPending: number;
  } {
    // Verify current test is still RUNNING in database
    if (this.currentTest && this.isProcessing) {
      const dbTest = testRunQueries.getById(this.currentTest.testRunId);
      if (!dbTest || dbTest.status !== 'RUNNING') {
        // Database says test is not running - reset queue state
        console.log(`[TestQueue] Sync fix: currentTest ${this.currentTest.testRunId} is ${dbTest?.status || 'missing'} in DB, resetting queue state`);
        this.currentTest = null;
        this.isProcessing = false;
        
        // Try to recover and continue processing
        if (this.queue.length > 0) {
          console.log(`[TestQueue] Attempting to continue processing after sync fix`);
          this.processNext();
        }
      }
    }
    
    // Clean queue of tests that are no longer QUEUED in database
    const validQueue = this.queue.filter(t => {
      const dbTest = testRunQueries.getById(t.testRunId);
      if (!dbTest || dbTest.status !== 'QUEUED') {
        console.log(`[TestQueue] Sync fix: removing ${t.testRunId} from queue (DB status: ${dbTest?.status || 'missing'})`);
        return false;
      }
      return true;
    });
    
    if (validQueue.length !== this.queue.length) {
      this.queue = validQueue;
    }

    // If not processing but queue has items, try to start processing
    if (!this.isProcessing && this.queue.length > 0) {
      console.log(`[TestQueue] Queue has ${this.queue.length} items but not processing - starting processing`);
      this.processNext();
    }

    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      currentTestId: this.currentTest?.testRunId || null,
      currentTestName: this.currentTest ? `${this.currentTest.form.name} × ${this.currentTest.paymentMethod.name}` : null,
      queuedTests: this.queue.map(t => ({
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
  removeFromQueue(testRunId: number): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(t => t.testRunId !== testRunId);
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
  clear(): { clearedIds: number[] } {
    const clearedIds = this.queue.map(t => t.testRunId);
    
    // Create stopped steps for cleared tests
    const stoppedSteps: import("../common/types").TestStep[] = [
      {
        id: 'queue-cleared',
        name: 'Aus Warteschlange entfernt',
        status: 'stopped' as const,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 0,
        message: 'Test wurde aus der Warteschlange entfernt bevor er gestartet wurde'
      }
    ];
    
    // Update database status for all cleared tests with steps
    for (const testRunId of clearedIds) {
      testRunQueries.updateStatus(testRunId, "STOPPED", undefined, 0, stoppedSteps);
    }
    
    this.queue = [];
    console.log(`[TestQueue] Cleared ${clearedIds.length} tests from queue`);
    return { clearedIds };
  }

  /**
   * Stop the currently running test and clear the queue
   * This kills the browser process and marks the test as STOPPED
   */
  async stopAll(): Promise<{ stoppedId: number | null; clearedIds: number[] }> {
    const currentTestId = this.currentTest?.testRunId || null;
    const wasProcessing = this.isProcessing;
    
    // Reset queue state FIRST to prevent race conditions
    this.currentTest = null;
    this.isProcessing = false;
    
    // Clear the queue
    const { clearedIds } = this.clear();
    
    // Then stop the current test if one was running
    if (currentTestId && wasProcessing) {
      console.log(`[TestQueue] Stopping current test ${currentTestId}...`);
      
      try {
        // Stop the test runner process (kills browser)
        const processManager = getTestProcessManager();
        await processManager.stopProcess();
        
        // Create stopped steps for the current test
        const stoppedSteps: import("../common/types").TestStep[] = [
          {
            id: 'test-stopped',
            name: 'Test gestoppt',
            status: 'stopped' as const,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            duration: 0,
            message: 'Test wurde vom Benutzer manuell gestoppt'
          }
        ];
        
        // Update database status with steps
        testRunQueries.updateStatus(currentTestId, "STOPPED", undefined, 0, stoppedSteps);
        
        console.log(`[TestQueue] Test ${currentTestId} stopped`);
      } catch (error) {
        console.error(`[TestQueue] Error stopping test ${currentTestId}:`, error);
      }
    }
    
    console.log(`[TestQueue] stopAll complete. Queue state: isProcessing=${this.isProcessing}, currentTest=${this.currentTest}`);
    
    return { stoppedId: currentTestId, clearedIds };
  }
}

// Singleton instance
let testQueueInstance: TestQueue | null = null;

export function getTestQueue(): TestQueue {
  if (!testQueueInstance) {
    testQueueInstance = new TestQueue();
  }
  return testQueueInstance;
}

export { TestQueue };
