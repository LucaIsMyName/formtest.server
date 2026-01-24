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
    },

    // Settings
    settings: {
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
        selectors: {
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
        enabled: {
            en: "Enabled",
            de: "Aktiviert",
        },
        disabled: {
            en: "Disabled",
            de: "Deaktiviert",
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
        hookPoint: {
            beforeFormFill: { en: "Before Form Fill", de: "Vor Formular-Ausfüllung" },
            beforeFormFillDesc: { en: "Before the form is filled", de: "Bevor das Formular ausgefüllt wird" },
            afterFormFill: { en: "After Form Fill", de: "Nach Formular-Ausfüllung" },
            afterFormFillDesc: { en: "After the form has been filled", de: "Nachdem das Formular ausgefüllt wurde" },
            beforePayment: { en: "Before Payment", de: "Vor Zahlung" },
            beforePaymentDesc: { en: "Before the payment method is selected", de: "Bevor die Zahlungsmethode ausgewählt wird" },
            afterPayment: { en: "After Payment", de: "Nach Zahlung" },
            afterPaymentDesc: { en: "After the payment method has been selected", de: "Nachdem die Zahlungsmethode ausgewählt wurde" },
        },
        syntaxValid: { en: "✓ Code syntax is valid", de: "✓ Code-Syntax ist gültig" },
        deleteTitle: { en: "Delete Script", de: "Script löschen" },
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
        unknown: { en: "Unknown", de: "Unbekannt" },
    },

    // AI Chat
    ai: {
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
    },

    // Legal
    legal: {
        imprint: { en: "Imprint", de: "Impressum" },
        privacy: { en: "Privacy", de: "Datenschutz" },
        license: { en: "License & Legal", de: "Lizenz & Rechtliches" },
    },

    // Info/Docs
    info: {
        description: {
            en: "FormTest.Server is an application for automated testing of donation forms with various payment methods. The application uses Playwright for browser automation and stores all data locally in a SQLite database.",
            de: "FormTest.Server ist eine Anwendung zum automatisierten Testen von Spendenformularen mit verschiedenen Zahlungsmethoden. Die Anwendung verwendet Playwright für die Browser-Automatisierung und speichert alle Daten lokal in einer SQLite-Datenbank.",
        },
        gettingStarted: {
            en: "To start testing, you must first configure forms and payment methods.",
            de: "Um mit dem Testen zu beginnen, müssen Sie zunächst Formulare und Zahlungsmethoden konfigurieren.",
        },
        managePaymentMethods: {
            en: "Manage Payment Methods",
            de: "Zahlungsmethoden verwalten",
        },
        paymentMethodRequirements: {
            en: "Payment method requirements:",
            de: "Zahlungsmethoden-Anforderungen:",
        },
        paypalRequirement: {
            en: "PayPal: Requires email address",
            de: "PayPal: Benötigt E-Mail-Adresse",
        },
        sepaRequirement: {
            en: "SEPA: Requires account holder, IBAN and BIC",
            de: "SEPA: Benötigt Kontoinhaber, IBAN und BIC",
        },
        creditCardRequirement: {
            en: "Credit Card: Requires card number, cardholder, expiry date and CVV",
            de: "Kreditkarte: Benötigt Kartennummer, Karteninhaber, Ablaufdatum und CVV",
        },
        epsRequirement: {
            en: "EPS: Requires bank name and bank code",
            de: "EPS: Benötigt Bankname und Bankcode",
        },
        runningTests: {
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
