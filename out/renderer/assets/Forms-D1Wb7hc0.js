import { r as reactExports, j as jsxRuntimeExports, L as Label, k as Checkbox, B as Button, i as dist, l as useSearchParams, b as useFormsStore, m as formatDate } from "./index-DT77chWV.js";
import { C as CONFIG } from "./app.config-Cedwjkbe.js";
import { r as renderIcon, P as Plus, I as IconPicker, a as Pen } from "./IconPicker-BHt3CTT9.js";
import { D as Drawer, a as DrawerContent, b as DrawerHeader, c as DrawerTitle, T as Trash2, d as DrawerFooter, e as Table, f as TableHeader, g as TableRow, h as TableHead, i as TableBody, j as TableCell, S as StatusBadge } from "./Table-f_Mn0kr1.js";
import { I as Input, C as ChevronUp, a as ChevronDown, S as Select, b as SelectTrigger, c as SelectValue, d as SelectContent, e as SelectItem } from "./Select-BUtbiaV_.js";
import { D as DeleteConfirmDialog } from "./DeleteConfirmDialog-B-5CaEvw.js";
import { S as Skeleton } from "./Skeleton-BcTffddW.js";
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
  const $ = dist.c(51);
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
  let t3;
  if ($[3] !== forms || $[4] !== searchParams) {
    t2 = () => {
      if (forms.length > 0) {
        const paramId = searchParams.get("id");
        if (paramId) {
          const form = forms.find((f) => String(f.id) === paramId || f.name === paramId);
          if (form) {
            setEditingForm(form);
            setIsDialogOpen(true);
          }
        }
      }
    };
    t3 = [forms, searchParams];
    $[3] = forms;
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
      setEditingForm(null);
      setIsDialogOpen(true);
      setSearchParams({});
    };
    $[7] = setSearchParams;
    $[8] = t4;
  } else {
    t4 = $[8];
  }
  const handleAddForm = t4;
  let t5;
  if ($[9] !== setSearchParams) {
    t5 = (form_0) => {
      setEditingForm(form_0);
      setIsDialogOpen(true);
      setSearchParams({
        id: String(form_0.id)
      });
    };
    $[9] = setSearchParams;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  const handleEditForm = t5;
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
  if ($[13] !== addForm || $[14] !== editingForm || $[15] !== updateForm) {
    t7 = async (formData) => {
      if (editingForm) {
        await updateForm(editingForm.id, formData);
      } else {
        await addForm(formData);
      }
    };
    $[13] = addForm;
    $[14] = editingForm;
    $[15] = updateForm;
    $[16] = t7;
  } else {
    t7 = $[16];
  }
  const handleFormSubmit = t7;
  let t8;
  if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
    t8 = (form_1) => {
      setDeleteConfirm({
        id: form_1.id,
        name: form_1.name
      });
    };
    $[17] = t8;
  } else {
    t8 = $[17];
  }
  const handleDeleteForm = t8;
  let t9;
  if ($[18] !== deleteConfirm || $[19] !== deleteForm) {
    t9 = async () => {
      if (deleteConfirm) {
        await deleteForm(deleteConfirm.id);
        setDeleteConfirm(null);
      }
    };
    $[18] = deleteConfirm;
    $[19] = deleteForm;
    $[20] = t9;
  } else {
    t9 = $[20];
  }
  const confirmDelete = t9;
  let t10;
  if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
    t10 = /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: CONFIG.style.title.className, children: "Formulare" });
    $[21] = t10;
  } else {
    t10 = $[21];
  }
  let t11;
  if ($[22] !== handleAddForm || $[23] !== isLoading) {
    t11 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-8", children: [
      t10,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAddForm, variant: "primary", size: "md", disabled: isLoading, children: "Neues Formular" })
    ] });
    $[22] = handleAddForm;
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
  if ($[27] !== forms || $[28] !== handleAddForm || $[29] !== handleEditForm || $[30] !== isLoading || $[31] !== toggleFormActive) {
    t13 = isLoading && forms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(FormsSkeleton, {}) : forms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "No forms configured yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAddForm, variant: "primary", size: "md", disabled: isLoading, children: "Add your first form" })
    ] }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "URL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Erstellt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: forms.map((form_2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50", onClick: () => handleEditForm(form_2), children: [
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
    $[27] = forms;
    $[28] = handleAddForm;
    $[29] = handleEditForm;
    $[30] = isLoading;
    $[31] = toggleFormActive;
    $[32] = t13;
  } else {
    t13 = $[32];
  }
  let t14;
  if ($[33] !== editingForm || $[34] !== handleCloseDialog || $[35] !== handleFormSubmit || $[36] !== isDialogOpen || $[37] !== isLoading) {
    t14 = /* @__PURE__ */ jsxRuntimeExports.jsx(FormDrawer, { isOpen: isDialogOpen, onClose: handleCloseDialog, onSubmit: handleFormSubmit, editForm: editingForm, isLoading });
    $[33] = editingForm;
    $[34] = handleCloseDialog;
    $[35] = handleFormSubmit;
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
    t18 = /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: t15, onClose: t16, onConfirm: confirmDelete, title: "Formular löschen", message: "Sind Sie sicher, dass Sie dieses Formular löschen möchten? Alle zugehörigen Test-Ergebnisse werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.", itemName: t17, isLoading });
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
