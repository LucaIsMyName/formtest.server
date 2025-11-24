import { r as reactExports, i as dist, G as cn, j as jsxRuntimeExports, K as Check } from "./index-D2jlI7ut.js";
import { R as Root2, V as Value, T as Trigger, P as Portal, C as Content2, I as Item, a as Icon, S as ScrollUpButton, b as ScrollDownButton, d as Viewport, L as Label, e as ItemIndicator, f as ItemText, g as Separator } from "./index-DxxRZT0o.js";
import { a as ChevronDown, b as ChevronUp } from "./upload-qBI3jaMr.js";
const Select = Root2;
const SelectValue = Value;
const SelectTrigger = reactExports.forwardRef((t0, ref) => {
  const $ = dist.c(12);
  let children;
  let className;
  let props;
  if ($[0] !== t0) {
    ({
      className,
      children,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = children;
    $[2] = className;
    $[3] = props;
  } else {
    children = $[1];
    className = $[2];
    props = $[3];
  }
  let t1;
  if ($[4] !== className) {
    t1 = cn("flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 dark:border-gray-700 dark:bg-gray-700 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus:ring-gray-300 dark:text-white", className);
    $[4] = className;
    $[5] = t1;
  } else {
    t1 = $[5];
  }
  let t2;
  if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) });
    $[6] = t2;
  } else {
    t2 = $[6];
  }
  let t3;
  if ($[7] !== children || $[8] !== props || $[9] !== ref || $[10] !== t1) {
    t3 = /* @__PURE__ */ jsxRuntimeExports.jsxs(Trigger, { ref, className: t1, ...props, children: [
      children,
      t2
    ] });
    $[7] = children;
    $[8] = props;
    $[9] = ref;
    $[10] = t1;
    $[11] = t3;
  } else {
    t3 = $[11];
  }
  return t3;
});
SelectTrigger.displayName = Trigger.displayName;
const SelectScrollUpButton = reactExports.forwardRef((t0, ref) => {
  const $ = dist.c(10);
  let className;
  let props;
  if ($[0] !== t0) {
    ({
      className,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = className;
    $[2] = props;
  } else {
    className = $[1];
    props = $[2];
  }
  let t1;
  if ($[3] !== className) {
    t1 = cn("flex cursor-default items-center justify-center py-1", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" });
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  let t3;
  if ($[6] !== props || $[7] !== ref || $[8] !== t1) {
    t3 = /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollUpButton, { ref, className: t1, ...props, children: t2 });
    $[6] = props;
    $[7] = ref;
    $[8] = t1;
    $[9] = t3;
  } else {
    t3 = $[9];
  }
  return t3;
});
SelectScrollUpButton.displayName = ScrollUpButton.displayName;
const SelectScrollDownButton = reactExports.forwardRef((t0, ref) => {
  const $ = dist.c(10);
  let className;
  let props;
  if ($[0] !== t0) {
    ({
      className,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = className;
    $[2] = props;
  } else {
    className = $[1];
    props = $[2];
  }
  let t1;
  if ($[3] !== className) {
    t1 = cn("flex cursor-default items-center justify-center py-1", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" });
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  let t3;
  if ($[6] !== props || $[7] !== ref || $[8] !== t1) {
    t3 = /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollDownButton, { ref, className: t1, ...props, children: t2 });
    $[6] = props;
    $[7] = ref;
    $[8] = t1;
    $[9] = t3;
  } else {
    t3 = $[9];
  }
  return t3;
});
SelectScrollDownButton.displayName = ScrollDownButton.displayName;
const SelectContent = reactExports.forwardRef((t0, ref) => {
  const $ = dist.c(21);
  let children;
  let className;
  let props;
  let t1;
  if ($[0] !== t0) {
    ({
      className,
      children,
      position: t1,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = children;
    $[2] = className;
    $[3] = props;
    $[4] = t1;
  } else {
    children = $[1];
    className = $[2];
    props = $[3];
    t1 = $[4];
  }
  const position = t1 === void 0 ? "popper" : t1;
  const t2 = position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1";
  let t3;
  if ($[5] !== className || $[6] !== t2) {
    t3 = cn("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-950 dark:text-gray-50 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-gray-800 dark:text-gray-50", t2, className);
    $[5] = className;
    $[6] = t2;
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  let t4;
  if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = /* @__PURE__ */ jsxRuntimeExports.jsx(SelectScrollUpButton, {});
    $[8] = t4;
  } else {
    t4 = $[8];
  }
  const t5 = position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]";
  let t6;
  if ($[9] !== t5) {
    t6 = cn("p-1", t5);
    $[9] = t5;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  let t7;
  if ($[11] !== children || $[12] !== t6) {
    t7 = /* @__PURE__ */ jsxRuntimeExports.jsx(Viewport, { className: t6, children });
    $[11] = children;
    $[12] = t6;
    $[13] = t7;
  } else {
    t7 = $[13];
  }
  let t8;
  if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
    t8 = /* @__PURE__ */ jsxRuntimeExports.jsx(SelectScrollDownButton, {});
    $[14] = t8;
  } else {
    t8 = $[14];
  }
  let t9;
  if ($[15] !== position || $[16] !== props || $[17] !== ref || $[18] !== t3 || $[19] !== t7) {
    t9 = /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Content2, { ref, className: t3, position, ...props, children: [
      t4,
      t7,
      t8
    ] }) });
    $[15] = position;
    $[16] = props;
    $[17] = ref;
    $[18] = t3;
    $[19] = t7;
    $[20] = t9;
  } else {
    t9 = $[20];
  }
  return t9;
});
SelectContent.displayName = Content2.displayName;
const SelectLabel = reactExports.forwardRef((t0, ref) => {
  const $ = dist.c(9);
  let className;
  let props;
  if ($[0] !== t0) {
    ({
      className,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = className;
    $[2] = props;
  } else {
    className = $[1];
    props = $[2];
  }
  let t1;
  if ($[3] !== className) {
    t1 = cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== props || $[6] !== ref || $[7] !== t1) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { ref, className: t1, ...props });
    $[5] = props;
    $[6] = ref;
    $[7] = t1;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  return t2;
});
SelectLabel.displayName = Label.displayName;
const SelectItem = reactExports.forwardRef((t0, ref) => {
  const $ = dist.c(14);
  let children;
  let className;
  let props;
  if ($[0] !== t0) {
    ({
      className,
      children,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = children;
    $[2] = className;
    $[3] = props;
  } else {
    children = $[1];
    className = $[2];
    props = $[3];
  }
  let t1;
  if ($[4] !== className) {
    t1 = cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-700 dark:focus:text-gray-50", className);
    $[4] = className;
    $[5] = t1;
  } else {
    t1 = $[5];
  }
  let t2;
  if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }) });
    $[6] = t2;
  } else {
    t2 = $[6];
  }
  let t3;
  if ($[7] !== children) {
    t3 = /* @__PURE__ */ jsxRuntimeExports.jsx(ItemText, { children });
    $[7] = children;
    $[8] = t3;
  } else {
    t3 = $[8];
  }
  let t4;
  if ($[9] !== props || $[10] !== ref || $[11] !== t1 || $[12] !== t3) {
    t4 = /* @__PURE__ */ jsxRuntimeExports.jsxs(Item, { ref, className: t1, ...props, children: [
      t2,
      t3
    ] });
    $[9] = props;
    $[10] = ref;
    $[11] = t1;
    $[12] = t3;
    $[13] = t4;
  } else {
    t4 = $[13];
  }
  return t4;
});
SelectItem.displayName = Item.displayName;
const SelectSeparator = reactExports.forwardRef((t0, ref) => {
  const $ = dist.c(9);
  let className;
  let props;
  if ($[0] !== t0) {
    ({
      className,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = className;
    $[2] = props;
  } else {
    className = $[1];
    props = $[2];
  }
  let t1;
  if ($[3] !== className) {
    t1 = cn("-mx-1 my-1 h-px bg-gray-100 dark:bg-gray-700", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== props || $[6] !== ref || $[7] !== t1) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { ref, className: t1, ...props });
    $[5] = props;
    $[6] = ref;
    $[7] = t1;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  return t2;
});
SelectSeparator.displayName = Separator.displayName;
export {
  Select as S,
  SelectTrigger as a,
  SelectValue as b,
  SelectContent as c,
  SelectItem as d
};
