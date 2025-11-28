import { r as reactExports, j as jsxRuntimeExports, L as Label, k as Checkbox, B as Button, i as dist, l as useSearchParams, d as usePaymentMethodsStore, m as formatDate } from "./index-kyJHC7IM.js";
import { C as CONFIG } from "./app.config-Cedwjkbe.js";
import { g as getDefaultPaymentIcon, r as renderIcon, I as IconPicker, a as Pen } from "./IconPicker-DOfPw_Fj.js";
import { D as Drawer, a as DrawerContent, b as DrawerHeader, c as DrawerTitle, d as DrawerFooter, e as Table, f as TableHeader, g as TableRow, h as TableHead, i as TableBody, j as TableCell, T as Trash2 } from "./Table-2nnPU_SM.js";
import { I as Input, S as Select, b as SelectTrigger, c as SelectValue, d as SelectContent, e as SelectItem, f as StatusBadge, D as DeleteConfirmDialog } from "./Badge-DCzudrr4.js";
import { S as Skeleton } from "./Skeleton-Tcw_7FCV.js";
import { u as useFilterableData, a as useSortableData, T as TableFilter, S as SortableTableHead } from "./useFilterableData-C8FY30HW.js";
import "./upload-DUtD1LCw.js";
const PaymentMethodDrawer = ({
  isOpen,
  onClose,
  onSubmit,
  editMethod,
  isLoading = false
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", id: "email", value: methodData.details.email || "", onChange: (e_5) => updateDetails("email", e_5.target.value), placeholder: "paypal@example.com", disabled: isLoading, className: errors.email ? "border-red-500 focus-visible:ring-red-500" : "" }),
          errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.email })
        ] });
      case "sepa":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "accountHolder", children: "Kontoinhaber *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", id: "accountHolder", value: methodData.details.accountHolder || "", onChange: (e_3) => updateDetails("accountHolder", e_3.target.value), placeholder: "Max Mustermann", disabled: isLoading, className: errors.accountHolder ? "border-red-500 focus-visible:ring-red-500" : "" }),
            errors.accountHolder && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.accountHolder })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "iban", children: "IBAN *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", id: "iban", value: methodData.details.iban || "", onChange: (e_4) => updateDetails("iban", e_4.target.value), placeholder: "DE89 3704 0044 0532 0130 00", disabled: isLoading, className: errors.iban ? "border-red-500 focus-visible:ring-red-500" : "" }),
            errors.iban && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.iban })
          ] })
        ] });
      case "creditcard":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "cardNumber", children: "Kartennummer *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", id: "cardNumber", value: methodData.details.cardNumber || "", onChange: (e_0) => updateDetails("cardNumber", e_0.target.value), placeholder: "4111 1111 1111 1111", disabled: isLoading, className: errors.cardNumber ? "border-red-500 focus-visible:ring-red-500" : "" }),
            errors.cardNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.cardNumber })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "expiryDate", children: "Ablaufdatum *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", id: "expiryDate", value: methodData.details.expiryDate || "", onChange: (e_1) => updateDetails("expiryDate", e_1.target.value), placeholder: "MM/YY", disabled: isLoading, className: errors.expiryDate ? "border-red-500 focus-visible:ring-red-500" : "" }),
              errors.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.expiryDate })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "cvv", children: "CVV *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", id: "cvv", value: methodData.details.cvv || "", onChange: (e_2) => updateDetails("cvv", e_2.target.value), placeholder: "123", disabled: isLoading, className: errors.cvv ? "border-red-500 focus-visible:ring-red-500" : "" }),
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerHeader, { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerTitle, { children: editMethod ? "Bezahlmethode bearbeiten" : "Neue Bezahlmethode" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "name", children: "Name der Bezahlmethode *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "name", value: methodData.name, onChange: (e_6) => setMethodData({
          ...methodData,
          name: e_6.target.value
        }), placeholder: "z.B. Test PayPal Account", disabled: isLoading, className: errors.name ? "border-red-500 focus-visible:ring-red-500" : "" }),
        errors.name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "type", children: "Bezahlmethoden-Typ *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: methodData.type, onValueChange: (value_1) => setMethodData({
          ...methodData,
          type: value_1,
          details: {}
        }), disabled: isLoading, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "type", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Typ auswählen" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paypal", children: "PayPal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sepa", children: "SEPA Lastschrift" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "creditcard", children: "Kreditkarte" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "eps", children: "EPS (Österreich)" })
          ] })
        ] })
      ] }),
      renderTypeSpecificFields(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "icon", children: "Icon" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowIconPicker(true), disabled: isLoading, className: "flex items-center gap-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-start", children: [
          renderIcon(methodData.icon, 20, "text-blue-600 dark:text-blue-400"),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: methodData.icon })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "isActive", checked: methodData.isActive, onCheckedChange: (checked) => setMethodData({
          ...methodData,
          isActive: checked === true
        }), disabled: isLoading }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "isActive", className: "text-gray-600 dark:text-gray-400 font-normal cursor-pointer", children: "Aktiv (in Tests verwenden)" })
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
const PaymentMethodsSkeleton = () => {
  const $ = dist.c(1);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [...Array(5)].map(_temp) }) }) });
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
};
const PaymentMethods = () => {
  const $ = dist.c(74);
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
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [editingMethod, setEditingMethod] = reactExports.useState(null);
  const [deleteConfirm, setDeleteConfirm] = reactExports.useState(null);
  let t0;
  let t1;
  if ($[0] !== loadPaymentMethods) {
    t0 = () => {
      loadPaymentMethods();
    };
    t1 = [loadPaymentMethods];
    $[0] = loadPaymentMethods;
    $[1] = t0;
    $[2] = t1;
  } else {
    t0 = $[1];
    t1 = $[2];
  }
  reactExports.useEffect(t0, t1);
  const getTypeLabel = _temp2;
  const getDetailsSummary = _temp3;
  let t2;
  if ($[3] !== paymentMethods) {
    let t32;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
      t32 = (pm) => ({
        ...pm,
        typeLabel: getTypeLabel(pm.type),
        detailsSummary: getDetailsSummary(pm)
      });
      $[5] = t32;
    } else {
      t32 = $[5];
    }
    t2 = paymentMethods.map(t32);
    $[3] = paymentMethods;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  const paymentMethodsWithComputed = t2;
  let t3;
  if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = ["name", "typeLabel", "type", "detailsSummary"];
    $[6] = t3;
  } else {
    t3 = $[6];
  }
  let t4;
  if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = {
      searchTerm: "",
      statusFilter: void 0
    };
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  const {
    filteredItems: filteredMethods,
    filterConfig,
    setSearchTerm,
    setStatusFilter,
    clearFilters
  } = useFilterableData(paymentMethodsWithComputed, t3, t4, "paymentMethods");
  let t5;
  if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
    t5 = {
      key: "name",
      direction: "asc"
    };
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  const {
    sortedItems: sortedMethods,
    requestSort,
    getSortDirection
  } = useSortableData(filteredMethods, t5, "paymentMethods");
  let t6;
  if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
    t6 = [{
      value: "active",
      label: "Aktiv"
    }, {
      value: "inactive",
      label: "Inaktiv"
    }];
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  const statusOptions = t6;
  let t7;
  bb0: {
    if (!filterConfig.statusFilter || filterConfig.statusFilter === "all") {
      t7 = sortedMethods;
      break bb0;
    }
    let t82;
    if ($[10] !== filterConfig.statusFilter || $[11] !== sortedMethods) {
      let t92;
      if ($[13] !== filterConfig.statusFilter) {
        t92 = (m) => filterConfig.statusFilter === "active" ? m.isActive : !m.isActive;
        $[13] = filterConfig.statusFilter;
        $[14] = t92;
      } else {
        t92 = $[14];
      }
      t82 = sortedMethods.filter(t92);
      $[10] = filterConfig.statusFilter;
      $[11] = sortedMethods;
      $[12] = t82;
    } else {
      t82 = $[12];
    }
    t7 = t82;
  }
  const displayedMethods = t7;
  let t8;
  let t9;
  if ($[15] !== paymentMethods || $[16] !== searchParams) {
    t8 = () => {
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
    };
    t9 = [paymentMethods, searchParams];
    $[15] = paymentMethods;
    $[16] = searchParams;
    $[17] = t8;
    $[18] = t9;
  } else {
    t8 = $[17];
    t9 = $[18];
  }
  reactExports.useEffect(t8, t9);
  let t10;
  if ($[19] !== setSearchParams) {
    t10 = () => {
      setEditingMethod(null);
      setIsDialogOpen(true);
      setSearchParams({});
    };
    $[19] = setSearchParams;
    $[20] = t10;
  } else {
    t10 = $[20];
  }
  const handleAddMethod = t10;
  let t11;
  if ($[21] !== setSearchParams) {
    t11 = (method_1) => {
      setEditingMethod(method_1);
      setIsDialogOpen(true);
      setSearchParams({
        id: String(method_1.id)
      });
    };
    $[21] = setSearchParams;
    $[22] = t11;
  } else {
    t11 = $[22];
  }
  const handleEditMethod = t11;
  let t12;
  if ($[23] !== setSearchParams) {
    t12 = () => {
      setIsDialogOpen(false);
      setSearchParams({});
    };
    $[23] = setSearchParams;
    $[24] = t12;
  } else {
    t12 = $[24];
  }
  const handleCloseDialog = t12;
  let t13;
  if ($[25] !== addPaymentMethod || $[26] !== editingMethod || $[27] !== updatePaymentMethod) {
    t13 = async (methodData) => {
      if (editingMethod) {
        await updatePaymentMethod(editingMethod.id, methodData);
      } else {
        await addPaymentMethod(methodData);
      }
    };
    $[25] = addPaymentMethod;
    $[26] = editingMethod;
    $[27] = updatePaymentMethod;
    $[28] = t13;
  } else {
    t13 = $[28];
  }
  const handleMethodSubmit = t13;
  let t14;
  if ($[29] === Symbol.for("react.memo_cache_sentinel")) {
    t14 = (method_2) => {
      setDeleteConfirm({
        id: method_2.id,
        name: method_2.name
      });
    };
    $[29] = t14;
  } else {
    t14 = $[29];
  }
  const handleDeleteMethod = t14;
  let t15;
  if ($[30] !== deleteConfirm || $[31] !== deletePaymentMethod) {
    t15 = async () => {
      if (deleteConfirm) {
        await deletePaymentMethod(deleteConfirm.id);
        setDeleteConfirm(null);
      }
    };
    $[30] = deleteConfirm;
    $[31] = deletePaymentMethod;
    $[32] = t15;
  } else {
    t15 = $[32];
  }
  const confirmDelete = t15;
  const getPaymentMethodIcon = _temp4;
  const maskSensitiveData = _temp5;
  let t16;
  if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
    t16 = /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: CONFIG.style.title.className, children: "Bezahlmethoden" });
    $[33] = t16;
  } else {
    t16 = $[33];
  }
  let t17;
  if ($[34] !== handleAddMethod || $[35] !== isLoading) {
    t17 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-8", children: [
      t16,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAddMethod, variant: "primary", size: "md", disabled: isLoading, children: "Neue Bezahlmethode" })
    ] });
    $[34] = handleAddMethod;
    $[35] = isLoading;
    $[36] = t17;
  } else {
    t17 = $[36];
  }
  let t18;
  if ($[37] !== error) {
    t18 = error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-red-800 dark:text-red-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Error:" }),
      " ",
      error
    ] }) });
    $[37] = error;
    $[38] = t18;
  } else {
    t18 = $[38];
  }
  let t19;
  if ($[39] !== clearFilters || $[40] !== filterConfig.searchTerm || $[41] !== filterConfig.statusFilter || $[42] !== paymentMethods.length || $[43] !== setSearchTerm || $[44] !== setStatusFilter) {
    t19 = paymentMethods.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableFilter, { searchTerm: filterConfig.searchTerm, onSearchChange: setSearchTerm, placeholder: "Bezahlmethoden durchsuchen...", statusFilter: filterConfig.statusFilter, onStatusFilterChange: setStatusFilter, statusOptions, onClear: clearFilters });
    $[39] = clearFilters;
    $[40] = filterConfig.searchTerm;
    $[41] = filterConfig.statusFilter;
    $[42] = paymentMethods.length;
    $[43] = setSearchTerm;
    $[44] = setStatusFilter;
    $[45] = t19;
  } else {
    t19 = $[45];
  }
  let t20;
  if ($[46] !== displayedMethods || $[47] !== getSortDirection || $[48] !== handleAddMethod || $[49] !== handleEditMethod || $[50] !== isLoading || $[51] !== paymentMethods.length || $[52] !== requestSort || $[53] !== togglePaymentMethodActive) {
    t20 = isLoading && paymentMethods.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentMethodsSkeleton, {}) : paymentMethods.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "Noch keine Bezahlmethoden konfiguriert." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAddMethod, variant: "primary", size: "md", disabled: isLoading, children: "Erste Bezahlmethode hinzufügen" })
    ] }) }) }) : displayedMethods.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "Keine Bezahlmethoden gefunden." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Versuche andere Suchbegriffe oder Filter." })
    ] }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("name"), onSort: () => requestSort("name"), children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("typeLabel"), onSort: () => requestSort("typeLabel"), children: "Typ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("detailsSummary"), onSort: () => requestSort("detailsSummary"), children: "Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("isActive"), onSort: () => requestSort("isActive"), children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("createdAt"), onSort: () => requestSort("createdAt"), children: "Erstellt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: displayedMethods.map((method_5) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50", onClick: () => handleEditMethod(method_5), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm text-gray-900 dark:text-white", children: method_5.name }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          getPaymentMethodIcon(method_5),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-mono text-gray-900 dark:text-gray-300", children: method_5.typeLabel })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-gray-500 dark:text-gray-400 font-mono", children: maskSensitiveData(method_5) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
          e.stopPropagation();
          togglePaymentMethodActive(method_5.id);
        }, className: "border-none bg-transparent cursor-pointer p-0", disabled: isLoading, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: method_5.isActive ? "active" : "inactive", children: method_5.isActive ? "Aktiv" : "Inaktiv" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-[11px] text-gray-500 dark:text-gray-400 font-mono", children: formatDate(method_5.createdAt) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right text-sm font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_0) => {
            e_0.stopPropagation();
            handleEditMethod(method_5);
          }, variant: "ghost", size: "sm", disabled: isLoading, title: "Bearbeiten", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 16, className: "text-blue-600 dark:text-blue-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_1) => {
            e_1.stopPropagation();
            handleDeleteMethod(method_5);
          }, variant: "ghost", size: "sm", disabled: isLoading, title: "Löschen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16, className: "text-red-600 dark:text-red-400" }) })
        ] }) })
      ] }, method_5.id)) })
    ] }) });
    $[46] = displayedMethods;
    $[47] = getSortDirection;
    $[48] = handleAddMethod;
    $[49] = handleEditMethod;
    $[50] = isLoading;
    $[51] = paymentMethods.length;
    $[52] = requestSort;
    $[53] = togglePaymentMethodActive;
    $[54] = t20;
  } else {
    t20 = $[54];
  }
  let t21;
  if ($[55] !== editingMethod || $[56] !== handleCloseDialog || $[57] !== handleMethodSubmit || $[58] !== isDialogOpen || $[59] !== isLoading) {
    t21 = /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentMethodDrawer, { isOpen: isDialogOpen, onClose: handleCloseDialog, onSubmit: handleMethodSubmit, editMethod: editingMethod, isLoading });
    $[55] = editingMethod;
    $[56] = handleCloseDialog;
    $[57] = handleMethodSubmit;
    $[58] = isDialogOpen;
    $[59] = isLoading;
    $[60] = t21;
  } else {
    t21 = $[60];
  }
  const t22 = !!deleteConfirm;
  let t23;
  if ($[61] === Symbol.for("react.memo_cache_sentinel")) {
    t23 = () => setDeleteConfirm(null);
    $[61] = t23;
  } else {
    t23 = $[61];
  }
  const t24 = deleteConfirm?.name;
  let t25;
  if ($[62] !== confirmDelete || $[63] !== isLoading || $[64] !== t22 || $[65] !== t24) {
    t25 = /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: t22, onClose: t23, onConfirm: confirmDelete, title: "Bezahlmethode löschen", message: "Sind Sie sicher, dass Sie diese Bezahlmethode löschen möchten? Alle zugehörigen Test-Ergebnisse werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.", itemName: t24, isLoading });
    $[62] = confirmDelete;
    $[63] = isLoading;
    $[64] = t22;
    $[65] = t24;
    $[66] = t25;
  } else {
    t25 = $[66];
  }
  let t26;
  if ($[67] !== t17 || $[68] !== t18 || $[69] !== t19 || $[70] !== t20 || $[71] !== t21 || $[72] !== t25) {
    t26 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      t17,
      t18,
      t19,
      t20,
      t21,
      t25
    ] });
    $[67] = t17;
    $[68] = t18;
    $[69] = t19;
    $[70] = t20;
    $[71] = t21;
    $[72] = t25;
    $[73] = t26;
  } else {
    t26 = $[73];
  }
  return t26;
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
function _temp2(type) {
  switch (type) {
    case "paypal": {
      return "PayPal";
    }
    case "sepa": {
      return "SEPA";
    }
    case "creditcard": {
      return "Credit Card";
    }
    case "eps": {
      return "EPS (Austria)";
    }
    default: {
      return type;
    }
  }
}
function _temp3(method) {
  switch (method.type) {
    case "paypal": {
      return method.details.email || "";
    }
    case "sepa": {
      return method.details.accountHolder || method.details.iban || "";
    }
    case "creditcard": {
      return method.details.cardNumber || "";
    }
    case "eps": {
      return method.details.bankCode || "";
    }
    default: {
      return "";
    }
  }
}
function _temp4(method_3) {
  const iconName = method_3.icon || getDefaultPaymentIcon(method_3.type);
  const colorClass = method_3.type === "paypal" ? "text-blue-600 dark:text-blue-400" : method_3.type === "sepa" ? "text-green-600 dark:text-green-400" : method_3.type === "creditcard" ? "text-purple-600 dark:text-purple-400" : method_3.type === "eps" ? "text-orange-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-400";
  return renderIcon(iconName, 14, colorClass);
}
function _temp5(method_4) {
  switch (method_4.type) {
    case "paypal": {
      return method_4.details.email ? `${method_4.details.email.substring(0, 3)}***@***.com` : "Keine E-Mail";
    }
    case "sepa": {
      const holder = method_4.details.accountHolder || "";
      const maskedIban = method_4.details.iban ? `***${method_4.details.iban.slice(-4)}` : "";
      if (holder && maskedIban) {
        return `${holder} (${maskedIban})`;
      }
      if (holder) {
        return holder;
      }
      if (maskedIban) {
        return maskedIban;
      }
      return "Keine SEPA-Daten";
    }
    case "creditcard": {
      return method_4.details.cardNumber ? `****-****-****-${method_4.details.cardNumber.slice(-4)}` : "Keine Kartennummer";
    }
    case "eps": {
      return method_4.details.bankCode ? `Bank: ${method_4.details.bankCode}` : "Keine Bank ausgewählt";
    }
    default: {
      return "Konfiguriert";
    }
  }
}
export {
  PaymentMethods as default
};
