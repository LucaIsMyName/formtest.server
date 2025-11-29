/**
 * Test Queue System
 * 
 * Ensures tests run sequentially (one at a time) to prevent:
 * 1. Log/step mixing between concurrent tests
 * 2. Browser context conflicts
 * 3. Race conditions in the singleton TestRunner
 */

import { runSingleTest } from "./testExecutor";
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
   * Clear the queue (does not stop current test)
   */
  clear(): void {
    const cleared = this.queue.length;
    this.queue = [];
    console.log(`[TestQueue] Cleared ${cleared} tests from queue`);
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
