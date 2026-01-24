import React, { useState, useEffect, useRef } from "react";
import { Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Input } from "../ui/Input";
import Button from "../ui/Button";
import { t } from "../../data/dictionary";

interface LockScreenProps {
  onUnlock: () => void;
}

/**
 * Lock Screen Component
 * Displays a password prompt when master password is enabled
 * Matches the app's design language
 */
const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shiftHeld, setShiftHeld] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Track shift key for emergency reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShiftHeld(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShiftHeld(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError(t("settings.passwordRequired"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await window.api.password.verify(password);
      if (result.success) {
        onUnlock();
      } else {
        setError(result.error || t("settings.wrongPassword"));
        setPassword("");
        inputRef.current?.focus();
      }
    } catch (err) {
      setError(t("error.unexpected"));
      console.error("Password verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyReset = async () => {
    if (!confirm(t("settings.disablePassword") + "\n\n" + t("settings.passwordDisabledSuccess"))) {
      return;
    }

    try {
      const result = await window.api.password.emergencyReset();
      if (result.success) {
        onUnlock();
      } else {
        setError(t("error.unexpected"));
      }
    } catch (err) {
      setError(t("error.unexpected"));
      console.error("Emergency reset error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative w-full max-w-sm mx-4">
        {/* Card */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
              <Lock className="w-8 h-8 text-neutral-600 dark:text-neutral-300" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl font-semibold text-center text-neutral-900 dark:text-white mb-2">
            FormTest Server
          </h1>
          <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 mb-6">
            {t("settings.currentPassword")}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("settings.currentPassword")}
                className="pr-10"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400" role="alert" aria-live="polite">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {t("button.unlock") || "Unlock"}
            </Button>
          </form>

          {/* Emergency reset hint */}
          {shiftHeld && (
            <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={handleEmergencyReset}
                className="w-full text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
              >
                {t("settings.disablePassword")} (Emergency Reset)
              </button>
            </div>
          )}
        </div>

        {/* Hint */}
        <p className="text-xs text-center text-neutral-400 dark:text-neutral-500 mt-4">
          Hold Shift for emergency options
        </p>
      </div>
    </div>
  );
};

export default LockScreen;
