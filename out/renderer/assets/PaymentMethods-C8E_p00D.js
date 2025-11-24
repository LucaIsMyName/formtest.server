import { r as reactExports, j as jsxRuntimeExports, D as Dialog, k as DialogContent, l as DialogHeader, m as DialogTitle, L as Label, n as Checkbox, o as DialogFooter, B as Button, i as dist, p as useSearchParams, d as usePaymentMethodsStore } from "./index-D2jlI7ut.js";
import { C as CONFIG } from "./app.config-CIbseEfE.js";
import { g as getDefaultPaymentIcon, r as renderIcon, I as IconPicker, P as Pen } from "./IconPicker-Dk1M31co.js";
import { I as Input } from "./Input-BAEjCgO9.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./Select-Ct3xcMko.js";
import { D as DeleteConfirmDialog } from "./DeleteConfirmDialog-BoKcAKt_.js";
import { S as Skeleton } from "./Skeleton-DmsM7fob.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell, f as Trash2 } from "./Table-DAwkEYt-.js";
import "./upload-qBI3jaMr.js";
import "./index-DxxRZT0o.js";
const PaymentMethodDialog = ({
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
      newErrors.name = "Payment method name is required";
    }
    if (methodData.type === "paypal") {
      if (!methodData.details.email) {
        newErrors.email = "PayPal email is required";
      }
    } else if (methodData.type === "sepa") {
      if (!methodData.details.iban) {
        newErrors.iban = "IBAN is required for SEPA";
      }
      if (!methodData.details.bic) {
        newErrors.bic = "BIC is required for SEPA";
      }
    } else if (methodData.type === "creditcard") {
      if (!methodData.details.cardNumber) {
        newErrors.cardNumber = "Card number is required";
      }
      if (!methodData.details.expiryDate) {
        newErrors.expiryDate = "Expiry date is required";
      }
      if (!methodData.details.cvv) {
        newErrors.cvv = "CVV is required";
      }
    } else if (methodData.type === "eps") {
      if (!methodData.details.bankCode) {
        newErrors.bankCode = "Bank code is required for EPS";
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "email", children: "PayPal Email *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", id: "email", value: methodData.details.email || "", onChange: (e_5) => updateDetails("email", e_5.target.value), placeholder: "paypal@example.com", disabled: isLoading, className: errors.email ? "border-red-500 focus-visible:ring-red-500" : "" }),
          errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.email })
        ] });
      case "sepa":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "iban", children: "IBAN *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", id: "iban", value: methodData.details.iban || "", onChange: (e_3) => updateDetails("iban", e_3.target.value), placeholder: "DE89 3704 0044 0532 0130 00", disabled: isLoading, className: errors.iban ? "border-red-500 focus-visible:ring-red-500" : "" }),
            errors.iban && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.iban })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "bic", children: "BIC *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", id: "bic", value: methodData.details.bic || "", onChange: (e_4) => updateDetails("bic", e_4.target.value), placeholder: "COBADEFFXXX", disabled: isLoading, className: errors.bic ? "border-red-500 focus-visible:ring-red-500" : "" }),
            errors.bic && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.bic })
          ] })
        ] });
      case "creditcard":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "cardNumber", children: "Card Number *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", id: "cardNumber", value: methodData.details.cardNumber || "", onChange: (e_0) => updateDetails("cardNumber", e_0.target.value), placeholder: "4111 1111 1111 1111", disabled: isLoading, className: errors.cardNumber ? "border-red-500 focus-visible:ring-red-500" : "" }),
            errors.cardNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.cardNumber })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "expiryDate", children: "Expiry Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", id: "expiryDate", value: methodData.details.expiryDate || "", onChange: (e_1) => updateDetails("expiryDate", e_1.target.value), placeholder: "MM/YY", disabled: isLoading, className: errors.expiryDate ? "border-red-500 focus-visible:ring-red-500" : "" }),
              errors.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs", children: errors.expiryDate })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "cvv", children: "CVV *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", id: "cvv", value: methodData.details.cvv || "", onChange: (e_2) => updateDetails("cvv", e_2.target.value), placeholder: "123", disabled: isLoading, className: errors.cvv ? "border-red-500 focus-visible:ring-red-500" : "" }),
              errors.cvv && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm", children: errors.cvv })
            ] })
          ] })
        ] });
      case "eps":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "bankCode", children: "Bank Code *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: methodData.details.bankCode || "", onValueChange: (value_0) => updateDetails("bankCode", value_0), disabled: isLoading, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "bankCode", className: errors.bankCode ? "border-red-500 focus:ring-red-500" : "", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Bank" }) }),
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isOpen, onOpenChange: (open) => !open && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editMethod ? "Bezahlmethode bearbeiten" : "Neue Bezahlmethode" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 py-4", children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "type", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Wähle einen Typ" }) }),
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "pt-4", children: [
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
  const $ = dist.c(51);
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
  let t2;
  let t3;
  if ($[3] !== paymentMethods || $[4] !== searchParams) {
    t2 = () => {
      if (paymentMethods.length > 0) {
        const paramId = searchParams.get("id");
        if (paramId) {
          const method = paymentMethods.find((pm) => String(pm.id) === paramId || pm.name === paramId);
          if (method) {
            setEditingMethod(method);
            setIsDialogOpen(true);
          }
        }
      }
    };
    t3 = [paymentMethods, searchParams];
    $[3] = paymentMethods;
    $[4] = searchParams;
    $[5] = t2;
    $[6] = t3;
  } else {
    t2 = $[5];
    t3 = $[6];
  }
  reactExports.useEffect(t2, t3);
  let t4;
  if ($[7] !== setSearchParams) {
    t4 = () => {
      setEditingMethod(null);
      setIsDialogOpen(true);
      setSearchParams({});
    };
    $[7] = setSearchParams;
    $[8] = t4;
  } else {
    t4 = $[8];
  }
  const handleAddMethod = t4;
  let t5;
  if ($[9] !== setSearchParams) {
    t5 = (method_0) => {
      setEditingMethod(method_0);
      setIsDialogOpen(true);
      setSearchParams({
        id: String(method_0.id)
      });
    };
    $[9] = setSearchParams;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  const handleEditMethod = t5;
  let t6;
  if ($[11] !== setSearchParams) {
    t6 = () => {
      setIsDialogOpen(false);
      setSearchParams({});
    };
    $[11] = setSearchParams;
    $[12] = t6;
  } else {
    t6 = $[12];
  }
  const handleCloseDialog = t6;
  let t7;
  if ($[13] !== addPaymentMethod || $[14] !== editingMethod || $[15] !== updatePaymentMethod) {
    t7 = async (methodData) => {
      if (editingMethod) {
        await updatePaymentMethod(editingMethod.id, methodData);
      } else {
        await addPaymentMethod(methodData);
      }
    };
    $[13] = addPaymentMethod;
    $[14] = editingMethod;
    $[15] = updatePaymentMethod;
    $[16] = t7;
  } else {
    t7 = $[16];
  }
  const handleMethodSubmit = t7;
  let t8;
  if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
    t8 = (method_1) => {
      setDeleteConfirm({
        id: method_1.id,
        name: method_1.name
      });
    };
    $[17] = t8;
  } else {
    t8 = $[17];
  }
  const handleDeleteMethod = t8;
  let t9;
  if ($[18] !== deleteConfirm || $[19] !== deletePaymentMethod) {
    t9 = async () => {
      if (deleteConfirm) {
        await deletePaymentMethod(deleteConfirm.id);
        setDeleteConfirm(null);
      }
    };
    $[18] = deleteConfirm;
    $[19] = deletePaymentMethod;
    $[20] = t9;
  } else {
    t9 = $[20];
  }
  const confirmDelete = t9;
  const formatDate = _temp2;
  const getPaymentTypeLabel = _temp3;
  const getPaymentMethodIcon = _temp4;
  const maskSensitiveData = _temp5;
  let t10;
  if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
    t10 = /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: CONFIG.style.title.className, children: "Bezahlmethoden" });
    $[21] = t10;
  } else {
    t10 = $[21];
  }
  let t11;
  if ($[22] !== handleAddMethod || $[23] !== isLoading) {
    t11 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-8", children: [
      t10,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAddMethod, variant: "primary", size: "md", disabled: isLoading, children: "Neue Bezahlmethode" })
    ] });
    $[22] = handleAddMethod;
    $[23] = isLoading;
    $[24] = t11;
  } else {
    t11 = $[24];
  }
  let t12;
  if ($[25] !== error) {
    t12 = error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-red-800 dark:text-red-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Error:" }),
      " ",
      error
    ] }) });
    $[25] = error;
    $[26] = t12;
  } else {
    t12 = $[26];
  }
  let t13;
  if ($[27] !== handleAddMethod || $[28] !== handleEditMethod || $[29] !== isLoading || $[30] !== paymentMethods || $[31] !== togglePaymentMethodActive) {
    t13 = isLoading && paymentMethods.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentMethodsSkeleton, {}) : paymentMethods.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "No payment methods configured yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAddMethod, variant: "primary", size: "md", disabled: isLoading, children: "Add your first payment method" })
    ] }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Typ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Erstellt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paymentMethods.map((method_4) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm text-gray-900 dark:text-white", children: method_4.name }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          getPaymentMethodIcon(method_4),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-mono text-gray-900 dark:text-gray-300", children: getPaymentTypeLabel(method_4.type) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-gray-500 dark:text-gray-400 font-mono", children: maskSensitiveData(method_4) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => togglePaymentMethodActive(method_4.id), className: `inline-flex px-2 py-1 text-xs font-medium rounded-full border-none cursor-pointer ${method_4.isActive ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"}`, disabled: isLoading, children: method_4.isActive ? "Active" : "Inactive" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-[11px] text-gray-500 dark:text-gray-400 font-mono", children: formatDate(method_4.createdAt) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right text-sm font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => handleEditMethod(method_4), variant: "ghost", size: "sm", disabled: isLoading, title: "Bearbeiten", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 16, className: "text-blue-600 dark:text-blue-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => handleDeleteMethod(method_4), variant: "ghost", size: "sm", disabled: isLoading, title: "Löschen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16, className: "text-red-600 dark:text-red-400" }) })
        ] }) })
      ] }, method_4.id)) })
    ] }) });
    $[27] = handleAddMethod;
    $[28] = handleEditMethod;
    $[29] = isLoading;
    $[30] = paymentMethods;
    $[31] = togglePaymentMethodActive;
    $[32] = t13;
  } else {
    t13 = $[32];
  }
  let t14;
  if ($[33] !== editingMethod || $[34] !== handleCloseDialog || $[35] !== handleMethodSubmit || $[36] !== isDialogOpen || $[37] !== isLoading) {
    t14 = /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentMethodDialog, { isOpen: isDialogOpen, onClose: handleCloseDialog, onSubmit: handleMethodSubmit, editMethod: editingMethod, isLoading });
    $[33] = editingMethod;
    $[34] = handleCloseDialog;
    $[35] = handleMethodSubmit;
    $[36] = isDialogOpen;
    $[37] = isLoading;
    $[38] = t14;
  } else {
    t14 = $[38];
  }
  const t15 = !!deleteConfirm;
  let t16;
  if ($[39] === Symbol.for("react.memo_cache_sentinel")) {
    t16 = () => setDeleteConfirm(null);
    $[39] = t16;
  } else {
    t16 = $[39];
  }
  const t17 = deleteConfirm?.name;
  let t18;
  if ($[40] !== confirmDelete || $[41] !== isLoading || $[42] !== t15 || $[43] !== t17) {
    t18 = /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: t15, onClose: t16, onConfirm: confirmDelete, title: "Bezahlmethode löschen", message: "Sind Sie sicher, dass Sie diese Bezahlmethode löschen möchten? Alle zugehörigen Test-Ergebnisse werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.", itemName: t17, isLoading });
    $[40] = confirmDelete;
    $[41] = isLoading;
    $[42] = t15;
    $[43] = t17;
    $[44] = t18;
  } else {
    t18 = $[44];
  }
  let t19;
  if ($[45] !== t11 || $[46] !== t12 || $[47] !== t13 || $[48] !== t14 || $[49] !== t18) {
    t19 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      t11,
      t12,
      t13,
      t14,
      t18
    ] });
    $[45] = t11;
    $[46] = t12;
    $[47] = t13;
    $[48] = t14;
    $[49] = t18;
    $[50] = t19;
  } else {
    t19 = $[50];
  }
  return t19;
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
function _temp2(dateString) {
  return new Date(dateString).toLocaleDateString("de-AT", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function _temp3(type) {
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
function _temp4(method_2) {
  const iconName = method_2.icon || getDefaultPaymentIcon(method_2.type);
  const colorClass = method_2.type === "paypal" ? "text-blue-600 dark:text-blue-400" : method_2.type === "sepa" ? "text-green-600 dark:text-green-400" : method_2.type === "creditcard" ? "text-purple-600 dark:text-purple-400" : method_2.type === "eps" ? "text-orange-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-400";
  return renderIcon(iconName, 14, colorClass);
}
function _temp5(method_3) {
  switch (method_3.type) {
    case "paypal": {
      return method_3.details.email ? `${method_3.details.email.substring(0, 3)}***@***.com` : "No email";
    }
    case "sepa": {
      return method_3.details.iban ? `***${method_3.details.iban.slice(-4)}` : "No IBAN";
    }
    case "creditcard": {
      return method_3.details.cardNumber ? `****-****-****-${method_3.details.cardNumber.slice(-4)}` : "No card number";
    }
    case "eps": {
      return method_3.details.bankCode ? `Bank: ${method_3.details.bankCode}` : "No bank selected";
    }
    default: {
      return "Configured";
    }
  }
}
export {
  PaymentMethods as default
};
