import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import { Sun, Moon, Monitor } from "lucide-react";

const Settings: React.FC = () => {
  const { settings, isLoading, error, loadSettings, updateSetting } = useSettingsStore();
  
  // Local state for immediate updates
  const [donationAmount, setDonationAmount] = useState("50");
  const [donationInterval, setDonationInterval] = useState("0");
  const [testTimeout, setTestTimeout] = useState("30000");
  const [headlessMode, setHeadlessMode] = useState("true");
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

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
  const handleDonationAmountChange = async (value: string) => {
    setDonationAmount(value);
    await updateSetting("default_donation_amount", value, "Standard-Spendenbetrag in EUR");
  };

  const handleDonationIntervalChange = async (value: string) => {
    setDonationInterval(value);
    await updateSetting("default_interval", value, "Standard-Spendenintervall (0=einmalig, 1=monatlich)");
  };

  const handleTestTimeoutChange = async (value: string) => {
    setTestTimeout(value);
    await updateSetting("test_timeout", value, "Test-Timeout in Millisekunden");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Einstellungen</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Globale Optionen für Formular-Tests konfigurieren</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="text-red-800 dark:text-red-200">
              <strong>Error:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {isLoading && settings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Einstellungen werden geladen...</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Darstellung</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleThemeChange("system")}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                      theme === "system"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}>
                    <Monitor className="w-6 h-6 mb-2 text-gray-700 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">System</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                      theme === "light"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}>
                    <Sun className="w-6 h-6 mb-2 text-gray-700 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Hell</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                      theme === "dark"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}>
                    <Moon className="w-6 h-6 mb-2 text-gray-700 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Dunkel</span>
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
              <div>
                <label htmlFor="donation-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Standard-Spendenbetrag (EUR)
                </label>
                <input
                  id="donation-amount"
                  type="number"
                  value={donationAmount}
                  onChange={(e) => handleDonationAmountChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Der Standardbetrag, der beim Testen von Spendenformularen verwendet wird
                </p>
              </div>

              {/* Donation Interval */}
              <div>
                <label htmlFor="donation-interval" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Standard-Spendenintervall
                </label>
                <select
                  id="donation-interval"
                  value={donationInterval}
                  onChange={(e) => handleDonationIntervalChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={isLoading}>
                  <option value="0">Einmalig</option>
                  <option value="1">Monatlich</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Das Standard-Spendenintervall für Tests
                </p>
              </div>

              {/* Test Timeout */}
              <div>
                <label htmlFor="test-timeout" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test-Timeout (Millisekunden)
                </label>
                <input
                  id="test-timeout"
                  type="number"
                  value={testTimeout}
                  onChange={(e) => handleTestTimeoutChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maximale Wartezeit für Test-Operationen (Standard: 30000ms = 30 Sekunden)
                </p>
              </div>

              {/* Headless Mode */}
              <div>
                <label htmlFor="headless-mode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Headless-Modus
                </label>
                <select
                  id="headless-mode"
                  value={headlessMode}
                  onChange={(e) => handleHeadlessModeChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={isLoading}>
                  <option value="true">Aktiviert</option>
                  <option value="false">Deaktiviert</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Browser-Tests ohne sichtbares Fenster ausführen
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
