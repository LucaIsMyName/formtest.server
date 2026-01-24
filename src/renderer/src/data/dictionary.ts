import { CONFIG } from "../app.config";

// Nested dictionary structure
type Dictionary = {
    [key: string]: Dictionary | { en: string; de: string };
};

export const DICTIONARY: Dictionary = {
    // Navigation (top-level keys for menu items)
    "nav-forms": { en: "Forms", de: "Formulare" },
    "payment-methods": { en: "Payment Methods", de: "Bezahlmethoden" },
    schedules: { en: "Schedules", de: "Zeitpläne" },
    tests: { en: "Tests", de: "Tests" },
    "nav-settings": { en: "Settings", de: "Einstellungen" },
    "nav-legal": { en: "Legal", de: "Rechtliches" },
    docs: { en: "Docs", de: "Doku" },
    scripts: { en: "Scripts", de: "Skripte" },
    "info-doku": { en: "Info & Docs", de: "Info & Doku" },

    // Actions
    "run-tests": { en: "Run Tests", de: "Tests ausführen" },
    "start-tests": { en: "Start Tests", de: "Tests starten" },
    "stop-tests": { en: "Stop Tests", de: "Tests stoppen" },
    "add-form": { en: "Add Form", de: "Formular hinzufügen" },
    "add-payment-method": { en: "Add Payment Method", de: "Bezahlmethode hinzufügen" },
    "add-schedule": { en: "Add Schedule", de: "Zeitplan hinzufügen" },
    "add-script": { en: "Add Script", de: "Skript hinzufügen" },
    "add-tag": { en: "Add Tag", de: "Tag hinzufügen" },
    "test-timeline": { en: "Test Timeline", de: "Test Verlauf" },
    compare: {
        en: "Compare",
        de: "Vergleichen"
    },
    endComparison: {
        en: "End Comparison",
        de: "Vergleich beenden"
    },
    comparisonMode: {
        en: "Comparison Mode",
        de: "Vergleichsmodus"
    },
    testCompare: {
        en: "Tests Compare",
        de: "Tests Vergleichen"
    },
    compare2Tests: {
        en: "Compare 2 Tests",
        de: "2 Tests vergleichen"
    },
    select2Tests: {
        en: "Select 2 Tests",
        de: "2 Tests auswählen"
    },
    // Error messages
    error: {
        noStepsToCompare: {
            en: "No steps to compare",
            de: " Keine Schritte zum Vergleichen vorhanden"
        },
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
            en: "An unknown error occurred.",
            de: "Ein unbekannter Fehler ist aufgetreten.",
        },
        boundary: {
            title: {
                en: "Something went wrong",
                de: "Etwas ist schiefgelaufen",
            },
            description: {
                en: "The application encountered an error",
                de: "Die Anwendung ist auf einen Fehler gestoßen",
            },
        },
        details: {
            en: "Error Details",
            de: "Fehlerdetails",
        },
        validation: {
            en: "Error during validation",
            de: "Fehler bei der Überprüfung",
        },
    },

    // Buttons
    button: {
        reload: { en: "Reload App", de: "App neu laden" },
        hideDetails: { en: "Hide Details", de: "Details ausblenden" },
        showDetails: { en: "Show Details", de: "Details anzeigen" },
        copy: { en: "Copy", de: "Kopieren" },
        delete: { en: "Delete", de: "Löschen" },
        save: { en: "Save", de: "Speichern" },
        saving: { en: "Saving...", de: "Speichern..." },
        saved: { en: "Saved", de: "Gespeichert" },
        cancel: { en: "Cancel", de: "Abbrechen" },
        create: { en: "Create", de: "Erstellen" },
        confirmDelete: { en: "Confirm Delete", de: "Löschen bestätigen" },
        deleting: { en: "Deleting...", de: "Löschen..." },
        confirm: { en: "Confirm", de: "Bestätigen" },
        start: { en: "Start", de: "Starten" },
        stop: { en: "Stop", de: "Stoppen" },
        update: { en: "Update", de: "Aktualisieren" },
        updating: { en: "Updating...", de: "Aktualisieren..." },
        change: { en: "Change", de: "Ändern" },
        enable: { en: "Enable", de: "Aktivieren" },
        disable: { en: "Disable", de: "Deaktivieren" },
        selectAll: { en: "Select All", de: "Alle auswählen" },
        clearAll: { en: "Clear All", de: "Alle löschen" },
        cleanup: { en: "Cleanup Now", de: "Jetzt bereinigen" },
        cleaning: { en: "Cleaning...", de: "Bereinige..." },
        unlock: { en: "Unlock", de: "Entsperren" },
    },

    // Table
    table: {
        empty: {
            en: "No entries available",
            de: "Keine Einträge vorhanden",
        },
        pagination: {
            of: { en: "of", de: "von" },
            nextPage: { en: "Next Page", de: "Nächste Seite" },
            previousPage: { en: "Previous Page", de: "Vorherige Seite" },
            page: { en: "Page", de: "Seite" },
            currentPage: { en: "Current Page", de: "Aktuelle Seite" },
        },
        headers: {
            method: { en: "Method", de: "Methode" },
            type: { en: "Type", de: "Typ" },
            tests: { en: "Tests", de: "Tests" },
            result: { en: "Result", de: "Ergebnis" },
            rate: { en: "Rate", de: "Rate" },
        },
    },

    // Forms
    forms: {
        empty: {
            en: "No forms found.",
            de: "Keine Formulare gefunden.",
        },
        noFormsConfigured: {
            en: "No forms configured yet.",
            de: "Noch keine Formulare konfiguriert.",
        },
        addFirstForm: {
            en: "Add First Form",
            de: "Erstes Formular hinzufügen",
        },
        tryOtherFilters: {
            en: "Try other search terms or filters.",
            de: "Versuche andere Suchbegriffe oder Filter.",
        },
        deleteTitle: {
            en: "Delete Form",
            de: "Formular löschen",
        },
        deleteMessage: {
            en: "Are you sure you want to delete this form? All associated test results will also be deleted. This action cannot be undone.",
            de: "Sind Sie sicher, dass Sie dieses Formular löschen möchten? Alle zugehörigen Test-Ergebnisse werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.",
        },
        deleteBulkMessage: {
            en: "Are you sure you want to delete {count} form(s)? All associated test results will also be deleted. This action cannot be undone.",
            de: "Sind Sie sicher, dass Sie {count} Formular(e) löschen möchten? Alle zugehörigen Test-Ergebnisse werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.",
        },
        selectedForms: {
            en: "{count} selected forms",
            de: "{count} ausgewählte Formulare",
        },
        deleteAllTitle: {
            en: "Delete Forms",
            de: "Formulare löschen",
        },
        deleteAllMessage: {
            en: "All forms and associated tests will be deleted.",
            de: "Alle Formulare und zugehörige Tests werden gelöscht.",
        },
        selectAtLeastOne: {
            en: "Please select at least one form",
            de: "Bitte wähle mindestens ein Formular aus",
        },
        active: { en: "Active", de: "Aktiv" },
        inactive: { en: "Inactive", de: "Inaktiv" },
    },

    // Payment Methods
    paymentMethods: {
        empty: {
            en: "No payment methods found.",
            de: "Keine Bezahlmethoden gefunden.",
        },
        noPaymentMethodsConfigured: {
            en: "No payment methods configured yet.",
            de: "Noch keine Bezahlmethoden konfiguriert.",
        },
        addFirst: {
            en: "Add First Payment Method",
            de: "Erste Bezahlmethode hinzufügen",
        },
        searchPlaceholder: {
            en: "Search payment methods...",
            de: "Bezahlmethoden durchsuchen...",
        },
        selectMethod: {
            en: "Select {name}",
            de: "{name} auswählen",
        },
        configured: {
            en: "Configured",
            de: "Konfiguriert",
        },
        deleteTitle: {
            en: "Delete Payment Method",
            de: "Bezahlmethode löschen",
        },
        deleteMessage: {
            en: "Are you sure you want to delete this payment method? All associated test results will also be deleted. This action cannot be undone.",
            de: "Sind Sie sicher, dass Sie diese Bezahlmethode löschen möchten? Alle zugehörigen Test-Ergebnisse werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.",
        },
        deleteBulkMessage: {
            en: "Are you sure you want to delete {count} payment method(s)? All associated test results will also be deleted. This action cannot be undone.",
            de: "Sind Sie sicher, dass Sie {count} Bezahlmethode(n) löschen möchten? Alle zugehörigen Test-Ergebnisse werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.",
        },
        selectedPaymentMethods: {
            en: "{count} selected payment methods",
            de: "{count} ausgewählte Bezahlmethoden",
        },
        deleteAllTitle: {
            en: "Delete Payment Methods",
            de: "Bezahlmethoden löschen",
        },
        deleteAllMessage: {
            en: "All payment methods will be deleted.",
            de: "Alle Bezahlmethoden werden gelöscht.",
        },
        selectAtLeastOne: {
            en: "Please select at least one payment method",
            de: "Bitte wähle mindestens eine Bezahlmethode aus",
        },
        noEmail: {
            en: "No Email",
            de: "Keine E-Mail",
        },
        noSepaData: {
            en: "No SEPA Data",
            de: "Keine SEPA-Daten",
        },
        noCardNumber: {
            en: "No Card Number",
            de: "Keine Kartennummer",
        },
        noBankSelected: {
            en: "No Bank Selected",
            de: "Keine Bank ausgewählt",
        },
        add: {
            en: "Add Payment Method",
            de: "Bezahlmethode hinzufügen",
        },
        update: {
            en: "Update Payment Method",
            de: "Bezahlmethode aktualisieren",
        },
        selectBank: {
            en: "Select Bank",
            de: "Bank auswählen",
        },
        selectType: {
            en: "Select Type",
            de: "Typ auswählen",
        },
        active: { en: "Active", de: "Aktiv" },
        inactive: { en: "Inactive", de: "Inaktiv" },
        edit: { en: "Edit", de: "Bearbeiten" },
    },

    // Dashboard
    dashboard: {
        title: { en: "Dashboard", de: "Dashboard" },
        noData: {
            en: "No test data available",
            de: "Keine Testdaten verfügbar",
        },
        paymentReliability: {
            en: "Payment Method Reliability",
            de: "Bezahlmethoden Zuverlässigkeit",
        },
        combinationAnalysis: {
            en: "Combination Analysis",
            de: "Kombinations-Analyse",
        },
        bestCombinations: {
            en: "Best Combinations",
            de: "Beste Kombinationen",
        },
        worstCombinations: {
            en: "Worst Combinations",
            de: "Schlechteste Kombinationen",
        },
        selectPeriod: {
            en: "Select Period",
            de: "Zeitraum wählen",
        },
        successful: { en: "Successful", de: "Erfolgreich" },
        failed: { en: "Failed", de: "Fehlgeschlagen" },
        stopped: { en: "Stopped", de: "Gestoppt" },
        form: { en: "Form", de: "Formular" },
        paymentMethod: { en: "Payment Method", de: "Bezahlmethode" },
        successRate: { en: "Success Rate", de: "Erfolgsrate" },
        successRateLabel: { en: "Success Rate:", de: "Erfolgsrate:" },
        successfulLabel: { en: "successful", de: "erfolgreich" },
        failedLabel: { en: "failed", de: "fehlgeschlagen" },
        stoppedLabel: { en: "stopped", de: "gestoppt" },
        totalTests: { en: "Total:", de: "Gesamt:" },
        type: { en: "Type:", de: "Typ:" },
        testCount: { en: "Test Count", de: "Anzahl Tests" },
    },

    // Settings
    settings: {
        apiKeyGenerated: { en: "New API key generated", de: "Neuer API-Key generiert" },
        noKeyGenerated: { en: "No key generated", de: "Kein Key generiert" },
        errorPrefix: { en: "Error:", de: "Fehler:" },
        apiKeyCopied: { en: "API key copied", de: "API-Key kopiert" },
        apiServerStopped: { en: "API Server stopped", de: "API Server gestoppt" },
        errorStopping: { en: "Error stopping", de: "Fehler beim Stoppen" },
        generateApiKeyFirst: { en: "Please generate an API key first", de: "Bitte zuerst einen API-Key generieren" },
        apiServerStarted: { en: "API Server started on port", de: "API Server gestartet auf Port" },
        errorStarting: { en: "Error starting", de: "Fehler beim Starten" },
        unexpectedError: { en: "Unexpected error", de: "Unerwarteter Fehler" },
        enabled: { en: "Enabled", de: "Aktiviert" },
        disabled: { en: "Disabled", de: "Deaktiviert" },
        email: { en: "Email", de: "E-Mail" },
        data: { en: "Data", de: "Daten" },
        selectors: { en: "Selectors", de: "Selektoren" },
        api: { en: "API", de: "API" },
        security: { en: "Security", de: "Sicherheit" },
        category: { en: "Category", de: "Kategorie" },
        noKeyGeneratedPlaceholder: { en: "No key generated", de: "Kein Key generiert" },
        copy: { en: "Copy", de: "Kopieren" },
        generateNewKey: { en: "Generate new key", de: "Neuen Key generieren" },
        editTag: { en: "Edit Tag", de: "Tag bearbeiten" },
        createTag: { en: "Create Tag", de: "Neuen Tag erstellen" },
        tagName: { en: "Name", de: "Name" },
        tagNamePlaceholder: { en: "Tag name", de: "Tag-Name" },
        color: { en: "Color", de: "Farbe" },
        preview: { en: "Preview", de: "Vorschau" },
        save: { en: "Save", de: "Speichern" },
        create: { en: "Create", de: "Erstellen" },
        deleteAll: {
            en: "Delete All Data",
            de: "Alle Daten löschen",
        },
        deleteAllMessage: {
            en: "ALL data (forms, payment methods, tests, schedules) will be deleted!",
            de: "ALLE Daten (Formulare, Bezahlmethoden, Tests, Zeitpläne) werden gelöscht!",
        },
        deleteAllDescription: {
            en: "Permanently delete ALL data",
            de: "ALLE Daten unwiderruflich löschen",
        },
        cssSelectors: {
            en: "CSS Selectors",
            de: "CSS Selektoren",
        },
        selectorsDescription: {
            en: "CSS selectors for automatic form detection. Custom selectors have priority over default selectors.",
            de: "CSS-Selektoren für automatische Formular-Erkennung. Eigene Selektoren haben Priorität vor Standard-Selektoren.",
        },
        globalDefaults: {
            en: "Global Defaults",
            de: "Globale Standardwerte",
        },
        globalDefaultsDescription: {
            en: "Default field values that override Faker.js. Form mappings have highest priority.",
            de: "Standard-Feldwerte die Faker.js überschreiben. Form-Mappings haben höchste Priorität.",
        },
        masterPassword: {
            en: "Master Password",
            de: "Master-Passwort",
        },
        masterPasswordEnabled: {
            en: "Password protection is enabled",
            de: "Passwortschutz ist aktiviert",
        },
        masterPasswordDisabled: {
            en: "Protect app with password on startup",
            de: "App beim Start mit Passwort schützen",
        },
        aiAssistant: {
            en: "AI Assistant",
            de: "AI-Assistent",
        },
        aiAssistantDescription: {
            en: "Configure the AI assistant for chat and analysis functions.",
            de: "Konfiguriere den AI-Assistenten für Chat und Analyse-Funktionen.",
        },
        tags: {
            en: "Tags",
            de: "Tags",
        },
        tagsDescription: {
            en: "Manage tags for test results",
            de: "Verwalten Sie Tags für Test-Ergebnisse",
        },
        donationAmount: {
            en: "Donation Amount (EUR)",
            de: "Spendenbetrag (EUR)",
        },
        donationAmountDescription: {
            en: "Default donation amount for tests",
            de: "Standard-Spendenbetrag für Tests",
        },
        interval: {
            en: "Interval",
            de: "Intervall",
        },
        intervalDescription: {
            en: "Default interval for tests",
            de: "Standard-Intervall für Tests",
        },
        once: {
            en: "Once",
            de: "Einmalig",
        },
        monthly: {
            en: "Monthly",
            de: "Monatlich",
        },
        quarterly: {
            en: "Quarterly",
            de: "Vierteljährlich",
        },
        yearly: {
            en: "Yearly",
            de: "Jährlich",
        },
        off: {
            en: "Off (Normal)",
            de: "Aus (Normal)",
        },
        headlessMode: {
            en: "Headless Mode",
            de: "Headless-Modus",
        },
        headlessModeDescription: {
            en: "Browser without visible window",
            de: "Browser ohne sichtbares Fenster",
        },
        theme: {
            en: "Theme",
            de: "Theme",
        },
        themeDescription: {
            en: "Application color scheme",
            de: "Farbschema der Anwendung",
        },
        emailEnabled: {
            en: "Email Enabled",
            de: "E-Mail aktiviert",
        },
        emailEnabledDescription: {
            en: "Email notifications",
            de: "Benachrichtigungen per E-Mail",
        },
        smtpHost: {
            en: "SMTP Server",
            de: "SMTP Server",
        },
        smtpHostDescription: {
            en: "SMTP server hostname",
            de: "Hostname des SMTP-Servers",
        },
        smtpPort: {
            en: "SMTP Port",
            de: "SMTP Port",
        },
        smtpPortDescription: {
            en: "SMTP server port",
            de: "Port des SMTP-Servers",
        },
        smtpSecure: {
            en: "SSL/TLS",
            de: "SSL/TLS",
        },
        smtpSecureDescription: {
            en: "Use secure connection",
            de: "Sichere Verbindung verwenden",
        },
        senderEmail: {
            en: "Sender Email",
            de: "Absender E-Mail",
        },
        senderEmailDescription: {
            en: "Sender email address",
            de: "E-Mail-Adresse des Absenders",
        },
        senderName: {
            en: "Sender Name",
            de: "Absender Name",
        },
        senderNameDescription: {
            en: "Sender name",
            de: "Name des Absenders",
        },
        notifyOnSuccess: {
            en: "On Success",
            de: "Bei Erfolg",
        },
        notifyOnSuccessDescription: {
            en: "Notify on successful tests",
            de: "Bei erfolgreichen Tests benachrichtigen",
        },
        notifyOnFailure: {
            en: "On Failure",
            de: "Bei Fehler",
        },
        notifyOnFailureDescription: {
            en: "Notify on failed tests",
            de: "Bei fehlgeschlagenen Tests benachrichtigen",
        },
        testEmail: {
            en: "Test Email",
            de: "Test-E-Mail",
        },
        testEmailDescription: {
            en: "Test configuration",
            de: "Konfiguration testen",
        },
        sending: {
            en: "Sending...",
            de: "Sende...",
        },
        send: {
            en: "Send",
            de: "Senden",
        },
        cleanupResult: {
            en: "{count} old tests deleted",
            de: "{count} alte Tests gelöscht",
        },
        exporting: {
            en: "Exporting...",
            de: "Exportiere...",
        },
        export: {
            en: "Export",
            de: "Exportieren",
        },
        dataExport: {
            en: "Export Data",
            de: "Daten exportieren",
        },
        dataExportDescription: {
            en: "Export forms, payment methods, tests",
            de: "Formulare, Bezahlmethoden, Tests exportieren",
        },
        importing: {
            en: "Importing...",
            de: "Importiere...",
        },
        import: {
            en: "Import",
            de: "Importieren",
        },
        dataImport: {
            en: "Import Data",
            de: "Daten importieren",
        },
        dataImportDescription: {
            en: "Restore data from backup",
            de: "Daten aus Backup wiederherstellen",
        },
        deleteTestsTitle: {
            en: "Delete Tests",
            de: "Alle Tests löschen",
        },
        deleteTestsMessage: {
            en: "All test results will be deleted.",
            de: "Alle Testergebnisse werden gelöscht.",
        },
        deleteSchedulesTitle: {
            en: "Delete Schedules",
            de: "Alle Zeitpläne löschen",
        },
        deleteSchedulesMessage: {
            en: "All schedules will be deleted.",
            de: "Alle Zeitpläne werden gelöscht.",
        },
        deleteAllAction: {
            en: "Delete All",
            de: "Alles löschen",
        },
        tag: {
            en: "Tag",
            de: "Tag",
        },
        slowMotion: {
            en: "Slow Motion (ms)",
            de: "Slow Motion (ms)",
        },
        slowMotionDescription: {
            en: "Delay between actions (Debugging)",
            de: "Verzögerung zwischen Aktionen (Debugging)",
        },
        testTimeout: {
            en: "Test Timeout (ms)",
            de: "Test-Timeout (ms)",
        },
        testTimeoutDescription: {
            en: "Maximum wait time for operations",
            de: "Maximale Wartezeit für Operationen",
        },
        smtpUser: {
            en: "SMTP User",
            de: "SMTP Benutzer",
        },
        smtpUserDescription: {
            en: "Username for SMTP",
            de: "Benutzername für SMTP",
        },
        smtpPassword: {
            en: "SMTP Password",
            de: "SMTP Passwort",
        },
        smtpPasswordDescription: {
            en: "Password for SMTP",
            de: "Passwort für SMTP",
        },
        recipientEmail: {
            en: "Recipient Email",
            de: "Empfänger E-Mail",
        },
        recipientEmailDescription: {
            en: "Recipient email address",
            de: "E-Mail-Adresse des Empfängers",
        },
        apiServer: {
            en: "API Server",
            de: "API Server",
        },
        apiServerRunning: {
            en: "Running on Port",
            de: "Läuft auf Port",
        },
        apiServerDescription: {
            en: "Start server for external access (CI/CD)",
            de: "Server starten für externe Zugriffe (CI/CD)",
        },
        apiPort: {
            en: "Port",
            de: "Port",
        },
        apiPortDescription: {
            en: "Port for API server (Default: 3847)",
            de: "Port für den API Server (Standard: 3847)",
        },
        apiKey: {
            en: "API Key",
            de: "API Key",
        },
        apiKeyDescription: {
            en: "Authentication key for API access",
            de: "Authentifizierungs-Key für API-Zugriffe",
        },
        retentionDays: {
            en: "Test Retention (Days)",
            de: "Test-Aufbewahrung (Tage)",
        },
        retentionDaysDescription: {
            en: "Automatically delete test results older than X days (0=never)",
            de: "Testergebnisse älter als X Tage automatisch löschen (0=nie)",
        },
        cleanupNow: {
            en: "Cleanup Old Tests",
            de: "Alte Tests bereinigen",
        },
        cleanupNowDescription: {
            en: "Delete old test results according to retention policy now",
            de: "Jetzt alte Testergebnisse gemäß Aufbewahrungsfrist löschen",
        },
        deleteForms: {
            en: "Delete Forms",
            de: "Formulare löschen",
        },
        deleteFormsDescription: {
            en: "Delete all forms and associated tests",
            de: "Alle Formulare und zugehörige Tests löschen",
        },
        deletePayments: {
            en: "Delete Payment Methods",
            de: "Bezahlmethoden löschen",
        },
        deletePaymentsDescription: {
            en: "Delete all payment methods",
            de: "Alle Bezahlmethoden löschen",
        },
        deleteTests: {
            en: "Delete Tests",
            de: "Tests löschen",
        },
        deleteTestsDescription: {
            en: "Delete all test results",
            de: "Alle Testergebnisse löschen",
        },
        deleteSchedules: {
            en: "Delete Schedules",
            de: "Zeitpläne löschen",
        },
        deleteSchedulesDescription: {
            en: "Delete all schedules",
            de: "Alle Zeitpläne löschen",
        },
        passwordMismatch: {
            en: "Passwords do not match",
            de: "Passwörter stimmen nicht überein",
        },
        confirmPassword: {
            en: "Confirm Password",
            de: "Passwort bestätigen",
        },
        deleteTagConfirm: {
            en: "Do you really want to delete this tag? Tests with this tag keep the tag, but it will no longer be shown in the list.",
            de: "Möchten Sie diesen Tag wirklich löschen? Tests mit diesem Tag behalten den Tag, aber er wird nicht mehr in der Liste angezeigt.",
        },
        passwordRequired: {
            en: "Please enter password",
            de: "Bitte Passwort eingeben",
        },
        passwordMinLength: {
            en: "Password must be at least 4 characters",
            de: "Passwort muss mindestens 4 Zeichen haben",
        },
        passwordEnabledSuccess: {
            en: "Master password enabled",
            de: "Master-Passwort aktiviert",
        },
        passwordDisabledSuccess: {
            en: "Master password disabled",
            de: "Master-Passwort deaktiviert",
        },
        currentPasswordRequired: {
            en: "Please enter current password",
            de: "Bitte aktuelles Passwort eingeben",
        },
        wrongPassword: {
            en: "Wrong password",
            de: "Falsches Passwort",
        },
        passwordActive: {
            en: "Password protection active",
            de: "Passwortschutz aktiv",
        },
        passwordInactive: {
            en: "Password protection inactive",
            de: "Passwortschutz inaktiv",
        },
        disablePassword: {
            en: "Disable password protection",
            de: "Passwortschutz deaktivieren",
        },
        enablePassword: {
            en: "Enable password protection",
            de: "Passwortschutz aktivieren",
        },
        currentPassword: {
            en: "Current Password",
            de: "Aktuelles Passwort",
        },
        newPassword: {
            en: "New Password (min. 4 characters)",
            de: "Neues Passwort (min. 4 Zeichen)",
        },
        language: {
            en: "Language",
            de: "Sprache",
        },
        languageDescription: {
            en: "Select the language for the application",
            de: "Sprache für die Anwendung auswählen",
        },
        languageEnglish: {
            en: "English",
            de: "Englisch",
        },
        languageGerman: {
            en: "German",
            de: "Deutsch",
        },
    },

    // Field Labels
    field: {
        firstName: { en: "First Name", de: "Vorname" },
        lastName: { en: "Last Name", de: "Nachname" },
        email: { en: "Email", de: "E-Mail" },
        street: { en: "Street", de: "Straße" },
        zip: { en: "ZIP Code", de: "PLZ" },
        city: { en: "City", de: "Stadt" },
        country: { en: "Country (ISO Code)", de: "Land (ISO Code)" },
        phone: { en: "Phone", de: "Telefon" },
        birthday: { en: "Birthday", de: "Geburtstag" },
        title: { en: "Title", de: "Titel" },
        company: { en: "Company", de: "Firma" },
        salutation: { en: "Salutation", de: "Anrede" },
        iban: { en: "IBAN", de: "IBAN" },
        accountHolder: { en: "Account Holder", de: "Kontoinhaber" },
        amount: { en: "Amount", de: "Betrag" },
        customAmount: { en: "Custom Amount", de: "Eigener Betrag" },
        interval: { en: "Interval", de: "Intervall" },
        privacy: { en: "Privacy", de: "Datenschutz" },
        newsletter: { en: "Newsletter", de: "Newsletter" },
        address: { en: "Address", de: "Adresse" },
        cardNumber: { en: "Card Number", de: "Kartennummer" },
        cardHolder: { en: "Card Holder", de: "Karteninhaber" },
        expiryDate: { en: "Expiry Date", de: "Ablaufdatum" },
        cvv: { en: "CVV", de: "CVV" },
        bankSelect: { en: "Bank Selection", de: "Bank-Auswahl" },
    },

    // Selector Editor
    selector: {
        default: { en: "Default", de: "Standard" },
        custom: { en: "custom", de: "eigene" },
        customSelectors: { en: "Custom Selectors (Priority)", de: "Eigene Selektoren (Priorität)" },
        defaultSelectors: { en: "Default Selectors", de: "Standard-Selektoren" },
        andMore: { en: "... and {count} more", de: "... und {count} weitere" },
        addNewSelector: { en: "Add new selector (e.g. #my-field)", de: "Neuen Selektor hinzufügen (z.B. #my-field)" },
        remove: { en: "Remove", de: "Entfernen" },
        category: {
            formFields: { en: "Form Fields", de: "Formularfelder" },
            paymentMethods: { en: "Payment Methods", de: "Zahlungsmethoden" },
            paymentFields: { en: "Payment Fields", de: "Zahlungsfelder" },
            cookieConsent: { en: "Cookie Consent", de: "Cookie-Zustimmung" },
            successPatterns: { en: "Success Detection", de: "Erfolgs-Erkennung" },
            formDetection: { en: "Form Detection", de: "Formular-Erkennung" },
            submitButtons: { en: "Submit Buttons", de: "Submit-Buttons" },
            iframeDetection: { en: "Iframe Detection", de: "Iframe-Erkennung" },
        },
        paymentMethod: {
            sepa: { en: "SEPA", de: "SEPA" },
            creditcard: { en: "Credit Card", de: "Kreditkarte" },
            paypal: { en: "PayPal", de: "PayPal" },
            eps: { en: "EPS", de: "EPS" },
        },
        cookieConsent: {
            banners: { en: "Banner Selectors", de: "Banner-Selektoren" },
            acceptButtons: { en: "Accept Buttons", de: "Accept-Buttons" },
        },
        successPatterns: {
            redirectUrls: { en: "Redirect URLs", de: "Redirect-URLs" },
            successMessages: { en: "Success Messages", de: "Erfolgsmeldungen" },
            successSelectors: { en: "Success Selectors", de: "Erfolgs-Selektoren" },
        },
        formDetection: {
            fundraisingBox: { en: "FundraisingBox", de: "FundraisingBox" },
            genericForm: { en: "Generic Forms", de: "Generische Formulare" },
        },
    },

    // Placeholders
    placeholder: {
        faker: { en: "Faker.js", de: "Faker.js" },
        iban: { en: "e.g. AT89370400440532013000", de: "z.B. AT89370400440532013000" },
        country: { en: "e.g. AT, DE", de: "z.B. AT, DE" },
        birthday: { en: "e.g. 01.01.1980", de: "z.B. 01.01.1980" },
        title: { en: "e.g. Dr., Mag.", de: "z.B. Dr., Mag." },
        selectForm: { en: "Select Form", de: "Formular auswählen" },
        selectPaymentMethod: { en: "Select Payment Method", de: "Bezahlmethode auswählen" },
        selectFrequency: { en: "Select Frequency", de: "Häufigkeit auswählen" },
        selectFieldType: { en: "Select Field Type", de: "Feldtyp wählen" },
        selectProvider: { en: "Select Provider", de: "Provider auswählen" },
        selectModel: { en: "Select Model", de: "Modell auswählen" },
        loadingModels: { en: "Loading Models...", de: "Lade Modelle..." },
        enterValidUrl: { en: "Please enter a valid URL", de: "Bitte geben Sie eine gültige URL ein" },
        fillRequiredFields: { en: "Please fill in all required fields.", de: "Bitte füllen Sie alle Pflichtfelder aus." },
    },

    // Salutation
    salutation: {
        mr: { en: "Mr.", de: "Herr" },
        mrs: { en: "Mrs.", de: "Frau" },
        mx: { en: "Mx.", de: "Divers" },
    },

    // Schedule
    schedule: {
        dailyAt6: { en: "Daily at 06:00", de: "Täglich um 06:00" },
        dailyAt7: { en: "Daily at 07:00", de: "Täglich um 07:00" },
        dailyAt8: { en: "Daily at 08:00", de: "Täglich um 08:00" },
        dailyAt9: { en: "Daily at 09:00", de: "Täglich um 09:00" },
        dailyAt10: { en: "Daily at 10:00", de: "Täglich um 10:00" },
        dailyAt12: { en: "Daily at 12:00", de: "Täglich um 12:00" },
        dailyAt14: { en: "Daily at 14:00", de: "Täglich um 14:00" },
        dailyAt15: { en: "Daily at 15:00", de: "Täglich um 15:00" },
        dailyAt16: { en: "Daily at 16:00", de: "Täglich um 16:00" },
        dailyAt17: { en: "Daily at 17:00", de: "Täglich um 17:00" },
        dailyAt18: { en: "Daily at 18:00", de: "Täglich um 18:00" },
        dailyAt19: { en: "Daily at 19:00", de: "Täglich um 19:00" },
        dailyAt20: { en: "Daily at 20:00", de: "Täglich um 20:00" },
        dailyAt21: { en: "Daily at 21:00", de: "Täglich um 21:00" },
        dailyAt22: { en: "Daily at 22:00", de: "Täglich um 22:00" },
        threeTimesDaily: { en: "3x daily (08:00, 14:00, 20:00)", de: "3x täglich (08:00, 14:00, 20:00)" },
        twiceDaily: { en: "2x daily (09:00, 18:00)", de: "2x täglich (09:00, 18:00)" },
        fourTimesDaily: { en: "4x daily (06:00, 12:00, 18:00, 23:00)", de: "4x täglich (06:00, 12:00, 18:00, 23:00)" },
        deleteTitle: { en: "Delete Schedule", de: "Zeitplan löschen" },
    },

    // Scripts
    script: {
        editTitle: { en: "Edit Script", de: "Script bearbeiten" },
        createTitle: { en: "New Script", de: "Neues Script" },
        name: { en: "Name", de: "Name" },
        nameRequired: { en: "Name is required", de: "Name ist erforderlich" },
        description: { en: "Description", de: "Beschreibung" },
        descriptionPlaceholder: { en: "Optional description", de: "Optionale Beschreibung" },
        hookPointLabel: { en: "Hook Point", de: "Hook-Punkt" },
        status: { en: "Status", de: "Status" },
        active: { en: "Active", de: "Aktiv" },
        code: { en: "Playwright Code", de: "Playwright Code" },
        codeRequired: { en: "Code is required", de: "Code ist erforderlich" },
        codeEmpty: { en: "Code cannot be empty", de: "Code darf nicht leer sein" },
        codePlaceholder: { en: "// Example: await click('button.custom-button');", de: "// Beispiel: await click('button.custom-button');" },
        validate: { en: "Validate", de: "Validieren" },
        validating: { en: "Validating...", de: "Validiere..." },
        validationFailed: { en: "Validation failed", de: "Validierung fehlgeschlagen" },
        syntaxValid: { en: "✓ Code syntax is valid", de: "✓ Code-Syntax ist gültig" },
        syntaxError: { en: "Error:", de: "Fehler:" },
        timeout: { en: "Timeout (s)", de: "Timeout (s)" },
        timeoutInvalid: { en: "Timeout must be between 1 and 300 seconds", de: "Timeout muss zwischen 1 und 300 Sekunden liegen" },
        scope: { en: "Scope", de: "Geltungsbereich" },
        scopeGlobal: { en: "Global", de: "Global" },
        scopeFormSpecific: { en: "Form-specific", de: "Form-spezifisch" },
        errorHandling: { en: "Error Handling", de: "Fehlerbehandlung" },
        stopOnError: { en: "Stop on error", de: "Bei Fehler stoppen" },
        note: { en: "Note:", de: "Hinweis:" },
        formSpecificNote: { en: "Form-specific scripts must be manually assigned to the desired forms after creation.", de: "Form-spezifische Scripts müssen nach dem Erstellen manuell den gewünschten Formularen zugewiesen werden." },
        hookPoint: {
            beforeNavigation: { en: "Before Navigation", de: "Vor Navigation" },
            beforeNavigationDesc: { en: "Before the page is loaded", de: "Bevor die Seite geladen wird" },
            afterNavigation: { en: "After Navigation", de: "Nach Navigation" },
            afterNavigationDesc: { en: "After the page has been loaded", de: "Nachdem die Seite geladen wurde" },
            beforeCookieBanner: { en: "Before Cookie Banner", de: "Vor Cookie-Banner" },
            beforeCookieBannerDesc: { en: "Before cookie banner is handled", de: "Bevor Cookie-Banner behandelt wird" },
            afterCookieBanner: { en: "After Cookie Banner", de: "Nach Cookie-Banner" },
            afterCookieBannerDesc: { en: "After cookie banner has been handled", de: "Nachdem Cookie-Banner behandelt wurde" },
            beforeFormFill: { en: "Before Form Fill", de: "Vor Formular-Ausfüllung" },
            beforeFormFillDesc: { en: "Before the form is filled", de: "Bevor das Formular ausgefüllt wird" },
            afterFormFill: { en: "After Form Fill", de: "Nach Formular-Ausfüllung" },
            afterFormFillDesc: { en: "After the form has been filled", de: "Nachdem das Formular ausgefüllt wurde" },
            beforePayment: { en: "Before Payment", de: "Vor Zahlung" },
            beforePaymentDesc: { en: "Before the payment method is selected", de: "Bevor die Zahlungsmethode ausgewählt wird" },
            afterPayment: { en: "After Payment", de: "Nach Zahlung" },
            afterPaymentDesc: { en: "After the payment method has been selected", de: "Nachdem die Zahlungsmethode ausgewählt wurde" },
            beforeSubmit: { en: "Before Submit", de: "Vor Absenden" },
            beforeSubmitDesc: { en: "Before the form is submitted", de: "Bevor das Formular abgesendet wird" },
            afterSubmit: { en: "After Submit", de: "Nach Absenden" },
            afterSubmitDesc: { en: "After the form has been submitted", de: "Nachdem das Formular abgesendet wurde" },
            onSuccess: { en: "On Success", de: "Bei Erfolg" },
            onSuccessDesc: { en: "When the test was successful", de: "Wenn der Test erfolgreich war" },
            onError: { en: "On Error", de: "Bei Fehler" },
            onErrorDesc: { en: "When an error occurred", de: "Wenn ein Fehler aufgetreten ist" },
        },
        deleteTitle: { en: "Delete Script", de: "Script löschen" },
        scriptsTitle: { en: "Scripts", de: "Skripte" },
        newScript: { en: "New Script", de: "Neues Skript" },
        errorLoading: { en: "Error loading scripts:", de: "Fehler beim Laden der Scripts:" },
        retry: { en: "Retry", de: "Erneut versuchen" },
        pageDescription: { en: "Playwright snippets for advanced test automation", de: "Playwright-Snippets für erweiterte Test-Automatisierung" },
        typeLabel: { en: "Type", de: "Typ" },
        stopOnErrorLabel: { en: "Stop on Error", de: "Stop bei Fehler" },
        timeoutLabel: { en: "Timeout", de: "Timeout" },
        actionsLabel: { en: "Actions", de: "Aktionen" },
        globalLabel: { en: "Global", de: "Global" },
        formSpecificLabel: { en: "Form-specific", de: "Form-spezifisch" },
        yesLabel: { en: "Yes", de: "Ja" },
        noLabel: { en: "No", de: "Nein" },
        activeLabel: { en: "Active", de: "Aktiv" },
        inactiveLabel: { en: "Inactive", de: "Inaktiv" },
        noScriptsCreated: { en: "No custom scripts created yet. Click \"New Script\" to get started.", de: "Noch keine Custom Scripts erstellt. Klicke auf \"Neues Script\" um zu beginnen." },
    },

    // Test Results
    testResults: {
        success: { en: "Test completed successfully", de: "Test erfolgreich abgeschlossen" },
        failure: { en: "Test failed", de: "Test fehlgeschlagen" },
        skipped: { en: "Test skipped", de: "Test übersprungen" },
        stopped: { en: "Test stopped", de: "Test gestoppt" },
        running: { en: "Test running", de: "Test läuft" },
        successMessage: { en: "All steps completed successfully", de: "Alle Schritte erfolgreich durchgeführt" },
        failureMessage: { en: "Test ended with errors", de: "Test mit Fehlern beendet" },
        skippedLabel: { en: "Skipped", de: "Übersprungen" },
        successLabel: { en: "Successful", de: "Erfolgreich" },
        failureLabel: { en: "Failed", de: "Fehlgeschlagen" },
        stoppedLabel: { en: "Stopped", de: "Gestoppt" },
        deleted: { en: "Deleted", de: "Gelöscht" },
        unknown: { en: "Unknown", de: "Unbekannt" },
        unknownError: { en: "Unknown error", de: "Unbekannter Fehler" },
        finishedTests: { en: "Finished Tests", de: "Ausgeführte Tests" },
        test: { en: "Test", de: "Test" },
        tests: { en: "Tests", de: "Tests" },
        error: { en: "Error", de: "Fehler" },
        actions: { en: "Actions", de: "Aktionen" },
        form: { en: "Form", de: "Formular" },
        paymentMethod: { en: "Payment Method", de: "Bezahlmethode" },
        status: { en: "Status", de: "Status" },
        scheduled: { en: "Scheduled", de: "Geplant" },
        amount: { en: "Amount", de: "Betrag" },
        interval: { en: "Interval", de: "Intervall" },
        duration: { en: "Duration", de: "Dauer" },
        date: { en: "Date", de: "Datum" },
        tags: { en: "Tags", de: "Tags" },
        notes: { en: "Notes", de: "Notizen" },
        runAgain: { en: "Run Again", de: "Test erneut ausführen" },
        stopTest: { en: "Stop Test", de: "Test stoppen" },
        allStatuses: { en: "All Statuses", de: "Alle Status" },
        filterByTags: { en: "Filter by Tags", de: "Nach Tags filtern" },
        resetTags: { en: "Reset Tags", de: "Tags zurücksetzen" },
        showArchived: { en: "Show Archived", de: "Archivierte anzeigen" },
        archived: { en: "Archived", de: "Archiviert" },
        reset: { en: "Reset", de: "Zurücksetzen" },
        deletePreset: { en: "Delete Preset", de: "Vorlage löschen" },
        saveCurrentFilters: { en: "Save Current Filters", de: "Aktuelle Filter speichern" },
        groupBy: { en: "Group by", de: "Gruppieren" },
        noGrouping: { en: "No Grouping", de: "Keine Gruppierung" },
        groupByForm: { en: "Group by Form", de: "Nach Formular gruppieren" },
        groupByPaymentMethod: { en: "Group by Payment Method", de: "Nach Bezahlmethode gruppieren" },
        groupByDate: { en: "Group by Date", de: "Nach Datum gruppieren" },
        groupByFormPaymentMethod: { en: "Group by Form > Payment Method", de: "Nach Formular > Bezahlmethode" },
        groupByFormDate: { en: "Group by Form > Date", de: "Nach Formular > Datum" },
        groupByPaymentMethodDate: { en: "Group by Payment Method > Date", de: "Nach Bezahlmethode > Datum" },
        groupByFormPaymentMethodDate: { en: "Group by Form > Payment Method > Date", de: "Nach Formular > Bezahlmethode > Datum" },
        unarchive: { en: "Unarchive", de: "Entarchivieren" },
        archive: { en: "Archive", de: "Archivieren" },
        delete: { en: "Delete", de: "Löschen" },
        selectAll: { en: "Select All", de: "Alle auswählen" },
        copyUuid: { en: "Copy UUID", de: "UUID kopieren" },
        removeFromQueue: { en: "Remove from Queue", de: "Aus Warteschlange entfernen" },
        yes: { en: "Yes", de: "Ja" },
        no: { en: "No", de: "Nein" },
        addNotes: { en: "Add notes to this test", de: "Notizen zu diesen Test hinzufügen" },
        deleteTestRun: { en: "Delete Test Run", de: "Test Run löschen" },
        deleteTests: { en: "Delete Tests", de: "Tests löschen" },
        chooseTwoTests: { en: "Choose two tests", de: "Wähle zwei Tests aus" },
        closeGroupingPopover: { en: "Close Grouping Popover", de: "Gruppierungsmenü schließen" },
        inQueue: { en: "in Queue", de: "in Warteschlange" },
        select: { en: "select", de: "auswählen" },
        runningTests: { en: "Running Tests", de: "Laufende Tests" },
        notesLabel: { en: "Notes", de: "Notizen" },
        deleteTestRunTitle: { en: "Delete Test Run", de: "Test Run löschen" },
        deleteTestRunMessage: { en: "Are you sure you want to delete this test run? This action cannot be undone.", de: "Sind Sie sicher, dass Sie diesen Test Run löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden." },
        deleteTestsTitle: { en: "Delete Tests", de: "Tests löschen" },
        deleteTestsMessage: { en: "Are you sure you want to delete {count} test(s)? This action cannot be undone.", de: "Sind Sie sicher, dass Sie {count} Test(s) löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden." },
        selectedTests: { en: "selected tests", de: "ausgewählte Tests" },
        groupByLabel: { en: "Group by", de: "Gruppieren" },
        formLabel: { en: "Form", de: "Formular" },
        paymentMethodLabel: { en: "Payment Method", de: "Bezahlmethode" },
        dateLabel: { en: "Date", de: "Datum" },
        cookieBanner: { en: "Cookie Banner", de: "Cookie-Banner" },
        noCookieBanner: { en: "No Cookie Banner", de: "Kein Cookie-Banner" },
        fields: { en: "fields", de: "Felder" },
        filled: { en: "filled", de: "ausgefüllt" },
        unknownStatus: { en: "Unknown", de: "Unbekannt" },
        deletedStatus: { en: "Deleted", de: "Gelöscht" },
        durationMs: { en: "Duration (ms)", de: "Dauer (ms)" },
        yesAnswer: { en: "Yes", de: "Ja" },
        noAnswer: { en: "No", de: "Nein" },
        noTestsToExport: { en: "No tests found to export.", de: "Keine Tests zum Exportieren gefunden." },
        uploadInstructions: { en: "2. Select \"Upload\"", de: "2. Wählen Sie \"Hochladen\"" },
        noFinishedTests: { en: "No finished tests yet.", de: "Noch keine abgeschlossenen Tests." },
        noTestsFound: { en: "No tests found.", de: "Keine Tests gefunden." },
        runTestsToSeeResults: { en: "Run tests to see results here.", de: "Führe Tests aus, um Ergebnisse hier zu sehen." },
        tryOtherFilters: { en: "Try other search terms or filters.", de: "Versuche andere Suchbegriffe oder Filter." },
        creditCard: { en: "Credit Card", de: "Kreditkarte" },
        sepaDirectDebit: { en: "SEPA Direct Debit", de: "SEPA Lastschrift" },
        retest: { en: "Retest", de: "Erneut testen" },
    },

    // AI Chat
    ai: {
        newChat: { en: "New Chat", de: "Neuer Chat" },
        deleteAllChats: { en: "Delete All Chats", de: "Alle Chats löschen" },
        deleteAllChatsMessage: { en: "Do you really want to delete all chats? This action cannot be undone.", de: "Möchtest du wirklich alle Chats löschen? Diese Aktion kann nicht rückgängig gemacht werden." },
        notConfigured: {
            en: "AI Assistant not configured",
            de: "AI-Assistent nicht konfiguriert",
        },
        configureApiKey: {
            en: "To use the AI assistant, you must first configure a provider and API key in the settings.",
            de: "Um den AI-Assistenten zu nutzen, musst du zuerst einen Provider und API-Key in den Einstellungen konfigurieren.",
        },
        retryAttempt: { en: "Retry attempt {count} of 3", de: "Wiederholungsversuch {count} von 3" },
        apiKeyValid: { en: "API key is valid", de: "API-Key ist gültig" },
        apiKeyInvalid: { en: "API key is invalid", de: "API-Key ist ungültig" },
        ensureOllamaRunning: {
            en: "Make sure Ollama is running and models are installed",
            de: "Stelle sicher, dass Ollama läuft und Modelle installiert sind",
        },
        enterValidApiKey: {
            en: "Enter a valid API key to load models",
            de: "Gib einen gültigen API-Key ein, um Modelle zu laden",
        },
        chatHistory: { en: "Chat History", de: "Chat-Verlauf" },
        fullscreen: { en: "Fullscreen", de: "Vollbild" },
        close: { en: "Close", de: "Schließen" },
        rename: { en: "Rename", de: "Umbenennen" },
        delete: { en: "Delete", de: "Löschen" },
        assistant: { en: "AI Assistant", de: "AI Assistent" },
        howCanIHelp: { en: "How can I help?", de: "Wie kann ich helfen?" },
        emptyStateDescription: { en: "Ask me about forms, payment methods, test results or let me analyze your data.", de: "Frag mich nach Formularen, Bezahlmethoden, Testergebnissen oder lass mich deine Daten analysieren." },
        suggestions: {
            analyzeFailedTests: { en: "Analyze failed tests", de: "Analysiere fehlgeschlagene Tests" },
            showFormSuccessRate: { en: "Show success rate of forms", de: "Zeige Erfolgsrate der Formulare" },
            compareLast7Days: { en: "Compare test results of the last 7 days", de: "Vergleiche Test-Ergebnisse der letzten 7 Tage" },
            showAllFormStats: { en: "Show statistics for all forms", de: "Zeige Statistiken zu allen Formularen" },
            bestCombinations: { en: "Which form+payment method combinations work best?", de: "Welche Formular+Bezahlmethode Kombinationen funktionieren am besten?" },
            analyzeLast30Days: { en: "Analyze trends of the last 30 days", de: "Analysiere Trends der letzten 30 Tage" },
            showAllTestStats: { en: "Show statistics for all tests", de: "Zeige Statistiken zu allen Tests" },
            whyFailed: { en: "Why did certain tests fail?", de: "Warum sind bestimmte Tests fehlgeschlagen?" },
            showActiveFormStats: { en: "Show statistics for active forms", de: "Zeige Statistiken zu aktiven Formularen" },
            comparePaymentMethods: { en: "Compare success rates between payment methods", de: "Vergleiche Erfolgsraten zwischen Bezahlmethoden" },
            showAllPaymentStats: { en: "Show statistics for all payment methods", de: "Zeige Statistiken zu allen Bezahlmethoden" },
            analyzeFailedDetail: { en: "Analyze failed tests in detail", de: "Analysiere fehlgeschlagene Tests im Detail" },
            whyFailedDetail: { en: "Why did these tests fail?", de: "Warum sind diese Tests fehlgeschlagen?" },
            showErrorCauses: { en: "Show error causes of recent tests", de: "Zeige Fehlerursachen der letzten Tests" },
            compareFormSuccessRates: { en: "Compare success rates between forms", de: "Vergleiche Erfolgsraten zwischen Formularen" },
            showSuccessRateTrend: { en: "Show success rate trend of the last 30 days", de: "Zeige Erfolgsrate Trend der letzten 30 Tage" },
            bestSuccessRateCombos: { en: "Which combinations have the best success rate?", de: "Welche Kombinationen haben die beste Erfolgsrate?" },
            compareAllForms: { en: "Compare all forms", de: "Vergleiche alle Formulare" },
            showFormStats: { en: "Show statistics for each form", de: "Zeige Statistiken zu jedem Formular" },
            mostTestsForm: { en: "Which form has the most tests?", de: "Welches Formular hat die meisten Tests?" },
            bestPaymentMethod: { en: "Which payment method works best?", de: "Welche Bezahlmethode funktioniert am besten?" },
            analyzeTrends7Days: { en: "Analyze trends of the last 7 days", de: "Analysiere Trends der letzten 7 Tage" },
            compareTimePeriods: { en: "Compare different time periods", de: "Vergleiche verschiedene Zeiträume" },
            showSuccessRateOverTime: { en: "Show success rate development over time", de: "Zeige Entwicklung der Erfolgsrate über Zeit" },
            showDetailedStats: { en: "Show detailed test statistics", de: "Zeige detaillierte Test-Statistiken" },
            analyzeDifferentPeriods: { en: "Analyze data from different time periods", de: "Analysiere Daten aus verschiedenen Zeiträumen" },
            compareAggregatedData: { en: "Compare aggregated data", de: "Vergleiche aggregierte Daten" },
            showBestWorstCombos: { en: "Show best and worst combinations", de: "Zeige beste und schlechteste Kombinationen" },
            analyzeAllCombos: { en: "Analyze all form+payment method combinations", de: "Analysiere alle Formular+Bezahlmethode Kombinationen" },
            avoidCombos: { en: "Which combinations should be avoided?", de: "Welche Kombinationen sollten vermieden werden?" },
            showSuccessRate7Days: { en: "Show success rate of the last 7 days", de: "Zeige Erfolgsrate der letzten 7 Tage" },
            compareFormResults: { en: "Compare test results between forms", de: "Vergleiche Test-Ergebnisse zwischen Formularen" },
        },
    },

    // Legal
    legal: {
        imprint: { en: "Imprint", de: "Impressum" },
        privacy: { en: "Privacy", de: "Datenschutz" },
        license: { en: "License & Legal", de: "Lizenz & Rechtliches" },
    },

        // Info/Docs
    info: {
        manageForms: { en: "Managing Forms", de: "Formulare verwalten" },
        navigateToForms: { en: "Navigate to the \"Forms\" page", de: "Navigieren Sie zur Seite \"Formulare\"" },
        clickNewForm: { en: "Click on \"New Form\"", de: "Klicken Sie auf \"Neues Formular\"" },
        enterInformation: { en: "Enter the following information:", de: "Geben Sie folgende Informationen ein:" },
        nameLabel: { en: "Name:", de: "Name:" },
        nameDescription: { en: "A unique name for the form", de: "Ein eindeutiger Name für das Formular" },
        urlLabel: { en: "URL:", de: "URL:" },
        urlDescription: { en: "The full URL of the donation form", de: "Die vollständige URL des Spendenformulars" },
        descriptionLabel: { en: "Description:", de: "Beschreibung:" },
        descriptionDescription: { en: "Optional description of the form", de: "Optionale Beschreibung des Formulars" },
        statusLabel: { en: "Status:", de: "Status:" },
        statusDescription: { en: "Activate the form for tests", de: "Aktivieren Sie das Formular für Tests" },
        saveForm: { en: "Save the form", de: "Speichern Sie das Formular" },
        note: { en: "Note:", de: "Hinweis:" },
        onlyActiveForms: { en: "Only active forms are considered in test runs.", de: "Nur aktive Formulare werden bei Testläufen berücksichtigt." },
        managePaymentMethodsTitle: { en: "Managing Payment Methods", de: "Zahlungsmethoden verwalten" },
        navigateToPayments: { en: "Navigate to the \"Payment Methods\" page", de: "Navigieren Sie zur Seite \"Bezahlmethoden\"" },
        clickNewPayment: { en: "Click on \"New Payment Method\"", de: "Klicken Sie auf \"Neue Bezahlmethode\"" },
        selectPaymentType: { en: "Select the payment type:", de: "Wählen Sie den Zahlungstyp:" },
        paypalRequirementInfo: { en: "PayPal: Requires email address", de: "PayPal: Benötigt E-Mail-Adresse" },
        sepaRequirementInfo: { en: "SEPA: Requires account holder, IBAN and BIC", de: "SEPA: Benötigt Kontoinhaber, IBAN und BIC" },
        creditCardRequirementInfo: { en: "Credit Card: Requires card number, cardholder, expiry date and CVV", de: "Kreditkarte: Benötigt Kartennummer, Karteninhaber, Ablaufdatum und CVV" },
        epsRequirementInfo: { en: "EPS: Requires bank name and bank code", de: "EPS: Benötigt Bankname und Bankcode" },
        enterRequiredData: { en: "Enter the required data", de: "Geben Sie die erforderlichen Daten ein" },
        activatePaymentMethod: { en: "Activate the payment method", de: "Aktivieren Sie die Zahlungsmethode" },
        savePaymentMethod: { en: "Save the payment method", de: "Speichern Sie die Zahlungsmethode" },
        security: { en: "Security:", de: "Sicherheit:" },
        securityDescription: { en: "All payment data is stored encrypted (AES-256-GCM). The encryption key is securely stored in the macOS Keychain.", de: "Alle Zahlungsdaten werden verschlüsselt gespeichert (AES-256-GCM). Der Verschlüsselungsschlüssel wird sicher im macOS Keychain gespeichert." },
        runningTestsTitle: { en: "Running Tests", de: "Tests durchführen" },
        ensureActive: { en: "Make sure at least one form and one payment method are active", de: "Stellen Sie sicher, dass mindestens ein Formular und eine Zahlungsmethode aktiv sind" },
        clickStartTests: { en: "Click \"Start Tests\" on the dashboard", de: "Klicken Sie auf dem Dashboard auf \"Tests starten\"" },
        selectForms: { en: "Select the forms to test", de: "Wählen Sie die zu testenden Formulare aus" },
        selectPaymentMethods: { en: "Select the payment methods to test", de: "Wählen Sie die zu testenden Zahlungsmethoden aus" },
        clickStartTestsButton: { en: "Click \"Start Tests\"", de: "Klicken Sie auf \"Tests starten\"" },
        testsRunBackground: { en: "Tests run in the background. You can track progress on the \"Test Results\" page.", de: "Die Tests werden im Hintergrund ausgeführt. Sie können den Fortschritt auf der Seite \"Test Resultate\" verfolgen." },
        testExecutionNote: { en: "Note: During test execution, a browser window opens that performs the automated actions. Please do not close or interrupt.", de: "Hinweis: Während der Testausführung wird ein Browser-Fenster geöffnet, das die automatisierten Aktionen durchführt. Bitte nicht schließen oder unterbrechen." },
        description: {
            en: "FormTest.Server is an application for automated testing of donation forms with various payment methods. The application uses Playwright for browser automation and stores all data locally in a SQLite database.",
            de: "FormTest.Server ist eine Anwendung zum automatisierten Testen von Spendenformularen mit verschiedenen Zahlungsmethoden. Die Anwendung verwendet Playwright für die Browser-Automatisierung und speichert alle Daten lokal in einer SQLite-Datenbank.",
        },
        gettingStarted: {
            en: "To start testing, you must first configure forms and payment methods.",
            de: "Um mit dem Testen zu beginnen, müssen Sie zunächst Formulare und Zahlungsmethoden konfigurieren.",
        },
        managePaymentMethodsSection: {
            en: "Manage Payment Methods",
            de: "Zahlungsmethoden verwalten",
        },
        paymentMethodRequirements: {
            en: "Payment method requirements:",
            de: "Zahlungsmethoden-Anforderungen:",
        },
        paypalRequirementSection: {
            en: "PayPal: Requires email address",
            de: "PayPal: Benötigt E-Mail-Adresse",
        },
        sepaRequirementSection: {
            en: "SEPA: Requires account holder, IBAN and BIC",
            de: "SEPA: Benötigt Kontoinhaber, IBAN und BIC",
        },
        creditCardRequirementSection: {
            en: "Credit Card: Requires card number, cardholder, expiry date and CVV",
            de: "Kreditkarte: Benötigt Kartennummer, Karteninhaber, Ablaufdatum und CVV",
        },
        epsRequirementSection: {
            en: "EPS: Requires bank name and bank code",
            de: "EPS: Benötigt Bankname und Bankcode",
        },
        runningTestsSection: {
            en: "Select the forms and payment methods to test",
            de: "Wählen Sie die zu testenden Zahlungsmethoden aus",
        },
        testProgress: {
            en: "Tests run in the background. You can track progress on the 'Test Results' page.",
            de: "Die Tests werden im Hintergrund ausgeführt. Sie können den Fortschritt auf der Seite \"Test Resultate\" verfolgen.",
        },
        testHistory: {
            en: "Test History: Temporal development of successful and failed tests",
            de: "Test-Verlauf: Zeitliche Entwicklung von erfolgreichen und fehlgeschlagenen Tests",
        },
        successRate: {
            en: "Success Rate: Percentage distribution of successes and errors",
            de: "Erfolgsrate: Prozentuale Verteilung von Erfolgen und Fehlern",
        },
        statisticsHelp: {
            en: "These statistics help you identify problems with specific forms or payment methods.",
            de: "Diese Statistiken helfen Ihnen, Probleme mit bestimmten Formularen oder Zahlungsmethoden zu identifizieren.",
        },
    },

    // Selection Action Bar
    selection: {
        items: { en: "Items", de: "Einträge" },
        selected: { en: "selected", de: "ausgewählt" },
        clearSelection: { en: "Clear Selection", de: "Auswahl aufheben" },
    },

    // Notification
    notification: {
        deleteAll: { en: "Delete All", de: "Alle löschen" },
        deleteNotification: { en: "Delete Notification", de: "Benachrichtigung löschen" },
    },

    // Layout
    layout: {
        secondaryNavigation: { en: "Secondary Navigation", de: "Sekundäre Navigation" },
        themePreference: { en: "UI Theme Preference (system, light, dark)", de: "UI-Theme-Präferenz (system, light, dark)" },
    },
    preset: {
        en: "Preset",
        de: "Vorlage"
    },
    // Table Filter
    tableFilter: {
        searchPlaceholder: { en: "Search...", de: "Suchen..." },
        allStatuses: { en: "All {status}", de: "Alle {status}" },
        allTags: { en: "All Tags", de: "Alle Tags" },
        showArchived: { en: "Show archived", de: "Archivierte anzeigen" },
        resetFilters: { en: "Reset filters", de: "Filter zurücksetzen" },
    },
};

/**
 * Get translation for a key
 * Supports nested keys using dot notation (e.g., "error.database")
 * @param key - Translation key (supports dot notation for nested keys)
 * @returns Translated string in current language
 */
export const t = (key: string | false, english?: string, german?: string): string => {

    const language = CONFIG.language || "de";
    if (key === false) {
        switch (language) {
            case "en":
                return english || "";
            case "de":
                return german || "";
            default:
                return english || german || "";
        }
    }
    // Split key by dots to navigate nested structure
    const keys = key.split(".");
    let value: any = DICTIONARY;

    // Navigate through nested structure
    for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
            value = value[k];
        } else {
            // Key not found, return key as fallback
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
    }

    // Check if we have a translation object with en/de
    if (value && typeof value === "object" && "en" in value && "de" in value) {
        return value[language as "en" | "de"] || value.en;
    }

    // Fallback: return key if structure is invalid
    console.warn(`Invalid translation structure for key: ${key}`);
    return key;
};
