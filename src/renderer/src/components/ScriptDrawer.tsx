import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import type { CustomScript, ScriptHookPoint, Form } from "../../../common/types";
import { Drawer, DrawerContent, DrawerHeader, DrawerFooter } from "./ui/Drawer";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Checkbox } from "./ui/Checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { useCustomScriptsStore } from "../store/useCustomScriptsStore";
import { AlertTriangle, Code, Info } from "lucide-react";

interface ScriptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  script?: CustomScript | null;
  forms: Form[];
}

// Hook point options
const HOOK_POINT_OPTIONS: { value: ScriptHookPoint; label: string; description: string }[] = [
  { value: "before_navigation", label: "Vor Navigation", description: "Bevor die Seite geladen wird" },
  { value: "after_navigation", label: "Nach Navigation", description: "Nachdem die Seite geladen wurde" },
  { value: "before_cookie_banner", label: "Vor Cookie-Banner", description: "Bevor Cookie-Banner behandelt wird" },
  { value: "after_cookie_banner", label: "Nach Cookie-Banner", description: "Nachdem Cookie-Banner behandelt wurde" },
  { value: "before_form_fill", label: "Vor Formular-Ausfüllung", description: "Bevor das Formular ausgefüllt wird" },
  { value: "after_form_fill", label: "Nach Formular-Ausfüllung", description: "Nachdem das Formular ausgefüllt wurde" },
  { value: "before_payment", label: "Vor Zahlung", description: "Bevor die Zahlungsmethode ausgewählt wird" },
  { value: "after_payment", label: "Nach Zahlung", description: "Nachdem die Zahlungsmethode ausgewählt wurde" },
  { value: "before_submit", label: "Vor Absenden", description: "Bevor das Formular abgesendet wird" },
  { value: "after_submit", label: "Nach Absenden", description: "Nachdem das Formular abgesendet wurde" },
  { value: "on_success", label: "Bei Erfolg", description: "Wenn der Test erfolgreich war" },
  { value: "on_error", label: "Bei Fehler", description: "Wenn ein Fehler aufgetreten ist" },
];

