import { spawn, ChildProcess } from "child_process";
import { join } from "path";
import { EventEmitter } from "events";
import type { Form, PaymentMethod, TestStep, GlobalFieldDefaults } from "../../common/types";
import { getMergedSelectorConfig, settingsQueries } from "../database";
import type { SelectorConfig } from "../../common/selectors.config";

export interface TestMessage {
  id: string;
  type: "START_TEST" | "UPDATE_STATUS" | "TEST_COMPLETE" | "ERROR" | "PING" | "PONG" | "STOP_TEST" | "TEST_STOPPED";
  payload?: {
    testRunId?: number;
    form?: Form;
    paymentMethod?: PaymentMethod;
    settings?: Record<string, string>;
    selectorConfig?: SelectorConfig;
    globalFieldDefaults?: GlobalFieldDefaults;
    success?: boolean;
    result?: any;
    error?: string;
    logs?: string[];
  };
}

export interface TestResult {
  success: boolean;
  error?: string;
  duration: number;
  logs: string[];
  steps?: TestStep[];
  screenshot?: string;
  formAnalysis?: any;
}

export class TestProcessManager extends EventEmitter {
  private process: ChildProcess | null = null;
  private messageQueue: Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }> = new Map();
  private isRunning = false;
  private messageId = 0;
  private buffer = '';

  constructor() {
    super();
  }

  async startProcess(): Promise<void> {
    // Always restart the process to ensure clean state
    if (this.isRunning) {
      console.log("Stopping existing test process before starting new one...");
      await this.stopProcess();
    }

    console.log("Starting test runner process...");

    try {
      // Try both development and production paths
      let runnerPath = join(__dirname, "testRunner", "runner.js");

      // Check if file exists, if not try alternative path
      const fs = require("fs");
      if (!fs.existsSync(runnerPath)) {
        // Alternative path for development
        runnerPath = join(process.cwd(), "src", "main", "testRunner", "runner.js");
        console.log(`Using development runner path: ${runnerPath}`);
      } else {
        console.log(`Using production runner path: ${runnerPath}`);
      }

      // Verify runner file exists before spawning
      if (!fs.existsSync(runnerPath)) {
        throw new Error(`Runner script not found at: ${runnerPath}`);
      }

      this.process = spawn("node", [runnerPath], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: process.cwd(),
        // Increase memory limit for Playwright
        env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=4096" },
      });

      this.isRunning = true;

      // Handle process output
      this.process.stdout?.on("data", (data) => {
        this.buffer += data.toString();
        
        const lines = this.buffer.split("\n");
        this.buffer = lines.pop() || ""; // Keep the last partial line in the buffer
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const message: TestMessage = JSON.parse(line);
            this.handleMessage(message);
          } catch (error) {
            console.log("Test runner output:", line);
          }
        }
      });

      // Handle process errors
      this.process.stderr?.on("data", (data) => {
        console.log("Test runner log:", data.toString());
      });

      // Handle process exit
      this.process.on("exit", (code, signal) => {
        console.log(`Test runner process exited with code ${code}, signal ${signal}`);
        this.isRunning = false;
        this.process = null;

        // Reject all pending messages
        for (const { reject, timeout } of this.messageQueue.values()) {
          clearTimeout(timeout);
          reject(new Error("Process exited unexpectedly"));
        }
        this.messageQueue.clear();

        this.emit("processExit", { code, signal });
      });

      // Handle process errors
      this.process.on("error", (error) => {
        console.error("Test runner process error:", error);
        this.isRunning = false;
        this.emit("processError", error);
      });

      // Test process communication with retry
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
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      throw new Error("Failed to establish communication with test runner after multiple attempts");
    } catch (error) {
      console.error("Failed to start test runner process:", error);
      this.isRunning = false;
      // Clean up any partial process
      if (this.process) {
        try {
          this.process.kill("SIGKILL");
        } catch (e) {
          // Ignore kill errors
        }
        this.process = null;
      }
      throw error;
    }
  }

  async stopProcess(): Promise<void> {
    if (!this.isRunning || !this.process) {
      return;
    }

    console.log("Stopping test runner process...");

    try {
      // Try graceful shutdown first
      this.process.kill("SIGTERM");

      // Wait a bit for graceful shutdown
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Force kill if still running
      if (this.isRunning) {
        this.process.kill("SIGKILL");
      }
    } catch (error) {
      console.error("Error stopping test runner process:", error);
    }

    this.isRunning = false;
    this.process = null;
  }

  async runTest(testRunId: number, form: Form, paymentMethod: PaymentMethod, settings: Record<string, string>, retryCount: number = 0): Promise<TestResult> {
    const maxRetries = 2;
    const testTimeout = parseInt(settings.test_timeout || "180000"); // Default 3 minutes

    try {
      // Always start fresh process for each test to avoid hung state issues
      console.log(`Starting test ${testRunId}: ${form.name} with ${paymentMethod.name} (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      // Start process with timeout protection
      const startTimeout = 15000; // 15 seconds to start process
      const startPromise = this.startProcess();
      const startTimeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Process start timeout")), startTimeout)
      );
      
      try {
        await Promise.race([startPromise, startTimeoutPromise]);
      } catch (startError) {
        console.error(`Failed to start process: ${startError}`);
        throw new Error(`Failed to start test runner: ${startError instanceof Error ? startError.message : startError}`);
      }

      // Get merged selector config (base + user overrides)
      const selectorConfig = getMergedSelectorConfig();
      
      // Get global field defaults (middle layer between faker and form mappings)
      const globalFieldDefaults = settingsQueries.getFieldDefaults();
      console.log('ProcessManager: Global field defaults:', JSON.stringify(globalFieldDefaults));

      const message: TestMessage = {
        id: this.generateMessageId(),
        type: "START_TEST",
        payload: {
          testRunId,
          form,
          paymentMethod,
          settings,
          selectorConfig,
          globalFieldDefaults,
        },
      };

      const response = await this.sendMessage(message, testTimeout + 30000); // Test timeout + 30s buffer

      // Stop process after test completes to ensure clean state for next test
      await this.stopProcess();

      if (response.payload?.success) {
        return {
          success: true,
          duration: response.payload.result?.duration || 0,
          logs: response.payload.result?.logs || [],
          steps: response.payload.result?.steps || [],
          screenshot: response.payload.result?.screenshot,
          formAnalysis: response.payload.result?.formAnalysis,
        };
      } else {
        // Return failure result WITH steps for debugging (don't throw)
        return {
          success: false,
          error: response.payload?.error || "Test execution failed",
          duration: response.payload?.result?.duration || 0,
          logs: response.payload?.result?.logs || response.payload?.logs || [],
          steps: response.payload?.result?.steps || [],
          screenshot: response.payload?.result?.screenshot,
        };
      }
    } catch (error) {
      console.error(`Test ${testRunId} attempt ${retryCount + 1} failed:`, error);

      // Retry logic with exponential backoff
      if (retryCount < maxRetries) {
        const backoffMs = Math.min(3000 * Math.pow(2, retryCount), 10000); // 3s, 6s, max 10s
        console.log(`Retrying test ${testRunId} in ${backoffMs}ms (attempt ${retryCount + 2}/${maxRetries + 1})...`);

        // Force stop current process if it's in a bad state
        if (this.isRunning || this.process) {
          console.log('Force stopping process before retry...');
          try {
            this.process?.kill("SIGKILL");
          } catch (e) {
            // Ignore
          }
          this.isRunning = false;
          this.process = null;
          // Clear any pending messages
          for (const { reject, timeout } of this.messageQueue.values()) {
            clearTimeout(timeout);
          }
          this.messageQueue.clear();
        }

        // Wait with exponential backoff before retry
        await new Promise((resolve) => setTimeout(resolve, backoffMs));

        // Retry the test
        return this.runTest(testRunId, form, paymentMethod, settings, retryCount + 1);
      }

      // Final failure after all retries
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: 0,
        logs: [`Failed after ${maxRetries + 1} attempts: ${error}`],
      };
    }
  }

  private async ping(): Promise<void> {
    const message: TestMessage = {
      id: this.generateMessageId(),
      type: "PING",
    };

    await this.sendMessage(message, 5000);
  }

  private sendMessage(message: TestMessage, timeoutMs: number = 30000): Promise<TestMessage> {
    return new Promise((resolve, reject) => {
      if (!this.process || !this.isRunning) {
        reject(new Error("Test process not running"));
        return;
      }

      // Set up timeout
      const timeout = setTimeout(() => {
        this.messageQueue.delete(message.id);
        reject(new Error(`Message timeout: ${message.type}`));
      }, timeoutMs);

      // Store message handler
      this.messageQueue.set(message.id, { resolve, reject, timeout });

      // Send message
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

  private handleMessage(message: TestMessage): void {
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
      // Handle unsolicited messages
      this.emit("message", message);
    }
  }

  private generateMessageId(): string {
    return `msg_${++this.messageId}_${Date.now()}`;
  }

  isProcessRunning(): boolean {
    return this.isRunning;
  }
}

// Singleton instance
let processManager: TestProcessManager | null = null;

export function getTestProcessManager(): TestProcessManager {
  if (!processManager) {
    processManager = new TestProcessManager();

    // Handle process cleanup on app exit
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
