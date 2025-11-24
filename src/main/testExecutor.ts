import { formQueries, paymentMethodQueries, settingsQueries, testRunQueries } from "./database";
import { getTestProcessManager } from "./testRunner/processManager";
import type { Form, PaymentMethod } from "../common/types";
import { randomUUID } from "crypto";

export async function runSingleTest(testRunId: number, form: Form, paymentMethod: PaymentMethod, settings: Record<string, string>) {
  console.log(`Running test ${testRunId}: ${form.name} with ${paymentMethod.name}`);

  try {
    const processManager = getTestProcessManager();
    const result = await processManager.runTest(testRunId, form, paymentMethod, settings);

    // Update test run with results
    await testRunQueries.updateStatus(testRunId, result.success ? "SUCCESS" : "FAILURE", result.error, result.duration);

    console.log(`Test ${testRunId} completed: ${result.success ? "SUCCESS" : "FAILURE"}`);
  } catch (error) {
    console.error(`Test ${testRunId} failed with error:`, error);

    // Update test run with error
    await testRunQueries.updateStatus(testRunId, "FAILURE", error instanceof Error ? error.message : String(error), 0);
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
    });

    const testRunId = testRun.lastInsertRowid as number;

    // Run asynchronously
    runSingleTest(testRunId, form, paymentMethod, settingsMap);

    return testRunId;
  } catch (error) {
    console.error("Failed to create and run scheduled test:", error);
    throw error;
  }
}
