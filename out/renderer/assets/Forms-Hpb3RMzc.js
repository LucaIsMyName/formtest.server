import { r as reactExports, j as jsxRuntimeExports, B as Button, E as ExternalLink, k as Trash2, P as Play, L as Label, I as Input, l as Table, m as TableBody, n as TableRow, o as TableCell, p as StatusBadge, q as formatDate, s as renderIcon, t as Checkbox, v as ChevronUp, x as ChevronDown, y as Select, z as SelectTrigger, A as SelectValue, D as SelectContent, G as SelectItem, H as Plus, J as useSearchParams, b as useFormsStore, e as useTestRunsStore, K as TableHeader, M as TableHead, N as Pen, O as TablePagination, i as dist } from "./index-Dv3ACo-W.js";
import { C as CONFIG } from "./app.config-b2lfEN4K.js";
import { I as IconPicker, u as useSparklineData, M as MiniSparkline } from "./MiniSparkline-q7KuVRmK.js";
import { D as Drawer, a as DrawerContent, b as DrawerHeader, c as DrawerFooter, u as useTableSelection, d as useFilterableData, e as useSortableData, S as SelectionActionBar, f as computeIsPartialSelected, g as computeIsAllSelected, h as SortableTableHead } from "./useTableSelection-C2oY0UGu.js";
import { T as TableFilter, D as DeleteConfirmDialog } from "./TableFilter-9mgHt9i4.js";
import { S as Skeleton } from "./Skeleton-CGByWWzo.js";
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
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: () => {
          window.dispatchEvent(new CustomEvent("openTestDialog", {
            detail: {
              formIds: [editForm.id]
            }
          }));
          onClose();
        }, variant: "secondary", size: "sm", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 14 }),
          "Test starten"
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
    loadForms();
    loadTestRuns();
  }, [loadForms, loadTestRuns]);
  const {
    filteredItems: filteredForms,
    filterConfig,
    setSearchTerm,
    setStatusFilter,
    clearFilters
  } = useFilterableData(
    forms,
    ["name", "url"],
    {
      searchTerm: "",
      statusFilter: void 0
    },
    "forms"
    // localStorage key
  );
  const {
    sortedItems: sortedForms,
    requestSort,
    sortConfig,
    getSortDirection
  } = useSortableData(
    filteredForms,
    {
      key: "name",
      direction: "asc"
    },
    "forms"
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
  const displayedForms = reactExports.useMemo(() => {
    let filtered = sortedForms;
    if (filterConfig.statusFilter && filterConfig.statusFilter !== "all") {
      filtered = sortedForms.filter((f) => filterConfig.statusFilter === "active" ? f.isActive : !f.isActive);
    }
    if (filtered.length > 50) {
      const start = (currentPage - 1) * itemsPerPage;
      return filtered.slice(start, start + itemsPerPage);
    }
    return filtered;
  }, [sortedForms, filterConfig.statusFilter, currentPage, itemsPerPage]);
  const totalFilteredItems = reactExports.useMemo(() => {
    if (!filterConfig.statusFilter || filterConfig.statusFilter === "all") {
      return sortedForms.length;
    }
    return sortedForms.filter((f_0) => filterConfig.statusFilter === "active" ? f_0.isActive : !f_0.isActive).length;
  }, [sortedForms, filterConfig.statusFilter]);
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const showPagination = totalFilteredItems > 50;
  reactExports.useEffect(() => {
    setCurrentPage(1);
  }, [filterConfig.statusFilter, filterConfig.searchTerm, sortConfig.key, sortConfig.direction]);
  reactExports.useEffect(() => {
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
  }, [forms, searchParams]);
  const handleAddForm = () => {
    setEditingForm(null);
    setIsDialogOpen(true);
    setSearchParams({});
  };
  const handleEditForm = (form_0) => {
    setEditingForm(form_0);
    setIsDialogOpen(true);
    setSearchParams({
      id: String(form_0.id)
    });
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSearchParams({});
  };
  const handleFormSubmit = async (formData) => {
    if (editingForm) {
      await updateForm(editingForm.id, formData);
    } else {
      await addForm(formData);
    }
  };
  const handleDeleteForm = (form_1) => {
    setDeleteConfirm({
      id: form_1.id,
      name: form_1.name
    });
  };
  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteForm(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };
  const handleBulkDelete = async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;
    setIsBulkDeleting(true);
    try {
      for (const id of ids) {
        await deleteForm(id);
      }
      clearSelection();
      setShowBulkDeleteConfirm(false);
    } catch (error_0) {
      console.error("Failed to bulk delete forms:", error_0);
    } finally {
      setIsBulkDeleting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: CONFIG.style.title.className, children: "Formulare" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleAddForm, variant: "primary", size: "md", className: "gap-2", disabled: isLoading, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
        "Neues Formular"
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-red-800 dark:text-red-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Error:" }),
      " ",
      error
    ] }) }),
    forms.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableFilter, { searchTerm: filterConfig.searchTerm, onSearchChange: setSearchTerm, placeholder: "Formulare durchsuchen...", statusFilter: filterConfig.statusFilter, onStatusFilterChange: setStatusFilter, statusOptions, onClear: clearFilters, rightContent: selectedCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(SelectionActionBar, { selectedCount, onClear: clearSelection, actions: [{
      label: "Löschen",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }),
      onClick: () => setShowBulkDeleteConfirm(true),
      variant: "danger"
    }] }) : void 0 }),
    isLoading && forms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(FormsSkeleton, {}) : forms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "Noch keine Formulare konfiguriert." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAddForm, variant: "primary", size: "md", disabled: isLoading, children: "Erstes Formular hinzufügen" })
    ] }) }) }) : displayedForms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "Keine Formulare gefunden." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Versuche andere Suchbegriffe oder Filter." })
    ] }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-[40px] px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: computeIsAllSelected(displayedForms, selectedIds), indeterminate: computeIsPartialSelected(displayedForms, selectedIds), onCheckedChange: () => toggleAll(displayedForms), "aria-label": "Alle auswählen" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("name"), onSort: () => requestSort("name"), children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("url"), onSort: () => requestSort("url"), children: "URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("hash"), onSort: () => requestSort("hash"), children: "Hash" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("isActive"), onSort: () => requestSort("isActive"), children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("createdAt"), onSort: () => requestSort("createdAt"), children: "Erstellt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-left", children: "Analyse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: displayedForms.map((form_2) => {
          const isChecked = isSelected(form_2.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { tabIndex: 0, role: "button", className: `cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-inset ${isChecked ? "bg-blue-50 dark:bg-blue-900/20" : ""}`, onClick: () => handleEditForm(form_2), onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleEditForm(form_2);
            }
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", onClick: (e_0) => e_0.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: isChecked, onCheckedChange: () => toggleItem(form_2.id), "aria-label": `${form_2.name} auswählen` }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
              renderIcon(form_2.icon || "FileText", 16, "text-gray-500 dark:text-gray-400"),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm text-gray-900 dark:text-white", children: form_2.name })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: form_2.url, target: "_blank", rel: "noopener noreferrer", onClick: (e_1) => e_1.stopPropagation(), className: "text-blue-600 dark:text-blue-400 underline hover:text-blue-900 dark:hover:text-blue-300 text-[10px] font-mono break-all truncate", children: form_2.url }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-[10px] text-gray-500 dark:text-gray-400 font-mono", children: form_2.hash || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e_2) => {
              e_2.stopPropagation();
              toggleFormActive(form_2.id);
            }, className: "border-none bg-transparent cursor-pointer p-0", disabled: isLoading, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: form_2.isActive ? "active" : "inactive", children: form_2.isActive ? "Aktiv" : "Inaktiv" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-[10px] text-gray-500 dark:text-gray-400 font-mono", children: formatDate(form_2.createdAt) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FormSparkline, { formId: form_2.id, testRuns }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right text-sm font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_3) => {
                e_3.stopPropagation();
                window.dispatchEvent(new CustomEvent("openTestDialog", {
                  detail: {
                    formIds: [form_2.id]
                  }
                }));
              }, variant: "ghost", size: "sm", disabled: isLoading, title: "Test starten", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 16, className: "text-green-600 dark:text-green-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_4) => {
                e_4.stopPropagation();
                handleEditForm(form_2);
              }, variant: "ghost", size: "sm", disabled: isLoading, title: "Bearbeiten", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 16, className: "text-blue-600 dark:text-blue-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: (e_5) => {
                e_5.stopPropagation();
                handleDeleteForm(form_2);
              }, variant: "ghost", size: "sm", disabled: isLoading, title: "Löschen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16, className: "text-red-600 dark:text-red-400" }) })
            ] }) })
          ] }, form_2.id);
        }) })
      ] }),
      showPagination && /* @__PURE__ */ jsxRuntimeExports.jsx(TablePagination, { currentPage, totalPages, totalItems: totalFilteredItems, itemsPerPage, onPageChange: setCurrentPage })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FormDrawer, { isOpen: isDialogOpen, onClose: handleCloseDialog, onSubmit: handleFormSubmit, editForm: editingForm, isLoading, onDelete: (id_0) => {
      const form_3 = forms.find((f_2) => f_2.id === id_0);
      if (form_3) {
        setDeleteConfirm({
          id: id_0,
          name: form_3.name
        });
      }
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: !!deleteConfirm, onClose: () => setDeleteConfirm(null), onConfirm: confirmDelete, title: "Formular löschen", message: "Sind Sie sicher, dass Sie dieses Formular löschen möchten? Alle zugehörigen Test-Ergebnisse werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.", itemName: deleteConfirm?.name, isLoading }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: showBulkDeleteConfirm, onClose: () => setShowBulkDeleteConfirm(false), onConfirm: handleBulkDelete, title: "Formulare löschen", message: `Sind Sie sicher, dass Sie ${selectedCount} Formular(e) löschen möchten? Alle zugehörigen Test-Ergebnisse werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.`, itemName: `${selectedCount} ausgewählte Formulare`, isLoading: isBulkDeleting })
  ] });
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
export {
  Forms as default
};
