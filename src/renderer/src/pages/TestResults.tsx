import React, { useState, useEffect, useMemo, memo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTestRunsStore } from "../store/useTestRunsStore";
import { useFormsStore } from "../store/useFormsStore";
import { CONFIG } from "../app.config";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import TestQueueStatus from "../components/TestQueueStatus";
import SelectionActionBar from "../components/SelectionActionBar";
// TestRunDialog is handled by Layout component via global events
import Button from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";
import { Checkbox } from "../components/ui/Checkbox";
import { FileJson, Copy, Trash2, AlertCircle, Play, CheckCircle2, Bot, User, XCircle, Square, Download, FileSpreadsheet, Clock, GitCompare } from "lucide-react";
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
import { useTableSelection, computeIsAllSelected, computeIsPartialSelected } from "../hooks/useTableSelection";
import ScreenshotViewer from "../components/ScreenshotViewer";
import SeoResultsCard from "../components/SeoResultsCard";
import AccessibilityResultsCard from "../components/AccessibilityResultsCard";
import TestRunComparison from "../components/TestRunComparison";

// Helper to get start time - SQLite CURRENT_TIMESTAMP stores UTC
const getStartTime = (runAt: Date | string): number => {
  if (runAt instanceof Date) {
    return runAt.getTime();
  }
  const dateStr = String(runAt);
  if (!dateStr.includes("T") && !dateStr.includes("Z")) {
    const utcDate = new Date(dateStr.replace(" ", "T") + "Z");
    return utcDate.getTime();
  }
  return new Date(dateStr).getTime();
};

// Format elapsed time as mm:ss
const formatElapsedTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// Format interval value to human-readable text
const formatInterval = (interval: string | undefined): string => {
  if (!interval) return "-";
  switch (interval) {
    case "0": return "Einmalig";
    case "1": return "Monatlich";
    case "3": return "Quartal";
    case "6": return "Halbjahr";
    case "12": return "Jährlich";
    default: return interval;
  }
};

// Separate component for the timer cell - only this re-renders every second
const RunningTimer: React.FC<{ runAt: Date | string; isRunning: boolean }> = memo(({ runAt, isRunning }) => {
  const [elapsed, setElapsed] = useState(() => {
    const startTime = getStartTime(runAt);
    return Math.max(0, Math.floor((Date.now() - startTime) / 1000));
  });

  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      const startTime = getStartTime(runAt);
      setElapsed(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [runAt, isRunning]);

  return (
    <span className={`text-[10px] font-mono tabular-nums ${isRunning ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"}`}>
      {formatElapsedTime(elapsed)}
    </span>
  );
});

