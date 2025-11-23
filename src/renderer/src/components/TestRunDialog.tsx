import React, { useState, useEffect } from "react";
import { useFormsStore } from "../store/useFormsStore";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import { useTestRunsStore } from "../store/useTestRunsStore";
import Button from "./Button";
import { CreditCard, Building2, Landmark } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/Dialog";
import { Checkbox } from "./ui/Checkbox";
import { Label } from "./ui/Label";

interface TestRunDialogProps {
  isOpen: boolean;
  onClose: () => void;
  preselectAll?: boolean;
}

const TestRunDialog: React.FC<TestRunDialogProps> = ({ isOpen, onClose, preselectAll = false }) => {
  const { forms, loadForms } = useFormsStore();
  const { paymentMethods, loadPaymentMethods } = usePaymentMethodsStore();
  const { runTests, isRunning } = useTestRunsStore();

  const [selectedFormIds, setSelectedFormIds] = useState<number[]>([]);
  const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadForms();
      loadPaymentMethods();
      setError(null);
    }
  }, [isOpen, loadForms, loadPaymentMethods]);

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
      await runTests(selectedFormIds, selectedPaymentMethodIds);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Tests konnten nicht gestartet werden");
    }
  };

  const totalTests = selectedFormIds.length * selectedPaymentMethodIds.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isRunning && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle>Tests ausführen</DialogTitle>
        </DialogHeader>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Forms Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Formulare ({activeForms.length} verfügbar)</h3>
                <Button
                  onClick={handleSelectAllForms}
                  variant="ghost"
                  size="sm"
                  disabled={isRunning}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  {selectedFormIds.length === activeForms.length ? "Alle abwählen" : "Alle auswählen"}
                </Button>
              </div>

              {activeForms.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Keine aktiven Formulare verfügbar</p>
                  <p className="text-sm">Erstelle und aktiviere zuerst Formulare</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeForms.map((form) => (
                    <div
                      key={form.id}
                      className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Checkbox
                        id={`form-${form.id}`}
                        checked={selectedFormIds.includes(form.id)}
                        onCheckedChange={() => handleFormToggle(form.id)}
                        disabled={isRunning}
                      />
                      <Label htmlFor={`form-${form.id}`} className="ml-3 flex-1 cursor-pointer font-normal">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{form.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{form.url}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Methods Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bezahlmethoden ({activePaymentMethods.length} verfügbar)</h3>
                <Button
                  onClick={handleSelectAllPaymentMethods}
                  variant="ghost"
                  size="sm"
                  disabled={isRunning}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  {selectedPaymentMethodIds.length === activePaymentMethods.length ? "Alle abwählen" : "Alle auswählen"}
                </Button>
              </div>

              {activePaymentMethods.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Keine aktiven Bezahlmethoden verfügbar</p>
                  <p className="text-sm">Erstelle und aktiviere zuerst Bezahlmethoden</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activePaymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Checkbox
                        id={`pm-${pm.id}`}
                        checked={selectedPaymentMethodIds.includes(pm.id)}
                        onCheckedChange={() => handlePaymentMethodToggle(pm.id)}
                        disabled={isRunning}
                      />
                      <Label htmlFor={`pm-${pm.id}`} className="ml-3 flex-1 cursor-pointer font-normal">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{pm.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{pm.type}</div>
                      </Label>
                      <div className="text-gray-400 dark:text-gray-500">
                        {pm.type === "paypal" && <CreditCard size={16} />}
                        {pm.type === "sepa" && <Building2 size={16} />}
                        {pm.type === "creditcard" && <CreditCard size={16} />}
                        {pm.type === "eps" && <Landmark size={16} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Test Zusammenfassung */}
          {totalTests > 0 && (
            <div className="mt-6 flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md">
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
        </div>

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
