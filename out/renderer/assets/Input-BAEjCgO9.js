import { r as reactExports, i as dist, G as cn, j as jsxRuntimeExports } from "./index-D2jlI7ut.js";
const Input = reactExports.forwardRef((t0, ref) => {
  const $ = dist.c(11);
  let className;
  let props;
  let type;
  if ($[0] !== t0) {
    ({
      className,
      type,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = className;
    $[2] = props;
    $[3] = type;
  } else {
    className = $[1];
    props = $[2];
    type = $[3];
  }
  let t1;
  if ($[4] !== className) {
    t1 = cn("flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300 dark:text-white", className);
    $[4] = className;
    $[5] = t1;
  } else {
    t1 = $[5];
  }
  let t2;
  if ($[6] !== props || $[7] !== ref || $[8] !== t1 || $[9] !== type) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, className: t1, ref, ...props });
    $[6] = props;
    $[7] = ref;
    $[8] = t1;
    $[9] = type;
    $[10] = t2;
  } else {
    t2 = $[10];
  }
  return t2;
});
Input.displayName = "Input";
export {
  Input as I
};
