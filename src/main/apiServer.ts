/**
 * REST API Server for FormTest Server
 * 
 * Provides external access to trigger tests and retrieve results.
 * Useful for CI/CD integration.
 */

import { createServer, IncomingMessage, ServerResponse } from "http";
import { randomUUID } from "crypto";
import { formQueries, paymentMethodQueries, testRunQueries, settingsQueries, testScheduleQueries } from "./database";
import { getTestQueue } from "./testQueue";
import type { Server } from "http";

let server: Server | null = null;
let apiKey: string | null = null;

// Simple JSON body parser
async function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

// Send JSON response
function sendJson(res: ServerResponse, statusCode: number, data: any): void {
  res.writeHead(statusCode, { 
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key"
  });
  res.end(JSON.stringify(data));
}

// Authentication middleware
function authenticate(req: IncomingMessage): boolean {
  const providedKey = req.headers["x-api-key"];
  if (!apiKey || !providedKey) return false;
  return providedKey === apiKey;
}

// Route handler
async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method || "GET";

  // Handle CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key"
    });
    res.end();
    return;
  }

  // Health check (no auth required)
  if (path === "/api/health" && method === "GET") {
    sendJson(res, 200, { 
      status: "ok", 
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
    return;
  }

  // All other routes require authentication
  if (!authenticate(req)) {
    sendJson(res, 401, { error: "Unauthorized", message: "Invalid or missing X-API-Key header" });
    return;
  }

  try {
    // GET /api/forms - List all forms
    if (path === "/api/forms" && method === "GET") {
      const forms = formQueries.getAll();
      sendJson(res, 200, { 
        success: true, 
        count: forms.length,
        data: forms.map(f => ({
          id: f.id,
          name: f.name,
          url: f.url,
          isActive: f.isActive
        }))
      });
      return;
    }

    // GET /api/payment-methods - List payment methods (without sensitive data)
    if (path === "/api/payment-methods" && method === "GET") {
      const methods = await paymentMethodQueries.getAll();
      sendJson(res, 200, { 
        success: true,
        count: methods.length,
        data: methods.map(m => ({
          id: m.id,
          name: m.name,
          type: m.type,
          isActive: m.isActive
          // Note: details are intentionally excluded for security
        }))
      });
      return;
    }

    // GET /api/schedules - List all schedules
    if (path === "/api/schedules" && method === "GET") {
      const schedules = testScheduleQueries.getAll();
      sendJson(res, 200, {
        success: true,
        count: schedules.length,
        data: schedules.map(s => ({
          id: s.id,
          name: s.name,
          formId: s.formId,
          paymentMethodId: s.paymentMethodId,
          cronExpression: s.cronExpression,
          isActive: s.isActive,
          lastRun: s.lastRun
        }))
      });
      return;
    }

    // POST /api/tests/run - Trigger test run
    if (path === "/api/tests/run" && method === "POST") {
      const body = await parseBody(req);
      const { formIds, paymentMethodIds } = body;

      if (!formIds || !Array.isArray(formIds) || formIds.length === 0) {
        sendJson(res, 400, { error: "Bad Request", message: "formIds array is required" });
        return;
      }

      if (!paymentMethodIds || !Array.isArray(paymentMethodIds) || paymentMethodIds.length === 0) {
        sendJson(res, 400, { error: "Bad Request", message: "paymentMethodIds array is required" });
        return;
      }

      // Get forms and payment methods
      const forms = formQueries.getAll().filter(f => formIds.includes(f.id));
      const methods = await paymentMethodQueries.getAll();
      const filteredMethods = methods.filter(m => paymentMethodIds.includes(m.id));

      if (forms.length === 0) {
        sendJson(res, 404, { error: "Not Found", message: "No forms found with provided IDs" });
        return;
      }

      if (filteredMethods.length === 0) {
        sendJson(res, 404, { error: "Not Found", message: "No payment methods found with provided IDs" });
        return;
      }

      // Get settings
      const allSettings = settingsQueries.getAll();
      const settingsMap: Record<string, string> = {};
      allSettings.forEach(s => { settingsMap[s.key] = s.value; });

      // Queue tests
      const testIds: number[] = [];
      const testUuids: string[] = [];

      for (const form of forms) {
        for (const pm of filteredMethods) {
          const uuid = randomUUID();
          const result = testRunQueries.create({
            uuid,
            formId: form.id,
            paymentMethodId: pm.id,
            status: "QUEUED",
            errorMessage: undefined,
            screenshotPath: undefined,
            logDetails: undefined,
            steps: [],
            durationMs: undefined,
            isScheduled: false
          });

          const testId = result.lastInsertRowid as number;
          testIds.push(testId);
          testUuids.push(uuid);

          // Add to queue
          getTestQueue().enqueue(testId, form, pm, settingsMap);
        }
      }

      sendJson(res, 200, { 
        success: true, 
        message: `${testIds.length} test(s) queued`,
        testIds,
        testUuids
      });
      return;
    }

    // GET /api/tests - List recent tests
    if (path === "/api/tests" && method === "GET") {
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const status = url.searchParams.get("status");
      
      let tests = testRunQueries.getAll();
      
      if (status) {
        tests = tests.filter(t => t.status === status.toUpperCase());
      }
      
      tests = tests.slice(0, Math.min(limit, 100));

      sendJson(res, 200, {
        success: true,
        count: tests.length,
        data: tests.map(t => ({
          id: t.id,
          uuid: t.uuid,
          formId: t.formId,
          paymentMethodId: t.paymentMethodId,
          status: t.status,
          durationMs: t.durationMs,
          runAt: t.runAt,
          errorMessage: t.errorMessage
        }))
      });
      return;
    }

    // GET /api/tests/:id - Get test by ID
    const testByIdMatch = path.match(/^\/api\/tests\/(\d+)$/);
    if (testByIdMatch && method === "GET") {
      const testId = parseInt(testByIdMatch[1]);
      const test = testRunQueries.getById(testId);
      
      if (!test) {
        sendJson(res, 404, { error: "Not Found", message: "Test not found" });
        return;
      }

      sendJson(res, 200, {
        success: true,
        data: {
          id: test.id,
          uuid: test.uuid,
          formId: test.formId,
          paymentMethodId: test.paymentMethodId,
          status: test.status,
          durationMs: test.durationMs,
          runAt: test.runAt,
          errorMessage: test.errorMessage,
          steps: test.steps,
          notes: test.notes
        }
      });
      return;
    }

    // GET /api/tests/:id/status - Poll test status (lightweight)
    const testStatusMatch = path.match(/^\/api\/tests\/(\d+)\/status$/);
    if (testStatusMatch && method === "GET") {
      const testId = parseInt(testStatusMatch[1]);
      const test = testRunQueries.getById(testId);
      
      if (!test) {
        sendJson(res, 404, { error: "Not Found", message: "Test not found" });
        return;
      }

      sendJson(res, 200, {
        success: true,
        data: {
          id: test.id,
          uuid: test.uuid,
          status: test.status,
          durationMs: test.durationMs,
          errorMessage: test.errorMessage
        }
      });
      return;
    }

    // GET /api/tests/uuid/:uuid - Get test by UUID
    const testByUuidMatch = path.match(/^\/api\/tests\/uuid\/([a-f0-9-]+)$/i);
    if (testByUuidMatch && method === "GET") {
      const uuid = testByUuidMatch[1];
      const tests = testRunQueries.getAll();
      const test = tests.find(t => t.uuid === uuid);
      
      if (!test) {
        sendJson(res, 404, { error: "Not Found", message: "Test not found" });
        return;
      }

      sendJson(res, 200, {
        success: true,
        data: {
          id: test.id,
          uuid: test.uuid,
          formId: test.formId,
          paymentMethodId: test.paymentMethodId,
          status: test.status,
          durationMs: test.durationMs,
          runAt: test.runAt,
          errorMessage: test.errorMessage,
          steps: test.steps
        }
      });
      return;
    }

    // GET /api/queue/status - Get queue status
    if (path === "/api/queue/status" && method === "GET") {
      const status = getTestQueue().getStatus();
      sendJson(res, 200, {
        success: true,
        data: status
      });
      return;
    }

    // 404 for unknown routes
    sendJson(res, 404, { error: "Not Found", message: `Unknown endpoint: ${method} ${path}` });

  } catch (error) {
    console.error("[API] Error handling request:", error);
    sendJson(res, 500, { 
      error: "Internal Server Error", 
      message: error instanceof Error ? error.message : "Unknown error" 
    });
  }
}

/**
 * Start the API server
 */
export function startApiServer(port: number, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (server) {
      console.log("[API] Server already running");
      resolve();
      return;
    }

    apiKey = key;

    server = createServer((req, res) => {
      handleRequest(req, res).catch((error) => {
        console.error("[API] Unhandled error:", error);
        sendJson(res, 500, { error: "Internal Server Error" });
      });
    });

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(`[API] Port ${port} is already in use`);
        reject(new Error(`Port ${port} is already in use`));
      } else {
        reject(error);
      }
    });

    server.listen(port, "127.0.0.1", () => {
      console.log(`[API] Server running on http://127.0.0.1:${port}`);
      resolve();
    });
  });
}

/**
 * Stop the API server
 */
export function stopApiServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!server) {
      resolve();
      return;
    }

    server.close(() => {
      console.log("[API] Server stopped");
      server = null;
      apiKey = null;
      resolve();
    });
  });
}

/**
 * Check if API server is running
 */
export function isApiServerRunning(): boolean {
  return server !== null && server.listening;
}

/**
 * Generate a new API key
 */
export function generateApiKey(): string {
  return randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");
}
