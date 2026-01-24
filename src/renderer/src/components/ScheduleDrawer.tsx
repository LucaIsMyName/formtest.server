import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import IconPicker from "./IconPicker";
import { renderIcon, getDefaultScheduleIcon } from "../utils/iconHelper";
import { useFormsStore } from "../store/useFormsStore";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import { TestSchedule } from "../../../common/types";
import { Drawer, DrawerContent, DrawerHeader, DrawerFooter } from "./ui/Drawer";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Checkbox } from "./ui/Checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { Table, TableBody, TableRow, TableCell } from "./ui/Table";
import { StatusBadge } from "./ui/Badge";
import { Trash2, Play, Search, Accessibility } from "lucide-react";
import { CONFIG } from "@/app.config";
import { formatDateTime } from "../utils/formatters";
import { t } from "../data/dictionary";

interface ScheduleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: { name: string; formId: number; paymentMethodId: number; cronExpression: string; isActive: boolean; icon?: string; enableSeoTest?: boolean; enableAccessibilityTest?: boolean }) => Promise<void>;
  initialData?: TestSchedule;
  title?: string;
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

const ScheduleDrawer: React.FC<ScheduleDrawerProps> = ({ isOpen, onClose, onSave, initialData, onDelete, onRunNow }) => {
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
  
  // Quality test options
  const [enableSeoTest, setEnableSeoTest] = useState(false);
  const [enableAccessibilityTest, setEnableAccessibilityTest] = useState(false);

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
        setEnableSeoTest(initialData.enableSeoTest || false);
        setEnableAccessibilityTest(initialData.enableAccessibilityTest || false);

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
        setEnableSeoTest(false);
        setEnableAccessibilityTest(false);
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
        enableSeoTest,
        enableAccessibilityTest,
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
        {/* Top Title Bar with Action Buttons */}
        <div className=" gap-4 pb-4 flex-shrink-0">
          {initialData && (
            <div className="flex items-center gap-2 mb-4 flex-shrink-0">
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
          <div className="flex-1 min-w-0 h-12">
            <Label htmlFor="name" className="sr-only">Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Autopilot Name"
              className={`${CONFIG.style.title.className} h-16`}
              disabled={isSubmitting}
            />
          </div>
          
          
        </div>

        <DrawerHeader className="pt-6"></DrawerHeader>

        {/* Details Table - only shown when editing */}
        {initialData && (
          <div className="mb-6 pb-6 border-b dark:border-neutral-700">
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3">Autopilot Details</label>
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="px-3 py-2 w-[120px] bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">ID</TableCell>
                    <TableCell className="px-3 py-2">
                      <code className="text-xs font-mono bg-neutral-100 dark:bg-neutral-900/50 px-1.5 py-0.5 rounded text-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">{initialData.id}</code>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Status</TableCell>
                    <TableCell className="px-3 py-2"><StatusBadge status={initialData.isActive ? "active" : "inactive"} /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Formular</TableCell>
                    <TableCell className="px-3 py-2 text-sm text-neutral-900 dark:text-white">
                      {forms.find(f => f.id === initialData.formId)?.name || `ID: ${initialData.formId}`}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Bezahlmethode</TableCell>
                    <TableCell className="px-3 py-2 text-sm text-neutral-900 dark:text-white">
                      {paymentMethods.find(p => p.id === initialData.paymentMethodId)?.name || `ID: ${initialData.paymentMethodId}`}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Zeitplan</TableCell>
                    <TableCell className="px-3 py-2">
                      <code className="text-xs font-mono bg-neutral-100 dark:bg-neutral-900/50 px-1.5 py-0.5 rounded text-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">{initialData.cronExpression}</code>
                    </TableCell>
                  </TableRow>
                  {initialData.lastRun && (
                    <TableRow>
                      <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Letzter Lauf</TableCell>
                      <TableCell className="px-3 py-2 text-sm text-neutral-900 dark:text-white font-mono">{formatDateTime(initialData.lastRun)}</TableCell>
                    </TableRow>
                  )}
                  {initialData.nextRun && (
                    <TableRow>
                      <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Nächster Lauf</TableCell>
                      <TableCell className="px-3 py-2 text-sm text-neutral-900 dark:text-white font-mono">{formatDateTime(initialData.nextRun)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-200 rounded-md">{error}</div>}

          {/* Schedule Fields Table */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3">Autopilot Einstellungen</label>
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="px-3 py-2 w-[120px] bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400 align-top pt-3">Formular *</TableCell>
                    <TableCell className="px-3 py-2">
                      <Select
                        value={formId}
                        onValueChange={setFormId}
                        disabled={isSubmitting}>
                        <SelectTrigger id="formId" className="text-sm">
                          <SelectValue placeholder={t("placeholder.selectForm")} />
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
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400 align-top pt-3">Bezahlmethode *</TableCell>
                    <TableCell className="px-3 py-2">
                      <Select
                        value={paymentMethodId}
                        onValueChange={setPaymentMethodId}
                        disabled={isSubmitting}>
                        <SelectTrigger id="paymentMethodId" className="text-sm">
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
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400 align-top pt-3">Häufigkeit *</TableCell>
                    <TableCell className="px-3 py-2">
                      <Select
                        value={frequency}
                        onValueChange={setFrequency}
                        disabled={isSubmitting}>
                        <SelectTrigger id="frequency" className="text-sm">
                          <SelectValue placeholder={t("placeholder.selectFrequency")} />
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
                    </TableCell>
                  </TableRow>
                  {frequency === "custom" && (
                    <TableRow>
                      <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400 align-top pt-3">Cron *</TableCell>
                      <TableCell className="px-3 py-2">
                        <Input
                          id="customCron"
                          type="text"
                          value={customCron}
                          onChange={(e) => setCustomCron(e.target.value)}
                          placeholder="* * * * * *"
                          disabled={isSubmitting}
                          className="text-sm"
                        />
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Format: Sekunde Minute Stunde Tag Monat Wochentag</p>
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400 align-top pt-3">Icon</TableCell>
                    <TableCell className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setShowIconPicker(true)}
                        disabled={isSubmitting}
                        className="flex items-center gap-3 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-start">
                        {renderIcon(icon, 18, "text-blue-600 dark:text-blue-400")}
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">{icon}</span>
                      </button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Status</TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isActive"
                          checked={isActive}
                          onCheckedChange={(checked) => setIsActive(checked === true)}
                          disabled={isSubmitting}
                        />
                        <Label
                          htmlFor="isActive"
                          className="text-sm text-neutral-600 dark:text-neutral-400 font-normal cursor-pointer">
                          Zeitplan aktiv
                        </Label>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400 align-top pt-3">Qualitätstests</TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="enableSeoTest"
                            checked={enableSeoTest}
                            onCheckedChange={(checked) => setEnableSeoTest(checked === true)}
                            disabled={isSubmitting}
                          />
                          <Label
                            htmlFor="enableSeoTest"
                            className="text-sm text-neutral-600 dark:text-neutral-400 font-normal cursor-pointer flex items-center gap-1.5">
                            <Search size={12} className="text-neutral-500" />
                            SEO-Analyse
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="enableAccessibilityTest"
                            checked={enableAccessibilityTest}
                            onCheckedChange={(checked) => setEnableAccessibilityTest(checked === true)}
                            disabled={isSubmitting}
                          />
                          <Label
                            htmlFor="enableAccessibilityTest"
                            className="text-sm text-neutral-600 dark:text-neutral-400 font-normal cursor-pointer flex items-center gap-1.5">
                            <Accessibility size={12} className="text-neutral-500" />
                            Barrierefreiheit (WCAG 2.1 AA)
                          </Label>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
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
