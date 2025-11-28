import { U as create, b as useFormsStore, d as usePaymentMethodsStore, r as reactExports, j as jsxRuntimeExports, L as Label, k as Checkbox, B as Button, K as formatDateTime, V as LoaderCircle, J as Play } from "./index-kyJHC7IM.js";
import { C as CONFIG } from "./app.config-Cedwjkbe.js";
import { I as Input, S as Select, b as SelectTrigger, c as SelectValue, d as SelectContent, e as SelectItem, f as StatusBadge, D as DeleteConfirmDialog } from "./Badge-DCzudrr4.js";
import { D as Drawer, a as DrawerContent, b as DrawerHeader, c as DrawerTitle, d as DrawerFooter, e as Table, f as TableHeader, g as TableRow, h as TableHead, i as TableBody, j as TableCell, T as Trash2 } from "./Table-2nnPU_SM.js";
import { S as Skeleton } from "./Skeleton-Tcw_7FCV.js";
import { b as getDefaultScheduleIcon, r as renderIcon, I as IconPicker, P as Plus, a as Pen } from "./IconPicker-DOfPw_Fj.js";
import "./upload-DUtD1LCw.js";
const useSchedulesStore = create((set, get) => ({
  schedules: [],
  isLoading: false,
  error: null,
  loadSchedules: async () => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const schedules = await window.api.testSchedules.getAll();
      set({
        schedules,
        isLoading: false
      });
    } catch (error) {
      set({
        error: "Failed to load schedules",
        isLoading: false
      });
    }
  },
  createSchedule: async (schedule) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      await window.api.testSchedules.create(schedule);
      await get().loadSchedules();
    } catch (error) {
      set({
        error: "Failed to create schedule",
        isLoading: false
      });
      throw error;
    }
  },
  updateSchedule: async (id, schedule) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      await window.api.testSchedules.update(id, schedule);
      await get().loadSchedules();
    } catch (error) {
      set({
        error: "Failed to update schedule",
        isLoading: false
      });
      throw error;
    }
  },
  deleteSchedule: async (id) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      await window.api.testSchedules.delete(id);
      await get().loadSchedules();
    } catch (error) {
      set({
        error: "Failed to delete schedule",
        isLoading: false
      });
      throw error;
    }
  },
  runScheduleNow: async (id) => {
    try {
      await window.api.testSchedules.runNow(id);
      setTimeout(() => {
        get().loadSchedules();
      }, 500);
    } catch (error) {
      console.error("Failed to run schedule now:", error);
      throw error;
    }
  }
}));
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
  title
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerHeader, { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerTitle, { children: title }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-200 rounded-md", children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "name", children: "Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "name", type: "text", value: name, onChange: (e_0) => setName(e_0.target.value), placeholder: "z.B. Täglicher Health Check", disabled: isSubmitting })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "formId", children: "Formular *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: formId, onValueChange: setFormId, disabled: isSubmitting, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "formId", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Formular auswählen" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: forms.map((form) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(form.id), children: form.name }, form.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "paymentMethodId", children: "Bezahlmethode *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: paymentMethodId, onValueChange: setPaymentMethodId, disabled: isSubmitting, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "paymentMethodId", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Bezahlmethode auswählen" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: paymentMethods.map((pm) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(pm.id), children: [
              pm.name,
              " (",
              pm.type,
              ")"
            ] }, pm.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "frequency", children: "Häufigkeit *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: frequency, onValueChange: setFrequency, disabled: isSubmitting, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "frequency", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Häufigkeit auswählen" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FREQUENCY_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value)) })
          ] })
        ] }),
        frequency === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "customCron", children: "Cron Ausdruck *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "customCron", type: "text", value: customCron, onChange: (e_1) => setCustomCron(e_1.target.value), placeholder: "* * * * * *", disabled: isSubmitting }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Format: Sekunde Minute Stunde Tag Monat Wochentag" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-gray-600 dark:text-gray-400", htmlFor: "icon", children: "Icon" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowIconPicker(true), disabled: isSubmitting, className: "flex items-center gap-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-start", children: [
            renderIcon(icon, 20, "text-blue-600 dark:text-blue-400"),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: icon })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "isActive", checked: isActive, onCheckedChange: (checked) => setIsActive(checked === true), disabled: isSubmitting }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "isActive", className: "text-gray-600 dark:text-gray-400 font-normal cursor-pointer", children: "Zeitplan aktiv" })
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
  const [isCreateOpen, setIsCreateOpen] = reactExports.useState(false);
  const [editingSchedule, setEditingSchedule] = reactExports.useState(void 0);
  const [deletingSchedule, setDeletingSchedule] = reactExports.useState(null);
  const [runningSchedules, setRunningSchedules] = reactExports.useState(/* @__PURE__ */ new Set());
  reactExports.useEffect(() => {
    loadSchedules();
    loadForms();
    loadPaymentMethods();
  }, [loadSchedules, loadForms, loadPaymentMethods]);
  const getFormName = (id) => forms.find((f) => f.id === id)?.name || `Form #${id}`;
  const getPaymentMethodName = (id_0) => paymentMethods.find((pm) => pm.id === id_0)?.name || `PM #${id_0}`;
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: CONFIG.style.title.className, children: "Autopilot" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setIsCreateOpen(true), className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
        "Neuer Autopilot"
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md border border-red-200 dark:border-red-800", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden", children: isLoading && schedules.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 space-y-4", children: [...Array(3)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) }) : schedules.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-12 text-center text-gray-500 dark:text-gray-400", children: "Keine Zeitpläne vorhanden. Erstellen Sie einen neuen Zeitplan, um Tests automatisch auszuführen." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-12" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Konfiguration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cron" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Ausgeführt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: schedules.map((schedule) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50", onClick: () => setEditingSchedule(schedule), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center", children: renderIcon(schedule.icon || "Play", 16, "text-gray-600 dark:text-gray-400") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-xs text-gray-900 dark:text-white", children: schedule.name }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-600 dark:text-gray-300", children: [
          getFormName(schedule.formId),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 text-gray-400", children: "×" }),
          getPaymentMethodName(schedule.paymentMethodId)
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[11px] font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600", children: schedule.cronExpression }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-mono text-gray-500 dark:text-gray-400", children: formatDateTime(schedule.lastRun) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: schedule.isActive ? "active" : "inactive", children: schedule.isActive ? "Aktiv" : "Inaktiv" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => {
            e.stopPropagation();
            handleRunNow(schedule.id);
          }, disabled: runningSchedules.has(schedule.id), title: "Jetzt ausführen", children: runningSchedules.has(schedule.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "text-green-600 dark:text-green-400 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 16, className: "text-green-600 dark:text-green-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: (e_0) => {
            e_0.stopPropagation();
            setEditingSchedule(schedule);
          }, title: "Bearbeiten", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 16, className: "text-blue-600 dark:text-blue-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: (e_1) => {
            e_1.stopPropagation();
            setDeletingSchedule(schedule);
          }, title: "Löschen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16, className: "text-red-600 dark:text-red-400" }) })
        ] }) })
      ] }, schedule.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleDrawer, { isOpen: isCreateOpen || !!editingSchedule, onClose: () => {
      setIsCreateOpen(false);
      setEditingSchedule(void 0);
    }, onSave: handleSave, initialData: editingSchedule, title: editingSchedule ? "Zeitplan bearbeiten" : "Neuer Zeitplan" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmDialog, { isOpen: !!deletingSchedule, onClose: () => setDeletingSchedule(null), onConfirm: async () => {
      if (deletingSchedule) {
        await deleteSchedule(deletingSchedule.id);
        setDeletingSchedule(null);
      }
    }, title: "Zeitplan löschen", message: `Sind Sie sicher, dass Sie den Zeitplan "${deletingSchedule?.name}" löschen möchten?`, itemName: deletingSchedule?.name, isLoading })
  ] });
};
export {
  Schedules as default
};
