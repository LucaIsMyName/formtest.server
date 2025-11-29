import { x as create, i as dist, r as reactExports, j as jsxRuntimeExports, B as Button, y as Check, X, l as ChevronDown, z as ChevronRight, I as Input, A as Settings2, D as createRovingFocusGroupScope, E as useDirection, G as useControllableState, H as createContextScope, J as Root, K as Primitive, M as useComposedRefs, N as Item, O as composeEventHandlers, Q as usePrevious, U as useSize, V as Presence, W as cn, Y as Circle, Z as useSettingsStore, L as Label, m as Select, n as SelectTrigger, o as SelectValue, p as SelectContent, q as SelectItem, t as StatusBadge, _ as CircleCheck, $ as Monitor, a0 as Sun, a1 as Moon } from "./index-tRDURfIp.js";
import { C as CONFIG } from "./app.config-D8MSMeZ9.js";
import { T as TriangleAlert, C as CircleAlert, D as DeleteConfirmDialog } from "./DeleteConfirmDialog-8Wd3m6Dy.js";
import { S as Skeleton } from "./Skeleton-zliSJbRH.js";
import { R as RotateCcw, a as Code, P as Plus, E as Eye, b as EyeOff, C as Checkbox, D as Download, U as Upload } from "./Checkbox-BmgMimdm.js";
const useSelectorsStore = create((set, get) => ({
  // Initial state
  overrides: [],
  baseConfig: null,
  mergedConfig: null,
  categories: [],
  isLoading: false,
  error: null,
  // Load all overrides
  loadOverrides: async () => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      const overrides = await window.api.selectorOverrides.getAll();
      set({
        overrides
      });
    } catch (error) {
      console.error("Failed to load selector overrides:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to load overrides"
      });
    }
  },
  // Load base config (defaults)
  loadBaseConfig: async () => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      const baseConfig = await window.api.selectorConfig.getBase();
      set({
        baseConfig
      });
    } catch (error) {
      console.error("Failed to load base config:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to load base config"
      });
    }
  },
  // Load merged config (defaults + overrides)
  loadMergedConfig: async () => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      const mergedConfig = await window.api.selectorConfig.getMerged();
      set({
        mergedConfig
      });
    } catch (error) {
      console.error("Failed to load merged config:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to load merged config"
      });
    }
  },
  // Load configurable categories
  loadCategories: async () => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      const categories = await window.api.selectorConfig.getCategories();
      set({
        categories
      });
    } catch (error) {
      console.error("Failed to load categories:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to load categories"
      });
    }
  },
  // Load everything
  loadAll: async () => {
    set({
      isLoading: true,
      error: null
    });
    try {
      await Promise.all([get().loadOverrides(), get().loadBaseConfig(), get().loadMergedConfig(), get().loadCategories()]);
    } finally {
      set({
        isLoading: false
      });
    }
  },
  // Create a new override
  createOverride: async (override) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.selectorOverrides.create(override);
      await get().loadOverrides();
      await get().loadMergedConfig();
    } catch (error) {
      console.error("Failed to create override:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to create override"
      });
      throw error;
    }
  },
  // Update an existing override
  updateOverride: async (id, override) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.selectorOverrides.update(id, override);
      await get().loadOverrides();
      await get().loadMergedConfig();
    } catch (error) {
      console.error("Failed to update override:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to update override"
      });
      throw error;
    }
  },
  // Upsert an override (create or update)
  upsertOverride: async (override) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.selectorOverrides.upsert(override);
      await get().loadOverrides();
      await get().loadMergedConfig();
    } catch (error) {
      console.error("Failed to upsert override:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to upsert override"
      });
      throw error;
    }
  },
  // Delete an override by ID
  deleteOverride: async (id) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.selectorOverrides.delete(id);
      await get().loadOverrides();
      await get().loadMergedConfig();
    } catch (error) {
      console.error("Failed to delete override:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to delete override"
      });
      throw error;
    }
  },
  // Delete an override by category and key
  deleteOverrideByKey: async (category, key) => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.selectorOverrides.deleteByKey(category, key);
      await get().loadOverrides();
      await get().loadMergedConfig();
    } catch (error) {
      console.error("Failed to delete override:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to delete override"
      });
      throw error;
    }
  },
  // Delete all overrides
  deleteAllOverrides: async () => {
    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.selectorOverrides.deleteAll();
      await get().loadOverrides();
      await get().loadMergedConfig();
    } catch (error) {
      console.error("Failed to delete all overrides:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to delete all overrides"
      });
      throw error;
    }
  },
  // Helper: Get overrides for a specific category
  getOverridesByCategory: (category) => {
    return get().overrides.filter((o) => o.category === category);
  },
  // Helper: Get a specific override by category and key
  getOverrideByKey: (category, key) => {
    return get().overrides.find((o) => o.category === category && o.key === key);
  },
  // Helper: Get default selectors for a category/key
  getDefaultSelectors: (category, key) => {
    const config = get().baseConfig;
    if (!config) return [];
    const categoryObj = config[category];
    if (!categoryObj || typeof categoryObj !== "object") return [];
    const selectors = categoryObj[key];
    if (Array.isArray(selectors)) {
      return selectors;
    }
    return [];
  },
  // Helper: Get merged selectors (user overrides + defaults)
  getMergedSelectors: (category, key) => {
    const config = get().mergedConfig;
    if (!config) return [];
    const categoryObj = config[category];
    if (!categoryObj || typeof categoryObj !== "object") return [];
    const selectors = categoryObj[key];
    if (Array.isArray(selectors)) {
      return selectors;
    }
    return [];
  }
}));
const CATEGORY_LABELS = {
  formFields: "Formularfelder",
  paymentMethods: "Zahlungsmethoden",
  paymentFields: "Zahlungsfelder",
  cookieConsent: "Cookie-Zustimmung",
  successPatterns: "Erfolgs-Erkennung",
  formDetection: "Formular-Erkennung",
  submitButtons: "Submit-Buttons",
  iframeDetection: "Iframe-Erkennung"
};
const KEY_LABELS = {
  formFields: {
    amount: "Betrag",
    customAmount: "Eigener Betrag",
    interval: "Intervall",
    salutation: "Anrede",
    firstName: "Vorname",
    lastName: "Nachname",
    email: "E-Mail",
    country: "Land",
    privacy: "Datenschutz",
    newsletter: "Newsletter",
    birthday: "Geburtstag",
    phone: "Telefon",
    address: "Adresse",
    city: "Stadt",
    zipCode: "PLZ"
  },
  paymentMethods: {
    sepa: "SEPA",
    creditcard: "Kreditkarte",
    paypal: "PayPal",
    eps: "EPS"
  },
  paymentFields: {
    iban: "IBAN",
    accountHolder: "Kontoinhaber",
    cardNumber: "Kartennummer",
    cardHolder: "Karteninhaber",
    expiryDate: "Ablaufdatum",
    cvv: "CVV",
    bankSelect: "Bank-Auswahl"
  },
  cookieConsent: {
    banners: "Banner-Selektoren",
    acceptButtons: "Accept-Buttons"
  },
  successPatterns: {
    redirectUrls: "Redirect-URLs",
    successMessages: "Erfolgsmeldungen",
    successSelectors: "Erfolgs-Selektoren"
  },
  formDetection: {
    fundraisingBox: "FundraisingBox",
    genericForm: "Generische Formulare"
  }
};
const SelectorEditorSkeleton = () => {
  const $ = dist.c(1);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [...Array(3)].map(_temp$1) });
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
};
const SelectorItem = (t0) => {
  const $ = dist.c(11);
  const {
    selector,
    isDefault,
    isActive: t1,
    onRemove,
    onToggle
  } = t0;
  const isActive = t1 === void 0 ? true : t1;
  const t2 = `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-mono ${isDefault ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400" : isActive ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 line-through"}`;
  let t3;
  if ($[0] !== selector) {
    t3 = /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "flex-1 truncate text-xs", children: selector });
    $[0] = selector;
    $[1] = t3;
  } else {
    t3 = $[1];
  }
  let t4;
  if ($[2] !== isActive || $[3] !== isDefault || $[4] !== onRemove || $[5] !== onToggle) {
    t4 = isDefault ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap", children: "(Standard)" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
      onToggle && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onToggle, className: "p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded", title: isActive ? "Deaktivieren" : "Aktivieren", children: isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 14 }) }),
      onRemove && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onRemove, className: "p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded", title: "Entfernen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
    ] });
    $[2] = isActive;
    $[3] = isDefault;
    $[4] = onRemove;
    $[5] = onToggle;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== t2 || $[8] !== t3 || $[9] !== t4) {
    t5 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: t2, children: [
      t3,
      t4
    ] });
    $[7] = t2;
    $[8] = t3;
    $[9] = t4;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  return t5;
};
const CategorySection = (t0) => {
  const $ = dist.c(53);
  const {
    category,
    keys,
    defaultSelectors,
    overrides,
    onAddSelector,
    onRemoveSelector,
    onToggleOverride
  } = t0;
  const [isExpanded, setIsExpanded] = reactExports.useState(false);
  let t1;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = /* @__PURE__ */ new Set();
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const [expandedKeys, setExpandedKeys] = reactExports.useState(t1);
  let t2;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = {};
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const [newSelectors, setNewSelectors] = reactExports.useState(t2);
  let t3;
  if ($[2] !== expandedKeys) {
    t3 = (key) => {
      const newSet = new Set(expandedKeys);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      setExpandedKeys(newSet);
    };
    $[2] = expandedKeys;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  const toggleKey = t3;
  let t4;
  if ($[4] !== category || $[5] !== newSelectors || $[6] !== onAddSelector) {
    t4 = (key_0) => {
      const selector = newSelectors[key_0]?.trim();
      if (selector) {
        onAddSelector(category, key_0, selector);
        setNewSelectors({
          ...newSelectors,
          [key_0]: ""
        });
      }
    };
    $[4] = category;
    $[5] = newSelectors;
    $[6] = onAddSelector;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  const handleAddSelector = t4;
  let t5;
  if ($[8] !== category || $[9] !== overrides) {
    t5 = (key_1) => overrides.find((o) => o.category === category && o.key === key_1);
    $[8] = category;
    $[9] = overrides;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  const getOverrideForKey = t5;
  const categoryLabel = CATEGORY_LABELS[category] || category;
  let t6;
  if ($[11] !== category) {
    t6 = KEY_LABELS[category] || {};
    $[11] = category;
    $[12] = t6;
  } else {
    t6 = $[12];
  }
  const keyLabels = t6;
  let t7;
  if ($[13] !== category || $[14] !== overrides) {
    let t82;
    if ($[16] !== category) {
      t82 = (o_0) => o_0.category === category;
      $[16] = category;
      $[17] = t82;
    } else {
      t82 = $[17];
    }
    t7 = overrides.some(t82);
    $[13] = category;
    $[14] = overrides;
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  const hasOverrides = t7;
  let t8;
  if ($[18] !== isExpanded) {
    t8 = () => setIsExpanded(!isExpanded);
    $[18] = isExpanded;
    $[19] = t8;
  } else {
    t8 = $[19];
  }
  let t9;
  if ($[20] !== isExpanded) {
    t9 = isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 18 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 18 });
    $[20] = isExpanded;
    $[21] = t9;
  } else {
    t9 = $[21];
  }
  let t10;
  if ($[22] !== categoryLabel) {
    t10 = /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: categoryLabel });
    $[22] = categoryLabel;
    $[23] = t10;
  } else {
    t10 = $[23];
  }
  let t11;
  if ($[24] !== keys.length) {
    t11 = /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
      "(",
      keys.length,
      " Felder)"
    ] });
    $[24] = keys.length;
    $[25] = t11;
  } else {
    t11 = $[25];
  }
  let t12;
  if ($[26] !== hasOverrides) {
    t12 = hasOverrides && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full", children: "Angepasst" });
    $[26] = hasOverrides;
    $[27] = t12;
  } else {
    t12 = $[27];
  }
  let t13;
  if ($[28] !== t10 || $[29] !== t11 || $[30] !== t12 || $[31] !== t9) {
    t13 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-gray-800 dark:text-gray-200", children: [
      t9,
      t10,
      t11,
      t12
    ] });
    $[28] = t10;
    $[29] = t11;
    $[30] = t12;
    $[31] = t9;
    $[32] = t13;
  } else {
    t13 = $[32];
  }
  let t14;
  if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
    t14 = /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { size: 16, className: "text-gray-400" });
    $[33] = t14;
  } else {
    t14 = $[33];
  }
  let t15;
  if ($[34] !== t13 || $[35] !== t8) {
    t15 = /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: t8, className: "w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors", children: [
      t13,
      t14
    ] });
    $[34] = t13;
    $[35] = t8;
    $[36] = t15;
  } else {
    t15 = $[36];
  }
  let t16;
  if ($[37] !== category || $[38] !== defaultSelectors || $[39] !== expandedKeys || $[40] !== getOverrideForKey || $[41] !== handleAddSelector || $[42] !== isExpanded || $[43] !== keyLabels || $[44] !== keys || $[45] !== newSelectors || $[46] !== onRemoveSelector || $[47] !== onToggleOverride || $[48] !== toggleKey) {
    t16 = isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-gray-800 dark:text-gray-200 space-y-4 bg-white dark:bg-gray-800/50", children: keys.map((key_2) => {
      const keyLabel = keyLabels[key_2] || key_2;
      const defaults = defaultSelectors[key_2] || [];
      const override = getOverrideForKey(key_2);
      const userSelectors = override?.selectors || [];
      const isKeyExpanded = expandedKeys.has(key_2);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toggleKey(key_2), className: "w-full flex items-center justify-between px-3 py-2 bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            isKeyExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-800 dark:text-gray-200", children: keyLabel }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
              userSelectors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-500", children: [
                "+",
                userSelectors.length,
                " eigene, "
              ] }),
              defaults.length,
              " Standard"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Code, { size: 14, className: "text-gray-400" })
        ] }),
        isKeyExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 space-y-3", children: [
          userSelectors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-blue-600 dark:text-blue-400 mb-1", children: "Eigene Selektoren (Priorität):" }),
            userSelectors.map((selector_0, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectorItem, { selector: selector_0, isDefault: false, isActive: override?.isActive !== false, onRemove: () => onRemoveSelector(category, key_2, idx), onToggle: override ? () => onToggleOverride(override.id, !override.isActive) : void 0 }, `user-${idx}`))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-500 dark:text-gray-400 mb-1", children: "Standard-Selektoren:" }),
            defaults.slice(0, 5).map(_temp2),
            defaults.length > 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 italic pl-3", children: [
              "... und ",
              defaults.length - 5,
              " weitere"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Neuen Selektor hinzufügen (z.B. #my-field)", value: newSelectors[key_2] || "", onChange: (e) => setNewSelectors({
              ...newSelectors,
              [key_2]: e.target.value
            }), onKeyDown: (e_0) => {
              if (e_0.key === "Enter") {
                handleAddSelector(key_2);
              }
            }, className: "flex-1 text-sm font-mono" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => handleAddSelector(key_2), disabled: !newSelectors[key_2]?.trim(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }) })
          ] })
        ] })
      ] }, key_2);
    }) });
    $[37] = category;
    $[38] = defaultSelectors;
    $[39] = expandedKeys;
    $[40] = getOverrideForKey;
    $[41] = handleAddSelector;
    $[42] = isExpanded;
    $[43] = keyLabels;
    $[44] = keys;
    $[45] = newSelectors;
    $[46] = onRemoveSelector;
    $[47] = onToggleOverride;
    $[48] = toggleKey;
    $[49] = t16;
  } else {
    t16 = $[49];
  }
  let t17;
  if ($[50] !== t15 || $[51] !== t16) {
    t17 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden", children: [
      t15,
      t16
    ] });
    $[50] = t15;
    $[51] = t16;
    $[52] = t17;
  } else {
    t17 = $[52];
  }
  return t17;
};
const SelectorEditor = () => {
  const $ = dist.c(48);
  const {
    overrides,
    baseConfig,
    categories,
    isLoading,
    loadAll,
    upsertOverride,
    deleteOverrideByKey,
    deleteAllOverrides
  } = useSelectorsStore();
  const [showResetConfirm, setShowResetConfirm] = reactExports.useState(false);
  let t0;
  let t1;
  if ($[0] !== loadAll) {
    t0 = () => {
      loadAll();
    };
    t1 = [loadAll];
    $[0] = loadAll;
    $[1] = t0;
    $[2] = t1;
  } else {
    t0 = $[1];
    t1 = $[2];
  }
  reactExports.useEffect(t0, t1);
  let t2;
  if ($[3] !== overrides || $[4] !== upsertOverride) {
    t2 = async (category, key, selector) => {
      const existingOverride = overrides.find((o) => o.category === category && o.key === key);
      const existingSelectors = existingOverride?.selectors || [];
      if (existingSelectors.includes(selector)) {
        return;
      }
      await upsertOverride({
        category,
        key,
        selectors: [selector, ...existingSelectors],
        isActive: true
      });
    };
    $[3] = overrides;
    $[4] = upsertOverride;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  const handleAddSelector = t2;
  let t3;
  if ($[6] !== deleteOverrideByKey || $[7] !== overrides || $[8] !== upsertOverride) {
    t3 = async (category_0, key_0, selectorIndex) => {
      const existingOverride_0 = overrides.find((o_0) => o_0.category === category_0 && o_0.key === key_0);
      if (!existingOverride_0) {
        return;
      }
      const newSelectors = existingOverride_0.selectors.filter((_, idx) => idx !== selectorIndex);
      if (newSelectors.length === 0) {
        await deleteOverrideByKey(category_0, key_0);
      } else {
        await upsertOverride({
          category: category_0,
          key: key_0,
          selectors: newSelectors,
          isActive: existingOverride_0.isActive
        });
      }
    };
    $[6] = deleteOverrideByKey;
    $[7] = overrides;
    $[8] = upsertOverride;
    $[9] = t3;
  } else {
    t3 = $[9];
  }
  const handleRemoveSelector = t3;
  let t4;
  if ($[10] !== overrides || $[11] !== upsertOverride) {
    t4 = async (id, isActive) => {
      const override = overrides.find((o_1) => o_1.id === id);
      if (!override) {
        return;
      }
      await upsertOverride({
        category: override.category,
        key: override.key,
        selectors: override.selectors,
        isActive
      });
    };
    $[10] = overrides;
    $[11] = upsertOverride;
    $[12] = t4;
  } else {
    t4 = $[12];
  }
  const handleToggleOverride = t4;
  let t5;
  if ($[13] !== deleteAllOverrides) {
    t5 = async () => {
      await deleteAllOverrides();
      setShowResetConfirm(false);
    };
    $[13] = deleteAllOverrides;
    $[14] = t5;
  } else {
    t5 = $[14];
  }
  const handleResetAll = t5;
  let t6;
  if ($[15] !== baseConfig) {
    t6 = (category_1) => {
      if (!baseConfig) {
        return {};
      }
      const categoryData = baseConfig[category_1];
      if (!categoryData || typeof categoryData !== "object") {
        return {};
      }
      const result = {};
      for (const [key_1, value] of Object.entries(categoryData)) {
        if (Array.isArray(value)) {
          result[key_1] = value;
        }
      }
      return result;
    };
    $[15] = baseConfig;
    $[16] = t6;
  } else {
    t6 = $[16];
  }
  const getDefaultSelectorsForCategory = t6;
  if (isLoading) {
    let t72;
    if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
      t72 = /* @__PURE__ */ jsxRuntimeExports.jsx(SelectorEditorSkeleton, {});
      $[17] = t72;
    } else {
      t72 = $[17];
    }
    return t72;
  }
  const hasAnyOverrides = overrides.length > 0;
  let t7;
  if ($[18] !== categories) {
    t7 = categories.length > 0 ? categories : [{
      category: "formFields",
      keys: ["amount", "customAmount", "interval", "salutation", "firstName", "lastName", "email", "country", "privacy", "newsletter", "phone", "address", "city", "zipCode"],
      label: "Formularfelder"
    }, {
      category: "paymentMethods",
      keys: ["sepa", "creditcard", "paypal", "eps"],
      label: "Zahlungsmethoden"
    }, {
      category: "paymentFields",
      keys: ["iban", "accountHolder", "cardNumber", "cardHolder", "expiryDate", "cvv", "bankSelect"],
      label: "Zahlungsfelder"
    }, {
      category: "cookieConsent",
      keys: ["banners", "acceptButtons"],
      label: "Cookie-Zustimmung"
    }, {
      category: "successPatterns",
      keys: ["redirectUrls", "successMessages", "successSelectors"],
      label: "Erfolgs-Erkennung"
    }, {
      category: "formDetection",
      keys: ["fundraisingBox", "genericForm"],
      label: "Formular-Erkennung"
    }];
    $[18] = categories;
    $[19] = t7;
  } else {
    t7 = $[19];
  }
  const displayCategories = t7;
  let t8;
  if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
    t8 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Selektor-Konfiguration" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Eigene CSS-Selektoren haben Priorität vor Standard-Selektoren. Per-Form Mappings überschreiben globale Einstellungen." })
    ] });
    $[20] = t8;
  } else {
    t8 = $[20];
  }
  let t9;
  if ($[21] !== handleResetAll || $[22] !== hasAnyOverrides || $[23] !== showResetConfirm) {
    t9 = hasAnyOverrides && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: showResetConfirm ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-red-600 dark:text-red-400", children: "Alle zurücksetzen?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "danger", onClick: handleResetAll, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setShowResetConfirm(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setShowResetConfirm(true), className: "text-gray-500 hover:text-red-500", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 14, className: "mr-1" }),
      "Zurücksetzen"
    ] }) });
    $[21] = handleResetAll;
    $[22] = hasAnyOverrides;
    $[23] = showResetConfirm;
    $[24] = t9;
  } else {
    t9 = $[24];
  }
  let t10;
  if ($[25] !== t9) {
    t10 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      t8,
      t9
    ] });
    $[25] = t9;
    $[26] = t10;
  } else {
    t10 = $[26];
  }
  let t11;
  if ($[27] !== displayCategories || $[28] !== getDefaultSelectorsForCategory || $[29] !== handleAddSelector || $[30] !== handleRemoveSelector || $[31] !== handleToggleOverride || $[32] !== overrides) {
    let t122;
    if ($[34] !== getDefaultSelectorsForCategory || $[35] !== handleAddSelector || $[36] !== handleRemoveSelector || $[37] !== handleToggleOverride || $[38] !== overrides) {
      t122 = (cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(CategorySection, { category: cat.category, keys: cat.keys, defaultSelectors: getDefaultSelectorsForCategory(cat.category), overrides, onAddSelector: handleAddSelector, onRemoveSelector: handleRemoveSelector, onToggleOverride: handleToggleOverride }, cat.category);
      $[34] = getDefaultSelectorsForCategory;
      $[35] = handleAddSelector;
      $[36] = handleRemoveSelector;
      $[37] = handleToggleOverride;
      $[38] = overrides;
      $[39] = t122;
    } else {
      t122 = $[39];
    }
    t11 = displayCategories.map(t122);
    $[27] = displayCategories;
    $[28] = getDefaultSelectorsForCategory;
    $[29] = handleAddSelector;
    $[30] = handleRemoveSelector;
    $[31] = handleToggleOverride;
    $[32] = overrides;
    $[33] = t11;
  } else {
    t11 = $[33];
  }
  let t12;
  if ($[40] !== t11) {
    t12 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: t11 });
    $[40] = t11;
    $[41] = t12;
  } else {
    t12 = $[41];
  }
  let t13;
  if ($[42] !== overrides.length) {
    t13 = overrides.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-700 dark:text-blue-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: overrides.length }),
      " eigene Selektor-Überschreibungen aktiv"
    ] }) });
    $[42] = overrides.length;
    $[43] = t13;
  } else {
    t13 = $[43];
  }
  let t14;
  if ($[44] !== t10 || $[45] !== t12 || $[46] !== t13) {
    t14 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      t10,
      t12,
      t13
    ] });
    $[44] = t10;
    $[45] = t12;
    $[46] = t13;
    $[47] = t14;
  } else {
    t14 = $[47];
  }
  return t14;
};
function _temp$1(_, i) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-200 dark:border-gray-700 rounded-lg p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-48 mb-3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4" })
    ] })
  ] }, i);
}
function _temp2(selector_1, idx_0) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectorItem, { selector: selector_1, isDefault: true }, `default-${idx_0}`);
}
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
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-6", children: [
      t0,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        t1,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full rounded-md" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full rounded-md" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full rounded-md" })
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-6", children: [
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-6", children: [
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Formular-Selektoren" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: "Hier können Sie CSS-Selektoren für die automatische Formular-Erkennung anpassen. Eigene Selektoren haben Priorität vor den Standard-Selektoren. Per-Form Feld-Mappings überschreiben diese globalen Einstellungen." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectorEditor, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-6", children: [
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "sr-only text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Import / Export" }),
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
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Darstellung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "block mb-2 text-gray-800 dark:text-gray-400", children: "Theme" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleThemeChange("system"), className: `flex flex-col items-center justify-center p-4 border rounded-md transition-colors ${theme === "system" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { className: "w-6 h-6 mb-2 text-gray-700 dark:text-gray-300" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                fontStretch: "115%"
              }, className: "text-sm font-medium text-gray-900 dark:text-white", children: "System" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleThemeChange("light"), className: `flex flex-col items-center justify-center p-4 border rounded-md transition-colors ${theme === "light" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "w-6 h-6 mb-2 text-gray-700 dark:text-gray-300" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                fontStretch: "115%"
              }, className: "text-sm font-medium text-gray-900 dark:text-white", children: "Hell" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleThemeChange("dark"), className: `flex flex-col items-center justify-center p-4 border rounded-md transition-colors ${theme === "dark" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "w-6 h-6 mb-2 text-gray-700 dark:text-gray-300" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                fontStretch: "115%"
              }, className: "text-sm font-medium text-gray-900 dark:text-white", children: "Dunkel" })
            ] })
          ] })
        ] }) })
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
