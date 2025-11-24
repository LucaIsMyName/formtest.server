import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { X, ChevronDown, Check } from "lucide-react";
import Button from "./ui/Button";
import IconPicker from "./IconPicker";
import { renderIcon, getDefaultScheduleIcon } from "../utils/iconHelper";
import { useFormsStore } from "../store/useFormsStore";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import { CONFIG } from "../app.config";
import { TestSchedule } from "../../../common/types";

interface ScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: { name: string; formId: number; paymentMethodId: number; cronExpression: string; isActive: boolean; icon?: string }) => Promise<void>;
  initialData?: TestSchedule;
  title: string;
}

const FREQUENCY_OPTIONS = [
  { label: "Jede Stunde", value: "0 0 * * * *" },
  { label: "Täglich um 09:00", value: "0 0 9 * * *" },
  { label: "Täglich um 12:00", value: "0 0 12 * * *" },
  { label: "Täglich um 18:00", value: "0 0 18 * * *" },
  { label: "Wöchentlich (Mo 09:00)", value: "0 0 9 * * 1" },
  { label: "Benutzerdefiniert", value: "custom" },
];

const ScheduleDialog: React.FC<ScheduleDialogProps> = ({ isOpen, onClose, onSave, initialData, title }) => {
  const { forms, loadForms } = useFormsStore();
  const { paymentMethods, loadPaymentMethods } = usePaymentMethodsStore();
  
  const [name, setName] = useState("");
  const [formId, setFormId] = useState<string>("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [frequency, setFrequency] = useState(FREQUENCY_OPTIONS[1].value);
  const [customCron, setCustomCron] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [icon, setIcon] = useState("Play");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadForms();
      loadPaymentMethods();
      if (initialData) {
        setName(initialData.name);
        setFormId(String(initialData.formId));
        setPaymentMethodId(String(initialData.paymentMethodId));
        setIsActive(initialData.isActive);
        setIcon(initialData.icon || getDefaultScheduleIcon(initialData.cronExpression));
        
        const knownFreq = FREQUENCY_OPTIONS.find(f => f.value === initialData.cronExpression);
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        icon,
      });
      onClose();
    } catch (err) {
      setError("Fehler beim Speichern des Zeitplans.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg focus:outline-none animate-scale-in border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={CONFIG.style.input.className}
                placeholder="z.B. Täglicher Health Check"
              />
            </div>

            {/* Form Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Formular
              </label>
              <Select.Root value={formId} onValueChange={setFormId}>
                <Select.Trigger className={CONFIG.style.select.trigger}>
                  <Select.Value placeholder="Formular auswählen" />
                  <Select.Icon>
                    <ChevronDown size={16} />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className={CONFIG.style.select.content}>
                    <Select.Viewport className="p-1">
                      {forms.map((form) => (
                        <Select.Item key={form.id} value={String(form.id)} className={CONFIG.style.select.item}>
                          <Select.ItemText>{form.name}</Select.ItemText>
                          <Select.ItemIndicator className="absolute left-2 flex items-center justify-center">
                            <Check size={16} />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bezahlmethode
              </label>
              <Select.Root value={paymentMethodId} onValueChange={setPaymentMethodId}>
                <Select.Trigger className={CONFIG.style.select.trigger}>
                  <Select.Value placeholder="Bezahlmethode auswählen" />
                  <Select.Icon>
                    <ChevronDown size={16} />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className={CONFIG.style.select.content}>
                    <Select.Viewport className="p-1">
                      {paymentMethods.map((pm) => (
                        <Select.Item key={pm.id} value={String(pm.id)} className={CONFIG.style.select.item}>
                          <Select.ItemText>{pm.name} ({pm.type})</Select.ItemText>
                          <Select.ItemIndicator className="absolute left-2 flex items-center justify-center">
                            <Check size={16} />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Frequency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Häufigkeit
              </label>
              <Select.Root value={frequency} onValueChange={setFrequency}>
                <Select.Trigger className={CONFIG.style.select.trigger}>
                  <Select.Value placeholder="Häufigkeit auswählen" />
                  <Select.Icon>
                    <ChevronDown size={16} />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className={CONFIG.style.select.content}>
                    <Select.Viewport className="p-1">
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <Select.Item key={opt.value} value={opt.value} className={CONFIG.style.select.item}>
                          <Select.ItemText>{opt.label}</Select.ItemText>
                          <Select.ItemIndicator className="absolute left-2 flex items-center justify-center">
                            <Check size={16} />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Custom Cron Input */}
            {frequency === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cron Ausdruck
                </label>
                <input
                  type="text"
                  value={customCron}
                  onChange={(e) => setCustomCron(e.target.value)}
                  className={CONFIG.style.input.className}
                  placeholder="* * * * * *"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: Sekunde Minute Stunde Tag Monat Wochentag
                </p>
              </div>
            )}

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Icon
              </label>
              <button
                type="button"
                onClick={() => setShowIconPicker(true)}
                disabled={isSubmitting}
                className="flex items-center gap-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-start">
                {renderIcon(icon, 20, "text-blue-600 dark:text-blue-400")}
                <span className="text-sm text-gray-700 dark:text-gray-300">{icon}</span>
              </button>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300 select-none">
                Zeitplan aktiv
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}>
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                isLoading={isSubmitting}>
                Speichern
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
      
      {showIconPicker && (
        <IconPicker
          value={icon}
          onChange={(selectedIcon) => {
            setIcon(selectedIcon);
            setShowIconPicker(false);
          }}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </Dialog.Root>
  );
};

export default ScheduleDialog;
