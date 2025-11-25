import { spawn, ChildProcess } from "child_process";
import { join } from "path";
import { EventEmitter } from "events";
import type { Form, PaymentMethod, TestStep } from "../../common/types";

export interface TestMessage {
  id: string;
  type: "START_TEST" | "UPDATE_STATUS" | "TEST_COMPLETE" | "ERROR" | "PING" | "PONG" | "STOP_TEST" | "TEST_STOPPED";
  payload?: {
    testRunId?: number;
    form?: Form;
    paymentMethod?: PaymentMethod;
    settings?: Record<string, string>;
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
    if (this.isRunning) {
      console.log("Test process already running");
      return;
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

      this.process = spawn("node", [runnerPath], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: process.cwd(),
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

      // Test process communication
      await this.ping();
      console.log("Test runner process started successfully");
    } catch (error) {
      console.error("Failed to start test runner process:", error);
      this.isRunning = false;
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

    try {
      if (!this.isRunning) {
        await this.startProcess();
      }

      console.log(`Starting test ${testRunId}: ${form.name} with ${paymentMethod.name} (attempt ${retryCount + 1}/${maxRetries + 1})`);

      const message: TestMessage = {
        id: this.generateMessageId(),
        type: "START_TEST",
        payload: {
          testRunId,
          form,
          paymentMethod,
          settings,
        },
      };

      const response = await this.sendMessage(message, 120000); // 2 minute timeout

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
        throw new Error(response.payload?.error || "Test execution failed");
      }
    } catch (error) {
      console.error(`Test ${testRunId} attempt ${retryCount + 1} failed:`, error);

      // Retry logic
      if (retryCount < maxRetries) {
        console.log(`Retrying test ${testRunId} (${retryCount + 1}/${maxRetries})...`);

        // Stop current process if it's in a bad state
        if (this.isRunning) {
          await this.stopProcess();
        }

        // Wait a bit before retry
        await new Promise((resolve) => setTimeout(resolve, 2000));

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
