import { r as reactExports, n as createRovingFocusGroupScope, o as useDirection, p as useControllableState, j as jsxRuntimeExports, q as createContextScope, s as Root, P as Primitive, t as useComposedRefs, I as Item, v as composeEventHandlers, x as usePrevious, y as useSize, z as Presence, i as dist, A as cn, D as useSettingsStore, L as Label, M as Monitor, E as Sun, G as Moon, B as Button, k as Checkbox, H as CircleCheck } from "./index-COXSkP6q.js";
import { C as CONFIG } from "./app.config-KSZPYlnw.js";
import { I as Input, S as Select, b as SelectTrigger, c as SelectValue, d as SelectContent, e as SelectItem, T as TriangleAlert, f as StatusBadge, g as CircleAlert, D as DeleteConfirmDialog } from "./Badge-D-nnZLTW.js";
import { C as Circle, D as Download, U as Upload } from "./upload-DTTmLK8T.js";
import { S as Skeleton } from "./Skeleton-DKWULUnj.js";
var RADIO_NAME = "Radio";
var [createRadioContext, createRadioScope] = createContextScope(RADIO_NAME);
var [RadioProvider, useRadioContext] = createRadioContext(RADIO_NAME);
var Radio = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRadio,
      name,
      checked = false,
      required,
      disabled,
      value = "on",
      onCheck,
      form,
      ...radioProps
    } = props;
    const [button, setButton] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setButton(node));
    const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
    const isFormControl = button ? form || !!button.closest("form") : true;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(RadioProvider, { scope: __scopeRadio, checked, disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.button,
        {
          type: "button",
          role: "radio",
          "aria-checked": checked,
          "data-state": getState(checked),
          "data-disabled": disabled ? "" : void 0,
          disabled,
          value,
          ...radioProps,
          ref: composedRefs,
          onClick: composeEventHandlers(props.onClick, (event) => {
            if (!checked) onCheck?.();
            if (isFormControl) {
              hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
              if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
            }
          })
        }
      ),
      isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        RadioBubbleInput,
        {
          control: button,
          bubbles: !hasConsumerStoppedPropagationRef.current,
          name,
          value,
          checked,
          required,
          disabled,
          form,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
Radio.displayName = RADIO_NAME;
var INDICATOR_NAME = "RadioIndicator";
var RadioIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeRadio, forceMount, ...indicatorProps } = props;
    const context = useRadioContext(INDICATOR_NAME, __scopeRadio);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.checked, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-state": getState(context.checked),
        "data-disabled": context.disabled ? "" : void 0,
        ...indicatorProps,
        ref: forwardedRef
      }
    ) });
  }
);
RadioIndicator.displayName = INDICATOR_NAME;
var BUBBLE_INPUT_NAME = "RadioBubbleInput";
var RadioBubbleInput = reactExports.forwardRef(
  ({
    __scopeRadio,
    control,
    checked,
    bubbles = true,
    ...props
  }, forwardedRef) => {
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(ref, forwardedRef);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = ref.current;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        setChecked.call(input, checked);
        input.dispatchEvent(event);
      }
    }, [prevChecked, checked, bubbles]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.input,
      {
        type: "radio",
        "aria-hidden": true,
        defaultChecked: checked,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0
        }
      }
    );
  }
);
RadioBubbleInput.displayName = BUBBLE_INPUT_NAME;
function getState(checked) {
  return checked ? "checked" : "unchecked";
}
var ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
var RADIO_GROUP_NAME = "RadioGroup";
var [createRadioGroupContext] = createContextScope(RADIO_GROUP_NAME, [
  createRovingFocusGroupScope,
  createRadioScope
]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var useRadioScope = createRadioScope();
var [RadioGroupProvider, useRadioGroupContext] = createRadioGroupContext(RADIO_GROUP_NAME);
var RadioGroup$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRadioGroup,
      name,
      defaultValue,
      value: valueProp,
      required = false,
      disabled = false,
      orientation,
      dir,
      loop = true,
      onValueChange,
      ...groupProps
    } = props;
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeRadioGroup);
    const direction = useDirection(dir);
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? null,
      onChange: onValueChange,
      caller: RADIO_GROUP_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      RadioGroupProvider,
      {
        scope: __scopeRadioGroup,
        name,
        required,
        disabled,
        value,
        onValueChange: setValue,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Root,
          {
            asChild: true,
            ...rovingFocusGroupScope,
            orientation,
            dir: direction,
            loop,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Primitive.div,
              {
                role: "radiogroup",
                "aria-required": required,
                "aria-orientation": orientation,
                "data-disabled": disabled ? "" : void 0,
                dir: direction,
                ...groupProps,
                ref: forwardedRef
              }
            )
          }
        )
      }
    );
  }
);
RadioGroup$1.displayName = RADIO_GROUP_NAME;
var ITEM_NAME = "RadioGroupItem";
var RadioGroupItem$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeRadioGroup, disabled, ...itemProps } = props;
    const context = useRadioGroupContext(ITEM_NAME, __scopeRadioGroup);
    const isDisabled = context.disabled || disabled;
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeRadioGroup);
    const radioScope = useRadioScope(__scopeRadioGroup);
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const checked = context.value === itemProps.value;
    const isArrowKeyPressedRef = reactExports.useRef(false);
    reactExports.useEffect(() => {
      const handleKeyDown = (event) => {
        if (ARROW_KEYS.includes(event.key)) {
          isArrowKeyPressedRef.current = true;
        }
      };
      const handleKeyUp = () => isArrowKeyPressedRef.current = false;
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
      };
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Item,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !isDisabled,
        active: checked,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Radio,
          {
            disabled: isDisabled,
            required: context.required,
            checked,
            ...radioScope,
            ...itemProps,
            name: context.name,
            ref: composedRefs,
            onCheck: () => context.onValueChange(itemProps.value),
            onKeyDown: composeEventHandlers((event) => {
              if (event.key === "Enter") event.preventDefault();
            }),
            onFocus: composeEventHandlers(itemProps.onFocus, () => {
              if (isArrowKeyPressedRef.current) ref.current?.click();
            })
          }
        )
      }
    );
  }
);
RadioGroupItem$1.displayName = ITEM_NAME;
var INDICATOR_NAME2 = "RadioGroupIndicator";
var RadioGroupIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeRadioGroup, ...indicatorProps } = props;
    const radioScope = useRadioScope(__scopeRadioGroup);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RadioIndicator, { ...radioScope, ...indicatorProps, ref: forwardedRef });
  }
);
RadioGroupIndicator.displayName = INDICATOR_NAME2;
var Root2 = RadioGroup$1;
var Item2 = RadioGroupItem$1;
var Indicator = RadioGroupIndicator;
const RadioGroup = reactExports.forwardRef((t0, ref) => {
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
    t1 = cn("grid gap-2", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== props || $[6] !== ref || $[7] !== t1) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx(Root2, { className: t1, ...props, ref });
    $[5] = props;
    $[6] = ref;
    $[7] = t1;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  return t2;
});
RadioGroup.displayName = Root2.displayName;
const RadioGroupItem = reactExports.forwardRef((t0, ref) => {
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
    t1 = cn("aspect-square h-4 w-4 rounded-full border border-gray-300 text-blue-600 ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-blue-500 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300", className);
    $[3] = className;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx(Indicator, { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-2.5 w-2.5 fill-current text-current" }) });
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  let t3;
  if ($[6] !== props || $[7] !== ref || $[8] !== t1) {
    t3 = /* @__PURE__ */ jsxRuntimeExports.jsx(Item2, { ref, className: t1, ...props, children: t2 });
    $[6] = props;
    $[7] = ref;
    $[8] = t1;
    $[9] = t3;
  } else {
    t3 = $[9];
  }
  return t3;
});
RadioGroupItem.displayName = Item2.displayName;
const SettingsSkeleton = () => {
  const $ = dist.c(5);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-32 mb-4" });
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  let t1;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-16 mb-2" });
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6", children: [
      t0,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        t1,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full rounded-lg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full rounded-lg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full rounded-lg" })
        ] })
      ] }) })
    ] });
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-40 mb-4" });
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      t2,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6", children: [
        t3,
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: [...Array(4)].map(_temp) })
      ] })
    ] });
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  return t4;
};
const Settings = () => {
  const {
    settings,
    isLoading,
    error,
    loadSettings,
    updateSetting
  } = useSettingsStore();
  const [donationAmount, setDonationAmount] = reactExports.useState("50");
  const [donationInterval, setDonationInterval] = reactExports.useState("0");
  const [testTimeout, setTestTimeout] = reactExports.useState("30000");
  const [headlessMode, setHeadlessMode] = reactExports.useState("true");
  const [slowMotion, setSlowMotion] = reactExports.useState("0");
  const [theme, setTheme] = reactExports.useState("system");
  const [exportOptions, setExportOptions] = reactExports.useState({
    includeForms: true,
    includePaymentMethods: true,
    includeTestRuns: true,
    includeSchedules: true,
    includeSettings: true
  });
  const [importMode, setImportMode] = reactExports.useState("merge");
  const [importResult, setImportResult] = reactExports.useState(null);
  const [exportMessage, setExportMessage] = reactExports.useState(null);
  const [isExporting, setIsExporting] = reactExports.useState(false);
  const [isImporting, setIsImporting] = reactExports.useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = reactExports.useState(null);
  const [isDeleting, setIsDeleting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    loadSettings();
  }, [loadSettings]);
  const applyTheme = (themeValue) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (themeValue === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(themeValue);
    }
  };
  reactExports.useEffect(() => {
    settings.forEach((setting) => {
      switch (setting.key) {
        case "default_donation_amount":
          setDonationAmount(setting.value);
          break;
        case "default_interval":
          setDonationInterval(setting.value);
          break;
        case "test_timeout":
          setTestTimeout(setting.value);
          break;
        case "headless_mode":
          setHeadlessMode(setting.value);
          break;
        case "slow_motion":
          setSlowMotion(setting.value);
          break;
        case "theme":
          setTheme(setting.value);
          break;
      }
    });
  }, [settings]);
  const handleDonationAmountChange = (value) => {
    setDonationAmount(value);
  };
  const saveDonationAmount = async () => {
    await updateSetting("default_donation_amount", donationAmount, "Standard-Spendenbetrag in EUR");
  };
  const handleDonationIntervalChange = async (value_0) => {
    setDonationInterval(value_0);
    await updateSetting("default_interval", value_0, "Standard-Spendenintervall (0=einmalig, 1=monatlich)");
  };
  const handleTestTimeoutChange = (value_1) => {
    setTestTimeout(value_1);
  };
  const saveTestTimeout = async () => {
    await updateSetting("test_timeout", testTimeout, "Test-Timeout in Millisekunden");
  };
  const handleHeadlessModeChange = async (value_2) => {
    setHeadlessMode(value_2);
    await updateSetting("headless_mode", value_2, "Tests im Headless-Modus ausführen");
  };
  const handleSlowMotionChange = async (value_3) => {
    setSlowMotion(value_3);
    await updateSetting("slow_motion", value_3, "Slow Motion Verzögerung in ms (0=aus, 500=langsam, 1000=sehr langsam)");
  };
  const handleThemeChange = async (value_4) => {
    setTheme(value_4);
    await updateSetting("theme", value_4, "UI-Theme-Präferenz (system, light, dark)");
    applyTheme(value_4);
  };
  const handleDelete = async () => {
    if (!deleteConfirmation) return;
    setIsDeleting(true);
    try {
      const api = window.api;
      switch (deleteConfirmation.type) {
        case "forms":
          await api.forms.deleteAll();
          break;
        case "paymentMethods":
          await api.paymentMethods.deleteAll();
          break;
        case "testRuns":
          await api.testRuns.deleteAll();
          break;
        case "schedules":
          await api.testSchedules.deleteAll();
          break;
        case "all":
          await api.forms.deleteAll();
          await api.paymentMethods.deleteAll();
          break;
      }
      setDeleteConfirmation(null);
    } catch (error_0) {
      console.error("Failed to delete data:", error_0);
    } finally {
      setIsDeleting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: CONFIG.style.title.className, children: "Einstellungen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-gray-800 dark:text-gray-400 mt-1", children: "Globale Optionen für Formular-Tests konfigurieren" })
    ] }) }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border rounded-md p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-red-800 dark:text-red-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Error:" }),
      " ",
      error
    ] }) }) }),
    isLoading && settings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsSkeleton, {}) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Darstellung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "block mb-2 text-gray-800 dark:text-gray-400", children: "Theme" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleThemeChange("system"), className: `flex flex-col items-center justify-center p-4 border rounded-lg transition-colors ${theme === "system" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { className: "w-6 h-6 mb-2 text-gray-700 dark:text-gray-300" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                fontStretch: "115%"
              }, className: "text-sm font-medium text-gray-900 dark:text-white", children: "System" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleThemeChange("light"), className: `flex flex-col items-center justify-center p-4 border rounded-lg transition-colors ${theme === "light" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "w-6 h-6 mb-2 text-gray-700 dark:text-gray-300" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                fontStretch: "115%"
              }, className: "text-sm font-medium text-gray-900 dark:text-white", children: "Hell" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleThemeChange("dark"), className: `flex flex-col items-center justify-center p-4 border rounded-lg transition-colors ${theme === "dark" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "w-6 h-6 mb-2 text-gray-700 dark:text-gray-300" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                fontStretch: "115%"
              }, className: "text-sm font-medium text-gray-900 dark:text-white", children: "Dunkel" })
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Test-Einstellungen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-800 dark:text-gray-400", htmlFor: "donation-amount", children: "Standard-Spendenbetrag (EUR)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "donation-amount", type: "number", value: donationAmount, onChange: (e) => handleDonationAmountChange(e.target.value), onBlur: saveDonationAmount, disabled: isLoading }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Der Standardbetrag, der beim Testen von Spendenformularen verwendet wird" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-800 dark:text-gray-400", htmlFor: "headless-mode", children: "Headless-Modus" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: headlessMode, onValueChange: handleHeadlessModeChange, disabled: isLoading, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "headless-mode", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Headless Modus" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: "Aktiviert" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: "Deaktiviert" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Browser-Tests ohne sichtbares Fenster ausführen" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-800 dark:text-gray-400", htmlFor: "donation-interval", children: "Standard-Spendenintervall" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: donationInterval, onValueChange: handleDonationIntervalChange, disabled: isLoading, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "donation-interval", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Wähle ein Intervall" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "0", children: "Einmalig" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "1", children: "Monatlich" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3", children: "Vierteljährlich" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "12", children: "Jährlich" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Das Standard-Spendenintervall für Tests" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-800 dark:text-gray-400", htmlFor: "slow-motion", children: "Slow Motion (Debugging)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: slowMotion, onValueChange: handleSlowMotionChange, disabled: isLoading, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "slow-motion", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Slow Motion" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "0", children: "Aus (Normal)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "250", children: "250ms (Schnell)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "500", children: "500ms (Langsam)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "1000", children: "1000ms (Sehr langsam)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2000", children: "2000ms (Debug)" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Verzögerung zwischen Aktionen zum Debuggen. Deaktiviere Headless-Modus um den Browser zu sehen." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-800 dark:text-gray-400", htmlFor: "test-timeout", children: "Test-Timeout (Millisekunden)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "test-timeout", type: "number", value: testTimeout, onChange: (e_0) => handleTestTimeoutChange(e_0.target.value), onBlur: saveTestTimeout, disabled: isLoading }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Maximale Wartezeit für Test-Operationen (Standard: 30000ms = 30 Sekunden)" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-gray-900 dark:text-white text-lg font-semibold mb-4", children: "Daten löschen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: "Hier können Sie Daten endgültig löschen. Diese Aktionen können nicht rückgängig gemacht werden." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "md", onClick: () => setDeleteConfirmation({
            type: "forms",
            title: "Alle Formulare löschen",
            message: "Sind Sie sicher, dass Sie ALLE Formulare löschen möchten? Dies löscht auch alle zugehörigen Test-Resultate und Zeitpläne."
          }), className: "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20", children: "Alle Formulare löschen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "md", onClick: () => setDeleteConfirmation({
            type: "paymentMethods",
            title: "Alle Bezahlmethoden löschen",
            message: "Sind Sie sicher, dass Sie ALLE Bezahlmethoden löschen möchten? Dies löscht auch alle zugehörigen Test-Resultate und Zeitpläne."
          }), className: "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20", children: "Alle Bezahlmethoden löschen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "md", onClick: () => setDeleteConfirmation({
            type: "testRuns",
            title: "Alle Test-Resultate löschen",
            message: "Sind Sie sicher, dass Sie ALLE Test-Resultate löschen möchten?"
          }), className: "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20", children: "Alle Test-Resultate löschen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "md", onClick: () => setDeleteConfirmation({
            type: "schedules",
            title: "Alle Zeitpläne löschen",
            message: "Sind Sie sicher, dass Sie ALLE Zeitpläne löschen möchten?"
          }), className: "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20", children: "Alle Zeitpläne löschen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "danger", size: "md", onClick: () => setDeleteConfirmation({
            type: "all",
            title: "ALLES löschen (Factory Reset)",
            message: "ACHTUNG: Sind Sie sicher, dass Sie ALLE Daten (Formulare, Bezahlmethoden, Tests, Zeitpläne) löschen möchten? Die Anwendung wird auf den Ursprungszustand zurückgesetzt (außer Einstellungen)."
          }), className: "hover:bg-red-700 text-white border-none gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18 }),
            "Alle Daten löschen"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Import / Export" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-md font-medium text-gray-900 dark:text-white mb-3", children: "Daten exportieren" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-800 dark:text-gray-400 mb-4", children: "Wähle die Daten aus, die du exportieren möchtest:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "export-forms", checked: exportOptions.includeForms, onCheckedChange: (checked) => setExportOptions({
                  ...exportOptions,
                  includeForms: checked === true
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-normal cursor-pointer text-gray-800 dark:text-gray-400", htmlFor: "export-forms", children: "Formulare" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "export-payment", checked: exportOptions.includePaymentMethods, onCheckedChange: (checked_0) => setExportOptions({
                  ...exportOptions,
                  includePaymentMethods: checked_0 === true
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-normal cursor-pointer text-gray-800 dark:text-gray-400", htmlFor: "export-payment", children: "Bezahlmethoden" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "export-runs", checked: exportOptions.includeTestRuns, onCheckedChange: (checked_1) => setExportOptions({
                  ...exportOptions,
                  includeTestRuns: checked_1 === true
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-normal cursor-pointer text-gray-800 dark:text-gray-400", htmlFor: "export-runs", children: "Test Resultate" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "export-schedules", checked: exportOptions.includeSchedules, onCheckedChange: (checked_2) => setExportOptions({
                  ...exportOptions,
                  includeSchedules: checked_2 === true
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-normal cursor-pointer text-gray-800 dark:text-gray-400", htmlFor: "export-schedules", children: "Autopilot (Zeitpläne)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "export-settings", checked: exportOptions.includeSettings, onCheckedChange: (checked_3) => setExportOptions({
                  ...exportOptions,
                  includeSettings: checked_3 === true
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-normal cursor-pointer text-gray-800 dark:text-gray-400", htmlFor: "export-settings", children: "Einstellungen" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: async () => {
              setIsExporting(true);
              setExportMessage(null);
              try {
                const result = await window.api.database.export(exportOptions);
                if (result.success) {
                  setExportMessage(`✓ ${result.message}`);
                } else {
                  setExportMessage(`✗ ${result.message}`);
                }
              } catch (error_1) {
                setExportMessage(`✗ Export fehlgeschlagen: ${error_1.message}`);
              } finally {
                setIsExporting(false);
              }
            }, variant: "primary", size: "md", disabled: isExporting || !exportOptions.includeForms && !exportOptions.includePaymentMethods && !exportOptions.includeTestRuns && !exportOptions.includeSchedules && !exportOptions.includeSettings, isLoading: isExporting, className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 16 }),
              isExporting ? "Exportiere..." : "Daten exportieren"
            ] }),
            exportMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-3 p-3 rounded-md ${exportMessage.startsWith("✓") ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200" : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: exportMessage }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-md font-medium text-gray-900 dark:text-white mb-3", children: "Daten importieren" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-800 dark:text-gray-400 mb-4", children: "Wähle den Import-Modus:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(RadioGroup, { value: importMode, onValueChange: (val) => setImportMode(val), className: "mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "merge", id: "import-merge", className: "mt-1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 leading-none", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "cursor-pointer text-gray-800 dark:text-gray-400", htmlFor: "import-merge", children: "Zusammenführen (Empfohlen)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Bestehende Daten bleiben erhalten. Neue Einträge werden hinzugefügt, unterschiedliche Einträge werden aktualisiert." })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-none opacity-50 flex items-start space-x-2 mt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "overwrite", id: "import-overwrite", className: "mt-1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 leading-none", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "import-overwrite", className: "cursor-pointer font-normal text-gray-800 dark:text-gray-400", children: [
                    "Überschreiben ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: "", children: "Development" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Alle ausgewählten Daten werden gelöscht und durch die importierten Daten ersetzt." })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Zu importierende Daten:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "import-forms", checked: exportOptions.includeForms, onCheckedChange: (checked_4) => setExportOptions({
                  ...exportOptions,
                  includeForms: checked_4 === true
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-normal cursor-pointer text-gray-800 dark:text-gray-400", htmlFor: "import-forms", children: "Formulare" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "import-payment", checked: exportOptions.includePaymentMethods, onCheckedChange: (checked_5) => setExportOptions({
                  ...exportOptions,
                  includePaymentMethods: checked_5 === true
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-normal cursor-pointer text-gray-800 dark:text-gray-400", htmlFor: "import-payment", children: "Bezahlmethoden" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "import-runs", checked: exportOptions.includeTestRuns, onCheckedChange: (checked_6) => setExportOptions({
                  ...exportOptions,
                  includeTestRuns: checked_6 === true
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-normal cursor-pointer text-gray-800 dark:text-gray-400", htmlFor: "import-runs", children: "Test Resultate" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "import-schedules", checked: exportOptions.includeSchedules, onCheckedChange: (checked_7) => setExportOptions({
                  ...exportOptions,
                  includeSchedules: checked_7 === true
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-normal cursor-pointer text-gray-800 dark:text-gray-400", htmlFor: "import-schedules", children: "Autopilot (Zeitpläne)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "import-settings", checked: exportOptions.includeSettings, onCheckedChange: (checked_8) => setExportOptions({
                  ...exportOptions,
                  includeSettings: checked_8 === true
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-normal cursor-pointer text-gray-800 dark:text-gray-400", htmlFor: "import-settings", children: "Einstellungen" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: async () => {
              setIsImporting(true);
              setImportResult(null);
              try {
                const result_0 = await window.api.database.import(importMode, exportOptions);
                setImportResult(result_0);
              } catch (error_2) {
                setImportResult({
                  success: false,
                  imported: {
                    forms: 0,
                    paymentMethods: 0,
                    testRuns: 0,
                    schedules: 0,
                    settings: 0
                  },
                  skipped: {
                    forms: 0,
                    paymentMethods: 0,
                    testRuns: 0,
                    schedules: 0,
                    settings: 0
                  },
                  errors: [`Import fehlgeschlagen: ${error_2.message}`],
                  warnings: []
                });
              } finally {
                setIsImporting(false);
              }
            }, variant: "secondary", size: "md", disabled: isImporting || !exportOptions.includeForms && !exportOptions.includePaymentMethods && !exportOptions.includeTestRuns && !exportOptions.includeSchedules && !exportOptions.includeSettings, isLoading: isImporting, className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 16 }),
              isImporting ? "Importiere..." : "Daten importieren"
            ] }),
            importResult && importResult.imported && importResult.skipped && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-4 p-4 rounded-md ${importResult.success ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 mb-3", children: [
                importResult.success ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "text-green-600 dark:text-green-400 flex-shrink-0", size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "text-red-600 dark:text-red-400 flex-shrink-0", size: 20 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: `text-sm font-medium ${importResult.success ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`, children: importResult.success ? "Import erfolgreich!" : "Import abgebrochen oder mit Fehlern" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-700 dark:text-gray-300", children: "Importiert:" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-xs !text-gray-600 !dark:text-gray-400 ml-4", children: [
                      importResult.imported.forms > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                        "• ",
                        importResult.imported.forms,
                        " Formulare"
                      ] }),
                      importResult.imported.paymentMethods > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                        "• ",
                        importResult.imported.paymentMethods,
                        " Bezahlmethoden"
                      ] }),
                      importResult.imported.testRuns > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                        "• ",
                        importResult.imported.testRuns,
                        " Test Resultate"
                      ] }),
                      importResult.imported.schedules > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                        "• ",
                        importResult.imported.schedules,
                        " Autopilot (Zeitpläne)"
                      ] }),
                      importResult.imported.settings > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                        "• ",
                        importResult.imported.settings,
                        " Einstellungen"
                      ] }),
                      importResult.imported.forms === 0 && importResult.imported.paymentMethods === 0 && importResult.imported.testRuns === 0 && importResult.imported.schedules === 0 && importResult.imported.settings === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "italic text-gray-500", children: "Keine Daten importiert" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-700 dark:text-gray-300", children: "Übersprungen:" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-xs !text-gray-600 !dark:text-gray-400 ml-4", children: [
                      importResult.skipped.forms > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                        "• ",
                        importResult.skipped.forms,
                        " Formulare"
                      ] }),
                      importResult.skipped.paymentMethods > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                        "• ",
                        importResult.skipped.paymentMethods,
                        " Bezahlmethoden"
                      ] }),
                      importResult.skipped.testRuns > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                        "• ",
                        importResult.skipped.testRuns,
                        " Test Resultate"
                      ] }),
                      importResult.skipped.schedules > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                        "• ",
                        importResult.skipped.schedules,
                        " Autopilot (Zeitpläne)"
                      ] }),
                      importResult.skipped.settings > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                        "• ",
                        importResult.skipped.settings,
                        " Einstellungen"
                      ] }),
                      importResult.skipped.forms === 0 && importResult.skipped.paymentMethods === 0 && importResult.skipped.testRuns === 0 && importResult.skipped.schedules === 0 && importResult.skipped.settings === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "italic text-gray-500", children: "Keine Daten übersprungen" })
                    ] })
                  ] })
                ] }),
                importResult.warnings && importResult.warnings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-yellow-700 dark:text-yellow-300", children: "Warnungen:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-xs text-yellow-600 dark:text-yellow-400 ml-4 mt-1", children: [
                    importResult.warnings.slice(0, 5).map((warning, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                      "• ",
                      warning
                    ] }, i)),
                    importResult.warnings.length > 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "italic", children: [
                      "... und ",
                      importResult.warnings.length - 5,
                      " weitere"
                    ] })
                  ] })
                ] }),
                importResult.errors && importResult.errors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-red-700 dark:text-red-300", children: "Fehler:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-xs text-red-600 dark:text-red-400 ml-4 mt-1", children: [
                    importResult.errors.slice(0, 5).map((error_3, i_0) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                      "• ",
                      error_3
                    ] }, i_0)),
                    importResult.errors.length > 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "italic", children: [
                      "... und ",
                      importResult.errors.length - 5,
                      " weitere"
                    ] })
                  ] })
                ] })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: !!deleteConfirmation, onClose: () => setDeleteConfirmation(null), onConfirm: handleDelete, title: deleteConfirmation?.title || "", message: deleteConfirmation?.message || "", isLoading: isDeleting })
  ] });
};
function _temp(_, i) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-48 mb-2" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-64 mt-1" })
  ] }, i);
}
export {
  Settings as default
};
