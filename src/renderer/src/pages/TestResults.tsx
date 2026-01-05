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
import { StatusBadge, Badge } from "../components/ui/Badge";
import { Checkbox } from "../components/ui/Checkbox";
import { FileJson, Copy, Trash2, AlertCircle, Play, CheckCircle2, Bot, User, XCircle, Square, Download, FileSpreadsheet, Clock, GitCompare, ChevronDown, ChevronUp, Archive, Printer } from "lucide-react";
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
import SeoResultsCard from "../components/SeoResultsCard";
import AccessibilityResultsCard from "../components/AccessibilityResultsCard";
import TestRunComparison from "../components/TestRunComparison";
import { useTagsStore } from "../store/useTagsStore";
import { useFilterPresetsStore } from "../store/useFilterPresetsStore";
import TagSelector from "../components/TagSelector";
import ExportDialog from "../components/ExportDialog";
import type { ExportColumn } from "../components/ExportDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/Dialog";
import { Input } from "../components/ui/Input";

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
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };
  const getStepIcon = (stepStatus: string, isFinalStep: boolean = false) => {
    switch (stepStatus) {
      case "success":
        if (isFinalStep) {
          return <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />;
        }
        // Use filled checkmark for final step, outline for others
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

    // Enhanced metadata fields
    if (metadata.selector && typeof metadata.selector === 'string' && metadata.selector !== 'auto-detected' && metadata.selector !== 'not-found') {
      const selectorText = metadata.selector.length > 30 ? `${metadata.selector.substring(0, 30)}...` : metadata.selector
      parts.push(`Selector: ${selectorText}`)
    }
    if (metadata.waitTime && metadata.waitTime > 0) parts.push(`Wait: ${metadata.waitTime}ms`)
    if (metadata.timeout && metadata.timeout > 0) parts.push(`Timeout: ${metadata.timeout}ms`)
    if (metadata.networkRequests && metadata.networkRequests > 0) parts.push(`${metadata.networkRequests} Requests`)
    if (metadata.consoleErrors && metadata.consoleErrors > 0) parts.push(`${metadata.consoleErrors} Console Errors`)
    if (metadata.loadTime && metadata.loadTime > 0) parts.push(`Load: ${metadata.loadTime}ms`)
    if (metadata.strategy && typeof metadata.strategy === 'string') parts.push(`Strategy: ${metadata.strategy}`)

    // Explicitly ignore: interval, isValid, validationRules, successType, finalUrl, screenshotPath, screenshotType
    // These are internal fields that shouldn't be displayed to the user

    return parts.length > 0 ? parts.join(" · ") : null;
  };

  // Filter steps for stopped tests - only show test-stopped step
  let filteredSteps = structuredSteps || []
  if (status === "STOPPED") {
    filteredSteps = structuredSteps?.filter(step => step.id === 'test-stopped') || []
  }

  // Add final status step
  const finalStep: TestStep = {
    id: "final",
    name: status === "SUCCESS" ? "Test erfolgreich abgeschlossen" : status === "FAILURE" ? "Test fehlgeschlagen" : status === "SKIPPED" ? "Test übersprungen" : status === "STOPPED" ? "Test gestoppt" : "Test läuft",
    status: status === "SUCCESS" ? "success" : status === "FAILURE" ? "error" : status === "SKIPPED" ? "skipped" : status === "STOPPED" ? "stopped" : "running",
    startTime: new Date().toISOString(),
    message: status === "SUCCESS" ? "Alle Schritte erfolgreich durchgeführt" : status === "FAILURE" ? "Test mit Fehlern beendet" : undefined,
  };

  const allSteps = filteredSteps.length > 0 ? [...filteredSteps, finalStep] : [finalStep];

  return (
    <div className="mb-6 pb-6 border-b dark:border-neutral-700">
      <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3">Test Timeline</label>
      <div className="relative pl-4">
        {/* Vertical timeline line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-neutral-200 dark:bg-neutral-700" />

        <div className="space-y-3">
          {allSteps.map((step, index) => {
            const metadataText = formatMetadataInline(step.metadata);

            const isFinalStep = step.id === "final" && step.status === "success";

            return (
              <div key={step.id || index} className="relative flex items-start gap-3">
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0 -ml-4 mt-0.5">
                  <div className="bg-white dark:bg-neutral-800 rounded-full p-0.5">
                    {getStepIcon(step.status, isFinalStep)}
                  </div>
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

                  {/* Expandable detailed information */}
                  {(step.stackTrace || step.consoleLogs?.length || step.networkRequests?.length || step.metadata?.fields?.length) && (
                    <div className="mt-2">
                      <button
                        onClick={() => toggleStep(step.id || `step-${index}`)}
                        className="flex items-center gap-1 text-[10px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                      >
                        {expandedSteps.has(step.id || `step-${index}`) ? (
                          <>
                            <ChevronUp size={12} />
                            Details ausblenden
                          </>
                        ) : (
                          <>
                            <ChevronDown size={12} />
                            Details anzeigen
                          </>
                        )}
                      </button>

                      {expandedSteps.has(step.id || `step-${index}`) && (
                        <div className="mt-2 space-y-2 pl-2 border-l-2 border-neutral-200 dark:border-neutral-700">
                          {/* Stack Trace */}
                          {step.stackTrace && (
                            <div>
                              <p className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">Stack Trace:</p>
                              <pre className="text-[9px] text-neutral-500 dark:text-neutral-400 font-mono bg-neutral-50 dark:bg-neutral-800 p-2 rounded overflow-x-auto max-h-40 overflow-y-auto">
                                {step.stackTrace}
                              </pre>
                            </div>
                          )}

                          {/* Console Logs */}
                          {step.consoleLogs && step.consoleLogs.length > 0 && (
                            <div>
                              <p className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">Console Logs ({step.consoleLogs.length}):</p>
                              <div className="text-[9px] text-neutral-500 dark:text-neutral-400 font-mono bg-neutral-50 dark:bg-neutral-800 p-2 rounded max-h-40 overflow-y-auto space-y-1">
                                {step.consoleLogs.slice(0, 20).map((log, i) => (
                                  <div key={i} className="truncate">{log}</div>
                                ))}
                                {step.consoleLogs.length > 20 && (
                                  <div className="text-neutral-400">... und {step.consoleLogs.length - 20} weitere</div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Network Requests */}
                          {step.networkRequests && step.networkRequests.length > 0 && (
                            <div>
                              <p className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">Network Requests ({step.networkRequests.length}):</p>
                              <div className="text-[9px] text-neutral-500 dark:text-neutral-400 font-mono bg-neutral-50 dark:bg-neutral-800 p-2 rounded max-h-40 overflow-y-auto space-y-1">
                                {step.networkRequests.slice(0, 10).map((req, i) => (
                                  <div key={i} className="truncate">
                                    {req.method} {req.status || 'pending'} - {req.url.length > 60 ? `${req.url.substring(0, 60)}...` : req.url}
                                    {req.responseTime && ` (${req.responseTime}ms)`}
                                  </div>
                                ))}
                                {step.networkRequests.length > 10 && (
                                  <div className="text-neutral-400">... und {step.networkRequests.length - 10} weitere</div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Form Field Values */}
                          {step.metadata?.fields && Array.isArray(step.metadata.fields) && step.metadata.fields.length > 0 && (
                            <div>
                              <p className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">Form Fields ({step.metadata.fields.length}):</p>
                              <div className="text-[9px] text-neutral-500 dark:text-neutral-400 font-mono bg-neutral-50 dark:bg-neutral-800 p-2 rounded max-h-40 overflow-y-auto space-y-1">
                                {step.metadata.fields.map((field: any, i: number) => (
                                  <div key={i} className="truncate">
                                    {field.name || field.selector}: {field.type} = {field.value || '(empty)'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
  const { tags, loadTags } = useTagsStore();
  const { presets, loadPresets, createPreset, deletePreset } = useFilterPresetsStore();
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem('testResults_selectedPreset');
      return stored ? parseInt(stored) : null;
    } catch {
      return null;
    }
  });
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [selectedTestRun, setSelectedTestRun] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [notes, setNotes] = useState<string>("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showArchived, setShowArchived] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('testResults_showArchived');
      return stored === 'true';
    } catch {
      return false;
    }
  });
  const [isBulkArchiving, setIsBulkArchiving] = useState(false);
  const [isBulkUnarchiving, setIsBulkUnarchiving] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | null>(null);
  const [groupBy, setGroupBy] = useState<('form' | 'paymentMethod' | 'date' | null)[]>(() => {
    try {
      const stored = localStorage.getItem('testResults_groupBy');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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
    loadTestRuns(showArchived);
    loadForms();
    loadPaymentMethods();
    loadTags();
    loadPresets();
  }, [loadTestRuns, loadForms, loadPaymentMethods, loadTags, loadPresets, showArchived]);

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
  const finishedTests = useMemo(() => {
    const finished = testRunsWithNames.filter((tr) => tr.status !== "RUNNING" && tr.status !== "QUEUED");
    // Filter out archived tests by default unless showArchived is true
    if (!showArchived) {
      return finished.filter((tr) => !tr.isArchived);
    }
    return finished;
  }, [testRunsWithNames, showArchived]);

  // Auto-refresh when tests are running or queued - poll every 2 seconds
  useEffect(() => {
    if (activeTests.length === 0) return;

    const refreshInterval = setInterval(() => {
      loadTestRuns(showArchived);
    }, 2000);

    return () => clearInterval(refreshInterval);
  }, [activeTests.length, loadTestRuns, showArchived]);

  // Persist showArchived preference
  useEffect(() => {
    try {
      localStorage.setItem('testResults_showArchived', String(showArchived));
    } catch (e) {
      console.warn('Failed to save showArchived preference:', e);
    }
  }, [showArchived]);

  // Tag filter state
  const [tagFilter, setTagFilter] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('testResults_tagFilter');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Filtering for finished tests (with localStorage persistence)
  const {
    filteredItems: baseFilteredFinishedTests,
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

  // Apply tag filter
  const filteredFinishedTests = useMemo(() => {
    if (tagFilter.length === 0) return baseFilteredFinishedTests;
    const tagNames = tagFilter.map(id => tags.find(t => t.id === id)?.name).filter(Boolean) as string[];
    return baseFilteredFinishedTests.filter(test => {
      if (!test.tags || test.tags.length === 0) return false;
      return tagNames.some(tagName => test.tags?.includes(tagName));
    });
  }, [baseFilteredFinishedTests, tagFilter, tags]);

  // Persist tag filter
  useEffect(() => {
    try {
      localStorage.setItem('testResults_tagFilter', JSON.stringify(tagFilter));
    } catch (e) {
      console.warn('Failed to save tag filter:', e);
    }
  }, [tagFilter]);

  // Group test runs
  const groupTestRuns = (tests: TestRunWithComputed[]): Record<string, TestRunWithComputed[]> => {
    if (groupBy.length === 0) {
      return { 'all': tests };
    }

    const grouped: Record<string, TestRunWithComputed[]> = {};

    tests.forEach(test => {
      const keys: string[] = [];
      
      groupBy.forEach(groupKey => {
        switch (groupKey) {
          case 'form':
            keys.push(`form:${test.formName || 'Unbekannt'}`);
            break;
          case 'paymentMethod':
            keys.push(`pm:${test.paymentMethodName || 'Unbekannt'}`);
            break;
          case 'date':
            const date = new Date(test.runAt);
            const dateKey = date.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
            keys.push(`date:${dateKey}`);
            break;
        }
      });

      const groupKey = keys.join(' > ');
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(test);
    });

    return grouped;
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

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

  // Group sorted tests
  const groupedTests = useMemo(() => {
    return groupTestRuns(allSortedFinishedTests);
  }, [allSortedFinishedTests, groupBy]);

  // Persist grouping preference
  useEffect(() => {
    try {
      localStorage.setItem('testResults_groupBy', JSON.stringify(groupBy));
    } catch (e) {
      console.warn('Failed to save grouping preference:', e);
    }
  }, [groupBy]);

  // Persist selected preset
  useEffect(() => {
    try {
      if (selectedPresetId) {
        localStorage.setItem('testResults_selectedPreset', String(selectedPresetId));
      } else {
        localStorage.removeItem('testResults_selectedPreset');
      }
    } catch (e) {
      console.warn('Failed to save selected preset:', e);
    }
  }, [selectedPresetId]);

  // Apply preset when selected
  useEffect(() => {
    if (selectedPresetId) {
      const preset = presets.find(p => p.id === selectedPresetId);
      if (preset && preset.filterConfig) {
        if (preset.filterConfig.searchTerm !== undefined) {
          setSearchTerm(preset.filterConfig.searchTerm || "");
        }
        if (preset.filterConfig.statusFilter !== undefined) {
          setStatusFilter(preset.filterConfig.statusFilter || undefined);
        }
        if (preset.filterConfig.tagFilter !== undefined) {
          setTagFilter(preset.filterConfig.tagFilter || []);
        }
        if (preset.filterConfig.showArchived !== undefined) {
          setShowArchived(preset.filterConfig.showArchived || false);
        }
        if (preset.filterConfig.groupBy !== undefined) {
          setGroupBy(preset.filterConfig.groupBy || []);
        }
      }
    }
  }, [selectedPresetId, presets]);

  // Save current filters as preset
  const handleSavePreset = async () => {
    if (!presetName.trim()) return;
    const currentFilterConfig = {
      searchTerm: filterConfig.searchTerm || "",
      statusFilter: filterConfig.statusFilter,
      tagFilter: tagFilter,
      showArchived: showArchived,
      groupBy: groupBy,
    };
    await createPreset(presetName.trim(), currentFilterConfig);
    setPresetName("");
    setShowPresetDialog(false);
  };

  // Delete preset
  const handleDeletePreset = async (id: number) => {
    await deletePreset(id);
    if (selectedPresetId === id) {
      setSelectedPresetId(null);
    }
  };

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

  const getFormIcon = (formId: number | null | undefined) => {
    if (!formId) return "FileText";
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

  const getPaymentMethodIcon = (pmId: number | null | undefined) => {
    if (!pmId) return getDefaultPaymentIcon("creditcard");
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
      await loadTestRuns(showArchived);
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

  // Bulk archive selected tests
  const handleBulkArchive = async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;

    setIsBulkArchiving(true);
    try {
      await window.api.testRuns.archiveBulk(ids);
      await loadTestRuns(showArchived);
      clearSelection();
    } catch (error) {
      console.error("Failed to bulk archive test runs:", error);
    } finally {
      setIsBulkArchiving(false);
    }
  };

  // Bulk unarchive selected tests
  const handleBulkUnarchive = async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;

    setIsBulkUnarchiving(true);
    try {
      await window.api.testRuns.unarchiveBulk(ids);
      await loadTestRuns(showArchived);
      clearSelection();
    } catch (error) {
      console.error("Failed to bulk unarchive test runs:", error);
    } finally {
      setIsBulkUnarchiving(false);
    }
  };

  // Bulk run selected tests again
  const handleBulkRunAgain = async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;

    setIsBulkRunning(true);
    try {
      // Get unique form/payment method/amount/interval combinations from selected tests
      const selectedTests = finishedTests.filter((tr) => ids.includes(tr.id) && tr.formId && tr.paymentMethodId);

      // Group by form, payment method, amount, and interval to preserve original test parameters
      const combinations = new Map<string, { formId: number; paymentMethodId: number; amount?: string; interval?: string }>();
      for (const test of selectedTests) {
        if (!test.formId || !test.paymentMethodId) continue;
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

      await loadTestRuns(showArchived);
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
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // Sync notes and tags when selected test run changes
  useEffect(() => {
    if (selectedTestRunData) {
      setNotes(selectedTestRunData.notes || "");
      setSelectedTagIds(selectedTestRunData.tags?.map(tagName => {
        const tag = tags.find(t => t.name === tagName);
        return tag?.id || 0;
      }).filter(id => id > 0) || []);
    } else {
      setNotes("");
      setSelectedTagIds([]);
    }
  }, [selectedTestRunData?.id, selectedTestRunData?.notes, selectedTestRunData?.tags, tags]);

  // Debounced save notes
  const handleNotesChange = async (value: string) => {
    setNotes(value);

    if (!selectedTestRunData) return;

    setIsSavingNotes(true);
    try {
      await window.api.testRuns.updateNotes(selectedTestRunData.id, value);
      // Refresh to sync state so notes persist when drawer reopens
      await loadTestRuns(showArchived);
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Save tags
  const handleTagsChange = async (tagIds: number[]) => {
    setSelectedTagIds(tagIds);
    if (!selectedTestRunData) return;

    try {
      const tagNames = tagIds.map(id => {
        const tag = tags.find(t => t.id === id);
        return tag?.name || '';
      }).filter(name => name !== '');
      await window.api.testRuns.updateTags(selectedTestRunData.id, tagNames);
      await loadTestRuns(showArchived);
    } catch (error) {
      console.error("Failed to save tags:", error);
    }
  };

  const handleExportSingleJson = () => {
    if (!selectedTestRunData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedTestRunData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `test_result_${selectedTestRunData.uuid || selectedTestRunData.id}_${new Date(selectedTestRunData.runAt).toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Export columns configuration
  const exportColumns: ExportColumn[] = [
    { key: "id", label: "ID", defaultSelected: true },
    { key: "uuid", label: "UUID", defaultSelected: true },
    { key: "form", label: "Formular", defaultSelected: true },
    { key: "paymentMethod", label: "Bezahlmethode", defaultSelected: true },
    { key: "status", label: "Status", defaultSelected: true },
    { key: "duration", label: "Dauer", defaultSelected: true },
    { key: "error", label: "Fehler", defaultSelected: true },
    { key: "scheduled", label: "Geplant", defaultSelected: true },
    { key: "notes", label: "Notizen", defaultSelected: false },
    { key: "date", label: "Datum", defaultSelected: true },
    { key: "amount", label: "Betrag", defaultSelected: false },
    { key: "interval", label: "Intervall", defaultSelected: false },
  ];

  // Handle export with column selection and scope
  const handleExportWithOptions = (columns: string[], scope: "all" | "selected", selectedIds?: number[]) => {
    const testsToExport = scope === "selected" && selectedIds
      ? finishedTests.filter(tr => selectedIds.includes(tr.id))
      : finishedTests;

    if (exportFormat === "json") {
      handleExportJson(testsToExport, columns);
    } else if (exportFormat === "csv") {
      handleExportCsv(testsToExport, columns);
    }
  };

  // Export test results as JSON
  const handleExportJson = (tests: TestRunWithComputed[], selectedColumns: string[]) => {
    const columnMap: Record<string, (tr: TestRunWithComputed) => any> = {
      id: (tr) => tr.id,
      uuid: (tr) => tr.uuid,
      form: (tr) => ({ id: tr.formId, name: tr.formName }),
      paymentMethod: (tr) => ({ id: tr.paymentMethodId, name: tr.paymentMethodName }),
      status: (tr) => tr.status,
      duration: (tr) => tr.durationMs,
      error: (tr) => tr.errorMessage,
      scheduled: (tr) => tr.isScheduled,
      notes: (tr) => tr.notes,
      date: (tr) => tr.runAt,
      amount: (tr) => tr.amount,
      interval: (tr) => tr.interval,
    };

    const exportData = {
      exportedAt: new Date().toISOString(),
      totalResults: tests.length,
      results: tests.map((tr) => {
        const result: any = {};
        selectedColumns.forEach(col => {
          if (columnMap[col]) {
            result[col] = columnMap[col](tr);
          }
        });
        return result;
      }),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `test_results_export_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Export test results as CSV
  const handleExportCsv = (tests: TestRunWithComputed[], selectedColumns: string[]) => {
    const columnMap: Record<string, { header: string; value: (tr: TestRunWithComputed) => string }> = {
      id: { header: "ID", value: (tr) => String(tr.id) },
      uuid: { header: "UUID", value: (tr) => tr.uuid || "" },
      form: { header: "Formular", value: (tr) => tr.formName || "" },
      paymentMethod: { header: "Bezahlmethode", value: (tr) => tr.paymentMethodName || "" },
      status: { header: "Status", value: (tr) => tr.status },
      duration: { header: "Dauer (ms)", value: (tr) => String(tr.durationMs || "") },
      error: { header: "Fehler", value: (tr) => (tr.errorMessage || "").replace(/"/g, '""') },
      scheduled: { header: "Geplant", value: (tr) => tr.isScheduled ? "Ja" : "Nein" },
      notes: { header: "Notizen", value: (tr) => (tr.notes || "").replace(/"/g, '""').replace(/\n/g, " ") },
      date: { header: "Datum", value: (tr) => new Date(tr.runAt).toLocaleString("de-DE") },
      amount: { header: "Betrag", value: (tr) => tr.amount ? `${tr.amount} €` : "" },
      interval: { header: "Intervall", value: (tr) => formatInterval(tr.interval) },
    };

    const headers = selectedColumns.map(col => columnMap[col]?.header || col);
    const rows = tests.map((tr) =>
      selectedColumns.map(col => {
        const value = columnMap[col]?.value(tr) || "";
        return `"${value}"`;
      })
    );

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) => row.join(";")),
    ].join("\n");

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
                onClick={() => {
                  setExportFormat("csv");
                  setShowExportDialog(true);
                }}
                variant="ghost"
                size="sm"
                className="gap-2 font-mono text-[10px]">
                <FileSpreadsheet size={12} />
                CSV
              </Button>
              <Button
                onClick={() => {
                  setExportFormat("json");
                  setShowExportDialog(true);
                }}
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

        {/* Filter Preset Selector and Grouping */}
        <div className="flex items-center gap-2 mb-4">
          <Select
            value={selectedPresetId ? String(selectedPresetId) : "none"}
            onValueChange={(value) => {
              if (value === "none") {
                setSelectedPresetId(null);
              } else if (value === "save") {
                setShowPresetDialog(true);
              } else {
                setSelectedPresetId(parseInt(value));
              }
            }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter-Vorlage">
                {selectedPresetId
                  ? presets.find(p => p.id === selectedPresetId)?.name || "Vorlage"
                  : "Keine Vorlage"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Keine Vorlage</SelectItem>
              {presets.map(preset => (
                <SelectItem key={preset.id} value={String(preset.id)}>
                  {preset.name}
                </SelectItem>
              ))}
              <SelectItem value="save">+ Aktuelle Filter speichern</SelectItem>
            </SelectContent>
          </Select>
          {selectedPresetId && (
            <Button
              onClick={() => handleDeletePreset(selectedPresetId)}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-red-600 dark:text-red-400">
              <Trash2 size={14} />
              Vorlage löschen
            </Button>
          )}
          <Select
            value={groupBy.length === 0 ? "none" : groupBy.join(",")}
            onValueChange={(value) => {
              if (value === "none") {
                setGroupBy([]);
              } else {
                const groups = value.split(",").filter(Boolean) as ('form' | 'paymentMethod' | 'date')[];
                setGroupBy(groups);
              }
            }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Gruppierung">
                {groupBy.length === 0
                  ? "Keine Gruppierung"
                  : groupBy.map(g => {
                      switch (g) {
                        case 'form': return 'Formular';
                        case 'paymentMethod': return 'Bezahlmethode';
                        case 'date': return 'Datum';
                        default: return '';
                      }
                    }).join(' > ')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Keine Gruppierung</SelectItem>
              <SelectItem value="form">Nach Formular</SelectItem>
              <SelectItem value="paymentMethod">Nach Bezahlmethode</SelectItem>
              <SelectItem value="date">Nach Datum</SelectItem>
              <SelectItem value="form,paymentMethod">Formular {'>'} Bezahlmethode</SelectItem>
              <SelectItem value="form,date">Formular {'>'} Datum</SelectItem>
              <SelectItem value="paymentMethod,date">Bezahlmethode {'>'} Datum</SelectItem>
              <SelectItem value="form,paymentMethod,date">Formular {'>'} Bezahlmethode {'>'} Datum</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Bar with Selection Actions */}
        <TableFilter
          searchTerm={filterConfig.searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Tests durchsuchen..."
          statusFilter={filterConfig.statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={statusOptions}
          onClear={() => {
            clearFilters();
            setTagFilter([]);
          }}
          showArchived={showArchived}
          onShowArchivedChange={setShowArchived}
          tags={tags}
          selectedTagIds={tagFilter}
          onTagFilterChange={setTagFilter}
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
                  ...(showArchived
                    ? [
                        {
                          label: "Entarchivieren",
                          icon: <Archive size={14} />,
                          onClick: handleBulkUnarchive,
                          variant: "secondary" as const,
                          loading: isBulkUnarchiving,
                        },
                      ]
                    : [
                        {
                          label: "Archivieren",
                          icon: <Archive size={14} />,
                          onClick: handleBulkArchive,
                          variant: "secondary" as const,
                          loading: isBulkArchiving,
                        },
                      ]),
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
                    <TableHead className="px-4 w-[120px]">Tags</TableHead>
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
                        className={`cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${comparisonMode && isCompSelected
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
                        <TableCell className="px-4">
                          <div className="flex flex-wrap gap-1">
                            {testRun.tags && testRun.tags.length > 0 ? (
                              testRun.tags.slice(0, 2).map((tagName, idx) => {
                                const tag = tags.find(t => t.name === tagName);
                                if (!tag) return null;
                                return (
                                  <Badge
                                    key={idx}
                                    style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }}
                                    className="border text-[10px] px-1.5 py-0.5">
                                    {tag.name}
                                  </Badge>
                                );
                              })
                            ) : (
                              <span className="text-[10px] text-neutral-400 dark:text-neutral-500">-</span>
                            )}
                            {testRun.tags && testRun.tags.length > 2 && (
                              <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                +{testRun.tags.length - 2}
                              </span>
                            )}
                          </div>
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
                        if (selectedTestRunData.formId && selectedTestRunData.paymentMethodId) {
                          await runTests([selectedTestRunData.formId], [selectedTestRunData.paymentMethodId]);
                          handleSelectTestRun(null);
                        }
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
                        window.print();
                      }}
                      variant="secondary"
                      size="sm"
                      className="gap-1.5">
                      <Printer size={14} />
                      Drucken
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.print();
                      }}
                      variant="secondary"
                      size="sm"
                      className="gap-1.5 print:hidden">
                      <Printer size={14} />
                      Drucken
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
                      className="gap-1.5 print:hidden">
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
                    {selectedTestRunData.formId && (
                      <span className="text-neutral-300 dark:text-neutral-700">
                        {renderIcon(getFormIcon(selectedTestRunData.formId), 48)}
                      </span>
                    )}
                    {getFormName(selectedTestRunData.formId)}
                    <span className="text-neutral-400 dark:text-neutral-500 font-normal">×</span>
                    {selectedTestRunData.paymentMethodId && (
                      <span className="text-neutral-300 dark:text-neutral-700">
                        {renderIcon(getPaymentMethodIcon(selectedTestRunData.paymentMethodId), 48)}
                      </span>
                    )}
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
                  if (!selectedTestRunData.formId) return null;
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
                  if (!selectedTestRunData.paymentMethodId) return null;
                  const paymentMethodId = selectedTestRunData.paymentMethodId;
                  const pmDetails = getPaymentMethodDetails(paymentMethodId);
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


                {/* Tags */}
                <div className="mb-6 pb-6 border-b dark:border-neutral-700">
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                    Tags
                  </label>
                  <TagSelector
                    tags={tags}
                    selectedTagIds={selectedTagIds}
                    onSelectionChange={handleTagsChange}
                  />
                </div>

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
                    onClick={handleExportSingleJson}
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

      {/* Export Dialog */}
      {exportFormat && (
        <ExportDialog
          open={showExportDialog}
          onOpenChange={(open) => {
            setShowExportDialog(open);
            if (!open) setExportFormat(null);
          }}
          onExport={(columns, scope) => handleExportWithOptions(columns, scope, getSelectedIds())}
          columns={exportColumns}
          hasSelectedTests={selectedCount > 0}
          selectedCount={selectedCount}
          totalTests={finishedTests.length}
        />
      )}

      {/* Filter Preset Save Dialog */}
      <Dialog open={showPresetDialog} onOpenChange={setShowPresetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter-Vorlage speichern</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Name
              </label>
              <Input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="z.B. Fehlgeschlagene Tests letzte Woche"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && presetName.trim()) {
                    handleSavePreset();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setShowPresetDialog(false);
                setPresetName("");
              }}>
              Abbrechen
            </Button>
            <Button
              variant="primary"
              onClick={handleSavePreset}
              disabled={!presetName.trim()}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TestRunDialog is handled by Layout component via global events */}
    </div>
  );
};

export default TestResults;
