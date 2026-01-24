import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the testExecutor
vi.mock('../src/main/testExecutor', () => ({
  runSingleTest: vi.fn().mockImplementation(async (testRunId: number) => {
    // Simulate test taking some time
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`Mock: Test ${testRunId} completed`);
  })
}));

// Mock the database
vi.mock('../src/main/database', () => ({
  testRunQueries: {
    updateStatus: vi.fn()
  }
}));

describe('TestQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the singleton
    vi.resetModules();
  });

  it('should create a singleton instance', async () => {
    const { getTestQueue } = await import('../src/main/testQueue');
    
    const queue1 = getTestQueue();
    const queue2 = getTestQueue();
    
    expect(queue1).toBe(queue2);
  });

  it('should report correct queue status', async () => {
    const { getTestQueue } = await import('../src/main/testQueue');
    const queue = getTestQueue();
    
    const status = queue.getStatus();
    
    expect(status).toHaveProperty('queueLength');
    expect(status).toHaveProperty('isProcessing');
    expect(status).toHaveProperty('currentTestId');
    expect(status.queueLength).toBe(0);
    expect(status.isProcessing).toBe(false);
    expect(status.currentTestId).toBeNull();
  });

  it('should clear the queue', async () => {
    const { getTestQueue } = await import('../src/main/testQueue');
    const queue = getTestQueue();
    
    // Add some tests
    const mockForm = { id: 1, name: 'Test Form', url: 'http://test.com', isActive: true } as any;
    const mockPayment = { id: 1, name: 'Test Payment', type: 'paypal', isActive: true } as any;
    const mockSettings = {};
    
    // Note: These will start processing immediately, but we can still test clear
    queue.enqueue(1, mockForm, mockPayment, mockSettings);
    queue.enqueue(2, mockForm, mockPayment, mockSettings);
    queue.enqueue(3, mockForm, mockPayment, mockSettings);
    
    // Clear should remove pending tests (not the currently processing one)
    queue.clear();
    
    const status = queue.getStatus();
    expect(status.queueLength).toBe(0);
  });
});

describe('TestQueue - Sequential Processing', () => {
  it('should add tests to queue and track status', async () => {
    vi.resetModules();
    const { getTestQueue } = await import('../src/main/testQueue');
    const queue = getTestQueue();
    
    const mockForm = { id: 1, name: 'Test Form', url: 'http://test.com', isActive: true } as any;
    const mockPayment = { id: 1, name: 'Test Payment', type: 'paypal', isActive: true } as any;
    const mockSettings = {};
    
    // Enqueue multiple tests
    queue.enqueue(1, mockForm, mockPayment, mockSettings);
    queue.enqueue(2, mockForm, mockPayment, mockSettings);
    queue.enqueue(3, mockForm, mockPayment, mockSettings);
    
    // First test should start processing immediately
    const status = queue.getStatus();
    expect(status.isProcessing).toBe(true);
    expect(status.currentTestId).toBe(1);
    // Queue should have 2 remaining (test 2 and 3)
    expect(status.queueLength).toBe(2);
  });
});
