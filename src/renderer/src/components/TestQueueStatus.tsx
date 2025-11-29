import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Clock, X } from "lucide-react";
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

  const handleClearQueue = async () => {
    if (!status || status.queueLength === 0) return;
    
    setIsClearing(true);
    try {
      await window.api?.testQueue?.clear();
      await fetchStatus();
      onRefresh?.();
    } catch (error) {
      console.error("Failed to clear queue:", error);
    } finally {
      setIsClearing(false);
    }
  };

  // Don't render if no tests are pending
  if (!status || status.totalPending === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        {/* Left: Status info */}
        <div className="flex items-center gap-4">
          {/* Processing indicator */}
          <div className="flex md:min-w-[180px] items-center justify-start gap-2">
            <div className="relative ">
              <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
              <div className="absolute inset-0 w-5 h-5 bg-blue-400 dark:bg-blue-500 rounded-full animate-ping opacity-20" />
            </div>
            <div>
              <div className="text-xs font-medium text-blue-900 dark:text-blue-100">
                Test läuft
              </div>
              {status.currentTestName && (
                <div className="text-[10px] text-blue-700 dark:text-blue-300 truncate max-w-[200px]">
                  {status.currentTestName}
                </div>
              )}
            </div>
          </div>

          {/* Queue count */}
          {status.queueLength > 0 && (
            <div className="flex items-center gap-2 pl-4 border-l border-blue-200 dark:border-blue-700">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <div>
                <div className="text-xs font-medium text-amber-900 dark:text-amber-100">
                  {status.queueLength} in Warteschlange
                </div>
                <div className="text-[10px] text-amber-700 dark:text-amber-300">
                  {status.totalPending} Tests insgesamt
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Queued tests preview */}
          {status.queuedTests.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 mr-2">
              {status.queuedTests.slice(0, 3).map((test, idx) => (
                <div
                  key={test.testRunId}
                  className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded text-[9px] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                  title={`${test.formName} × ${test.paymentMethodName}`}
                >
                  #{idx + 1}
                </div>
              ))}
              {status.queuedTests.length > 3 && (
                <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-500 dark:text-gray-400">
                  +{status.queuedTests.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Stop button */}
          {status.queueLength > 0 && (
            <Button
              onClick={handleClearQueue}
              variant="secondary"
              size="sm"
              disabled={isClearing}
              className="gap-1 !text-[9px]"
            >
              {isClearing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <X className="w-3 h-3" />
              )}
              Warteschlange leeren
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1 bg-blue-100 dark:bg-blue-900 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
};

export default TestQueueStatus;
