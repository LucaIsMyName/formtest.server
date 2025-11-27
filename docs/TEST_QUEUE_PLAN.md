# Test Queue System - Implementation Plan

## Problem
When running multiple tests at once (e.g., "Run All" or selecting many form/payment combinations), all tests start simultaneously, opening many browser instances and overwhelming system resources.

## Proposed Solution: Test Queue Manager

### Architecture
```
┌─────────────────────────────────────────────────────┐
│                   TestQueueManager                   │
├─────────────────────────────────────────────────────┤
│ - queue: TestJob[]                                   │
│ - activeTests: Map<testRunId, TestJob>              │
│ - maxConcurrent: number (default: 1)                │
│ - delayBetweenTests: number (default: 2000ms)       │
├─────────────────────────────────────────────────────┤
│ + enqueue(jobs: TestJob[])                          │
│ + processQueue()                                     │
│ + onTestComplete(testRunId)                         │
│ + cancelAll()                                        │
│ + getQueueStatus()                                   │
└─────────────────────────────────────────────────────┘
```

### Implementation Steps

#### 1. Create TestQueueManager class
**File:** `src/main/testRunner/queueManager.ts`

- Maintains a FIFO queue of pending tests
- Tracks currently running tests
- Configurable max concurrent tests (start with 1)
- Configurable delay between test starts

```typescript
interface TestJob {
  testRunId: number;
  formId: number;
  paymentMethodId: number;
  settings: Record<string, string>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  queuedAt: Date;
}

class TestQueueManager {
  private queue: TestJob[] = [];
  private activeTests: Map<number, TestJob> = new Map();
  private maxConcurrent: number = 1;
  private delayBetweenTests: number = 2000;

  enqueue(jobs: TestJob[]): void;
  processQueue(): Promise<void>;
  onTestComplete(testRunId: number, success: boolean): void;
  cancelAll(): void;
  getQueueStatus(): QueueStatus;
}
```

#### 2. Update processManager.ts
- Integrate queue manager
- Route test requests through queue instead of direct execution
- Handle test completion to trigger next in queue

#### 3. Add queue status IPC
- `tests:getQueueStatus` - Returns queue length, active tests, position
- `tests:cancelQueue` - Cancel all pending tests

#### 4. Update UI (TestRunDialog)
- Show queue status when multiple tests selected
- Display "X tests queued, Y running"
- Add "Cancel Queue" button
- Show progress indicator for queue

#### 5. Add Settings options
Add to Settings page under "Test-Einstellungen":

- `max_concurrent_tests`: 1-3 (default 1)
- `delay_between_tests`: 0-10000ms (default 2000)

### UI Mockup

```
┌─────────────────────────────────────────────────────┐
│  Test Queue                                          │
├─────────────────────────────────────────────────────┤
│  ● Running: 1/1                                      │
│  ○ Queued: 5 tests                                   │
│                                                      │
│  [████████░░░░░░░░░░░░] 2/6 completed               │
│                                                      │
│  Current: online lang × PayPal                       │
│  Next: online lang × SEPA                            │
│                                                      │
│  [Cancel Queue]                                      │
└─────────────────────────────────────────────────────┘
```

### Estimated Effort
~3-4 hours

### Benefits
- Prevents system overload from too many browser instances
- More reliable test execution
- Better resource management
- Clear visibility into test progress
- Ability to cancel pending tests

### Future Enhancements
- Priority queue (urgent tests first)
- Retry failed tests automatically
- Parallel execution with configurable concurrency
- Test dependencies (run test B only after test A succeeds)
