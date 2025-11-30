import { i as dist, r as reactExports, at as getAllIconNames, j as jsxRuntimeExports, au as DialogHeader, av as DialogTitle, aw as Search, l as renderIcon, ax as DialogContent, ay as Dialog } from "./index-B2XIpUw8.js";
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
    const shuffled = [...allIcons].sort(_temp);
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
function _temp() {
  return Math.random() - 0.5;
}
export {
  IconPicker as I
};
