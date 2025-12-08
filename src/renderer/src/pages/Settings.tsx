import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import { Sun, Moon, Monitor, AlertCircle, CheckCircle2, Mail, Settings2, Database, Sliders, Code, Globe, Copy, RefreshCw, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { CONFIG } from "../app.config";
import Button from "../components/ui/Button";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import SelectorEditor from "../components/SelectorEditor";
import GlobalDefaultsEditor from "../components/GlobalDefaultsEditor";
import type { ImportOptions, ImportResult } from "../../../common/types";
import { Input } from "../components/ui/Input";
import { Checkbox } from "../components/ui/Checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { Skeleton } from "../components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { TableFilter } from "../components/ui/TableFilter";

// Setting item interface
interface SettingItem {
  id: string;
  category: "test" | "ui" | "email" | "data" | "selectors" | "api" | "security";
  name: string;
  description: string;
  type: "input" | "select" | "checkbox" | "theme" | "action" | "component" | "api-key" | "password";
  value: string;
  options?: { value: string; label: string }[];
  disabled?: boolean;
  action?: () => void;
  actionLabel?: string;
  actionVariant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
}

const SettingsSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm overflow-hidden">
    <div className="p-4 space-y-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton
          key={i}
          className="h-10 w-full"
        />
      ))}
    </div>
  </div>
);

