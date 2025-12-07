import { r as reactExports, Q as getDefaultPaymentIcon, j as jsxRuntimeExports, B as Button, k as Trash2, P as Play, L as Label, I as Input, l as Table, m as TableBody, n as TableRow, o as TableCell, p as StatusBadge, q as formatDate, y as Select, z as SelectTrigger, A as SelectValue, D as SelectContent, G as SelectItem, s as renderIcon, t as Checkbox, J as useSearchParams, d as usePaymentMethodsStore, e as useTestRunsStore, H as Plus, K as TableHeader, M as TableHead, N as Pen, O as TablePagination, i as dist } from "./index-DzJQkFUp.js";
import { C as CONFIG } from "./app.config-b2lfEN4K.js";
import { I as IconPicker, u as useSparklineData, M as MiniSparkline } from "./MiniSparkline-8nKLp5MJ.js";
import { D as Drawer, a as DrawerContent, b as DrawerHeader, c as DrawerFooter, u as useTableSelection, d as useFilterableData, e as useSortableData, S as SelectionActionBar, f as computeIsPartialSelected, g as computeIsAllSelected, h as SortableTableHead } from "./useTableSelection-DvrD0Ws3.js";
import { T as TableFilter, D as DeleteConfirmDialog } from "./TableFilter-CT2F7wj8.js";
import { S as Skeleton } from "./Skeleton-CKxsIkDq.js";
const PaymentMethodDrawer = ({
  isOpen,
  onClose,
  onSubmit,
  editMethod,
  isLoading = false,
  onDelete
}) => {
  const [methodData, setMethodData] = reactExports.useState({
    name: "",
    type: "paypal",
    icon: "CreditCard",
    isActive: true,
    details: {}
  });
  const [errors, setErrors] = reactExports.useState({});
  const [showIconPicker, setShowIconPicker] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (editMethod) {
      setMethodData({
        name: editMethod.name,
        type: editMethod.type,
        icon: editMethod.icon || getDefaultPaymentIcon(editMethod.type),
        isActive: editMethod.isActive,
        details: editMethod.details || {}
      });
    } else {
      setMethodData({
        name: "",
        type: "paypal",
        icon: "CreditCard",
        isActive: true,
        details: {}
      });
    }
    setErrors({});
  }, [editMethod, isOpen]);
  const validateForm = () => {
    const newErrors = {};
    if (!methodData.name.trim()) {
      newErrors.name = "Name der Bezahlmethode ist erforderlich";
    }
    if (methodData.type === "paypal") {
      if (!methodData.details.email) {
        newErrors.email = "PayPal E-Mail ist erforderlich";
      }
    } else if (methodData.type === "sepa") {
      if (!methodData.details.accountHolder) {
        newErrors.accountHolder = "Kontoinhaber ist erforderlich";
      }
      if (!methodData.details.iban) {
        newErrors.iban = "IBAN ist erforderlich";
      }
    } else if (methodData.type === "creditcard") {
      if (!methodData.details.cardNumber) {
        newErrors.cardNumber = "Kartennummer ist erforderlich";
      }
      if (!methodData.details.cardholderName) {
        newErrors.cardholderName = "Karteninhaber ist erforderlich";
      }
      if (!methodData.details.expiryDate) {
        newErrors.expiryDate = "Ablaufdatum ist erforderlich";
      }
      if (!methodData.details.cvv) {
        newErrors.cvv = "CVV ist erforderlich";
      }
    } else if (methodData.type === "eps") {
      if (!methodData.details.bankCode) {
        newErrors.bankCode = "Bankcode ist erforderlich";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const submitData = {
        name: methodData.name.trim(),
        type: methodData.type,
        icon: methodData.icon,
        isActive: methodData.isActive,
        details: methodData.details || {}
      };
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error("Failed to submit payment method:", error);
    }
  };
  const updateDetails = (key, value) => {
    setMethodData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [key]: value
      }
    }));
  };
  const renderTypeSpecificFields = () => {
    switch (methodData.type) {
      case "paypal":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "email", children: "PayPal E-Mail *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", id: "email", value: methodData.details.email || "", onChange: (e_6) => updateDetails("email", e_6.target.value), placeholder: "paypal@example.com", disabled: isLoading, className: errors.email ? "border-red-500 focus-visible:ring-red-500" : "" }),
          errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.email })
        ] });
      case "sepa":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "accountHolder", children: "Kontoinhaber *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", id: "accountHolder", value: methodData.details.accountHolder || "", onChange: (e_4) => updateDetails("accountHolder", e_4.target.value), placeholder: "Max Mustermann", disabled: isLoading, className: errors.accountHolder ? "border-red-500 focus-visible:ring-red-500" : "" }),
            errors.accountHolder && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.accountHolder })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "iban", children: "IBAN *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", id: "iban", numberType: "IBAN", value: methodData.details.iban || "", onChange: (e_5) => updateDetails("iban", e_5.target.value), placeholder: "DE89 3704 0044 0532 0130 00", disabled: isLoading, className: errors.iban ? "border-red-500 focus-visible:ring-red-500" : "" }),
            errors.iban && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.iban })
          ] })
        ] });
      case "creditcard":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "cardNumber", children: "Kartennummer *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", id: "cardNumber", numberType: "CreditCardNumber", value: methodData.details.cardNumber || "", onChange: (e_0) => updateDetails("cardNumber", e_0.target.value), placeholder: "4111 1111 1111 1111", disabled: isLoading, className: errors.cardNumber ? "border-red-500 focus-visible:ring-red-500" : "" }),
            errors.cardNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.cardNumber })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "cardholderName", children: "Karteninhaber *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", id: "cardholderName", value: methodData.details.cardholderName || "", onChange: (e_1) => updateDetails("cardholderName", e_1.target.value), placeholder: "Max Mustermann", disabled: isLoading, className: errors.cardholderName ? "border-red-500 focus-visible:ring-red-500" : "" }),
            errors.cardholderName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.cardholderName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "expiryDate", children: "Ablaufdatum *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", id: "expiryDate", numberType: "UntilDate", value: methodData.details.expiryDate || "", onChange: (e_2) => updateDetails("expiryDate", e_2.target.value), placeholder: "MM/YY", disabled: isLoading, className: errors.expiryDate ? "border-red-500 focus-visible:ring-red-500" : "" }),
              errors.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.expiryDate })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "cvv", children: "CVV *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", id: "cvv", numberType: "CVV", value: methodData.details.cvv || "", onChange: (e_3) => updateDetails("cvv", e_3.target.value), placeholder: "123", disabled: isLoading, className: errors.cvv ? "border-red-500 focus-visible:ring-red-500" : "" }),
              errors.cvv && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.cvv })
            ] })
          ] })
        ] });
      case "eps":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "bankCode", children: "Bank *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: methodData.details.bankCode || "", onValueChange: (value_0) => updateDetails("bankCode", value_0), disabled: isLoading, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "bankCode", className: errors.bankCode ? "border-red-500 focus:ring-red-500" : "", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Bank auswählen" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "BAWAATWW", children: "Bank Austria" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "RLNWATWW", children: "Raiffeisen Bank" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "BKAUATWW", children: "UniCredit Bank Austria" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "GIBAATWW", children: "Erste Bank" })
            ] })
          ] }),
          errors.bankCode && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.bankCode })
        ] });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Drawer, { open: isOpen, onOpenChange: (open) => !open && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-4 flex-shrink-0", children: [
      editMethod && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
        onDelete && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: () => {
          onDelete(editMethod.id);
          onClose();
        }, variant: "danger", size: "sm", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }),
          "Löschen"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: () => {
          window.dispatchEvent(new CustomEvent("openTestDialog", {
            detail: {
              paymentMethodIds: [editMethod.id]
            }
          }));
          onClose();
        }, variant: "secondary", size: "sm", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 14 }),
          "Test starten"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", className: "sr-only", children: "Name der Bezahlmethode *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "name", value: methodData.name, onChange: (e_7) => setMethodData({
          ...methodData,
          name: e_7.target.value
        }), placeholder: "Bezahlmethoden Name", disabled: isLoading, className: `${CONFIG.style.title.className} h-16` + (errors.name ? "text-red-500" : "") })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerHeader, { className: "pt-6", children: errors.name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.name }) }),
    editMethod && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 pb-6 border-b dark:border-gray-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-3", children: "Bezahlmethode Details" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 w-[120px] bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs font-mono bg-gray-100 dark:bg-gray-900/50 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700", children: editMethod.id }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: editMethod.isActive ? "active" : "inactive" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Typ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white", children: editMethod.type === "paypal" ? "PayPal" : editMethod.type === "sepa" ? "SEPA Lastschrift" : editMethod.type === "creditcard" ? "Kreditkarte" : editMethod.type === "eps" ? "EPS" : editMethod.type })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Erstellt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white font-mono", children: formatDate(editMethod.createdAt) })
        ] }),
        editMethod.updatedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Aktualisiert" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white font-mono", children: formatDate(editMethod.updatedAt) })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-3", children: "Bezahlmethode Einstellungen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 w-[120px] bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400 align-top pt-3", children: "Typ *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: methodData.type, onValueChange: (value_1) => setMethodData({
              ...methodData,
              type: value_1,
              details: {}
            }), disabled: isLoading, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "type", className: "text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Typ auswählen" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paypal", children: "PayPal" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sepa", children: "SEPA Lastschrift" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "creditcard", children: "Kreditkarte" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "eps", children: "EPS (Österreich)" })
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400 align-top pt-3", children: "Icon" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowIconPicker(true), disabled: isLoading, className: "flex items-center gap-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-start", children: [
              renderIcon(methodData.icon, 18, "text-blue-600 dark:text-blue-400"),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: methodData.icon })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "isActive", checked: methodData.isActive, onCheckedChange: (checked) => setMethodData({
                ...methodData,
                isActive: checked === true
              }), disabled: isLoading }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "isActive", className: "text-sm text-gray-600 dark:text-gray-400 font-normal cursor-pointer", children: "Aktiv (in Tests verwenden)" })
            ] }) })
          ] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-3", children: "Zahlungsdetails" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden p-3 space-y-3", children: renderTypeSpecificFields() })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerFooter, { className: "pt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", onClick: onClose, variant: "secondary", size: "md", disabled: isLoading, children: "Abbrechen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "primary", size: "md", isLoading, disabled: isLoading, children: isLoading ? "Speichern..." : editMethod ? "Bezahlmethode aktualisieren" : "Bezahlmethode hinzufügen" })
      ] })
    ] }),
    showIconPicker && /* @__PURE__ */ jsxRuntimeExports.jsx(IconPicker, { value: methodData.icon, onChange: (icon) => {
      setMethodData({
        ...methodData,
        icon
      });
      setShowIconPicker(false);
    }, onClose: () => setShowIconPicker(false) })
  ] }) });
};
const PaymentMethodSparkline = (t0) => {
  const $ = dist.c(2);
  const {
    paymentMethodId,
    testRuns
  } = t0;
  const sparklineData = useSparklineData(testRuns, "paymentMethod", paymentMethodId);
  let t1;
  if ($[0] !== sparklineData) {
    t1 = /* @__PURE__ */ jsxRuntimeExports.jsx(MiniSparkline, { data: sparklineData });
    $[0] = sparklineData;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  return t1;
};
const PaymentMethodsSkeleton = () => {
  const $ = dist.c(1);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [...Array(5)].map(_temp) }) }) });
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
};
const PaymentMethods = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    paymentMethods,
    isLoading,
    error,
    loadPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    togglePaymentMethodActive
  } = usePaymentMethodsStore();
  const {
    testRuns,
    loadTestRuns
  } = useTestRunsStore();
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [editingMethod, setEditingMethod] = reactExports.useState(null);
  const [deleteConfirm, setDeleteConfirm] = reactExports.useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = reactExports.useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = reactExports.useState(false);
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
    loadPaymentMethods();
    loadTestRuns();
  }, [loadPaymentMethods, loadTestRuns]);
  const paymentMethodsWithComputed = reactExports.useMemo(() => {
    const getTypeLabel = (type) => {
      switch (type) {
        case "paypal":
          return "PayPal";
        case "sepa":
          return "SEPA";
        case "creditcard":
          return "Credit Card";
        case "eps":
          return "EPS (Austria)";
        default:
          return type;
      }
    };
    const getDetailsSummary = (method) => {
      switch (method.type) {
        case "paypal":
          return method.details.email || "";
        case "sepa":
          return method.details.accountHolder || method.details.iban || "";
        case "creditcard":
          return method.details.cardNumber || "";
        case "eps":
          return method.details.bankCode || "";
        default:
          return "";
      }
    };
    return paymentMethods.map((pm) => ({
      ...pm,
      typeLabel: getTypeLabel(pm.type),
      detailsSummary: getDetailsSummary(pm)
    }));
  }, [paymentMethods]);
  const {
    filteredItems: filteredMethods,
    filterConfig,
    setSearchTerm,
    setStatusFilter,
    clearFilters
  } = useFilterableData(
    paymentMethodsWithComputed,
    ["name", "typeLabel", "type", "detailsSummary"],
    {
      searchTerm: "",
      statusFilter: void 0
    },
    "paymentMethods"
    // localStorage key
  );
  const {
    sortedItems: sortedMethods,
    requestSort,
    sortConfig,
    getSortDirection
  } = useSortableData(
    filteredMethods,
    {
      key: "name",
      direction: "asc"
    },
    "paymentMethods"
    // localStorage key
  );
  const statusOptions = [{
    value: "active",
    label: "Aktiv"
  }, {
    value: "inactive",
    label: "Inaktiv"
  }];
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const itemsPerPage = 50;
  const displayedMethods = reactExports.useMemo(() => {
    let filtered = sortedMethods;
    if (filterConfig.statusFilter && filterConfig.statusFilter !== "all") {
      filtered = sortedMethods.filter((m) => filterConfig.statusFilter === "active" ? m.isActive : !m.isActive);
    }
    if (filtered.length > 50) {
      const start = (currentPage - 1) * itemsPerPage;
      return filtered.slice(start, start + itemsPerPage);
    }
    return filtered;
  }, [sortedMethods, filterConfig.statusFilter, currentPage, itemsPerPage]);
  const totalFilteredItems = reactExports.useMemo(() => {
    if (!filterConfig.statusFilter || filterConfig.statusFilter === "all") {
      return sortedMethods.length;
    }
    return sortedMethods.filter((m_0) => filterConfig.statusFilter === "active" ? m_0.isActive : !m_0.isActive).length;
  }, [sortedMethods, filterConfig.statusFilter]);
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const showPagination = totalFilteredItems > 50;
  reactExports.useEffect(() => {
    setCurrentPage(1);
  }, [filterConfig.statusFilter, filterConfig.searchTerm, sortConfig.key, sortConfig.direction]);
  reactExports.useEffect(() => {
    if (paymentMethods.length > 0) {
      const paramId = searchParams.get("id");
      if (paramId) {
        const method_0 = paymentMethods.find((pm_0) => String(pm_0.id) === paramId || pm_0.name === paramId);
        if (method_0) {
          setEditingMethod(method_0);
          setIsDialogOpen(true);
        }
      }
    }
  }, [paymentMethods, searchParams]);
  const handleAddMethod = () => {
    setEditingMethod(null);
    setIsDialogOpen(true);
    setSearchParams({});
  };
  const handleEditMethod = (method_1) => {
    setEditingMethod(method_1);
    setIsDialogOpen(true);
    setSearchParams({
      id: String(method_1.id)
    });
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSearchParams({});
  };
  const handleMethodSubmit = async (methodData) => {
    if (editingMethod) {
      await updatePaymentMethod(editingMethod.id, methodData);
    } else {
      await addPaymentMethod(methodData);
    }
  };
  const handleDeleteMethod = (method_2) => {
    setDeleteConfirm({
      id: method_2.id,
      name: method_2.name
    });
  };
  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deletePaymentMethod(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };
  const handleBulkDelete = async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;
    const deletedCount = ids.length;
    setIsBulkDeleting(true);
    try {
      for (const id of ids) {
        await deletePaymentMethod(id);
      }
      clearSelection();
      setShowBulkDeleteConfirm(false);
      const remainingItems = totalFilteredItems - deletedCount;
      if (remainingItems > 0) {
        const newTotalPages = Math.ceil(remainingItems / itemsPerPage);
        if (currentPage > newTotalPages) {
          setCurrentPage(Math.max(1, newTotalPages));
        }
      }
    } catch (error_0) {
      console.error("Failed to bulk delete payment methods:", error_0);
    } finally {
      setIsBulkDeleting(false);
    }
  };
  const getPaymentMethodIcon = (method_3) => {
    const iconName = method_3.icon || getDefaultPaymentIcon(method_3.type);
    const colorClass = method_3.type === "paypal" ? "text-blue-600 dark:text-blue-400" : method_3.type === "sepa" ? "text-green-600 dark:text-green-400" : method_3.type === "creditcard" ? "text-purple-600 dark:text-purple-400" : method_3.type === "eps" ? "text-orange-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-400";
    return renderIcon(iconName, 14, colorClass);
  };
  const maskSensitiveData = (method_4) => {
    switch (method_4.type) {
      case "paypal":
        return method_4.details.email ? `${method_4.details.email.substring(0, 3)}***@***.com` : "Keine E-Mail";
      case "sepa":
        const holder = method_4.details.accountHolder || "";
        const maskedIban = method_4.details.iban ? `***${method_4.details.iban.slice(-4)}` : "";
        if (holder && maskedIban) return `${holder} (${maskedIban})`;
        if (holder) return holder;
        if (maskedIban) return maskedIban;
        return "Keine SEPA-Daten";
      case "creditcard":
        return method_4.details.cardNumber ? `****-****-****-${method_4.details.cardNumber.slice(-4)}` : "Keine Kartennummer";
      case "eps":
        return method_4.details.bankCode ? `Bank: ${method_4.details.bankCode}` : "Keine Bank ausgewählt";
      default:
        return "Konfiguriert";
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: CONFIG.style.title.className, children: "Bezahlmethoden" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleAddMethod, variant: "primary", size: "md", className: "gap-2", disabled: isLoading, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
        " Neue Bezahlmethode"
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-red-800 dark:text-red-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Error:" }),
      " ",
      error
    ] }) }),
    paymentMethods.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableFilter, { searchTerm: filterConfig.searchTerm, onSearchChange: setSearchTerm, placeholder: "Bezahlmethoden durchsuchen...", statusFilter: filterConfig.statusFilter, onStatusFilterChange: setStatusFilter, statusOptions, onClear: clearFilters, rightContent: selectedCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(SelectionActionBar, { selectedCount, onClear: clearSelection, actions: [{
      label: "Löschen",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }),
      onClick: () => setShowBulkDeleteConfirm(true),
      variant: "danger"
    }] }) : void 0 }),
    isLoading && paymentMethods.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentMethodsSkeleton, {}) : paymentMethods.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "Noch keine Bezahlmethoden konfiguriert." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAddMethod, variant: "primary", size: "md", disabled: isLoading, children: "Erste Bezahlmethode hinzufügen" })
    ] }) }) }) : displayedMethods.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "Keine Bezahlmethoden gefunden." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Versuche andere Suchbegriffe oder Filter." })
    ] }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-[40px] px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: computeIsAllSelected(displayedMethods, selectedIds), indeterminate: computeIsPartialSelected(displayedMethods, selectedIds), onCheckedChange: () => toggleAll(displayedMethods), "aria-label": "Alle auswählen" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("name"), onSort: () => requestSort("name"), children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("typeLabel"), onSort: () => requestSort("typeLabel"), children: "Typ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("detailsSummary"), onSort: () => requestSort("detailsSummary"), children: "Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { className: "w-[120px]", sortDirection: getSortDirection("isActive"), onSort: () => requestSort("isActive"), children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("createdAt"), onSort: () => requestSort("createdAt"), children: "Erstellt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-left", children: "Analyse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: displayedMethods.map((method_5) => {
          const isChecked = isSelected(method_5.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { tabIndex: 0, role: "button", className: `cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-inset ${isChecked ? "bg-blue-50 dark:bg-blue-900/20" : ""}`, onClick: () => handleEditMethod(method_5), onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleEditMethod(method_5);
            }
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", onClick: (e_0) => e_0.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: isChecked, onCheckedChange: () => toggleItem(method_5.id), "aria-label": `${method_5.name} auswählen` }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              getPaymentMethodIcon(method_5),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900 dark:text-white", children: method_5.name })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono text-gray-900 dark:text-gray-300", children: method_5.typeLabel }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-gray-500 dark:text-gray-400 font-mono", children: maskSensitiveData(method_5) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "w-120px", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e_1) => {
              e_1.stopPropagation();
              togglePaymentMethodActive(method_5.id);
            }, className: "border-none bg-transparent cursor-pointer p-0", disabled: isLoading, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: method_5.isActive ? "active" : "inactive", children: method_5.isActive ? "Aktiv" : "Inaktiv" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-[10px] text-gray-500 dark:text-gray-400 font-mono", children: formatDate(method_5.createdAt) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentMethodSparkline, { paymentMethodId: method_5.id, testRuns }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right text-sm font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_2) => {
                e_2.stopPropagation();
                window.dispatchEvent(new CustomEvent("openTestDialog", {
                  detail: {
                    paymentMethodIds: [method_5.id]
                  }
                }));
              }, variant: "ghost", size: "sm", disabled: isLoading, title: "Test starten", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 16, className: "text-green-600 dark:text-green-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_3) => {
                e_3.stopPropagation();
                handleEditMethod(method_5);
              }, variant: "ghost", size: "sm", disabled: isLoading, title: "Bearbeiten", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 16, className: "text-blue-600 dark:text-blue-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_4) => {
                e_4.stopPropagation();
                handleDeleteMethod(method_5);
              }, variant: "ghost", size: "sm", disabled: isLoading, title: "Löschen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16, className: "text-red-600 dark:text-red-400" }) })
            ] }) })
          ] }, method_5.id);
        }) })
      ] }),
      showPagination && /* @__PURE__ */ jsxRuntimeExports.jsx(TablePagination, { currentPage, totalPages, totalItems: totalFilteredItems, itemsPerPage, onPageChange: setCurrentPage })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentMethodDrawer, { isOpen: isDialogOpen, onClose: handleCloseDialog, onSubmit: handleMethodSubmit, editMethod: editingMethod, isLoading, onDelete: (id_0) => {
      const method_6 = paymentMethods.find((m_1) => m_1.id === id_0);
      if (method_6) {
        setDeleteConfirm({
          id: id_0,
          name: method_6.name
        });
      }
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: !!deleteConfirm, onClose: () => setDeleteConfirm(null), onConfirm: confirmDelete, title: "Bezahlmethode löschen", message: "Sind Sie sicher, dass Sie diese Bezahlmethode löschen möchten? Alle zugehörigen Test-Ergebnisse werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.", itemName: deleteConfirm?.name, isLoading }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: showBulkDeleteConfirm, onClose: () => setShowBulkDeleteConfirm(false), onConfirm: handleBulkDelete, title: "Bezahlmethoden löschen", message: `Sind Sie sicher, dass Sie ${selectedCount} Bezahlmethode(n) löschen möchten? Alle zugehörigen Test-Ergebnisse werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.`, itemName: `${selectedCount} ausgewählte Bezahlmethoden`, isLoading: isBulkDeleting })
  ] });
};
function _temp(_, i) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-1/4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-20" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-1/3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-20" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-24" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-20" })
    ] })
  ] }, i);
}
export {
  PaymentMethods as default
};
