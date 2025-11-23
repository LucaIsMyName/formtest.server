import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import { Sun, Moon, Monitor, Download, Upload, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { CONFIG } from "../app.config";
import Button from "../components/ui/Button";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import type { ImportOptions, ImportResult } from "../../../common/types";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Checkbox } from "../components/ui/Checkbox";
import { RadioGroup, RadioGroupItem } from "../components/ui/RadioGroup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { Skeleton } from "../components/ui/Skeleton";

const SettingsSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-64 mt-1" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Settings: React.FC = () => {
  const { settings, isLoading, error, loadSettings, updateSetting } = useSettingsStore();

  // Local state for immediate updates
  const [donationAmount, setDonationAmount] = useState("50");
  const [donationInterval, setDonationInterval] = useState("0");
  const [testTimeout, setTestTimeout] = useState("30000");
  const [headlessMode, setHeadlessMode] = useState("true");
  const [theme, setTheme] = useState("system");

  // Import/Export state
  const [exportOptions, setExportOptions] = useState<ImportOptions>({
    includeForms: true,
    includePaymentMethods: true,
    includeTestRuns: true,
    includeSettings: true,
  });
  const [importMode, setImportMode] = useState<"overwrite" | "merge">("merge");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Delete state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: "forms" | "paymentMethods" | "testRuns" | "schedules" | "all";
    title: string;
    message: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Theme application function
  const applyTheme = (themeValue: string) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (themeValue === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(themeValue);
    }
  };

  // Update local state when settings load
  useEffect(() => {
    settings.forEach((setting) => {
      switch (setting.key) {
        case "default_donation_amount":
          setDonationAmount(setting.value);
          break;
        case "default_interval":
          setDonationInterval(setting.value);
          break;
        case "test_timeout":
          setTestTimeout(setting.value);
          break;
        case "headless_mode":
          setHeadlessMode(setting.value);
          break;
        case "theme":
          setTheme(setting.value);
          break;
      }
    });
  }, [settings]);

  // Auto-save handlers
  const handleDonationAmountChange = (value: string) => {
    setDonationAmount(value);
  };

  const saveDonationAmount = async () => {
    await updateSetting("default_donation_amount", donationAmount, "Standard-Spendenbetrag in EUR");
  };

  const handleDonationIntervalChange = async (value: string) => {
    setDonationInterval(value);
    await updateSetting("default_interval", value, "Standard-Spendenintervall (0=einmalig, 1=monatlich)");
  };

  const handleTestTimeoutChange = (value: string) => {
    setTestTimeout(value);
  };

  const saveTestTimeout = async () => {
    await updateSetting("test_timeout", testTimeout, "Test-Timeout in Millisekunden");
  };

  const handleHeadlessModeChange = async (value: string) => {
    setHeadlessMode(value);
    await updateSetting("headless_mode", value, "Tests im Headless-Modus ausführen");
  };

  const handleThemeChange = async (value: string) => {
    setTheme(value);
    await updateSetting("theme", value, "UI-Theme-Präferenz (system, light, dark)");
    // Apply theme immediately
    applyTheme(value);
  };

  const handleDelete = async () => {
    if (!deleteConfirmation) return;

    setIsDeleting(true);
    try {
      const api = window.api as any;
      switch (deleteConfirmation.type) {
        case "forms":
          await api.forms.deleteAll();
          break;
        case "paymentMethods":
          await api.paymentMethods.deleteAll();
          break;
        case "testRuns":
          await api.testRuns.deleteAll();
          break;
        case "schedules":
          await api.testSchedules.deleteAll();
          break;
        case "all":
          // Delete in order to respect foreign keys if cascade didn't work (but it does)
          await api.forms.deleteAll();
          await api.paymentMethods.deleteAll();
          // testRuns and schedules cascade deleted by forms/paymentMethods, but calling explicit delete ensures cleanup
          break;
      }
      setDeleteConfirmation(null);
      // Reload settings/state if needed
    } catch (error) {
      console.error("Failed to delete data:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={CONFIG.style.title.className}>Einstellungen</h1>
          <p className="mt-4 text-gray-800 dark:text-gray-400 mt-1">Globale Optionen für Formular-Tests konfigurieren</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border rounded-md p-4">
          <div className="flex">
            <div className="text-red-800 dark:text-red-200">
              <strong>Error:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {isLoading && settings.length === 0 ? (
        <SettingsSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Darstellung</h2>

            <div className="space-y-4">
              <div>
                <Label className="block mb-2 text-gray-800 dark:text-gray-400">Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleThemeChange("system")}
                    className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors ${theme === "system" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}>
                    <Monitor className="w-6 h-6 mb-2 text-gray-700 dark:text-gray-300" />
                    <span
                      style={{ fontStretch: "115%" }}
                      className="text-sm font-medium text-gray-900 dark:text-white">
                      System
                    </span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors ${theme === "light" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}>
                    <Sun className="w-6 h-6 mb-2 text-gray-700 dark:text-gray-300" />
                    <span
                      style={{ fontStretch: "115%" }}
                      className="text-sm font-medium text-gray-900 dark:text-white">
                      Hell
                    </span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors ${theme === "dark" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}>
                    <Moon className="w-6 h-6 mb-2 text-gray-700 dark:text-gray-300" />
                    <span
                      style={{ fontStretch: "115%" }}
                      className="text-sm font-medium text-gray-900 dark:text-white">
                      Dunkel
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Test Settings */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test-Einstellungen</h2>

            <div className="space-y-6">
              {/* Donation Amount */}
              <div className="space-y-2">
                <Label
                  className="text-gray-800 dark:text-gray-400"
                  htmlFor="donation-amount">
                  Standard-Spendenbetrag (EUR)
                </Label>
                <Input
                  id="donation-amount"
                  type="number"
                  value={donationAmount}
                  onChange={(e) => handleDonationAmountChange(e.target.value)}
                  onBlur={saveDonationAmount}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Der Standardbetrag, der beim Testen von Spendenformularen verwendet wird</p>
              </div>

              {/* Donation Interval */}
              <div className="space-y-2">
                <Label
                  className="text-gray-800 dark:text-gray-400"
                  htmlFor="donation-interval">
                  Standard-Spendenintervall
                </Label>
                <Select
                  value={donationInterval}
                  onValueChange={handleDonationIntervalChange}
                  disabled={isLoading}>
                  <SelectTrigger id="donation-interval">
                    <SelectValue placeholder="Wähle ein Intervall" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Einmalig</SelectItem>
                    <SelectItem value="1">Monatlich</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400">Das Standard-Spendenintervall für Tests</p>
              </div>

              {/* Test Timeout */}
              <div className="space-y-2">
                <Label
                  className="text-gray-800 dark:text-gray-400"
                  htmlFor="test-timeout">
                  Test-Timeout (Millisekunden)
                </Label>
                <Input
                  id="test-timeout"
                  type="number"
                  value={testTimeout}
                  onChange={(e) => handleTestTimeoutChange(e.target.value)}
                  onBlur={saveTestTimeout}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Maximale Wartezeit für Test-Operationen (Standard: 30000ms = 30 Sekunden)</p>
              </div>

              {/* Headless Mode */}
              <div className="space-y-2">
                <Label
                  className="text-gray-800 dark:text-gray-400"
                  htmlFor="headless-mode">
                  Headless-Modus
                </Label>
                <Select
                  value={headlessMode}
                  onValueChange={handleHeadlessModeChange}
                  disabled={isLoading}>
                  <SelectTrigger id="headless-mode">
                    <SelectValue placeholder="Headless Modus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Aktiviert</SelectItem>
                    <SelectItem value="false">Deaktiviert</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400">Browser-Tests ohne sichtbares Fenster ausführen</p>
              </div>
            </div>
          </div>

          {/* Data Management / Delete Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-gray-900 dark:text-white  text-lg font-semibold  mb-4 flex items-center gap-2">Daten löschen</h2>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Hier können Sie Daten endgültig löschen. Diese Aktionen können nicht rückgängig gemacht werden.</p>

              <div className="flex flex-wrap gap-4">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() =>
                    setDeleteConfirmation({
                      type: "forms",
                      title: "Alle Formulare löschen",
                      message: "Sind Sie sicher, dass Sie ALLE Formulare löschen möchten? Dies löscht auch alle zugehörigen Test-Resultate und Zeitpläne.",
                    })
                  }
                  className="justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Alle Formulare löschen
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() =>
                    setDeleteConfirmation({
                      type: "paymentMethods",
                      title: "Alle Bezahlmethoden löschen",
                      message: "Sind Sie sicher, dass Sie ALLE Bezahlmethoden löschen möchten? Dies löscht auch alle zugehörigen Test-Resultate und Zeitpläne.",
                    })
                  }
                  className="justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Alle Bezahlmethoden löschen
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() =>
                    setDeleteConfirmation({
                      type: "testRuns",
                      title: "Alle Test-Resultate löschen",
                      message: "Sind Sie sicher, dass Sie ALLE Test-Resultate löschen möchten?",
                    })
                  }
                  className="justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Alle Test-Resultate löschen
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() =>
                    setDeleteConfirmation({
                      type: "schedules",
                      title: "Alle Zeitpläne löschen",
                      message: "Sind Sie sicher, dass Sie ALLE Zeitpläne löschen möchten?",
                    })
                  }
                  className="justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Alle Zeitpläne löschen
                </Button>
              </div>

              <div className="">
                <Button
                  variant="danger"
                  size="md"
                  onClick={() =>
                    setDeleteConfirmation({
                      type: "all",
                      title: "ALLES löschen (Factory Reset)",
                      message: "ACHTUNG: Sind Sie sicher, dass Sie ALLE Daten (Formulare, Bezahlmethoden, Tests, Zeitpläne) löschen möchten? Die Anwendung wird auf den Ursprungszustand zurückgesetzt (außer Einstellungen).",
                    })
                  }
                  className=" hover:bg-red-700 text-white border-none justify-center">
                  <AlertTriangle
                    size={18}
                    className="mr-2"
                  />
                  Alle Daten löschen
                </Button>
              </div>
            </div>
          </div>

          {/* Import/Export Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Import / Export</h2>

            <div className="space-y-6">
              {/* Export Section */}
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Daten exportieren</h3>
                <p className="text-sm text-gray-800 dark:text-gray-400 mb-4">Wähle die Daten aus, die du exportieren möchtest:</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="export-forms"
                      checked={exportOptions.includeForms}
                      onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeForms: checked === true })}
                    />
                    <Label
                      className="font-normal cursor-pointer text-gray-800 dark:text-gray-400"
                      htmlFor="export-forms">
                      Formulare
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="export-payment"
                      checked={exportOptions.includePaymentMethods}
                      onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includePaymentMethods: checked === true })}
                    />
                    <Label
                      className="font-normal cursor-pointer text-gray-800 dark:text-gray-400"
                      htmlFor="export-payment">
                      Bezahlmethoden
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="export-runs"
                      checked={exportOptions.includeTestRuns}
                      onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeTestRuns: checked === true })}
                    />
                    <Label
                      className="font-normal cursor-pointer text-gray-800 dark:text-gray-400"
                      htmlFor="export-runs">
                      Test Resultate
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="export-settings"
                      checked={exportOptions.includeSettings}
                      onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeSettings: checked === true })}
                    />
                    <Label
                      className="font-normal cursor-pointer text-gray-800 dark:text-gray-400"
                      htmlFor="export-settings">
                      Einstellungen
                    </Label>
                  </div>
                </div>

                <Button
                  onClick={async () => {
                    setIsExporting(true);
                    setExportMessage(null);
                    try {
                      const result = await window.api.database.export(exportOptions);
                      if (result.success) {
                        setExportMessage(`✓ ${result.message}`);
                      } else {
                        setExportMessage(`✗ ${result.message}`);
                      }
                    } catch (error: any) {
                      setExportMessage(`✗ Export fehlgeschlagen: ${error.message}`);
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                  variant="primary"
                  size="md"
                  disabled={isExporting || (!exportOptions.includeForms && !exportOptions.includePaymentMethods && !exportOptions.includeTestRuns && !exportOptions.includeSettings)}
                  isLoading={isExporting}
                  className="flex items-center gap-2">
                  <Download size={16} />
                  {isExporting ? "Exportiere..." : "Daten exportieren"}
                </Button>

                {exportMessage && (
                  <div className={`mt-3 p-3 rounded-md ${exportMessage.startsWith("✓") ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200" : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"}`}>
                    <p className="text-sm">{exportMessage}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

              {/* Import Section */}
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Daten importieren</h3>
                <p className="text-sm text-gray-800 dark:text-gray-400 mb-4">Wähle den Import-Modus:</p>

                <RadioGroup
                  value={importMode}
                  onValueChange={(val) => setImportMode(val as "merge" | "overwrite")}
                  className="mb-4">
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem
                      value="merge"
                      id="import-merge"
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        className="cursor-pointer text-gray-800 dark:text-gray-400"
                        htmlFor="import-merge">
                        Zusammenführen (Empfohlen)
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Bestehende Daten bleiben erhalten. Neue Einträge werden hinzugefügt, unterschiedliche Einträge werden aktualisiert.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 mt-2">
                    <RadioGroupItem
                      value="overwrite"
                      id="import-overwrite"
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="import-overwrite"
                        className="cursor-pointer font-normal text-gray-800 dark:text-gray-400">
                        Überschreiben (Vorsicht!)
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Alle ausgewählten Daten werden gelöscht und durch die importierten Daten ersetzt.</p>
                    </div>
                  </div>
                </RadioGroup>

                <div className="space-y-3 mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zu importierende Daten:</p>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="import-forms"
                      checked={exportOptions.includeForms}
                      onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeForms: checked === true })}
                    />
                    <Label
                      className="font-normal cursor-pointer text-gray-800 dark:text-gray-400"
                      htmlFor="import-forms">
                      Formulare
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="import-payment"
                      checked={exportOptions.includePaymentMethods}
                      onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includePaymentMethods: checked === true })}
                    />
                    <Label
                      className="font-normal cursor-pointer text-gray-800 dark:text-gray-400"
                      htmlFor="import-payment">
                      Bezahlmethoden
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="import-runs"
                      checked={exportOptions.includeTestRuns}
                      onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeTestRuns: checked === true })}
                    />
                    <Label
                      className="font-normal cursor-pointer text-gray-800 dark:text-gray-400"
                      htmlFor="import-runs">
                      Test Resultate
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="import-settings"
                      checked={exportOptions.includeSettings}
                      onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeSettings: checked === true })}
                    />
                    <Label
                      className="font-normal cursor-pointer text-gray-800 dark:text-gray-400"
                      htmlFor="import-settings">
                      Einstellungen
                    </Label>
                  </div>
                </div>

                <Button
                  onClick={async () => {
                    setIsImporting(true);
                    setImportResult(null);
                    try {
                      const result = await window.api.database.import(importMode, exportOptions);
                      setImportResult(result);
                    } catch (error: any) {
                      setImportResult({
                        success: false,
                        imported: { forms: 0, paymentMethods: 0, testRuns: 0, settings: 0 },
                        skipped: { forms: 0, paymentMethods: 0, testRuns: 0, settings: 0 },
                        errors: [`Import fehlgeschlagen: ${error.message}`],
                        warnings: [],
                      });
                    } finally {
                      setIsImporting(false);
                    }
                  }}
                  variant="secondary"
                  size="md"
                  disabled={isImporting || (!exportOptions.includeForms && !exportOptions.includePaymentMethods && !exportOptions.includeTestRuns && !exportOptions.includeSettings)}
                  isLoading={isImporting}
                  className="flex items-center gap-2">
                  <Upload size={16} />
                  {isImporting ? "Importiere..." : "Daten importieren"}
                </Button>

                {importResult && importResult.imported && importResult.skipped && (
                  <div className={`mt-4 p-4 rounded-md ${importResult.success ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                    <div className="flex items-start gap-2 mb-3">
                      {importResult.success ? (
                        <CheckCircle2
                          className="text-green-600 dark:text-green-400 flex-shrink-0"
                          size={20}
                        />
                      ) : (
                        <AlertCircle
                          className="text-red-600 dark:text-red-400 flex-shrink-0"
                          size={20}
                        />
                      )}
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${importResult.success ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`}>{importResult.success ? "Import erfolgreich!" : "Import abgebrochen oder mit Fehlern"}</h4>
                      </div>
                    </div>

                    <div className="text-sm space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">Importiert:</p>
                          <ul className="text-xs !text-gray-600 !dark:text-gray-400 ml-4">
                            {importResult.imported.forms > 0 && <li>• {importResult.imported.forms} Formulare</li>}
                            {importResult.imported.paymentMethods > 0 && <li>• {importResult.imported.paymentMethods} Bezahlmethoden</li>}
                            {importResult.imported.testRuns > 0 && <li>• {importResult.imported.testRuns} Test Resultate</li>}
                            {importResult.imported.settings > 0 && <li>• {importResult.imported.settings} Einstellungen</li>}
                            {importResult.imported.forms === 0 && importResult.imported.paymentMethods === 0 && importResult.imported.testRuns === 0 && importResult.imported.settings === 0 && <li className="italic text-gray-500">Keine Daten importiert</li>}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">Übersprungen:</p>
                          <ul className="text-xs !text-gray-600 !dark:text-gray-400 ml-4">
                            {importResult.skipped.forms > 0 && <li>• {importResult.skipped.forms} Formulare</li>}
                            {importResult.skipped.paymentMethods > 0 && <li>• {importResult.skipped.paymentMethods} Bezahlmethoden</li>}
                            {importResult.skipped.testRuns > 0 && <li>• {importResult.skipped.testRuns} Test Resultate</li>}
                            {importResult.skipped.settings > 0 && <li>• {importResult.skipped.settings} Einstellungen</li>}
                            {importResult.skipped.forms === 0 && importResult.skipped.paymentMethods === 0 && importResult.skipped.testRuns === 0 && importResult.skipped.settings === 0 && <li className="italic text-gray-500">Keine Daten übersprungen</li>}
                          </ul>
                        </div>
                      </div>

                      {importResult.warnings && importResult.warnings.length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium text-yellow-700 dark:text-yellow-300">Warnungen:</p>
                          <ul className="text-xs text-yellow-600 dark:text-yellow-400 ml-4 mt-1">
                            {importResult.warnings.slice(0, 5).map((warning, i) => (
                              <li key={i}>• {warning}</li>
                            ))}
                            {importResult.warnings.length > 5 && <li className="italic">... und {importResult.warnings.length - 5} weitere</li>}
                          </ul>
                        </div>
                      )}

                      {importResult.errors && importResult.errors.length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium text-red-700 dark:text-red-300">Fehler:</p>
                          <ul className="text-xs text-red-600 dark:text-red-400 ml-4 mt-1">
                            {importResult.errors.slice(0, 5).map((error, i) => (
                              <li key={i}>• {error}</li>
                            ))}
                            {importResult.errors.length > 5 && <li className="italic">... und {importResult.errors.length - 5} weitere</li>}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={handleDelete}
        title={deleteConfirmation?.title || ""}
        message={deleteConfirmation?.message || ""}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Settings;
