/**
 * Dictionary utility for main process
 * Reads language preference from database and provides translations
 */

import { settingsQueries } from "../database";

// Error message translations (subset of full dictionary)
const ERROR_DICTIONARY: Record<string, { en: string; de: string }> = {
  database: {
    en: "A database error occurred. Please try again.",
    de: "Ein Datenbankfehler ist aufgetreten. Bitte versuchen Sie es erneut.",
  },
  encryption: {
    en: "An encryption error occurred. Please check your system settings.",
    de: "Ein Verschlüsselungsfehler ist aufgetreten. Bitte überprüfen Sie Ihre Systemeinstellungen.",
  },
  network: {
    en: "Network error: Connection could not be established.",
    de: "Netzwerkfehler: Verbindung konnte nicht hergestellt werden.",
  },
  fileSystem: {
    en: "File system error: File or directory not found or no permission.",
    de: "Dateisystemfehler: Datei oder Verzeichnis nicht gefunden oder keine Berechtigung.",
  },
  unexpected: {
    en: "An unexpected error occurred.",
    de: "Ein unerwarteter Fehler ist aufgetreten.",
  },
};

/**
 * Get current language from database settings
 * Defaults to "de" if not set
 */
function getLanguage(): "en" | "de" {
  const languageSetting = settingsQueries.get("language");
  const language = languageSetting?.value || "de";
  return language === "en" ? "en" : "de";
}

/**
 * Translate error messages in main process
 * @param key - Translation key (e.g., "error.database")
 * @returns Translated string in current language
 */
export function t(key: string): string {
  const language = getLanguage();
  
  // Handle nested keys (e.g., "error.database")
  const keys = key.split(".");
  let value: any = ERROR_DICTIONARY;
  
  // Navigate through nested structure
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      // Key not found, return key as fallback
      console.warn(`[Main] Translation key not found: ${key}`);
      return key;
    }
  }
  
  // Check if we have a translation object with en/de
  if (value && typeof value === "object" && "en" in value && "de" in value) {
    return value[language] || value.en;
  }
  
  // Fallback: return key if structure is invalid
  console.warn(`[Main] Invalid translation structure for key: ${key}`);
  return key;
}
