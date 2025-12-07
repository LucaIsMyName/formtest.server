import { b as useFormsStore, d as usePaymentMethodsStore, r as reactExports, au as getDefaultScheduleIcon, j as jsxRuntimeExports, B as Button, P as Play, k as Trash2, L as Label, I as Input, l as Table, m as TableBody, n as TableRow, o as TableCell, p as StatusBadge, ao as formatDateTime, y as Select, z as SelectTrigger, A as SelectValue, D as SelectContent, G as SelectItem, s as renderIcon, t as Checkbox, av as useSchedulesStore, e as useTestRunsStore, H as Plus, K as TableHeader, M as TableHead, ae as LoaderCircle, N as Pen, O as TablePagination, i as dist } from "./index-DzJQkFUp.js";
import { C as CONFIG } from "./app.config-b2lfEN4K.js";
import { D as Drawer, a as DrawerContent, b as DrawerHeader, c as DrawerFooter, u as useTableSelection, d as useFilterableData, e as useSortableData, S as SelectionActionBar, f as computeIsPartialSelected, g as computeIsAllSelected, h as SortableTableHead } from "./useTableSelection-DvrD0Ws3.js";
import { T as TableFilter, D as DeleteConfirmDialog } from "./TableFilter-CT2F7wj8.js";
import { S as Skeleton } from "./Skeleton-CKxsIkDq.js";
import { I as IconPicker, u as useSparklineData, M as MiniSparkline } from "./MiniSparkline-8nKLp5MJ.js";
const FREQUENCY_OPTIONS = [
  // Frequent intervals
  {
    label: "Alle 5 Minuten",
    value: "0 */5 * * * *"
  },
  {
    label: "Alle 15 Minuten",
    value: "0 */15 * * * *"
  },
  {
    label: "Alle 30 Minuten",
    value: "0 */30 * * * *"
  },
  {
    label: "Jede Stunde",
    value: "0 0 * * * *"
  },
  {
    label: "Alle 2 Stunden",
    value: "0 0 */2 * * *"
  },
  {
    label: "Alle 4 Stunden",
    value: "0 0 */4 * * *"
  },
  {
    label: "Alle 6 Stunden",
    value: "0 0 */6 * * *"
  },
  {
    label: "Alle 12 Stunden",
    value: "0 0 */12 * * *"
  },
  // Daily schedules - Morning
  {
    label: "Täglich um 06:00",
    value: "0 0 6 * * *"
  },
  {
    label: "Täglich um 07:00",
    value: "0 0 7 * * *"
  },
  {
    label: "Täglich um 08:00",
    value: "0 0 8 * * *"
  },
  {
    label: "Täglich um 09:00",
    value: "0 0 9 * * *"
  },
  {
    label: "Täglich um 10:00",
    value: "0 0 10 * * *"
  },
  // Daily schedules - Afternoon
  {
    label: "Täglich um 12:00",
    value: "0 0 12 * * *"
  },
  {
    label: "Täglich um 14:00",
    value: "0 0 14 * * *"
  },
  {
    label: "Täglich um 15:00",
    value: "0 0 15 * * *"
  },
  {
    label: "Täglich um 16:00",
    value: "0 0 16 * * *"
  },
  {
    label: "Täglich um 17:00",
    value: "0 0 17 * * *"
  },
  // Daily schedules - Evening
  {
    label: "Täglich um 18:00",
    value: "0 0 18 * * *"
  },
  {
    label: "Täglich um 19:00",
    value: "0 0 19 * * *"
  },
  {
    label: "Täglich um 20:00",
    value: "0 0 20 * * *"
  },
  {
    label: "Täglich um 21:00",
    value: "0 0 21 * * *"
  },
  {
    label: "Täglich um 22:00",
    value: "0 0 22 * * *"
  },
  // Weekly schedules
  {
    label: "Montags um 09:00",
    value: "0 0 9 * * 1"
  },
  {
    label: "Dienstags um 09:00",
    value: "0 0 9 * * 2"
  },
  {
    label: "Mittwochs um 09:00",
    value: "0 0 9 * * 3"
  },
  {
    label: "Donnerstags um 09:00",
    value: "0 0 9 * * 4"
  },
  {
    label: "Freitags um 09:00",
    value: "0 0 9 * * 5"
  },
  {
    label: "Samstags um 09:00",
    value: "0 0 9 * * 6"
  },
  {
    label: "Sonntags um 09:00",
    value: "0 0 9 * * 0"
  },
  // Workday schedules
  {
    label: "Werktags um 08:00",
    value: "0 0 8 * * 1-5"
  },
  {
    label: "Werktags um 12:00",
    value: "0 0 12 * * 1-5"
  },
  {
    label: "Werktags um 17:00",
    value: "0 0 17 * * 1-5"
  },
  // Weekend schedules
  {
    label: "Wochenende um 10:00",
    value: "0 0 10 * * 0,6"
  },
  {
    label: "Wochenende um 14:00",
    value: "0 0 14 * * 0,6"
  },
  // Monthly schedules
  {
    label: "Monatlich am 1. um 09:00",
    value: "0 0 9 1 * *"
  },
  {
    label: "Monatlich am 15. um 09:00",
    value: "0 0 9 15 * *"
  },
  {
    label: "Monatlich am letzten Tag um 09:00",
    value: "0 0 9 L * *"
  },
  // Multiple times per day
  {
    label: "3x täglich (08:00, 14:00, 20:00)",
    value: "0 0 8,14,20 * * *"
  },
  {
    label: "2x täglich (09:00, 18:00)",
    value: "0 0 9,18 * * *"
  },
  {
    label: "4x täglich (06:00, 12:00, 18:00, 23:00)",
    value: "0 0 6,12,18,23 * * *"
  },
  // Custom option at the end
  {
    label: "Benutzerdefiniert",
    value: "custom"
  }
];
const ScheduleDrawer = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  onDelete,
  onRunNow
}) => {
  const {
    forms,
    loadForms
  } = useFormsStore();
  const {
    paymentMethods,
    loadPaymentMethods
  } = usePaymentMethodsStore();
  const [name, setName] = reactExports.useState("");
  const [formId, setFormId] = reactExports.useState("");
  const [paymentMethodId, setPaymentMethodId] = reactExports.useState("");
  const [frequency, setFrequency] = reactExports.useState(FREQUENCY_OPTIONS[1].value);
  const [customCron, setCustomCron] = reactExports.useState("");
  const [isActive, setIsActive] = reactExports.useState(true);
  const [icon, setIcon] = reactExports.useState("Play");
  const [showIconPicker, setShowIconPicker] = reactExports.useState(false);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (isOpen) {
      loadForms();
      loadPaymentMethods();
      if (initialData) {
        setName(initialData.name);
        setFormId(String(initialData.formId));
        setPaymentMethodId(String(initialData.paymentMethodId));
        setIsActive(initialData.isActive);
        setIcon(initialData.icon || getDefaultScheduleIcon(initialData.cronExpression));
        const knownFreq = FREQUENCY_OPTIONS.find((f) => f.value === initialData.cronExpression);
        if (knownFreq) {
          setFrequency(knownFreq.value);
          setCustomCron("");
        } else {
          setFrequency("custom");
          setCustomCron(initialData.cronExpression);
        }
      } else {
        setName("");
        setFormId("");
        setPaymentMethodId("");
        setFrequency(FREQUENCY_OPTIONS[1].value);
        setCustomCron("");
        setIsActive(true);
        setIcon("Play");
      }
      setError(null);
    }
  }, [isOpen, initialData, loadForms, loadPaymentMethods]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name || !formId || !paymentMethodId) {
      setError("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }
    const cronExpression = frequency === "custom" ? customCron : frequency;
    if (!cronExpression) {
      setError("Bitte geben Sie einen Cron-Ausdruck an.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        name,
        formId: parseInt(formId),
        paymentMethodId: parseInt(paymentMethodId),
        cronExpression,
        isActive,
        icon
      });
      onClose();
    } catch (err) {
      setError("Fehler beim Speichern des Zeitplans.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Drawer, { open: isOpen, onOpenChange: (open) => !open && onClose(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: " gap-4 pb-4 flex-shrink-0", children: [
        initialData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4 flex-shrink-0", children: [
          onRunNow && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: () => {
            onRunNow(initialData.id);
            onClose();
          }, variant: "primary", size: "sm", className: "gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 14 }),
            "Jetzt ausführen"
          ] }),
          onDelete && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: () => {
            onDelete(initialData.id);
            onClose();
          }, variant: "danger", size: "sm", className: "gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }),
            "Löschen"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 h-12", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", className: "sr-only", children: "Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "name", type: "text", value: name, onChange: (e_0) => setName(e_0.target.value), placeholder: "Autopilot Name", className: `${CONFIG.style.title.className} h-16`, disabled: isSubmitting })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerHeader, { className: "pt-6" }),
      initialData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 pb-6 border-b dark:border-gray-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-3", children: "Autopilot Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 w-[120px] bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs font-mono bg-gray-100 dark:bg-gray-900/50 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700", children: initialData.id }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: initialData.isActive ? "active" : "inactive" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Formular" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white", children: forms.find((f_0) => f_0.id === initialData.formId)?.name || `ID: ${initialData.formId}` })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Bezahlmethode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white", children: paymentMethods.find((p) => p.id === initialData.paymentMethodId)?.name || `ID: ${initialData.paymentMethodId}` })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Zeitplan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs font-mono bg-gray-100 dark:bg-gray-900/50 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700", children: initialData.cronExpression }) })
          ] }),
          initialData.lastRun && /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Letzter Lauf" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white font-mono", children: formatDateTime(initialData.lastRun) })
          ] }),
          initialData.nextRun && /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Nächster Lauf" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 text-sm text-gray-900 dark:text-white font-mono", children: formatDateTime(initialData.nextRun) })
          ] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-200 rounded-md", children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-3", children: "Autopilot Einstellungen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 w-[120px] bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400 align-top pt-3", children: "Formular *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: formId, onValueChange: setFormId, disabled: isSubmitting, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "formId", className: "text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Formular auswählen" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: forms.map((form) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(form.id), children: form.name }, form.id)) })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400 align-top pt-3", children: "Bezahlmethode *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: paymentMethodId, onValueChange: setPaymentMethodId, disabled: isSubmitting, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "paymentMethodId", className: "text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Bezahlmethode auswählen" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: paymentMethods.map((pm) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(pm.id), children: [
                  pm.name,
                  " (",
                  pm.type,
                  ")"
                ] }, pm.id)) })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400 align-top pt-3", children: "Häufigkeit *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: frequency, onValueChange: setFrequency, disabled: isSubmitting, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "frequency", className: "text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Häufigkeit auswählen" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FREQUENCY_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value)) })
              ] }) })
            ] }),
            frequency === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400 align-top pt-3", children: "Cron *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "px-3 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "customCron", type: "text", value: customCron, onChange: (e_1) => setCustomCron(e_1.target.value), placeholder: "* * * * * *", disabled: isSubmitting, className: "text-sm" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Format: Sekunde Minute Stunde Tag Monat Wochentag" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400 align-top pt-3", children: "Icon" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowIconPicker(true), disabled: isSubmitting, className: "flex items-center gap-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-start", children: [
                renderIcon(icon, 18, "text-blue-600 dark:text-blue-400"),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: icon })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "isActive", checked: isActive, onCheckedChange: (checked) => setIsActive(checked === true), disabled: isSubmitting }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "isActive", className: "text-sm text-gray-600 dark:text-gray-400 font-normal cursor-pointer", children: "Zeitplan aktiv" })
              ] }) })
            ] })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerFooter, { className: "pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", onClick: onClose, disabled: isSubmitting, children: "Abbrechen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: isSubmitting, isLoading: isSubmitting, children: "Speichern" })
        ] })
      ] })
    ] }),
    showIconPicker && /* @__PURE__ */ jsxRuntimeExports.jsx(IconPicker, { value: icon, onChange: (selectedIcon) => {
      setIcon(selectedIcon);
      setShowIconPicker(false);
    }, onClose: () => setShowIconPicker(false) })
  ] });
};
const ScheduleSparkline = (t0) => {
  const $ = dist.c(5);
  const {
    scheduleId,
    formId,
    paymentMethodId,
    testRuns
  } = t0;
  let t1;
  if ($[0] !== formId || $[1] !== paymentMethodId) {
    t1 = {
      formId,
      paymentMethodId
    };
    $[0] = formId;
    $[1] = paymentMethodId;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const sparklineData = useSparklineData(testRuns, "schedule", scheduleId, t1);
  let t2;
  if ($[3] !== sparklineData) {
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx(MiniSparkline, { data: sparklineData });
    $[3] = sparklineData;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  return t2;
};
const Schedules = () => {
  const {
    schedules,
    loadSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    runScheduleNow,
    isLoading,
    error
  } = useSchedulesStore();
  const {
    forms,
    loadForms
  } = useFormsStore();
  const {
    paymentMethods,
    loadPaymentMethods
  } = usePaymentMethodsStore();
  const {
    testRuns,
    loadTestRuns
  } = useTestRunsStore();
  const [isCreateOpen, setIsCreateOpen] = reactExports.useState(false);
  const [editingSchedule, setEditingSchedule] = reactExports.useState(void 0);
  const [deletingSchedule, setDeletingSchedule] = reactExports.useState(null);
  const [runningSchedules, setRunningSchedules] = reactExports.useState(/* @__PURE__ */ new Set());
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const itemsPerPage = 50;
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
    loadSchedules();
    loadForms();
    loadPaymentMethods();
    loadTestRuns();
  }, [loadSchedules, loadForms, loadPaymentMethods, loadTestRuns]);
  const getFormName = (id) => forms.find((f) => f.id === id)?.name || `Form #${id}`;
  const getPaymentMethodName = (id_0) => paymentMethods.find((pm) => pm.id === id_0)?.name || `PM #${id_0}`;
  const enrichedSchedules = reactExports.useMemo(() => {
    return schedules.map((schedule) => {
      const formName = getFormName(schedule.formId);
      const paymentMethodName = getPaymentMethodName(schedule.paymentMethodId);
      return {
        ...schedule,
        formName,
        paymentMethodName,
        configuration: `${formName} × ${paymentMethodName}`
      };
    });
  }, [schedules, forms, paymentMethods]);
  const {
    filteredItems,
    filterConfig,
    setSearchTerm,
    setStatusFilter,
    clearFilters
  } = useFilterableData(enrichedSchedules, ["name", "configuration", "cronExpression", "formName", "paymentMethodName"], {
    searchTerm: "",
    statusFilter: void 0
  }, "schedules");
  const {
    sortedItems,
    requestSort,
    getSortDirection
  } = useSortableData(filteredItems, {
    key: null,
    direction: null
  }, "schedules");
  const totalItems = sortedItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const showPagination = totalItems > 50;
  const displayedSchedules = reactExports.useMemo(() => {
    if (totalItems > 50) {
      const start = (currentPage - 1) * itemsPerPage;
      return sortedItems.slice(start, start + itemsPerPage);
    }
    return sortedItems;
  }, [sortedItems, currentPage, itemsPerPage, totalItems]);
  reactExports.useEffect(() => {
    setCurrentPage(1);
  }, [filterConfig]);
  const handleSave = async (data) => {
    if (editingSchedule) {
      await updateSchedule(editingSchedule.id, data);
    } else {
      await createSchedule(data);
    }
    setEditingSchedule(void 0);
    setIsCreateOpen(false);
  };
  const handleRunNow = async (id_1) => {
    setRunningSchedules((prev) => {
      const next = new Set(prev);
      next.add(id_1);
      return next;
    });
    try {
      await runScheduleNow(id_1);
    } catch (error_0) {
      console.error("Failed to run schedule:", error_0);
    } finally {
      setTimeout(() => {
        setRunningSchedules((prev) => {
          const next = new Set(prev);
          next.delete(id_1);
          return next;
        });
      }, 1e3);
    }
  };
  const handleBulkDelete = async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;
    const deletedCount = ids.length;
    setIsBulkDeleting(true);
    try {
      for (const id_2 of ids) {
        await deleteSchedule(id_2);
      }
      clearSelection();
      setShowBulkDeleteConfirm(false);
      const remainingItems = totalItems - deletedCount;
      if (remainingItems > 0) {
        const newTotalPages = Math.ceil(remainingItems / itemsPerPage);
        if (currentPage > newTotalPages) {
          setCurrentPage(Math.max(1, newTotalPages));
        }
      }
    } catch (error_1) {
      console.error("Failed to bulk delete schedules:", error_1);
    } finally {
      setIsBulkDeleting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: CONFIG.style.title.className, children: "Autopilot" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setIsCreateOpen(true), className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
        "Neuer Autopilot"
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md border border-red-200 dark:border-red-800", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableFilter, { searchTerm: filterConfig.searchTerm, onSearchChange: setSearchTerm, placeholder: "Autopilot suchen...", statusFilter: filterConfig.statusFilter, onStatusFilterChange: setStatusFilter, statusOptions: [{
      value: "active",
      label: "Aktiv"
    }, {
      value: "inactive",
      label: "Inaktiv"
    }], onClear: clearFilters, rightContent: selectedCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(SelectionActionBar, { selectedCount, onClear: clearSelection, actions: [{
      label: "Löschen",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }),
      onClick: () => setShowBulkDeleteConfirm(true),
      variant: "danger"
    }] }) : void 0 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm overflow-hidden", children: isLoading && schedules.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 space-y-4", children: [...Array(3)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) }) : enrichedSchedules.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-12 text-center text-gray-500 dark:text-gray-400", children: "Keine Zeitpläne vorhanden. Erstellen Sie einen neuen Zeitplan, um Tests automatisch auszuführen." }) : displayedSchedules.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-12 text-center text-gray-500 dark:text-gray-400", children: "Keine Ergebnisse für die aktuelle Filterung." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-[40px] px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: computeIsAllSelected(displayedSchedules, selectedIds), indeterminate: computeIsPartialSelected(displayedSchedules, selectedIds), onCheckedChange: () => toggleAll(displayedSchedules), "aria-label": "Alle auswählen" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("name"), onSort: () => requestSort("name"), children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("formName"), onSort: () => requestSort("formName"), children: "Formular" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("paymentMethodName"), onSort: () => requestSort("paymentMethodName"), children: "Bezahlmethode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("cronExpression"), onSort: () => requestSort("cronExpression"), children: "Cron" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("lastRun"), onSort: () => requestSort("lastRun"), children: "Ausgeführt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { sortDirection: getSortDirection("isActive"), onSort: () => requestSort("isActive"), children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { className: "text-left", children: "Analyse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SortableTableHead, { className: "", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "!text-right block", children: "Aktionen" }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: displayedSchedules.map((schedule_0) => {
          const isChecked = isSelected(schedule_0.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { tabIndex: 0, role: "button", className: `cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 align-middle focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-inset ${isChecked ? "bg-blue-50 dark:bg-blue-900/20" : ""}`, onClick: () => setEditingSchedule(schedule_0), onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setEditingSchedule(schedule_0);
            }
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4", onClick: (e_0) => e_0.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: isChecked, onCheckedChange: () => toggleItem(schedule_0.id), "aria-label": `${schedule_0.name} auswählen` }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              renderIcon(schedule_0.icon || "Play", 16, "text-gray-600 dark:text-gray-400"),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900 dark:text-white", children: schedule_0.name })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-600 dark:text-gray-300", children: getFormName(schedule_0.formId) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-600 dark:text-gray-300", children: getPaymentMethodName(schedule_0.paymentMethodId) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "min-w-[160px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "w-full px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600", children: schedule_0.cronExpression }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono text-gray-500 dark:text-gray-400", children: formatDateTime(schedule_0.lastRun) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "w-[120px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: schedule_0.isActive ? "active" : "inactive", children: schedule_0.isActive ? "Aktiv" : "Inaktiv" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleSparkline, { scheduleId: schedule_0.id, formId: schedule_0.formId, paymentMethodId: schedule_0.paymentMethodId, testRuns }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: (e_1) => {
                e_1.stopPropagation();
                handleRunNow(schedule_0.id);
              }, disabled: runningSchedules.has(schedule_0.id), title: "Jetzt ausführen", children: runningSchedules.has(schedule_0.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "text-green-600 dark:text-green-400 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 16, className: "text-green-600 dark:text-green-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: (e_2) => {
                e_2.stopPropagation();
                setEditingSchedule(schedule_0);
              }, title: "Bearbeiten", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 16, className: "text-blue-600 dark:text-blue-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: (e_3) => {
                e_3.stopPropagation();
                setDeletingSchedule(schedule_0);
              }, title: "Löschen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16, className: "text-red-600 dark:text-red-400" }) })
            ] }) })
          ] }, schedule_0.id);
        }) })
      ] }),
      showPagination && /* @__PURE__ */ jsxRuntimeExports.jsx(TablePagination, { currentPage, totalPages, totalItems, itemsPerPage, onPageChange: setCurrentPage })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleDrawer, { isOpen: isCreateOpen || !!editingSchedule, onClose: () => {
      setIsCreateOpen(false);
      setEditingSchedule(void 0);
    }, onSave: handleSave, initialData: editingSchedule, title: editingSchedule ? "Autopilot bearbeiten" : "Neuer Autopilot", onDelete: (id_3) => {
      const schedule_1 = schedules.find((s) => s.id === id_3);
      if (schedule_1) {
        setDeletingSchedule(schedule_1);
      }
    }, onRunNow: async (id_4) => {
      await runScheduleNow(id_4);
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: !!deletingSchedule, onClose: () => setDeletingSchedule(null), onConfirm: async () => {
      if (deletingSchedule) {
        await deleteSchedule(deletingSchedule.id);
        setDeletingSchedule(null);
      }
    }, title: "Zeitplan löschen", message: `Sind Sie sicher, dass Sie den Zeitplan "${deletingSchedule?.name}" löschen möchten?`, itemName: deletingSchedule?.name, isLoading }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: showBulkDeleteConfirm, onClose: () => setShowBulkDeleteConfirm(false), onConfirm: handleBulkDelete, title: "Autopilots löschen", message: `Sind Sie sicher, dass Sie ${selectedCount} Autopilot(s) löschen möchten?`, itemName: `${selectedCount} ausgewählte Autopilots`, isLoading: isBulkDeleting })
  ] });
};
export {
  Schedules as default
};
