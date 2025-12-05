import { U as create, i as dist, r as reactExports, j as jsxRuntimeExports, B as Button, V as Check, X, W as RotateCcw, x as ChevronDown, Y as ChevronRight, Z as Code, I as Input, H as Plus, _ as Eye, $ as EyeOff, a0 as Settings2, a1 as useSettingsStore, l as Table, K as TableHeader, n as TableRow, M as TableHead, m as TableBody, a2 as React, o as TableCell, a3 as CircleCheck, a4 as CircleAlert, a5 as Database, a6 as Mail, a7 as Sun, a8 as SlidersVertical, a9 as Moon, aa as Monitor, t as Checkbox, y as Select, z as SelectTrigger, A as SelectValue, D as SelectContent, G as SelectItem } from "./index-BmMc8igd.js";
import { C as CONFIG } from "./app.config-Dj0WDsKm.js";
import { T as TableFilter, D as DeleteConfirmDialog } from "./TableFilter-BNTw9_GT.js";
import { S as Skeleton } from "./Skeleton-CRWf65wP.js";
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
const SettingsSkeleton = () => {
  const $ = dist.c(1);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-3", children: [...Array(6)].map(_temp) }) });
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
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
  const [emailEnabled, setEmailEnabled] = reactExports.useState(false);
  const [emailSmtpHost, setEmailSmtpHost] = reactExports.useState("");
  const [emailSmtpPort, setEmailSmtpPort] = reactExports.useState("587");
  const [emailSmtpSecure, setEmailSmtpSecure] = reactExports.useState(false);
  const [emailSmtpUser, setEmailSmtpUser] = reactExports.useState("");
  const [emailSmtpPass, setEmailSmtpPass] = reactExports.useState("");
  const [emailFromEmail, setEmailFromEmail] = reactExports.useState("");
  const [emailFromName, setEmailFromName] = reactExports.useState("FormTest Server");
  const [emailToEmail, setEmailToEmail] = reactExports.useState("");
  const [emailNotifySuccess, setEmailNotifySuccess] = reactExports.useState(false);
  const [emailNotifyFailure, setEmailNotifyFailure] = reactExports.useState(true);
  const [emailTestResult, setEmailTestResult] = reactExports.useState(null);
  const [isSendingTestEmail, setIsSendingTestEmail] = reactExports.useState(false);
  const [exportOptions] = reactExports.useState({
    includeForms: true,
    includePaymentMethods: true,
    includeTestRuns: true,
    includeSchedules: true,
    includeSettings: true
  });
  const [importMode] = reactExports.useState("merge");
  const [importResult, setImportResult] = reactExports.useState(null);
  const [exportMessage, setExportMessage] = reactExports.useState(null);
  const [isExporting, setIsExporting] = reactExports.useState(false);
  const [isImporting, setIsImporting] = reactExports.useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = reactExports.useState(null);
  const [isDeleting, setIsDeleting] = reactExports.useState(false);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [categoryFilter, setCategoryFilter] = reactExports.useState(void 0);
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
        case "email_enabled":
          setEmailEnabled(setting.value === "true");
          break;
        case "email_smtp_host":
          setEmailSmtpHost(setting.value);
          break;
        case "email_smtp_port":
          setEmailSmtpPort(setting.value);
          break;
        case "email_smtp_secure":
          setEmailSmtpSecure(setting.value === "true");
          break;
        case "email_smtp_user":
          setEmailSmtpUser(setting.value);
          break;
        case "email_smtp_pass":
          setEmailSmtpPass(setting.value);
          break;
        case "email_from_email":
          setEmailFromEmail(setting.value);
          break;
        case "email_from_name":
          setEmailFromName(setting.value);
          break;
        case "email_to_email":
          setEmailToEmail(setting.value);
          break;
        case "email_notify_success":
          setEmailNotifySuccess(setting.value === "true");
          break;
        case "email_notify_failure":
          setEmailNotifyFailure(setting.value === "true");
          break;
      }
    });
  }, [settings]);
  const handleSendTestEmail = reactExports.useCallback(async () => {
    setIsSendingTestEmail(true);
    setEmailTestResult(null);
    try {
      const api = window.api;
      const result = await api.email.testConnection();
      setEmailTestResult(result);
    } catch (error_0) {
      setEmailTestResult({
        success: false,
        message: "Fehler beim Senden"
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  }, []);
  const handleExport = reactExports.useCallback(async () => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      const result_0 = await window.api.database.export(exportOptions);
      if (result_0.success) {
        setExportMessage(`Export erfolgreich: ${result_0.filePath}`);
      } else {
        setExportMessage(`Export fehlgeschlagen`);
      }
    } catch (error_1) {
      setExportMessage("Export fehlgeschlagen");
    } finally {
      setIsExporting(false);
    }
  }, [exportOptions]);
  const handleImport = reactExports.useCallback(async () => {
    setIsImporting(true);
    setImportResult(null);
    try {
      const result_1 = await window.api.database.import(importMode, exportOptions);
      if (result_1) {
        setImportResult(result_1);
        if (result_1.success) {
          loadSettings();
        }
      }
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
        errors: ["Import fehlgeschlagen"],
        warnings: []
      });
    } finally {
      setIsImporting(false);
    }
  }, [importMode, exportOptions, loadSettings]);
  const settingsItems = reactExports.useMemo(() => [
    // Test Settings
    {
      id: "donation_amount",
      category: "test",
      name: "Spendenbetrag (EUR)",
      description: "Standard-Spendenbetrag für Tests",
      type: "input",
      value: donationAmount
    },
    {
      id: "donation_interval",
      category: "test",
      name: "Spendenintervall",
      description: "Standard-Intervall für Tests",
      type: "select",
      value: donationInterval,
      options: [{
        value: "0",
        label: "Einmalig"
      }, {
        value: "1",
        label: "Monatlich"
      }, {
        value: "3",
        label: "Vierteljährlich"
      }, {
        value: "12",
        label: "Jährlich"
      }]
    },
    {
      id: "headless_mode",
      category: "test",
      name: "Headless-Modus",
      description: "Browser ohne sichtbares Fenster",
      type: "select",
      value: headlessMode,
      options: [{
        value: "true",
        label: "Aktiviert"
      }, {
        value: "false",
        label: "Deaktiviert"
      }]
    },
    {
      id: "slow_motion",
      category: "test",
      name: "Slow Motion",
      description: "Verzögerung zwischen Aktionen (Debugging)",
      type: "select",
      value: slowMotion,
      options: [{
        value: "0",
        label: "Aus (Normal)"
      }, {
        value: "250",
        label: "250ms"
      }, {
        value: "500",
        label: "500ms"
      }, {
        value: "1000",
        label: "1000ms"
      }, {
        value: "2000",
        label: "2000ms"
      }]
    },
    {
      id: "test_timeout",
      category: "test",
      name: "Test-Timeout (ms)",
      description: "Maximale Wartezeit für Operationen",
      type: "input",
      value: testTimeout
    },
    // UI Settings
    {
      id: "theme",
      category: "ui",
      name: "Theme",
      description: "Farbschema der Anwendung",
      type: "theme",
      value: theme
    },
    // Email Settings
    {
      id: "email_enabled",
      category: "email",
      name: "E-Mail aktiviert",
      description: "Benachrichtigungen per E-Mail",
      type: "checkbox",
      value: String(emailEnabled)
    },
    {
      id: "email_smtp_host",
      category: "email",
      name: "SMTP Server",
      description: "Hostname des SMTP-Servers",
      type: "input",
      value: emailSmtpHost,
      disabled: !emailEnabled
    },
    {
      id: "email_smtp_port",
      category: "email",
      name: "SMTP Port",
      description: "Port des SMTP-Servers",
      type: "input",
      value: emailSmtpPort,
      disabled: !emailEnabled
    },
    {
      id: "email_smtp_secure",
      category: "email",
      name: "SSL/TLS",
      description: "Sichere Verbindung verwenden",
      type: "checkbox",
      value: String(emailSmtpSecure),
      disabled: !emailEnabled
    },
    {
      id: "email_smtp_user",
      category: "email",
      name: "SMTP Benutzer",
      description: "Benutzername für SMTP",
      type: "input",
      value: emailSmtpUser,
      disabled: !emailEnabled
    },
    {
      id: "email_smtp_pass",
      category: "email",
      name: "SMTP Passwort",
      description: "Passwort für SMTP",
      type: "input",
      value: emailSmtpPass,
      disabled: !emailEnabled
    },
    {
      id: "email_from_email",
      category: "email",
      name: "Absender E-Mail",
      description: "E-Mail-Adresse des Absenders",
      type: "input",
      value: emailFromEmail,
      disabled: !emailEnabled
    },
    {
      id: "email_from_name",
      category: "email",
      name: "Absender Name",
      description: "Name des Absenders",
      type: "input",
      value: emailFromName,
      disabled: !emailEnabled
    },
    {
      id: "email_to_email",
      category: "email",
      name: "Empfänger E-Mail",
      description: "E-Mail-Adresse des Empfängers",
      type: "input",
      value: emailToEmail,
      disabled: !emailEnabled
    },
    {
      id: "email_notify_success",
      category: "email",
      name: "Bei Erfolg",
      description: "Bei erfolgreichen Tests benachrichtigen",
      type: "checkbox",
      value: String(emailNotifySuccess),
      disabled: !emailEnabled
    },
    {
      id: "email_notify_failure",
      category: "email",
      name: "Bei Fehler",
      description: "Bei fehlgeschlagenen Tests benachrichtigen",
      type: "checkbox",
      value: String(emailNotifyFailure),
      disabled: !emailEnabled
    },
    {
      id: "email_test",
      category: "email",
      name: "Test-E-Mail",
      description: "Konfiguration testen",
      type: "action",
      value: "",
      actionLabel: isSendingTestEmail ? "Sende..." : "Senden",
      action: handleSendTestEmail,
      actionVariant: "secondary",
      disabled: !emailEnabled || !emailSmtpHost || !emailToEmail
    },
    // Data Management
    {
      id: "data_export",
      category: "data",
      name: "Daten exportieren",
      description: "Formulare, Bezahlmethoden, Tests exportieren",
      type: "action",
      value: "",
      actionLabel: isExporting ? "Exportiere..." : "Exportieren",
      action: handleExport,
      actionVariant: "secondary"
    },
    {
      id: "data_import",
      category: "data",
      name: "Daten importieren",
      description: "Daten aus Backup wiederherstellen",
      type: "action",
      value: "",
      actionLabel: isImporting ? "Importiere..." : "Importieren",
      action: handleImport,
      actionVariant: "secondary"
    },
    {
      id: "delete_forms",
      category: "data",
      name: "Formulare löschen",
      description: "Alle Formulare und zugehörige Tests löschen",
      type: "action",
      value: "",
      actionLabel: "Löschen",
      action: () => setDeleteConfirmation({
        type: "forms",
        title: "Alle Formulare löschen",
        message: "Alle Formulare und zugehörige Tests werden gelöscht."
      }),
      actionVariant: "danger"
    },
    {
      id: "delete_payments",
      category: "data",
      name: "Bezahlmethoden löschen",
      description: "Alle Bezahlmethoden löschen",
      type: "action",
      value: "",
      actionLabel: "Löschen",
      action: () => setDeleteConfirmation({
        type: "paymentMethods",
        title: "Alle Bezahlmethoden löschen",
        message: "Alle Bezahlmethoden werden gelöscht."
      }),
      actionVariant: "danger"
    },
    {
      id: "delete_tests",
      category: "data",
      name: "Tests löschen",
      description: "Alle Testergebnisse löschen",
      type: "action",
      value: "",
      actionLabel: "Löschen",
      action: () => setDeleteConfirmation({
        type: "testRuns",
        title: "Alle Tests löschen",
        message: "Alle Testergebnisse werden gelöscht."
      }),
      actionVariant: "danger"
    },
    {
      id: "delete_schedules",
      category: "data",
      name: "Zeitpläne löschen",
      description: "Alle Zeitpläne löschen",
      type: "action",
      value: "",
      actionLabel: "Löschen",
      action: () => setDeleteConfirmation({
        type: "schedules",
        title: "Alle Zeitpläne löschen",
        message: "Alle Zeitpläne werden gelöscht."
      }),
      actionVariant: "danger"
    },
    {
      id: "delete_all",
      category: "data",
      name: "Alle Daten löschen",
      description: "ALLE Daten unwiderruflich löschen",
      type: "action",
      value: "",
      actionLabel: "Alles löschen",
      action: () => setDeleteConfirmation({
        type: "all",
        title: "Alle Daten löschen",
        message: "ALLE Daten (Formulare, Bezahlmethoden, Tests, Zeitpläne) werden gelöscht!"
      }),
      actionVariant: "danger"
    },
    // Selectors
    {
      id: "selectors",
      category: "selectors",
      name: "Selektor-Konfiguration",
      description: "CSS-Selektoren für automatische Formular-Erkennung. Eigene Selektoren haben Priorität vor Standard-Selektoren.",
      type: "component",
      value: "",
      fullWidth: true
    }
  ], [donationAmount, donationInterval, headlessMode, slowMotion, testTimeout, theme, emailEnabled, emailSmtpHost, emailSmtpPort, emailSmtpSecure, emailSmtpUser, emailSmtpPass, emailFromEmail, emailFromName, emailToEmail, emailNotifySuccess, emailNotifyFailure, isSendingTestEmail, isExporting, isImporting, handleSendTestEmail, handleExport, handleImport]);
  const filteredSettings = reactExports.useMemo(() => {
    return settingsItems.filter((item) => {
      const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [settingsItems, searchTerm, categoryFilter]);
  const handleSettingChange = async (id, value) => {
    switch (id) {
      case "donation_amount":
        setDonationAmount(value);
        break;
      case "donation_interval":
        setDonationInterval(value);
        await updateSetting("default_interval", value, "Standard-Spendenintervall");
        break;
      case "headless_mode":
        setHeadlessMode(value);
        await updateSetting("headless_mode", value, "Headless-Modus");
        break;
      case "slow_motion":
        setSlowMotion(value);
        await updateSetting("slow_motion", value, "Slow Motion");
        break;
      case "test_timeout":
        setTestTimeout(value);
        break;
      case "theme":
        setTheme(value);
        await updateSetting("theme", value, "UI-Theme");
        applyTheme(value);
        break;
      case "email_enabled":
        setEmailEnabled(value === "true");
        await updateSetting("email_enabled", value, "E-Mail aktiviert");
        break;
      case "email_smtp_host":
        setEmailSmtpHost(value);
        break;
      case "email_smtp_port":
        setEmailSmtpPort(value);
        break;
      case "email_smtp_secure":
        setEmailSmtpSecure(value === "true");
        await updateSetting("email_smtp_secure", value, "SSL/TLS");
        break;
      case "email_smtp_user":
        setEmailSmtpUser(value);
        break;
      case "email_smtp_pass":
        setEmailSmtpPass(value);
        break;
      case "email_from_email":
        setEmailFromEmail(value);
        break;
      case "email_from_name":
        setEmailFromName(value);
        break;
      case "email_to_email":
        setEmailToEmail(value);
        break;
      case "email_notify_success":
        setEmailNotifySuccess(value === "true");
        await updateSetting("email_notify_success", value, "Bei Erfolg benachrichtigen");
        break;
      case "email_notify_failure":
        setEmailNotifyFailure(value === "true");
        await updateSetting("email_notify_failure", value, "Bei Fehler benachrichtigen");
        break;
    }
  };
  const handleSettingBlur = async (id_0) => {
    switch (id_0) {
      case "donation_amount":
        await updateSetting("default_donation_amount", donationAmount, "Standard-Spendenbetrag");
        break;
      case "test_timeout":
        await updateSetting("test_timeout", testTimeout, "Test-Timeout");
        break;
      case "email_smtp_host":
        await updateSetting("email_smtp_host", emailSmtpHost, "SMTP Server");
        break;
      case "email_smtp_port":
        await updateSetting("email_smtp_port", emailSmtpPort, "SMTP Port");
        break;
      case "email_smtp_user":
        await updateSetting("email_smtp_user", emailSmtpUser, "SMTP Benutzer");
        break;
      case "email_smtp_pass":
        await updateSetting("email_smtp_pass", emailSmtpPass, "SMTP Passwort");
        break;
      case "email_from_email":
        await updateSetting("email_from_email", emailFromEmail, "Absender E-Mail");
        break;
      case "email_from_name":
        await updateSetting("email_from_name", emailFromName, "Absender Name");
        break;
      case "email_to_email":
        await updateSetting("email_to_email", emailToEmail, "Empfänger E-Mail");
        break;
    }
  };
  const handleDelete = async () => {
    if (!deleteConfirmation) return;
    setIsDeleting(true);
    try {
      const api_0 = window.api;
      switch (deleteConfirmation.type) {
        case "forms":
          await api_0.forms.deleteAll();
          break;
        case "paymentMethods":
          await api_0.paymentMethods.deleteAll();
          break;
        case "testRuns":
          await api_0.testRuns.deleteAll();
          break;
        case "schedules":
          await api_0.schedules.deleteAll();
          break;
        case "all":
          await api_0.forms.deleteAll();
          await api_0.paymentMethods.deleteAll();
          await api_0.testRuns.deleteAll();
          await api_0.schedules.deleteAll();
          break;
      }
      setDeleteConfirmation(null);
    } catch (error_3) {
      console.error("Delete failed:", error_3);
    } finally {
      setIsDeleting(false);
    }
  };
  const getCategoryLabel = (category) => {
    switch (category) {
      case "test":
        return "Test";
      case "ui":
        return "UI";
      case "email":
        return "E-Mail";
      case "data":
        return "Daten";
      case "selectors":
        return "Selektoren";
      default:
        return category;
    }
  };
  const getCategoryIcon = (category_0) => {
    switch (category_0) {
      case "test":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersVertical, { size: 14, className: "text-blue-500" });
      case "ui":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { size: 14, className: "text-yellow-500" });
      case "email":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 14, className: "text-green-500" });
      case "data":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { size: 14, className: "text-purple-500" });
      case "selectors":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Code, { size: 14, className: "text-cyan-500" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { size: 14 });
    }
  };
  const renderSettingControl = (item_0) => {
    const isDisabled = isLoading || item_0.disabled;
    switch (item_0.type) {
      case "input":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: item_0.id.includes("port") || item_0.id.includes("timeout") || item_0.id.includes("amount") ? "number" : item_0.id.includes("pass") ? "password" : "text", value: item_0.value, onChange: (e) => handleSettingChange(item_0.id, e.target.value), onBlur: () => handleSettingBlur(item_0.id), className: `h-7 text-xs w-full ${isDisabled ? "opacity-50" : ""}`, disabled: isDisabled });
      case "select":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: item_0.value, onValueChange: (v) => handleSettingChange(item_0.id, v), disabled: isDisabled, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: `h-7 text-xs w-full border border-gray-200 !dark:border-gray-800 bg-white !dark:bg-gray-800 px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 dark:border-gray-700 dark:bg-gray-700 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus:ring-gray-300 dark:text-white ${isDisabled ? "opacity-50" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: item_0.options?.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt.value, className: "text-xs", children: opt.label }, opt.value)) })
        ] });
      case "checkbox":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: item_0.value === "true", onCheckedChange: (checked) => handleSettingChange(item_0.id, String(checked)), disabled: isDisabled, className: isDisabled ? "opacity-50" : "" });
      case "theme":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: [{
          value: "light",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { size: 14 }),
          label: "Hell"
        }, {
          value: "dark",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { size: 14 }),
          label: "Dunkel"
        }, {
          value: "system",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { size: 14 }),
          label: "System"
        }].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleSettingChange("theme", t.value), className: `p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${theme === t.value ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-transparent hover:border-gray-300 dark:hover:border-gray-600"}`, disabled: isDisabled, children: t.icon }, t.value)) });
      case "action":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: item_0.actionVariant || "secondary", size: "sm", onClick: item_0.action, disabled: isDisabled, className: "text-xs h-7", children: item_0.actionLabel });
      case "component":
        if (item_0.id === "selectors") {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectorEditor, {});
        }
        return null;
      default:
        return null;
    }
  };
  if (isLoading && settings.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: CONFIG.style.title.className, children: "Einstellungen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-6", children: "Globale Optionen für Formular-Tests konfigurieren" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsSkeleton, {})
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: CONFIG.style.title.className, children: "Einstellungen" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-6", children: "Globale Optionen für Formular-Tests konfigurieren" }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md border border-red-200 dark:border-red-800 text-sm", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableFilter, { searchTerm, onSearchChange: setSearchTerm, placeholder: "Einstellung suchen...", statusFilter: categoryFilter, onStatusFilterChange: setCategoryFilter, statusOptions: [{
        value: "test",
        label: "Test"
      }, {
        value: "ui",
        label: "UI"
      }, {
        value: "email",
        label: "E-Mail"
      }, {
        value: "data",
        label: "Daten"
      }, {
        value: "selectors",
        label: "Selektoren"
      }], statusLabel: "Kategorie", onClear: () => {
        setSearchTerm("");
        setCategoryFilter(void 0);
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm overflow-hidden", children: filteredSettings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-gray-500 dark:text-gray-400 text-sm", children: "Keine Einstellungen gefunden." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-[100px]", children: "Kategorie" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-[420px]", children: "Einstellung" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-[220px] lg:w-[360px]", children: "Wert" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredSettings.map((item_1) => item_1.fullWidth ? /* @__PURE__ */ jsxRuntimeExports.jsx(React.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { colSpan: 3, className: "p-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              getCategoryIcon(item_1.category),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-900 dark:text-white", children: item_1.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-gray-500 dark:text-gray-400", children: item_1.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: renderSettingControl(item_1) })
        ] }) }) }, item_1.id) : /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            getCategoryIcon(item_1.category),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono uppercase text-gray-500 dark:text-gray-400", children: getCategoryLabel(item_1.category) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              fontStretch: "125%"
            }, className: "text-sm font-medium text-gray-900 dark:text-white", children: item_1.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              fontStretch: "100%"
            }, className: "text-xs text-gray-500 dark:text-gray-400", children: item_1.description })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: renderSettingControl(item_1) })
        ] }, item_1.id)) })
      ] }) }),
      emailTestResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-3 rounded-md border text-xs flex items-center gap-2 ${emailTestResult.success ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"}`, children: [
        emailTestResult.success ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 14 }),
        emailTestResult.message
      ] }),
      exportMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-md border text-xs bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700", children: exportMessage }),
      importResult && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-3 rounded-md border text-xs ${importResult.success ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"}`, children: importResult.success ? `Importiert: ${importResult.imported.forms} Formulare, ${importResult.imported.paymentMethods} Bezahlmethoden` : importResult.errors.join(", ") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: !!deleteConfirmation, onClose: () => setDeleteConfirmation(null), onConfirm: handleDelete, title: deleteConfirmation?.title || "", message: deleteConfirmation?.message || "", isLoading: isDeleting })
  ] });
};
function _temp(_, i) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i);
}
export {
  Settings as default
};
