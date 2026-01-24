import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import { Sun, Moon, Monitor, AlertCircle, CheckCircle2, Mail, Settings2, Database, Sliders, Code, Globe, Copy, RefreshCw, Lock, Eye, EyeOff, Shield, Bot } from "lucide-react";
import { CONFIG } from "../app.config";
import Button from "../components/ui/Button";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import SelectorEditor from "../components/SelectorEditor";
import GlobalDefaultsEditor from "../components/GlobalDefaultsEditor";
import AISettingsSection from "../components/AISettingsSection";
import type { ImportOptions, ImportResult } from "../../../common/types";
import { Input } from "../components/ui/Input";
import { Checkbox } from "../components/ui/Checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { Skeleton } from "../components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { TableFilter } from "../components/ui/TableFilter";
import { useTagsStore } from "../store/useTagsStore";
import { Badge } from "../components/ui/Badge";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/Dialog";
import { t } from "../data/dictionary";

// Setting item interface
interface SettingItem {
  id: string;
  category: "test" | "ui" | "email" | "data" | "selectors" | "api" | "security" | "ai";
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
  <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm overflow-hidden">
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
  const { tags, loadTags, createTag, updateTag, deleteTag } = useTagsStore();
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showTagCreateEditDialog, setShowTagCreateEditDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<{ id: number; name: string; color: string } | null>(null);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#3B82F6");

  // Dialog states for component settings
  const [showSelectorDialog, setShowSelectorDialog] = useState(false);
  const [showGlobalDefaultsDialog, setShowGlobalDefaultsDialog] = useState(false);
  const [showAISettingsDialog, setShowAISettingsDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Local state for immediate updates
  const [donationAmount, setDonationAmount] = useState("5");
  const [donationInterval, setDonationInterval] = useState("0");
  const [testTimeout, setTestTimeout] = useState("30000");
  const [headlessMode, setHeadlessMode] = useState("true");
  const [slowMotion, setSlowMotion] = useState("0");
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState<"en" | "de">("de");
  const [retentionDays, setRetentionDays] = useState("365");
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{ deleted: number } | null>(null);

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

  // Refs for setTimeout cleanup
  const cleanupResultTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const apiStatusMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const passwordMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      if (cleanupResultTimeoutRef.current) clearTimeout(cleanupResultTimeoutRef.current);
      if (apiStatusMessageTimeoutRef.current) clearTimeout(apiStatusMessageTimeoutRef.current);
      if (passwordMessageTimeoutRef.current) clearTimeout(passwordMessageTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    loadSettings();
    loadTags();
  }, [loadSettings, loadTags]);

  const handleCreateTag = async () => {
    if (!tagName.trim()) return;
    await createTag(tagName.trim(), tagColor);
    setTagName("");
    setTagColor("#3B82F6");
    setShowTagCreateEditDialog(false);
  };

  const handleEditTag = async () => {
    if (!editingTag || !tagName.trim()) return;
    await updateTag(editingTag.id, tagName.trim(), tagColor);
    setEditingTag(null);
    setTagName("");
    setTagColor("#3B82F6");
    setShowTagCreateEditDialog(false);
  };

  const handleDeleteTag = async (id: number) => {
    if (confirm(t("settings.deleteTagConfirm"))) {
      await deleteTag(id);
    }
  };

