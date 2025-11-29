import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import IconPicker from "./IconPicker";
import { renderIcon, getDefaultScheduleIcon } from "../utils/iconHelper";
import { useFormsStore } from "../store/useFormsStore";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import { TestSchedule } from "../../../common/types";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "./ui/Drawer";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Checkbox } from "./ui/Checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { Trash2, Play } from "lucide-react";
import { CONFIG } from "../app.config";

interface ScheduleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: { name: string; formId: number; paymentMethodId: number; cronExpression: string; isActive: boolean; icon?: string }) => Promise<void>;
  initialData?: TestSchedule;
  title: string;
  onDelete?: (id: number) => void;
  onRunNow?: (id: number) => void;
}

const FREQUENCY_OPTIONS = [
  // Frequent intervals
  { label: "Alle 5 Minuten", value: "0 */5 * * * *" },
  { label: "Alle 15 Minuten", value: "0 */15 * * * *" },
  { label: "Alle 30 Minuten", value: "0 */30 * * * *" },
  { label: "Jede Stunde", value: "0 0 * * * *" },
  { label: "Alle 2 Stunden", value: "0 0 */2 * * *" },
  { label: "Alle 4 Stunden", value: "0 0 */4 * * *" },
  { label: "Alle 6 Stunden", value: "0 0 */6 * * *" },
  { label: "Alle 12 Stunden", value: "0 0 */12 * * *" },

  // Daily schedules - Morning
  { label: "Täglich um 06:00", value: "0 0 6 * * *" },
  { label: "Täglich um 07:00", value: "0 0 7 * * *" },
  { label: "Täglich um 08:00", value: "0 0 8 * * *" },
  { label: "Täglich um 09:00", value: "0 0 9 * * *" },
  { label: "Täglich um 10:00", value: "0 0 10 * * *" },

  // Daily schedules - Afternoon
  { label: "Täglich um 12:00", value: "0 0 12 * * *" },
  { label: "Täglich um 14:00", value: "0 0 14 * * *" },
  { label: "Täglich um 15:00", value: "0 0 15 * * *" },
  { label: "Täglich um 16:00", value: "0 0 16 * * *" },
  { label: "Täglich um 17:00", value: "0 0 17 * * *" },

  // Daily schedules - Evening
  { label: "Täglich um 18:00", value: "0 0 18 * * *" },
  { label: "Täglich um 19:00", value: "0 0 19 * * *" },
  { label: "Täglich um 20:00", value: "0 0 20 * * *" },
  { label: "Täglich um 21:00", value: "0 0 21 * * *" },
  { label: "Täglich um 22:00", value: "0 0 22 * * *" },

  // Weekly schedules
  { label: "Montags um 09:00", value: "0 0 9 * * 1" },
  { label: "Dienstags um 09:00", value: "0 0 9 * * 2" },
  { label: "Mittwochs um 09:00", value: "0 0 9 * * 3" },
  { label: "Donnerstags um 09:00", value: "0 0 9 * * 4" },
  { label: "Freitags um 09:00", value: "0 0 9 * * 5" },
  { label: "Samstags um 09:00", value: "0 0 9 * * 6" },
  { label: "Sonntags um 09:00", value: "0 0 9 * * 0" },

  // Workday schedules
  { label: "Werktags um 08:00", value: "0 0 8 * * 1-5" },
  { label: "Werktags um 12:00", value: "0 0 12 * * 1-5" },
  { label: "Werktags um 17:00", value: "0 0 17 * * 1-5" },

  // Weekend schedules
  { label: "Wochenende um 10:00", value: "0 0 10 * * 0,6" },
  { label: "Wochenende um 14:00", value: "0 0 14 * * 0,6" },

  // Monthly schedules
  { label: "Monatlich am 1. um 09:00", value: "0 0 9 1 * *" },
  { label: "Monatlich am 15. um 09:00", value: "0 0 9 15 * *" },
  { label: "Monatlich am letzten Tag um 09:00", value: "0 0 9 L * *" },

  // Multiple times per day
  { label: "3x täglich (08:00, 14:00, 20:00)", value: "0 0 8,14,20 * * *" },
  { label: "2x täglich (09:00, 18:00)", value: "0 0 9,18 * * *" },
  { label: "4x täglich (06:00, 12:00, 18:00, 23:00)", value: "0 0 6,12,18,23 * * *" },

  // Custom option at the end
  { label: "Benutzerdefiniert", value: "custom" },
];

