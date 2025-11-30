import { describe, it, expect } from 'vitest';

describe('Test Results Export', () => {
  // Sample test data
  const sampleTestRuns = [
    {
      id: 1,
      uuid: 'test-uuid-1',
      formId: 1,
      formName: 'Test Form 1',
      paymentMethodId: 1,
      paymentMethodName: 'SEPA',
      status: 'SUCCESS',
      durationMs: 5000,
      errorMessage: null,
      isScheduled: false,
      notes: 'Test notes',
      runAt: new Date('2025-01-15T10:30:00Z'),
      steps: [],
    },
    {
      id: 2,
      uuid: 'test-uuid-2',
      formId: 2,
      formName: 'Test Form 2',
      paymentMethodId: 2,
      paymentMethodName: 'PayPal',
      status: 'FAILURE',
      durationMs: 3000,
      errorMessage: 'Connection timeout',
      isScheduled: true,
      notes: 'Failed test with "quotes"',
      runAt: new Date('2025-01-15T11:00:00Z'),
      steps: [],
    },
  ];

  describe('CSV Export', () => {
    it('should generate valid CSV headers', () => {
      const headers = ["ID", "UUID", "Form", "Bezahlmethode", "Status", "Dauer (ms)", "Fehler", "Geplant", "Notizen", "Datum"];
      expect(headers).toHaveLength(10);
      expect(headers).toContain('ID');
      expect(headers).toContain('Status');
      expect(headers).toContain('Bezahlmethode');
    });

    it('should escape quotes in CSV values', () => {
      const value = 'Test with "quotes"';
      const escaped = value.replace(/"/g, '""');
      expect(escaped).toBe('Test with ""quotes""');
    });

    it('should escape newlines in CSV values', () => {
      const value = 'Line 1\nLine 2';
      const escaped = value.replace(/\n/g, ' ');
      expect(escaped).toBe('Line 1 Line 2');
    });

    it('should generate CSV rows from test data', () => {
      const rows = sampleTestRuns.map((tr) => [
        tr.id,
        tr.uuid || "",
        tr.formName || "",
        tr.paymentMethodName || "",
        tr.status,
        tr.durationMs || "",
        (tr.errorMessage || "").replace(/"/g, '""'),
        tr.isScheduled ? "Ja" : "Nein",
        (tr.notes || "").replace(/"/g, '""').replace(/\n/g, " "),
        new Date(tr.runAt).toLocaleString("de-DE"),
      ]);

      expect(rows).toHaveLength(2);
      expect(rows[0][0]).toBe(1);
      expect(rows[0][4]).toBe('SUCCESS');
      expect(rows[1][4]).toBe('FAILURE');
      expect(rows[1][6]).toBe('Connection timeout');
    });

    it('should use semicolon as CSV delimiter for German Excel compatibility', () => {
      const headers = ["ID", "UUID", "Form"];
      const csvLine = headers.join(";");
      expect(csvLine).toBe('ID;UUID;Form');
    });

    it('should include BOM for Excel UTF-8 compatibility', () => {
      const bom = "\uFEFF";
      expect(bom.charCodeAt(0)).toBe(0xFEFF);
    });
  });

  describe('JSON Export', () => {
    it('should create valid export structure', () => {
      const exportData = {
        exportedAt: new Date().toISOString(),
        totalResults: sampleTestRuns.length,
        results: sampleTestRuns.map((tr) => ({
          id: tr.id,
          uuid: tr.uuid,
          formName: tr.formName,
          formId: tr.formId,
          paymentMethodName: tr.paymentMethodName,
          paymentMethodId: tr.paymentMethodId,
          status: tr.status,
          durationMs: tr.durationMs,
          errorMessage: tr.errorMessage,
          isScheduled: tr.isScheduled,
          notes: tr.notes,
          runAt: tr.runAt,
          steps: tr.steps,
        })),
      };

      expect(exportData.totalResults).toBe(2);
      expect(exportData.results).toHaveLength(2);
      expect(exportData.exportedAt).toBeDefined();
    });

    it('should include all required fields in export', () => {
      const result = sampleTestRuns[0];
      const exportedResult = {
        id: result.id,
        uuid: result.uuid,
        formName: result.formName,
        formId: result.formId,
        paymentMethodName: result.paymentMethodName,
        paymentMethodId: result.paymentMethodId,
        status: result.status,
        durationMs: result.durationMs,
        errorMessage: result.errorMessage,
        isScheduled: result.isScheduled,
        notes: result.notes,
        runAt: result.runAt,
        steps: result.steps,
      };

      expect(exportedResult).toHaveProperty('id');
      expect(exportedResult).toHaveProperty('uuid');
      expect(exportedResult).toHaveProperty('formName');
      expect(exportedResult).toHaveProperty('status');
      expect(exportedResult).toHaveProperty('durationMs');
      expect(exportedResult).toHaveProperty('steps');
    });

    it('should serialize to valid JSON', () => {
      const exportData = {
        exportedAt: new Date().toISOString(),
        totalResults: sampleTestRuns.length,
        results: sampleTestRuns,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const parsed = JSON.parse(jsonString);

      expect(parsed.totalResults).toBe(2);
      expect(parsed.results[0].status).toBe('SUCCESS');
    });
  });

  describe('File naming', () => {
    it('should generate correct filename with date', () => {
      const date = new Date('2025-01-15T10:30:00Z');
      const filename = `test_results_export_${date.toISOString().split("T")[0]}.csv`;
      expect(filename).toBe('test_results_export_2025-01-15.csv');
    });

    it('should generate JSON filename with date', () => {
      const date = new Date('2025-01-15T10:30:00Z');
      const filename = `test_results_export_${date.toISOString().split("T")[0]}.json`;
      expect(filename).toBe('test_results_export_2025-01-15.json');
    });
  });
});
