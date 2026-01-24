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
import { t } from "../data/dictionary";

interface ScriptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  script?: CustomScript | null;
  forms: Form[];
}

// Hook point options - will be translated in component
const getHookPointOptions = (): { value: ScriptHookPoint; label: string; description: string }[] => [
  { value: "before_navigation", label: t("script.hookPoint.beforeNavigation"), description: t("script.hookPoint.beforeNavigationDesc") },
  { value: "after_navigation", label: t("script.hookPoint.afterNavigation"), description: t("script.hookPoint.afterNavigationDesc") },
  { value: "before_cookie_banner", label: t("script.hookPoint.beforeCookieBanner"), description: t("script.hookPoint.beforeCookieBannerDesc") },
  { value: "after_cookie_banner", label: t("script.hookPoint.afterCookieBanner"), description: t("script.hookPoint.afterCookieBannerDesc") },
  { value: "before_form_fill", label: t("script.hookPoint.beforeFormFill"), description: t("script.hookPoint.beforeFormFillDesc") },
  { value: "after_form_fill", label: t("script.hookPoint.afterFormFill"), description: t("script.hookPoint.afterFormFillDesc") },
  { value: "before_payment", label: t("script.hookPoint.beforePayment"), description: t("script.hookPoint.beforePaymentDesc") },
  { value: "after_payment", label: t("script.hookPoint.afterPayment"), description: t("script.hookPoint.afterPaymentDesc") },
  { value: "before_submit", label: t("script.hookPoint.beforeSubmit"), description: t("script.hookPoint.beforeSubmitDesc") },
  { value: "after_submit", label: t("script.hookPoint.afterSubmit"), description: t("script.hookPoint.afterSubmitDesc") },
  { value: "on_success", label: t("script.hookPoint.onSuccess"), description: t("script.hookPoint.onSuccessDesc") },
  { value: "on_error", label: t("script.hookPoint.onError"), description: t("script.hookPoint.onErrorDesc") },
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
      setValidationResult({ valid: false, errors: [t("script.codeEmpty")] });
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateScript(formData.code);
      setValidationResult(result);
    } catch (error) {
      setValidationResult({ valid: false, errors: [t("script.validationFailed")] });
    }
    setIsValidating(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("script.nameRequired");
    }
    if (!formData.code.trim()) {
      newErrors.code = t("script.codeRequired");
    }
    if (formData.timeout < 1000 || formData.timeout > 300000) {
      newErrors.timeout = t("script.timeoutInvalid");
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

  const hookPointOptions = getHookPointOptions();
  const selectedHookPoint = hookPointOptions.find((h) => h.value === formData.hookPoint);

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-w-3xl">
        <DrawerHeader className="pb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {script ? t("script.editTitle") : t("script.createTitle")}
          </h2>
        </DrawerHeader>

        <div className="px-6 pb-6 space-y-4 overflow-y-auto max-h-[calc(100vh-180px)]">
          {/* Top Row: Name, Hook Point, Active */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">{t("script.name")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="z.B. Cookie Banner"
                className={`h-9 text-sm ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hookPoint" className="text-xs">{t("script.hookPointLabel")} *</Label>
              <Select
                value={formData.hookPoint}
                onValueChange={(value) => setFormData({ ...formData, hookPoint: value as ScriptHookPoint })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hookPointOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("script.status")}</Label>
              <div className="flex items-center gap-2 h-9">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked === true })}
                />
                <Label htmlFor="isActive" className="cursor-pointer text-sm">
                  {t("script.active")}
                </Label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs">{t("script.description")}</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t("script.descriptionPlaceholder")}
              className="h-9 text-sm"
            />
          </div>

          {/* Code Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="code" className="text-xs">{t("script.code")} *</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleValidate}
                disabled={isValidating}
                className="h-7 text-xs"
              >
                <Code size={12} className="mr-1" />
                {isValidating ? t("script.validating") : t("script.validate")}
              </Button>
            </div>
            <textarea
              id="code"
              value={formData.code}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value });
                setValidationResult(null);
              }}
              placeholder={t("script.codePlaceholder")}
              className={`w-full h-64 px-3 py-2 font-mono text-xs border rounded-md resize-none
                bg-neutral-50 dark:bg-neutral-900 
                text-neutral-900 dark:text-neutral-100
                ${errors.code
                  ? "border-red-500 focus:ring-red-500"
                  : "border-neutral-300 dark:border-neutral-600 focus:ring-blue-500"
                }
                focus:outline-none focus:ring-2`}
            />
            {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
            {validationResult && (
              <div className={`p-2 rounded text-xs ${validationResult.valid
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                }`}>
                {validationResult.valid ? (
                  t("script.syntaxValid")
                ) : (
                  <div>
                    <span className="font-medium">{t("script.syntaxError")}</span>
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

          {/* Bottom Row: Options */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <div className="space-y-1.5">
              <Label htmlFor="timeout" className="text-xs">{t("script.timeout")}</Label>
              <Input
                id="timeout"
                type="number"
                min={1}
                max={300}
                value={formData.timeout / 1000}
                onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) * 1000 || 30000 })}
                className={`h-9 text-sm ${errors.timeout ? 'border-red-500' : ''}`}
              />
              {errors.timeout && <p className="text-xs text-red-500">{errors.timeout}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("script.scope")}</Label>
              <Select
                value={formData.isGlobal ? "global" : "form"}
                onValueChange={(value) => setFormData({ ...formData, isGlobal: value === "global" })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">{t("script.scopeGlobal")}</SelectItem>
                  <SelectItem value="form">{t("script.scopeFormSpecific")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("script.errorHandling")}</Label>
              <div className="flex items-center gap-2 h-9">
                <Checkbox
                  id="stopOnError"
                  checked={formData.stopOnError}
                  onCheckedChange={(checked) => setFormData({ ...formData, stopOnError: checked === true })}
                />
                <Label htmlFor="stopOnError" className="cursor-pointer text-sm flex items-center gap-1">
                  <AlertTriangle size={12} className="text-orange-500" />
                  {t("script.stopOnError")}
                </Label>
              </div>
            </div>
          </div>

          {/* Info for hook point */}
          {selectedHookPoint && (
            <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-400">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              <span>{selectedHookPoint.description}</span>
            </div>
          )}

          {/* Warning for non-global scripts */}
          {!formData.isGlobal && (
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-700 dark:text-yellow-400">
              <strong>{t("script.note")}</strong> {t("script.formSpecificNote")}
            </div>
          )}
        </div>

        <DrawerFooter className="pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} size="sm">
            {t("button.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} size="sm">
            {isSubmitting ? t("button.saving") : script ? t("button.save") : t("button.create")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ScriptDrawer;
