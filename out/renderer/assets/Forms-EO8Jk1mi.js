import { r as reactExports, j as jsxRuntimeExports, L as Label, k as Checkbox, B as Button, i as dist, l as useSearchParams, b as useFormsStore, m as formatDate } from "./index-kyJHC7IM.js";
import { C as CONFIG } from "./app.config-Cedwjkbe.js";
import { r as renderIcon, P as Plus, I as IconPicker, a as Pen } from "./IconPicker-DOfPw_Fj.js";
import { D as Drawer, a as DrawerContent, b as DrawerHeader, c as DrawerTitle, T as Trash2, d as DrawerFooter, e as Table, f as TableHeader, g as TableRow, h as TableHead, i as TableBody, j as TableCell } from "./Table-2nnPU_SM.js";
import { I as Input, C as ChevronUp, a as ChevronDown, S as Select, b as SelectTrigger, c as SelectValue, d as SelectContent, e as SelectItem, f as StatusBadge, D as DeleteConfirmDialog } from "./Badge-DCzudrr4.js";
import { S as Skeleton } from "./Skeleton-Tcw_7FCV.js";
import { u as useFilterableData, a as useSortableData, T as TableFilter, S as SortableTableHead } from "./useFilterableData-C8FY30HW.js";
import "./upload-DUtD1LCw.js";
const FIELD_TYPE_OPTIONS = [{
  value: "amount",
  label: "Betrag (Preset)"
}, {
  value: "customAmount",
  label: "Betrag (Freier)"
}, {
  value: "interval",
  label: "Intervall/Rhythmus"
}, {
  value: "firstName",
  label: "Vorname"
}, {
  value: "lastName",
  label: "Nachname"
}, {
  value: "email",
  label: "E-Mail"
}, {
  value: "salutation",
  label: "Anrede"
}, {
  value: "country",
  label: "Land"
}, {
  value: "paymentMethod",
  label: "Zahlungsmethode"
}, {
  value: "checkbox",
  label: "Checkbox"
}, {
  value: "radio",
  label: "Radio Button"
}, {
  value: "iban",
  label: "IBAN"
}, {
  value: "accountHolder",
  label: "Kontoinhaber"
}, {
  value: "birthday",
  label: "Geburtstag"
}, {
  value: "custom",
  label: "Benutzerdefiniert"
}];
const ACTION_OPTIONS = [{
  value: "type",
  label: "Text eingeben"
}, {
  value: "click",
  label: "Klicken"
}, {
  value: "select",
  label: "Auswählen (Dropdown)"
}, {
  value: "check",
  label: "Checkbox aktivieren"
}, {
  value: "waitAndClick",
  label: "Warten & Klicken"
}];
const FormDrawer = ({
  isOpen,
  onClose,
  onSubmit,
  editForm,
  isLoading = false
}) => {
  const [formData, setFormData] = reactExports.useState({
    name: "",
    url: "",
    hash: "",
    icon: "FileText",
    isActive: true
  });
  const [fieldMappings, setFieldMappings] = reactExports.useState([]);
  const [showFieldMappings, setShowFieldMappings] = reactExports.useState(false);
  const [errors, setErrors] = reactExports.useState({});
  const [showIconPicker, setShowIconPicker] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (editForm) {
      setFormData({
        name: editForm.name,
        url: editForm.url,
        hash: editForm.hash || "",
        icon: editForm.icon || "FileText",
        isActive: editForm.isActive
      });
      setFieldMappings(editForm.fieldMappings || []);
      setShowFieldMappings((editForm.fieldMappings?.length || 0) > 0);
    } else {
      setFormData({
        name: "",
        url: "",
        hash: "",
        icon: "FileText",
        isActive: true
      });
      setFieldMappings([]);
      setShowFieldMappings(false);
    }
    setErrors({});
  }, [editForm, isOpen]);
  const generateId = () => crypto.randomUUID();
  const addFieldMapping = () => {
    const newMapping = {
      id: generateId(),
      fieldType: "custom",
      selector: "",
      value: "",
      action: "type",
      description: ""
    };
    setFieldMappings([...fieldMappings, newMapping]);
  };
  const updateFieldMapping = (id, updates) => {
    setFieldMappings(fieldMappings.map((m) => m.id === id ? {
      ...m,
      ...updates
    } : m));
  };
  const removeFieldMapping = (id_0) => {
    setFieldMappings(fieldMappings.filter((m_0) => m_0.id !== id_0));
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Formularname ist erforderlich";
    }
    if (!formData.url.trim()) {
      newErrors.url = "Formular-URL ist erforderlich";
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = "Bitte geben Sie eine gültige URL ein";
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
      const validMappings = fieldMappings.filter((m_1) => m_1.selector.trim() !== "");
      const submitData = {
        name: formData.name.trim(),
        url: formData.url.trim(),
        hash: formData.hash.trim() || null,
        icon: formData.icon,
        isActive: formData.isActive,
        fieldMappings: validMappings
      };
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Drawer, { open: isOpen, onOpenChange: (open) => !open && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerHeader, { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerTitle, { children: editForm ? "Formular bearbeiten" : "Neues Formular" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "name", children: "Formular Name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "name", value: formData.name, onChange: (e_0) => setFormData({
          ...formData,
          name: e_0.target.value
        }), placeholder: "z.B. Allgemeine Spendenform", disabled: isLoading, className: errors.name ? "border-red-500 focus-visible:ring-red-500" : "" }),
        errors.name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm", children: errors.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "url", children: "Formular URL *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "url", type: "url", value: formData.url, onChange: (e_1) => setFormData({
          ...formData,
          url: e_1.target.value
        }), placeholder: "https://secure.fundraisingbox.com/...", disabled: isLoading, className: errors.url ? "border-red-500 focus-visible:ring-red-500" : "" }),
        errors.url && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm", children: errors.url })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "hash", children: "Formular Hash (Optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "hash", value: formData.hash, onChange: (e_2) => setFormData({
          ...formData,
          hash: e_2.target.value
        }), placeholder: "z.B. s85hkigup9ml6y94", disabled: isLoading }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 dark:text-gray-400 text-xs", children: "Formular-Identifikations-Hash von FundraisingBox" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "icon", children: "Icon" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowIconPicker(true), disabled: isLoading, className: "flex items-center gap-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-start", children: [
          renderIcon(formData.icon, 20, "text-blue-600 dark:text-blue-400"),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: formData.icon })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "isActive", checked: formData.isActive, onCheckedChange: (checked) => setFormData({
          ...formData,
          isActive: checked === true
        }), disabled: isLoading }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "isActive", className: "text-gray-600 dark:text-gray-400 font-normal cursor-pointer", children: "Aktiv (in Tests einbeziehen)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-200 dark:border-gray-700 rounded-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowFieldMappings(!showFieldMappings), className: "w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Feld-Mappings" }),
            fieldMappings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full", children: fieldMappings.length })
          ] }),
          showFieldMappings ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 16, className: "text-gray-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 16, className: "text-gray-500" })
        ] }),
        showFieldMappings && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-3 border-t border-gray-200 dark:border-gray-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 pt-3", children: "Definieren Sie benutzerdefinierte Selektoren und Werte für Formularfelder. Diese überschreiben die automatische Erkennung." }),
          fieldMappings.map((mapping, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-gray-50 dark:bg-gray-800 rounded-md space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-gray-600 dark:text-gray-400", children: [
                "Mapping #",
                index + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => removeFieldMapping(mapping.id), className: "p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Feldtyp" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mapping.fieldType, onValueChange: (value) => updateFieldMapping(mapping.id, {
                  fieldType: value
                }), disabled: isLoading, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Feldtyp wählen" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FIELD_TYPE_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value)) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Aktion" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mapping.action, onValueChange: (value_0) => updateFieldMapping(mapping.id, {
                  action: value_0
                }), disabled: isLoading, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Aktion wählen" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ACTION_OPTIONS.map((opt_0) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt_0.value, children: opt_0.label }, opt_0.value)) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-gray-500 dark:text-gray-400", children: "CSS Selektor *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: mapping.selector, onChange: (e_3) => updateFieldMapping(mapping.id, {
                selector: e_3.target.value
              }), placeholder: "#payment_first_name", className: "h-8 text-sm", disabled: isLoading })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Wert (optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: mapping.value || "", onChange: (e_4) => updateFieldMapping(mapping.id, {
                value: e_4.target.value
              }), placeholder: "Leer = automatisch generiert", className: "h-8 text-sm", disabled: isLoading })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Beschreibung (optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: mapping.description || "", onChange: (e_5) => updateFieldMapping(mapping.id, {
                description: e_5.target.value
              }), placeholder: "z.B. Vorname-Feld", className: "h-8 text-sm", disabled: isLoading })
            ] })
          ] }, mapping.id)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: addFieldMapping, disabled: isLoading, className: "w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
            "Neues Mapping hinzufügen"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerFooter, { className: "pt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", onClick: onClose, variant: "secondary", size: "md", disabled: isLoading, children: "Abbrechen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "primary", size: "md", isLoading, disabled: isLoading, children: isLoading ? "Speichern..." : editForm ? "Formular aktualisieren" : "Formular hinzufügen" })
      ] })
    ] }),
    showIconPicker && /* @__PURE__ */ jsxRuntimeExports.jsx(IconPicker, { value: formData.icon, onChange: (icon) => {
      setFormData({
        ...formData,
        icon
      });
      setShowIconPicker(false);
    }, onClose: () => setShowIconPicker(false) })
  ] }) });
};
const FormsSkeleton = () => {
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
const Forms = () => {
  const $ = dist.c(71);
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    forms,
    isLoading,
    error,
    loadForms,
    addForm,
    updateForm,
    deleteForm,
    toggleFormActive
  } = useFormsStore();
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [editingForm, setEditingForm] = reactExports.useState(null);
  const [deleteConfirm, setDeleteConfirm] = reactExports.useState(null);
  let t0;
  let t1;
  if ($[0] !== loadForms) {
    t0 = () => {
      loadForms();
    };
    t1 = [loadForms];
    $[0] = loadForms;
    $[1] = t0;
    $[2] = t1;
  } else {
    t0 = $[1];
    t1 = $[2];
  }
  reactExports.useEffect(t0, t1);
  let t2;
  if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = ["name", "url"];
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  let t3;
  if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = {
      searchTerm: "",
      statusFilter: void 0
    };
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  const {
    filteredItems: filteredForms,
    filterConfig,
    setSearchTerm,
    setStatusFilter,
    clearFilters
  } = useFilterableData(forms, t2, t3, "forms");
  let t4;
  if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = {
      key: "name",
      direction: "asc"
    };
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  const {
    sortedItems: sortedForms,
    requestSort,
    getSortDirection
  } = useSortableData(filteredForms, t4, "forms");
  let t5;
  if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
    t5 = [{
      value: "active",
      label: "Aktiv"
    }, {
      value: "inactive",
      label: "Inaktiv"
    }];
    $[6] = t5;
  } else {
    t5 = $[6];
  }
  const statusOptions = t5;
  let t6;
  bb0: {
    if (!filterConfig.statusFilter || filterConfig.statusFilter === "all") {
      t6 = sortedForms;
      break bb0;
    }
    let t72;
    if ($[7] !== filterConfig.statusFilter || $[8] !== sortedForms) {
      let t82;
      if ($[10] !== filterConfig.statusFilter) {
        t82 = (f) => filterConfig.statusFilter === "active" ? f.isActive : !f.isActive;
        $[10] = filterConfig.statusFilter;
        $[11] = t82;
      } else {
        t82 = $[11];
      }
      t72 = sortedForms.filter(t82);
      $[7] = filterConfig.statusFilter;
      $[8] = sortedForms;
      $[9] = t72;
    } else {
      t72 = $[9];
    }
    t6 = t72;
  }
  const displayedForms = t6;
  let t7;
  let t8;
  if ($[12] !== forms || $[13] !== searchParams) {
    t7 = () => {
      if (forms.length > 0) {
        const paramId = searchParams.get("id");
        if (paramId) {
          const form = forms.find((f_0) => String(f_0.id) === paramId || f_0.name === paramId);
          if (form) {
            setEditingForm(form);
            setIsDialogOpen(true);
          }
        }
      }
    };
    t8 = [forms, searchParams];
    $[12] = forms;
    $[13] = searchParams;
    $[14] = t7;
    $[15] = t8;
  } else {
    t7 = $[14];
    t8 = $[15];
  }
  reactExports.useEffect(t7, t8);
  let t9;
  if ($[16] !== setSearchParams) {
    t9 = () => {
      setEditingForm(null);
      setIsDialogOpen(true);
      setSearchParams({});
    };
    $[16] = setSearchParams;
    $[17] = t9;
  } else {
    t9 = $[17];
  }
  const handleAddForm = t9;
  let t10;
  if ($[18] !== setSearchParams) {
    t10 = (form_0) => {
      setEditingForm(form_0);
      setIsDialogOpen(true);
      setSearchParams({
        id: String(form_0.id)
      });
    };
    $[18] = setSearchParams;
    $[19] = t10;
  } else {
    t10 = $[19];
  }
  const handleEditForm = t10;
  let t11;
  if ($[20] !== setSearchParams) {
    t11 = () => {
      setIsDialogOpen(false);
      setSearchParams({});
    };
    $[20] = setSearchParams;
    $[21] = t11;
  } else {
    t11 = $[21];
  }
  const handleCloseDialog = t11;
  let t12;
  if ($[22] !== addForm || $[23] !== editingForm || $[24] !== updateForm) {
    t12 = async (formData) => {
      if (editingForm) {
        await updateForm(editingForm.id, formData);
      } else {
        await addForm(formData);
      }
    };
    $[22] = addForm;
    $[23] = editingForm;
    $[24] = updateForm;
    $[25] = t12;
  } else {
    t12 = $[25];
  }
  const handleFormSubmit = t12;
  let t13;
  if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
    t13 = (form_1) => {
      setDeleteConfirm({
        id: form_1.id,
        name: form_1.name
      });
    };
    $[26] = t13;
  } else {
    t13 = $[26];
  }
  const handleDeleteForm = t13;
  let t14;
  if ($[27] !== deleteConfirm || $[28] !== deleteForm) {
    t14 = async () => {
      if (deleteConfirm) {
        await deleteForm(deleteConfirm.id);
        setDeleteConfirm(null);
      }
    };
    $[27] = deleteConfirm;
    $[28] = deleteForm;
    $[29] = t14;
  } else {
    t14 = $[29];
  }
  const confirmDelete = t14;
  let t15;
  if ($[30] === Symbol.for("react.memo_cache_sentinel")) {
    t15 = /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: CONFIG.style.title.className, children: "Formulare" });
    $[30] = t15;
  } else {
    t15 = $[30];
  }
  let t16;
  if ($[31] !== handleAddForm || $[32] !== isLoading) {
    t16 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-8", children: [
      t15,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAddForm, variant: "primary", size: "md", disabled: isLoading, children: "Neues Formular" })
    ] });
    $[31] = handleAddForm;
    $[32] = isLoading;
    $[33] = t16;
  } else {
    t16 = $[33];
  }
  let t17;
  if ($[34] !== error) {
    t17 = error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-red-800 dark:text-red-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Error:" }),
      " ",
      error
    ] }) });
    $[34] = error;
    $[35] = t17;
  } else {
    t17 = $[35];
  }
  let t18;
  if ($[36] !== clearFilters || $[37] !== filterConfig.searchTerm || $[38] !== filterConfig.statusFilter || $[39] !== forms.length || $[40] !== setSearchTerm || $[41] !== setStatusFilter) {
    t18 = forms.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableFilter, { searchTerm: filterConfig.searchTerm, onSearchChange: setSearchTerm, placeholder: "Formulare durchsuchen...", statusFilter: filterConfig.statusFilter, onStatusFilterChange: setStatusFilter, statusOptions, onClear: clearFilters });
    $[36] = clearFilters;
    $[37] = filterConfig.searchTerm;
    $[38] = filterConfig.statusFilter;
    $[39] = forms.length;
    $[40] = setSearchTerm;
    $[41] = setStatusFilter;
    $[42] = t18;
  } else {
    t18 = $[42];
  }
  let t19;
  if ($[43] !== displayedForms || $[44] !== forms.length || $[45] !== getSortDirection || $[46] !== handleAddForm || $[47] !== handleEditForm || $[48] !== isLoading || $[49] !== requestSort || $[50] !== toggleFormActive) {
    t19 = isLoading && forms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(FormsSkeleton, {}) : forms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "Noch keine Formulare konfiguriert." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAddForm, variant: "primary", size: "md", disabled: isLoading, children: "Erstes Formular hinzufügen" })
    ] }) }) }) : displayedForms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "Keine Formulare gefunden." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Versuche andere Suchbegriffe oder Filter." })
    ] }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("name"), onSort: () => requestSort("name"), children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("url"), onSort: () => requestSort("url"), children: "URL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("isActive"), onSort: () => requestSort("isActive"), children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("createdAt"), onSort: () => requestSort("createdAt"), children: "Erstellt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: displayedForms.map((form_2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50", onClick: () => handleEditForm(form_2), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          renderIcon(form_2.icon || "FileText", 16, "text-gray-500 dark:text-gray-400"),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm text-gray-900 dark:text-white", children: form_2.name }),
            form_2.hash && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
              "Hash: ",
              form_2.hash
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: form_2.url, target: "_blank", rel: "noopener noreferrer", onClick: _temp2, className: "text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 no-underline text-[11px] font-mono break-all", children: form_2.url }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e_0) => {
          e_0.stopPropagation();
          toggleFormActive(form_2.id);
        }, className: "border-none bg-transparent cursor-pointer p-0", disabled: isLoading, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: form_2.isActive ? "active" : "inactive", children: form_2.isActive ? "Aktiv" : "Inaktiv" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-[11px] text-gray-500 dark:text-gray-400 font-mono", children: formatDate(form_2.createdAt) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right text-sm font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_1) => {
            e_1.stopPropagation();
            handleEditForm(form_2);
          }, variant: "ghost", size: "sm", disabled: isLoading, title: "Bearbeiten", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 16, className: "text-blue-600 dark:text-blue-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_2) => {
            e_2.stopPropagation();
            handleDeleteForm(form_2);
          }, variant: "ghost", size: "sm", disabled: isLoading, title: "Löschen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16, className: "text-red-600 dark:text-red-400" }) })
        ] }) })
      ] }, form_2.id)) })
    ] }) });
    $[43] = displayedForms;
    $[44] = forms.length;
    $[45] = getSortDirection;
    $[46] = handleAddForm;
    $[47] = handleEditForm;
    $[48] = isLoading;
    $[49] = requestSort;
    $[50] = toggleFormActive;
    $[51] = t19;
  } else {
    t19 = $[51];
  }
  let t20;
  if ($[52] !== editingForm || $[53] !== handleCloseDialog || $[54] !== handleFormSubmit || $[55] !== isDialogOpen || $[56] !== isLoading) {
    t20 = /* @__PURE__ */ jsxRuntimeExports.jsx(FormDrawer, { isOpen: isDialogOpen, onClose: handleCloseDialog, onSubmit: handleFormSubmit, editForm: editingForm, isLoading });
    $[52] = editingForm;
    $[53] = handleCloseDialog;
    $[54] = handleFormSubmit;
    $[55] = isDialogOpen;
    $[56] = isLoading;
    $[57] = t20;
  } else {
    t20 = $[57];
  }
  const t21 = !!deleteConfirm;
  let t22;
  if ($[58] === Symbol.for("react.memo_cache_sentinel")) {
    t22 = () => setDeleteConfirm(null);
    $[58] = t22;
  } else {
    t22 = $[58];
  }
  const t23 = deleteConfirm?.name;
  let t24;
  if ($[59] !== confirmDelete || $[60] !== isLoading || $[61] !== t21 || $[62] !== t23) {
    t24 = /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: t21, onClose: t22, onConfirm: confirmDelete, title: "Formular löschen", message: "Sind Sie sicher, dass Sie dieses Formular löschen möchten? Alle zugehörigen Test-Ergebnisse werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.", itemName: t23, isLoading });
    $[59] = confirmDelete;
    $[60] = isLoading;
    $[61] = t21;
    $[62] = t23;
    $[63] = t24;
  } else {
    t24 = $[63];
  }
  let t25;
  if ($[64] !== t16 || $[65] !== t17 || $[66] !== t18 || $[67] !== t19 || $[68] !== t20 || $[69] !== t24) {
    t25 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      t16,
      t17,
      t18,
      t19,
      t20,
      t24
    ] });
    $[64] = t16;
    $[65] = t17;
    $[66] = t18;
    $[67] = t19;
    $[68] = t20;
    $[69] = t24;
    $[70] = t25;
  } else {
    t25 = $[70];
  }
  return t25;
};
function _temp(_, i) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-1/4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-1/3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-20" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-24" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-20" })
    ] })
  ] }, i);
}
function _temp2(e) {
  return e.stopPropagation();
}
export {
  Forms as default
};
