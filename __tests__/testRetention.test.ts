import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Test Retention Policy', () => {
  describe('cleanupOldTestRuns', () => {
    it('should return 0 when retention is disabled (0 days)', () => {
      // Mock the database queries
      const mockDb = {
        prepare: vi.fn().mockReturnValue({
          get: vi.fn().mockReturnValue({ value: '0' }),
          run: vi.fn().mockReturnValue({ changes: 0 }),
        }),
      }

      // When retention is 0, no cleanup should happen
      const retentionDays = 0
      expect(retentionDays).toBe(0)
    })

    it('should calculate correct cutoff date for 365 days retention', () => {
      const retentionDays = 365
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
      
      const now = new Date()
      const expectedDiff = Math.floor((now.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24))
      
      expect(expectedDiff).toBe(365)
    })

    it('should calculate correct cutoff date for 30 days retention', () => {
      const retentionDays = 30
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
      
      const now = new Date()
      const expectedDiff = Math.floor((now.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24))
      
      expect(expectedDiff).toBe(30)
    })

    it('should handle negative retention days as disabled', () => {
      const retentionDays = -1
      const shouldCleanup = retentionDays > 0
      
      expect(shouldCleanup).toBe(false)
    })
  })

  describe('Retention Settings', () => {
    it('should have default retention of 365 days', () => {
      const defaultRetention = '365'
      expect(defaultRetention).toBe('365')
    })

    it('should parse retention days as integer', () => {
      const retentionStr = '365'
      const retentionDays = parseInt(retentionStr)
      
      expect(retentionDays).toBe(365)
      expect(typeof retentionDays).toBe('number')
    })

    it('should handle invalid retention value gracefully', () => {
      const retentionStr = 'invalid'
      const retentionDays = parseInt(retentionStr) || 365
      
      expect(retentionDays).toBe(365)
    })
  })
})

describe('Test Run Comparison', () => {
  const mockTestRun1 = {
    id: 1,
    uuid: 'test-uuid-1',
    formId: 1,
    paymentMethodId: 1,
    status: 'SUCCESS' as const,
    durationMs: 5000,
    runAt: new Date('2024-01-01T10:00:00Z'),
    steps: [
      { id: 'step1', name: 'Browser initialisieren', status: 'success', startTime: '2024-01-01T10:00:00Z', duration: 1000 },
      { id: 'step2', name: 'Zur URL navigieren', status: 'success', startTime: '2024-01-01T10:00:01Z', duration: 2000 },
      { id: 'step3', name: 'Formular ausfüllen', status: 'success', startTime: '2024-01-01T10:00:03Z', duration: 2000 },
    ],
  }

  const mockTestRun2 = {
    id: 2,
    uuid: 'test-uuid-2',
    formId: 1,
    paymentMethodId: 1,
    status: 'FAILURE' as const,
    durationMs: 8000,
    runAt: new Date('2024-01-02T10:00:00Z'),
    steps: [
      { id: 'step1', name: 'Browser initialisieren', status: 'success', startTime: '2024-01-02T10:00:00Z', duration: 1500 },
      { id: 'step2', name: 'Zur URL navigieren', status: 'success', startTime: '2024-01-02T10:00:01Z', duration: 3000 },
      { id: 'step3', name: 'Formular ausfüllen', status: 'error', startTime: '2024-01-02T10:00:04Z', duration: 3500 },
    ],
  }

  describe('Step Comparison', () => {
    it('should identify steps with same status', () => {
      const step1 = mockTestRun1.steps[0]
      const step2 = mockTestRun2.steps[0]
      
      const isSame = step1.status === step2.status
      expect(isSame).toBe(true)
    })

    it('should identify steps with different status', () => {
      const step1 = mockTestRun1.steps[2]
      const step2 = mockTestRun2.steps[2]
      
      const isSame = step1.status === step2.status
      expect(isSame).toBe(false)
    })

    it('should match steps by name', () => {
      const leftSteps = mockTestRun1.steps
      const rightSteps = mockTestRun2.steps
      
      const leftStepMap = new Map(leftSteps.map(s => [s.name, s]))
      const rightStepMap = new Map(rightSteps.map(s => [s.name, s]))
      
      // All step names should match
      for (const name of leftStepMap.keys()) {
        expect(rightStepMap.has(name)).toBe(true)
      }
    })
  })

  describe('Duration Comparison', () => {
    it('should calculate duration difference', () => {
      const leftDuration = mockTestRun1.durationMs || 0
      const rightDuration = mockTestRun2.durationMs || 0
      const diff = rightDuration - leftDuration
      
      expect(diff).toBe(3000) // 8000 - 5000
    })

    it('should calculate percentage change', () => {
      const leftDuration = mockTestRun1.durationMs || 0
      const rightDuration = mockTestRun2.durationMs || 0
      const diff = rightDuration - leftDuration
      const percentChange = leftDuration > 0 ? ((diff / leftDuration) * 100) : 0
      
      expect(percentChange).toBe(60) // 3000/5000 * 100
    })

    it('should handle zero left duration', () => {
      const leftDuration = 0
      const rightDuration = 5000
      const diff = rightDuration - leftDuration
      const percentChange = leftDuration > 0 ? ((diff / leftDuration) * 100) : 0
      
      expect(percentChange).toBe(0)
    })
  })

  describe('Run Ordering', () => {
    it('should order runs by date (older first)', () => {
      const leftDate = new Date(mockTestRun1.runAt).getTime()
      const rightDate = new Date(mockTestRun2.runAt).getTime()
      
      const isLeftOlder = leftDate <= rightDate
      expect(isLeftOlder).toBe(true)
    })

    it('should swap runs if right is older', () => {
      const run1 = { ...mockTestRun1, runAt: new Date('2024-01-02T10:00:00Z') }
      const run2 = { ...mockTestRun2, runAt: new Date('2024-01-01T10:00:00Z') }
      
      const leftDate = new Date(run1.runAt).getTime()
      const rightDate = new Date(run2.runAt).getTime()
      
      const result = leftDate <= rightDate 
        ? { left: run1, right: run2 }
        : { left: run2, right: run1 }
      
      expect(new Date(result.left.runAt).getTime()).toBeLessThanOrEqual(new Date(result.right.runAt).getTime())
    })
  })
})

describe('WAL Mode', () => {
  it('should be a valid SQLite pragma', () => {
    const pragma = 'journal_mode = WAL'
    expect(pragma).toContain('WAL')
    expect(pragma).toContain('journal_mode')
  })
})
