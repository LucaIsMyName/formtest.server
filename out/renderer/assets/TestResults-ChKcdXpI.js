import { l as useSearchParams, e as useTestRunsStore, b as useFormsStore, d as usePaymentMethodsStore, r as reactExports, j as jsxRuntimeExports, B as Button, E as Play, i as dist } from "./index-C8KwxcYM.js";
import { C as CONFIG } from "./app.config-Cedwjkbe.js";
import { D as DeleteConfirmDialog, a as CircleAlert, C as CircleCheck } from "./DeleteConfirmDialog-yikz5a6p.js";
import { R as RefreshCw, e as Table, f as TableHeader, g as TableRow, h as TableHead, i as TableBody, j as TableCell, C as Copy, B as Bot, l as formatDateTime, m as formatDuration, S as StatusBadge, T as Trash2, D as Drawer, a as DrawerContent, b as DrawerHeader, c as DrawerTitle, F as FileBraces, n as CircleX } from "./formatters-B-uHFVcx.js";
import { S as Skeleton } from "./Skeleton-CSq5Hioy.js";
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
      message: status === "SUCCESS" ? "Test completed successfully" : status === "FAILURE" ? "Test failed" : status === "SKIPPED" ? "Test was skipped" : "Test is running",
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
  reactExports.useEffect(() => {
    loadTestRuns();
    loadForms();
    loadPaymentMethods();
  }, [loadTestRuns, loadForms, loadPaymentMethods]);
  reactExports.useEffect(() => {
    if (testRuns.length > 0) {
      const paramId = searchParams.get("id");
      if (paramId) {
        const found = testRuns.find((tr) => tr.uuid === paramId || String(tr.id) === paramId);
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
    const form = forms.find((f) => f.id === formId);
    return form ? form.name : `Form #${formId}`;
  };
  const getPaymentMethodName = (pmId) => {
    const pm = paymentMethods.find((p) => p.id === pmId);
    return pm ? pm.name : `Payment Method #${pmId}`;
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
    } catch (error_0) {
      console.error("Failed to delete test run:", error_0);
    }
  };
  const handleRunAgain = async (testRun_0) => {
    try {
      const form_0 = forms.find((f_0) => f_0.id === testRun_0.formId);
      const paymentMethod = paymentMethods.find((pm_0) => pm_0.id === testRun_0.paymentMethodId);
      if (!form_0 || !paymentMethod) {
        console.error("Form or payment method not found for re-run");
        return;
      }
      await window.api.tests.run([form_0.id], [paymentMethod.id]);
      await loadTestRuns();
    } catch (error_1) {
      console.error("Failed to run test again:", error_1);
    }
  };
  const handleCopyUuid = (e, uuid) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uuid);
  };
  const selectedTestRunData = selectedTestRun ? testRuns.find((tr_0) => tr_0.id === selectedTestRun) : null;
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
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden", children: isLoading && testRuns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TestResultsSkeleton, {}) : testRuns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "No test results yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Run some tests to see results here." })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4", children: "ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4", children: "Test" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4", children: "Datum" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4", children: "Dauer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: testRuns.map((testRun_1) => {
        const isSelected = selectedTestRun === testRun_1.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: `cursor-pointer ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}`, onClick: () => handleSelectTestRun(testRun_1.id), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono text-gray-500 dark:text-gray-400", children: testRun_1.uuid ? testRun_1.uuid.substring(0, 8) : `ID:${testRun_1.id}` }),
            testRun_1.uuid && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e_0) => handleCopyUuid(e_0, testRun_1.uuid), className: "p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity", title: "ID kopieren", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 10 }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-medium text-gray-900 dark:text-white truncate", children: [
              getFormName(testRun_1.formId),
              " × ",
              getPaymentMethodName(testRun_1.paymentMethodId)
            ] }),
            testRun_1.isScheduled && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", title: "Autopilot Test", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 12, className: "text-blue-600 dark:text-blue-400" }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 text-[11px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap", children: formatDateTime(testRun_1.runAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 text-[11px] font-mono text-gray-500 dark:text-gray-400", children: formatDuration(testRun_1.durationMs) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: testRun_1.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_1) => {
              e_1.stopPropagation();
              handleRunAgain(testRun_1);
            }, variant: "ghost", size: "sm", className: "text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300", title: "Test erneut ausführen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 16 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_2) => {
              e_2.stopPropagation();
              handleDeleteClick(testRun_1);
            }, variant: "ghost", size: "sm", className: "text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300", title: "Löschen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
          ] }) })
        ] }, testRun_1.id);
      }) })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Drawer, { open: !!selectedTestRun, onOpenChange: (open) => !open && handleSelectTestRun(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerContent, { className: "w-full max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerHeader, { className: "mb-6 pb-6 border-b dark:border-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerTitle, { className: CONFIG.style.title.className, children: selectedTestRunData && `${getFormName(selectedTestRunData.formId)} × ${getPaymentMethodName(selectedTestRunData.paymentMethodId)}` }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto space-y-6", children: selectedTestRunData ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6 pb-6 border-b dark:border-gray-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1", children: "ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs truncate font-mono bg-gray-100 dark:bg-gray-900/50 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700", children: selectedTestRunData.uuid || selectedTestRunData.id }),
              selectedTestRunData.uuid && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e_3) => handleCopyUuid(e_3, selectedTestRunData.uuid), className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", title: "ID kopieren", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 12 }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: selectedTestRunData.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1", children: "Duration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-900 dark:text-white font-mono", children: formatDuration(selectedTestRunData.durationMs) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1", children: "Run At" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-900 dark:text-white font-mono", children: formatDateTime(selectedTestRunData.runAt) })
          ] })
        ] }),
        selectedTestRunData.errorMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 pb-6 border-b dark:border-gray-700 ", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2", children: "Error Message" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200 font-mono", children: selectedTestRunData.errorMessage })
        ] }),
        (selectedTestRunData.steps?.length || selectedTestRunData.logDetails) && /* @__PURE__ */ jsxRuntimeExports.jsx(TestTimeline, { steps: selectedTestRunData.steps, logDetails: selectedTestRunData.logDetails, status: selectedTestRunData.status }),
        selectedTestRunData.screenshotPath && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2", children: "Screenshot" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 dark:border-gray-700 rounded overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: selectedTestRunData.screenshotPath, alt: "Test screenshot", className: "w-full" }) })
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
