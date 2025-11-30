import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTestRunsStore } from "../store/useTestRunsStore";
import { useFormsStore } from "../store/useFormsStore";
import { CONFIG } from "../app.config";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import TestQueueStatus from "../components/TestQueueStatus";
// TestRunDialog is handled by Layout component via global events
import Button from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";
import { FileJson, Copy, Trash2, AlertCircle, Play, CheckCircle2, Bot, User, XCircle, Square, Download, FileSpreadsheet } from "lucide-react";
import { renderIcon, getDefaultPaymentIcon } from "../utils/iconHelper";
import { Link } from "react-router-dom";
import type { TestStep, TestRun } from "../../../common/types";
import { Skeleton } from "../components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TablePagination } from "../components/ui/Table";
import { SortableTableHead } from "../components/ui/SortableTableHead";
import { TableFilter } from "../components/ui/TableFilter";
import { Drawer, DrawerContent, DrawerHeader } from "../components/ui/Drawer";
import { formatDateTime, formatDuration } from "../utils/formatters";
import { useSortableData } from "../hooks/useSortableData";
import { useFilterableData } from "../hooks/useFilterableData";
import ScreenshotViewer from "../components/ScreenshotViewer";

const TestResultsSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm overflow-hidden">
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
    return steps.map((step) => ({
      timestamp: step.startTime,
      message: step.message || step.name,
      type: step.status === "success" ? "success" : step.status === "error" ? "error" : step.status === "skipped" ? "warning" : "info",
    }));
  };

  const timelineSteps = structuredSteps?.length ? convertStructuredSteps(structuredSteps) : parseLogDetails(logDetails);

  // Add final status step
  const finalStep: TimelineStep = {
    message: status === "SUCCESS" ? "Test completed successfully" : status === "FAILURE" ? "Test fehlgeschlagen" : status === "SKIPPED" ? "Test übersprungen" : "Test läuft",
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
    <div className="mb-6 pb-6 border-b dark:border-gray-700">
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Test Timeline</label>
      <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
        <Table>
          <TableBody>
            {allSteps.map((step, index) => (
              <TableRow key={index}>
                <TableCell className="px-3 py-2 w-[40px] bg-gray-50 dark:bg-gray-800/50">
                  {getStepIcon(step.type)}
                </TableCell>
                <TableCell className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                  {step.message}
                </TableCell>
                {step.timestamp && (
                  <TableCell className="px-3 py-2 w-[80px] text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{formatTimestamp(step.timestamp)}</span>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// Extended type for sorting with computed fields
interface TestRunWithComputed extends TestRun {
  formName?: string;
  paymentMethodName?: string;
}

const TestResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { testRuns, loadTestRuns, isLoading, error, runTests } = useTestRunsStore();
  const { forms, loadForms } = useFormsStore();
  const { paymentMethods, loadPaymentMethods } = usePaymentMethodsStore();
  const [selectedTestRun, setSelectedTestRun] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [runningTimers, setRunningTimers] = useState<Record<number, number>>({});

  useEffect(() => {
    loadTestRuns();
    loadForms();
    loadPaymentMethods();
  }, [loadTestRuns, loadForms, loadPaymentMethods]);

  // Compute form/payment names for sorting
  const testRunsWithNames = useMemo((): TestRunWithComputed[] => {
    return testRuns.map((tr) => ({
      ...tr,
      formName: forms.find((f) => f.id === tr.formId)?.name || `Form #${tr.formId}`,
      paymentMethodName: paymentMethods.find((p) => p.id === tr.paymentMethodId)?.name || `PM #${tr.paymentMethodId}`,
    }));
  }, [testRuns, forms, paymentMethods]);

  // Split into running/queued and finished
  const runningTests = useMemo(() => testRunsWithNames.filter((tr) => tr.status === "RUNNING"), [testRunsWithNames]);
  const queuedTests = useMemo(() => testRunsWithNames.filter((tr) => tr.status === "QUEUED"), [testRunsWithNames]);
  const activeTests = useMemo(() => [...runningTests, ...queuedTests], [runningTests, queuedTests]);
  const finishedTests = useMemo(() => testRunsWithNames.filter((tr) => tr.status !== "RUNNING" && tr.status !== "QUEUED"), [testRunsWithNames]);

  // Helper to get start time - SQLite CURRENT_TIMESTAMP stores UTC
  const getStartTime = (runAt: Date | string): number => {
    if (runAt instanceof Date) {
      return runAt.getTime();
    }
    // SQLite stores as "YYYY-MM-DD HH:MM:SS" in UTC (CURRENT_TIMESTAMP)
    // JavaScript parses strings without timezone as LOCAL time, but SQLite stores UTC
    // So we need to parse it as UTC by adding 'Z'
    const dateStr = String(runAt);
    if (!dateStr.includes("T") && !dateStr.includes("Z")) {
      // Add Z to indicate UTC
      const utcDate = new Date(dateStr.replace(" ", "T") + "Z");
      return utcDate.getTime();
    }
    return new Date(dateStr).getTime();
  };

  // Timer effect for running tests - updates every second
  useEffect(() => {
    if (runningTests.length === 0) {
      setRunningTimers({});
      return;
    }

    // Initialize timers for running tests
    const initialTimers: Record<number, number> = {};
    runningTests.forEach((test) => {
      const startTime = getStartTime(test.runAt);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      initialTimers[test.id] = Math.max(0, elapsed); // Ensure non-negative
    });
    setRunningTimers(initialTimers);

    // Update every second
    const interval = setInterval(() => {
      setRunningTimers(() => {
        const updated: Record<number, number> = {};
        runningTests.forEach((test) => {
          const startTime = getStartTime(test.runAt);
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          updated[test.id] = Math.max(0, elapsed); // Ensure non-negative
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [runningTests]);

  // Auto-refresh when tests are running or queued - poll every 2 seconds
  useEffect(() => {
    if (activeTests.length === 0) return;

    const refreshInterval = setInterval(() => {
      loadTestRuns();
    }, 2000);

    return () => clearInterval(refreshInterval);
  }, [activeTests.length, loadTestRuns]);

  // Filtering for finished tests (with localStorage persistence)
  const {
    filteredItems: filteredFinishedTests,
    filterConfig,
    setSearchTerm,
    setStatusFilter,
    clearFilters,
  } = useFilterableData<TestRunWithComputed>(
    finishedTests,
    ["formName", "paymentMethodName", "uuid", "status"] as (keyof TestRunWithComputed)[],
    { searchTerm: "", statusFilter: undefined },
    "testResults" // localStorage key
  );

  // Sorting for finished tests (with localStorage persistence)
  const {
    sortedItems: allSortedFinishedTests,
    requestSort,
    sortConfig,
    getSortDirection,
  } = useSortableData<TestRunWithComputed>(
    filteredFinishedTests,
    { key: "runAt", direction: "desc" }, // Default: newest first
    "testResults" // localStorage key
  );

  // Pagination for finished tests (only if > 50 items)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const totalFilteredItems = allSortedFinishedTests.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const showPagination = totalFilteredItems > 50;

  const sortedFinishedTests = useMemo(() => {
    if (totalFilteredItems > 50) {
      const start = (currentPage - 1) * itemsPerPage;
      return allSortedFinishedTests.slice(start, start + itemsPerPage);
    }
    return allSortedFinishedTests;
  }, [allSortedFinishedTests, currentPage, itemsPerPage, totalFilteredItems]);

  // Reset page when filter or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterConfig.statusFilter, filterConfig.searchTerm, sortConfig.key, sortConfig.direction]);

  // Status filter options
  const statusOptions = [
    { value: "SUCCESS", label: "Erfolgreich" },
    { value: "FAILURE", label: "Fehlgeschlagen" },
    { value: "STOPPED", label: "Gestoppt" },
  ];

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
      // Use replace to avoid polluting browser history with drawer state
      setSearchParams({ id: String(id) }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const getFormName = (formId: number) => {
    const form = forms.find((f) => f.id === formId);
    return form ? form.name : `Form #${formId}`;
  };

  const getFormIcon = (formId: number) => {
    const form = forms.find((f) => f.id === formId);
    return form?.icon || "FileText";
  };

  const getPaymentMethodName = (pmId: number) => {
    const pm = paymentMethods.find((p) => p.id === pmId);
    return pm ? pm.name : `Payment Method #${pmId}`;
  };

  const getPaymentMethodIcon = (pmId: number) => {
    const pm = paymentMethods.find((p) => p.id === pmId);
    return pm?.icon || getDefaultPaymentIcon(pm?.type || "creditcard");
  };

  // Format elapsed time as MM:SS
  const formatElapsedTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get form details for drawer
  const getFormDetails = (formId: number) => {
    return forms.find((f) => f.id === formId);
  };

  // Get payment method details for drawer
  const getPaymentMethodDetails = (pmId: number) => {
    return paymentMethods.find((p) => p.id === pmId);
  };

  const handleDeleteClick = (testRun: any) => {
    const formName = getFormName(testRun.formId);
    const paymentMethodName = getPaymentMethodName(testRun.paymentMethodId);
    const testRunName = `${formName} × ${paymentMethodName}`;
    setShowDeleteConfirm({ id: testRun.id, name: testRunName });
  };

  const handleStopTest = async (testRun: any) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.testRuns.stop(testRun.id);
      await loadTestRuns(); // Refresh the list
    } catch (error) {
      console.error("Failed to stop test run:", error);
    }
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
      const form = forms.find((f) => f.id === testRun.formId);
      const paymentMethod = paymentMethods.find((pm) => pm.id === testRun.paymentMethodId);

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

  // Sync notes when selected test run changes
  useEffect(() => {
    if (selectedTestRunData) {
      setNotes(selectedTestRunData.notes || "");
    } else {
      setNotes("");
    }
  }, [selectedTestRunData?.id, selectedTestRunData?.notes]);

  // Debounced save notes
  const handleNotesChange = async (value: string) => {
    setNotes(value);

    if (!selectedTestRunData) return;

    setIsSavingNotes(true);
    try {
      await window.api.testRuns.updateNotes(selectedTestRunData.id, value);
      // Refresh to sync state so notes persist when drawer reopens
      await loadTestRuns();
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setIsSavingNotes(false);
    }
  };

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

  // Export all test results as JSON
  const handleExportAllJson = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalResults: finishedTests.length,
      results: finishedTests.map((tr) => ({
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
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `test_results_export_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Export all test results as CSV
  const handleExportCsv = () => {
    // CSV header
    const headers = ["ID", "UUID", "Form", "Bezahlmethode", "Status", "Dauer (ms)", "Fehler", "Geplant", "Notizen", "Datum"];
    
    // CSV rows
    const rows = finishedTests.map((tr) => [
      tr.id,
      tr.uuid || "",
      tr.formName || "",
      tr.paymentMethodName || "",
      tr.status,
      tr.durationMs || "",
      (tr.errorMessage || "").replace(/"/g, '""'), // Escape quotes
      tr.isScheduled ? "Ja" : "Nein",
      (tr.notes || "").replace(/"/g, '""').replace(/\n/g, " "), // Escape quotes and newlines
      new Date(tr.runAt).toLocaleString("de-DE"),
    ]);

    // Build CSV content
    const csvContent = [
      headers.join(";"),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(";")),
    ].join("\n");

    // Add BOM for Excel compatibility with German characters
    const bom = "\uFEFF";
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(bom + csvContent);
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `test_results_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className={CONFIG.style.title.className}>Tests</h1>
        <div className="flex items-center gap-3">
          {finishedTests.length > 0 && (
            <>
              <Button
                onClick={handleExportCsv}
                variant="ghost"
                size="sm"
                className="gap-2 font-mono font-[10px]">
                <FileSpreadsheet size={12} />
                CSV
              </Button>
              <Button
                onClick={handleExportAllJson}
                variant="ghost"
                size="sm"
                 className="gap-2 font-mono font-[10px]">
                <Download size={12} />
                JSON
              </Button>
            </>
          )}
          <Button
            onClick={() => {
              // Dispatch global event to open TestRunDialog
              window.dispatchEvent(new Event("openTestDialog"));
            }}
            variant="primary"
            size="md"
            className="gap-2">
            <Play size={16} />
            Testen
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

      {/* Running Tests Table */}
      {activeTests.length > 0 && (
        <div className="mt-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Laufende Tests ({runningTests.length}
              {queuedTests.length > 0 ? ` + ${queuedTests.length} in Warteschlange` : ""})
            </h2>
            <TestQueueStatus onRefresh={loadTestRuns} />
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 w-[80px]">UUID</TableHead>
                    <TableHead className="px-4 w-[70px] text-left"><Bot size={14} className="inline" /></TableHead>
                    <TableHead className="px-4 min-w-[160px]">Formular</TableHead>
                    <TableHead className="px-4 min-w-[160px]">Bezahlmethode</TableHead>
                    <TableHead className="px-4 w-[150px]">Gestartet</TableHead>
                    <TableHead className="px-4 w-[70px]">Dauer</TableHead>
                    <TableHead className="px-4 w-[90px]">Status</TableHead>
                    <TableHead className="px-4 w-[80px] text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeTests.map((testRun) => {
                    const isSelected = selectedTestRun === testRun.id;
                    const isQueued = testRun.status === "QUEUED";
                    const isRunning = testRun.status === "RUNNING";
                    return (
                      <TableRow
                        key={testRun.id}
                        tabIndex={0}
                        role="button"
                        aria-selected={isSelected}
                        className={`cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${isSelected ? "bg-gray-100 dark:bg-gray-700" : isRunning ? "animate-blink-running" : isQueued ? "bg-gray-50/50 dark:bg-gray-800/50" : "bg-white dark:bg-gray-800"}`}
                        onClick={() => handleSelectTestRun(testRun.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelectTestRun(testRun.id);
                          }
                        }}>
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
                        <TableCell className="px-4 text-left">
                          {testRun.isScheduled ? (
                            <Bot size={16} className="inline text-blue-500" />
                          ) : (
                            <User size={16} className="inline text-green-500" />
                          )}
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                              {renderIcon(getFormIcon(testRun.formId), 14)}
                            </span>
                            <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {testRun.formName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                              {renderIcon(getPaymentMethodIcon(testRun.paymentMethodId), 14)}
                            </span>
                            <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {testRun.paymentMethodName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 text-[10px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDateTime(testRun.runAt)}</TableCell>
                        <TableCell className="px-4">
                          <span className={`text-[10px] font-mono tabular-nums ${isRunning ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>{formatElapsedTime(runningTimers[testRun.id] || 0)}</span>
                        </TableCell>
                        <TableCell className="px-4">
                          <StatusBadge status={testRun.status} />
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStopTest(testRun);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 dark:text-red-400"
                              title="Test stoppen">
                              <Square
                                size={14}
                                fill="currentColor"
                              />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Finished Test Runs List */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <CheckCircle2 size={12} className="text-gray-400 dark:text-gray-500" />
            Ausgeführte Tests ({totalFilteredItems})
          </h2>
        </div>

        {/* Filter Bar */}
        <TableFilter
          searchTerm={filterConfig.searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Tests durchsuchen..."
          statusFilter={filterConfig.statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={statusOptions}
          onClear={clearFilters}
        />

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm overflow-hidden">
          {isLoading && testRuns.length === 0 ? (
            <TestResultsSkeleton />
          ) : sortedFinishedTests.length === 0 ? (
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400 mb-4">{finishedTests.length === 0 ? "Noch keine abgeschlossenen Tests." : "Keine Tests gefunden."}</div>
                <p className="text-gray-500 dark:text-gray-400">{finishedTests.length === 0 ? "Führe Tests aus, um Ergebnisse hier zu sehen." : "Versuche andere Suchbegriffe oder Filter."}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead className="px-4 w-[80px]">UUID</SortableTableHead>
                    <SortableTableHead
                      className="px-4 w-[70px] text-left justify-left"
                      sortDirection={getSortDirection("isScheduled")}
                      onSort={() => requestSort("isScheduled")}>
                      <Bot size={14} className="inline" />
                    </SortableTableHead>
                    <SortableTableHead
                      className="px-4 min-w-[180px]"
                      sortDirection={getSortDirection("formName")}
                      onSort={() => requestSort("formName")}>
                      Formular
                    </SortableTableHead>
                    <SortableTableHead
                      className="px-4 min-w-[200px]"
                      sortDirection={getSortDirection("paymentMethodName")}
                      onSort={() => requestSort("paymentMethodName")}>
                      Bezahlmethode
                    </SortableTableHead>
                    <SortableTableHead
                      className="px-4 w-[150px]"
                      sortDirection={getSortDirection("runAt")}
                      onSort={() => requestSort("runAt")}>
                      Datum
                    </SortableTableHead>
                    <SortableTableHead
                      className="px-4 w-[70px]"
                      sortDirection={getSortDirection("durationMs")}
                      onSort={() => requestSort("durationMs")}>
                      Dauer
                    </SortableTableHead>
                    <SortableTableHead
                      className="px-4 w-[90px]"
                      sortDirection={getSortDirection("status")}
                      onSort={() => requestSort("status")}>
                      Status
                    </SortableTableHead>
                    <TableHead className="px-4 w-[80px] text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFinishedTests.map((testRun) => {
                    const isSelected = selectedTestRun === testRun.id;
                    return (
                      <TableRow
                        key={testRun.id}
                        tabIndex={0}
                        role="button"
                        aria-selected={isSelected}
                        className={`cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}`}
                        onClick={() => handleSelectTestRun(testRun.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelectTestRun(testRun.id);
                          }
                        }}>
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
                        <TableCell className="px-4 text-left">
                          {testRun.isScheduled ? (
                            <Bot size={16} className="inline text-blue-500" />
                          ) : (
                            <User size={16} className="inline text-green-500" />
                          )}
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                              {renderIcon(getFormIcon(testRun.formId), 14)}
                            </span>
                            <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {testRun.formName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                              {renderIcon(getPaymentMethodIcon(testRun.paymentMethodId), 14)}
                            </span>
                            <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {testRun.paymentMethodName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 text-[10px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDateTime(testRun.runAt)}</TableCell>
                        <TableCell className="px-4 text-[10px] font-mono text-gray-500 dark:text-gray-400">{formatDuration(testRun.durationMs)}</TableCell>
                        <TableCell className="px-4">
                          <StatusBadge status={testRun.status} />
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
              {showPagination && (
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalFilteredItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Test Details Drawer */}
      <Drawer
        open={!!selectedTestRun}
        onOpenChange={(open) => !open && handleSelectTestRun(null)}>
        <DrawerContent className="w-full">
          {/* Top Title Bar with Action Buttons */}
          <div className="items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
           
            {/* Action buttons */}
            {selectedTestRunData && (
              <div className="mb-4 flex items-center gap-2 flex-shrink-0">
                {selectedTestRunData.status === "RUNNING" || selectedTestRunData.status === "QUEUED" ? (
                  <Button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await handleStopTest(selectedTestRunData);
                    }}
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 !bg-purple-600 !text-white hover:!bg-purple-700 !border-purple-600">
                    <Square size={14} />
                    {selectedTestRunData.status === "QUEUED" ? "Aus Warteschlange entfernen" : "Test stoppen"}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await runTests([selectedTestRunData.formId], [selectedTestRunData.paymentMethodId]);
                        handleSelectTestRun(null);
                      }}
                      variant="primary"
                      size="sm"
                      className="gap-1.5">
                      <Play size={14} />
                      Erneut ausführen
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm({
                          id: selectedTestRunData.id,
                          name: `${getFormName(selectedTestRunData.formId)} × ${getPaymentMethodName(selectedTestRunData.paymentMethodId)}`,
                        });
                      }}
                      variant="danger"
                      size="sm"
                      className="gap-1.5">
                      <Trash2 size={14} />
                      Löschen
                    </Button>
                  </>
                )}
              </div>
            )}
             <div className="flex-1 min-w-0">
              <span className={`${CONFIG.style.title.className} flex items-center gap-3`}>
                {selectedTestRunData && (
                  <>
                    <span className="text-gray-300 dark:text-gray-700">
                      {renderIcon(getFormIcon(selectedTestRunData.formId), 48)}
                    </span>
                    {getFormName(selectedTestRunData.formId)}
                    <span className="text-gray-400 dark:text-gray-500 font-normal">×</span>
                    <span className="text-gray-300 dark:text-gray-700">
                      {renderIcon(getPaymentMethodIcon(selectedTestRunData.paymentMethodId), 48)}
                    </span>
                    {getPaymentMethodName(selectedTestRunData.paymentMethodId)}
                  </>
                )}
              </span>
            </div>
          </div>

          <DrawerHeader className="pt-6"></DrawerHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            {selectedTestRunData ? (
              <>
                {/* Basic Info Table */}
                <div className="mb-6 pb-6 border-b dark:border-gray-700">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Test Infos</label>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="px-3 py-2 w-[120px] bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                          <TableCell className="px-3 py-2">
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
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                          <TableCell className="px-3 py-2"><StatusBadge status={selectedTestRunData.status} /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400">Dauer</TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 dark:text-white font-mono">{selectedTestRunData.status === "RUNNING" ? formatElapsedTime(runningTimers[selectedTestRunData.id] || 0) : formatDuration(selectedTestRunData.durationMs)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400">Zeitpunkt</TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 dark:text-white font-mono">{formatDateTime(selectedTestRunData.runAt)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Form Details Table */}
                {(() => {
                  const formDetails = getFormDetails(selectedTestRunData.formId);
                  return (
                    formDetails && (
                      <div className="mb-6 pb-6 border-b dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Formular</label>
                          <Link
                            to={`/forms?id=${formDetails.id}`}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                            Öffnen
                          </Link>
                        </div>
                        <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell className="px-3 py-2 w-[120px] bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400">Name</TableCell>
                                <TableCell className="px-3 py-2 text-sm text-gray-900 dark:text-white">{formDetails.name}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                                <TableCell className="px-3 py-2"><StatusBadge status={formDetails.isActive ? "active" : "inactive"} /></TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400">URL</TableCell>
                                <TableCell className="px-3 py-2">
                                  <a
                                    href={formDetails.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block">
                                    {formDetails.url}
                                  </a>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )
                  );
                })()}

                {/* Payment Method Details Table */}
                {(() => {
                  const pmDetails = getPaymentMethodDetails(selectedTestRunData.paymentMethodId);
                  const getPaymentTypeLabel = (type: string) => {
                    switch (type) {
                      case "paypal":
                        return "PayPal";
                      case "sepa":
                        return "SEPA Lastschrift";
                      case "creditcard":
                        return "Kreditkarte";
                      case "eps":
                        return "EPS";
                      default:
                        return type;
                    }
                  };
                  const getMaskedDetails = (pm: typeof pmDetails) => {
                    if (!pm) return "";
                    switch (pm.type) {
                      case "paypal":
                        return pm.details.email || "";
                      case "sepa":
                        return pm.details.accountHolder || (pm.details.iban ? `***${pm.details.iban.slice(-4)}` : "");
                      case "creditcard":
                        return pm.details.cardNumber ? `****${pm.details.cardNumber.slice(-4)}` : "";
                      case "eps":
                        return pm.details.bankCode || "";
                      default:
                        return "";
                    }
                  };
                  return (
                    pmDetails && (
                      <div className="mb-6 pb-6 border-b dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Bezahlmethode</label>
                          <Link
                            to={`/payment-methods?id=${pmDetails.id}`}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                            Öffnen
                          </Link>
                        </div>
                        <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell className="px-3 py-2 w-[120px] bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400">Name</TableCell>
                                <TableCell className="px-3 py-2 text-sm text-gray-900 dark:text-white">{pmDetails.name}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                                <TableCell className="px-3 py-2"><StatusBadge status={pmDetails.isActive ? "active" : "inactive"} /></TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400">Typ</TableCell>
                                <TableCell className="px-3 py-2 text-sm text-gray-900 dark:text-white">{getPaymentTypeLabel(pmDetails.type)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400">Details</TableCell>
                                <TableCell className="px-3 py-2 text-sm text-gray-900 dark:text-white font-mono">{getMaskedDetails(pmDetails)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )
                  );
                })()}

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

                {/* Screenshot Gallery */}
                <ScreenshotViewer
                  screenshotPath={selectedTestRunData.screenshotPath}
                  testName={`${getFormName(selectedTestRunData.formId)} × ${getPaymentMethodName(selectedTestRunData.paymentMethodId)}`}
                />

                {/* Notes */}
                <div className="mb-6 pb-6 border-b dark:border-gray-700">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Notes
                    {isSavingNotes && <span className="ml-2 text-xs text-gray-400">(saving...)</span>}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Add notes about this test run..."
                    className="w-full h-24 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-md resize-none !focus:outline-0 !focus:ring-0 !focus:ring-offset-0 !focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>

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
