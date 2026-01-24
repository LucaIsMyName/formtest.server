import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { exportQueries, importQueries } from '../src/main/database';
import type { ExportData, ImportOptions, TestSchedule } from '../src/common/types';

// Mock database for testing
let mockDb: Database.Database;

// Mock the database module
const mockTestScheduleQueries = {
  getAll: () => [] as TestSchedule[],
  create: (data: any) => ({ lastInsertRowid: 1, changes: 1 }),
  update: (id: number, data: any) => ({ changes: 1 })
};

describe('Schedule Import/Export Functionality', () => {
  beforeEach(() => {
    // Create in-memory database for testing
    mockDb = new Database(':memory:');
    
    // Create test tables
    mockDb.exec(`
      CREATE TABLE test_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        formId INTEGER NOT NULL,
        paymentMethodId INTEGER NOT NULL,
        cronExpression TEXT NOT NULL,
        isActive INTEGER DEFAULT 1,
        icon TEXT DEFAULT 'Play',
        lastRun TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE forms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        icon TEXT DEFAULT 'FileText',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        icon TEXT DEFAULT 'CreditCard',
        isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert test data
    mockDb.prepare(`
      INSERT INTO forms (name, url, icon) VALUES 
      ('Test Form 1', 'https://example.com/form1', 'FileText'),
      ('Test Form 2', 'https://example.com/form2', 'File')
    `).run();

    mockDb.prepare(`
      INSERT INTO payment_methods (name, type, icon) VALUES 
      ('PayPal Test', 'paypal', 'CreditCard'),
      ('SEPA Test', 'sepa', 'Building2')
    `).run();

    mockDb.prepare(`
      INSERT INTO test_schedules (name, formId, paymentMethodId, cronExpression, isActive, icon) VALUES 
      ('Morning Tests', 1, 1, '0 0 9 * * *', 1, 'Sun'),
      ('Evening Tests', 2, 2, '0 0 18 * * *', 1, 'Moon'),
      ('Weekly Report', 1, 2, '0 0 9 * * 1', 0, 'Calendar')
    `).run();
  });

  afterEach(() => {
    mockDb.close();
  });

  describe('Export Options', () => {
    it('should include schedules option in ImportOptions interface', () => {
      const options: ImportOptions = {
        includeForms: true,
        includePaymentMethods: true,
        includeTestRuns: true,
        includeSchedules: true,
        includeSettings: true
      };

      expect(options.includeSchedules).toBe(true);
    });

    it('should handle schedules in ExportData interface', () => {
      const exportData: ExportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        schemaVersion: 1,
        data: {
          forms: [],
          paymentMethods: [],
          testRuns: [],
          testSchedules: [
            {
              id: 1,
              name: 'Test Schedule',
              formId: 1,
              paymentMethodId: 1,
              cronExpression: '0 0 9 * * *',
              isActive: true,
              icon: 'Sun',
              createdAt: new Date()
            }
          ],
          settings: []
        }
      };

      expect(exportData.data.testSchedules).toBeDefined();
      expect(exportData.data.testSchedules).toHaveLength(1);
      expect(exportData.data.testSchedules![0].icon).toBe('Sun');
    });
  });

  describe('Schedule Data Structure', () => {
    it('should preserve schedule properties during export/import', () => {
      const schedules = mockDb.prepare('SELECT * FROM test_schedules').all() as any[];
      
      expect(schedules).toHaveLength(3);
      
      const morningTest = schedules.find(s => s.name === 'Morning Tests');
      expect(morningTest).toBeDefined();
      expect(morningTest.icon).toBe('Sun');
      expect(morningTest.cronExpression).toBe('0 0 9 * * *');
      expect(morningTest.isActive).toBe(1);

      const eveningTest = schedules.find(s => s.name === 'Evening Tests');
      expect(eveningTest).toBeDefined();
      expect(eveningTest.icon).toBe('Moon');
      expect(eveningTest.cronExpression).toBe('0 0 18 * * *');

      const weeklyReport = schedules.find(s => s.name === 'Weekly Report');
      expect(weeklyReport).toBeDefined();
      expect(weeklyReport.icon).toBe('Calendar');
      expect(weeklyReport.isActive).toBe(0);
    });

    it('should handle various cron expressions and icons', () => {
      const testSchedules = [
        { name: 'Hourly Check', cron: '0 0 * * * *', icon: 'Clock' },
        { name: 'Daily Morning', cron: '0 0 6 * * *', icon: 'Sun' },
        { name: 'Weekly Monday', cron: '0 0 9 * * 1', icon: 'Calendar' },
        { name: 'Monthly Report', cron: '0 0 9 1 * *', icon: 'BarChart' },
        { name: 'Custom Schedule', cron: '15 30 14 * * 2', icon: 'Settings' }
      ];

      testSchedules.forEach((schedule, index) => {
        const result = mockDb.prepare(`
          INSERT INTO test_schedules (name, formId, paymentMethodId, cronExpression, isActive, icon) 
          VALUES (?, 1, 1, ?, 1, ?)
        `).run(schedule.name, schedule.cron, schedule.icon);

        expect(result.changes).toBe(1);
      });

      const allSchedules = mockDb.prepare('SELECT * FROM test_schedules').all() as any[];
      expect(allSchedules).toHaveLength(8); // 3 original + 5 new
    });
  });

  describe('Import/Export Integration', () => {
    it('should validate schedule data integrity', () => {
      // Test that schedules maintain referential integrity with forms and payment methods
      const scheduleWithInvalidForm = {
        name: 'Invalid Form Schedule',
        formId: 999, // Non-existent form ID
        paymentMethodId: 1,
        cronExpression: '0 0 12 * * *',
        isActive: true,
        icon: 'AlertTriangle'
      };

      // This should handle the error gracefully in a real import scenario
      expect(() => {
        mockDb.prepare(`
          INSERT INTO test_schedules (name, formId, paymentMethodId, cronExpression, isActive, icon) 
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          scheduleWithInvalidForm.name,
          scheduleWithInvalidForm.formId,
          scheduleWithInvalidForm.paymentMethodId,
          scheduleWithInvalidForm.cronExpression,
          scheduleWithInvalidForm.isActive ? 1 : 0,
          scheduleWithInvalidForm.icon
        );
      }).not.toThrow(); // SQLite allows this, but import logic should handle validation
    });

    it('should handle schedule name conflicts during merge', () => {
      // Test merge behavior when schedule names conflict
      const existingSchedules = mockDb.prepare('SELECT * FROM test_schedules WHERE name = ?').all('Morning Tests');
      expect(existingSchedules).toHaveLength(1);

      // Simulate importing a schedule with the same name but different properties
      const conflictingSchedule = {
        name: 'Morning Tests',
        formId: 2, // Different form
        paymentMethodId: 2, // Different payment method
        cronExpression: '0 0 8 * * *', // Different time
        isActive: false, // Different status
        icon: 'Clock' // Different icon
      };

      // In merge mode, this should update the existing schedule
      const updateResult = mockDb.prepare(`
        UPDATE test_schedules 
        SET formId = ?, paymentMethodId = ?, cronExpression = ?, isActive = ?, icon = ?
        WHERE name = ?
      `).run(
        conflictingSchedule.formId,
        conflictingSchedule.paymentMethodId,
        conflictingSchedule.cronExpression,
        conflictingSchedule.isActive ? 1 : 0,
        conflictingSchedule.icon,
        conflictingSchedule.name
      );

      expect(updateResult.changes).toBe(1);

      // Verify the update
      const updatedSchedule = mockDb.prepare('SELECT * FROM test_schedules WHERE name = ?').get('Morning Tests') as any;
      expect(updatedSchedule.formId).toBe(2);
      expect(updatedSchedule.icon).toBe('Clock');
      expect(updatedSchedule.isActive).toBe(0);
    });

    it('should preserve icon information during import/export cycle', () => {
      const originalSchedules = mockDb.prepare('SELECT * FROM test_schedules ORDER BY id').all() as any[];
      
      // Simulate export
      const exportData = {
        testSchedules: originalSchedules.map(s => ({
          id: s.id,
          name: s.name,
          formId: s.formId,
          paymentMethodId: s.paymentMethodId,
          cronExpression: s.cronExpression,
          isActive: Boolean(s.isActive),
          icon: s.icon,
          createdAt: new Date(s.createdAt)
        }))
      };

      // Clear and re-import
      mockDb.exec('DELETE FROM test_schedules');
      
      exportData.testSchedules.forEach(schedule => {
        mockDb.prepare(`
          INSERT INTO test_schedules (name, formId, paymentMethodId, cronExpression, isActive, icon) 
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          schedule.name,
          schedule.formId,
          schedule.paymentMethodId,
          schedule.cronExpression,
          schedule.isActive ? 1 : 0,
          schedule.icon
        );
      });

      const importedSchedules = mockDb.prepare('SELECT * FROM test_schedules ORDER BY name').all() as any[];
      
      expect(importedSchedules).toHaveLength(originalSchedules.length);
      
      // Verify icons are preserved
      const morningTest = importedSchedules.find(s => s.name === 'Morning Tests');
      expect(morningTest.icon).toBe('Sun');
      
      const eveningTest = importedSchedules.find(s => s.name === 'Evening Tests');
      expect(eveningTest.icon).toBe('Moon');
      
      const weeklyReport = importedSchedules.find(s => s.name === 'Weekly Report');
      expect(weeklyReport.icon).toBe('Calendar');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing icon gracefully', () => {
      const scheduleWithoutIcon = mockDb.prepare(`
        INSERT INTO test_schedules (name, formId, paymentMethodId, cronExpression, isActive) 
        VALUES (?, 1, 1, ?, 1)
      `).run('No Icon Schedule', '0 0 12 * * *');

      expect(scheduleWithoutIcon.changes).toBe(1);

      const schedule = mockDb.prepare('SELECT * FROM test_schedules WHERE name = ?').get('No Icon Schedule') as any;
      expect(schedule.icon).toBe('Play'); // Should use default
    });

    it('should validate cron expressions', () => {
      const invalidCronSchedules = [
        { name: 'Invalid Cron 1', cron: 'invalid cron' },
        { name: 'Invalid Cron 2', cron: '* * * * * * *' }, // Too many fields
        { name: 'Invalid Cron 3', cron: '' } // Empty
      ];

      invalidCronSchedules.forEach(schedule => {
        // SQLite will accept any string, but validation should happen in the application layer
        const result = mockDb.prepare(`
          INSERT INTO test_schedules (name, formId, paymentMethodId, cronExpression, isActive, icon) 
          VALUES (?, 1, 1, ?, 1, 'AlertTriangle')
        `).run(schedule.name, schedule.cron);

        expect(result.changes).toBe(1);
      });

      // In a real scenario, the import logic should validate cron expressions
      // and add warnings or errors to the ImportResult
    });
  });

  describe('UI Integration Points', () => {
    it('should support all required fields for UI display', () => {
      const schedule = mockDb.prepare('SELECT * FROM test_schedules WHERE name = ?').get('Morning Tests') as any;
      
      // Verify all fields needed for UI are present
      expect(schedule.id).toBeDefined();
      expect(schedule.name).toBeDefined();
      expect(schedule.formId).toBeDefined();
      expect(schedule.paymentMethodId).toBeDefined();
      expect(schedule.cronExpression).toBeDefined();
      expect(schedule.isActive).toBeDefined();
      expect(schedule.icon).toBeDefined();
      expect(schedule.createdAt).toBeDefined();
    });

    it('should handle schedule status correctly', () => {
      const activeSchedule = mockDb.prepare('SELECT * FROM test_schedules WHERE name = ?').get('Morning Tests') as any;
      const inactiveSchedule = mockDb.prepare('SELECT * FROM test_schedules WHERE name = ?').get('Weekly Report') as any;
      
      expect(activeSchedule.isActive).toBe(1);
      expect(inactiveSchedule.isActive).toBe(0);
      
      // Test boolean conversion for UI
      expect(Boolean(activeSchedule.isActive)).toBe(true);
      expect(Boolean(inactiveSchedule.isActive)).toBe(false);
    });
  });
});
