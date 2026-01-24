import { describe, it, expect } from 'vitest';
import type { ExportData, ImportOptions, ImportResult, TestSchedule } from '../src/common/types';

describe('Schedule Import/Export Type System', () => {
  describe('Type Definitions', () => {
    it('should include schedules in ImportOptions', () => {
      const options: ImportOptions = {
        includeForms: true,
        includePaymentMethods: true,
        includeTestRuns: true,
        includeSchedules: true,
        includeSettings: true
      };

      expect(options.includeSchedules).toBe(true);
      expect(typeof options.includeSchedules).toBe('boolean');
    });

    it('should include testSchedules in ExportData', () => {
      const testSchedule: TestSchedule = {
        id: 1,
        name: 'Test Schedule',
        formId: 1,
        paymentMethodId: 1,
        cronExpression: '0 0 9 * * *',
        isActive: true,
        icon: 'Sun',
        createdAt: new Date()
      };

      const exportData: ExportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        schemaVersion: 1,
        data: {
          testSchedules: [testSchedule]
        }
      };

      expect(exportData.data.testSchedules).toBeDefined();
      expect(exportData.data.testSchedules).toHaveLength(1);
      expect(exportData.data.testSchedules![0]).toEqual(testSchedule);
    });

    it('should include schedules counters in ImportResult', () => {
      const result: ImportResult = {
        success: true,
        imported: {
          forms: 2,
          paymentMethods: 1,
          testRuns: 5,
          schedules: 3,
          settings: 4
        },
        skipped: {
          forms: 0,
          paymentMethods: 0,
          testRuns: 1,
          schedules: 1,
          settings: 0
        },
        errors: [],
        warnings: ['Updated schedule "Morning Tests"']
      };

      expect(result.imported.schedules).toBe(3);
      expect(result.skipped.schedules).toBe(1);
      expect(typeof result.imported.schedules).toBe('number');
      expect(typeof result.skipped.schedules).toBe('number');
    });
  });

  describe('TestSchedule Interface', () => {
    it('should support all required fields', () => {
      const schedule: TestSchedule = {
        id: 1,
        name: 'Morning Automation',
        formId: 2,
        paymentMethodId: 3,
        cronExpression: '0 0 9 * * *',
        isActive: true,
        icon: 'Sun',
        createdAt: new Date('2025-01-01T09:00:00Z')
      };

      // Verify all required fields
      expect(schedule.id).toBe(1);
      expect(schedule.name).toBe('Morning Automation');
      expect(schedule.formId).toBe(2);
      expect(schedule.paymentMethodId).toBe(3);
      expect(schedule.cronExpression).toBe('0 0 9 * * *');
      expect(schedule.isActive).toBe(true);
      expect(schedule.icon).toBe('Sun');
      expect(schedule.createdAt).toBeInstanceOf(Date);
    });

    it('should support optional fields', () => {
      const scheduleWithOptionals: TestSchedule = {
        id: 1,
        name: 'Test Schedule',
        formId: 1,
        paymentMethodId: 1,
        cronExpression: '0 0 12 * * *',
        isActive: false,
        icon: 'Clock',
        lastRun: new Date('2025-01-01T12:00:00Z'),
        nextRun: new Date('2025-01-02T12:00:00Z'),
        createdAt: new Date('2025-01-01T10:00:00Z')
      };

      expect(scheduleWithOptionals.lastRun).toBeInstanceOf(Date);
      expect(scheduleWithOptionals.nextRun).toBeInstanceOf(Date);
    });

    it('should handle various icon types', () => {
      const iconTypes = ['Sun', 'Moon', 'Clock', 'Calendar', 'Play', 'Settings', 'BarChart'];
      
      iconTypes.forEach((iconType, index) => {
        const schedule: TestSchedule = {
          id: index + 1,
          name: `Schedule ${index + 1}`,
          formId: 1,
          paymentMethodId: 1,
          cronExpression: '0 0 9 * * *',
          isActive: true,
          icon: iconType,
          createdAt: new Date()
        };

        expect(schedule.icon).toBe(iconType);
      });
    });

    it('should handle various cron expressions', () => {
      const cronExpressions = [
        '0 */5 * * * *',    // Every 5 minutes
        '0 0 * * * *',      // Every hour
        '0 0 9 * * *',      // Daily at 9 AM
        '0 0 9 * * 1',      // Weekly on Monday at 9 AM
        '0 0 9 1 * *',      // Monthly on 1st at 9 AM
        '0 0 9,18 * * *'    // Twice daily at 9 AM and 6 PM
      ];

      cronExpressions.forEach((cron, index) => {
        const schedule: TestSchedule = {
          id: index + 1,
          name: `Schedule ${index + 1}`,
          formId: 1,
          paymentMethodId: 1,
          cronExpression: cron,
          isActive: true,
          createdAt: new Date()
        };

        expect(schedule.cronExpression).toBe(cron);
      });
    });
  });

  describe('Import/Export Data Flow', () => {
    it('should handle complete export data structure', () => {
      const schedules: TestSchedule[] = [
        {
          id: 1,
          name: 'Morning Tests',
          formId: 1,
          paymentMethodId: 1,
          cronExpression: '0 0 9 * * *',
          isActive: true,
          icon: 'Sun',
          createdAt: new Date()
        },
        {
          id: 2,
          name: 'Evening Tests',
          formId: 2,
          paymentMethodId: 2,
          cronExpression: '0 0 18 * * *',
          isActive: false,
          icon: 'Moon',
          lastRun: new Date(),
          createdAt: new Date()
        }
      ];

      const exportData: ExportData = {
        version: '1.0.4',
        exportedAt: new Date().toISOString(),
        schemaVersion: 1,
        data: {
          forms: [],
          paymentMethods: [],
          testRuns: [],
          testSchedules: schedules,
          settings: []
        }
      };

      expect(exportData.data.testSchedules).toHaveLength(2);
      expect(exportData.data.testSchedules![0].name).toBe('Morning Tests');
      expect(exportData.data.testSchedules![1].name).toBe('Evening Tests');
    });

    it('should handle import options with all combinations', () => {
      const allOptionsEnabled: ImportOptions = {
        includeForms: true,
        includePaymentMethods: true,
        includeTestRuns: true,
        includeSchedules: true,
        includeSettings: true
      };

      const onlySchedules: ImportOptions = {
        includeForms: false,
        includePaymentMethods: false,
        includeTestRuns: false,
        includeSchedules: true,
        includeSettings: false
      };

      const noSchedules: ImportOptions = {
        includeForms: true,
        includePaymentMethods: true,
        includeTestRuns: true,
        includeSchedules: false,
        includeSettings: true
      };

      expect(allOptionsEnabled.includeSchedules).toBe(true);
      expect(onlySchedules.includeSchedules).toBe(true);
      expect(noSchedules.includeSchedules).toBe(false);
    });

    it('should handle import results with schedule statistics', () => {
      const successResult: ImportResult = {
        success: true,
        imported: { forms: 2, paymentMethods: 1, testRuns: 0, schedules: 3, settings: 1 },
        skipped: { forms: 0, paymentMethods: 0, testRuns: 0, schedules: 1, settings: 0 },
        errors: [],
        warnings: ['Updated schedule "Daily Tests"', 'Skipped duplicate schedule "Weekly Report"']
      };

      const failureResult: ImportResult = {
        success: false,
        imported: { forms: 0, paymentMethods: 0, testRuns: 0, schedules: 0, settings: 0 },
        skipped: { forms: 0, paymentMethods: 0, testRuns: 0, schedules: 0, settings: 0 },
        errors: ['Failed to import schedule "Invalid Schedule": Invalid cron expression'],
        warnings: []
      };

      expect(successResult.imported.schedules).toBe(3);
      expect(successResult.skipped.schedules).toBe(1);
      expect(failureResult.errors[0]).toContain('Invalid cron expression');
    });
  });

  describe('UI Integration Compatibility', () => {
    it('should support Settings page checkbox state', () => {
      const exportOptions: ImportOptions = {
        includeForms: true,
        includePaymentMethods: true,
        includeTestRuns: true,
        includeSchedules: true,
        includeSettings: true
      };

      // Simulate checkbox toggle
      const updatedOptions = { ...exportOptions, includeSchedules: false };
      expect(updatedOptions.includeSchedules).toBe(false);
      expect(updatedOptions.includeForms).toBe(true); // Other options unchanged
    });

    it('should support button validation logic', () => {
      const allDisabled: ImportOptions = {
        includeForms: false,
        includePaymentMethods: false,
        includeTestRuns: false,
        includeSchedules: false,
        includeSettings: false
      };

      const onlySchedulesEnabled: ImportOptions = {
        includeForms: false,
        includePaymentMethods: false,
        includeTestRuns: false,
        includeSchedules: true,
        includeSettings: false
      };

      // Button should be disabled when all options are false
      const shouldDisableButton = (options: ImportOptions) => 
        !options.includeForms && 
        !options.includePaymentMethods && 
        !options.includeTestRuns && 
        !options.includeSchedules && 
        !options.includeSettings;

      expect(shouldDisableButton(allDisabled)).toBe(true);
      expect(shouldDisableButton(onlySchedulesEnabled)).toBe(false);
    });

    it('should support result display formatting', () => {
      const result: ImportResult = {
        success: true,
        imported: { forms: 2, paymentMethods: 1, testRuns: 5, schedules: 3, settings: 1 },
        skipped: { forms: 1, paymentMethods: 0, testRuns: 2, schedules: 1, settings: 0 },
        errors: [],
        warnings: ['Updated schedule "Morning Tests"']
      };

      // Simulate UI display logic
      const hasImportedSchedules = result.imported.schedules > 0;
      const hasSkippedSchedules = result.skipped.schedules > 0;
      const scheduleWarnings = result.warnings.filter(w => w.includes('schedule'));

      expect(hasImportedSchedules).toBe(true);
      expect(hasSkippedSchedules).toBe(true);
      expect(scheduleWarnings).toHaveLength(1);
      expect(scheduleWarnings[0]).toContain('Morning Tests');
    });
  });
});
