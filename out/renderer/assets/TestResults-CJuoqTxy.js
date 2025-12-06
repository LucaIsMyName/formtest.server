import { r as reactExports, j as jsxRuntimeExports, B as Button, ab as LoaderCircle, ac as Square, i as dist, ad as Image, ae as Maximize2, af as ZoomOut, ag as ZoomIn, ah as Download, X, J as useSearchParams, e as useTestRunsStore, b as useFormsStore, d as usePaymentMethodsStore, ai as FileSpreadsheet, P as Play, l as Table, K as TableHeader, n as TableRow, M as TableHead, aj as Bot, m as TableBody, o as TableCell, ak as Copy, al as User, s as renderIcon, am as formatDateTime, p as StatusBadge, a3 as CircleCheck, k as Trash2, t as Checkbox, an as formatDuration, O as TablePagination, ao as Link, ap as FileBraces, Q as getDefaultPaymentIcon, a4 as CircleAlert, aq as CircleX } from "./index-N4J4W4Ga.js";
import { C as CONFIG } from "./app.config-b2lfEN4K.js";
import { T as TableFilter, D as DeleteConfirmDialog } from "./TableFilter-BymsvGgs.js";
import { u as useTableSelection, d as useFilterableData, e as useSortableData, S as SelectionActionBar, f as computeIsPartialSelected, g as computeIsAllSelected, h as SortableTableHead, D as Drawer, a as DrawerContent, b as DrawerHeader } from "./useTableSelection-DvHvMnqw.js";
import { S as Skeleton } from "./Skeleton-Bf8J3j5X.js";
const TestQueueStatus = ({
  onRefresh
}) => {
  const [status, setStatus] = reactExports.useState(null);
  const [isClearing, setIsClearing] = reactExports.useState(false);
  const fetchStatus = reactExports.useCallback(async () => {
    try {
      const queueStatus = await window.api?.testQueue?.getStatus();
      setStatus(queueStatus || null);
    } catch (error) {
      console.error("Failed to fetch queue status:", error);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus();
    }, 1e3);
    return () => clearInterval(interval);
  }, [fetchStatus]);
  const handleStopAll = async () => {
    if (!status || status.totalPending === 0) return;
    setIsClearing(true);
    try {
      await window.api?.testQueue?.stopAll();
      await fetchStatus();
      onRefresh?.();
    } catch (error_0) {
      console.error("Failed to stop all tests:", error_0);
    } finally {
      setIsClearing(false);
    }
  };
  if (!status || status.totalPending === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-end gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleStopAll, variant: "danger", size: "sm", disabled: isClearing, className: "gap-1.5 text-xs", children: [
    isClearing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "w-3 h-3", fill: "currentColor" }),
    "Alles stoppen"
  ] }) });
};
const ScreenshotViewer = (t0) => {
  const $ = dist.c(49);
  const {
    screenshotPath,
    testName: t1,
    className: t2
  } = t0;
  const testName = t1 === void 0 ? "Test" : t1;
  const className = t2 === void 0 ? "" : t2;
  const [isLightboxOpen, setIsLightboxOpen] = reactExports.useState(false);
  const [zoomLevel, setZoomLevel] = reactExports.useState(1);
  const [imageError, setImageError] = reactExports.useState(false);
  const [imageLoaded, setImageLoaded] = reactExports.useState(false);
  let t3;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = () => {
      setImageError(false);
      setImageLoaded(false);
      setZoomLevel(1);
    };
    $[0] = t3;
  } else {
    t3 = $[0];
  }
  let t4;
  if ($[1] !== screenshotPath) {
    t4 = [screenshotPath];
    $[1] = screenshotPath;
    $[2] = t4;
  } else {
    t4 = $[2];
  }
  reactExports.useEffect(t3, t4);
  let t5;
  let t6;
  if ($[3] !== isLightboxOpen) {
    t5 = () => {
      if (!isLightboxOpen) {
        return;
      }
      const handleKeyDown = (e) => {
        bb15: switch (e.key) {
          case "Escape": {
            setIsLightboxOpen(false);
            break bb15;
          }
          case "+":
          case "=": {
            setZoomLevel(_temp$1);
            break bb15;
          }
          case "-": {
            setZoomLevel(_temp2$1);
            break bb15;
          }
          case "0": {
            setZoomLevel(1);
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    };
    t6 = [isLightboxOpen];
    $[3] = isLightboxOpen;
    $[4] = t5;
    $[5] = t6;
  } else {
    t5 = $[4];
    t6 = $[5];
  }
  reactExports.useEffect(t5, t6);
  let t7;
  let t8;
  if ($[6] !== isLightboxOpen) {
    t7 = () => {
      if (isLightboxOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return _temp3$1;
    };
    t8 = [isLightboxOpen];
    $[6] = isLightboxOpen;
    $[7] = t7;
    $[8] = t8;
  } else {
    t7 = $[7];
    t8 = $[8];
  }
  reactExports.useEffect(t7, t8);
  let t9;
  if ($[9] !== screenshotPath || $[10] !== testName) {
    t9 = () => {
      if (!screenshotPath) {
        return;
      }
      const link = document.createElement("a");
      link.href = screenshotPath;
      link.download = `screenshot_${testName.replace(/\s+/g, "_")}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    $[9] = screenshotPath;
    $[10] = testName;
    $[11] = t9;
  } else {
    t9 = $[11];
  }
  const handleDownload = t9;
  if (!screenshotPath) {
    const t102 = `flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md ${className}`;
    let t112;
    if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
      t112 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-gray-400 dark:text-gray-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-12 h-12 mx-auto mb-2 opacity-50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Kein Screenshot verfügbar" })
      ] });
      $[12] = t112;
    } else {
      t112 = $[12];
    }
    let t122;
    if ($[13] !== t102) {
      t122 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: t102, children: t112 });
      $[13] = t102;
      $[14] = t122;
    } else {
      t122 = $[14];
    }
    return t122;
  }
  if (imageError) {
    const t102 = `flex items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md ${className}`;
    let t112;
    let t122;
    if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
      t112 = /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-12 h-12 mx-auto mb-2 opacity-50" });
      t122 = /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Screenshot konnte nicht geladen werden" });
      $[15] = t112;
      $[16] = t122;
    } else {
      t112 = $[15];
      t122 = $[16];
    }
    let t132;
    if ($[17] !== screenshotPath) {
      t132 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-red-500 dark:text-red-400", children: [
        t112,
        t122,
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1 opacity-75", children: screenshotPath })
      ] });
      $[17] = screenshotPath;
      $[18] = t132;
    } else {
      t132 = $[18];
    }
    let t142;
    if ($[19] !== t102 || $[20] !== t132) {
      t142 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: t102, children: t132 });
      $[19] = t102;
      $[20] = t132;
      $[21] = t142;
    } else {
      t142 = $[21];
    }
    return t142;
  }
  const t10 = `relative group ${className}`;
  let t11;
  if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
    t11 = /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2", children: "Screenshot" });
    $[22] = t11;
  } else {
    t11 = $[22];
  }
  let t12;
  if ($[23] === Symbol.for("react.memo_cache_sentinel")) {
    t12 = () => setIsLightboxOpen(true);
    $[23] = t12;
  } else {
    t12 = $[23];
  }
  let t13;
  if ($[24] !== imageLoaded) {
    t13 = !imageLoaded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" }) });
    $[24] = imageLoaded;
    $[25] = t13;
  } else {
    t13 = $[25];
  }
  const t14 = `Screenshot: ${testName}`;
  const t15 = `w-full transition-opacity ${imageLoaded ? "opacity-100" : "opacity-0"}`;
  let t16;
  let t17;
  if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
    t16 = () => setImageLoaded(true);
    t17 = () => setImageError(true);
    $[26] = t16;
    $[27] = t17;
  } else {
    t16 = $[26];
    t17 = $[27];
  }
  let t18;
  if ($[28] !== screenshotPath || $[29] !== t14 || $[30] !== t15) {
    t18 = /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: screenshotPath, alt: t14, className: t15, onLoad: t16, onError: t17 });
    $[28] = screenshotPath;
    $[29] = t14;
    $[30] = t15;
    $[31] = t18;
  } else {
    t18 = $[31];
  }
  let t19;
  if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
    t19 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "w-8 h-8 text-white drop-shadow-lg" }) }) });
    $[32] = t19;
  } else {
    t19 = $[32];
  }
  let t20;
  if ($[33] !== t13 || $[34] !== t18) {
    t20 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors", onClick: t12, children: [
      t13,
      t18,
      t19
    ] });
    $[33] = t13;
    $[34] = t18;
    $[35] = t20;
  } else {
    t20 = $[35];
  }
  let t21;
  if ($[36] === Symbol.for("react.memo_cache_sentinel")) {
    t21 = /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 dark:text-gray-500 mt-1", children: "Klicken zum Vergrößern" });
    $[36] = t21;
  } else {
    t21 = $[36];
  }
  let t22;
  if ($[37] !== t10 || $[38] !== t20) {
    t22 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: t10, children: [
      t11,
      t20,
      t21
    ] });
    $[37] = t10;
    $[38] = t20;
    $[39] = t22;
  } else {
    t22 = $[39];
  }
  let t23;
  if ($[40] !== handleDownload || $[41] !== isLightboxOpen || $[42] !== screenshotPath || $[43] !== testName || $[44] !== zoomLevel) {
    t23 = isLightboxOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 bg-black/90 flex items-center justify-center", onClick: () => setIsLightboxOpen(false), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-4 right-4 flex items-center gap-2 z-10", onClick: _temp4$1, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setZoomLevel(_temp5$1), className: "text-white hover:bg-white/20", title: "Verkleinern (-)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomOut, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white text-sm font-mono min-w-[4rem] text-center", children: [
          Math.round(zoomLevel * 100),
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setZoomLevel(_temp6$1), className: "text-white hover:bg-white/20", title: "Vergrößern (+)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomIn, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-6 bg-white/30 mx-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: handleDownload, className: "text-white hover:bg-white/20", title: "Herunterladen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setIsLightboxOpen(false), className: "text-white hover:bg-white/20", title: "Schließen (Esc)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[90vw] max-h-[90vh] overflow-auto", onClick: _temp7$1, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: screenshotPath, alt: `Screenshot: ${testName}`, className: "transition-transform duration-200", style: {
        transform: `scale(${zoomLevel})`,
        transformOrigin: "center center"
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-4", children: "ESC: Schließen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-4", children: "+/-: Zoom" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "0: Reset" })
      ] })
    ] });
    $[40] = handleDownload;
    $[41] = isLightboxOpen;
    $[42] = screenshotPath;
    $[43] = testName;
    $[44] = zoomLevel;
    $[45] = t23;
  } else {
    t23 = $[45];
  }
  let t24;
  if ($[46] !== t22 || $[47] !== t23) {
    t24 = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      t22,
      t23
    ] });
    $[46] = t22;
    $[47] = t23;
    $[48] = t24;
  } else {
    t24 = $[48];
  }
  return t24;
};
function _temp$1(prev_0) {
  return Math.min(prev_0 + 0.25, 3);
}
function _temp2$1(prev) {
  return Math.max(prev - 0.25, 0.5);
}
function _temp3$1() {
  document.body.style.overflow = "";
}
function _temp4$1(e_0) {
  return e_0.stopPropagation();
}
function _temp5$1(prev_1) {
  return Math.max(prev_1 - 0.25, 0.5);
}
function _temp6$1(prev_2) {
  return Math.min(prev_2 + 0.25, 3);
}
function _temp7$1(e_1) {
  return e_1.stopPropagation();
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
const formatElapsedTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};
const RunningTimer = reactExports.memo((t0) => {
  const $ = dist.c(11);
  const {
    runAt,
    isRunning
  } = t0;
  let t1;
  if ($[0] !== runAt) {
    t1 = () => {
      const startTime = getStartTime(runAt);
      return Math.max(0, Math.floor((Date.now() - startTime) / 1e3));
    };
    $[0] = runAt;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const [elapsed, setElapsed] = reactExports.useState(t1);
  let t2;
  let t3;
  if ($[2] !== isRunning || $[3] !== runAt) {
    t2 = () => {
      if (!isRunning) {
        return;
      }
      const interval = setInterval(() => {
        const startTime_0 = getStartTime(runAt);
        setElapsed(Math.max(0, Math.floor((Date.now() - startTime_0) / 1e3)));
      }, 1e3);
      return () => clearInterval(interval);
    };
    t3 = [runAt, isRunning];
    $[2] = isRunning;
    $[3] = runAt;
    $[4] = t2;
    $[5] = t3;
  } else {
    t2 = $[4];
    t3 = $[5];
  }
  reactExports.useEffect(t2, t3);
  const t4 = `text-[10px] font-mono tabular-nums ${isRunning ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`;
  let t5;
  if ($[6] !== elapsed) {
    t5 = formatElapsedTime(elapsed);
    $[6] = elapsed;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== t4 || $[9] !== t5) {
    t6 = /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: t4, children: t5 });
    $[8] = t4;
    $[9] = t5;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  return t6;
});
const TestResultsSkeleton = () => {
  const $ = dist.c(1);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [...Array(5)].map(_temp) }) }) });
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
  const $ = dist.c(23);
  const {
    steps: structuredSteps,
    logDetails,
    status
  } = t0;
  let T0;
  let T1;
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
    t3 = "mb-6 pb-6 border-b dark:border-gray-700";
    if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
      t4 = /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-3", children: "Test Timeline" });
      $[9] = t4;
    } else {
      t4 = $[9];
    }
    t2 = "border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden";
    T1 = Table;
    T0 = TableBody;
    t1 = allSteps.map((step_0, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 w-[40px] bg-gray-50 dark:bg-gray-800/50", children: getStepIcon(step_0.type) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white", children: step_0.message }),
      step_0.timestamp && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 w-[80px] text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400 font-mono", children: formatTimestamp(step_0.timestamp) }) })
    ] }, index));
    $[0] = logDetails;
    $[1] = status;
    $[2] = structuredSteps;
    $[3] = T0;
    $[4] = T1;
    $[5] = t1;
    $[6] = t2;
    $[7] = t3;
    $[8] = t4;
  } else {
    T0 = $[3];
    T1 = $[4];
    t1 = $[5];
    t2 = $[6];
    t3 = $[7];
    t4 = $[8];
  }
  let t5;
  if ($[10] !== T0 || $[11] !== t1) {
    t5 = /* @__PURE__ */ jsxRuntimeExports.jsx(T0, { children: t1 });
    $[10] = T0;
    $[11] = t1;
    $[12] = t5;
  } else {
    t5 = $[12];
  }
  let t6;
  if ($[13] !== T1 || $[14] !== t5) {
    t6 = /* @__PURE__ */ jsxRuntimeExports.jsx(T1, { children: t5 });
    $[13] = T1;
    $[14] = t5;
    $[15] = t6;
  } else {
    t6 = $[15];
  }
  let t7;
  if ($[16] !== t2 || $[17] !== t6) {
    t7 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: t2, children: t6 });
    $[16] = t2;
    $[17] = t6;
    $[18] = t7;
  } else {
    t7 = $[18];
  }
  let t8;
  if ($[19] !== t3 || $[20] !== t4 || $[21] !== t7) {
    t8 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: t3, children: [
      t4,
      t7
    ] });
    $[19] = t3;
    $[20] = t4;
    $[21] = t7;
    $[22] = t8;
  } else {
    t8 = $[22];
  }
  return t8;
};
const TestResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    testRuns,
    loadTestRuns,
    isLoading,
    error,
    runTests
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
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = reactExports.useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = reactExports.useState(false);
  const [isBulkRunning, setIsBulkRunning] = reactExports.useState(false);
  const [notes, setNotes] = reactExports.useState("");
  const [isSavingNotes, setIsSavingNotes] = reactExports.useState(false);
  const {
    selectedIds,
    toggleItem,
    toggleAll,
    clearSelection,
    selectedCount,
    isSelected,
    getSelectedIds
  } = useTableSelection();
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
  const queuedTests = reactExports.useMemo(() => testRunsWithNames.filter((tr_1) => tr_1.status === "QUEUED"), [testRunsWithNames]);
  const activeTests = reactExports.useMemo(() => [...runningTests, ...queuedTests], [runningTests, queuedTests]);
  const finishedTests = reactExports.useMemo(() => testRunsWithNames.filter((tr_2) => tr_2.status !== "RUNNING" && tr_2.status !== "QUEUED"), [testRunsWithNames]);
  reactExports.useEffect(() => {
    if (activeTests.length === 0) return;
    const refreshInterval = setInterval(() => {
      loadTestRuns();
    }, 2e3);
    return () => clearInterval(refreshInterval);
  }, [activeTests.length, loadTestRuns]);
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
    sortedItems: allSortedFinishedTests,
    requestSort,
    sortConfig,
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
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const itemsPerPage = 50;
  const totalFilteredItems = allSortedFinishedTests.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const showPagination = totalFilteredItems > 50;
  const sortedFinishedTests = reactExports.useMemo(() => {
    if (totalFilteredItems > 50) {
      const start = (currentPage - 1) * itemsPerPage;
      return allSortedFinishedTests.slice(start, start + itemsPerPage);
    }
    return allSortedFinishedTests;
  }, [allSortedFinishedTests, currentPage, itemsPerPage, totalFilteredItems]);
  reactExports.useEffect(() => {
    setCurrentPage(1);
  }, [filterConfig.statusFilter, filterConfig.searchTerm, sortConfig.key, sortConfig.direction]);
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
        const found = testRuns.find((tr_3) => tr_3.uuid === paramId || String(tr_3.id) === paramId);
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
      }, {
        replace: true
      });
    } else {
      setSearchParams({}, {
        replace: true
      });
    }
  };
  const getFormName = (formId) => {
    const form = forms.find((f_0) => f_0.id === formId);
    return form ? form.name : `Form #${formId}`;
  };
  const getFormIcon = (formId_0) => {
    const form_0 = forms.find((f_1) => f_1.id === formId_0);
    return form_0?.icon || "FileText";
  };
  const getPaymentMethodName = (pmId) => {
    const pm = paymentMethods.find((p_0) => p_0.id === pmId);
    return pm ? pm.name : `Payment Method #${pmId}`;
  };
  const getPaymentMethodIcon = (pmId_0) => {
    const pm_0 = paymentMethods.find((p_1) => p_1.id === pmId_0);
    return pm_0?.icon || getDefaultPaymentIcon(pm_0?.type || "creditcard");
  };
  const getFormDetails = (formId_1) => {
    return forms.find((f_2) => f_2.id === formId_1);
  };
  const getPaymentMethodDetails = (pmId_1) => {
    return paymentMethods.find((p_2) => p_2.id === pmId_1);
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
      const form_1 = forms.find((f_3) => f_3.id === testRun_1.formId);
      const paymentMethod = paymentMethods.find((pm_1) => pm_1.id === testRun_1.paymentMethodId);
      if (!form_1 || !paymentMethod) {
        console.error("Form or payment method not found for re-run");
        return;
      }
      await window.api.tests.run([form_1.id], [paymentMethod.id]);
      await loadTestRuns();
    } catch (error_2) {
      console.error("Failed to run test again:", error_2);
    }
  };
  const handleBulkDelete = async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;
    const deletedCount = ids.length;
    setIsBulkDeleting(true);
    try {
      for (const id_0 of ids) {
        await window.api.testRuns.delete(id_0);
      }
      await loadTestRuns();
      clearSelection();
      setShowBulkDeleteConfirm(false);
      const remainingItems = totalFilteredItems - deletedCount;
      if (remainingItems > 0) {
        const newTotalPages = Math.ceil(remainingItems / itemsPerPage);
        if (currentPage > newTotalPages) {
          setCurrentPage(Math.max(1, newTotalPages));
        }
      }
    } catch (error_3) {
      console.error("Failed to bulk delete test runs:", error_3);
    } finally {
      setIsBulkDeleting(false);
    }
  };
  const handleBulkRunAgain = async () => {
    const ids_0 = getSelectedIds();
    if (ids_0.length === 0) return;
    setIsBulkRunning(true);
    try {
      const selectedTests = finishedTests.filter((tr_4) => ids_0.includes(tr_4.id));
      const combinations = /* @__PURE__ */ new Map();
      for (const test of selectedTests) {
        const key = `${test.formId}-${test.paymentMethodId}`;
        if (!combinations.has(key)) {
          combinations.set(key, {
            formId: test.formId,
            paymentMethodId: test.paymentMethodId
          });
        }
      }
      for (const combo of combinations.values()) {
        await window.api.tests.run([combo.formId], [combo.paymentMethodId]);
      }
      await loadTestRuns();
      clearSelection();
    } catch (error_4) {
      console.error("Failed to bulk run tests:", error_4);
    } finally {
      setIsBulkRunning(false);
    }
  };
  const handleCopyUuid = (e, uuid) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uuid);
  };
  const selectedTestRunData = selectedTestRun ? testRuns.find((tr_5) => tr_5.id === selectedTestRun) : null;
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
    } catch (error_5) {
      console.error("Failed to save notes:", error_5);
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
  const handleExportAllJson = () => {
    const exportData = {
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      totalResults: finishedTests.length,
      results: finishedTests.map((tr_6) => ({
        id: tr_6.id,
        uuid: tr_6.uuid,
        formName: tr_6.formName,
        formId: tr_6.formId,
        paymentMethodName: tr_6.paymentMethodName,
        paymentMethodId: tr_6.paymentMethodId,
        status: tr_6.status,
        durationMs: tr_6.durationMs,
        errorMessage: tr_6.errorMessage,
        isScheduled: tr_6.isScheduled,
        notes: tr_6.notes,
        runAt: tr_6.runAt,
        steps: tr_6.steps
      }))
    };
    const dataStr_0 = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode_0 = document.createElement("a");
    downloadAnchorNode_0.setAttribute("href", dataStr_0);
    downloadAnchorNode_0.setAttribute("download", `test_results_export_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchorNode_0);
    downloadAnchorNode_0.click();
    downloadAnchorNode_0.remove();
  };
  const handleExportCsv = () => {
    const headers = ["ID", "UUID", "Form", "Bezahlmethode", "Status", "Dauer (ms)", "Fehler", "Geplant", "Notizen", "Datum"];
    const rows = finishedTests.map((tr_7) => [
      tr_7.id,
      tr_7.uuid || "",
      tr_7.formName || "",
      tr_7.paymentMethodName || "",
      tr_7.status,
      tr_7.durationMs || "",
      (tr_7.errorMessage || "").replace(/"/g, '""'),
      // Escape quotes
      tr_7.isScheduled ? "Ja" : "Nein",
      (tr_7.notes || "").replace(/"/g, '""').replace(/\n/g, " "),
      // Escape quotes and newlines
      new Date(tr_7.runAt).toLocaleString("de-DE")
    ]);
    const csvContent = [headers.join(";"), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(";"))].join("\n");
    const bom = "\uFEFF";
    const dataStr_1 = "data:text/csv;charset=utf-8," + encodeURIComponent(bom + csvContent);
    const downloadAnchorNode_1 = document.createElement("a");
    downloadAnchorNode_1.setAttribute("href", dataStr_1);
    downloadAnchorNode_1.setAttribute("download", `test_results_export_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
    document.body.appendChild(downloadAnchorNode_1);
    downloadAnchorNode_1.click();
    downloadAnchorNode_1.remove();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: CONFIG.style.title.className, children: "Tests" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        finishedTests.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleExportCsv, variant: "ghost", size: "sm", className: "gap-2 font-mono font-[10px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { size: 12 }),
            "CSV"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleExportAllJson, variant: "ghost", size: "sm", className: "gap-2 font-mono font-[10px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 12 }),
            "JSON"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          window.dispatchEvent(new Event("openTestDialog"));
        }, variant: "primary", size: "md", className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 16 }),
          "Testen"
        ] })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-red-800 dark:text-red-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Error:" }),
      " ",
      error
    ] }) }),
    activeTests.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" }),
          "Laufende Tests (",
          runningTests.length,
          queuedTests.length > 0 ? ` + ${queuedTests.length} in Warteschlange` : "",
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TestQueueStatus, { onRefresh: loadTestRuns })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 w-[80px]", children: "UUID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 w-[70px] text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 14, className: "inline" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 min-w-[160px]", children: "Formular" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 min-w-[160px]", children: "Bezahlmethode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 w-[150px]", children: "Gestartet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 w-[70px]", children: "Dauer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 w-[90px]", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 w-[80px] text-right", children: "Aktionen" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: activeTests.map((testRun_2) => {
          const isSelected_0 = selectedTestRun === testRun_2.id;
          const isQueued = testRun_2.status === "QUEUED";
          const isRunning = testRun_2.status === "RUNNING";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { tabIndex: 0, role: "button", "aria-selected": isSelected_0, className: `cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${isSelected_0 ? "bg-gray-100 dark:bg-gray-700" : isRunning ? "animate-blink-running" : isQueued ? "bg-gray-50/50 dark:bg-gray-800/50" : "bg-white dark:bg-gray-800"}`, onClick: () => handleSelectTestRun(testRun_2.id), onKeyDown: (e_0) => {
            if (e_0.key === "Enter" || e_0.key === " ") {
              e_0.preventDefault();
              handleSelectTestRun(testRun_2.id);
            }
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono text-gray-500 dark:text-gray-400", children: testRun_2.uuid ? testRun_2.uuid.substring(0, 8) : `ID:${testRun_2.id}` }),
              testRun_2.uuid && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e_1) => handleCopyUuid(e_1, testRun_2.uuid), className: "p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity", title: "ID kopieren", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 10 }) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 text-left", children: testRun_2.isScheduled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 16, className: "inline text-blue-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 16, className: "inline text-green-500" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 text-gray-500 dark:text-gray-400", children: renderIcon(getFormIcon(testRun_2.formId), 14) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-gray-900 dark:text-white truncate", children: testRun_2.formName })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 text-gray-500 dark:text-gray-400", children: renderIcon(getPaymentMethodIcon(testRun_2.paymentMethodId), 14) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-gray-900 dark:text-white truncate", children: testRun_2.paymentMethodName })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 text-[10px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap", children: formatDateTime(testRun_2.runAt) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RunningTimer, { runAt: testRun_2.runAt, isRunning }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: testRun_2.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-end gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_2) => {
              e_2.stopPropagation();
              handleStopTest(testRun_2);
            }, variant: "ghost", size: "sm", className: "text-red-600 dark:text-red-400", title: "Test stoppen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { size: 14, fill: "currentColor" }) }) }) })
          ] }, testRun_2.id);
        }) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12, className: "text-gray-400 dark:text-gray-500" }),
        "Ausgeführte Tests (",
        totalFilteredItems,
        ")"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableFilter, { searchTerm: filterConfig.searchTerm, onSearchChange: setSearchTerm, placeholder: "Tests durchsuchen...", statusFilter: filterConfig.statusFilter, onStatusFilterChange: setStatusFilter, statusOptions, onClear: clearFilters, rightContent: selectedCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(SelectionActionBar, { selectedCount, onClear: clearSelection, itemLabel: "Tests", actions: [{
        label: "Erneut testen",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 14 }),
        onClick: handleBulkRunAgain,
        variant: "secondary",
        loading: isBulkRunning
      }, {
        label: "Löschen",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }),
        onClick: () => setShowBulkDeleteConfirm(true),
        variant: "danger"
      }] }) : void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm overflow-hidden", children: isLoading && testRuns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TestResultsSkeleton, {}) : sortedFinishedTests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 dark:text-gray-400 mb-4", children: finishedTests.length === 0 ? "Noch keine abgeschlossenen Tests." : "Keine Tests gefunden." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 dark:text-gray-400", children: finishedTests.length === 0 ? "Führe Tests aus, um Ergebnisse hier zu sehen." : "Versuche andere Suchbegriffe oder Filter." })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-x-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 w-[40px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: computeIsAllSelected(sortedFinishedTests, selectedIds), indeterminate: computeIsPartialSelected(sortedFinishedTests, selectedIds), onCheckedChange: () => toggleAll(sortedFinishedTests), "aria-label": "Alle auswählen" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { className: "px-4 w-[80px]", children: "UUID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { className: "px-4 w-[70px] text-left justify-left", sortDirection: getSortDirection("isScheduled"), onSort: () => requestSort("isScheduled"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 14, className: "inline" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { className: "px-4 min-w-[180px]", sortDirection: getSortDirection("formName"), onSort: () => requestSort("formName"), children: "Formular" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { className: "px-4 min-w-[200px]", sortDirection: getSortDirection("paymentMethodName"), onSort: () => requestSort("paymentMethodName"), children: "Bezahlmethode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { className: "px-4 w-[150px]", sortDirection: getSortDirection("runAt"), onSort: () => requestSort("runAt"), children: "Datum" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { className: "px-4 w-[70px]", sortDirection: getSortDirection("durationMs"), onSort: () => requestSort("durationMs"), children: "Dauer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { className: "px-4 w-[90px]", sortDirection: getSortDirection("status"), onSort: () => requestSort("status"), children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 w-[80px] text-right", children: "Aktionen" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: sortedFinishedTests.map((testRun_3) => {
            const isRowSelected = selectedTestRun === testRun_3.id;
            const isChecked = isSelected(testRun_3.id);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { tabIndex: 0, role: "button", "aria-selected": isRowSelected, className: `cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${isChecked ? "bg-blue-50 dark:bg-blue-900/20" : isRowSelected ? "bg-gray-50 dark:bg-gray-700/50" : "bg-white dark:bg-gray-800"}`, onClick: () => handleSelectTestRun(testRun_3.id), onKeyDown: (e_3) => {
              if (e_3.key === "Enter" || e_3.key === " ") {
                e_3.preventDefault();
                handleSelectTestRun(testRun_3.id);
              }
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", onClick: (e_4) => e_4.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: isChecked, onCheckedChange: () => toggleItem(testRun_3.id), "aria-label": `${testRun_3.formName} auswählen` }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono text-gray-500 dark:text-gray-400", children: testRun_3.uuid ? testRun_3.uuid.substring(0, 8) : `ID:${testRun_3.id}` }),
                testRun_3.uuid && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e_5) => handleCopyUuid(e_5, testRun_3.uuid), className: "p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity", title: "ID kopieren", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 10 }) })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 text-left", children: testRun_3.isScheduled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 16, className: "inline text-blue-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 16, className: "inline text-green-500" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 text-gray-500 dark:text-gray-400", children: renderIcon(getFormIcon(testRun_3.formId), 14) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-gray-900 dark:text-white truncate", children: testRun_3.formName })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 text-gray-500 dark:text-gray-400", children: renderIcon(getPaymentMethodIcon(testRun_3.paymentMethodId), 14) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-gray-900 dark:text-white truncate", children: testRun_3.paymentMethodName })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 text-[10px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap", children: formatDateTime(testRun_3.runAt) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 text-[10px] font-mono text-gray-500 dark:text-gray-400", children: formatDuration(testRun_3.durationMs) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: testRun_3.status }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_6) => {
                  e_6.stopPropagation();
                  handleRunAgain(testRun_3);
                }, variant: "ghost", size: "sm", className: "text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300", title: "Test erneut ausführen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 16 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_7) => {
                  e_7.stopPropagation();
                  handleDeleteClick(testRun_3);
                }, variant: "ghost", size: "sm", className: "text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300", title: "Löschen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
              ] }) })
            ] }, testRun_3.id);
          }) })
        ] }),
        showPagination && /* @__PURE__ */ jsxRuntimeExports.jsx(TablePagination, { currentPage, totalPages, totalItems: totalFilteredItems, itemsPerPage, onPageChange: setCurrentPage })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Drawer, { open: !!selectedTestRun, onOpenChange: (open) => !open && handleSelectTestRun(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerContent, { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0", children: [
        selectedTestRunData && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex items-center gap-2 flex-shrink-0", children: selectedTestRunData.status === "RUNNING" || selectedTestRunData.status === "QUEUED" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: async (e_8) => {
          e_8.stopPropagation();
          await handleStopTest(selectedTestRunData);
        }, variant: "secondary", size: "sm", className: "gap-1.5 !bg-purple-600 !text-white hover:!bg-purple-700 !border-purple-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { size: 14 }),
          selectedTestRunData.status === "QUEUED" ? "Aus Warteschlange entfernen" : "Test stoppen"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: async (e_9) => {
            e_9.stopPropagation();
            await runTests([selectedTestRunData.formId], [selectedTestRunData.paymentMethodId]);
            handleSelectTestRun(null);
          }, variant: "primary", size: "sm", className: "gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 14 }),
            "Erneut ausführen"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: (e_10) => {
            e_10.stopPropagation();
            setShowDeleteConfirm({
              id: selectedTestRunData.id,
              name: `${getFormName(selectedTestRunData.formId)} × ${getPaymentMethodName(selectedTestRunData.paymentMethodId)}`
            });
          }, variant: "danger", size: "sm", className: "gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }),
            "Löschen"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `${CONFIG.style.title.className} flex items-center gap-3`, children: selectedTestRunData && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300 dark:text-gray-700", children: renderIcon(getFormIcon(selectedTestRunData.formId), 48) }),
          getFormName(selectedTestRunData.formId),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 dark:text-gray-500 font-normal", children: "×" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300 dark:text-gray-700", children: renderIcon(getPaymentMethodIcon(selectedTestRunData.paymentMethodId), 48) }),
          getPaymentMethodName(selectedTestRunData.paymentMethodId)
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerHeader, { className: "pt-6" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto space-y-4", children: selectedTestRunData ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 pb-6 border-b dark:border-gray-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-3", children: "Test Infos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 w-[120px] bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "ID" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs truncate font-mono bg-gray-100 dark:bg-gray-900/50 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700", children: selectedTestRunData.uuid || selectedTestRunData.id }),
                selectedTestRunData.uuid && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e_11) => handleCopyUuid(e_11, selectedTestRunData.uuid), className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", title: "ID kopieren", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 12 }) })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: selectedTestRunData.status }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Dauer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white font-mono", children: selectedTestRunData.status === "RUNNING" ? /* @__PURE__ */ jsxRuntimeExports.jsx(RunningTimer, { runAt: selectedTestRunData.runAt, isRunning: true }) : formatDuration(selectedTestRunData.durationMs) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Zeitpunkt" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white font-mono", children: formatDateTime(selectedTestRunData.runAt) })
            ] })
          ] }) }) })
        ] }),
        (() => {
          const formDetails = getFormDetails(selectedTestRunData.formId);
          return formDetails && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 pb-6 border-b dark:border-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400", children: "Formular" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: `/forms?id=${formDetails.id}`, className: "text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1", children: "Öffnen" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 w-[120px] bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white", children: formDetails.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: formDetails.isActive ? "active" : "inactive" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "URL" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: formDetails.url, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block", children: formDetails.url }) })
              ] })
            ] }) }) })
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
          const getMaskedDetails = (pm_2) => {
            if (!pm_2) return "";
            switch (pm_2.type) {
              case "paypal":
                return pm_2.details.email || "";
              case "sepa":
                return pm_2.details.accountHolder || (pm_2.details.iban ? `***${pm_2.details.iban.slice(-4)}` : "");
              case "creditcard":
                return pm_2.details.cardNumber ? `****${pm_2.details.cardNumber.slice(-4)}` : "";
              case "eps":
                return pm_2.details.bankCode || "";
              default:
                return "";
            }
          };
          return pmDetails && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 pb-6 border-b dark:border-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400", children: "Bezahlmethode" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: `/payment-methods?id=${pmDetails.id}`, className: "text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1", children: "Öffnen" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 w-[120px] bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white", children: pmDetails.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: pmDetails.isActive ? "active" : "inactive" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Typ" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white", children: getPaymentTypeLabel(pmDetails.type) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Details" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white font-mono", children: getMaskedDetails(pmDetails) })
              ] })
            ] }) }) })
          ] });
        })(),
        selectedTestRunData.errorMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 pb-6 border-b dark:border-gray-700 ", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2", children: "Error Message" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200 font-mono", children: selectedTestRunData.errorMessage })
        ] }),
        (selectedTestRunData.steps?.length || selectedTestRunData.logDetails) && /* @__PURE__ */ jsxRuntimeExports.jsx(TestTimeline, { steps: selectedTestRunData.steps, logDetails: selectedTestRunData.logDetails, status: selectedTestRunData.status }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScreenshotViewer, { screenshotPath: selectedTestRunData.screenshotPath, testName: `${getFormName(selectedTestRunData.formId)} × ${getPaymentMethodName(selectedTestRunData.paymentMethodId)}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 pb-6 border-b dark:border-gray-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2", children: [
            "Notes",
            isSavingNotes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-gray-400", children: "(saving...)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: notes, onChange: (e_12) => handleNotesChange(e_12.target.value), placeholder: "Add notes about this test run...", className: "w-full h-24 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-md resize-none !focus:outline-0 !focus:ring-0 !focus:ring-offset-0 !focus:ring-blue-500 dark:focus:ring-blue-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4 border-t border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "sm", onClick: handleExportJson, className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileBraces, { size: 16 }),
          "Export JSON"
        ] }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TestDetailsSkeleton, {}) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: !!showDeleteConfirm, onClose: () => setShowDeleteConfirm(null), onConfirm: confirmDeleteTestRun, title: "Test Run löschen", message: "Sind Sie sicher, dass Sie diesen Test Run löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.", itemName: showDeleteConfirm?.name, isLoading }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: showBulkDeleteConfirm, onClose: () => setShowBulkDeleteConfirm(false), onConfirm: handleBulkDelete, title: "Tests löschen", message: `Sind Sie sicher, dass Sie ${selectedCount} Test(s) löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`, itemName: `${selectedCount} ausgewählte Tests`, isLoading: isBulkDeleting })
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
