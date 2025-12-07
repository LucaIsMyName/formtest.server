import { i as dist, r as reactExports, aw as getAllIconNames, j as jsxRuntimeExports, ax as DialogHeader, ay as DialogTitle, az as Search, s as renderIcon, aA as DialogContent, aB as Dialog } from "./index-DzJQkFUp.js";
const IconPicker = (t0) => {
  const $ = dist.c(40);
  const {
    value,
    onChange,
    onClose
  } = t0;
  const [search, setSearch] = reactExports.useState("");
  let t1;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = getAllIconNames();
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const allIcons = t1;
  let t2;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    const shuffled = [...allIcons].sort(_temp$1);
    t2 = shuffled.slice(0, 50);
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const randomIcons = t2;
  let t3;
  bb0: {
    if (!search) {
      t3 = randomIcons;
      break bb0;
    }
    let t42;
    if ($[2] !== search) {
      const searchLower = search.toLowerCase();
      t42 = allIcons.filter((icon) => icon.toLowerCase().includes(searchLower));
      $[2] = search;
      $[3] = t42;
    } else {
      t42 = $[3];
    }
    t3 = t42;
  }
  const filteredIcons = t3;
  let t4;
  if ($[4] !== onChange || $[5] !== onClose) {
    t4 = (iconName) => {
      onChange(iconName);
      onClose();
    };
    $[4] = onChange;
    $[5] = onClose;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  const handleSelect = t4;
  let t5;
  if ($[7] !== onClose) {
    t5 = (open) => !open && onClose();
    $[7] = onClose;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  let t6;
  if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
    t6 = /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { className: "p-4 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Icon auswählen" }) });
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  let t7;
  if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
    t7 = /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", size: 18 });
    $[10] = t7;
  } else {
    t7 = $[10];
  }
  let t8;
  if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
    t8 = (e) => setSearch(e.target.value);
    $[11] = t8;
  } else {
    t8 = $[11];
  }
  let t9;
  if ($[12] !== search) {
    t9 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      t7,
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: search, onChange: t8, placeholder: "Icon suchen...", className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500", autoFocus: true })
    ] });
    $[12] = search;
    $[13] = t9;
  } else {
    t9 = $[13];
  }
  const t10 = search ? `${filteredIcons.length} ${filteredIcons.length === 1 ? "Icon" : "Icons"} gefunden` : `${filteredIcons.length} Icons angezeigt (von ${allIcons.length} gesamt)`;
  let t11;
  if ($[14] !== t10) {
    t11 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xs text-gray-500 dark:text-gray-400", children: t10 });
    $[14] = t10;
    $[15] = t11;
  } else {
    t11 = $[15];
  }
  let t12;
  if ($[16] !== t11 || $[17] !== t9) {
    t12 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800", children: [
      t9,
      t11
    ] });
    $[16] = t11;
    $[17] = t9;
    $[18] = t12;
  } else {
    t12 = $[18];
  }
  let t13;
  if ($[19] !== filteredIcons || $[20] !== handleSelect || $[21] !== value) {
    let t142;
    if ($[23] !== handleSelect || $[24] !== value) {
      t142 = (iconName_0) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleSelect(iconName_0), className: `flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${value === iconName_0 ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-600"}`, title: iconName_0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-700 dark:text-gray-300", children: renderIcon(iconName_0, 24) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-gray-500 dark:text-gray-400 mt-1 truncate w-full text-center", children: iconName_0 })
      ] }, iconName_0);
      $[23] = handleSelect;
      $[24] = value;
      $[25] = t142;
    } else {
      t142 = $[25];
    }
    t13 = filteredIcons.map(t142);
    $[19] = filteredIcons;
    $[20] = handleSelect;
    $[21] = value;
    $[22] = t13;
  } else {
    t13 = $[22];
  }
  let t14;
  if ($[26] !== t13) {
    t14 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2", children: t13 });
    $[26] = t13;
    $[27] = t14;
  } else {
    t14 = $[27];
  }
  let t15;
  if ($[28] !== filteredIcons.length) {
    t15 = filteredIcons.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-500 dark:text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Keine Icons gefunden" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-2", children: "Versuche einen anderen Suchbegriff" })
    ] });
    $[28] = filteredIcons.length;
    $[29] = t15;
  } else {
    t15 = $[29];
  }
  let t16;
  if ($[30] !== t14 || $[31] !== t15) {
    t16 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-800", children: [
      t14,
      t15
    ] });
    $[30] = t14;
    $[31] = t15;
    $[32] = t16;
  } else {
    t16 = $[32];
  }
  let t17;
  if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
    t17 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500 dark:text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Klicke auf ein Icon zum Auswählen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "ESC zum Schließen" })
    ] }) });
    $[33] = t17;
  } else {
    t17 = $[33];
  }
  let t18;
  if ($[34] !== t12 || $[35] !== t16) {
    t18 = /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden", children: [
      t6,
      t12,
      t16,
      t17
    ] });
    $[34] = t12;
    $[35] = t16;
    $[36] = t18;
  } else {
    t18 = $[36];
  }
  let t19;
  if ($[37] !== t18 || $[38] !== t5) {
    t19 = /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: t5, children: t18 });
    $[37] = t18;
    $[38] = t5;
    $[39] = t19;
  } else {
    t19 = $[39];
  }
  return t19;
};
function _temp$1() {
  return Math.random() - 0.5;
}
const MiniSparkline = (t0) => {
  const $ = dist.c(24);
  const {
    data,
    showTooltip: t1
  } = t0;
  const showTooltip = t1 === void 0 ? true : t1;
  let t2;
  bb0: {
    if (data.length === 0) {
      t2 = null;
      break bb0;
    }
    const totalTests = data.reduce(_temp, 0);
    const totalSuccess = data.reduce(_temp2, 0);
    const avgRate = totalTests > 0 ? totalSuccess / totalTests * 100 : 100;
    let t32;
    if ($[0] !== avgRate) {
      t32 = Math.round(avgRate / 10);
      $[0] = avgRate;
      $[1] = t32;
    } else {
      t32 = $[1];
    }
    const filledBullets = t32;
    const getColor = _temp3;
    let t42;
    if ($[2] !== avgRate) {
      t42 = getColor(avgRate);
      $[2] = avgRate;
      $[3] = t42;
    } else {
      t42 = $[3];
    }
    const colors = t42;
    let t52;
    if ($[4] !== avgRate || $[5] !== colors || $[6] !== filledBullets || $[7] !== totalSuccess || $[8] !== totalTests) {
      t52 = {
        avgRate,
        filledBullets,
        colors,
        totalTests,
        totalSuccess
      };
      $[4] = avgRate;
      $[5] = colors;
      $[6] = filledBullets;
      $[7] = totalSuccess;
      $[8] = totalTests;
      $[9] = t52;
    } else {
      t52 = $[9];
    }
    t2 = t52;
  }
  const chartData = t2;
  if (!chartData || data.length === 0) {
    let t32;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
      t32 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-0.5", style: {
        minWidth: "100px"
      }, children: Array.from({
        length: 10
      }).map(_temp4) });
      $[10] = t32;
    } else {
      t32 = $[10];
    }
    return t32;
  }
  const {
    avgRate: avgRate_0,
    filledBullets: filledBullets_0,
    colors: colors_0,
    totalTests: totalTests_0
  } = chartData;
  let t3;
  let t4;
  if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = {
      minWidth: "100px"
    };
    t4 = Array.from({
      length: 10
    });
    $[11] = t3;
    $[12] = t4;
  } else {
    t3 = $[11];
    t4 = $[12];
  }
  let t5;
  if ($[13] !== colors_0 || $[14] !== filledBullets_0 || $[15] !== t4) {
    t5 = t4.map((__0, i_0) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 rounded-full transition-colors flex-shrink-0", style: {
      backgroundColor: i_0 < filledBullets_0 ? colors_0.filled : colors_0.empty
    } }, i_0));
    $[13] = colors_0;
    $[14] = filledBullets_0;
    $[15] = t4;
    $[16] = t5;
  } else {
    t5 = $[16];
  }
  let t6;
  if ($[17] !== avgRate_0 || $[18] !== showTooltip || $[19] !== totalTests_0) {
    t6 = showTooltip && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: avgRate_0 >= 90 ? "text-green-400" : avgRate_0 >= 80 ? "text-orange-400" : "text-red-400", children: [
        avgRate_0.toFixed(0),
        "%"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400 ml-1", children: [
        "(",
        totalTests_0,
        " Tests, 14 Tage)"
      ] })
    ] });
    $[17] = avgRate_0;
    $[18] = showTooltip;
    $[19] = totalTests_0;
    $[20] = t6;
  } else {
    t6 = $[20];
  }
  let t7;
  if ($[21] !== t5 || $[22] !== t6) {
    t7 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group flex items-center gap-0.5", style: t3, children: [
      t5,
      t6
    ] });
    $[21] = t5;
    $[22] = t6;
    $[23] = t7;
  } else {
    t7 = $[23];
  }
  return t7;
};
function useSparklineData(testRuns, entityType, entityId, scheduleConfig) {
  return reactExports.useMemo(() => {
    const DAYS = 14;
    const now = /* @__PURE__ */ new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - DAYS);
    startDate.setHours(0, 0, 0, 0);
    const entityRuns = testRuns.filter((run) => {
      const runDate = new Date(run.runAt);
      if (runDate < startDate) return false;
      if (run.status === "RUNNING" || run.status === "QUEUED") return false;
      switch (entityType) {
        case "form":
          return run.formId === entityId;
        case "paymentMethod":
          return run.paymentMethodId === entityId;
        case "schedule":
          return scheduleConfig && run.formId === scheduleConfig.formId && run.paymentMethodId === scheduleConfig.paymentMethodId && run.isScheduled === true;
        default:
          return false;
      }
    });
    const byDate = {};
    for (let i = 0; i < DAYS; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (DAYS - 1 - i));
      const dateKey = date.toISOString().split("T")[0];
      byDate[dateKey] = {
        total: 0,
        success: 0
      };
    }
    entityRuns.forEach((run_0) => {
      const dateKey_0 = new Date(run_0.runAt).toISOString().split("T")[0];
      if (byDate[dateKey_0]) {
        byDate[dateKey_0].total++;
        if (run_0.status === "SUCCESS") {
          byDate[dateKey_0].success++;
        }
      }
    });
    const result = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date_0, {
      total,
      success
    }]) => ({
      date: date_0,
      total,
      success,
      rate: total > 0 ? success / total * 100 : 100
      // Default to 100% if no tests
    }));
    return result;
  }, [testRuns, entityType, entityId]);
}
function _temp(sum, d) {
  return sum + d.total;
}
function _temp2(sum_0, d_0) {
  return sum_0 + d_0.success;
}
function _temp3(rate) {
  if (rate >= 90) {
    return {
      filled: "#10b981",
      empty: "#d1fae5"
    };
  }
  if (rate >= 80) {
    return {
      filled: "#f97316",
      empty: "#fed7aa"
    };
  }
  return {
    filled: "#ef4444",
    empty: "#fecaca"
  };
}
function _temp4(_, i) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" }, i);
}
export {
  IconPicker as I,
  MiniSparkline as M,
  useSparklineData as u
};
