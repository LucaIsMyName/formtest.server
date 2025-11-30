import { formQueries, paymentMethodQueries, settingsQueries, testRunQueries, notificationQueries } from "./database";
import { getTestProcessManager } from "./testRunner/processManager";
import { getTestQueue } from "./testQueue";
import type { Form, PaymentMethod } from "../common/types";
import { randomUUID } from "crypto";
import { BrowserWindow } from "electron";
import { emailService } from "./emailService";

export async function runSingleTest(testRunId: number, form: Form, paymentMethod: PaymentMethod, settings: Record<string, string>) {
  console.log(`Running test ${testRunId}: ${form.name} with ${paymentMethod.name}`);

  // Check if this is a scheduled test
  const testRun = testRunQueries.getById(testRunId);
  const isScheduled = testRun?.isScheduled;

  try {
    const processManager = getTestProcessManager();
    const result = await processManager.runTest(testRunId, form, paymentMethod, settings);

    // Update test run with results including steps
    await testRunQueries.updateStatus(testRunId, result.success ? "SUCCESS" : "FAILURE", result.error, result.duration, result.steps);

    console.log(`Test ${testRunId} completed: ${result.success ? "SUCCESS" : "FAILURE"} with ${result.steps?.length || 0} steps`);

    // Create notification for scheduled test completion
    if (isScheduled) {
      notificationQueries.create({
        type: result.success ? 'test_complete' : 'test_failed',
        title: result.success ? 'Autopilot Test erfolgreich' : 'Autopilot Test fehlgeschlagen',
        message: `${form.name} × ${paymentMethod.name}`,
        testRunId: testRunId
      });
      
      // Notify renderer to refresh notifications
      const allWindows = BrowserWindow.getAllWindows();
      allWindows.forEach(window => {
        window.webContents.send('notifications:updated');
      });

      // Send email notification for scheduled tests
      emailService.sendTestResultNotification({
        testRunId,
        formName: form.name,
        paymentMethodName: paymentMethod.name,
        status: result.success ? "SUCCESS" : "FAILURE",
        errorMessage: result.error,
        durationMs: result.duration,
        runAt: new Date()
      }).catch(err => console.error("Failed to send email notification:", err));
    }
  } catch (error) {
    console.error(`Test ${testRunId} failed with error:`, error);

    // Create error steps for the drawer to display
    const errorSteps: import("../common/types").TestStep[] = [
      {
        id: 'test-error',
        name: 'Test fehlgeschlagen',
        status: 'error' as const,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 0,
        message: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.message : String(error)
      }
    ];

    // Update test run with error and steps
    await testRunQueries.updateStatus(testRunId, "FAILURE", error instanceof Error ? error.message : String(error), 0, errorSteps);

    // Create notification for scheduled test failure
    if (isScheduled) {
      notificationQueries.create({
        type: 'test_failed',
        title: 'Autopilot Test fehlgeschlagen',
        message: `${form.name} × ${paymentMethod.name}`,
        testRunId: testRunId
      });
      
      // Notify renderer to refresh notifications
      const allWindows = BrowserWindow.getAllWindows();
      allWindows.forEach(window => {
        window.webContents.send('notifications:updated');
      });

      // Send email notification for scheduled test failure
      emailService.sendTestResultNotification({
        testRunId,
        formName: form.name,
        paymentMethodName: paymentMethod.name,
        status: "FAILURE",
        errorMessage: error instanceof Error ? error.message : String(error),
        runAt: new Date()
      }).catch(err => console.error("Failed to send email notification:", err));
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

    // Create test run with QUEUED status (will be set to RUNNING when actually starts)
    const testRun = testRunQueries.create({
      uuid: randomUUID(),
      formId: form.id,
      paymentMethodId: paymentMethod.id,
      status: "QUEUED",
      logDetails: JSON.stringify([`Autopilot test queued for ${form.name} with ${paymentMethod.name}`]),
      screenshotPath: undefined,
      errorMessage: undefined,
      durationMs: undefined,
      isScheduled: true,
    });

    const testRunId = testRun.lastInsertRowid as number;

    // Add to queue instead of running directly - prevents concurrent test issues
    const testQueue = getTestQueue();
    testQueue.enqueue(testRunId, form, paymentMethod, settingsMap);

    console.log(`[Scheduler] Test ${testRunId} added to queue for ${form.name} × ${paymentMethod.name}`);

    return testRunId;
  } catch (error) {
    console.error("Failed to create and run scheduled test:", error);
    throw error;
  }
}
