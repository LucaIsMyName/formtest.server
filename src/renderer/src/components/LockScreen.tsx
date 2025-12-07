import React, { useState, useEffect, useRef } from "react";
import { Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Input } from "./ui/Input";
import Button from "./ui/Button";

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
      setError("Bitte Passwort eingeben");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await window.api.password.verify(password);
      if (result.success) {
        onUnlock();
      } else {
        setError(result.error || "Falsches Passwort");
        setPassword("");
        inputRef.current?.focus();
      }
    } catch (err) {
      setError("Fehler bei der Überprüfung");
      console.error("Password verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyReset = async () => {
    if (!confirm("Passwortschutz wirklich deaktivieren?\n\nDies entfernt das Master-Passwort dauerhaft.")) {
      return;
    }

    try {
      const result = await window.api.password.emergencyReset();
      if (result.success) {
        onUnlock();
      } else {
        setError("Reset fehlgeschlagen");
      }
    } catch (err) {
      setError("Reset fehlgeschlagen");
      console.error("Emergency reset error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative w-full max-w-sm mx-4">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Lock className="w-8 h-8 text-gray-600 dark:text-gray-300" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
            FormTest Server
          </h1>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
            Bitte Master-Passwort eingeben
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passwort"
                className="pr-10"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={14} />
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
              Entsperren
            </Button>
          </form>

          {/* Emergency reset hint */}
          {shiftHeld && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleEmergencyReset}
                className="w-full text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
              >
                Passwortschutz deaktivieren (Notfall-Reset)
              </button>
            </div>
          )}
        </div>

        {/* Hint */}
        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
          Shift gedrückt halten für Notfall-Optionen
        </p>
      </div>
    </div>
  );
};

export default LockScreen;
