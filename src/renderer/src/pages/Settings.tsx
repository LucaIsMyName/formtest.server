import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import { Sun, Moon, Monitor, Download, Upload, AlertCircle, CheckCircle2, AlertTriangle, Mail, Send } from "lucide-react";
import { CONFIG } from "../app.config";
import { StatusBadge } from "../components/ui/Badge";
import Button from "../components/ui/Button";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import SelectorEditor from "../components/SelectorEditor";
import type { ImportOptions, ImportResult } from "../../../common/types";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Checkbox } from "../components/ui/Checkbox";
import { RadioGroup, RadioGroupItem } from "../components/ui/RadioGroup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { Skeleton } from "../components/ui/Skeleton";

const SettingsSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-6">
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
  const [slowMotion, setSlowMotion] = useState("0");
  const [theme, setTheme] = useState("system");

  // Import/Export state
  const [exportOptions, setExportOptions] = useState<ImportOptions>({
    includeForms: true,
    includePaymentMethods: true,
    includeTestRuns: true,
    includeSchedules: true,
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

  // Email settings state
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailSmtpHost, setEmailSmtpHost] = useState("");
  const [emailSmtpPort, setEmailSmtpPort] = useState("587");
  const [emailSmtpSecure, setEmailSmtpSecure] = useState(false);
  const [emailSmtpUser, setEmailSmtpUser] = useState("");
  const [emailSmtpPass, setEmailSmtpPass] = useState("");
  const [emailFromEmail, setEmailFromEmail] = useState("");
  const [emailFromName, setEmailFromName] = useState("FormTest Server");
  const [emailToEmail, setEmailToEmail] = useState("");
  const [emailNotifySuccess, setEmailNotifySuccess] = useState(false);
  const [emailNotifyFailure, setEmailNotifyFailure] = useState(true);
  const [emailTestResult, setEmailTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

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
        case "slow_motion":
          setSlowMotion(setting.value);
          break;
        case "theme":
          setTheme(setting.value);
          break;
        case "email_enabled":
          setEmailEnabled(setting.value === "true");
          break;
        case "email_smtp_host":
          setEmailSmtpHost(setting.value);
          break;
        case "email_smtp_port":
          setEmailSmtpPort(setting.value);
          break;
        case "email_smtp_secure":
          setEmailSmtpSecure(setting.value === "true");
          break;
        case "email_smtp_user":
          setEmailSmtpUser(setting.value);
          break;
        case "email_smtp_pass":
          setEmailSmtpPass(setting.value);
          break;
        case "email_from_email":
          setEmailFromEmail(setting.value);
          break;
        case "email_from_name":
          setEmailFromName(setting.value);
          break;
        case "email_to_email":
          setEmailToEmail(setting.value);
          break;
        case "email_notify_success":
          setEmailNotifySuccess(setting.value === "true");
          break;
        case "email_notify_failure":
          setEmailNotifyFailure(setting.value === "true");
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

  const handleSlowMotionChange = async (value: string) => {
    setSlowMotion(value);
    await updateSetting("slow_motion", value, "Slow Motion Verzögerung in ms (0=aus, 500=langsam, 1000=sehr langsam)");
  };

  const handleThemeChange = async (value: string) => {
    setTheme(value);
    await updateSetting("theme", value, "UI-Theme-Präferenz (system, light, dark)");
    // Apply theme immediately
    applyTheme(value);
  };

  // Email settings handlers
  const handleEmailEnabledChange = async (checked: boolean) => {
    setEmailEnabled(checked);
    await updateSetting("email_enabled", String(checked), "E-Mail-Benachrichtigungen aktivieren");
  };

  const saveEmailSmtpHost = async () => {
    await updateSetting("email_smtp_host", emailSmtpHost, "SMTP Server Host");
  };

  const saveEmailSmtpPort = async () => {
    await updateSetting("email_smtp_port", emailSmtpPort, "SMTP Server Port");
  };

  const handleEmailSmtpSecureChange = async (checked: boolean) => {
    setEmailSmtpSecure(checked);
    await updateSetting("email_smtp_secure", String(checked), "SMTP SSL/TLS verwenden");
  };

  const saveEmailSmtpUser = async () => {
    await updateSetting("email_smtp_user", emailSmtpUser, "SMTP Benutzername");
  };

  const saveEmailSmtpPass = async () => {
    await updateSetting("email_smtp_pass", emailSmtpPass, "SMTP Passwort");
  };

  const saveEmailFromEmail = async () => {
    await updateSetting("email_from_email", emailFromEmail, "Absender E-Mail");
  };

  const saveEmailFromName = async () => {
    await updateSetting("email_from_name", emailFromName, "Absender Name");
  };

  const saveEmailToEmail = async () => {
    await updateSetting("email_to_email", emailToEmail, "Empfänger E-Mail");
  };

  const handleEmailNotifySuccessChange = async (checked: boolean) => {
    setEmailNotifySuccess(checked);
    await updateSetting("email_notify_success", String(checked), "Bei erfolgreichen Tests benachrichtigen");
  };

  const handleEmailNotifyFailureChange = async (checked: boolean) => {
    setEmailNotifyFailure(checked);
    await updateSetting("email_notify_failure", String(checked), "Bei fehlgeschlagenen Tests benachrichtigen");
  };

  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    setEmailTestResult(null);
    try {
      const api = window.api as any;
      const result = await api.email.testConnection();
      setEmailTestResult(result);
    } catch (error) {
      setEmailTestResult({ success: false, message: "Fehler beim Senden der Test-E-Mail" });
    } finally {
      setIsSendingTestEmail(false);
    }
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
         
          {/* Test Settings */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test-Einstellungen</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              {/* Row 1: Donation Amount | Headless Mode */}
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

              {/* Row 2: Donation Interval | Slow Motion */}
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
                    <SelectItem value="3">Vierteljährlich</SelectItem>
                    <SelectItem value="12">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400">Das Standard-Spendenintervall für Tests</p>
              </div>

              <div className="space-y-2">
                <Label
                  className="text-gray-800 dark:text-gray-400"
                  htmlFor="slow-motion">
                  Slow Motion (Debugging)
                </Label>
                <Select
                  value={slowMotion}
                  onValueChange={handleSlowMotionChange}
                  disabled={isLoading}>
                  <SelectTrigger id="slow-motion">
                    <SelectValue placeholder="Slow Motion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Aus (Normal)</SelectItem>
                    <SelectItem value="250">250ms (Schnell)</SelectItem>
                    <SelectItem value="500">500ms (Langsam)</SelectItem>
                    <SelectItem value="1000">1000ms (Sehr langsam)</SelectItem>
                    <SelectItem value="2000">2000ms (Debug)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400">Verzögerung zwischen Aktionen zum Debuggen. Deaktiviere Headless-Modus um den Browser zu sehen.</p>
              </div>

              {/* Row 3: Test Timeout (spans full width or left only) */}
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
            </div>
          </div>

          {/* Email Notifications Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Mail size={20} />
              E-Mail Benachrichtigungen
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Erhalten Sie E-Mail-Benachrichtigungen bei Autopilot-Tests. Konfigurieren Sie hier Ihren SMTP-Server.
            </p>

            <div className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-enabled"
                  checked={emailEnabled}
                  onCheckedChange={(checked) => handleEmailEnabledChange(checked === true)}
                  disabled={isLoading}
                />
                <Label className="font-normal cursor-pointer text-gray-800 dark:text-gray-400" htmlFor="email-enabled">
                  E-Mail-Benachrichtigungen aktivieren
                </Label>
              </div>

              {emailEnabled && (
                <>
                  {/* SMTP Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-800 dark:text-gray-400" htmlFor="smtp-host">SMTP Server</Label>
                      <Input
                        id="smtp-host"
                        type="text"
                        placeholder="smtp.example.com"
                        value={emailSmtpHost}
                        onChange={(e) => setEmailSmtpHost(e.target.value)}
                        onBlur={saveEmailSmtpHost}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-800 dark:text-gray-400" htmlFor="smtp-port">Port</Label>
                      <Input
                        id="smtp-port"
                        type="number"
                        placeholder="587"
                        value={emailSmtpPort}
                        onChange={(e) => setEmailSmtpPort(e.target.value)}
                        onBlur={saveEmailSmtpPort}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-800 dark:text-gray-400" htmlFor="smtp-user">Benutzername</Label>
                      <Input
                        id="smtp-user"
                        type="text"
                        placeholder="user@example.com"
                        value={emailSmtpUser}
                        onChange={(e) => setEmailSmtpUser(e.target.value)}
                        onBlur={saveEmailSmtpUser}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-800 dark:text-gray-400" htmlFor="smtp-pass">Passwort</Label>
                      <Input
                        id="smtp-pass"
                        type="password"
                        placeholder="••••••••"
                        value={emailSmtpPass}
                        onChange={(e) => setEmailSmtpPass(e.target.value)}
                        onBlur={saveEmailSmtpPass}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smtp-secure"
                      checked={emailSmtpSecure}
                      onCheckedChange={(checked) => handleEmailSmtpSecureChange(checked === true)}
                      disabled={isLoading}
                    />
                    <Label className="font-normal cursor-pointer text-gray-800 dark:text-gray-400" htmlFor="smtp-secure">
                      SSL/TLS verwenden (Port 465)
                    </Label>
                  </div>

                  {/* From/To Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-800 dark:text-gray-400" htmlFor="from-email">Absender E-Mail</Label>
                      <Input
                        id="from-email"
                        type="email"
                        placeholder="noreply@example.com"
                        value={emailFromEmail}
                        onChange={(e) => setEmailFromEmail(e.target.value)}
                        onBlur={saveEmailFromEmail}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-800 dark:text-gray-400" htmlFor="from-name">Absender Name</Label>
                      <Input
                        id="from-name"
                        type="text"
                        placeholder="FormTest Server"
                        value={emailFromName}
                        onChange={(e) => setEmailFromName(e.target.value)}
                        onBlur={saveEmailFromName}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-800 dark:text-gray-400" htmlFor="to-email">Empfänger E-Mail</Label>
                      <Input
                        id="to-email"
                        type="email"
                        placeholder="admin@example.com"
                        value={emailToEmail}
                        onChange={(e) => setEmailToEmail(e.target.value)}
                        onBlur={saveEmailToEmail}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="space-y-2">
                    <Label className="text-gray-800 dark:text-gray-400">Benachrichtigen bei:</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="notify-success"
                          checked={emailNotifySuccess}
                          onCheckedChange={(checked) => handleEmailNotifySuccessChange(checked === true)}
                          disabled={isLoading}
                        />
                        <Label className="font-normal cursor-pointer text-gray-800 dark:text-gray-400" htmlFor="notify-success">
                          Erfolgreichen Tests
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="notify-failure"
                          checked={emailNotifyFailure}
                          onCheckedChange={(checked) => handleEmailNotifyFailureChange(checked === true)}
                          disabled={isLoading}
                        />
                        <Label className="font-normal cursor-pointer text-gray-800 dark:text-gray-400" htmlFor="notify-failure">
                          Fehlgeschlagenen Tests
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Test Email Button */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={handleSendTestEmail}
                      disabled={isLoading || isSendingTestEmail || !emailSmtpHost || !emailToEmail}
                      className="gap-2"
                    >
                      <Send size={16} />
                      {isSendingTestEmail ? "Sende..." : "Test-E-Mail senden"}
                    </Button>
                    {emailTestResult && (
                      <div className={`flex items-center gap-2 text-sm ${emailTestResult.success ? "text-green-600" : "text-red-600"}`}>
                        {emailTestResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {emailTestResult.message}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Selector Configuration Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Formular-Selektoren</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Hier können Sie CSS-Selektoren für die automatische Formular-Erkennung anpassen. 
              Eigene Selektoren haben Priorität vor den Standard-Selektoren. 
              Per-Form Feld-Mappings überschreiben diese globalen Einstellungen.
            </p>
            <SelectorEditor />
          </div>

          {/* Data Management / Delete Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-6">
            <h2 className="text-gray-900 dark:text-white text-lg font-semibold mb-4">Daten löschen</h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Hier können Sie Daten endgültig löschen. Diese Aktionen können nicht rückgängig gemacht werden.</p>

            <div className="flex flex-wrap gap-3">
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
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
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
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
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
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
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
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                Alle Zeitpläne löschen
              </Button>

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
                className="hover:bg-red-700 text-white border-none gap-2">
                <AlertTriangle size={18} />
                Alle Daten löschen
              </Button>
            </div>
          </div>

          {/* Import/Export Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-6">
            <h2 className="sr-only text-lg font-semibold text-gray-900 dark:text-white mb-4">Import / Export</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      id="export-schedules"
                      checked={exportOptions.includeSchedules}
                      onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeSchedules: checked === true })}
                    />
                    <Label
                      className="font-normal cursor-pointer text-gray-800 dark:text-gray-400"
                      htmlFor="export-schedules">
                      Autopilot (Zeitpläne)
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
                  disabled={isExporting || (!exportOptions.includeForms && !exportOptions.includePaymentMethods && !exportOptions.includeTestRuns && !exportOptions.includeSchedules && !exportOptions.includeSettings)}
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
                  <div className="pointer-none opacity-50 flex items-start space-x-2 mt-2">
                    <RadioGroupItem
                      value="overwrite"
                      id="import-overwrite"
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="import-overwrite"
                        className="cursor-pointer font-normal text-gray-800 dark:text-gray-400">
                        Überschreiben <StatusBadge status="">Development</StatusBadge>
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
                      id="import-schedules"
                      checked={exportOptions.includeSchedules}
                      onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeSchedules: checked === true })}
                    />
                    <Label
                      className="font-normal cursor-pointer text-gray-800 dark:text-gray-400"
                      htmlFor="import-schedules">
                      Autopilot (Zeitpläne)
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
                        imported: { forms: 0, paymentMethods: 0, testRuns: 0, schedules: 0, settings: 0 },
                        skipped: { forms: 0, paymentMethods: 0, testRuns: 0, schedules: 0, settings: 0 },
                        errors: [`Import fehlgeschlagen: ${error.message}`],
                        warnings: [],
                      });
                    } finally {
                      setIsImporting(false);
                    }
                  }}
                  variant="secondary"
                  size="md"
                  disabled={isImporting || (!exportOptions.includeForms && !exportOptions.includePaymentMethods && !exportOptions.includeTestRuns && !exportOptions.includeSchedules && !exportOptions.includeSettings)}
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
                            {importResult.imported.schedules > 0 && <li>• {importResult.imported.schedules} Autopilot (Zeitpläne)</li>}
                            {importResult.imported.settings > 0 && <li>• {importResult.imported.settings} Einstellungen</li>}
                            {importResult.imported.forms === 0 && importResult.imported.paymentMethods === 0 && importResult.imported.testRuns === 0 && importResult.imported.schedules === 0 && importResult.imported.settings === 0 && <li className="italic text-gray-500">Keine Daten importiert</li>}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">Übersprungen:</p>
                          <ul className="text-xs !text-gray-600 !dark:text-gray-400 ml-4">
                            {importResult.skipped.forms > 0 && <li>• {importResult.skipped.forms} Formulare</li>}
                            {importResult.skipped.paymentMethods > 0 && <li>• {importResult.skipped.paymentMethods} Bezahlmethoden</li>}
                            {importResult.skipped.testRuns > 0 && <li>• {importResult.skipped.testRuns} Test Resultate</li>}
                            {importResult.skipped.schedules > 0 && <li>• {importResult.skipped.schedules} Autopilot (Zeitpläne)</li>}
                            {importResult.skipped.settings > 0 && <li>• {importResult.skipped.settings} Einstellungen</li>}
                            {importResult.skipped.forms === 0 && importResult.skipped.paymentMethods === 0 && importResult.skipped.testRuns === 0 && importResult.skipped.schedules === 0 && importResult.skipped.settings === 0 && <li className="italic text-gray-500">Keine Daten übersprungen</li>}
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

           <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Darstellung</h2>

            <div className="space-y-4">
              <div>
                <Label className="block mb-2 text-gray-800 dark:text-gray-400">Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleThemeChange("system")}
                    className={`flex flex-col items-center justify-center p-4 border rounded-md transition-colors ${theme === "system" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}>
                    <Monitor className="w-6 h-6 mb-2 text-gray-700 dark:text-gray-300" />
                    <span
                      style={{ fontStretch: "115%" }}
                      className="text-sm font-medium text-gray-900 dark:text-white">
                      System
                    </span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`flex flex-col items-center justify-center p-4 border rounded-md transition-colors ${theme === "light" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}>
                    <Sun className="w-6 h-6 mb-2 text-gray-700 dark:text-gray-300" />
                    <span
                      style={{ fontStretch: "115%" }}
                      className="text-sm font-medium text-gray-900 dark:text-white">
                      Hell
                    </span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`flex flex-col items-center justify-center p-4 border rounded-md transition-colors ${theme === "dark" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}>
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
