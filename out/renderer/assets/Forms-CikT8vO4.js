import { r as reactExports, j as jsxRuntimeExports, B as Button, E as ExternalLink, k as Trash2, L as Label, I as Input, l as Table, m as TableBody, n as TableRow, o as TableCell, p as StatusBadge, q as formatDate, s as renderIcon, t as Checkbox, v as ChevronUp, x as ChevronDown, y as Select, z as SelectTrigger, A as SelectValue, D as SelectContent, G as SelectItem, H as Plus, i as dist, J as useSearchParams, b as useFormsStore, e as useTestRunsStore, K as TableHeader, M as TableHead, N as Pen, O as TablePagination } from "./index-DBe7Ss4L.js";
import { C as CONFIG } from "./app.config-Dj0WDsKm.js";
import { I as IconPicker, u as useSparklineData, M as MiniSparkline } from "./MiniSparkline-Bb7hxR-h.js";
import { D as Drawer, a as DrawerContent, b as DrawerHeader, c as DrawerFooter, u as useFilterableData, d as useSortableData, S as SortableTableHead } from "./useFilterableData-CnUwDs86.js";
import { T as TableFilter, D as DeleteConfirmDialog } from "./TableFilter-C6ByrS11.js";
import { S as Skeleton } from "./Skeleton-j11q0gD7.js";
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
  isLoading = false,
  onDelete
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
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: " pb-4 flex-shrink-0", children: [
      editForm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: () => window.open(editForm.url, "_blank"), variant: "secondary", size: "sm", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 14 }),
          "URL öffnen"
        ] }),
        onDelete && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: () => {
          onDelete(editForm.id);
          onClose();
        }, variant: "danger", size: "sm", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }),
          "Löschen"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", className: "sr-only", children: "Formularname *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "name", value: formData.name, onChange: (e_0) => setFormData({
          ...formData,
          name: e_0.target.value
        }), placeholder: "Formularname", disabled: isLoading, className: `${CONFIG.style.title.className} h-16` + (errors.name ? "text-red-500" : "") })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerHeader, { className: "pt-6", children: errors.name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm", children: errors.name }) }),
    editForm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 pb-6 border-b dark:border-gray-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-3", children: "Formular Details" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 w-[120px] bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs font-mono bg-gray-100 dark:bg-gray-900/50 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700", children: editForm.id }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: editForm.isActive ? "active" : "inactive" }) })
        ] }),
        editForm.hash && /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Hash" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs font-mono bg-gray-100 dark:bg-gray-900/50 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700", children: editForm.hash }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Erstellt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white font-mono", children: formatDate(editForm.createdAt) })
        ] }),
        editForm.updatedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Aktualisiert" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white font-mono", children: formatDate(editForm.updatedAt) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Mappings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white", children: [
            editForm.fieldMappings?.length || 0,
            " Feld-Mappings"
          ] })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-3", children: "Formular Einstellungen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 w-[120px] bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400 align-top pt-3", children: "URL *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "px-3 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "url", type: "url", value: formData.url, onChange: (e_1) => setFormData({
                ...formData,
                url: e_1.target.value
              }), placeholder: "https://secure.fundraisingbox.com/...", disabled: isLoading, className: `text-sm ${errors.url ? "border-red-500 focus-visible:ring-red-500" : ""}` }),
              errors.url && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.url })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400 align-top pt-3", children: "Hash" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "px-3 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "hash", value: formData.hash, onChange: (e_2) => setFormData({
                ...formData,
                hash: e_2.target.value
              }), placeholder: "z.B. s85hkigup9ml6y94", disabled: isLoading, className: "text-sm" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 dark:text-gray-400 text-xs mt-1", children: "Formular-Identifikations-Hash von FundraisingBox" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400 align-top pt-3", children: "Icon" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowIconPicker(true), disabled: isLoading, className: "flex items-center gap-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-start", children: [
              renderIcon(formData.icon, 18, "text-blue-600 dark:text-blue-400"),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: formData.icon })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "isActive", checked: formData.isActive, onCheckedChange: (checked) => setFormData({
                ...formData,
                isActive: checked === true
              }), disabled: isLoading }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "isActive", className: "text-sm text-gray-600 dark:text-gray-400 font-normal cursor-pointer", children: "Aktiv (in Tests einbeziehen)" })
            ] }) })
          ] })
        ] }) }) })
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
    t0 = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [...Array(5)].map(_temp) }) }) });
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
};
const FormSparkline = (t0) => {
  const $ = dist.c(2);
  const {
    formId,
    testRuns
  } = t0;
  const sparklineData = useSparklineData(testRuns, "form", formId);
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
const Forms = () => {
  const $ = dist.c(95);
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
  const {
    testRuns,
    loadTestRuns
  } = useTestRunsStore();
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [editingForm, setEditingForm] = reactExports.useState(null);
  const [deleteConfirm, setDeleteConfirm] = reactExports.useState(null);
  let t0;
  let t1;
  if ($[0] !== loadForms || $[1] !== loadTestRuns) {
    t0 = () => {
      loadForms();
      loadTestRuns();
    };
    t1 = [loadForms, loadTestRuns];
    $[0] = loadForms;
    $[1] = loadTestRuns;
    $[2] = t0;
    $[3] = t1;
  } else {
    t0 = $[2];
    t1 = $[3];
  }
  reactExports.useEffect(t0, t1);
  let t2;
  if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = ["name", "url"];
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  let t3;
  if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = {
      searchTerm: "",
      statusFilter: void 0
    };
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  const {
    filteredItems: filteredForms,
    filterConfig,
    setSearchTerm,
    setStatusFilter,
    clearFilters
  } = useFilterableData(forms, t2, t3, "forms");
  let t4;
  if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = {
      key: "name",
      direction: "asc"
    };
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  const {
    sortedItems: sortedForms,
    requestSort,
    sortConfig,
    getSortDirection
  } = useSortableData(filteredForms, t4, "forms");
  let t5;
  if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
    t5 = [{
      value: "active",
      label: "Aktiv"
    }, {
      value: "inactive",
      label: "Inaktiv"
    }];
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  const statusOptions = t5;
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  let t6;
  bb0: {
    let filtered = sortedForms;
    if (filterConfig.statusFilter && filterConfig.statusFilter !== "all") {
      let t72;
      if ($[8] !== filterConfig.statusFilter || $[9] !== sortedForms) {
        let t82;
        if ($[11] !== filterConfig.statusFilter) {
          t82 = (f) => filterConfig.statusFilter === "active" ? f.isActive : !f.isActive;
          $[11] = filterConfig.statusFilter;
          $[12] = t82;
        } else {
          t82 = $[12];
        }
        t72 = sortedForms.filter(t82);
        $[8] = filterConfig.statusFilter;
        $[9] = sortedForms;
        $[10] = t72;
      } else {
        t72 = $[10];
      }
      filtered = t72;
    }
    if (filtered.length > 50) {
      const start = (currentPage - 1) * 50;
      let t72;
      if ($[13] !== filtered || $[14] !== start) {
        t72 = filtered.slice(start, start + 50);
        $[13] = filtered;
        $[14] = start;
        $[15] = t72;
      } else {
        t72 = $[15];
      }
      t6 = t72;
      break bb0;
    }
    t6 = filtered;
  }
  const displayedForms = t6;
  let t7;
  bb1: {
    if (!filterConfig.statusFilter || filterConfig.statusFilter === "all") {
      t7 = sortedForms.length;
      break bb1;
    }
    let t82;
    if ($[16] !== filterConfig.statusFilter || $[17] !== sortedForms) {
      let t92;
      if ($[19] !== filterConfig.statusFilter) {
        t92 = (f_0) => filterConfig.statusFilter === "active" ? f_0.isActive : !f_0.isActive;
        $[19] = filterConfig.statusFilter;
        $[20] = t92;
      } else {
        t92 = $[20];
      }
      t82 = sortedForms.filter(t92);
      $[16] = filterConfig.statusFilter;
      $[17] = sortedForms;
      $[18] = t82;
    } else {
      t82 = $[18];
    }
    t7 = t82.length;
  }
  const totalFilteredItems = t7;
  const totalPages = Math.ceil(totalFilteredItems / 50);
  const showPagination = totalFilteredItems > 50;
  let t8;
  if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
    t8 = () => {
      setCurrentPage(1);
    };
    $[21] = t8;
  } else {
    t8 = $[21];
  }
  let t9;
  if ($[22] !== filterConfig.searchTerm || $[23] !== filterConfig.statusFilter || $[24] !== sortConfig.direction || $[25] !== sortConfig.key) {
    t9 = [filterConfig.statusFilter, filterConfig.searchTerm, sortConfig.key, sortConfig.direction];
    $[22] = filterConfig.searchTerm;
    $[23] = filterConfig.statusFilter;
    $[24] = sortConfig.direction;
    $[25] = sortConfig.key;
    $[26] = t9;
  } else {
    t9 = $[26];
  }
  reactExports.useEffect(t8, t9);
  let t10;
  let t11;
  if ($[27] !== forms || $[28] !== searchParams) {
    t10 = () => {
      if (forms.length > 0) {
        const paramId = searchParams.get("id");
        if (paramId) {
          const form = forms.find((f_1) => String(f_1.id) === paramId || f_1.name === paramId);
          if (form) {
            setEditingForm(form);
            setIsDialogOpen(true);
          }
        }
      }
    };
    t11 = [forms, searchParams];
    $[27] = forms;
    $[28] = searchParams;
    $[29] = t10;
    $[30] = t11;
  } else {
    t10 = $[29];
    t11 = $[30];
  }
  reactExports.useEffect(t10, t11);
  let t12;
  if ($[31] !== setSearchParams) {
    t12 = () => {
      setEditingForm(null);
      setIsDialogOpen(true);
      setSearchParams({});
    };
    $[31] = setSearchParams;
    $[32] = t12;
  } else {
    t12 = $[32];
  }
  const handleAddForm = t12;
  let t13;
  if ($[33] !== setSearchParams) {
    t13 = (form_0) => {
      setEditingForm(form_0);
      setIsDialogOpen(true);
      setSearchParams({
        id: String(form_0.id)
      });
    };
    $[33] = setSearchParams;
    $[34] = t13;
  } else {
    t13 = $[34];
  }
  const handleEditForm = t13;
  let t14;
  if ($[35] !== setSearchParams) {
    t14 = () => {
      setIsDialogOpen(false);
      setSearchParams({});
    };
    $[35] = setSearchParams;
    $[36] = t14;
  } else {
    t14 = $[36];
  }
  const handleCloseDialog = t14;
  let t15;
  if ($[37] !== addForm || $[38] !== editingForm || $[39] !== updateForm) {
    t15 = async (formData) => {
      if (editingForm) {
        await updateForm(editingForm.id, formData);
      } else {
        await addForm(formData);
      }
    };
    $[37] = addForm;
    $[38] = editingForm;
    $[39] = updateForm;
    $[40] = t15;
  } else {
    t15 = $[40];
  }
  const handleFormSubmit = t15;
  let t16;
  if ($[41] === Symbol.for("react.memo_cache_sentinel")) {
    t16 = (form_1) => {
      setDeleteConfirm({
        id: form_1.id,
        name: form_1.name
      });
    };
    $[41] = t16;
  } else {
    t16 = $[41];
  }
  const handleDeleteForm = t16;
  let t17;
  if ($[42] !== deleteConfirm || $[43] !== deleteForm) {
    t17 = async () => {
      if (deleteConfirm) {
        await deleteForm(deleteConfirm.id);
        setDeleteConfirm(null);
      }
    };
    $[42] = deleteConfirm;
    $[43] = deleteForm;
    $[44] = t17;
  } else {
    t17 = $[44];
  }
  const confirmDelete = t17;
  let t18;
  if ($[45] === Symbol.for("react.memo_cache_sentinel")) {
    t18 = /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: CONFIG.style.title.className, children: "Formulare" });
    $[45] = t18;
  } else {
    t18 = $[45];
  }
  let t19;
  if ($[46] === Symbol.for("react.memo_cache_sentinel")) {
    t19 = /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 });
    $[46] = t19;
  } else {
    t19 = $[46];
  }
  let t20;
  if ($[47] !== handleAddForm || $[48] !== isLoading) {
    t20 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-8", children: [
      t18,
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleAddForm, variant: "primary", size: "md", className: "gap-2", disabled: isLoading, children: [
        t19,
        "Neues Formular"
      ] })
    ] });
    $[47] = handleAddForm;
    $[48] = isLoading;
    $[49] = t20;
  } else {
    t20 = $[49];
  }
  let t21;
  if ($[50] !== error) {
    t21 = error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-red-800 dark:text-red-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Error:" }),
      " ",
      error
    ] }) });
    $[50] = error;
    $[51] = t21;
  } else {
    t21 = $[51];
  }
  let t22;
  if ($[52] !== clearFilters || $[53] !== filterConfig.searchTerm || $[54] !== filterConfig.statusFilter || $[55] !== forms.length || $[56] !== setSearchTerm || $[57] !== setStatusFilter) {
    t22 = forms.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableFilter, { searchTerm: filterConfig.searchTerm, onSearchChange: setSearchTerm, placeholder: "Formulare durchsuchen...", statusFilter: filterConfig.statusFilter, onStatusFilterChange: setStatusFilter, statusOptions, onClear: clearFilters });
    $[52] = clearFilters;
    $[53] = filterConfig.searchTerm;
    $[54] = filterConfig.statusFilter;
    $[55] = forms.length;
    $[56] = setSearchTerm;
    $[57] = setStatusFilter;
    $[58] = t22;
  } else {
    t22 = $[58];
  }
  let t23;
  if ($[59] !== currentPage || $[60] !== displayedForms || $[61] !== forms.length || $[62] !== getSortDirection || $[63] !== handleAddForm || $[64] !== handleEditForm || $[65] !== isLoading || $[66] !== requestSort || $[67] !== showPagination || $[68] !== testRuns || $[69] !== toggleFormActive || $[70] !== totalFilteredItems || $[71] !== totalPages) {
    t23 = isLoading && forms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(FormsSkeleton, {}) : forms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "Noch keine Formulare konfiguriert." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAddForm, variant: "primary", size: "md", disabled: isLoading, children: "Erstes Formular hinzufügen" })
    ] }) }) }) : displayedForms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "Keine Formulare gefunden." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Versuche andere Suchbegriffe oder Filter." })
    ] }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("name"), onSort: () => requestSort("name"), children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("url"), onSort: () => requestSort("url"), children: "URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("hash"), onSort: () => requestSort("hash"), children: "Hash" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("isActive"), onSort: () => requestSort("isActive"), children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("createdAt"), onSort: () => requestSort("createdAt"), children: "Erstellt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-left", children: "Analyse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: displayedForms.map((form_2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { tabIndex: 0, role: "button", className: "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-inset", onClick: () => handleEditForm(form_2), onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleEditForm(form_2);
          }
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
            renderIcon(form_2.icon || "FileText", 16, "text-gray-500 dark:text-gray-400"),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm text-gray-900 dark:text-white", children: form_2.name })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: form_2.url, target: "_blank", rel: "noopener noreferrer", onClick: _temp2, className: "text-blue-600 dark:text-blue-400 underline hover:text-blue-900 dark:hover:text-blue-300 text-[10px] font-mono break-all truncate", children: form_2.url }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-[10px] text-gray-500 dark:text-gray-400 font-mono", children: form_2.hash || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e_1) => {
            e_1.stopPropagation();
            toggleFormActive(form_2.id);
          }, className: "border-none bg-transparent cursor-pointer p-0", disabled: isLoading, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: form_2.isActive ? "active" : "inactive", children: form_2.isActive ? "Aktiv" : "Inaktiv" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-[10px] text-gray-500 dark:text-gray-400 font-mono", children: formatDate(form_2.createdAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FormSparkline, { formId: form_2.id, testRuns }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right text-sm font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_2) => {
              e_2.stopPropagation();
              handleEditForm(form_2);
            }, variant: "ghost", size: "sm", disabled: isLoading, title: "Bearbeiten", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 16, className: "text-blue-600 dark:text-blue-400" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_3) => {
              e_3.stopPropagation();
              handleDeleteForm(form_2);
            }, variant: "ghost", size: "sm", disabled: isLoading, title: "Löschen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16, className: "text-red-600 dark:text-red-400" }) })
          ] }) })
        ] }, form_2.id)) })
      ] }),
      showPagination && /* @__PURE__ */ jsxRuntimeExports.jsx(TablePagination, { currentPage, totalPages, totalItems: totalFilteredItems, itemsPerPage: 50, onPageChange: setCurrentPage })
    ] });
    $[59] = currentPage;
    $[60] = displayedForms;
    $[61] = forms.length;
    $[62] = getSortDirection;
    $[63] = handleAddForm;
    $[64] = handleEditForm;
    $[65] = isLoading;
    $[66] = requestSort;
    $[67] = showPagination;
    $[68] = testRuns;
    $[69] = toggleFormActive;
    $[70] = totalFilteredItems;
    $[71] = totalPages;
    $[72] = t23;
  } else {
    t23 = $[72];
  }
  let t24;
  if ($[73] !== forms) {
    t24 = (id) => {
      const form_3 = forms.find((f_2) => f_2.id === id);
      if (form_3) {
        setDeleteConfirm({
          id,
          name: form_3.name
        });
      }
    };
    $[73] = forms;
    $[74] = t24;
  } else {
    t24 = $[74];
  }
  let t25;
  if ($[75] !== editingForm || $[76] !== handleCloseDialog || $[77] !== handleFormSubmit || $[78] !== isDialogOpen || $[79] !== isLoading || $[80] !== t24) {
    t25 = /* @__PURE__ */ jsxRuntimeExports.jsx(FormDrawer, { isOpen: isDialogOpen, onClose: handleCloseDialog, onSubmit: handleFormSubmit, editForm: editingForm, isLoading, onDelete: t24 });
    $[75] = editingForm;
    $[76] = handleCloseDialog;
    $[77] = handleFormSubmit;
    $[78] = isDialogOpen;
    $[79] = isLoading;
    $[80] = t24;
    $[81] = t25;
  } else {
    t25 = $[81];
  }
  const t26 = !!deleteConfirm;
  let t27;
  if ($[82] === Symbol.for("react.memo_cache_sentinel")) {
    t27 = () => setDeleteConfirm(null);
    $[82] = t27;
  } else {
    t27 = $[82];
  }
  const t28 = deleteConfirm?.name;
  let t29;
  if ($[83] !== confirmDelete || $[84] !== isLoading || $[85] !== t26 || $[86] !== t28) {
    t29 = /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: t26, onClose: t27, onConfirm: confirmDelete, title: "Formular löschen", message: "Sind Sie sicher, dass Sie dieses Formular löschen möchten? Alle zugehörigen Test-Ergebnisse werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.", itemName: t28, isLoading });
    $[83] = confirmDelete;
    $[84] = isLoading;
    $[85] = t26;
    $[86] = t28;
    $[87] = t29;
  } else {
    t29 = $[87];
  }
  let t30;
  if ($[88] !== t20 || $[89] !== t21 || $[90] !== t22 || $[91] !== t23 || $[92] !== t25 || $[93] !== t29) {
    t30 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      t20,
      t21,
      t22,
      t23,
      t25,
      t29
    ] });
    $[88] = t20;
    $[89] = t21;
    $[90] = t22;
    $[91] = t23;
    $[92] = t25;
    $[93] = t29;
    $[94] = t30;
  } else {
    t30 = $[94];
  }
  return t30;
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
function _temp2(e_0) {
  return e_0.stopPropagation();
}
export {
  Forms as default
};
