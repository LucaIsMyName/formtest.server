import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Square } from "lucide-react";
import Button from "./ui/Button";

interface QueueStatus {
  queueLength: number;
  isProcessing: boolean;
  currentTestId: number | null;
  currentTestName: string | null;
  queuedTests: { testRunId: number; formName: string; paymentMethodName: string }[];
  totalPending: number;
}

interface TestQueueStatusProps {
  onRefresh?: () => void;
}

const TestQueueStatus: React.FC<TestQueueStatusProps> = ({ onRefresh }) => {
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const queueStatus = await window.api?.testQueue?.getStatus();
      setStatus(queueStatus || null);
    } catch (error) {
      console.error("Failed to fetch queue status:", error);
    }
  }, []);

  // Poll for status updates every second when there are pending tests
  useEffect(() => {
    fetchStatus();

    const interval = setInterval(() => {
      fetchStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleStopAll = async () => {
    if (!status || status.totalPending === 0) return;

    setIsClearing(true);
    try {
      await window.api?.testQueue?.stopAll();
      await fetchStatus();
      onRefresh?.();
    } catch (error) {
      console.error("Failed to stop all tests:", error);
    } finally {
      setIsClearing(false);
    }
  };

  // Don't render if no tests are pending
  if (!status || status.totalPending === 0) {
    return null;
  }

  // Just render a stop all button - the table shows the running tests
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        onClick={handleStopAll}
        variant="danger"
        size="sm"
        disabled={isClearing}
        className="gap-1.5 text-xs"
      >
        {isClearing ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Square className="w-3 h-3" fill="currentColor" />
        )}
        Alle stoppen
      </Button>
    </div>
  );
};

export default TestQueueStatus;
