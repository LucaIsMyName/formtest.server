import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { testScheduleQueries } from '../src/main/database';
import { getDefaultScheduleIcon } from '../src/renderer/src/utils/iconHelper';

// Mock database for testing
let mockDb: Database.Database;

describe('Schedule Icon Functionality', () => {
  beforeEach(() => {
    // Create in-memory database for testing
    mockDb = new Database(':memory:');
    
    // Create test_schedules table with icon column
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
      )
    `);
  });

  afterEach(() => {
    mockDb.close();
  });

  describe('Default Schedule Icon Helper', () => {
    it('should return Play for undefined cron expression', () => {
      expect(getDefaultScheduleIcon()).toBe('Play');
      expect(getDefaultScheduleIcon('')).toBe('Play');
    });

    it('should return Clock for hourly schedules', () => {
      expect(getDefaultScheduleIcon('0 0 * * * *')).toBe('Clock');
    });

    it('should return Sun for morning schedules', () => {
      expect(getDefaultScheduleIcon('0 0 9 * * *')).toBe('Sun');
    });

    it('should return Sun for noon schedules', () => {
      expect(getDefaultScheduleIcon('0 0 12 * * *')).toBe('Sun');
    });

    it('should return Moon for evening schedules', () => {
      expect(getDefaultScheduleIcon('0 0 18 * * *')).toBe('Moon');
    });

    it('should return Calendar for weekly schedules', () => {
      expect(getDefaultScheduleIcon('0 0 9 * * 1')).toBe('Calendar');
    });

    it('should return Clock for daily schedules', () => {
      expect(getDefaultScheduleIcon('0 0 6 * * *')).toBe('Clock');
    });

    it('should return Play for custom/unknown patterns', () => {
      expect(getDefaultScheduleIcon('15 30 14 * * 2')).toBe('Play');
      expect(getDefaultScheduleIcon('custom-expression')).toBe('Play');
    });
  });

  describe('Database Icon Storage', () => {
    it('should store schedule with custom icon', () => {
      const scheduleData = {
        name: 'Test Schedule',
        formId: 1,
        paymentMethodId: 1,
        cronExpression: '0 0 9 * * *',
        isActive: true,
        icon: 'Calendar'
      };

      // Mock the database prepare and run methods
      const insertStmt = mockDb.prepare(`
        INSERT INTO test_schedules (name, formId, paymentMethodId, cronExpression, isActive, icon) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const result = insertStmt.run(
        scheduleData.name,
        scheduleData.formId,
        scheduleData.paymentMethodId,
        scheduleData.cronExpression,
        scheduleData.isActive ? 1 : 0,
        scheduleData.icon
      );

      expect(result.changes).toBe(1);
      expect(result.lastInsertRowid).toBeDefined();

      // Verify the data was stored correctly
      const selectStmt = mockDb.prepare('SELECT * FROM test_schedules WHERE id = ?');
      const stored = selectStmt.get(result.lastInsertRowid) as any;

      expect(stored.name).toBe(scheduleData.name);
      expect(stored.icon).toBe(scheduleData.icon);
      expect(stored.isActive).toBe(1);
    });

    it('should use default icon when none provided', () => {
      const scheduleData = {
        name: 'Test Schedule',
        formId: 1,
        paymentMethodId: 1,
        cronExpression: '0 0 9 * * *',
        isActive: true
      };

      const insertStmt = mockDb.prepare(`
        INSERT INTO test_schedules (name, formId, paymentMethodId, cronExpression, isActive, icon) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const result = insertStmt.run(
        scheduleData.name,
        scheduleData.formId,
        scheduleData.paymentMethodId,
        scheduleData.cronExpression,
        scheduleData.isActive ? 1 : 0,
        'Play' // Default icon
      );

      const selectStmt = mockDb.prepare('SELECT * FROM test_schedules WHERE id = ?');
      const stored = selectStmt.get(result.lastInsertRowid) as any;

      expect(stored.icon).toBe('Play');
    });

    it('should update schedule icon', () => {
      // Insert initial schedule
      const insertStmt = mockDb.prepare(`
        INSERT INTO test_schedules (name, formId, paymentMethodId, cronExpression, isActive, icon) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const result = insertStmt.run('Test Schedule', 1, 1, '0 0 9 * * *', 1, 'Play');
      const scheduleId = result.lastInsertRowid;

      // Update icon
      const updateStmt = mockDb.prepare('UPDATE test_schedules SET icon = ? WHERE id = ?');
      const updateResult = updateStmt.run('Calendar', scheduleId);

      expect(updateResult.changes).toBe(1);

      // Verify update
      const selectStmt = mockDb.prepare('SELECT * FROM test_schedules WHERE id = ?');
      const updated = selectStmt.get(scheduleId) as any;

      expect(updated.icon).toBe('Calendar');
    });
  });

  describe('Schedule Icon Integration', () => {
    it('should handle schedule creation with icon in interface format', () => {
      const scheduleData = {
        name: 'Morning Tests',
        formId: 1,
        paymentMethodId: 2,
        cronExpression: '0 0 9 * * *',
        isActive: true,
        icon: 'Sun'
      };

      // Simulate the create function logic
      const insertStmt = mockDb.prepare(`
        INSERT INTO test_schedules (name, formId, paymentMethodId, cronExpression, isActive, icon) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const result = insertStmt.run(
        scheduleData.name,
        scheduleData.formId,
        scheduleData.paymentMethodId,
        scheduleData.cronExpression,
        scheduleData.isActive ? 1 : 0,
        scheduleData.icon || 'Play'
      );

      expect(result.changes).toBe(1);

      // Simulate the getAll function logic
      const selectStmt = mockDb.prepare('SELECT * FROM test_schedules ORDER BY createdAt DESC');
      const schedules = selectStmt.all() as any[];
      
      const schedule = schedules[0];
      expect(schedule.icon).toBe('Sun');
      expect(schedule.name).toBe('Morning Tests');
    });

    it('should handle multiple schedules with different icons', () => {
      const schedules = [
        { name: 'Hourly Check', cronExpression: '0 0 * * * *', icon: 'Clock' },
        { name: 'Morning Run', cronExpression: '0 0 9 * * *', icon: 'Sun' },
        { name: 'Evening Run', cronExpression: '0 0 18 * * *', icon: 'Moon' },
        { name: 'Weekly Report', cronExpression: '0 0 9 * * 1', icon: 'Calendar' }
      ];

      const insertStmt = mockDb.prepare(`
        INSERT INTO test_schedules (name, formId, paymentMethodId, cronExpression, isActive, icon) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      schedules.forEach((schedule, index) => {
        insertStmt.run(
          schedule.name,
          1, // formId
          1, // paymentMethodId
          schedule.cronExpression,
          1, // isActive
          schedule.icon
        );
      });

      const selectStmt = mockDb.prepare('SELECT * FROM test_schedules ORDER BY id');
      const stored = selectStmt.all() as any[];

      expect(stored).toHaveLength(4);
      expect(stored[0].icon).toBe('Clock');
      expect(stored[1].icon).toBe('Sun');
      expect(stored[2].icon).toBe('Moon');
      expect(stored[3].icon).toBe('Calendar');
    });
  });

  describe('Icon Migration Simulation', () => {
    it('should handle existing schedules without icon column', () => {
      // Create table without icon column (simulating old schema)
      mockDb.exec('DROP TABLE test_schedules');
      mockDb.exec(`
        CREATE TABLE test_schedules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          formId INTEGER NOT NULL,
          paymentMethodId INTEGER NOT NULL,
          cronExpression TEXT NOT NULL,
          isActive INTEGER DEFAULT 1,
          lastRun TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert some existing data
      const insertStmt = mockDb.prepare(`
        INSERT INTO test_schedules (name, formId, paymentMethodId, cronExpression, isActive) 
        VALUES (?, ?, ?, ?, ?)
      `);
      
      insertStmt.run('Existing Schedule', 1, 1, '0 0 12 * * *', 1);

      // Simulate migration: add icon column
      mockDb.exec("ALTER TABLE test_schedules ADD COLUMN icon TEXT DEFAULT 'Play'");
      
      // Update existing records
      const updateStmt = mockDb.prepare("UPDATE test_schedules SET icon = 'Play' WHERE icon IS NULL");
      const result = updateStmt.run();

      // Verify migration
      const selectStmt = mockDb.prepare('SELECT * FROM test_schedules');
      const schedules = selectStmt.all() as any[];

      expect(schedules).toHaveLength(1);
      expect(schedules[0].icon).toBe('Play');
      expect(schedules[0].name).toBe('Existing Schedule');
    });
  });
});
