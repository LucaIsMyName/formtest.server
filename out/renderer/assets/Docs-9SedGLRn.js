import { i as dist, aP as KEYBOARD_SHORTCUTS, j as jsxRuntimeExports, aQ as Keyboard, l as Table, K as TableHeader, n as TableRow, M as TableHead, m as TableBody, o as TableCell, aR as formatShortcut } from "./index-Dv3ACo-W.js";
import { C as CONFIG } from "./app.config-b2lfEN4K.js";
const Docs = () => {
  const $ = dist.c(8);
  let t0;
  let t1;
  let t2;
  let t3;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    const navigationShortcuts = KEYBOARD_SHORTCUTS.filter(_temp);
    const actionShortcuts = KEYBOARD_SHORTCUTS.filter(_temp2);
    const generalShortcuts = KEYBOARD_SHORTCUTS.filter(_temp3);
    t0 = "max-w-4xl";
    t1 = /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: CONFIG.style.title.className, children: "Dokumentation" });
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "select-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 my-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-4", children: "Benutzer-Dokumentation" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 text-gray-700 dark:text-gray-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Erste Schritte" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "FormTest.Server ist eine Anwendung zum automatisierten Testen von Spendenformularen mit verschiedenen Zahlungsmethoden. Die Anwendung verwendet Playwright für die Browser-Automatisierung und speichert alle Daten lokal in einer SQLite-Datenbank." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Um mit dem Testen zu beginnen, müssen Sie zunächst Formulare und Zahlungsmethoden konfigurieren." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Formulare verwalten" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "list-decimal list-inside space-y-2 ml-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Navigieren Sie zur Seite "Formulare"' }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Klicken Sie auf "Neues Formular"' }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "Geben Sie folgende Informationen ein:",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-6 mt-1 space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Name:" }),
                  " Ein eindeutiger Name für das Formular"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "URL:" }),
                  " Die vollständige URL des Spendenformulars"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Beschreibung:" }),
                  " Optionale Beschreibung des Formulars"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Status:" }),
                  " Aktivieren Sie das Formular für Tests"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Speichern Sie das Formular" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Hinweis:" }),
            " Nur aktive Formulare werden bei Testläufen berücksichtigt."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Zahlungsmethoden verwalten" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "list-decimal list-inside space-y-2 ml-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Navigieren Sie zur Seite "Bezahlmethoden"' }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Klicken Sie auf "Neue Bezahlmethode"' }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "Wählen Sie den Zahlungstyp:",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-6 mt-1 space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "PayPal:" }),
                  " Benötigt E-Mail-Adresse"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "SEPA:" }),
                  " Benötigt Kontoinhaber, IBAN und BIC"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Kreditkarte:" }),
                  " Benötigt Kartennummer, Karteninhaber, Ablaufdatum und CVV"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "EPS:" }),
                  " Benötigt Bankname und Bankcode"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Geben Sie die erforderlichen Daten ein" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Aktivieren Sie die Zahlungsmethode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Speichern Sie die Zahlungsmethode" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sicherheit:" }),
            " Alle Zahlungsdaten werden verschlüsselt gespeichert (AES-256-GCM). Der Verschlüsselungsschlüssel wird sicher im macOS Keychain gespeichert."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Tests durchführen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "list-decimal list-inside space-y-2 ml-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Stellen Sie sicher, dass mindestens ein Formular und eine Zahlungsmethode aktiv sind" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Klicken Sie auf dem Dashboard auf "Tests starten"' }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Wählen Sie die zu testenden Formulare aus" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Wählen Sie die zu testenden Zahlungsmethoden aus" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Klicken Sie auf "Tests starten"' })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2", children: 'Die Tests werden im Hintergrund ausgeführt. Sie können den Fortschritt auf der Seite "Test Resultate" verfolgen.' }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Hinweis:" }),
            " Während der Testausführung wird ein Browser-Fenster geöffnet, das die automatisierten Aktionen durchführt. Bitte nicht schließen oder unterbrechen."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Testergebnisse verstehen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "Jeder Testlauf wird mit einem der folgenden Status gespeichert:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-green-600 dark:text-green-400", children: "SUCCESS:" }),
              " Test erfolgreich abgeschlossen"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-red-600 dark:text-red-400", children: "FAILURE:" }),
              " Test fehlgeschlagen"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-yellow-600 dark:text-yellow-400", children: "RUNNING:" }),
              " Test läuft noch"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2", children: "Für jeden Testlauf werden folgende Informationen gespeichert:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Formular und Zahlungsmethode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Zeitstempel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Dauer der Testausführung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Screenshots (bei Erfolg und Fehler)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Detaillierte Logs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Fehlermeldungen (bei Fehlern)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Dashboard-Statistiken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "Das Dashboard bietet eine umfassende Übersicht über Ihre Testaktivitäten:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Test-Verlauf:" }),
              " Zeitliche Entwicklung von erfolgreichen und fehlgeschlagenen Tests"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Erfolgsrate:" }),
              " Prozentuale Verteilung von Erfolgen und Fehlern"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Bezahlmethoden Performance:" }),
              " Erfolgsrate pro Zahlungsmethode"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Formular Performance:" }),
              " Erfolgsrate pro Formular"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm", children: "Diese Statistiken helfen Ihnen, Probleme mit bestimmten Formularen oder Zahlungsmethoden zu identifizieren." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Einstellungen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "Auf der Einstellungsseite können Sie globale Konfigurationen vornehmen:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Headless Mode:" }),
              " Browser-Fenster während Tests ausblenden"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Timeout:" }),
              " Maximale Wartezeit für Seitenelemente (in Millisekunden)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Screenshot-Einstellungen:" }),
              " Automatische Screenshots bei Erfolg/Fehler"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Fehlerbehebung" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Tests schlagen fehl:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Überprüfen Sie die Formular-URL" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Stellen Sie sicher, dass die Zahlungsdaten korrekt sind" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Erhöhen Sie den Timeout in den Einstellungen" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Prüfen Sie die Logs in den Testergebnissen" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Browser startet nicht:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Stellen Sie sicher, dass Playwright installiert ist" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Starten Sie die Anwendung neu" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Zahlungsdaten können nicht gespeichert werden:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Überprüfen Sie die Keychain-Berechtigungen" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Starten Sie die Anwendung neu" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Datenspeicherung" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "Alle Daten werden lokal auf Ihrem Computer gespeichert:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Datenbank:" }),
              " ~/Library/Application Support/formtest-server/formtest.db"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Screenshots:" }),
              " Im Projektverzeichnis unter screenshots/"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Logs:" }),
              " Im Projektverzeichnis unter logs/"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Verschlüsselungsschlüssel:" }),
              " macOS Keychain (Service: FormTestServer)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Datenschutz:" }),
            " Keine Daten werden an externe Server gesendet. Alle Informationen bleiben auf Ihrem lokalen System."
          ] })
        ] })
      ] })
    ] });
    t3 = /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "my-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Keyboard, { size: 18, className: "text-white" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: "Tastenkürzel" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: "Nutze diese Tastenkürzel für schnellere Navigation und Aktionen." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide", children: "Navigation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-gray-50 dark:bg-gray-800/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 py-2 text-xs w-[150px]", children: "Tastenkürzel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 py-2 text-xs", children: "Aktion" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: navigationShortcuts.map(_temp4) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide", children: "Aktionen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-gray-50 dark:bg-gray-800/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 py-2 text-xs w-[150px]", children: "Tastenkürzel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 py-2 text-xs", children: "Aktion" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: actionShortcuts.map(_temp5) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide", children: "Allgemein" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-gray-50 dark:bg-gray-800/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 py-2 text-xs w-[150px]", children: "Tastenkürzel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "px-4 py-2 text-xs", children: "Aktion" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: generalShortcuts.map(_temp6) })
        ] }) })
      ] })
    ] }) });
    $[0] = t0;
    $[1] = t1;
    $[2] = t2;
    $[3] = t3;
  } else {
    t0 = $[0];
    t1 = $[1];
    t2 = $[2];
    t3 = $[3];
  }
  let t4;
  if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-4", children: "Version & Technologie" });
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  let t5;
  let t6;
  if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
    t5 = /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Version:" }),
      " 1.0.26"
    ] });
    t6 = /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tech:" }) });
    $[5] = t5;
    $[6] = t6;
  } else {
    t5 = $[5];
    t6 = $[6];
  }
  let t7;
  if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
    t7 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: t0, children: [
      t1,
      t2,
      t3,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6", children: [
        t4,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-gray-700 dark:text-gray-300 space-y-2", children: [
          t5,
          t6,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-4 text-sm space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Electron" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "React" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "TypeScript" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Playwright" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "SQLite" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Recharts" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Keytar" })
          ] })
        ] })
      ] })
    ] });
    $[7] = t7;
  } else {
    t7 = $[7];
  }
  return t7;
};
function _temp(s) {
  return s.category === "navigation";
}
function _temp2(s_0) {
  return s_0.category === "actions";
}
function _temp3(s_1) {
  return s_1.category === "general";
}
function _temp4(shortcut, index) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "px-2 py-1 bg-gray-100 dark:text-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono", children: formatShortcut(shortcut) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 py-2 text-sm text-gray-700 dark:text-gray-300", children: shortcut.description })
  ] }, index);
}
function _temp5(shortcut_0, index_0) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "px-2 py-1 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono", children: formatShortcut(shortcut_0) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 py-2 text-sm text-gray-700 dark:text-gray-300", children: shortcut_0.description })
  ] }, index_0);
}
function _temp6(shortcut_1, index_1) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "px-2 py-1 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono", children: formatShortcut(shortcut_1) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 py-2 text-sm text-gray-700 dark:text-gray-300", children: shortcut_1.description })
  ] }, index_1);
}
export {
  Docs as default
};
