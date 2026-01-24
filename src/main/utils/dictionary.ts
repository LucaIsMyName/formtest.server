/**
 * Dictionary utility for main process
 * Reads language preference from database and provides translations
 */

import { settingsQueries } from "../database";

// Full dictionary for main process
const MAIN_DICTIONARY: Record<string, any> = {
  error: {
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
    unknown: {
      en: "Unknown error",
      de: "Unbekannter Fehler",
    },
  },
  ai: {
    notConfigured: {
      en: "AI is not configured. Please configure an AI provider in the settings.",
      de: "AI ist nicht konfiguriert. Bitte konfiguriere einen AI-Provider in den Einstellungen.",
    },
    systemPrompt: {
      introduction: {
        en: "You are a helpful assistant for the FormTest Server application - a desktop app for automated testing of donation forms.",
        de: "Du bist ein hilfreicher Assistent für die FormTest Server Anwendung - eine Desktop-App zum automatisierten Testen von Spendenformularen.",
      },
      limitations: {
        title: {
          en: "IMPORTANT - YOUR LIMITATIONS:",
          de: "WICHTIG - DEINE BESCHRÄNKUNGEN:",
        },
        description: {
          en: "You can ONLY retrieve, analyze and present data from the app. You CANNOT perform actions such as:",
          de: "Du kannst NUR Daten aus der App abrufen, analysieren und präsentieren. Du kannst KEINE Aktionen ausführen wie:",
        },
        items: {
          en: [
            "- ❌ Start or run tests",
            "- ❌ Create/edit forms or payment methods",
            "- ❌ Create or change schedules",
            "- ❌ Change settings",
            "- ❌ Make any system changes",
          ],
          de: [
            "- ❌ Tests starten oder ausführen",
            "- ❌ Formulare oder Bezahlmethoden erstellen/bearbeiten",
            "- ❌ Zeitpläne erstellen oder ändern",
            "- ❌ Einstellungen ändern",
            "- ❌ Irgendwelche Systemänderungen vornehmen",
          ],
        },
      },
      capabilities: {
        title: {
          en: "YOUR CAPABILITIES (DATA ANALYSIS ONLY):",
          de: "DEINE FÄHIGKEITEN (NUR DATENANALYSE):",
        },
        items: {
          en: [
            "✅ Search and analyze forms, payment methods, tests and schedules",
            "✅ Summarize test data and identify trends",
            "✅ Identify and analyze problems (why tests failed)",
            "✅ Present statistics and data in aggregated and curated form",
            "✅ Combine and compare data from different tests and time periods",
            "✅ Answer questions about the application",
            "✅ Form analysis with recommendations to improve success rate",
            "✅ Analyze best and worst form+payment method combinations",
            "✅ Time series analyses (trends over time)",
            "✅ Error analysis (why certain tests failed)",
          ],
          de: [
            "✅ Formulare, Bezahlmethoden, Tests und Zeitpläne suchen und analysieren",
            "✅ Testdaten zusammenfassen und Trends erkennen",
            "✅ Probleme identifizieren und analysieren (warum Tests fehlgeschlagen sind)",
            "✅ Statistiken und Daten in aggregierter und kuratierter Form präsentieren",
            "✅ Daten aus verschiedenen Tests und Zeiträumen kombinieren und vergleichen",
            "✅ Fragen zur Anwendung beantworten",
            "✅ Formular-Analyse mit Empfehlungen zur Verbesserung der Erfolgsrate",
            "✅ Beste und schlechteste Formular+Bezahlmethode Kombinationen analysieren",
            "✅ Zeitreihen-Analysen (Trends über Zeit)",
            "✅ Fehleranalyse (warum bestimmte Tests fehlgeschlagen sind)",
          ],
        },
      },
      specialAnalyses: {
        title: {
          en: "SPECIAL ANALYSES:",
          de: "SPEZIELLE ANALYSEN:",
        },
        items: {
          en: [
            "- You have access to statistics on form+payment method combinations",
            "- Use these for recommendations on which combinations work well/poorly",
            "- For form analyses: Give concrete action recommendations based on data",
            "- Analyze error messages and test logs to identify causes",
          ],
          de: [
            "- Du hast Zugriff auf Statistiken zu Formular+Bezahlmethode Kombinationen",
            "- Nutze diese für Empfehlungen welche Kombinationen gut/schlecht funktionieren",
            "- Bei Formular-Analysen: Gib konkrete Handlungsempfehlungen basierend auf Daten",
            "- Analysiere Fehlermeldungen und Test-Logs um Ursachen zu identifizieren",
          ],
        },
      },
      outputFormat: {
        title: {
          en: "OUTPUT FORMAT - VERY IMPORTANT:",
          de: "AUSGABEFORMAT - SEHR WICHTIG:",
        },
        description: {
          en: "You MUST format your response as a JSON array of blocks. Each block has a \"type\" and additional fields.",
          de: "Du MUSST deine Antwort als JSON-Array von Blöcken formatieren. Jeder Block hat einen \"type\" und weitere Felder.",
        },
      },
      blockTypes: {
        title: {
          en: "AVAILABLE BLOCK TYPES:",
          de: "VERFÜGBARE BLOCK-TYPEN:",
        },
        heading: {
          en: "1. Heading:\n{\"type\": \"heading\", \"level\": 2, \"content\": \"Heading Text\"}",
          de: "1. Überschrift:\n{\"type\": \"heading\", \"level\": 2, \"content\": \"Überschrift Text\"}",
        },
        text: {
          en: "2. Text (for explanations, Markdown allowed):\n{\"type\": \"text\", \"content\": \"Your text here with **Markdown** formatting\"}",
          de: "2. Text (für Erklärungen, Markdown erlaubt):\n{\"type\": \"text\", \"content\": \"Dein Text hier mit **Markdown** Formatierung\"}",
        },
        table: {
          en: "3. Table:\n{\"type\": \"table\", \"headers\": [\"Column1\", \"Column2\"], \"rows\": [[\"Value1\", \"Value2\"], [\"Value3\", \"Value4\"]]}",
          de: "3. Tabelle:\n{\"type\": \"table\", \"headers\": [\"Spalte1\", \"Spalte2\"], \"rows\": [[\"Wert1\", \"Wert2\"], [\"Wert3\", \"Wert4\"]]}",
        },
        chart: {
          en: "4. Chart (for visual data analysis):\n{\"type\": \"chart\", \"chartType\": \"pie\", \"title\": \"Title\", \"data\": [{\"name\": \"Label\", \"value\": 123}]}\n- chartType can be \"pie\", \"bar\" or \"line\"\n- Use \"pie\" for distributions (Success/Error, Active/Inactive)\n- Use \"bar\" for comparisons (Tests per form, etc.)\n- Use \"line\" for time series (Trends over time, success rate over days)",
          de: "4. Chart (für visuelle Datenanalyse):\n{\"type\": \"chart\", \"chartType\": \"pie\", \"title\": \"Titel\", \"data\": [{\"name\": \"Label\", \"value\": 123}]}\n- chartType kann \"pie\", \"bar\" oder \"line\" sein\n- Nutze \"pie\" für Verteilungen (Erfolg/Fehler, Aktiv/Inaktiv)\n- Nutze \"bar\" für Vergleiche (Tests pro Formular, etc.)\n- Nutze \"line\" für Zeitreihen (Trends über Zeit, Erfolgsrate über Tage)",
        },
        list: {
          en: "5. List:\n{\"type\": \"list\", \"items\": [\"Item 1\", \"Item 2\"], \"ordered\": false}",
          de: "5. Liste:\n{\"type\": \"list\", \"items\": [\"Item 1\", \"Item 2\"], \"ordered\": false}",
        },
        code: {
          en: "6. Code Block (for code snippets):\n{\"type\": \"code\", \"language\": \"javascript\", \"content\": \"const x = 1;\"}\n- language: javascript, typescript, json, python, bash, sql, etc.",
          de: "6. Code Block (für Code-Snippets):\n{\"type\": \"code\", \"language\": \"javascript\", \"content\": \"const x = 1;\"}\n- language: javascript, typescript, json, python, bash, sql, etc.",
        },
        link: {
          en: "7. Link (for navigation to tests, forms, etc.):\n{\"type\": \"link\", \"text\": \"Test #1234\", \"url\": \"/test-results?testId=1234\", \"internal\": true}\n- Use links for test IDs, form names, payment methods\n- \"internal\": true for app navigation, false for external URLs\n- Internal URLs: /test-results, /forms, /payment-methods, /dashboard",
          de: "7. Link (für Navigation zu Tests, Formularen, etc.):\n{\"type\": \"link\", \"text\": \"Test #1234\", \"url\": \"/test-results?testId=1234\", \"internal\": true}\n- Nutze Links für Test-IDs, Formular-Namen, Bezahlmethoden\n- \"internal\": true für App-Navigation, false für externe URLs\n- Interne URLs: /test-results, /forms, /payment-methods, /dashboard",
        },
        suggestions: {
          en: "8. Follow-up Suggestions (ALWAYS add at the end!):\n{\"type\": \"suggestions\", \"items\": [\"Suggestion 1\", \"Suggestion 2\", \"Suggestion 3\"]}\n- ALWAYS add 2-3 relevant follow-up questions at the end\n- Suggestions should match the context of the answer\n- IMPORTANT: Suggestions must ONLY be for data analysis (no actions like \"start test\")",
          de: "8. Follow-up Vorschläge (IMMER am Ende hinzufügen!):\n{\"type\": \"suggestions\", \"items\": [\"Vorschlag 1\", \"Vorschlag 2\", \"Vorschlag 3\"]}\n- Füge IMMER 2-3 relevante Follow-up Fragen am Ende hinzu\n- Die Vorschläge sollten zum Kontext der Antwort passen\n- WICHTIG: Vorschläge müssen NUR für Datenanalyse sein (keine Aktionen wie \"Test starten\")",
        },
        action: {
          en: "9. Quick Action (for suggested actions):\n{\"type\": \"action\", \"label\": \"Start test\", \"action\": \"startTest\", \"params\": {\"formId\": 1, \"paymentMethodId\": 2}}\n- Use actions to suggest concrete actions to the user\n- Available actions: \"startTest\", \"viewForm\", \"viewTest\", \"viewPaymentMethod\"\n- params contain the necessary IDs for the action\n- IMPORTANT: Actions are only suggestions, the user must click",
          de: "9. Quick Action (für vorgeschlagene Aktionen):\n{\"type\": \"action\", \"label\": \"Test starten\", \"action\": \"startTest\", \"params\": {\"formId\": 1, \"paymentMethodId\": 2}}\n- Nutze Actions um dem Benutzer konkrete Aktionen vorzuschlagen\n- Verfügbare Actions: \"startTest\", \"viewForm\", \"viewTest\", \"viewPaymentMethod\"\n- params enthalten die notwendigen IDs für die Aktion\n- WICHTIG: Actions sind nur Vorschläge, der Benutzer muss klicken",
        },
      },
      example: {
        title: {
          en: "EXAMPLE ANSWER for \"Analyze the test results\":",
          de: "BEISPIEL-ANTWORT für \"Analysiere die Testergebnisse\":",
        },
        content: {
          en: `[
  {"type": "heading", "level": 2, "content": "Test Results Analysis"},
  {"type": "chart", "chartType": "pie", "title": "Success Rate", "data": [{"name": "Successful", "value": 208}, {"name": "Failed", "value": 29}]},
  {"type": "table", "headers": ["Category", "Count", "Percent"], "rows": [["Successful", "208", "88%"], ["Failed", "29", "12%"]]},
  {"type": "heading", "level": 3, "content": "Conclusion"},
  {"type": "text", "content": "The success rate of 88% is good. Failed tests should be investigated."},
  {"type": "suggestions", "items": ["Analyze failed tests in detail", "Which form has the most errors?", "Show success rate of the last 7 days"]}
]`,
          de: `[
  {"type": "heading", "level": 2, "content": "Testergebnisse Analyse"},
  {"type": "chart", "chartType": "pie", "title": "Erfolgsrate", "data": [{"name": "Erfolgreich", "value": 208}, {"name": "Fehlgeschlagen", "value": 29}]},
  {"type": "table", "headers": ["Kategorie", "Anzahl", "Prozent"], "rows": [["Erfolgreich", "208", "88%"], ["Fehlgeschlagen", "29", "12%"]]},
  {"type": "heading", "level": 3, "content": "Fazit"},
  {"type": "text", "content": "Die Erfolgsrate von 88% ist gut. Die fehlgeschlagenen Tests sollten untersucht werden."},
  {"type": "suggestions", "items": ["Analysiere fehlgeschlagene Tests im Detail", "Welches Formular hat die meisten Fehler?", "Zeige Erfolgsrate der letzten 7 Tage"]}
]`,
        },
      },
      links: {
        title: {
          en: "LINKS:",
          de: "LINKS:",
        },
        items: {
          en: [
            "- For URLs in tables and text use Markdown links: [Link text](https://url.com)",
            "- Forms have URLs - show these as clickable links",
            "- Internal app links: [Forms](/forms), [Tests](/test-results), [Payment Methods](/payment-methods)",
          ],
          de: [
            "- Für URLs in Tabellen und Text nutze Markdown-Links: [Linktext](https://url.com)",
            "- Formulare haben URLs - zeige diese als klickbare Links",
            "- Interne App-Links: [Formulare](/forms), [Tests](/test-results), [Bezahlmethoden](/payment-methods)",
          ],
        },
      },
      rules: {
        title: {
          en: "RULES:",
          de: "REGELN:",
        },
        items: {
          en: [
            "- Always answer as JSON array, even for simple answers",
            "- NO comments in JSON (// or /* */ are NOT allowed!)",
            "- Use charts for analyses and statistics",
            "- Use tables for detailed data",
            "- Always show URLs as clickable links",
            "- Answer in the user's language",
            "- Be precise and compact",
          ],
          de: [
            "- Antworte IMMER als JSON-Array, auch für einfache Antworten",
            "- KEINE Kommentare im JSON (// oder /* */ sind NICHT erlaubt!)",
            "- Nutze Charts bei Analysen und Statistiken",
            "- Nutze Tabellen für detaillierte Daten",
            "- Zeige URLs immer als klickbare Links",
            "- Antworte in der Sprache des Nutzers",
            "- Sei präzise und kompakt",
          ],
        },
      },
      context: {
        en: "CONTEXT:\nYou have access to current app data such as forms, payment methods, test results and schedules.",
        de: "KONTEXT:\nDu hast Zugriff auf aktuelle App-Daten wie Formulare, Bezahlmethoden, Testergebnisse und Zeitpläne.",
      },
    },
    context: {
      currentAppData: {
        en: "CURRENT APP DATA:",
        de: "AKTUELLE APP-DATEN:",
      },
      forms: {
        title: {
          en: "FORMS",
          de: "FORMULARE",
        },
        none: {
          en: "- No forms available",
          de: "- Keine Formulare vorhanden",
        },
        active: {
          en: "active",
          de: "aktiv",
        },
        inactive: {
          en: "inactive",
          de: "inaktiv",
        },
      },
      paymentMethods: {
        title: {
          en: "PAYMENT METHODS",
          de: "BEZAHLMETHODEN",
        },
        none: {
          en: "- No payment methods available",
          de: "- Keine Bezahlmethoden vorhanden",
        },
      },
      testResults: {
        title: {
          en: "TEST RESULTS (last 30 days):",
          de: "TESTERGEBNISSE (letzte 30 Tage):",
        },
        total: {
          en: "Total",
          de: "Gesamt",
        },
        success: {
          en: "Success",
          de: "Erfolg",
        },
        failed: {
          en: "Failed",
          de: "Fehler",
        },
        failedTests: {
          en: "FAILED TESTS",
          de: "FEHLGESCHLAGENE TESTS",
        },
        lastTests: {
          en: "LAST",
          de: "LETZTE",
        },
        tests: {
          en: "TESTS:",
          de: "TESTS:",
        },
        unknownError: {
          en: "Unknown error",
          de: "Unbekannter Fehler",
        },
      },
      combinations: {
        best: {
          en: "BEST COMBINATIONS (min. 3 tests):",
          de: "BESTE KOMBINATIONEN (mind. 3 Tests):",
        },
        worst: {
          en: "WORST COMBINATIONS (min. 3 tests):",
          de: "SCHLECHTESTE KOMBINATIONEN (mind. 3 Tests):",
        },
        none: {
          en: "- No data",
          de: "- Keine Daten",
        },
      },
      schedules: {
        title: {
          en: "SCHEDULES",
          de: "ZEITPLÄNE",
        },
        none: {
          en: "- No schedules available",
          de: "- Keine Zeitpläne vorhanden",
        },
      },
    },
  },
  formAutomation: {
    country: {
      default: {
        en: "Germany",
        de: "Deutschland",
      },
    },
    salutation: {
      mr: {
        en: "Mr.",
        de: "Herr",
      },
      mrs: {
        en: "Mrs.",
        de: "Frau",
      },
    },
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
 * Translate strings in main process
 * @param key - Translation key (e.g., "error.database", "ai.systemPrompt.introduction")
 * @returns Translated string in current language
 */
export function t(key: string): string {
  const language = getLanguage();
  
  // Handle nested keys (e.g., "error.database")
  const keys = key.split(".");
  let value: any = MAIN_DICTIONARY;
  
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
  
  // Handle arrays (for lists)
  if (Array.isArray(value)) {
    return value.map((item: any) => {
      if (typeof item === "object" && "en" in item && "de" in item) {
        return item[language] || item.en;
      }
      return item;
    }).join("\n");
  }
  
  // Fallback: return key if structure is invalid
  console.warn(`[Main] Invalid translation structure for key: ${key}`);
  return key;
}

/**
 * Helper to get array translations
 */
function getArrayTranslation(key: string): string[] {
  const lang = getLanguage();
  const keys = key.split(".");
  let value: any = MAIN_DICTIONARY;
  
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return [];
    }
  }
  
  if (value && typeof value === "object" && "en" in value && "de" in value) {
    return Array.isArray(value[lang]) ? value[lang] : (Array.isArray(value.en) ? value.en : []);
  }
  
  return [];
}

