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
import type { Form, PaymentMethod } from "../common/types";

interface QueuedTest {
  testRunId: number;
  form: Form;
  paymentMethod: PaymentMethod;
  settings: Record<string, string>;
  addedAt: number;
}

class TestQueue {
  private queue: QueuedTest[] = [];
  private isProcessing = false;
  private currentTest: QueuedTest | null = null;

  /**
   * Add a test to the queue
   */
  enqueue(testRunId: number, form: Form, paymentMethod: PaymentMethod, settings: Record<string, string>): void {
    const queuedTest: QueuedTest = {
      testRunId,
      form,
      paymentMethod,
      settings,
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

    const { testRunId, form, paymentMethod, settings } = this.currentTest;
    const waitTime = Date.now() - this.currentTest.addedAt;

    console.log(`[TestQueue] Starting test ${testRunId} (waited ${waitTime}ms in queue). Remaining in queue: ${this.queue.length}`);

    try {
      // Update status from QUEUED to RUNNING when test actually starts
      testRunQueries.updateStatus(testRunId, "RUNNING");
      
      // Run the test - this is synchronous from the queue's perspective
      await runSingleTest(testRunId, form, paymentMethod, settings);
      console.log(`[TestQueue] Test ${testRunId} completed`);
    } catch (error) {
      console.error(`[TestQueue] Test ${testRunId} failed with error:`, error);
    } finally {
      this.currentTest = null;
      this.isProcessing = false;

      // Small delay between tests to ensure clean state
      await new Promise(resolve => setTimeout(resolve, 500));

      // Process next test if any
      if (this.queue.length > 0) {
        this.processNext();
      }
    }
  }

  /**
   * Get current queue status with detailed info
   */
  getStatus(): { 
    queueLength: number; 
    isProcessing: boolean; 
    currentTestId: number | null;
    currentTestName: string | null;
    queuedTests: { testRunId: number; formName: string; paymentMethodName: string }[];
    totalPending: number;
  } {
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
    
    // Update database status for all cleared tests
    for (const testRunId of clearedIds) {
      testRunQueries.updateStatus(testRunId, "STOPPED");
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
        
        // Update database status
        testRunQueries.updateStatus(currentTestId, "STOPPED");
        
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