const ScheduleDrawer: React.FC<ScheduleDrawerProps> = ({ isOpen, onClose, onSave, initialData, title, onDelete, onRunNow }) => {
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
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader className="mb-6">
          <DrawerTitle>
            <div className="space-y-2">
              <Label
                className="text-gray-600 dark:text-gray-400"
                htmlFor="name">
                Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="Autopilot Name"
                className={CONFIG.style.title.className + " h-16 border-none p-0 "}
                disabled={isSubmitting}
              />
            </div>
          </DrawerTitle>
          {/* Action buttons when editing */}
          {initialData && (
            <div className="flex items-center gap-2 mt-6 pt-6 border-t dark:border-t-gray-800">
              {onRunNow && (
                <Button
                  type="button"
                  onClick={() => {
                    onRunNow(initialData.id);
                    onClose();
                  }}
                  variant="primary"
                  size="sm"
                  className="gap-1.5">
                  <Play size={14} />
                  Jetzt ausführen
                </Button>
              )}
              {onDelete && (
                <Button
                  type="button"
                  onClick={() => {
                    onDelete(initialData.id);
                    onClose();
                  }}
                  variant="danger"
                  size="sm"
                  className="gap-1.5">
                  <Trash2 size={14} />
                  Löschen
                </Button>
              )}
            </div>
          )}
        </DrawerHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-200 rounded-md">{error}</div>}

          {/* Name */}

          {/* Form Selection */}
          <div className="space-y-2">
            <Label
              className="text-gray-600 dark:text-gray-400"
              htmlFor="formId">
              Formular *
            </Label>
            <Select
              value={formId}
              onValueChange={setFormId}
              disabled={isSubmitting}>
              <SelectTrigger id="formId">
                <SelectValue placeholder="Formular auswählen" />
              </SelectTrigger>
              <SelectContent>
                {forms.map((form) => (
                  <SelectItem
                    key={form.id}
                    value={String(form.id)}>
                    {form.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <Label
              className="text-gray-600 dark:text-gray-400"
              htmlFor="paymentMethodId">
              Bezahlmethode *
            </Label>
            <Select
              value={paymentMethodId}
              onValueChange={setPaymentMethodId}
              disabled={isSubmitting}>
              <SelectTrigger id="paymentMethodId">
                <SelectValue placeholder="Bezahlmethode auswählen" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((pm) => (
                  <SelectItem
                    key={pm.id}
                    value={String(pm.id)}>
                    {pm.name} ({pm.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frequency Selection */}
          <div className="space-y-2">
            <Label
              className="text-gray-600 dark:text-gray-400"
              htmlFor="frequency">
              Häufigkeit *
            </Label>
            <Select
              value={frequency}
              onValueChange={setFrequency}
              disabled={isSubmitting}>
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Häufigkeit auswählen" />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Cron Input */}
          {frequency === "custom" && (
            <div className="space-y-2">
              <Label
                className="text-gray-600 dark:text-gray-400"
                htmlFor="customCron">
                Cron Ausdruck *
              </Label>
              <Input
                id="customCron"
                type="text"
                value={customCron}
                onChange={(e) => setCustomCron(e.target.value)}
                placeholder="* * * * * *"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">Format: Sekunde Minute Stunde Tag Monat Wochentag</p>
            </div>
          )}

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label
              className="text-gray-600 dark:text-gray-400"
              htmlFor="icon">
              Icon
            </Label>
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
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked === true)}
              disabled={isSubmitting}
            />
            <Label
              htmlFor="isActive"
              className="text-gray-600 dark:text-gray-400 font-normal cursor-pointer">
              Zeitplan aktiv
            </Label>
          </div>

          <DrawerFooter className="pt-6">
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
          </DrawerFooter>
        </form>
      </DrawerContent>

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
    </Drawer>
  );
};

export default ScheduleDrawer;
