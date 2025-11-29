import React, { useState, useEffect } from "react";
import { useFormsStore } from "../store/useFormsStore";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import { useTestRunsStore } from "../store/useTestRunsStore";
import { useSettingsStore } from "../store/useSettingsStore";
import Button from "./ui/Button";
import { Input } from "./ui/Input";
import { CreditCard, Building2, Landmark, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/Dialog";
import { Checkbox } from "./ui/Checkbox";
import { Label } from "./ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";

interface TestRunDialogProps {
  isOpen: boolean;
  onClose: () => void;
  preselectAll?: boolean;
}

const TestRunDialog: React.FC<TestRunDialogProps> = ({ isOpen, onClose, preselectAll = false }) => {
  const { forms, loadForms } = useFormsStore();
  const { paymentMethods, loadPaymentMethods } = usePaymentMethodsStore();
  const { runTests, isRunning } = useTestRunsStore();
  const { settings, loadSettings, getSetting } = useSettingsStore();

  const [selectedFormIds, setSelectedFormIds] = useState<number[]>([]);
  const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Custom test parameters
  const [customAmount, setCustomAmount] = useState<string>("");
  const [customInterval, setCustomInterval] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      loadForms();
      loadPaymentMethods();
      loadSettings();
      setError(null);
    }
  }, [isOpen, loadForms, loadPaymentMethods, loadSettings]);

  // Set defaults from settings
  useEffect(() => {
    if (settings.length > 0) {
      const defaultAmount = getSetting("default_donation_amount")?.value || "10";
      const defaultInterval = getSetting("default_donation_interval")?.value || "0";
      setCustomAmount(defaultAmount);
      setCustomInterval(defaultInterval);
    }
  }, [settings, getSetting]);

  // Handle preselection when dialog opens
  useEffect(() => {
    if (isOpen && preselectAll) {
      const activeForms = forms.filter(f => f.isActive);
      const activePaymentMethods = paymentMethods.filter(pm => pm.isActive);
      setSelectedFormIds(activeForms.map(f => f.id));
      setSelectedPaymentMethodIds(activePaymentMethods.map(pm => pm.id));
    } else if (isOpen && !preselectAll) {
      // Reset selections when dialog opens without preselection
      setSelectedFormIds([]);
      setSelectedPaymentMethodIds([]);
    }
  }, [isOpen, preselectAll, forms, paymentMethods]);

  const activeForms = forms.filter((form) => form.isActive);
  const activePaymentMethods = paymentMethods.filter((pm) => pm.isActive);

  const handleFormToggle = (formId: number) => {
    setSelectedFormIds((prev) => (prev.includes(formId) ? prev.filter((id) => id !== formId) : [...prev, formId]));
  };

  const handlePaymentMethodToggle = (pmId: number) => {
    setSelectedPaymentMethodIds((prev) => (prev.includes(pmId) ? prev.filter((id) => id !== pmId) : [...prev, pmId]));
  };

  const handleSelectAllForms = () => {
    if (selectedFormIds.length === activeForms.length) {
      setSelectedFormIds([]);
    } else {
      setSelectedFormIds(activeForms.map((form) => form.id));
    }
  };

  const handleSelectAllPaymentMethods = () => {
    if (selectedPaymentMethodIds.length === activePaymentMethods.length) {
      setSelectedPaymentMethodIds([]);
    } else {
      setSelectedPaymentMethodIds(activePaymentMethods.map((pm) => pm.id));
    }
  };

  const handleRunTests = async () => {
    if (selectedFormIds.length === 0) {
      setError("Bitte wähle mindestens ein Formular aus");
      return;
    }
    if (selectedPaymentMethodIds.length === 0) {
      setError("Bitte wähle mindestens eine Bezahlmethode aus");
      return;
    }

    try {
      await runTests(selectedFormIds, selectedPaymentMethodIds, {
        customAmount,
        customInterval
      });
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Tests konnten nicht gestartet werden");
    }
  };

  const totalTests = selectedFormIds.length * selectedPaymentMethodIds.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isRunning && onClose()}>
      <DialogContent className="!w-[calc(100vw-8rem)] !max-w-[calc(100vw-8rem)] !h-[calc(100vh-8rem)] !max-h-[calc(100vh-8rem)] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle>Tests ausführen</DialogTitle>
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Main Grid: Forms - Connections - Payment Methods */}
          <div className="flex gap-4 min-h-[300px]">
            {/* Forms Selection - Left Column */}
            <div className="w-64 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Formulare ({activeForms.length})</h3>
                <button
                  onClick={handleSelectAllForms}
                  disabled={isRunning}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50">
                  {selectedFormIds.length === activeForms.length ? "Keine" : "Alle"}
                </button>
              </div>

              {activeForms.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-xs">
                  Keine aktiven Formulare
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                  {activeForms.map((form) => (
                    <div
                      key={form.id}
                      onClick={() => !isRunning && handleFormToggle(form.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                        selectedFormIds.includes(form.id)
                          ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700"
                          : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}>
                      <Checkbox
                        id={`form-${form.id}`}
                        checked={selectedFormIds.includes(form.id)}
                        onCheckedChange={() => handleFormToggle(form.id)}
                        disabled={isRunning}
                        className="pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 dark:text-white truncate">{form.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Connection Visualization - Center */}
            <div className="flex-1 flex items-center justify-center min-w-[120px] max-w-[200px]">
              {selectedFormIds.length > 0 && selectedPaymentMethodIds.length > 0 ? (
                <div className="flex flex-col items-center gap-2">
                  {/* Arrows from forms */}
                  <div className="flex items-center gap-1 text-blue-400 dark:text-blue-500">
                    <div className="w-8 h-px bg-gradient-to-r from-blue-300 to-blue-400 dark:from-blue-600 dark:to-blue-500"></div>
                    <ArrowRight size={14} />
                  </div>
                  
                  {/* Center badge */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 px-5 py-4 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-600 shadow-sm">
                    <div className="text-center">
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">{totalTests}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mt-1">Tests</div>
                    </div>
                  </div>
                  
                  {/* Arrows to payment methods */}
                  <div className="flex items-center gap-1 text-purple-400 dark:text-purple-500">
                    <ArrowRight size={14} />
                    <div className="w-8 h-px bg-gradient-to-r from-purple-400 to-purple-300 dark:from-purple-500 dark:to-purple-600"></div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 dark:text-gray-500">
                  <ArrowRight className="w-6 h-6 mx-auto mb-2 opacity-30" />
                  <p className="text-[10px]">Wähle Formulare<br/>und Bezahlmethoden</p>
                </div>
              )}
            </div>

            {/* Payment Methods Selection - Right Column */}
            <div className="w-64 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Bezahlmethoden ({activePaymentMethods.length})</h3>
                <button
                  onClick={handleSelectAllPaymentMethods}
                  disabled={isRunning}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50">
                  {selectedPaymentMethodIds.length === activePaymentMethods.length ? "Keine" : "Alle"}
                </button>
              </div>

              {activePaymentMethods.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-xs">
                  Keine aktiven Bezahlmethoden
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                  {activePaymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      onClick={() => !isRunning && handlePaymentMethodToggle(pm.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                        selectedPaymentMethodIds.includes(pm.id)
                          ? "bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700"
                          : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}>
                      <Checkbox
                        id={`pm-${pm.id}`}
                        checked={selectedPaymentMethodIds.includes(pm.id)}
                        onCheckedChange={() => handlePaymentMethodToggle(pm.id)}
                        disabled={isRunning}
                        className="pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 dark:text-white truncate">{pm.name}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{pm.type}</div>
                      </div>
                      <div className="text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {pm.type === "paypal" && <CreditCard size={14} />}
                        {pm.type === "sepa" && <Building2 size={14} />}
                        {pm.type === "creditcard" && <CreditCard size={14} />}
                        {pm.type === "eps" && <Landmark size={14} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Test Parameters */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Test-Parameter</h3>
            <div className="flex gap-6">
              <div className="flex-1 max-w-[200px]">
                <Label htmlFor="test-amount" className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Spendenbetrag (EUR)
                </Label>
                <Input
                  id="test-amount"
                  type="number"
                  min="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  disabled={isRunning}
                  className="h-9"
                />
              </div>
              <div className="flex-1 max-w-[200px]">
                <Label htmlFor="test-interval" className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Spendenintervall
                </Label>
                <Select value={customInterval} onValueChange={setCustomInterval} disabled={isRunning}>
                  <SelectTrigger id="test-interval" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Einmalig</SelectItem>
                    <SelectItem value="1">Monatlich</SelectItem>
                    <SelectItem value="3">Vierteljährlich</SelectItem>
                    <SelectItem value="6">Halbjährlich</SelectItem>
                    <SelectItem value="12">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

        </div>

        {/* Test Zusammenfassung - Above Footer */}
        {totalTests > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <span className="font-mono text-blue-600 dark:text-blue-400 font-medium">{selectedFormIds.length}</span>
                <span>Formular{selectedFormIds.length !== 1 ? 'e' : ''}</span>
              </span>
              <span className="text-gray-300 dark:text-gray-600">×</span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-purple-600 dark:text-purple-400 font-medium">{selectedPaymentMethodIds.length}</span>
                <span>Bezahlmethode{selectedPaymentMethodIds.length !== 1 ? 'n' : ''}</span>
              </span>
              <span className="text-gray-300 dark:text-gray-600">=</span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-gray-900 dark:text-white font-semibold">{totalTests}</span>
                <span>Test{totalTests !== 1 ? 's' : ''}</span>
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sm:justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            {isRunning ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                Tests werden ausgeführt...
              </span>
            ) : (
              `Bereit für ${totalTests} Test${totalTests !== 1 ? "s" : ""}`
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="secondary"
              size="md"
              disabled={isRunning}>
              Abbrechen
            </Button>
            <Button
              onClick={handleRunTests}
              variant="primary"
              size="md"
              isLoading={isRunning}
              disabled={isRunning || totalTests === 0}>
              {isRunning ? "Läuft..." : `${totalTests} Test${totalTests !== 1 ? "s" : ""} starten`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestRunDialog;
