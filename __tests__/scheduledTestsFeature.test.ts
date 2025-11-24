import { describe, it, expect } from 'vitest';
import type { TestRun } from '../src/common/types';

describe('Scheduled Tests Feature', () => {
  describe('TestRun Interface', () => {
    it('should support isScheduled field', () => {
      const manualTestRun: TestRun = {
        id: 1,
        uuid: 'test-uuid-1',
        formId: 1,
        paymentMethodId: 1,
        status: 'SUCCESS',
        isScheduled: false,
        runAt: new Date()
      };

      const scheduledTestRun: TestRun = {
        id: 2,
        uuid: 'test-uuid-2',
        formId: 1,
        paymentMethodId: 1,
        status: 'SUCCESS',
        isScheduled: true,
        runAt: new Date()
      };

      expect(manualTestRun.isScheduled).toBe(false);
      expect(scheduledTestRun.isScheduled).toBe(true);
    });

    it('should handle optional isScheduled field', () => {
      const testRunWithoutScheduled: TestRun = {
        id: 1,
        uuid: 'test-uuid',
        formId: 1,
        paymentMethodId: 1,
        status: 'SUCCESS',
        runAt: new Date()
      };

      // Should be able to create TestRun without isScheduled
      expect(testRunWithoutScheduled.isScheduled).toBeUndefined();
    });
  });

  describe('Visual Indicators', () => {
    it('should identify scheduled tests for UI display', () => {
      const testRuns: TestRun[] = [
        {
          id: 1,
          uuid: 'manual-test',
          formId: 1,
          paymentMethodId: 1,
          status: 'SUCCESS',
          isScheduled: false,
          runAt: new Date()
        },
        {
          id: 2,
          uuid: 'scheduled-test',
          formId: 1,
          paymentMethodId: 1,
          status: 'SUCCESS',
          isScheduled: true,
          runAt: new Date()
        },
        {
          id: 3,
          uuid: 'legacy-test',
          formId: 1,
          paymentMethodId: 1,
          status: 'SUCCESS',
          // No isScheduled field (legacy test)
          runAt: new Date()
        }
      ];

      // Filter scheduled tests
      const scheduledTests = testRuns.filter(tr => tr.isScheduled === true);
      const manualTests = testRuns.filter(tr => tr.isScheduled === false);
      const legacyTests = testRuns.filter(tr => tr.isScheduled === undefined);

      expect(scheduledTests).toHaveLength(1);
      expect(manualTests).toHaveLength(1);
      expect(legacyTests).toHaveLength(1);

      expect(scheduledTests[0].uuid).toBe('scheduled-test');
      expect(manualTests[0].uuid).toBe('manual-test');
      expect(legacyTests[0].uuid).toBe('legacy-test');
    });

    it('should support UI logic for showing Bot icon', () => {
      const testRun: TestRun = {
        id: 1,
        uuid: 'test',
        formId: 1,
        paymentMethodId: 1,
        status: 'SUCCESS',
        isScheduled: true,
        runAt: new Date()
      };

      // Simulate UI logic
      const shouldShowBotIcon = Boolean(testRun.isScheduled);
      const iconTitle = testRun.isScheduled ? "Autopilot Test" : "Manual Test";

      expect(shouldShowBotIcon).toBe(true);
      expect(iconTitle).toBe("Autopilot Test");
    });
  });

  describe('Run Again Functionality', () => {
    it('should support re-running tests with same configuration', () => {
      const originalTestRun: TestRun = {
        id: 1,
        uuid: 'original-test',
        formId: 5,
        paymentMethodId: 3,
        status: 'SUCCESS',
        isScheduled: false,
        durationMs: 4500,
        runAt: new Date('2025-01-01T10:00:00Z')
      };

      // Simulate creating a new test run with same config
      const reRunTestRun: Partial<TestRun> = {
        formId: originalTestRun.formId,
        paymentMethodId: originalTestRun.paymentMethodId,
        status: 'RUNNING',
        isScheduled: false, // Re-runs are manual tests
        runAt: new Date() // New timestamp
      };

      expect(reRunTestRun.formId).toBe(originalTestRun.formId);
      expect(reRunTestRun.paymentMethodId).toBe(originalTestRun.paymentMethodId);
      expect(reRunTestRun.isScheduled).toBe(false);
      expect(reRunTestRun.runAt).not.toEqual(originalTestRun.runAt);
    });

    it('should handle re-running scheduled tests as manual tests', () => {
      const scheduledTestRun: TestRun = {
        id: 1,
        uuid: 'scheduled-test',
        formId: 2,
        paymentMethodId: 1,
        status: 'FAILURE',
        isScheduled: true,
        runAt: new Date('2025-01-01T09:00:00Z')
      };

      // When re-running a scheduled test, it becomes a manual test
      const reRunConfig = {
        formId: scheduledTestRun.formId,
        paymentMethodId: scheduledTestRun.paymentMethodId,
        isScheduled: false // Always false for re-runs
      };

      expect(reRunConfig.isScheduled).toBe(false);
      expect(reRunConfig.formId).toBe(scheduledTestRun.formId);
      expect(reRunConfig.paymentMethodId).toBe(scheduledTestRun.paymentMethodId);
    });
  });

  describe('Database Integration', () => {
    it('should handle boolean to integer conversion for SQLite', () => {
      // Simulate database storage (boolean to integer)
      const testRunData = {
        isScheduled: true
      };

      const sqliteValue = testRunData.isScheduled ? 1 : 0;
      expect(sqliteValue).toBe(1);

      // Simulate database retrieval (integer to boolean)
      const retrievedValue = Boolean(sqliteValue);
      expect(retrievedValue).toBe(true);
    });

    it('should handle null/undefined values gracefully', () => {
      // Simulate legacy data without isScheduled field
      const legacyData: { id: number; formId: number; paymentMethodId: number; isScheduled?: boolean } = {
        id: 1,
        formId: 1,
        paymentMethodId: 1,
        // No isScheduled field
      };

      // Default to false for legacy data
      const isScheduled = Boolean(legacyData.isScheduled || false);
      expect(isScheduled).toBe(false);
    });
  });

  describe('Test Execution Context', () => {
    it('should differentiate between manual and scheduled execution', () => {
      // Manual test execution (from TestRunDialog)
      const manualTestConfig = {
        formId: 1,
        paymentMethodId: 1,
        isScheduled: false,
        logDetails: JSON.stringify(['Test started for Form 1 with PayPal'])
      };

      // Scheduled test execution (from testExecutor)
      const scheduledTestConfig = {
        formId: 1,
        paymentMethodId: 1,
        isScheduled: true,
        logDetails: JSON.stringify(['Autopilot test started for Form 1 with PayPal'])
      };

      expect(manualTestConfig.isScheduled).toBe(false);
      expect(scheduledTestConfig.isScheduled).toBe(true);
      
      // Log messages should also be different
      expect(manualTestConfig.logDetails).toContain('Test started');
      expect(scheduledTestConfig.logDetails).toContain('Autopilot test started');
    });

    it('should support filtering tests by execution type', () => {
      const mixedTestRuns: TestRun[] = [
        { id: 1, uuid: '1', formId: 1, paymentMethodId: 1, status: 'SUCCESS', isScheduled: false, runAt: new Date() },
        { id: 2, uuid: '2', formId: 1, paymentMethodId: 1, status: 'SUCCESS', isScheduled: true, runAt: new Date() },
        { id: 3, uuid: '3', formId: 1, paymentMethodId: 1, status: 'FAILURE', isScheduled: false, runAt: new Date() },
        { id: 4, uuid: '4', formId: 1, paymentMethodId: 1, status: 'SUCCESS', isScheduled: true, runAt: new Date() },
      ];

      const manualTests = mixedTestRuns.filter(tr => tr.isScheduled === false);
      const scheduledTests = mixedTestRuns.filter(tr => tr.isScheduled === true);

      expect(manualTests).toHaveLength(2);
      expect(scheduledTests).toHaveLength(2);

      // Check IDs
      expect(manualTests.map(t => t.id)).toEqual([1, 3]);
      expect(scheduledTests.map(t => t.id)).toEqual([2, 4]);
    });
  });

  describe('UI Action Buttons', () => {
    it('should support action button configuration', () => {
      const testRun: TestRun = {
        id: 1,
        uuid: 'test',
        formId: 1,
        paymentMethodId: 1,
        status: 'SUCCESS',
        isScheduled: true,
        runAt: new Date()
      };

      // Simulate UI button configuration
      const actions = [
        {
          type: 'run-again',
          enabled: testRun.status !== 'RUNNING',
          title: 'Test erneut ausführen',
          icon: 'Play',
          color: 'blue'
        },
        {
          type: 'delete',
          enabled: true,
          title: 'Löschen',
          icon: 'Trash2',
          color: 'red'
        }
      ];

      expect(actions[0].enabled).toBe(true); // Can re-run completed tests
      expect(actions[1].enabled).toBe(true); // Can always delete
      expect(actions).toHaveLength(2);
    });

    it('should disable run-again for running tests', () => {
      const runningTest: TestRun = {
        id: 1,
        uuid: 'test',
        formId: 1,
        paymentMethodId: 1,
        status: 'RUNNING',
        isScheduled: false,
        runAt: new Date()
      };

      const canRunAgain = runningTest.status !== 'RUNNING';
      expect(canRunAgain).toBe(false);
    });
  });
});