const ScriptDrawer: React.FC<ScriptDrawerProps> = ({ isOpen, onClose, script, forms }) => {
  const { createScript, updateScript, validateScript } = useCustomScriptsStore();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    hookPoint: "after_navigation" as ScriptHookPoint,
    isActive: true,
    isGlobal: true,
    stopOnError: false,
    timeout: 30000,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (script) {
      setFormData({
        name: script.name,
        description: script.description || "",
        code: script.code,
        hookPoint: script.hookPoint,
        isActive: script.isActive,
        isGlobal: script.isGlobal,
        stopOnError: script.stopOnError,
        timeout: script.timeout,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        code: "",
        hookPoint: "after_navigation",
        isActive: true,
        isGlobal: true,
        stopOnError: false,
        timeout: 30000,
      });
    }
    setErrors({});
    setValidationResult(null);
  }, [script, isOpen]);

  const handleValidate = async () => {
    if (!formData.code.trim()) {
      setValidationResult({ valid: false, errors: ["Code darf nicht leer sein"] });
      return;
    }
    
    setIsValidating(true);
    try {
      const result = await validateScript(formData.code);
      setValidationResult(result);
    } catch (error) {
      setValidationResult({ valid: false, errors: ["Validierung fehlgeschlagen"] });
    }
    setIsValidating(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name ist erforderlich";
    }
    if (!formData.code.trim()) {
      newErrors.code = "Code ist erforderlich";
    }
    if (formData.timeout < 1000 || formData.timeout > 300000) {
      newErrors.timeout = "Timeout muss zwischen 1 und 300 Sekunden liegen";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (script) {
        await updateScript(script.id, formData);
      } else {
        await createScript(formData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save script:", error);
    }
    setIsSubmitting(false);
  };

  const selectedHookPoint = HOOK_POINT_OPTIONS.find((h) => h.value === formData.hookPoint);

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-w-2xl">
        <DrawerHeader>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {script ? "Script bearbeiten" : "Neues Script erstellen"}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Playwright-Code für erweiterte Test-Automatisierung
          </p>
        </DrawerHeader>

        <div className=" pt-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="z.B. Cookie Banner schließen"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optionale Beschreibung des Scripts"
            />
          </div>

          {/* Hook Point */}
          <div className="space-y-2">
            <Label htmlFor="hookPoint">Hook-Punkt *</Label>
            <Select
              value={formData.hookPoint}
              onValueChange={(value) => setFormData({ ...formData, hookPoint: value as ScriptHookPoint })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wähle einen Hook-Punkt" />
              </SelectTrigger>
              <SelectContent>
                {HOOK_POINT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedHookPoint && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <Info size={12} />
                {selectedHookPoint.description}
              </p>
            )}
          </div>

          {/* Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="code">Playwright Code *</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleValidate}
                disabled={isValidating}
              >
                <Code size={14} className="mr-1" />
                {isValidating ? "Validiere..." : "Validieren"}
              </Button>
            </div>
            <textarea
              id="code"
              value={formData.code}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value });
                setValidationResult(null);
              }}
              placeholder={`// Beispiel: Warte auf ein Element und klicke es
await click('button.custom-button');
log('Button geklickt');

// Verfügbare Funktionen:
// page.url(), page.title(), page.waitForSelector()
// click(), fill(), type(), select(), check()
// log(), screenshot(), wait()`}
              className={`w-full h-48 px-3 py-2 font-mono text-sm border rounded-md resize-none
                bg-neutral-50 dark:bg-neutral-900 
                text-neutral-900 dark:text-neutral-100
                ${errors.code 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-neutral-300 dark:border-neutral-600 focus:ring-blue-500"
                }
                focus:outline-none focus:ring-2`}
            />
            {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
            {validationResult && (
              <div className={`p-2 rounded text-sm ${
                validationResult.valid 
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
              }`}>
                {validationResult.valid ? (
                  "✓ Code-Syntax ist gültig"
                ) : (
                  <div>
                    <span className="font-medium">Fehler:</span>
                    <ul className="list-disc list-inside mt-1">
                      {validationResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Options Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Timeout */}
            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (Sekunden)</Label>
              <Input
                id="timeout"
                type="number"
                min={1}
                max={300}
                value={formData.timeout / 1000}
                onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) * 1000 || 30000 })}
                className={errors.timeout ? 'border-red-500' : ''}
              />
              {errors.timeout && <p className="text-xs text-red-500">{errors.timeout}</p>}
            </div>

            {/* Global/Form-specific */}
            <div className="space-y-2">
              <Label>Geltungsbereich</Label>
              <Select
                value={formData.isGlobal ? "global" : "form"}
                onValueChange={(value) => setFormData({ ...formData, isGlobal: value === "global" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (alle Tests)</SelectItem>
                  <SelectItem value="form">Form-spezifisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked === true })}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Script ist aktiv
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="stopOnError"
                checked={formData.stopOnError}
                onCheckedChange={(checked) => setFormData({ ...formData, stopOnError: checked === true })}
              />
              <Label htmlFor="stopOnError" className="cursor-pointer flex items-center gap-1">
                <AlertTriangle size={14} className="text-orange-500" />
                Test bei Script-Fehler abbrechen
              </Label>
            </div>
          </div>

          {/* Warning for non-global scripts */}
          {!formData.isGlobal && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                <strong>Hinweis:</strong> Form-spezifische Scripts müssen nach dem Erstellen 
                manuell den gewünschten Formularen zugewiesen werden.
              </p>
            </div>
          )}
        </div>

        <DrawerFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Speichern..." : script ? "Speichern" : "Erstellen"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ScriptDrawer;