const TestResultsSkeleton = () => (
  <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm overflow-hidden">
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

const TestTimeline: React.FC<{ steps?: TestStep[]; logDetails?: string; status: string }> = ({ steps: structuredSteps, status }) => {
  const getStepIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case "success":
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />;
      case "error":
        return <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />;
      case "skipped":
        return <AlertCircle className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />;
      case "running":
        return <Play className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />;
    }
  };

  const getTextColor = (stepStatus: string) => {
    switch (stepStatus) {
      case "success":
        return "text-green-700 dark:text-green-400";
      case "error":
        return "text-red-700 dark:text-red-400";
      case "skipped":
        return "text-yellow-700 dark:text-yellow-400";
      default:
        return "text-neutral-700 dark:text-neutral-300";
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return null;
    try {
      return new Date(timestamp).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return timestamp;
    }
  };

  const formatDurationMs = (ms?: number) => {
    if (!ms) return null;
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Format metadata inline - only show specific useful fields
  const formatMetadataInline = (metadata?: Record<string, any>): string | null => {
    if (!metadata || Object.keys(metadata).length === 0) return null;
    
    const parts: string[] = [];
    // Only include specific fields we want to display, ignore numeric 0 values and internal fields
    if (metadata.fieldsFound && metadata.fieldsFound > 0) parts.push(`${metadata.fieldsFound} Felder`);
    if (metadata.fieldsFilled && metadata.fieldsFilled > 0) parts.push(`${metadata.fieldsFilled} ausgefüllt`);
    if (metadata.formType && typeof metadata.formType === 'string') parts.push(metadata.formType);
    if (metadata.paymentMethod && typeof metadata.paymentMethod === 'string') parts.push(metadata.paymentMethod);
    if (metadata.cookieBannerFound !== undefined) parts.push(metadata.cookieBannerFound ? "Cookie-Banner" : "Kein Cookie-Banner");
    if (metadata.redirectUrl && typeof metadata.redirectUrl === 'string') parts.push(metadata.redirectUrl);
    if (metadata.paymentProvider && metadata.paymentProvider !== "Unknown" && typeof metadata.paymentProvider === 'string') parts.push(metadata.paymentProvider);
    
    // Explicitly ignore: interval, isValid, validationRules, successType, finalUrl, screenshotPath, screenshotType
    // These are internal fields that shouldn't be displayed to the user
    
    return parts.length > 0 ? parts.join(" · ") : null;
  };

  // Add final status step
  const finalStep: TestStep = {
    id: "final",
    name: status === "SUCCESS" ? "Test erfolgreich abgeschlossen" : status === "FAILURE" ? "Test fehlgeschlagen" : status === "SKIPPED" ? "Test übersprungen" : "Test läuft",
    status: status === "SUCCESS" ? "success" : status === "FAILURE" ? "error" : status === "SKIPPED" ? "skipped" : "running",
    startTime: new Date().toISOString(),
    message: status === "SUCCESS" ? "Alle Schritte erfolgreich durchgeführt" : status === "FAILURE" ? "Test mit Fehlern beendet" : undefined,
  };

  const allSteps = structuredSteps?.length ? [...structuredSteps, finalStep] : [finalStep];

  return (
    <div className="mb-6 pb-6 border-b dark:border-neutral-700">
      <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3">Test Timeline</label>
      <div className="relative pl-4">
        {/* Vertical timeline line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-neutral-200 dark:bg-neutral-700" />
        
        <div className="space-y-3">
          {allSteps.map((step, index) => {
            const metadataText = formatMetadataInline(step.metadata);
            
            return (
              <div key={step.id || index} className="relative flex items-start gap-3">
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0 -ml-4 mt-0.5">
                  {getStepIcon(step.status)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 -mt-0.5">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${getTextColor(step.status)}`}>
                      {step.name}
                    </span>
                    {step.duration && (
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                        {formatDurationMs(step.duration)}
                      </span>
                    )}
                  </div>
                  
                  {/* Message - only show if different from name AND error */}
                  {step.message && step.message !== step.name && step.message !== step.error && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {step.message}
                    </p>
                  )}
                  
                  {/* Inline metadata */}
                  {metadataText && (
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5">
                      {metadataText}
                    </p>
                  )}
                  
                  {/* Error - shown in gray like other messages */}
                  {step.error && typeof step.error === 'string' && step.error.length > 0 && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {step.error}
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex-shrink-0 text-right">
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                    {formatTimestamp(step.startTime)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Extended type for sorting with computed fields
interface TestRunWithComputed extends TestRun {
  formName?: string;
  paymentMethodName?: string;
}

// Helper function for status-based row background colors
const getStatusRowBg = (status: string, isSelected: boolean, isChecked: boolean): string => {
  if (isChecked) return "bg-blue-50 dark:bg-blue-900/30";
  if (isSelected) return "bg-neutral-100 dark:bg-neutral-700/50";
  
  switch (status) {
    case "SUCCESS":
      return "bg-green-50 dark:bg-green-950/30";
    case "FAILURE":
      return "bg-red-50 dark:bg-red-950/30";
    case "STOPPED":
      return "bg-purple-50 dark:bg-purple-950/30";
    case "SKIPPED":
      return "bg-yellow-50 dark:bg-yellow-950/30";
    default:
      return "bg-white dark:bg-neutral-800";
  }
};

const TestResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { testRuns, loadTestRuns, isLoading, error, runTests } = useTestRunsStore();
  const { forms, loadForms } = useFormsStore();
  const { paymentMethods, loadPaymentMethods } = usePaymentMethodsStore();
  const [selectedTestRun, setSelectedTestRun] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [notes, setNotes] = useState<string>("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  
  // Comparison mode state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonIds, setComparisonIds] = useState<[number | null, number | null]>([null, null]);
  const [showComparison, setShowComparison] = useState(false);
  
  // Table selection
  const {
    selectedIds,
    toggleItem,
    toggleAll,
    clearSelection,
    selectedCount,
    isSelected,
    getSelectedIds,
  } = useTableSelection<TestRunWithComputed>();

  useEffect(() => {
    loadTestRuns();
    loadForms();
    loadPaymentMethods();
  }, [loadTestRuns, loadForms, loadPaymentMethods]);

  // Compute form/payment names for sorting
  const testRunsWithNames = useMemo((): TestRunWithComputed[] => {
    return testRuns.map((tr) => ({
      ...tr,
      formName: tr.formId ? (forms.find((f) => f.id === tr.formId)?.name || `Form #${tr.formId}`) : "Gelöscht",
      paymentMethodName: tr.paymentMethodId ? (paymentMethods.find((p) => p.id === tr.paymentMethodId)?.name || `PM #${tr.paymentMethodId}`) : "Gelöscht",
    }));
  }, [testRuns, forms, paymentMethods]);

  // Split into running/queued and finished
  const runningTests = useMemo(() => testRunsWithNames.filter((tr) => tr.status === "RUNNING"), [testRunsWithNames]);
  const queuedTests = useMemo(() => testRunsWithNames.filter((tr) => tr.status === "QUEUED"), [testRunsWithNames]);
  const activeTests = useMemo(() => [...runningTests, ...queuedTests], [runningTests, queuedTests]);
  const finishedTests = useMemo(() => testRunsWithNames.filter((tr) => tr.status !== "RUNNING" && tr.status !== "QUEUED"), [testRunsWithNames]);

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

  const getFormName = (formId: number | null | undefined) => {
    if (!formId) {
      return "Gelöscht";
    }
    const form = forms.find((f) => f.id === formId);
    return form ? form.name : `Form #${formId}`;
  };

  const getFormIcon = (formId: number) => {
    const form = forms.find((f) => f.id === formId);
    return form?.icon || "FileText";
  };

  const getPaymentMethodName = (pmId: number | null | undefined) => {
    if (!pmId) {
      return "Gelöscht";
    }
    const pm = paymentMethods.find((p) => p.id === pmId);
    return pm ? pm.name : `Payment Method #${pmId}`;
  };

  const getPaymentMethodIcon = (pmId: number) => {
    const pm = paymentMethods.find((p) => p.id === pmId);
    return pm?.icon || getDefaultPaymentIcon(pm?.type || "creditcard");
  };

  // Get form details for drawer
  const getFormDetails = (formId: number) => {
    return forms.find((f) => f.id === formId);
  };

  // Get payment method details for drawer
  const getPaymentMethodDetails = (pmId: number) => {
    return paymentMethods.find((p) => p.id === pmId);
  };

  // Comparison handlers
  const handleToggleComparisonMode = () => {
    if (comparisonMode) {
      // Exit comparison mode
      setComparisonMode(false);
      setComparisonIds([null, null]);
      setShowComparison(false);
    } else {
      // Enter comparison mode
      setComparisonMode(true);
      setComparisonIds([null, null]);
    }
  };

  const handleComparisonSelect = (id: number) => {
    if (!comparisonMode) return;
    
    const [first, second] = comparisonIds;
    
    if (first === id) {
      // Deselect first
      setComparisonIds([second, null]);
    } else if (second === id) {
      // Deselect second
      setComparisonIds([first, null]);
    } else if (first === null) {
      // Select as first
      setComparisonIds([id, second]);
    } else if (second === null) {
      // Select as second
      setComparisonIds([first, id]);
    } else {
      // Both selected, replace second
      setComparisonIds([first, id]);
    }
  };

  const isComparisonSelected = (id: number) => {
    return comparisonIds[0] === id || comparisonIds[1] === id;
  };

  const canCompare = comparisonIds[0] !== null && comparisonIds[1] !== null;

  const comparisonRuns = useMemo(() => {
    if (!canCompare) return null;
    const left = testRuns.find((tr) => tr.id === comparisonIds[0]);
    const right = testRuns.find((tr) => tr.id === comparisonIds[1]);
    if (!left || !right) return null;
    // Sort by date - older first
    const leftDate = new Date(left.runAt).getTime();
    const rightDate = new Date(right.runAt).getTime();
    return leftDate <= rightDate ? { left, right } : { left: right, right: left };
  }, [comparisonIds, testRuns, canCompare]);

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

      // Run the test again with the same amount and interval as the original test
      await window.api.tests.run([form.id], [paymentMethod.id], {
        customAmount: testRun.amount || undefined,
        customInterval: testRun.interval || undefined,
      });

      // Refresh the test runs list
      await loadTestRuns();
    } catch (error) {
      console.error("Failed to run test again:", error);
    }
  };

  // Bulk delete selected tests
  const handleBulkDelete = async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;

    const deletedCount = ids.length;
    setIsBulkDeleting(true);
    try {
      // Delete each test run
      for (const id of ids) {
        await window.api.testRuns.delete(id);
      }
      await loadTestRuns();
      clearSelection();
      setShowBulkDeleteConfirm(false);

      // Adjust pagination if current page becomes empty
      const remainingItems = totalFilteredItems - deletedCount;
      if (remainingItems > 0) {
        const newTotalPages = Math.ceil(remainingItems / itemsPerPage);
        if (currentPage > newTotalPages) {
          setCurrentPage(Math.max(1, newTotalPages));
        }
      }
    } catch (error) {
      console.error("Failed to bulk delete test runs:", error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Bulk run selected tests again
  const handleBulkRunAgain = async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;

    setIsBulkRunning(true);
    try {
      // Get unique form/payment method/amount/interval combinations from selected tests
      const selectedTests = finishedTests.filter((tr) => ids.includes(tr.id));
      
      // Group by form, payment method, amount, and interval to preserve original test parameters
      const combinations = new Map<string, { formId: number; paymentMethodId: number; amount?: string; interval?: string }>();
      for (const test of selectedTests) {
        const key = `${test.formId}-${test.paymentMethodId}-${test.amount ?? 'default'}-${test.interval ?? 'default'}`;
        if (!combinations.has(key)) {
          combinations.set(key, { 
            formId: test.formId, 
            paymentMethodId: test.paymentMethodId,
            amount: test.amount,
            interval: test.interval
          });
        }
      }

      // Run each unique combination with its original amount and interval
      for (const combo of combinations.values()) {
        await window.api.tests.run([combo.formId], [combo.paymentMethodId], {
          customAmount: combo.amount || undefined,
          customInterval: combo.interval || undefined,
        });
      }

      await loadTestRuns();
      clearSelection();
    } catch (error) {
      console.error("Failed to bulk run tests:", error);
    } finally {
      setIsBulkRunning(false);
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
              {comparisonMode && (
                <>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {!canCompare ? "Wähle zwei Tests aus" : `#${comparisonIds[0]} & #${comparisonIds[1]}`}
                  </span>
                  <Button
                    onClick={() => setShowComparison(true)}
                    variant="primary"
                    size="sm"
                    disabled={!canCompare}
                    className="gap-2 font-mono text-[10px]">
                    <GitCompare size={12} />
                    Vergleichen
                  </Button>
                  <Button
                    onClick={handleToggleComparisonMode}
                    variant="secondary"
                    size="sm"
                    className="gap-2 font-mono text-[10px] border border-neutral-300 dark:border-neutral-600">
                    Vergleich beenden
                  </Button>
                </>
              )}
              {!comparisonMode && (
                <Button
                  onClick={handleToggleComparisonMode}
                  variant="ghost"
                  size="sm"
                  className="gap-2 font-mono text-[10px]">
                  <GitCompare size={12} />
                  Vergleichen
                </Button>
              )}
              <Button
                onClick={handleExportCsv}
                variant="ghost"
                size="sm"
                className="gap-2 font-mono text-[10px]">
                <FileSpreadsheet size={12} />
                CSV
              </Button>
              <Button
                onClick={handleExportAllJson}
                variant="ghost"
                size="sm"
                 className="gap-2 font-mono text-[10px]">
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
            <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Laufende Tests ({runningTests.length}
              {queuedTests.length > 0 ? ` + ${queuedTests.length} in Warteschlange` : ""})
            </h2>
            <TestQueueStatus onRefresh={loadTestRuns} />
          </div>
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 w-[80px]">UUID</TableHead>
                    <TableHead className="px-4 w-[70px] text-left"><Bot size={14} className="inline" /></TableHead>
                    <TableHead className="px-4 min-w-[160px]">Formular</TableHead>
                    <TableHead className="px-4 min-w-[160px]">Bezahlmethode</TableHead>
                    <TableHead className="px-4 w-[80px]">Betrag</TableHead>
                    <TableHead className="px-4 w-[100px]">Intervall</TableHead>
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
                        className={`cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${isSelected ? "bg-neutral-100 dark:bg-neutral-700" : isRunning ? "animate-blink-running" : isQueued ? "bg-neutral-50/50 dark:bg-neutral-800/50" : "bg-white dark:bg-neutral-800"}`}
                        onClick={() => handleSelectTestRun(testRun.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelectTestRun(testRun.id);
                          }
                        }}>
                        <TableCell className="px-4">
                          <div className="flex items-center gap-1 group">
                            <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">{testRun.uuid ? testRun.uuid.substring(0, 8) : `ID:${testRun.id}`}</span>
                            {testRun.uuid && (
                              <button
                                onClick={(e) => handleCopyUuid(e, testRun.uuid)}
                                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity"
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
                            <span className="flex-shrink-0 text-neutral-500 dark:text-neutral-400">
                              {renderIcon(getFormIcon(testRun.formId), 14)}
                            </span>
                            <div className="text-xs font-medium text-neutral-900 dark:text-white truncate">
                              {testRun.formName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="flex-shrink-0 text-neutral-500 dark:text-neutral-400">
                              {renderIcon(getPaymentMethodIcon(testRun.paymentMethodId), 14)}
                            </span>
                            <div className="text-xs font-medium text-neutral-900 dark:text-white truncate">
                              {testRun.paymentMethodName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                          {testRun.amount ? `${testRun.amount} €` : "-"}
                        </TableCell>
                        <TableCell className="px-4 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                          {formatInterval(testRun.interval)}
                        </TableCell>
                        <TableCell className="px-4 text-[10px] font-mono text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{formatDateTime(testRun.runAt)}</TableCell>
                        <TableCell className="px-4">
                          <RunningTimer runAt={testRun.runAt} isRunning={isRunning} />
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
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
            <CheckCircle2 size={12} className="text-neutral-400 dark:text-neutral-500" />
            Ausgeführte Tests ({totalFilteredItems})
          </h2>
        </div>

        {/* Filter Bar with Selection Actions */}
        <TableFilter
          searchTerm={filterConfig.searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Tests durchsuchen..."
          statusFilter={filterConfig.statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={statusOptions}
          onClear={clearFilters}
          rightContent={
            selectedCount > 0 ? (
              <SelectionActionBar
                selectedCount={selectedCount}
                onClear={clearSelection}
                itemLabel="Tests"
                actions={[
                  {
                    label: "Erneut testen",
                    icon: <Play size={14} />,
                    onClick: handleBulkRunAgain,
                    variant: "secondary",
                    loading: isBulkRunning,
                  },
                  {
                    label: "Löschen",
                    icon: <Trash2 size={14} />,
                    onClick: () => setShowBulkDeleteConfirm(true),
                    variant: "danger",
                  },
                ]}
              />
            ) : undefined
          }
        />

        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm overflow-hidden">
          {isLoading && testRuns.length === 0 ? (
            <TestResultsSkeleton />
          ) : sortedFinishedTests.length === 0 ? (
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-neutral-500 dark:text-neutral-400 mb-4">{finishedTests.length === 0 ? "Noch keine abgeschlossenen Tests." : "Keine Tests gefunden."}</div>
                <p className="text-neutral-500 dark:text-neutral-400">{finishedTests.length === 0 ? "Führe Tests aus, um Ergebnisse hier zu sehen." : "Versuche andere Suchbegriffe oder Filter."}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 w-[40px]">
                      <Checkbox
                        checked={computeIsAllSelected(sortedFinishedTests, selectedIds)}
                        indeterminate={computeIsPartialSelected(sortedFinishedTests, selectedIds)}
                        onCheckedChange={() => toggleAll(sortedFinishedTests)}
                        aria-label="Alle auswählen"
                      />
                    </TableHead>
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
                      className="px-4 w-[80px]"
                      sortDirection={getSortDirection("amount")}
                      onSort={() => requestSort("amount")}>
                      Betrag
                    </SortableTableHead>
                    <SortableTableHead
                      className="px-4 w-[100px]"
                      sortDirection={getSortDirection("interval")}
                      onSort={() => requestSort("interval")}>
                      Intervall
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
                    const isRowSelected = selectedTestRun === testRun.id;
                    const isChecked = isSelected(testRun.id);
                    const isCompSelected = isComparisonSelected(testRun.id);
                    return (
                      <TableRow
                        key={testRun.id}
                        tabIndex={0}
                        role="button"
                        aria-selected={isRowSelected}
                        className={`cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                          comparisonMode && isCompSelected 
                            ? "bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500 ring-inset" 
                            : getStatusRowBg(testRun.status, isRowSelected, isChecked)
                        }`}
                        onClick={() => comparisonMode ? handleComparisonSelect(testRun.id) : handleSelectTestRun(testRun.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            comparisonMode ? handleComparisonSelect(testRun.id) : handleSelectTestRun(testRun.id);
                          }
                        }}>
                        <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleItem(testRun.id)}
                            aria-label={`${testRun.formName} auswählen`}
                          />
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center gap-1 group">
                            <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">{testRun.uuid ? testRun.uuid.substring(0, 8) : `ID:${testRun.id}`}</span>
                            {testRun.uuid && (
                              <button
                                onClick={(e) => handleCopyUuid(e, testRun.uuid)}
                                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity"
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
                            <span className="flex-shrink-0 text-neutral-500 dark:text-neutral-400">
                              {renderIcon(getFormIcon(testRun.formId), 14)}
                            </span>
                            <div className="text-xs font-medium text-neutral-900 dark:text-white truncate">
                              {testRun.formName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="flex-shrink-0 text-neutral-500 dark:text-neutral-400">
                              {renderIcon(getPaymentMethodIcon(testRun.paymentMethodId), 14)}
                            </span>
                            <div className="text-xs font-medium text-neutral-900 dark:text-white truncate">
                              {testRun.paymentMethodName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                          {testRun.amount ? `${testRun.amount} €` : "-"}
                        </TableCell>
                        <TableCell className="px-4 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                          {formatInterval(testRun.interval)}
                        </TableCell>
                        <TableCell className="px-4 text-[10px] font-mono text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{formatDateTime(testRun.runAt)}</TableCell>
                        <TableCell className="px-4 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">{formatDuration(testRun.durationMs)}</TableCell>
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
          <div className="items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
           
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
                    <span className="text-neutral-300 dark:text-neutral-700">
                      {renderIcon(getFormIcon(selectedTestRunData.formId), 48)}
                    </span>
                    {getFormName(selectedTestRunData.formId)}
                    <span className="text-neutral-400 dark:text-neutral-500 font-normal">×</span>
                    <span className="text-neutral-300 dark:text-neutral-700">
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
                <div className="mb-6 pb-6 border-b dark:border-neutral-700">
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3">Test Infos</label>
                  <div className="border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="px-3 py-2 w-[120px] bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">ID</TableCell>
                          <TableCell className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <code className="text-xs truncate font-mono bg-neutral-100 dark:bg-neutral-900/50 px-1.5 py-0.5 rounded text-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">{selectedTestRunData.uuid || selectedTestRunData.id}</code>
                              {selectedTestRunData.uuid && (
                                <button
                                  onClick={(e) => handleCopyUuid(e, selectedTestRunData.uuid!)}
                                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                  title="ID kopieren">
                                  <Copy size={12} />
                                </button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Status</TableCell>
                          <TableCell className="px-3 py-2"><StatusBadge status={selectedTestRunData.status} /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Dauer</TableCell>
                          <TableCell className="px-3 py-2 text-sm text-neutral-900 dark:text-white font-mono">
                            {selectedTestRunData.status === "RUNNING" ? (
                              <RunningTimer runAt={selectedTestRunData.runAt} isRunning={true} />
                            ) : (
                              formatDuration(selectedTestRunData.durationMs)
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Zeitpunkt</TableCell>
                          <TableCell className="px-3 py-2 text-sm text-neutral-900 dark:text-white font-mono">{formatDateTime(selectedTestRunData.runAt)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Betrag</TableCell>
                          <TableCell className="px-3 py-2 text-sm text-neutral-900 dark:text-white font-mono">{selectedTestRunData.amount ? `${selectedTestRunData.amount} €` : "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Intervall</TableCell>
                          <TableCell className="px-3 py-2 text-sm text-neutral-900 dark:text-white">{formatInterval(selectedTestRunData.interval)}</TableCell>
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
                      <div className="mb-6 pb-6 border-b dark:border-neutral-700">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400">Formular</label>
                          <Link
                            to={`/forms?id=${formDetails.id}`}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                            Öffnen
                          </Link>
                        </div>
                        <div className="border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell className="px-3 py-2 w-[120px] bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Name</TableCell>
                                <TableCell className="px-3 py-2 text-sm text-neutral-900 dark:text-white">{formDetails.name}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Status</TableCell>
                                <TableCell className="px-3 py-2"><StatusBadge status={formDetails.isActive ? "active" : "inactive"} /></TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">URL</TableCell>
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
                      <div className="mb-6 pb-6 border-b dark:border-neutral-700">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400">Bezahlmethode</label>
                          <Link
                            to={`/payment-methods?id=${pmDetails.id}`}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                            Öffnen
                          </Link>
                        </div>
                        <div className="border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell className="px-3 py-2 w-[120px] bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Name</TableCell>
                                <TableCell className="px-3 py-2 text-sm text-neutral-900 dark:text-white">{pmDetails.name}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Status</TableCell>
                                <TableCell className="px-3 py-2"><StatusBadge status={pmDetails.isActive ? "active" : "inactive"} /></TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Typ</TableCell>
                                <TableCell className="px-3 py-2 text-sm text-neutral-900 dark:text-white">{getPaymentTypeLabel(pmDetails.type)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Details</TableCell>
                                <TableCell className="px-3 py-2 text-sm text-neutral-900 dark:text-white font-mono">{getMaskedDetails(pmDetails)}</TableCell>
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
                  <div className="mb-6 pb-6 border-b dark:border-neutral-700 ">
                    <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Error Message</label>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200 font-mono">{selectedTestRunData.errorMessage}</div>
                  </div>
                )}

                {/* Quality Test Results */}
                {(selectedTestRunData.seoResults || selectedTestRunData.accessibilityResults) && (
                  <div className="mb-6 pb-6 border-b dark:border-neutral-700">
                    <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3">Qualitätstests</label>
                    <div className="space-y-3">
                      {selectedTestRunData.seoResults && (
                        <SeoResultsCard results={selectedTestRunData.seoResults} />
                      )}
                      {selectedTestRunData.accessibilityResults && (
                        <AccessibilityResultsCard results={selectedTestRunData.accessibilityResults} />
                      )}
                    </div>
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
                <div className="mb-6 pb-6 border-b dark:border-neutral-700">
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                    Notizen
                    {isSavingNotes && <span className="ml-2 text-xs text-neutral-400">(saving...)</span>}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Notizen zu diesen Test hinzufügen"
                    className="w-full h-24 px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-md resize-none !focus:outline-0 !focus:ring-0 !focus:ring-offset-0 !focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>

                {/* Export Button */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
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

      {/* Bulk Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Tests löschen"
        message={`Sind Sie sicher, dass Sie ${selectedCount} Test(s) löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`}
        itemName={`${selectedCount} ausgewählte Tests`}
        isLoading={isBulkDeleting}
      />

      {/* Comparison Drawer */}
      <Drawer
        open={showComparison && comparisonRuns !== null}
        onOpenChange={(open) => !open && setShowComparison(false)}>
        <DrawerContent className="w-[900px]">
          {comparisonRuns && (
            <TestRunComparison
              leftRun={comparisonRuns.left}
              rightRun={comparisonRuns.right}
              leftFormName={getFormName(comparisonRuns.left.formId)}
              rightFormName={getFormName(comparisonRuns.right.formId)}
              leftPaymentName={getPaymentMethodName(comparisonRuns.left.paymentMethodId)}
              rightPaymentName={getPaymentMethodName(comparisonRuns.right.paymentMethodId)}
            />
          )}
        </DrawerContent>
      </Drawer>

      {/* TestRunDialog is handled by Layout component via global events */}
    </div>
  );
};

export default TestResults;
