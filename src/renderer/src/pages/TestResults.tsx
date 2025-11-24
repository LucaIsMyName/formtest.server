import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTestRunsStore } from "../store/useTestRunsStore";
import { useFormsStore } from "../store/useFormsStore";
import { CONFIG } from "../app.config";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
// TestRunDialog is handled by Layout component via global events
import Button from "../components/ui/Button";
import { CheckCircle, XCircle, Clock, SkipForward, RefreshCw, FileJson, Copy, Trash2, AlertCircle, Play, CheckCircle2, Bot } from "lucide-react";
import type { TestStep } from '../../../common/types';
import { Skeleton } from "../components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../components/ui/Drawer";

const TestResultsSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
    <div className="p-6">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <div className="flex-1 flex justify-end">
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TestDetailsSkeleton = () => (
  <div className="flex flex-col gap-4">
    <div>
      <Skeleton className="h-4 w-16 mb-1" />
      <Skeleton className="h-6 w-24" />
    </div>
    <div>
      <Skeleton className="h-4 w-12 mb-1" />
      <Skeleton className="h-5 w-32" />
    </div>
    <div>
      <Skeleton className="h-4 w-32 mb-1" />
      <Skeleton className="h-5 w-40" />
    </div>
    <div>
      <Skeleton className="h-4 w-16 mb-1" />
      <Skeleton className="h-5 w-20" />
    </div>
    <div>
      <Skeleton className="h-4 w-20 mb-1" />
      <Skeleton className="h-5 w-48" />
    </div>
  </div>
);

interface TimelineStep {
  timestamp?: string;
  message: string;
  type: "info" | "success" | "error" | "warning";
}

