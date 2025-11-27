import { V as createLucideIcon, i as dist, j as jsxRuntimeExports, a6 as DialogHeader, a7 as DialogTitle, aA as DialogDescription, B as Button, aB as DialogFooter, a8 as DialogContent, a9 as Dialog } from "./index-DT77chWV.js";
/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode$1);
/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const TriangleAlert = createLucideIcon("triangle-alert", __iconNode);
const DeleteConfirmDialog = (t0) => {
  const $ = dist.c(31);
  const {
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
    isLoading: t1
  } = t0;
  const isLoading = t1 === void 0 ? false : t1;
  let t2;
  if ($[0] !== isLoading || $[1] !== onClose) {
    t2 = (open) => !open && !isLoading && onClose();
    $[0] = isLoading;
    $[1] = onClose;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-6 h-6 text-red-600 dark:text-red-400" }) });
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] !== title) {
    t4 = /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      t3,
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-lg", children: title })
    ] }) });
    $[4] = title;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  let t5;
  if ($[6] !== message) {
    t5 = /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-gray-600 dark:text-gray-400 text-base", children: message });
    $[6] = message;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== itemName) {
    t6 = itemName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-gray-900 dark:text-white mt-2", children: [
      '"',
      itemName,
      '"'
    ] });
    $[8] = itemName;
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  let t7;
  if ($[10] !== t5 || $[11] !== t6) {
    t7 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4", children: [
      t5,
      t6
    ] });
    $[10] = t5;
    $[11] = t6;
    $[12] = t7;
  } else {
    t7 = $[12];
  }
  let t8;
  if ($[13] !== isLoading || $[14] !== onClose) {
    t8 = /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onClose, variant: "secondary", size: "md", disabled: isLoading, children: "Abbrechen" });
    $[13] = isLoading;
    $[14] = onClose;
    $[15] = t8;
  } else {
    t8 = $[15];
  }
  const t9 = isLoading ? "Löschen..." : "Löschen bestätigen";
  let t10;
  if ($[16] !== isLoading || $[17] !== onConfirm || $[18] !== t9) {
    t10 = /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onConfirm, variant: "danger", size: "md", isLoading, disabled: isLoading, children: t9 });
    $[16] = isLoading;
    $[17] = onConfirm;
    $[18] = t9;
    $[19] = t10;
  } else {
    t10 = $[19];
  }
  let t11;
  if ($[20] !== t10 || $[21] !== t8) {
    t11 = /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      t8,
      t10
    ] });
    $[20] = t10;
    $[21] = t8;
    $[22] = t11;
  } else {
    t11 = $[22];
  }
  let t12;
  if ($[23] !== t11 || $[24] !== t4 || $[25] !== t7) {
    t12 = /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[450px]", children: [
      t4,
      t7,
      t11
    ] });
    $[23] = t11;
    $[24] = t4;
    $[25] = t7;
    $[26] = t12;
  } else {
    t12 = $[26];
  }
  let t13;
  if ($[27] !== isOpen || $[28] !== t12 || $[29] !== t2) {
    t13 = /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isOpen, onOpenChange: t2, children: t12 });
    $[27] = isOpen;
    $[28] = t12;
    $[29] = t2;
    $[30] = t13;
  } else {
    t13 = $[30];
  }
  return t13;
};
export {
  CircleAlert as C,
  DeleteConfirmDialog as D,
  TriangleAlert as T
};
