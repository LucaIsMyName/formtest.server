import { formQueries, paymentMethodQueries, settingsQueries, testRunQueries } from "./database";
import { getTestProcessManager } from "./testRunner/processManager";
import type { Form, PaymentMethod } from "../common/types";
import { randomUUID } from "crypto";
import { BrowserWindow } from "electron";

export async function runSingleTest(testRunId: number, form: Form, paymentMethod: PaymentMethod, settings: Record<string, string>) {
  console.log(`Running test ${testRunId}: ${form.name} with ${paymentMethod.name}`);

  // Check if this is a scheduled test
  const testRun = testRunQueries.getById(testRunId);
  const isScheduled = testRun?.isScheduled;

  try {
    const processManager = getTestProcessManager();
    const result = await processManager.runTest(testRunId, form, paymentMethod, settings);

    // Update test run with results
    await testRunQueries.updateStatus(testRunId, result.success ? "SUCCESS" : "FAILURE", result.error, result.duration);

    console.log(`Test ${testRunId} completed: ${result.success ? "SUCCESS" : "FAILURE"}`);

    // Send toast notification for scheduled test completion
    if (isScheduled) {
      const allWindows = BrowserWindow.getAllWindows();
      allWindows.forEach(window => {
        window.webContents.send('toast:display', {
          type: result.success ? 'success' : 'error',
          message: result.success ? 'Autopilot Test Succeeded' : 'Autopilot Test Failed',
          description: `${form.name} × ${paymentMethod.name}`
        });
      });
    }
  } catch (error) {
    console.error(`Test ${testRunId} failed with error:`, error);

    // Update test run with error
    await testRunQueries.updateStatus(testRunId, "FAILURE", error instanceof Error ? error.message : String(error), 0);

    // Send toast notification for scheduled test failure
    if (isScheduled) {
      const allWindows = BrowserWindow.getAllWindows();
      allWindows.forEach(window => {
        window.webContents.send('toast:display', {
          type: 'error',
          message: 'Autopilot Test Failed',
          description: `${form.name} × ${paymentMethod.name}`
        });
      });
    }
  }
}

export async function createAndRunTest(formId: number, paymentMethodId: number) {
  try {
    const form = formQueries.getById(formId);
    const paymentMethod = await paymentMethodQueries.getById(paymentMethodId);

    if (!form || !paymentMethod) {
      throw new Error(`Form ${formId} or PaymentMethod ${paymentMethodId} not found`);
    }

    // Get settings
    const settings = settingsQueries.getAll();
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    // Create test run
    const testRun = testRunQueries.create({
      uuid: randomUUID(),
      formId: form.id,
      paymentMethodId: paymentMethod.id,
      status: "RUNNING",
      logDetails: JSON.stringify([`Autopilot test started for ${form.name} with ${paymentMethod.name}`]),
      screenshotPath: undefined,
      errorMessage: undefined,
      durationMs: undefined,
      isScheduled: true,
    });

    const testRunId = testRun.lastInsertRowid as number;

    // Send toast notification for test start
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(window => {
      window.webContents.send('toast:display', {
        type: 'info',
        message: 'Autopilot Test Started',
        description: `${form.name} × ${paymentMethod.name}`
      });
    });

    // Run asynchronously
    runSingleTest(testRunId, form, paymentMethod, settingsMap);

    return testRunId;
  } catch (error) {
    console.error("Failed to create and run scheduled test:", error);
    throw error;
  }
}
