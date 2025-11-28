import { l as useSearchParams, e as useTestRunsStore, b as useFormsStore, d as usePaymentMethodsStore, r as reactExports, j as jsxRuntimeExports, B as Button, P as Play, N as formatDateTime, m as StatusBadge, O as formatDuration, Q as Link, i as dist, U as CircleX, K as CircleCheck } from "./index-9PvzplFq.js";
import { C as CONFIG } from "./app.config-KSZPYlnw.js";
import { D as DeleteConfirmDialog, f as CircleAlert } from "./DeleteConfirmDialog-HPDCok5b.js";
import { S as Skeleton } from "./Skeleton-BMSp2vpZ.js";
import { R as RefreshCw, e as Table, f as TableHeader, g as TableRow, h as TableHead, i as TableBody, j as TableCell, C as Copy, B as Bot, S as Square, T as Trash2, D as Drawer, a as DrawerContent, b as DrawerHeader, c as DrawerTitle, F as FileBraces } from "./Table-DnHrHGtZ.js";
import { u as useFilterableData, a as useSortableData, T as TableFilter, S as SortableTableHead } from "./useFilterableData-C8SGjDHA.js";
const TestResultsSkeleton = () => {
  const $ = dist.c(1);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [...Array(5)].map(_temp) }) }) });
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
};
const TestDetailsSkeleton = () => {
  const $ = dist.c(1);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-16 mb-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-24" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-12 mb-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-32" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-32 mb-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-40" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-16 mb-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-20" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-20 mb-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-48" })
      ] })
    ] });
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
};
const TestTimeline = (t0) => {
  const $ = dist.c(15);
  const {
    steps: structuredSteps,
    logDetails,
    status
  } = t0;
  let t1;
  let t2;
  let t3;
  let t4;
  if ($[0] !== logDetails || $[1] !== status || $[2] !== structuredSteps) {
    const parseLogDetails = (logs) => {
      if (!logs) {
        return [];
      }
      try {
        const parsed = JSON.parse(logs);
        if (Array.isArray(parsed)) {
          return parsed.map((log) => parseLogEntry(log));
        }
      } catch {
        const lines = logs.split("\n").filter(_temp2);
        return lines.map((line_0) => parseLogEntry(line_0));
      }
      return [];
    };
    const parseLogEntry = _temp3;
    const convertStructuredSteps = _temp5;
    const timelineSteps = structuredSteps?.length ? convertStructuredSteps(structuredSteps) : parseLogDetails(logDetails);
    const finalStep = {
      message: status === "SUCCESS" ? "Test completed successfully" : status === "FAILURE" ? "Test fehlgeschlagen" : status === "SKIPPED" ? "Test übersprungen" : "Test läuft",
      type: status === "SUCCESS" ? "success" : status === "FAILURE" ? "error" : status === "SKIPPED" ? "warning" : "info"
    };
    const allSteps = [...timelineSteps, finalStep];
    const getStepIcon = _temp6;
    const formatTimestamp = _temp7;
    t3 = "space-y-4";
    if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
      t4 = /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium text-gray-900 dark:text-white", children: "Test Timeline" });
      $[7] = t4;
    } else {
      t4 = $[7];
    }
    t1 = "relative";
    t2 = allSteps.map((step_0, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start space-x-3 pb-4", children: [
      index === 0 ? null : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex items-center justify-center w-6 h-6 bg-white dark:bg-gray-800 ", children: getStepIcon(step_0.type) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-900 dark:text-white", children: step_0.message }),
        step_0.timestamp && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400 font-mono", children: formatTimestamp(step_0.timestamp) })
      ] }) })
    ] }, index));
    $[0] = logDetails;
    $[1] = status;
    $[2] = structuredSteps;
    $[3] = t1;
    $[4] = t2;
    $[5] = t3;
    $[6] = t4;
  } else {
    t1 = $[3];
    t2 = $[4];
    t3 = $[5];
    t4 = $[6];
  }
  let t5;
  if ($[8] !== t1 || $[9] !== t2) {
    t5 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: t1, children: t2 });
    $[8] = t1;
    $[9] = t2;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  let t6;
  if ($[11] !== t3 || $[12] !== t4 || $[13] !== t5) {
    t6 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: t3, children: [
      t4,
      t5
    ] });
    $[11] = t3;
    $[12] = t4;
    $[13] = t5;
    $[14] = t6;
  } else {
    t6 = $[14];
  }
  return t6;
};
const TestResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    testRuns,
    loadTestRuns,
    isLoading,
    error
  } = useTestRunsStore();
  const {
    forms,
    loadForms
  } = useFormsStore();
  const {
    paymentMethods,
    loadPaymentMethods
  } = usePaymentMethodsStore();
  const [selectedTestRun, setSelectedTestRun] = reactExports.useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = reactExports.useState(null);
  const [notes, setNotes] = reactExports.useState("");
  const [isSavingNotes, setIsSavingNotes] = reactExports.useState(false);
  const [runningTimers, setRunningTimers] = reactExports.useState({});
  reactExports.useEffect(() => {
    loadTestRuns();
    loadForms();
    loadPaymentMethods();
  }, [loadTestRuns, loadForms, loadPaymentMethods]);
  const testRunsWithNames = reactExports.useMemo(() => {
    return testRuns.map((tr) => ({
      ...tr,
      formName: forms.find((f) => f.id === tr.formId)?.name || `Form #${tr.formId}`,
      paymentMethodName: paymentMethods.find((p) => p.id === tr.paymentMethodId)?.name || `PM #${tr.paymentMethodId}`
    }));
  }, [testRuns, forms, paymentMethods]);
  const runningTests = reactExports.useMemo(() => testRunsWithNames.filter((tr_0) => tr_0.status === "RUNNING"), [testRunsWithNames]);
  const finishedTests = reactExports.useMemo(() => testRunsWithNames.filter((tr_1) => tr_1.status !== "RUNNING"), [testRunsWithNames]);
  reactExports.useEffect(() => {
    if (runningTests.length === 0) {
      setRunningTimers({});
      return;
    }
    const getStartTime = (runAt) => {
      if (runAt instanceof Date) {
        return runAt.getTime();
      }
      const dateStr = String(runAt);
      if (!dateStr.includes("T") && !dateStr.includes("Z")) {
        const utcDate = /* @__PURE__ */ new Date(dateStr.replace(" ", "T") + "Z");
        return utcDate.getTime();
      }
      return new Date(dateStr).getTime();
    };
    const initialTimers = {};
    runningTests.forEach((test) => {
      const startTime = getStartTime(test.runAt);
      const elapsed = Math.floor((Date.now() - startTime) / 1e3);
      initialTimers[test.id] = Math.max(0, elapsed);
    });
    setRunningTimers(initialTimers);
    const interval = setInterval(() => {
      setRunningTimers(() => {
        const updated = {};
        runningTests.forEach((test_0) => {
          const startTime_0 = getStartTime(test_0.runAt);
          const elapsed_0 = Math.floor((Date.now() - startTime_0) / 1e3);
          updated[test_0.id] = Math.max(0, elapsed_0);
        });
        return updated;
      });
    }, 1e3);
    return () => clearInterval(interval);
  }, [runningTests]);
  const {
    filteredItems: filteredFinishedTests,
    filterConfig,
    setSearchTerm,
    setStatusFilter,
    clearFilters
  } = useFilterableData(
    finishedTests,
    ["formName", "paymentMethodName", "uuid", "status"],
    {
      searchTerm: "",
      statusFilter: void 0
    },
    "testResults"
    // localStorage key
  );
  const {
    sortedItems: sortedFinishedTests,
    requestSort,
    getSortDirection
  } = useSortableData(
    filteredFinishedTests,
    {
      key: "runAt",
      direction: "desc"
    },
    // Default: newest first
    "testResults"
    // localStorage key
  );
  const statusOptions = [{
    value: "SUCCESS",
    label: "Erfolgreich"
  }, {
    value: "FAILURE",
    label: "Fehlgeschlagen"
  }, {
    value: "STOPPED",
    label: "Gestoppt"
  }];
  reactExports.useEffect(() => {
    if (testRuns.length > 0) {
      const paramId = searchParams.get("id");
      if (paramId) {
        const found = testRuns.find((tr_2) => tr_2.uuid === paramId || String(tr_2.id) === paramId);
        if (found) {
          setSelectedTestRun(found.id);
          return;
        }
      }
    }
  }, [testRuns, searchParams]);
  const handleSelectTestRun = (id) => {
    setSelectedTestRun(id);
    if (id) {
      setSearchParams({
        id: String(id)
      });
    } else {
      setSearchParams({});
    }
  };
  const getFormName = (formId) => {
    const form = forms.find((f_0) => f_0.id === formId);
    return form ? form.name : `Form #${formId}`;
  };
  const getPaymentMethodName = (pmId) => {
    const pm = paymentMethods.find((p_0) => p_0.id === pmId);
    return pm ? pm.name : `Payment Method #${pmId}`;
  };
  const formatElapsedTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  const getFormDetails = (formId_0) => {
    return forms.find((f_1) => f_1.id === formId_0);
  };
  const getPaymentMethodDetails = (pmId_0) => {
    return paymentMethods.find((p_1) => p_1.id === pmId_0);
  };
  const handleDeleteClick = (testRun) => {
    const formName = getFormName(testRun.formId);
    const paymentMethodName = getPaymentMethodName(testRun.paymentMethodId);
    const testRunName = `${formName} × ${paymentMethodName}`;
    setShowDeleteConfirm({
      id: testRun.id,
      name: testRunName
    });
  };
  const handleStopTest = async (testRun_0) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.testRuns.stop(testRun_0.id);
      await loadTestRuns();
    } catch (error_0) {
      console.error("Failed to stop test run:", error_0);
    }
  };
  const confirmDeleteTestRun = async () => {
    if (!showDeleteConfirm) return;
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.testRuns.delete(showDeleteConfirm.id);
      await loadTestRuns();
      setShowDeleteConfirm(null);
      if (selectedTestRun === showDeleteConfirm.id) {
        setSelectedTestRun(null);
      }
    } catch (error_1) {
      console.error("Failed to delete test run:", error_1);
    }
  };
  const handleRunAgain = async (testRun_1) => {
    try {
      const form_0 = forms.find((f_2) => f_2.id === testRun_1.formId);
      const paymentMethod = paymentMethods.find((pm_0) => pm_0.id === testRun_1.paymentMethodId);
      if (!form_0 || !paymentMethod) {
        console.error("Form or payment method not found for re-run");
        return;
      }
      await window.api.tests.run([form_0.id], [paymentMethod.id]);
      await loadTestRuns();
    } catch (error_2) {
      console.error("Failed to run test again:", error_2);
    }
  };
  const handleCopyUuid = (e, uuid) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uuid);
  };
  const selectedTestRunData = selectedTestRun ? testRuns.find((tr_3) => tr_3.id === selectedTestRun) : null;
  reactExports.useEffect(() => {
    if (selectedTestRunData) {
      setNotes(selectedTestRunData.notes || "");
    } else {
      setNotes("");
    }
  }, [selectedTestRunData?.id, selectedTestRunData?.notes]);
  const handleNotesChange = async (value) => {
    setNotes(value);
    if (!selectedTestRunData) return;
    setIsSavingNotes(true);
    try {
      await window.api.testRuns.updateNotes(selectedTestRunData.id, value);
      await loadTestRuns();
    } catch (error_3) {
      console.error("Failed to save notes:", error_3);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: CONFIG.style.title.className, children: "Test Resultate" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          window.dispatchEvent(new Event("openTestDialog"));
        }, variant: "primary", size: "md", className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 16 }),
          "Testen"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: loadTestRuns, variant: "secondary", size: "md", disabled: isLoading, className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 16 }),
          "Aktualisieren"
        ] })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-red-800 dark:text-red-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Error:" }),
      " ",
      error
    ] }) }),
    runningTests.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 bg-blue-500 rounded-full animate-pulse" }),
        "Laufende Tests (",
        runningTests.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4", children: "ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4", children: "Test" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4", children: "Gestartet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4", children: "Dauer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 text-right", children: "Aktionen" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: runningTests.map((testRun_2) => {
          const isSelected = selectedTestRun === testRun_2.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: `cursor-pointer ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}`, onClick: () => handleSelectTestRun(testRun_2.id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono text-gray-500 dark:text-gray-400", children: testRun_2.uuid ? testRun_2.uuid.substring(0, 8) : `ID:${testRun_2.id}` }),
              testRun_2.uuid && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e_0) => handleCopyUuid(e_0, testRun_2.uuid), className: "p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity", title: "ID kopieren", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 10 }) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-medium text-gray-900 dark:text-white truncate", children: [
                testRun_2.formName,
                " × ",
                testRun_2.paymentMethodName
              ] }),
              testRun_2.isScheduled && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", title: "Autopilot Test", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 12, className: "text-blue-600 dark:text-blue-400" }) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 text-[11px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap", children: formatDateTime(testRun_2.runAt) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-mono text-blue-600 dark:text-blue-400 tabular-nums", children: formatElapsedTime(runningTimers[testRun_2.id] || 0) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: testRun_2.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-end gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_1) => {
              e_1.stopPropagation();
              handleStopTest(testRun_2);
            }, variant: "ghost", size: "sm", className: "text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30", title: "Test stoppen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { size: 16, fill: "currentColor" }) }) }) })
          ] }, testRun_2.id);
        }) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300", children: [
        "Abgeschlossene Tests (",
        sortedFinishedTests.length,
        ")"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableFilter, { searchTerm: filterConfig.searchTerm, onSearchChange: setSearchTerm, placeholder: "Tests durchsuchen...", statusFilter: filterConfig.statusFilter, onStatusFilterChange: setStatusFilter, statusOptions, onClear: clearFilters }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden", children: isLoading && testRuns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TestResultsSkeleton, {}) : sortedFinishedTests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 dark:text-gray-400 mb-4", children: finishedTests.length === 0 ? "Noch keine abgeschlossenen Tests." : "Keine Tests gefunden." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 dark:text-gray-400", children: finishedTests.length === 0 ? "Führe Tests aus, um Ergebnisse hier zu sehen." : "Versuche andere Suchbegriffe oder Filter." })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { className: "px-4", children: "ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { className: "px-4", sortDirection: getSortDirection("formName"), onSort: () => requestSort("formName"), children: "Test" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { className: "px-4", sortDirection: getSortDirection("runAt"), onSort: () => requestSort("runAt"), children: "Datum" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { className: "px-4", sortDirection: getSortDirection("durationMs"), onSort: () => requestSort("durationMs"), children: "Dauer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { className: "px-4", sortDirection: getSortDirection("status"), onSort: () => requestSort("status"), children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 text-right", children: "Aktionen" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: sortedFinishedTests.map((testRun_3) => {
          const isSelected_0 = selectedTestRun === testRun_3.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: `cursor-pointer ${isSelected_0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}`, onClick: () => handleSelectTestRun(testRun_3.id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono text-gray-500 dark:text-gray-400", children: testRun_3.uuid ? testRun_3.uuid.substring(0, 8) : `ID:${testRun_3.id}` }),
              testRun_3.uuid && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e_2) => handleCopyUuid(e_2, testRun_3.uuid), className: "p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity", title: "ID kopieren", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 10 }) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-medium text-gray-900 dark:text-white truncate", children: [
                testRun_3.formName,
                " × ",
                testRun_3.paymentMethodName
              ] }),
              testRun_3.isScheduled && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", title: "Autopilot Test", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 12, className: "text-blue-600 dark:text-blue-400" }) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 text-[11px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap", children: formatDateTime(testRun_3.runAt) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 text-[11px] font-mono text-gray-500 dark:text-gray-400", children: formatDuration(testRun_3.durationMs) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: testRun_3.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_3) => {
                e_3.stopPropagation();
                handleRunAgain(testRun_3);
              }, variant: "ghost", size: "sm", className: "text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300", title: "Test erneut ausführen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 16 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_4) => {
                e_4.stopPropagation();
                handleDeleteClick(testRun_3);
              }, variant: "ghost", size: "sm", className: "text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300", title: "Löschen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
            ] }) })
          ] }, testRun_3.id);
        }) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Drawer, { open: !!selectedTestRun, onOpenChange: (open) => !open && handleSelectTestRun(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerContent, { className: "w-full max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerHeader, { className: "mb-6 pb-6 border-b dark:border-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerTitle, { className: CONFIG.style.title.className, children: selectedTestRunData && `${getFormName(selectedTestRunData.formId)} × ${getPaymentMethodName(selectedTestRunData.paymentMethodId)}` }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto space-y-6", children: selectedTestRunData ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6 pb-6 border-b dark:border-gray-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1", children: "ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs truncate font-mono bg-gray-100 dark:bg-gray-900/50 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700", children: selectedTestRunData.uuid || selectedTestRunData.id }),
              selectedTestRunData.uuid && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e_5) => handleCopyUuid(e_5, selectedTestRunData.uuid), className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", title: "ID kopieren", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 12 }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: selectedTestRunData.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1", children: "Duration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-900 dark:text-white font-mono", children: selectedTestRunData.status === "RUNNING" ? formatElapsedTime(runningTimers[selectedTestRunData.id] || 0) : formatDuration(selectedTestRunData.durationMs) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1", children: "Run At" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-900 dark:text-white font-mono", children: formatDateTime(selectedTestRunData.runAt) })
          ] })
        ] }),
        (() => {
          const formDetails = getFormDetails(selectedTestRunData.formId);
          return formDetails && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 pb-6 border-b dark:border-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400", children: "Formular" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: `/forms?id=${formDetails.id}`, className: "text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1", children: "Öffnen" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5", children: "Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-900 dark:text-white", children: formDetails.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5", children: "Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: formDetails.isActive ? "active" : "inactive" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5", children: "URL" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: formDetails.url, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block", children: formDetails.url })
              ] })
            ] })
          ] });
        })(),
        (() => {
          const pmDetails = getPaymentMethodDetails(selectedTestRunData.paymentMethodId);
          const getPaymentTypeLabel = (type) => {
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
          const getMaskedDetails = (pm_1) => {
            if (!pm_1) return "";
            switch (pm_1.type) {
              case "paypal":
                return pm_1.details.email || "";
              case "sepa":
                return pm_1.details.accountHolder || (pm_1.details.iban ? `***${pm_1.details.iban.slice(-4)}` : "");
              case "creditcard":
                return pm_1.details.cardNumber ? `****${pm_1.details.cardNumber.slice(-4)}` : "";
              case "eps":
                return pm_1.details.bankCode || "";
              default:
                return "";
            }
          };
          return pmDetails && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 pb-6 border-b dark:border-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400", children: "Bezahlmethode" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: `/payment-methods?id=${pmDetails.id}`, className: "text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1", children: "Öffnen" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5", children: "Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-900 dark:text-white", children: pmDetails.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5", children: "Typ" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-900 dark:text-white", children: getPaymentTypeLabel(pmDetails.type) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5", children: "Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: pmDetails.isActive ? "active" : "inactive" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5", children: "Details" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-900 dark:text-white font-mono", children: getMaskedDetails(pmDetails) })
              ] })
            ] })
          ] });
        })(),
        selectedTestRunData.errorMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 pb-6 border-b dark:border-gray-700 ", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2", children: "Error Message" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200 font-mono", children: selectedTestRunData.errorMessage })
        ] }),
        (selectedTestRunData.steps?.length || selectedTestRunData.logDetails) && /* @__PURE__ */ jsxRuntimeExports.jsx(TestTimeline, { steps: selectedTestRunData.steps, logDetails: selectedTestRunData.logDetails, status: selectedTestRunData.status }),
        selectedTestRunData.screenshotPath && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2", children: "Screenshot" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 dark:border-gray-700 rounded overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: selectedTestRunData.screenshotPath, alt: "Test screenshot", className: "w-full" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 pb-6 border-b dark:border-gray-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2", children: [
            "Notes",
            isSavingNotes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-gray-400", children: "(saving...)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: notes, onChange: (e_6) => handleNotesChange(e_6.target.value), placeholder: "Add notes about this test run...", className: "w-full h-24 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-md resize-none !focus:outline-0 !focus:ring-0 !focus:ring-offset-0 !focus:ring-blue-500 dark:focus:ring-blue-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4 border-t border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "sm", onClick: handleExportJson, className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileBraces, { size: 16 }),
          "Export JSON"
        ] }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TestDetailsSkeleton, {}) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: !!showDeleteConfirm, onClose: () => setShowDeleteConfirm(null), onConfirm: confirmDeleteTestRun, title: "Test Run löschen", message: "Sind Sie sicher, dass Sie diesen Test Run löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.", itemName: showDeleteConfirm?.name, isLoading })
  ] });
};
function _temp(_, i) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-16" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-1/3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-24" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-16" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-20" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-20" }) })
  ] }, i);
}
function _temp2(line) {
  return line.trim();
}
function _temp3(log_0) {
  const timestampMatch = log_0.match(/^\[([^\]]+)\]/);
  const timestamp = timestampMatch ? timestampMatch[1] : void 0;
  const message = timestamp ? log_0.replace(/^\[[^\]]+\]\s*/, "") : log_0;
  let type = "info";
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("error") || lowerMessage.includes("failed") || lowerMessage.includes("timeout")) {
    type = "error";
  } else {
    if (lowerMessage.includes("success") || lowerMessage.includes("completed") || lowerMessage.includes("detected success")) {
      type = "success";
    } else {
      if (lowerMessage.includes("warning") || lowerMessage.includes("skipping")) {
        type = "warning";
      }
    }
  }
  return {
    timestamp,
    message,
    type
  };
}
function _temp4(step) {
  return {
    timestamp: step.startTime,
    message: step.message || step.name,
    type: step.status === "success" ? "success" : step.status === "error" ? "error" : step.status === "skipped" ? "warning" : "info"
  };
}
function _temp5(steps) {
  return steps.map(_temp4);
}
function _temp6(type_0) {
  switch (type_0) {
    case "success": {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-600 dark:text-green-400" });
    }
    case "error": {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-600 dark:text-red-400" });
    }
    case "warning": {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-yellow-600 dark:text-yellow-400" });
    }
    default: {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 text-blue-600 dark:text-blue-400" });
    }
  }
}
function _temp7(timestamp_0) {
  if (!timestamp_0) {
    return null;
  }
  try {
    return new Date(timestamp_0).toLocaleTimeString();
  } catch {
    return timestamp_0;
  }
}
export {
  TestResults as default
};