const Settings: React.FC = () => {
  const { settings, isLoading, error, loadSettings, updateSetting } = useSettingsStore();

  // Local state for immediate updates
  const [donationAmount, setDonationAmount] = useState("5");
  const [donationInterval, setDonationInterval] = useState("0");
  const [testTimeout, setTestTimeout] = useState("30000");
  const [headlessMode, setHeadlessMode] = useState("true");
  const [slowMotion, setSlowMotion] = useState("0");
  const [theme, setTheme] = useState("system");

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

  // Import/Export state
  const [exportOptions] = useState<ImportOptions>({
    includeForms: true,
    includePaymentMethods: true,
    includeTestRuns: true,
    includeSchedules: true,
    includeSettings: true,
  });
  const [importMode] = useState<"overwrite" | "merge">("merge");
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

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  // API Server state
  const [apiPort, setApiPort] = useState("3847");
  const [apiKey, setApiKey] = useState("");
  const [apiServerRunning, setApiServerRunning] = useState(false);
  const [apiStatusMessage, setApiStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Master Password state
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Load API server status on mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const api = window.api as any;
        const status = await api.apiServer.status();
        setApiServerRunning(status.running);
      } catch (error) {
        console.error("Failed to check API status:", error);
      }
    };
    checkApiStatus();
  }, []);

  // Load API settings from stored settings
  useEffect(() => {
    settings.forEach((setting) => {
      switch (setting.key) {
        case "api_enabled":
          // API enabled state is derived from apiServerRunning
          break;
        case "api_port":
          setApiPort(setting.value);
          break;
        case "api_key":
          setApiKey(setting.value);
          break;
      }
    });
  }, [settings]);

  // Load password status on mount
  useEffect(() => {
    const checkPasswordStatus = async () => {
      try {
        const isEnabled = await window.api.password.isEnabled();
        setPasswordEnabled(isEnabled);
      } catch (error) {
        console.error("Failed to check password status:", error);
      }
    };
    checkPasswordStatus();
  }, []);

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

  // Handler functions (defined before useMemo that uses them)
  const handleSendTestEmail = useCallback(async () => {
    setIsSendingTestEmail(true);
    setEmailTestResult(null);
    try {
      const api = window.api as any;
      const result = await api.email.testConnection();
      setEmailTestResult(result);
    } catch (error) {
      setEmailTestResult({ success: false, message: "Fehler beim Senden" });
    } finally {
      setIsSendingTestEmail(false);
    }
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      const result = await window.api.database.export(exportOptions);
      if (result.success) {
        setExportMessage(`Export erfolgreich: ${result.filePath}`);
      } else {
        setExportMessage(`Export fehlgeschlagen`);
      }
    } catch (error) {
      setExportMessage("Export fehlgeschlagen");
    } finally {
      setIsExporting(false);
    }
  }, [exportOptions]);

  const handleImport = useCallback(async () => {
    setIsImporting(true);
    setImportResult(null);
    try {
      const result = await window.api.database.import(importMode, exportOptions);
      if (result) {
        setImportResult(result);
        if (result.success) {
          loadSettings();
        }
      }
    } catch (error) {
      setImportResult({ success: false, imported: { forms: 0, paymentMethods: 0, testRuns: 0, schedules: 0, settings: 0 }, skipped: { forms: 0, paymentMethods: 0, testRuns: 0, schedules: 0, settings: 0 }, errors: ["Import fehlgeschlagen"], warnings: [] });
    } finally {
      setIsImporting(false);
    }
  }, [importMode, exportOptions, loadSettings]);

  // API Server handlers
  const handleGenerateApiKey = useCallback(async () => {
    try {
      const api = window.api as any;
      console.log("Generating API key...");
      const newKey = await api.apiServer.generateKey();
      console.log("Generated key:", newKey ? "success" : "empty");
      if (newKey) {
        setApiKey(newKey);
        await updateSetting("api_key", newKey, "API Key");
        setApiStatusMessage({ type: "success", message: "Neuer API-Key generiert" });
        setTimeout(() => setApiStatusMessage(null), 3000);
      } else {
        setApiStatusMessage({ type: "error", message: "Kein Key generiert" });
      }
    } catch (error) {
      console.error("Error generating API key:", error);
      setApiStatusMessage({ type: "error", message: `Fehler: ${error instanceof Error ? error.message : "Unbekannt"}` });
    }
  }, [updateSetting]);

  const handleCopyApiKey = useCallback(() => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setApiStatusMessage({ type: "success", message: "API-Key kopiert" });
      setTimeout(() => setApiStatusMessage(null), 2000);
    }
  }, [apiKey]);

  const handleToggleApiServer = useCallback(async () => {
    try {
      const api = window.api as any;
      if (apiServerRunning) {
        const result = await api.apiServer.stop();
        if (result.success) {
          setApiServerRunning(false);
          await updateSetting("api_enabled", "false", "API aktiviert");
          setApiStatusMessage({ type: "success", message: "API Server gestoppt" });
        } else {
          setApiStatusMessage({ type: "error", message: result.error || "Fehler beim Stoppen" });
        }
      } else {
        if (!apiKey) {
          setApiStatusMessage({ type: "error", message: "Bitte zuerst einen API-Key generieren" });
          return;
        }
        const port = parseInt(apiPort) || 3847;
        const result = await api.apiServer.start(port, apiKey);
        if (result.success) {
          setApiServerRunning(true);
          await updateSetting("api_enabled", "true", "API aktiviert");
          await updateSetting("api_port", String(port), "API Port");
          setApiStatusMessage({ type: "success", message: `API Server gestartet auf Port ${port}` });
        } else {
          setApiStatusMessage({ type: "error", message: result.error || "Fehler beim Starten" });
        }
      }
      setTimeout(() => setApiStatusMessage(null), 3000);
    } catch (error) {
      setApiStatusMessage({ type: "error", message: "Unerwarteter Fehler" });
    }
  }, [apiServerRunning, apiKey, apiPort, updateSetting]);

  // Password handlers
  const handleSetPassword = useCallback(async () => {
    if (!newPassword) {
      setPasswordMessage({ type: "error", message: "Bitte Passwort eingeben" });
      return;
    }
    if (newPassword.length < 4) {
      setPasswordMessage({ type: "error", message: "Passwort muss mindestens 4 Zeichen haben" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", message: "Passwörter stimmen nicht überein" });
      return;
    }

    setIsSettingPassword(true);
    try {
      const result = await window.api.password.set(newPassword);
      if (result.success) {
        setPasswordEnabled(true);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordMessage({ type: "success", message: "Master-Passwort aktiviert" });
      } else {
        setPasswordMessage({ type: "error", message: result.error || "Fehler beim Setzen" });
      }
    } catch (error) {
      setPasswordMessage({ type: "error", message: "Unerwarteter Fehler" });
    } finally {
      setIsSettingPassword(false);
      setTimeout(() => setPasswordMessage(null), 3000);
    }
  }, [newPassword, confirmPassword]);

  const handleDisablePassword = useCallback(async () => {
    if (!currentPassword) {
      setPasswordMessage({ type: "error", message: "Bitte aktuelles Passwort eingeben" });
      return;
    }

    setIsSettingPassword(true);
    try {
      const result = await window.api.password.disable(currentPassword);
      if (result.success) {
        setPasswordEnabled(false);
        setCurrentPassword("");
        setPasswordMessage({ type: "success", message: "Master-Passwort deaktiviert" });
      } else {
        setPasswordMessage({ type: "error", message: result.error || "Falsches Passwort" });
      }
    } catch (error) {
      setPasswordMessage({ type: "error", message: "Unerwarteter Fehler" });
    } finally {
      setIsSettingPassword(false);
      setTimeout(() => setPasswordMessage(null), 3000);
    }
  }, [currentPassword]);

  // Build settings items for table
  const settingsItems: SettingItem[] = useMemo(
    () => [
      // Test Settings
      { id: "donation_amount", category: "test", name: "Spendenbetrag (EUR)", description: "Standard-Spendenbetrag für Tests", type: "input", value: donationAmount },
      {
        id: "donation_interval",
        category: "test",
        name: "Spendenintervall",
        description: "Standard-Intervall für Tests",
        type: "select",
        value: donationInterval,
        options: [
          { value: "0", label: "Einmalig" },
          { value: "1", label: "Monatlich" },
          { value: "3", label: "Vierteljährlich" },
          { value: "12", label: "Jährlich" },
        ],
      },
      {
        id: "headless_mode",
        category: "test",
        name: "Headless-Modus",
        description: "Browser ohne sichtbares Fenster",
        type: "select",
        value: headlessMode,
        options: [
          { value: "true", label: "Aktiviert" },
          { value: "false", label: "Deaktiviert" },
        ],
      },
      {
        id: "slow_motion",
        category: "test",
        name: "Slow Motion",
        description: "Verzögerung zwischen Aktionen (Debugging)",
        type: "select",
        value: slowMotion,
        options: [
          { value: "0", label: "Aus (Normal)" },
          { value: "250", label: "250ms" },
          { value: "500", label: "500ms" },
          { value: "1000", label: "1000ms" },
          { value: "2000", label: "2000ms" },
        ],
      },
      { id: "test_timeout", category: "test", name: "Test-Timeout (ms)", description: "Maximale Wartezeit für Operationen", type: "input", value: testTimeout },
      // UI Settings
      { id: "theme", category: "ui", name: "Theme", description: "Farbschema der Anwendung", type: "theme", value: theme },
      // Email Settings
      { id: "email_enabled", category: "email", name: "E-Mail aktiviert", description: "Benachrichtigungen per E-Mail", type: "checkbox", value: String(emailEnabled) },
      { id: "email_smtp_host", category: "email", name: "SMTP Server", description: "Hostname des SMTP-Servers", type: "input", value: emailSmtpHost, disabled: !emailEnabled },
      { id: "email_smtp_port", category: "email", name: "SMTP Port", description: "Port des SMTP-Servers", type: "input", value: emailSmtpPort, disabled: !emailEnabled },
      { id: "email_smtp_secure", category: "email", name: "SSL/TLS", description: "Sichere Verbindung verwenden", type: "checkbox", value: String(emailSmtpSecure), disabled: !emailEnabled },
      { id: "email_smtp_user", category: "email", name: "SMTP Benutzer", description: "Benutzername für SMTP", type: "input", value: emailSmtpUser, disabled: !emailEnabled },
      { id: "email_smtp_pass", category: "email", name: "SMTP Passwort", description: "Passwort für SMTP", type: "input", value: emailSmtpPass, disabled: !emailEnabled },
      { id: "email_from_email", category: "email", name: "Absender E-Mail", description: "E-Mail-Adresse des Absenders", type: "input", value: emailFromEmail, disabled: !emailEnabled },
      { id: "email_from_name", category: "email", name: "Absender Name", description: "Name des Absenders", type: "input", value: emailFromName, disabled: !emailEnabled },
      { id: "email_to_email", category: "email", name: "Empfänger E-Mail", description: "E-Mail-Adresse des Empfängers", type: "input", value: emailToEmail, disabled: !emailEnabled },
      { id: "email_notify_success", category: "email", name: "Bei Erfolg", description: "Bei erfolgreichen Tests benachrichtigen", type: "checkbox", value: String(emailNotifySuccess), disabled: !emailEnabled },
      { id: "email_notify_failure", category: "email", name: "Bei Fehler", description: "Bei fehlgeschlagenen Tests benachrichtigen", type: "checkbox", value: String(emailNotifyFailure), disabled: !emailEnabled },
      { id: "email_test", category: "email", name: "Test-E-Mail", description: "Konfiguration testen", type: "action", value: "", actionLabel: isSendingTestEmail ? "Sende..." : "Senden", action: handleSendTestEmail, actionVariant: "secondary", disabled: !emailEnabled || !emailSmtpHost || !emailToEmail },
      // API Server
      { id: "api_toggle", category: "api", name: "API Server", description: apiServerRunning ? `Läuft auf Port ${apiPort}` : "Server starten für externe Zugriffe (CI/CD)", type: "action", value: "", actionLabel: apiServerRunning ? "Stoppen" : "Starten", action: handleToggleApiServer, actionVariant: apiServerRunning ? "danger" : "primary" },
      { id: "api_port", category: "api", name: "Port", description: "Port für den API Server (Standard: 3847)", type: "input", value: apiPort, disabled: apiServerRunning },
      { id: "api_key", category: "api", name: "API Key", description: "Authentifizierungs-Key für API-Zugriffe", type: "api-key", value: apiKey },
      // Data Management
      { id: "data_export", category: "data", name: "Daten exportieren", description: "Formulare, Bezahlmethoden, Tests exportieren", type: "action", value: "", actionLabel: isExporting ? "Exportiere..." : "Exportieren", action: handleExport, actionVariant: "secondary" },
      { id: "data_import", category: "data", name: "Daten importieren", description: "Daten aus Backup wiederherstellen", type: "action", value: "", actionLabel: isImporting ? "Importiere..." : "Importieren", action: handleImport, actionVariant: "secondary" },
      { id: "delete_forms", category: "data", name: "Formulare löschen", description: "Alle Formulare und zugehörige Tests löschen", type: "action", value: "", actionLabel: "Löschen", action: () => setDeleteConfirmation({ type: "forms", title: "Alle Formulare löschen", message: "Alle Formulare und zugehörige Tests werden gelöscht." }), actionVariant: "danger" },
      { id: "delete_payments", category: "data", name: "Bezahlmethoden löschen", description: "Alle Bezahlmethoden löschen", type: "action", value: "", actionLabel: "Löschen", action: () => setDeleteConfirmation({ type: "paymentMethods", title: "Alle Bezahlmethoden löschen", message: "Alle Bezahlmethoden werden gelöscht." }), actionVariant: "danger" },
      { id: "delete_tests", category: "data", name: "Tests löschen", description: "Alle Testergebnisse löschen", type: "action", value: "", actionLabel: "Löschen", action: () => setDeleteConfirmation({ type: "testRuns", title: "Alle Tests löschen", message: "Alle Testergebnisse werden gelöscht." }), actionVariant: "danger" },
      { id: "delete_schedules", category: "data", name: "Zeitpläne löschen", description: "Alle Zeitpläne löschen", type: "action", value: "", actionLabel: "Löschen", action: () => setDeleteConfirmation({ type: "schedules", title: "Alle Zeitpläne löschen", message: "Alle Zeitpläne werden gelöscht." }), actionVariant: "danger" },
      { id: "delete_all", category: "data", name: "Alle Daten löschen", description: "ALLE Daten unwiderruflich löschen", type: "action", value: "", actionLabel: "Alles löschen", action: () => setDeleteConfirmation({ type: "all", title: "Alle Daten löschen", message: "ALLE Daten (Formulare, Bezahlmethoden, Tests, Zeitpläne) werden gelöscht!" }), actionVariant: "danger" },
      // Selectors
      { id: "selectors", category: "selectors", name: "Selektor-Konfiguration", description: "CSS-Selektoren für automatische Formular-Erkennung. Eigene Selektoren haben Priorität vor Standard-Selektoren.", type: "component", value: "", fullWidth: true },
      // Global Defaults
      { id: "global_defaults", category: "selectors", name: "Globale Standardwerte", description: "Standard-Feldwerte die Faker.js überschreiben. Form-Mappings haben höchste Priorität.", type: "component", value: "", fullWidth: true },
      // Security
      { id: "master_password", category: "security", name: "Master-Passwort", description: passwordEnabled ? "Passwortschutz ist aktiviert" : "App beim Start mit Passwort schützen", type: "password", value: "", fullWidth: true },
    ],
    [donationAmount, donationInterval, headlessMode, slowMotion, testTimeout, theme, emailEnabled, emailSmtpHost, emailSmtpPort, emailSmtpSecure, emailSmtpUser, emailSmtpPass, emailFromEmail, emailFromName, emailToEmail, emailNotifySuccess, emailNotifyFailure, isSendingTestEmail, isExporting, isImporting, handleSendTestEmail, handleExport, handleImport, apiServerRunning, apiPort, apiKey, handleToggleApiServer, passwordEnabled]
  );

  // Filter settings
  const filteredSettings = useMemo(() => {
    return settingsItems.filter((item) => {
      const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [settingsItems, searchTerm, categoryFilter]);

  // Handlers
  const handleSettingChange = async (id: string, value: string) => {
    switch (id) {
      case "donation_amount":
        setDonationAmount(value);
        break;
      case "donation_interval":
        setDonationInterval(value);
        await updateSetting("default_interval", value, "Standard-Spendenintervall");
        break;
      case "headless_mode":
        setHeadlessMode(value);
        await updateSetting("headless_mode", value, "Headless-Modus");
        break;
      case "slow_motion":
        setSlowMotion(value);
        await updateSetting("slow_motion", value, "Slow Motion");
        break;
      case "test_timeout":
        setTestTimeout(value);
        break;
      case "theme":
        setTheme(value);
        await updateSetting("theme", value, "UI-Theme");
        applyTheme(value);
        break;
      case "email_enabled":
        setEmailEnabled(value === "true");
        await updateSetting("email_enabled", value, "E-Mail aktiviert");
        break;
      case "email_smtp_host":
        setEmailSmtpHost(value);
        break;
      case "email_smtp_port":
        setEmailSmtpPort(value);
        break;
      case "email_smtp_secure":
        setEmailSmtpSecure(value === "true");
        await updateSetting("email_smtp_secure", value, "SSL/TLS");
        break;
      case "email_smtp_user":
        setEmailSmtpUser(value);
        break;
      case "email_smtp_pass":
        setEmailSmtpPass(value);
        break;
      case "email_from_email":
        setEmailFromEmail(value);
        break;
      case "email_from_name":
        setEmailFromName(value);
        break;
      case "email_to_email":
        setEmailToEmail(value);
        break;
      case "email_notify_success":
        setEmailNotifySuccess(value === "true");
        await updateSetting("email_notify_success", value, "Bei Erfolg benachrichtigen");
        break;
      case "email_notify_failure":
        setEmailNotifyFailure(value === "true");
        await updateSetting("email_notify_failure", value, "Bei Fehler benachrichtigen");
        break;
      case "api_port":
        setApiPort(value);
        break;
    }
  };

  const handleSettingBlur = async (id: string) => {
    switch (id) {
      case "donation_amount":
        await updateSetting("default_donation_amount", donationAmount, "Standard-Spendenbetrag");
        break;
      case "test_timeout":
        await updateSetting("test_timeout", testTimeout, "Test-Timeout");
        break;
      case "email_smtp_host":
        await updateSetting("email_smtp_host", emailSmtpHost, "SMTP Server");
        break;
      case "email_smtp_port":
        await updateSetting("email_smtp_port", emailSmtpPort, "SMTP Port");
        break;
      case "email_smtp_user":
        await updateSetting("email_smtp_user", emailSmtpUser, "SMTP Benutzer");
        break;
      case "email_smtp_pass":
        await updateSetting("email_smtp_pass", emailSmtpPass, "SMTP Passwort");
        break;
      case "email_from_email":
        await updateSetting("email_from_email", emailFromEmail, "Absender E-Mail");
        break;
      case "email_from_name":
        await updateSetting("email_from_name", emailFromName, "Absender Name");
        break;
      case "email_to_email":
        await updateSetting("email_to_email", emailToEmail, "Empfänger E-Mail");
        break;
      case "api_port":
        await updateSetting("api_port", apiPort, "API Port");
        break;
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
          await api.schedules.deleteAll();
          break;
        case "all":
          await api.forms.deleteAll();
          await api.paymentMethods.deleteAll();
          await api.testRuns.deleteAll();
          await api.schedules.deleteAll();
          break;
      }
      setDeleteConfirmation(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "test":
        return "Test";
      case "ui":
        return "UI";
      case "email":
        return "E-Mail";
      case "data":
        return "Daten";
      case "selectors":
        return "Selektoren";
      case "api":
        return "API";
      case "security":
        return "Sicherheit";
      default:
        return category;
    }
  };

  const getCategoryBgColor = (category: string) => {
    switch (category) {
      case "test":
        return "bg-blue-50/50 dark:bg-blue-950/30";
      case "ui":
        return "bg-yellow-50/50 dark:bg-yellow-950/30";
      case "email":
        return "bg-green-50/50 dark:bg-green-950/30";
      case "data":
        return "bg-purple-50/50 dark:bg-purple-950/30";
      case "selectors":
        return "bg-cyan-50/50 dark:bg-cyan-950/30";
      case "api":
        return "bg-orange-50/50 dark:bg-orange-950/30";
      case "security":
        return "bg-red-50/50 dark:bg-red-950/30";
      default:
        return "";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "test":
        return (
          <Sliders
            size={14}
            className="text-blue-500"
          />
        );
      case "ui":
        return (
          <Sun
            size={14}
            className="text-yellow-500"
          />
        );
      case "email":
        return (
          <Mail
            size={14}
            className="text-green-500"
          />
        );
      case "data":
        return (
          <Database
            size={14}
            className="text-purple-500"
          />
        );
      case "selectors":
        return (
          <Code
            size={14}
            className="text-cyan-500"
          />
        );
      case "api":
        return (
          <Globe
            size={14}
            className="text-orange-500"
          />
        );
      case "security":
        return (
          <Shield
            size={14}
            className="text-red-500"
          />
        );
      default:
        return <Settings2 size={14} />;
    }
  };

  const renderSettingControl = (item: SettingItem) => {
    const isDisabled = isLoading || item.disabled;

    switch (item.type) {
      case "input":
        return (
          <Input
            type={item.id.includes("port") || item.id.includes("timeout") || item.id.includes("amount") ? "number" : item.id.includes("pass") ? "password" : "text"}
            value={item.value}
            onChange={(e) => handleSettingChange(item.id, e.target.value)}
            onBlur={() => handleSettingBlur(item.id)}
            className={`h-7 text-xs w-full ${isDisabled ? "opacity-50" : ""}`}
            disabled={isDisabled}
          />
        );
      case "select":
        return (
          <Select
            value={item.value}
            onValueChange={(v) => handleSettingChange(item.id, v)}
            disabled={isDisabled}>
            <SelectTrigger className={`h-7 text-xs w-full border border-gray-200 !dark:border-gray-800 bg-white !dark:bg-gray-800 px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 dark:border-gray-700 dark:bg-gray-700 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus:ring-gray-300 dark:text-white ${isDisabled ? "opacity-50" : ""}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {item.options?.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "checkbox":
        return (
          <Checkbox
            checked={item.value === "true"}
            onCheckedChange={(checked) => handleSettingChange(item.id, String(checked))}
            disabled={isDisabled}
            className={isDisabled ? "opacity-50" : ""}
          />
        );
      case "theme":
        return (
          <div className="flex gap-1">
            {[
              { value: "light", icon: <Sun size={14} />, label: "Hell" },
              { value: "dark", icon: <Moon size={14} />, label: "Dunkel" },
              { value: "system", icon: <Monitor size={14} />, label: "System" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => handleSettingChange("theme", t.value)}
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${theme === t.value ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-transparent hover:border-gray-300 dark:hover:border-gray-600"}`}
                disabled={isDisabled}>
                {t.icon}
              </button>
            ))}
          </div>
        );
      case "api-key":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={item.value || "Kein Key generiert"}
              readOnly
              className={`h-7 text-xs font-mono flex-1 ${!item.value ? "text-gray-400 italic" : ""}`}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyApiKey}
              disabled={!item.value}
              className="text-xs h-7 px-2"
              title="Kopieren">
              <Copy size={12} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGenerateApiKey}
              className="text-xs h-7 px-2"
              title="Neuen Key generieren">
              <RefreshCw size={12} />
            </Button>
          </div>
        );
      case "action":
        return (
          <Button
            variant={item.actionVariant || "secondary"}
            size="sm"
            onClick={item.action}
            disabled={isDisabled}
            className="text-xs h-7">
            {item.actionLabel}
          </Button>
        );
      case "component":
        if (item.id === "selectors") {
          return <SelectorEditor />;
        }
        if (item.id === "global_defaults") {
          return <GlobalDefaultsEditor />;
        }
        return null;

      case "password":
        return (
          <div className="space-y-4 p-4">
            {/* Status indicator */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${passwordEnabled ? "bg-green-500" : "bg-gray-400"}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">{passwordEnabled ? "Passwortschutz aktiv" : "Passwortschutz inaktiv"}</span>
            </div>

            {passwordEnabled ? (
              // Disable password form
              <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Lock size={14} />
                  Passwortschutz deaktivieren
                </div>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Aktuelles Passwort"
                    className="h-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDisablePassword}
                  disabled={isSettingPassword || !currentPassword}
                  isLoading={isSettingPassword}
                  className="w-full justify-center">
                  Deaktivieren
                </Button>
              </div>
            ) : (
              // Set password form
              <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Shield size={14} />
                  Passwortschutz aktivieren
                </div>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Neues Passwort (min. 4 Zeichen)"
                    className="h-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Passwort bestätigen"
                    className="h-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSetPassword}
                  disabled={isSettingPassword || !newPassword || !confirmPassword}
                  isLoading={isSettingPassword}
                  className="w-full justify-center">
                  Aktivieren
                </Button>
              </div>
            )}

            {/* Status message */}
            {passwordMessage && (
              <div className={`flex items-center gap-2 text-sm ${passwordMessage.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {passwordMessage.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {passwordMessage.message}
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">Tipp: Halte beim App-Start Shift gedrückt für Notfall-Reset</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading && settings.length === 0) {
    return (
      <div>
        <h1 className={CONFIG.style.title.className}>Einstellungen</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Globale Optionen für Formular-Tests konfigurieren</p>
        <SettingsSkeleton />
      </div>
    );
  }

  return (
    <div>
      <h1 className={CONFIG.style.title.className}>Einstellungen</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Globale Optionen für Formular-Tests konfigurieren</p>

      {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md border border-red-200 dark:border-red-800 text-sm">{error}</div>}

      {apiStatusMessage && <div className={`mb-4 p-3 rounded-md border text-sm ${apiStatusMessage.type === "success" ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"}`}>{apiStatusMessage.message}</div>}

      {/* Settings Table */}
      <div className="space-y-6">
        {/* Filter Bar */}
        <TableFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Einstellung suchen..."
          statusFilter={categoryFilter}
          onStatusFilterChange={setCategoryFilter}
          statusOptions={[
            { value: "test", label: "Test" },
            { value: "ui", label: "UI" },
            { value: "email", label: "E-Mail" },
            { value: "data", label: "Daten" },
            { value: "selectors", label: "Selektoren" },
            { value: "api", label: "API" },
            { value: "security", label: "Sicherheit" },
          ]}
          statusLabel="Kategorie"
          onClear={() => {
            setSearchTerm("");
            setCategoryFilter(undefined);
          }}
        />

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm overflow-hidden">
          {filteredSettings.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">Keine Einstellungen gefunden.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Kategorie</TableHead>
                  <TableHead className="w-[420px]">Einstellung</TableHead>
                  <TableHead className="w-[220px] lg:w-[360px]">Wert</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSettings.map((item) =>
                  item.fullWidth ? (
                    <React.Fragment key={item.id}>
                      <TableRow className={getCategoryBgColor(item.category)}>
                        <TableCell
                          colSpan={3}
                          className="p-0">
                          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-1">
                              {getCategoryIcon(item.category)}
                              <span className="text-xs font-medium text-gray-900 dark:text-white">{item.name}</span>
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">{item.description}</div>
                          </div>
                          <div className="p-0">{renderSettingControl(item)}</div>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ) : (
                    <TableRow key={item.id} className={getCategoryBgColor(item.category)}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {getCategoryIcon(item.category)}
                          <span className="text-[10px] font-mono uppercase text-gray-500 dark:text-gray-400">{getCategoryLabel(item.category)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div
                            style={{ fontStretch: "125%" }}
                            className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </div>
                          <div
                            style={{ fontStretch: "100%" }}
                            className="text-xs text-gray-500 dark:text-gray-400">
                            {item.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{renderSettingControl(item)}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Email Test Result */}
        {emailTestResult && (
          <div className={`p-3 rounded-md border text-xs flex items-center gap-2 ${emailTestResult.success ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"}`}>
            {emailTestResult.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {emailTestResult.message}
          </div>
        )}

        {/* Export/Import Result Messages */}
        {exportMessage && <div className="p-3 rounded-md border text-xs bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">{exportMessage}</div>}
        {importResult && <div className={`p-3 rounded-md border text-xs ${importResult.success ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"}`}>{importResult.success ? `Importiert: ${importResult.imported.forms} Formulare, ${importResult.imported.paymentMethods} Bezahlmethoden` : importResult.errors.join(", ")}</div>}
      </div>

      {/* Delete Confirmation Dialog */}
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