/**
 * Get AI system prompt in current language
 * @returns Complete system prompt as string
 */
export function getSystemPrompt(): string {
  const lang = getLanguage();
  const parts: string[] = [];
  
  parts.push(t("ai.systemPrompt.introduction"));
  parts.push("");
  parts.push(t("ai.systemPrompt.limitations.title"));
  parts.push(t("ai.systemPrompt.limitations.description"));
  parts.push(...getArrayTranslation("ai.systemPrompt.limitations.items"));
  parts.push("");
  parts.push(t("ai.systemPrompt.capabilities.title"));
  parts.push(...getArrayTranslation("ai.systemPrompt.capabilities.items"));
  parts.push("");
  parts.push(t("ai.systemPrompt.specialAnalyses.title"));
  parts.push(...getArrayTranslation("ai.systemPrompt.specialAnalyses.items"));
  parts.push("");
  parts.push(t("ai.systemPrompt.outputFormat.title"));
  parts.push(t("ai.systemPrompt.outputFormat.description"));
  parts.push("");
  parts.push(t("ai.systemPrompt.blockTypes.title"));
  parts.push("");
  parts.push(t("ai.systemPrompt.blockTypes.heading"));
  parts.push("");
  parts.push(t("ai.systemPrompt.blockTypes.text"));
  parts.push("");
  parts.push(t("ai.systemPrompt.blockTypes.table"));
  parts.push("");
  parts.push(t("ai.systemPrompt.blockTypes.chart"));
  parts.push("");
  parts.push(t("ai.systemPrompt.blockTypes.list"));
  parts.push("");
  parts.push(t("ai.systemPrompt.blockTypes.code"));
  parts.push("");
  parts.push(t("ai.systemPrompt.blockTypes.link"));
  parts.push("");
  parts.push(t("ai.systemPrompt.blockTypes.suggestions"));
  parts.push("");
  parts.push(t("ai.systemPrompt.blockTypes.action"));
  parts.push("");
  parts.push(t("ai.systemPrompt.example.title"));
  parts.push(t("ai.systemPrompt.example.content"));
  parts.push("");
  parts.push(t("ai.systemPrompt.links.title"));
  parts.push(...getArrayTranslation("ai.systemPrompt.links.items"));
  parts.push("");
  parts.push(t("ai.systemPrompt.rules.title"));
  parts.push(...getArrayTranslation("ai.systemPrompt.rules.items"));
  parts.push("");
  parts.push(t("ai.systemPrompt.context"));
  
  return parts.join("\n");
}
