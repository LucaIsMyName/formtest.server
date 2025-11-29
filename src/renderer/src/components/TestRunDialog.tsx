import React, { useState, useEffect } from "react";
import { useFormsStore } from "../store/useFormsStore";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import { useTestRunsStore } from "../store/useTestRunsStore";
import { useSettingsStore } from "../store/useSettingsStore";
import Button from "./ui/Button";
import { Input } from "./ui/Input";
import { CreditCard, Building2, Landmark, Play, Zap, Globe, CheckCircle2, Circle, Settings2, Euro, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/Dialog";
import { Label } from "./ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";

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
      const activeForms = forms.filter((f) => f.isActive);
      const activePaymentMethods = paymentMethods.filter((pm) => pm.isActive);
      setSelectedFormIds(activeForms.map((f) => f.id));
      setSelectedPaymentMethodIds(activePaymentMethods.map((pm) => pm.id));
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
        customInterval,
      });
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Tests konnten nicht gestartet werden");
    }
  };

  const totalTests = selectedFormIds.length * selectedPaymentMethodIds.length;

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "paypal":
        return <CreditCard size={14} />;
      case "sepa":
        return <Building2 size={14} />;
      case "creditcard":
        return <CreditCard size={14} />;
      case "eps":
        return <Landmark size={14} />;
      default:
        return <CreditCard size={14} />;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isRunning && onClose()}>
      <DialogContent className="!w-[calc(100vw-6rem)] !max-w-4xl !h-auto !max-h-[calc(100vh-6rem)] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header with gradient accent */}
        <DialogHeader className="relative p-4 pb-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
          {/* <div className="absolute top-0 left-0 right-0 h-0 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500" /> */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border border-blue-700 dark:border-blue-500">
              <Play
                size={18}
                className="text-white ml-0.5"
              />
            </div>
            <div>
              <DialogTitle
                style={{ fontStretch: "115%" }}
                className="text-2xl font-semibold">
                Tests ausführen
              </DialogTitle>
              <p className="sr-only text-xs text-gray-500 dark:text-gray-400 mt-0.5">Wähle Formulare & Bezahlmethoden für den Testlauf</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-5 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Main Selection Grid */}
          <div className="p-4 grid grid-cols-2 gap-5">
            {/* Forms Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-md border border-emerald-400 dark:border-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Globe
                      size={16}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Formulare</h3>
                  <span className="text-xs text-gray-400 font-mono">
                    ({selectedFormIds.length}/{activeForms.length})
                  </span>
                </div>
                <Button
                  onClick={handleSelectAllForms}
                  disabled={isRunning}
                  size="sm"
                  variant={selectedFormIds.length === activeForms.length ? "secondary" : "primary"}
                  className="">
                  {selectedFormIds.length === activeForms.length ? "Keine" : "Alle"}
                </Button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 p-2 min-h-[200px] max-h-[240px] overflow-y-auto">
                {activeForms.length === 0 ? (
                  <div className="w-10 h-10 rounded-md border border-emerald-400 dark:border-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Globe
                      size={16}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeForms.map((form) => {
                      const isSelected = selectedFormIds.includes(form.id);
                      return (
                        <button
                          key={form.id}
                          onClick={() => !isRunning && handleFormToggle(form.id)}
                          disabled={isRunning}
                          style={{
                            fontStretch: "115%",
                          }}
                          className={`w-full flex items-center gap-2.5 p-2.5 rounded-md transition-all text-left group ${isSelected ? "bg-emerald-500/10 dark:bg-emerald-500/20 ring-1 ring-emerald-500/50" : "hover:bg-white dark:hover:bg-gray-800"}`}>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isSelected ? "bg-emerald-500 text-white dark:text-black" : "bg-gray-200 dark:bg-gray-700 text-gray-400 group-hover:bg-gray-300 dark:group-hover:bg-gray-600"}`}>{isSelected ? <CheckCircle2 size={12} /> : <Circle size={12} />}</div>
                          <span className={`text-sm truncate flex-1 ${isSelected ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-gray-700 dark:text-gray-300"}`}>{form.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-md border border-orange-400 dark:border-orange-600 bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <CreditCard
                      size={16}
                      className="text-orange-600 dark:text-orange-400"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Bezahlmethoden</h3>
                  <span className="text-xs text-gray-400 font-mono">
                    ({selectedPaymentMethodIds.length}/{activePaymentMethods.length})
                  </span>
                </div>
                <Button
                  onClick={handleSelectAllPaymentMethods}
                  disabled={isRunning}
                  size="sm"
                  variant={selectedPaymentMethodIds.length === activePaymentMethods.length ? "secondary" : "primary"}
                  className="">
                  {selectedPaymentMethodIds.length === activePaymentMethods.length ? "Keine" : "Alle"}
                </Button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl  border border-gray-200 dark:border-gray-800 p-2 min-h-[200px] max-h-[240px] overflow-y-auto">
                {activePaymentMethods.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400">
                    <CreditCard
                      size={24}
                      className="mb-2 opacity-50"
                    />
                    <span className="text-xs">Keine aktiven Bezahlmethoden</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activePaymentMethods.map((pm) => {
                      const isSelected = selectedPaymentMethodIds.includes(pm.id);
                      return (
                        <button
                          key={pm.id}
                          onClick={() => !isRunning && handlePaymentMethodToggle(pm.id)}
                          disabled={isRunning}
                          className={`w-full text-gray-400 dark:text-gray-600 flex items-start gap-2.5 p-2.5 rounded-md transition-all text-left group ${isSelected ? "bg-orange-500/10 dark:bg-orange-500/20 ring-1 ring-orange-500/50" : "hover:bg-white dark:hover:bg-gray-800"}`}>
                          <div className={`w-5 h-5  rounded-md flex items-center justify-center transition-all ${isSelected ? "bg-orange-500 text-white dark:text-black" : "bg-gray-200 dark:bg-gray-700 text-gray-400 group-hover:bg-gray-300 dark:group-hover:bg-gray-600"}`}>{isSelected ? <CheckCircle2 size={12} /> : <Circle size={12} />}</div>
                          <div className="flex-1 min-w-0 font-mono truncate ">
                            <span
                              style={{
                                fontStretch: "115%",
                              }}
                              className={`truncate text-sm truncate block ${isSelected ? "text-orange-700 dark:text-orange-300 font-medium" : "text-gray-700 dark:text-gray-300"}`}>
                              {pm.name}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate">
                              <span className="font-semibold uppercase">{pm.type}</span>
                              {pm.details.cardNumber !== undefined ? " - Nr.:" + pm.details.cardNumber : ""}
                              {pm.details.email !== undefined ? " - E-Mail: " + pm.details.email : ""}
                              {pm.details.cardHolder !== undefined ? " - Inhaber: " + pm.details.cardHolder : ""}
                              {pm.details.expiryDate !== undefined ? " - Ablaufdatum: " + pm.details.expiryDate : ""}
                              {pm.details.cvv !== undefined ? " - CVV: " + pm.details.cvv : ""}
                              {pm.details.iban !== undefined ? " - IBAN: " + pm.details.iban : ""}
                              {pm.details.bic !== undefined ? " - BIC: " + pm.details.bic : ""}
                              {pm.details.bankCode !== undefined ? " - Bankcode: " + pm.details.bankCode : ""}
                            </span>
                          </div>
                          <div className={`${isSelected ? "text-orange-500" : "text-gray-400"}`}>{getPaymentIcon(pm.type)}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Test Parameters - Compact inline */}
          <div className="px-5 pb-5">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Settings2
                  size={14}
                  className="text-gray-500"
                />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Parameter</span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label
                    htmlFor="test-amount"
                    className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block uppercase tracking-wide">
                    <Euro
                      size={10}
                      className="inline mr-1"
                    />
                    Betrag
                  </Label>
                  <Input
                    id="test-amount"
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    disabled={isRunning}
                    className="h-9 bg-white dark:bg-gray-900 font-mono"
                  />
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="test-interval"
                    className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block uppercase tracking-wide">
                    <RefreshCw
                      size={10}
                      className="inline mr-1"
                    />
                    Intervall
                  </Label>
                  <Select
                    value={customInterval}
                    onValueChange={setCustomInterval}
                    disabled={isRunning}>
                    <SelectTrigger
                      id="test-interval"
                      className="h-9 bg-white dark:bg-gray-900">
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
        </div>

        {/* Footer with test count visualization */}
        <DialogFooter className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Test Matrix Visualization */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{selectedFormIds.length}</span>
              </div>
              <span className="text-gray-400 font-light">×</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{selectedPaymentMethodIds.length}</span>
              </div>
              <span className="text-gray-400 font-light">=</span>
              <div className="flex items-center gap-1.5">
                <Zap
                  size={14}
                  className={totalTests > 0 ? "text-amber-500" : "text-gray-400"}
                />
                <span className={`text-sm font-mono font-bold ${totalTests > 0 ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>{totalTests}</span>
              </div>
            </div>

            {isRunning && (
              <span className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                Tests werden gestartet...
              </span>
            )}
          </div>

          <div className="flex gap-2">
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
              disabled={isRunning || totalTests === 0}
              className="gap-2 min-w-[140px]">
              <Play size={14} />
              {totalTests} Test{totalTests !== 1 ? "s" : ""} starten
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestRunDialog;