const TestTimeline: React.FC<{ steps?: TestStep[]; logDetails?: string; status: string }> = ({ steps: structuredSteps, logDetails, status }) => {
  const parseLogDetails = (logs?: string): TimelineStep[] => {
    if (!logs) return [];

    try {
      // Try to parse as JSON array first
      const parsed = JSON.parse(logs);
      if (Array.isArray(parsed)) {
        return parsed.map((log: string) => parseLogEntry(log));
      }
    } catch {
      // If JSON parsing fails, split by newlines
      const lines = logs.split("\n").filter((line) => line.trim());
      return lines.map((line) => parseLogEntry(line));
    }

    return [];
  };

  const parseLogEntry = (log: string): TimelineStep => {
    // Extract timestamp if present [YYYY-MM-DDTHH:mm:ss.sssZ]
    const timestampMatch = log.match(/^\[([^\]]+)\]/);
    const timestamp = timestampMatch ? timestampMatch[1] : undefined;
    const message = timestamp ? log.replace(/^\[[^\]]+\]\s*/, "") : log;

    // Determine step type based on message content
    let type: TimelineStep["type"] = "info";
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("error") || lowerMessage.includes("failed") || lowerMessage.includes("timeout")) {
      type = "error";
    } else if (lowerMessage.includes("success") || lowerMessage.includes("completed") || lowerMessage.includes("detected success")) {
      type = "success";
    } else if (lowerMessage.includes("warning") || lowerMessage.includes("skipping")) {
      type = "warning";
    }

    return { timestamp, message, type };
  };

  // Convert structured steps to timeline format or fallback to log parsing
  const convertStructuredSteps = (steps: TestStep[]): TimelineStep[] => {
    return steps.map(step => ({
      timestamp: step.startTime,
      message: step.message || step.name,
      type: step.status === 'success' ? 'success' : 
            step.status === 'error' ? 'error' : 
            step.status === 'skipped' ? 'warning' : 'info'
    }));
  };

  const timelineSteps = structuredSteps?.length ? 
    convertStructuredSteps(structuredSteps) : 
    parseLogDetails(logDetails);

  // Add final status step
  const finalStep: TimelineStep = {
    message: status === "SUCCESS" ? "Test completed successfully" : status === "FAILURE" ? "Test failed" : status === "SKIPPED" ? "Test was skipped" : "Test is running",
    type: status === "SUCCESS" ? "success" : status === "FAILURE" ? "error" : status === "SKIPPED" ? "warning" : "info",
  };

  const allSteps = [...timelineSteps, finalStep];

  const getStepIcon = (type: TimelineStep["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <Play className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return null;
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Test Timeline</h4>
      <div className="relative">
        {allSteps.map((step, index) => (
          <div
            key={index}
            className="relative flex items-start space-x-3 pb-4">
            {/* Timeline line */}
            {/* {index < allSteps.length - 1 ? <div className="absolute left-3 top-6 w-0.5 h-full bg-gray-200 dark:bg-gray-700" /> : null} */}
            {index === 0 ? null : null}
            {/* Step icon */}
            <div className="relative flex items-center justify-center w-6 h-6 bg-white dark:bg-gray-800 ">{getStepIcon(step.type)}</div>

            {/* Step content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-900 dark:text-white">{step.message}</p>
                {step.timestamp && <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{formatTimestamp(step.timestamp)}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TestResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { testRuns, loadTestRuns, isLoading, error } = useTestRunsStore();
  const { forms, loadForms } = useFormsStore();
  const { paymentMethods, loadPaymentMethods } = usePaymentMethodsStore();
  const [selectedTestRun, setSelectedTestRun] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    loadTestRuns();
    loadForms();
    loadPaymentMethods();
  }, [loadTestRuns, loadForms, loadPaymentMethods]);

  // Handle URL params and selection
  useEffect(() => {
    if (testRuns.length > 0) {
      const paramId = searchParams.get("id");
      if (paramId) {
        // Try to find by UUID first, then ID
        const found = testRuns.find((tr) => tr.uuid === paramId || String(tr.id) === paramId);
        if (found) {
          setSelectedTestRun(found.id);
          return;
        }
      }
      // Don't auto-select anything - let user choose
    }
  }, [testRuns, searchParams]);

  const handleSelectTestRun = (id: number | null) => {
    setSelectedTestRun(id);
    if (id) {
      setSearchParams({ id: String(id) });
    } else {
      setSearchParams({});
    }
  };

  const getFormName = (formId: number) => {
    const form = forms.find((f) => f.id === formId);
    return form ? form.name : `Form #${formId}`;
  };

  const getPaymentMethodName = (pmId: number) => {
    const pm = paymentMethods.find((p) => p.id === pmId);
    return pm ? pm.name : `Payment Method #${pmId}`;
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { size: 16 };
    switch (status) {
      case "SUCCESS":
        return <CheckCircle {...iconProps} />;
      case "FAILURE":
        return <XCircle {...iconProps} />;
      case "RUNNING":
        return <Clock {...iconProps} />;
      case "SKIPPED":
        return <SkipForward {...iconProps} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return "N/A";
    if (durationMs < 1000) return `${durationMs}ms`;
    return `${(durationMs / 1000).toFixed(1)}s`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const handleDeleteClick = (testRun: any) => {
    const formName = getFormName(testRun.formId);
    const paymentMethodName = getPaymentMethodName(testRun.paymentMethodId);
    const testRunName = `${formName} × ${paymentMethodName}`;
    setShowDeleteConfirm({ id: testRun.id, name: testRunName });
  };

  const confirmDeleteTestRun = async () => {
    if (!showDeleteConfirm) return;

    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.testRuns.delete(showDeleteConfirm.id);
      await loadTestRuns(); // Refresh the list
      setShowDeleteConfirm(null);
      if (selectedTestRun === showDeleteConfirm.id) {
        setSelectedTestRun(null);
      }
    } catch (error) {
      console.error("Failed to delete test run:", error);
    }
  };

  const handleRunAgain = async (testRun: any) => {
    try {
      // Get the form and payment method for this test run
      const form = forms.find(f => f.id === testRun.formId);
      const paymentMethod = paymentMethods.find(pm => pm.id === testRun.paymentMethodId);
      
      if (!form || !paymentMethod) {
        console.error("Form or payment method not found for re-run");
        return;
      }

      // Run the test again using the same API as the TestRunDialog
      await window.api.tests.run([form.id], [paymentMethod.id]);
      
      // Refresh the test runs list
      await loadTestRuns();
    } catch (error) {
      console.error("Failed to run test again:", error);
    }
  };

  const handleCopyUuid = (e: React.MouseEvent, uuid: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uuid);
  };

  const selectedTestRunData = selectedTestRun ? testRuns.find((tr) => tr.id === selectedTestRun) : null;

  const handleExportJson = () => {
    if (!selectedTestRunData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedTestRunData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `test_result_${selectedTestRunData.uuid || selectedTestRunData.id}_${new Date(selectedTestRunData.runAt).toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className={CONFIG.style.title.className}>Test Resultate</h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              // Dispatch global event to open TestRunDialog
              window.dispatchEvent(new Event('openTestDialog'));
            }}
            variant="primary"
            size="md"
            className="gap-2">
            <Play size={16} />
            Testen
          </Button>
          <Button
            onClick={loadTestRuns}
            variant="secondary"
            size="md"
            disabled={isLoading}
            className="gap-2">
            <RefreshCw size={16} />
            {isLoading ? "Aktualisieren..." : "Aktualisieren"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md">
          <div className="text-red-800 dark:text-red-200">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Test Runs List - Full Width */}
      <div className="mt-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          {isLoading && testRuns.length === 0 ? (
            <TestResultsSkeleton />
          ) : testRuns.length === 0 ? (
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400 mb-4">No test results yet.</div>
                <p className="text-gray-500 dark:text-gray-400">Run some tests to see results here.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">ID</TableHead>
                    <TableHead className="px-4">Test</TableHead>
                    <TableHead className="px-4">Datum</TableHead>
                    <TableHead className="px-4">Dauer</TableHead>
                    <TableHead className="px-4">Status</TableHead>
                    <TableHead className="px-4 text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testRuns.map((testRun) => {
                    const isSelected = selectedTestRun === testRun.id;
                    return (
                      <TableRow
                        key={testRun.id}
                        className={`cursor-pointer ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}`}
                        onClick={() => handleSelectTestRun(testRun.id)}>
                        <TableCell className="px-4">
                          <div className="flex items-center gap-1 group">
                            <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{testRun.uuid ? testRun.uuid.substring(0, 8) : `ID:${testRun.id}`}</span>
                            {testRun.uuid && (
                              <button
                                onClick={(e) => handleCopyUuid(e, testRun.uuid)}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="ID kopieren">
                                <Copy size={10} />
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`flex-shrink-0 ${testRun.status === "SUCCESS" ? "text-green-600 dark:text-green-400" : testRun.status === "FAILURE" ? "text-red-600 dark:text-red-400" : testRun.status === "RUNNING" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>{getStatusIcon(testRun.status)}</div>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                {getFormName(testRun.formId)} × {getPaymentMethodName(testRun.paymentMethodId)}
                              </div>
                              {testRun.isScheduled && (
                                <div className="flex-shrink-0" title="Autopilot Test">
                                  <Bot size={12} className="text-blue-600 dark:text-blue-400" />
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 text-[11px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(testRun.runAt)}</TableCell>
                        <TableCell className="px-4 text-[11px] font-mono text-gray-500 dark:text-gray-400">{formatDuration(testRun.durationMs)}</TableCell>
                        <TableCell className="px-4">
                          <span className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono font-medium rounded-full ${testRun.status === "SUCCESS" ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800" : testRun.status === "FAILURE" ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800" : testRun.status === "RUNNING" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800" : "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800"}`}>{testRun.status}</span>
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRunAgain(testRun);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                              title="Test erneut ausführen">
                              <Play size={16} />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(testRun);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              title="Löschen">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Test Details Drawer */}
      <Drawer
        open={!!selectedTestRun}
        onOpenChange={(open) => !open && handleSelectTestRun(null)}>
        <DrawerContent className="w-full max-w-2xl">
          <DrawerHeader className="mb-6 pb-6 border-b dark:border-gray-700">
            <DrawerTitle className={CONFIG.style.title.className}>{selectedTestRunData && `${getFormName(selectedTestRunData.formId)} × ${getPaymentMethodName(selectedTestRunData.paymentMethodId)}`}</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto space-y-6">
            {selectedTestRunData ? (
              <>
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b dark:border-gray-700">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ID</label>
                    <div className="flex items-center gap-2">
                      <code className="text-xs truncate font-mono bg-gray-100 dark:bg-gray-900/50 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{selectedTestRunData.uuid || selectedTestRunData.id}</code>
                      {selectedTestRunData.uuid && (
                        <button
                          onClick={(e) => handleCopyUuid(e, selectedTestRunData.uuid!)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="ID kopieren">
                          <Copy size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                    <div className={`border inline-flex items-center gap-2 pl-1 pr-2 py-1 text-[11px] font-medium font-mono rounded-full ${selectedTestRunData.status === "SUCCESS" ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 dark:border-green-700 border-green-400" : selectedTestRunData.status === "FAILURE" ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 dark:border-red-700 border-red-400" : selectedTestRunData.status === "RUNNING" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 dark:border-blue-700 border-blue-400" : "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200 dark:border-gray-700 border-gray-400"}`}>
                      {getStatusIcon(selectedTestRunData.status)} {selectedTestRunData.status}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Duration</label>
                    <div className="text-sm text-gray-900 dark:text-white font-mono">{formatDuration(selectedTestRunData.durationMs)}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Run At</label>
                    <div className="text-sm text-gray-900 dark:text-white font-mono">{formatDate(selectedTestRunData.runAt)}</div>
                  </div>
                </div>

                {/* Error Message */}
                {selectedTestRunData.errorMessage && (
                  <div className="mb-6 pb-6 border-b dark:border-gray-700 ">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Error Message</label>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200 font-mono">{selectedTestRunData.errorMessage}</div>
                  </div>
                )}

                {/* Test Timeline */}
                {(selectedTestRunData.steps?.length || selectedTestRunData.logDetails) && (
                  <TestTimeline
                    steps={selectedTestRunData.steps}
                    logDetails={selectedTestRunData.logDetails}
                    status={selectedTestRunData.status}
                  />
                )}

                {/* Screenshot */}
                {selectedTestRunData.screenshotPath && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Screenshot</label>
                    <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                      <img
                        src={selectedTestRunData.screenshotPath}
                        alt="Test screenshot"
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {/* Export Button */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExportJson}
                    className="gap-2">
                    <FileJson size={16} />
                    Export JSON
                  </Button>
                </div>
              </>
            ) : (
              <TestDetailsSkeleton />
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <DeleteConfirmDialog
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={confirmDeleteTestRun}
        title="Test Run löschen"
        message="Sind Sie sicher, dass Sie diesen Test Run löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
        itemName={showDeleteConfirm?.name}
        isLoading={isLoading}
      />

      {/* TestRunDialog is handled by Layout component via global events */}
    </div>
  );
};

export default TestResults;