  const openEditDialog = (tag: { id: number; name: string; color: string }) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagColor(tag.color);
    setShowTagCreateEditDialog(true);
  };

  const openCreateDialog = () => {
    setEditingTag(null);
    setTagName("");
    setTagColor("#3B82F6");
    setShowTagCreateEditDialog(true);
  };

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

  // Load language from settings
  useEffect(() => {
    const languageSetting = settings.find(s => s.key === "language");
    if (languageSetting) {
      const lang = languageSetting.value === "en" ? "en" : "de";
      setLanguage(lang);
      CONFIG.language = lang;
    }
  }, [settings]);

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
        case "language":
          const lang = setting.value === "en" ? "en" : "de";
          setLanguage(lang);
          CONFIG.language = lang;
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
        case "test_retention_days":
          setRetentionDays(setting.value);
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

  // Test retention cleanup handler
  const handleCleanupOldTests = useCallback(async () => {
    setIsCleaningUp(true);
    setCleanupResult(null);
    try {
      const result = await window.api.testRuns.cleanup();
      if (result.success) {
        setCleanupResult({ deleted: result.deleted });
        if (cleanupResultTimeoutRef.current) {
          clearTimeout(cleanupResultTimeoutRef.current);
        }
        cleanupResultTimeoutRef.current = setTimeout(() => setCleanupResult(null), 5000);
      }
    } catch (error) {
      console.error("Cleanup failed:", error);
    } finally {
      setIsCleaningUp(false);
    }
  }, []);

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
        setApiStatusMessage({ type: "success", message: t("settings.apiKeyGenerated") });
        if (apiStatusMessageTimeoutRef.current) {
          clearTimeout(apiStatusMessageTimeoutRef.current);
        }
        apiStatusMessageTimeoutRef.current = setTimeout(() => setApiStatusMessage(null), 3000);
      } else {
        setApiStatusMessage({ type: "error", message: t("settings.noKeyGenerated") });
      }
    } catch (error) {
      console.error("Error generating API key:", error);
      setApiStatusMessage({ type: "error", message: `${t("settings.errorPrefix")} ${error instanceof Error ? error.message : t("error.unexpected")}` });
    }
  }, [updateSetting]);

  const handleCopyApiKey = useCallback(() => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setApiStatusMessage({ type: "success", message: "API-Key kopiert" });
      if (apiStatusMessageTimeoutRef.current) {
        clearTimeout(apiStatusMessageTimeoutRef.current);
      }
      apiStatusMessageTimeoutRef.current = setTimeout(() => setApiStatusMessage(null), 2000);
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
          setApiStatusMessage({ type: "success", message: t("settings.apiServerStopped") });
        } else {
          setApiStatusMessage({ type: "error", message: result.error || t("settings.errorStopping") });
        }
      } else {
        if (!apiKey) {
          setApiStatusMessage({ type: "error", message: t("settings.generateApiKeyFirst") });
          return;
        }
        const port = parseInt(apiPort) || 3847;
        const result = await api.apiServer.start(port, apiKey);
        if (result.success) {
          setApiServerRunning(true);
          await updateSetting("api_enabled", "true", "API aktiviert");
          await updateSetting("api_port", String(port), "API Port");
          setApiStatusMessage({ type: "success", message: `${t("settings.apiServerStarted")} ${port}` });
        } else {
          setApiStatusMessage({ type: "error", message: result.error || t("settings.errorStarting") });
        }
      }
      if (apiStatusMessageTimeoutRef.current) {
        clearTimeout(apiStatusMessageTimeoutRef.current);
      }
      apiStatusMessageTimeoutRef.current = setTimeout(() => setApiStatusMessage(null), 3000);
    } catch (error) {
      setApiStatusMessage({ type: "error", message: t("settings.unexpectedError") });
    }
  }, [apiServerRunning, apiKey, apiPort, updateSetting]);

  // Password handlers
  const handleSetPassword = useCallback(async () => {
    if (!newPassword) {
      setPasswordMessage({ type: "error", message: t("settings.passwordRequired") });
      return;
    }
    if (newPassword.length < 4) {
      setPasswordMessage({ type: "error", message: t("settings.passwordMinLength") });
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
      if (passwordMessageTimeoutRef.current) {
        clearTimeout(passwordMessageTimeoutRef.current);
      }
      passwordMessageTimeoutRef.current = setTimeout(() => setPasswordMessage(null), 3000);
    }
  }, [newPassword, confirmPassword]);

  const handleDisablePassword = useCallback(async () => {
    if (!currentPassword) {
      setPasswordMessage({ type: "error", message: t("settings.currentPasswordRequired") });
      return;
    }

    setIsSettingPassword(true);
    try {
      const result = await window.api.password.disable(currentPassword);
      if (result.success) {
        setPasswordEnabled(false);
        setCurrentPassword("");
        setPasswordMessage({ type: "success", message: t("settings.passwordDisabledSuccess") });
      } else {
        setPasswordMessage({ type: "error", message: result.error || t("settings.wrongPassword") });
      }
    } catch (error) {
      setPasswordMessage({ type: "error", message: t("error.unexpected") });
    } finally {
      setIsSettingPassword(false);
      if (passwordMessageTimeoutRef.current) {
        clearTimeout(passwordMessageTimeoutRef.current);
      }
      passwordMessageTimeoutRef.current = setTimeout(() => setPasswordMessage(null), 3000);
    }
  }, [currentPassword]);

  // Build settings items for table
  const settingsItems: SettingItem[] = useMemo(
    () => [
      // Test Settings
      { id: "donation_amount", category: "test", name: t("settings.donationAmount"), description: t("settings.donationAmountDescription"), type: "input", value: donationAmount },
      {
        id: "donation_interval",
        category: "test",
        name: t("settings.interval"),
        description: t("settings.intervalDescription"),
        type: "select",
        value: donationInterval,
        options: [
          { value: "0", label: t("settings.once") },
          { value: "1", label: t("settings.monthly") },
          { value: "3", label: t("settings.quarterly") },
          { value: "12", label: t("settings.yearly") },
        ],
      },
      {
        id: "headless_mode",
        category: "test",
        name: t("settings.headlessMode"),
        description: t("settings.headlessModeDescription"),
        type: "select",
        value: headlessMode,
        options: [
          { value: "true", label: t("settings.enabled") },
          { value: "false", label: t("settings.disabled") },
        ],
      },
      {
        id: "slow_motion",
        category: "test",
        name: t("settings.slowMotion"),
        description: t("settings.slowMotionDescription"),
        type: "select",
        value: slowMotion,
        options: [
          { value: "0", label: t("settings.off") },
          { value: "250", label: "250ms" },
          { value: "500", label: "500ms" },
          { value: "1000", label: "1000ms" },
          { value: "2000", label: "2000ms" },
        ],
      },
      { id: "test_timeout", category: "test", name: t("settings.testTimeout"), description: t("settings.testTimeoutDescription"), type: "input", value: testTimeout },
      // UI Settings
      {
        id: "language",
        category: "ui",
        name: t("settings.language"),
        description: t("settings.languageDescription"),
        type: "select",
        value: language,
        options: [
          { value: "de", label: t("settings.languageGerman") },
          { value: "en", label: t("settings.languageEnglish") },
        ],
      },
      { id: "theme", category: "ui", name: t("settings.theme"), description: t("settings.themeDescription"), type: "theme", value: theme },
      // Email Settings
      { id: "email_enabled", category: "email", name: t("settings.emailEnabled"), description: t("settings.emailEnabledDescription"), type: "checkbox", value: String(emailEnabled) },
      { id: "email_smtp_host", category: "email", name: t("settings.smtpHost"), description: t("settings.smtpHostDescription"), type: "input", value: emailSmtpHost, disabled: !emailEnabled },
      { id: "email_smtp_port", category: "email", name: t("settings.smtpPort"), description: t("settings.smtpPortDescription"), type: "input", value: emailSmtpPort, disabled: !emailEnabled },
      { id: "email_smtp_secure", category: "email", name: t("settings.smtpSecure"), description: t("settings.smtpSecureDescription"), type: "checkbox", value: String(emailSmtpSecure), disabled: !emailEnabled },
      { id: "email_smtp_user", category: "email", name: t("settings.smtpUser"), description: t("settings.smtpUserDescription"), type: "input", value: emailSmtpUser, disabled: !emailEnabled },
      { id: "email_smtp_pass", category: "email", name: t("settings.smtpPassword"), description: t("settings.smtpPasswordDescription"), type: "input", value: emailSmtpPass, disabled: !emailEnabled },
      { id: "email_from_email", category: "email", name: t("settings.senderEmail"), description: t("settings.senderEmailDescription"), type: "input", value: emailFromEmail, disabled: !emailEnabled },
      { id: "email_from_name", category: "email", name: t("settings.senderName"), description: t("settings.senderNameDescription"), type: "input", value: emailFromName, disabled: !emailEnabled },
      { id: "email_to_email", category: "email", name: t("settings.recipientEmail"), description: t("settings.recipientEmailDescription"), type: "input", value: emailToEmail, disabled: !emailEnabled },
      { id: "email_notify_success", category: "email", name: t("settings.notifyOnSuccess"), description: t("settings.notifyOnSuccessDescription"), type: "checkbox", value: String(emailNotifySuccess), disabled: !emailEnabled },
      { id: "email_notify_failure", category: "email", name: t("settings.notifyOnFailure"), description: t("settings.notifyOnFailureDescription"), type: "checkbox", value: String(emailNotifyFailure), disabled: !emailEnabled },
      { id: "email_test", category: "email", name: t("settings.testEmail"), description: t("settings.testEmailDescription"), type: "action", value: "", actionLabel: isSendingTestEmail ? t("settings.sending") : t("settings.send"), action: handleSendTestEmail, actionVariant: "secondary", disabled: !emailEnabled || !emailSmtpHost || !emailToEmail },
      // API Server
      { id: "api_toggle", category: "api", name: t("settings.apiServer"), description: apiServerRunning ? `${t("settings.apiServerRunning")} ${apiPort}` : t("settings.apiServerDescription"), type: "action", value: "", actionLabel: apiServerRunning ? t("button.stop") : t("button.start"), action: handleToggleApiServer, actionVariant: apiServerRunning ? "danger" : "primary" },
      { id: "api_port", category: "api", name: t("settings.apiPort"), description: t("settings.apiPortDescription"), type: "input", value: apiPort, disabled: apiServerRunning },
      { id: "api_key", category: "api", name: t("settings.apiKey"), description: t("settings.apiKeyDescription"), type: "api-key", value: apiKey },
      // Data Management
      { id: "retention_days", category: "data", name: t("settings.retentionDays"), description: cleanupResult ? t("settings.cleanupResult").replace("{count}", String(cleanupResult.deleted)) : t("settings.retentionDaysDescription"), type: "input", value: retentionDays },
      { id: "cleanup_now", category: "data", name: t("settings.cleanupNow"), description: t("settings.cleanupNowDescription"), type: "action", value: "", actionLabel: isCleaningUp ? t("button.cleaning") : t("button.cleanup"), action: handleCleanupOldTests, actionVariant: "secondary" },
      { id: "data_export", category: "data", name: t("settings.dataExport"), description: t("settings.dataExportDescription"), type: "action", value: "", actionLabel: isExporting ? t("settings.exporting") : t("settings.export"), action: handleExport, actionVariant: "secondary" },
      { id: "data_import", category: "data", name: t("settings.dataImport"), description: t("settings.dataImportDescription"), type: "action", value: "", actionLabel: isImporting ? t("settings.importing") : t("settings.import"), action: handleImport, actionVariant: "secondary" },
      { id: "delete_forms", category: "data", name: t("settings.deleteForms"), description: t("settings.deleteFormsDescription"), type: "action", value: "", actionLabel: t("button.delete"), action: () => setDeleteConfirmation({ type: "forms", title: t("forms.deleteAllTitle"), message: t("forms.deleteAllMessage") }), actionVariant: "danger" },
      { id: "delete_payments", category: "data", name: t("settings.deletePayments"), description: t("settings.deletePaymentsDescription"), type: "action", value: "", actionLabel: t("button.delete"), action: () => setDeleteConfirmation({ type: "paymentMethods", title: t("paymentMethods.deleteAllTitle"), message: t("paymentMethods.deleteAllMessage") }), actionVariant: "danger" },
      { id: "delete_tests", category: "data", name: t("settings.deleteTests"), description: t("settings.deleteTestsDescription"), type: "action", value: "", actionLabel: t("button.delete"), action: () => setDeleteConfirmation({ type: "testRuns", title: t("settings.deleteTestsTitle"), message: t("settings.deleteTestsMessage") }), actionVariant: "danger" },
      { id: "delete_schedules", category: "data", name: t("settings.deleteSchedules"), description: t("settings.deleteSchedulesDescription"), type: "action", value: "", actionLabel: t("button.delete"), action: () => setDeleteConfirmation({ type: "schedules", title: t("settings.deleteSchedulesTitle"), message: t("settings.deleteSchedulesMessage") }), actionVariant: "danger" },
      { id: "delete_all", category: "data", name: t("settings.deleteAll"), description: t("settings.deleteAllDescription"), type: "action", value: "", actionLabel: t("settings.deleteAllAction"), action: () => setDeleteConfirmation({ type: "all", title: t("settings.deleteAll"), message: t("settings.deleteAllMessage") }), actionVariant: "danger" },
      // Selectors
      { id: "selectors", category: "selectors", name: t("settings.selectors"), description: t("settings.selectorsDescription"), type: "component", value: "", fullWidth: false },
      // Global Defaults
      { id: "global_defaults", category: "selectors", name: t("settings.globalDefaults"), description: t("settings.globalDefaultsDescription"), type: "component", value: "", fullWidth: false },
      // Security
      { id: "master_password", category: "security", name: t("settings.masterPassword"), description: passwordEnabled ? t("settings.masterPasswordEnabled") : t("settings.masterPasswordDisabled"), type: "password", value: "", fullWidth: false },
      // AI
      { id: "ai_settings", category: "ai", name: t("settings.aiAssistant"), description: t("settings.aiAssistantDescription"), type: "component", value: "", fullWidth: false },
      // Tags
      { id: "tags", category: "data", name: t("settings.tags"), description: t("settings.tagsDescription"), type: "action", value: "", actionLabel: `${tags.length} ${t("settings.tag")}${tags.length !== 1 ? 's' : ''}`, action: () => setShowTagDialog(true), actionVariant: "secondary" },
    ],
    [donationAmount, donationInterval, headlessMode, slowMotion, testTimeout, language, theme, emailEnabled, emailSmtpHost, emailSmtpPort, emailSmtpSecure, emailSmtpUser, emailSmtpPass, emailFromEmail, emailFromName, emailToEmail, emailNotifySuccess, emailNotifyFailure, isSendingTestEmail, isExporting, isImporting, handleSendTestEmail, handleExport, handleImport, apiServerRunning, apiPort, apiKey, handleToggleApiServer, passwordEnabled, retentionDays, isCleaningUp, cleanupResult, handleCleanupOldTests, tags.length]
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
      case "language":
        const lang = value === "en" ? "en" : "de";
        setLanguage(lang);
        CONFIG.language = lang;
        await updateSetting("language", lang, "Application language");
        // Trigger re-render by dispatching language change event
        window.dispatchEvent(new Event("languagechange"));
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
      case "retention_days":
        setRetentionDays(value);
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
        await updateSetting("email_to_email", emailToEmail, t("settings.recipientEmail"));
        break;
      case "api_port":
        await updateSetting("api_port", apiPort, "API Port");
        break;
      case "retention_days":
        await updateSetting("test_retention_days", retentionDays, "Test-Aufbewahrungsfrist in Tagen");
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
        return t("settings.email");
      case "data":
        return t("settings.data");
      case "selectors":
        return t("settings.selectors");
      case "api":
        return t("settings.api");
      case "security":
        return t("settings.security");
      case "ai":
        return "AI";
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
      case "ai":
        return "bg-violet-50/50 dark:bg-violet-950/30";
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
      case "ai":
        return (
          <Bot
            size={14}
            className="text-violet-500"
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
            <SelectTrigger className={`h-7 text-xs w-full border border-neutral-200 !dark:border-neutral-800 bg-white !dark:bg-neutral-800 px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 dark:border-neutral-700 dark:bg-neutral-700 dark:ring-offset-neutral-950 dark:placeholder:text-neutral-400 dark:focus:ring-neutral-300 dark:text-white ${isDisabled ? "opacity-50" : ""}`}>
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
              { value: "light", icon: <Sun size={14} />, label: t("settings.themeLight") },
              { value: "dark", icon: <Moon size={14} />, label: t("settings.themeDark") },
              { value: "system", icon: <Monitor size={14} />, label: t("settings.themeSystem") },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => handleSettingChange("theme", t.value)}
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${theme === t.value ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700" : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600"}`}
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
              value={item.value || t("settings.noKeyGeneratedPlaceholder")}
              readOnly
              className={`h-7 text-xs font-mono flex-1 ${!item.value ? "text-neutral-400 italic" : ""}`}
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
              title={t("settings.generateNewKey")}>
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
          return (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSelectorDialog(true)}
              className="text-xs h-7">
              Konfigurieren
            </Button>
          );
        }
        if (item.id === "global_defaults") {
          return (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowGlobalDefaultsDialog(true)}
              className="text-xs h-7">
              Konfigurieren
            </Button>
          );
        }
        if (item.id === "ai_settings") {
          return (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAISettingsDialog(true)}
              className="text-xs h-7">
              Konfigurieren
            </Button>
          );
        }
        return null;

      case "password":
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${passwordEnabled ? "bg-green-500" : "bg-neutral-400"}`} />
            <span className="text-xs text-neutral-600 dark:text-neutral-400 flex-1">
              {passwordEnabled ? t("settings.enabled") : t("settings.disabled")}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPasswordDialog(true)}
              className="text-xs h-7">
              {passwordEnabled ? t("button.change") : t("button.enable")}
            </Button>
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
        <p className="sr-only text-neutral-500 dark:text-neutral-400 mb-6">Globale Optionen für Formular-Tests konfigurieren</p>
        <SettingsSkeleton />
      </div>
    );
  }

  return (
    <div>
      <h1 className={`${CONFIG.style.title.className} mb-6`}>Einstellungen</h1>
      <p className="sr-only text-neutral-500 dark:text-neutral-400 mb-6">Globale Optionen für Formular-Tests konfigurieren</p>

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
            { value: "email", label: t("settings.email") },
            { value: "data", label: t("settings.data") },
            { value: "selectors", label: t("settings.selectors") },
            { value: "api", label: t("settings.api") },
            { value: "security", label: t("settings.security") },
            { value: "ai", label: "AI" },
          ]}
          statusLabel={t("settings.category")}
          onClear={() => {
            setSearchTerm("");
            setCategoryFilter(undefined);
          }}
        />

        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm overflow-hidden">
          {filteredSettings.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 dark:text-neutral-400 text-sm">Keine Einstellungen gefunden.</div>
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
                          <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-700">
                            <div className="flex items-center gap-2 mb-1">
                              {getCategoryIcon(item.category)}
                              <span className="text-xs font-medium text-neutral-900 dark:text-white">{item.name}</span>
                            </div>
                            <div className="text-[10px] text-neutral-500 dark:text-neutral-400">{item.description}</div>
                          </div>
                          <div className="p-0">{renderSettingControl(item)}</div>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ) : (
                    <TableRow
                      key={item.id}
                      className={getCategoryBgColor(item.category)}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {getCategoryIcon(item.category)}
                          <span className="text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400">{getCategoryLabel(item.category)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div
                            style={{ fontStretch: "125%" }}
                            className="text-sm font-medium text-neutral-900 dark:text-white">
                            {item.name}
                          </div>
                          <div
                            style={{ fontStretch: "100%" }}
                            className="text-xs text-neutral-500 dark:text-neutral-400">
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
        {exportMessage && <div className="p-3 rounded-md border text-xs bg-neutral-50 dark:bg-neutral-900/20 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700">{exportMessage}</div>}
        {importResult && <div className={`p-3 rounded-md border text-xs ${importResult.success ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"}`}>{importResult.success ? `Importiert: ${importResult.imported.forms} Formulare, ${importResult.imported.paymentMethods} Bezahlmethoden` : importResult.errors.join(", ")}</div>}
      </div>

      {/* Selector Editor Dialog */}
      <Dialog open={showSelectorDialog} onOpenChange={setShowSelectorDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CSS Selektoren Konfiguration</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <SelectorEditor />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowSelectorDialog(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global Defaults Dialog */}
      <Dialog open={showGlobalDefaultsDialog} onOpenChange={setShowGlobalDefaultsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Globale Standardwerte</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <GlobalDefaultsEditor />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowGlobalDefaultsDialog(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Settings Dialog */}
      <Dialog open={showAISettingsDialog} onOpenChange={setShowAISettingsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI-Assistent Konfiguration</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <AISettingsSection />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowAISettingsDialog(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("settings.masterPassword")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${passwordEnabled ? "bg-green-500" : "bg-neutral-400"}`} />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">{passwordEnabled ? t("settings.passwordActive") : t("settings.passwordInactive")}</span>
            </div>

            {passwordEnabled ? (
              // Disable password form
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <Lock size={14} />
                  {t("settings.disablePassword")}
                </div>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t("settings.currentPassword")}
                    className="h-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    await handleDisablePassword();
                    setShowPasswordDialog(false);
                  }}
                  disabled={isSettingPassword || !currentPassword}
                  isLoading={isSettingPassword}
                  className="w-full justify-center">
                  {t("button.disable")}
                </Button>
              </div>
            ) : (
              // Set password form
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <Shield size={14} />
                  {t("settings.enablePassword")}
                </div>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("settings.newPassword")}
                    className="h-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("settings.confirmPassword")}
                    className="h-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    await handleSetPassword();
                    setShowPasswordDialog(false);
                  }}
                  disabled={isSettingPassword || !newPassword || !confirmPassword}
                  isLoading={isSettingPassword}
                  className="w-full justify-center">
                  {t("button.enable")}
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

            <p className="text-xs text-neutral-500 dark:text-neutral-400">Tipp: Halte beim App-Start Shift gedrückt für Notfall-Reset</p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowPasswordDialog(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tags Management Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tags verwalten</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Verwalten Sie Tags für Test-Ergebnisse</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={openCreateDialog}
                className="gap-2">
                <Plus size={14} />
                Tag erstellen
              </Button>
            </div>
            {tags.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400 text-sm">
                Noch keine Tags erstellt. Erstellen Sie einen Tag, um Test-Ergebnisse zu kategorisieren.
              </div>
            ) : (
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge
                        style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }}
                        className="border">
                        {tag.name}
                      </Badge>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {new Date(tag.createdAt).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(tag)}
                        className="h-7 w-7 p-0">
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTag(tag.id)}
                        className="h-7 w-7 p-0 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowTagDialog(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tag Create/Edit Dialog */}
      <Dialog open={showTagCreateEditDialog} onOpenChange={(open) => {
        if (!open) {
          setEditingTag(null);
          setTagName("");
          setTagColor("#3B82F6");
          setShowTagCreateEditDialog(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? "Tag bearbeiten" : "Neuen Tag erstellen"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Name
              </label>
              <Input
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Tag-Name"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Farbe
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  className="h-10 w-20 rounded border border-neutral-300 dark:border-neutral-600 cursor-pointer"
                />
                <Badge
                  style={{ backgroundColor: tagColor + '20', color: tagColor, borderColor: tagColor }}
                  className="border">
                  {tagName || "Vorschau"}
                </Badge>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowTagDialog(false)}>
              {t("button.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={editingTag ? handleEditTag : handleCreateTag}
              disabled={!tagName.trim()}>
              {editingTag ? t("settings.save") : t("settings.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
