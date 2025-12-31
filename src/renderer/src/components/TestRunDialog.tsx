import React, { useState, useEffect } from "react";
import { useFormsStore } from "../store/useFormsStore";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import { useTestRunsStore } from "../store/useTestRunsStore";
import { useSettingsStore } from "../store/useSettingsStore";
import Button from "./ui/Button";
import { Input } from "./ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/Table";
import { CreditCard, Play, Globe, Settings2, Euro, RefreshCw, ShieldCheck, Search, Accessibility } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/Dialog";
import { Label } from "./ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { Checkbox } from "./ui/Checkbox";
import { renderIcon, getDefaultPaymentIcon } from "../utils/iconHelper";

interface TestRunDialogProps {
  isOpen: boolean;
  onClose: () => void;
  preselectAll?: boolean;
  preselectedFormIds?: number[];
  preselectedPaymentMethodIds?: number[];
}

const TestRunDialog: React.FC<TestRunDialogProps> = ({ 
  isOpen, 
  onClose, 
  preselectAll = false,
  preselectedFormIds = [],
  preselectedPaymentMethodIds = []
}) => {
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
  
  // Quality test options
  const [enableSeoTest, setEnableSeoTest] = useState<boolean>(false);
  const [enableAccessibilityTest, setEnableAccessibilityTest] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadForms();
      loadPaymentMethods();
      loadSettings();
      setError(null);
      // Reset quality test options when dialog opens
      setEnableSeoTest(false);
      setEnableAccessibilityTest(false);
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
    if (isOpen) {
      if (preselectAll) {
        // Select all active forms and payment methods
        const activeForms = forms.filter((f) => f.isActive);
        const activePaymentMethods = paymentMethods.filter((pm) => pm.isActive);
        setSelectedFormIds(activeForms.map((f) => f.id));
        setSelectedPaymentMethodIds(activePaymentMethods.map((pm) => pm.id));
      } else if (preselectedFormIds.length > 0 || preselectedPaymentMethodIds.length > 0) {
        // Use specific preselected IDs
        setSelectedFormIds(preselectedFormIds);
        setSelectedPaymentMethodIds(preselectedPaymentMethodIds);
      } else {
        // Clear selection
        setSelectedFormIds([]);
        setSelectedPaymentMethodIds([]);
      }
    }
  }, [isOpen, preselectAll, preselectedFormIds, preselectedPaymentMethodIds, forms, paymentMethods]);

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
        enableSeoTest,
        enableAccessibilityTest,
      });
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Tests konnten nicht gestartet werden");
    }
  };

  const totalTests = selectedFormIds.length * selectedPaymentMethodIds.length;

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "paypal": return "PayPal";
      case "sepa": return "SEPA";
      case "creditcard": return "Kreditkarte";
      case "eps": return "EPS";
      default: return type;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isRunning && onClose()}>
      <DialogContent className="!w-[calc(100vw-6rem)] !max-w-4xl !h-auto !max-h-[calc(100vh-6rem)] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="relative p-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Play size={18} className="text-white ml-0.5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Tests ausführen</DialogTitle>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Wähle Formulare & Bezahlmethoden für den Testlauf
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Main Selection Grid */}
          <div className="p-4 grid grid-cols-2 gap-4">
            {/* Forms Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Formulare</span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {selectedFormIds.length}/{activeForms.length}
                  </span>
                </div>
                <Button
                  onClick={handleSelectAllForms}
                  disabled={isRunning}
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs px-2">
                  {selectedFormIds.length === activeForms.length ? "Keine" : "Alle"}
                </Button>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
                <div className="max-h-[200px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-neutral-50 dark:bg-neutral-800/50">
                        <TableHead className="w-10 px-3"></TableHead>
                        <TableHead className="px-3 text-xs">Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeForms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-8 text-neutral-400 text-xs">
                            Keine aktiven Formulare
                          </TableCell>
                        </TableRow>
                      ) : (
                        activeForms.map((form) => {
                          const isSelected = selectedFormIds.includes(form.id);
                          return (
                            <TableRow
                              key={form.id}
                              className={`cursor-pointer transition-colors ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"}`}
                              onClick={() => !isRunning && handleFormToggle(form.id)}>
                              <TableCell 
                                className="px-3 py-2 cursor-pointer" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isRunning) handleFormToggle(form.id);
                                }}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  disabled={isRunning}
                                  className="pointer-events-none"
                                />
                              </TableCell>
                              <TableCell className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-neutral-500 dark:text-neutral-400">
                                    {renderIcon(form.icon || "FileText", 14)}
                                  </span>
                                  <span className={`text-sm ${isSelected ? "font-medium text-blue-700 dark:text-blue-300" : "text-neutral-700 dark:text-neutral-300"}`}>
                                    {form.name}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Payment Methods Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Bezahlmethoden</span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {selectedPaymentMethodIds.length}/{activePaymentMethods.length}
                  </span>
                </div>
                <Button
                  onClick={handleSelectAllPaymentMethods}
                  disabled={isRunning}
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs px-2">
                  {selectedPaymentMethodIds.length === activePaymentMethods.length ? "Keine" : "Alle"}
                </Button>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
                <div className="max-h-[200px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-neutral-50 dark:bg-neutral-800/50">
                        <TableHead className="w-10 px-3"></TableHead>
                        <TableHead className="px-3 text-xs">Name</TableHead>
                        <TableHead className="px-3 text-xs">Typ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activePaymentMethods.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-neutral-400 text-xs">
                            Keine aktiven Bezahlmethoden
                          </TableCell>
                        </TableRow>
                      ) : (
                        activePaymentMethods.map((pm) => {
                          const isSelected = selectedPaymentMethodIds.includes(pm.id);
                          return (
                            <TableRow
                              key={pm.id}
                              className={`cursor-pointer transition-colors ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"}`}
                              onClick={() => !isRunning && handlePaymentMethodToggle(pm.id)}>
                              <TableCell 
                                className="px-3 py-2 cursor-pointer" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isRunning) handlePaymentMethodToggle(pm.id);
                                }}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  disabled={isRunning}
                                  className="pointer-events-none"
                                />
                              </TableCell>
                              <TableCell className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-neutral-500 dark:text-neutral-400">
                                    {renderIcon(pm.icon || getDefaultPaymentIcon(pm.type), 14)}
                                  </span>
                                  <span className={`text-sm ${isSelected ? "font-medium text-blue-700 dark:text-blue-300" : "text-neutral-700 dark:text-neutral-300"}`}>
                                    {pm.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="px-3 py-2">
                                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono uppercase">
                                  {getPaymentTypeLabel(pm.type)}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>

          {/* Test Parameters */}
          <div className="px-4 pb-4">
            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-md border border-neutral-200 dark:border-neutral-700 p-3">
              <div className="flex items-center gap-2 mb-3">
                <Settings2 size={12} className="text-neutral-500" />
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">Parameter für diesen Testlauf</span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="test-amount" className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-1 block uppercase tracking-wide">
                    <Euro size={10} className="inline mr-1" />
                    Betrag (€)
                  </Label>
                  <Input
                    id="test-amount"
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    disabled={isRunning}
                    className="h-8 bg-white dark:bg-neutral-900 font-mono text-sm"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="test-interval" className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-1 block uppercase tracking-wide">
                    <RefreshCw size={10} className="inline mr-1" />
                    Intervall
                  </Label>
                  <Select value={customInterval} onValueChange={setCustomInterval} disabled={isRunning}>
                    <SelectTrigger id="test-interval" className="h-8 bg-white dark:bg-neutral-900 text-sm">
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
          
          {/* Quality Tests Section */}
          <div className="px-4 pb-4">
            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-md border border-neutral-200 dark:border-neutral-700 p-3">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={12} className="text-neutral-500" />
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">Qualitätstests (Optional)</span>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <Checkbox
                    checked={enableSeoTest}
                    onCheckedChange={(checked) => setEnableSeoTest(checked === true)}
                    disabled={isRunning}
                  />
                  <div className="flex items-center gap-1.5">
                    <Search size={12} className="text-neutral-500 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">SEO-Analyse</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">Meta-Tags, Überschriften, Alt-Texte</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <Checkbox
                    checked={enableAccessibilityTest}
                    onCheckedChange={(checked) => setEnableAccessibilityTest(checked === true)}
                    disabled={isRunning}
                  />
                  <div className="flex items-center gap-1.5">
                    <Accessibility size={12} className="text-neutral-500 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">Barrierefreiheit</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">WCAG 2.1 AA</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Test Count */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-1.5">
                <Globe size={12} className="text-neutral-500" />
                <span className="text-sm font-mono font-medium text-neutral-900 dark:text-white">{selectedFormIds.length}</span>
              </div>
              <span className="text-neutral-400">×</span>
              <div className="flex items-center gap-1.5">
                <CreditCard size={12} className="text-neutral-500" />
                <span className="text-sm font-mono font-medium text-neutral-900 dark:text-white">{selectedPaymentMethodIds.length}</span>
              </div>
              <span className="text-neutral-400">=</span>
              <div className="flex items-center gap-1.5">
                <Play size={12} className={totalTests > 0 ? "text-blue-500" : "text-neutral-400"} />
                <span className={`text-sm font-mono font-bold ${totalTests > 0 ? "text-neutral-900 dark:text-white" : "text-neutral-400"}`}>
                  {totalTests}
                </span>
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
            <Button onClick={onClose} variant="secondary" size="md" disabled={isRunning}>
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
