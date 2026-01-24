import { describe, it, expect } from 'vitest';

// Mock schedule data for testing
interface MockSchedule {
  id: number;
  name: string;
  formId: number;
  paymentMethodId: number;
  cronExpression: string;
  isActive: boolean;
  lastRun: string | null;
  formName: string;
  paymentMethodName: string;
  configuration: string;
}

const mockSchedules: MockSchedule[] = [
  {
    id: 1,
    name: "Daily SEPA Test",
    formId: 1,
    paymentMethodId: 1,
    cronExpression: "0 0 * * *",
    isActive: true,
    lastRun: "2025-11-29T10:00:00Z",
    formName: "Online Form",
    paymentMethodName: "SEPA",
    configuration: "Online Form × SEPA",
  },
  {
    id: 2,
    name: "Weekly PayPal Check",
    formId: 2,
    paymentMethodId: 2,
    cronExpression: "0 0 * * 0",
    isActive: false,
    lastRun: "2025-11-22T10:00:00Z",
    formName: "Donation Form",
    paymentMethodName: "PayPal",
    configuration: "Donation Form × PayPal",
  },
  {
    id: 3,
    name: "Monthly Credit Card",
    formId: 1,
    paymentMethodId: 3,
    cronExpression: "0 0 1 * *",
    isActive: true,
    lastRun: null,
    formName: "Online Form",
    paymentMethodName: "Credit Card",
    configuration: "Online Form × Credit Card",
  },
];

describe('Schedules Filtering', () => {
  describe('Search filtering', () => {
    it('should filter by name', () => {
      const searchTerm = "daily";
      const filtered = mockSchedules.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe("Daily SEPA Test");
    });

    it('should filter by configuration', () => {
      const searchTerm = "paypal";
      const filtered = mockSchedules.filter((s) =>
        s.configuration.toLowerCase().includes(searchTerm.toLowerCase())
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe("Weekly PayPal Check");
    });

    it('should filter by cron expression', () => {
      const searchTerm = "0 0 1";
      const filtered = mockSchedules.filter((s) =>
        s.cronExpression.toLowerCase().includes(searchTerm.toLowerCase())
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe("Monthly Credit Card");
    });

    it('should return all when search is empty', () => {
      const searchTerm = "";
      const filtered = searchTerm
        ? mockSchedules.filter((s) =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : mockSchedules;
      expect(filtered).toHaveLength(3);
    });
  });

  describe('Status filtering', () => {
    it('should filter active schedules', () => {
      const filtered = mockSchedules.filter((s) => s.isActive === true);
      expect(filtered).toHaveLength(2);
      expect(filtered.map((s) => s.name)).toContain("Daily SEPA Test");
      expect(filtered.map((s) => s.name)).toContain("Monthly Credit Card");
    });

    it('should filter inactive schedules', () => {
      const filtered = mockSchedules.filter((s) => s.isActive === false);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe("Weekly PayPal Check");
    });
  });

  describe('Sorting', () => {
    it('should sort by name ascending', () => {
      const sorted = [...mockSchedules].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      expect(sorted[0].name).toBe("Daily SEPA Test");
      expect(sorted[1].name).toBe("Monthly Credit Card");
      expect(sorted[2].name).toBe("Weekly PayPal Check");
    });

    it('should sort by name descending', () => {
      const sorted = [...mockSchedules].sort((a, b) =>
        b.name.localeCompare(a.name)
      );
      expect(sorted[0].name).toBe("Weekly PayPal Check");
      expect(sorted[1].name).toBe("Monthly Credit Card");
      expect(sorted[2].name).toBe("Daily SEPA Test");
    });

    it('should sort by isActive (active first)', () => {
      const sorted = [...mockSchedules].sort((a, b) => {
        if (a.isActive === b.isActive) return 0;
        return a.isActive ? -1 : 1;
      });
      expect(sorted[0].isActive).toBe(true);
      expect(sorted[1].isActive).toBe(true);
      expect(sorted[2].isActive).toBe(false);
    });

    it('should sort by lastRun with nulls last', () => {
      const sorted = [...mockSchedules].sort((a, b) => {
        if (a.lastRun === null && b.lastRun === null) return 0;
        if (a.lastRun === null) return 1;
        if (b.lastRun === null) return -1;
        return new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime();
      });
      expect(sorted[0].name).toBe("Daily SEPA Test"); // Most recent
      expect(sorted[1].name).toBe("Weekly PayPal Check");
      expect(sorted[2].name).toBe("Monthly Credit Card"); // null lastRun
    });

    it('should sort by cronExpression', () => {
      const sorted = [...mockSchedules].sort((a, b) =>
        a.cronExpression.localeCompare(b.cronExpression)
      );
      expect(sorted[0].cronExpression).toBe("0 0 * * *");
      expect(sorted[1].cronExpression).toBe("0 0 * * 0");
      expect(sorted[2].cronExpression).toBe("0 0 1 * *");
    });
  });

  describe('Combined filtering and sorting', () => {
    it('should filter active and sort by name', () => {
      const filtered = mockSchedules.filter((s) => s.isActive === true);
      const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      expect(sorted).toHaveLength(2);
      expect(sorted[0].name).toBe("Daily SEPA Test");
      expect(sorted[1].name).toBe("Monthly Credit Card");
    });

    it('should search and sort results', () => {
      const searchTerm = "form";
      const filtered = mockSchedules.filter((s) =>
        s.configuration.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      expect(sorted).toHaveLength(3); // All have "Form" in configuration
    });
  });
});
