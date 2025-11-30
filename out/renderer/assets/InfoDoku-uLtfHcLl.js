import { i as dist, aq as KEYBOARD_SHORTCUTS, j as jsxRuntimeExports, ar as Keyboard, z as Table, A as TableHeader, D as TableRow, G as TableHead, H as TableBody, J as TableCell, as as formatShortcut } from "./index-BKwbP5SI.js";
import { C as CONFIG } from "./app.config-D8MSMeZ9.js";
const InfoDoku = () => {
  const $ = dist.c(52);
  let t0;
  let t1;
  let t2;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    const navigationShortcuts = KEYBOARD_SHORTCUTS.filter(_temp);
    const actionShortcuts = KEYBOARD_SHORTCUTS.filter(_temp2);
    const generalShortcuts = KEYBOARD_SHORTCUTS.filter(_temp3);
    t0 = "max-w-4xl";
    t1 = /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: CONFIG.style.title.className, children: "Info & Doku" });
    t2 = /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "my-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-6", children: [
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
  } else {
    t0 = $[0];
    t1 = $[1];
    t2 = $[2];
  }
  let t3;
  if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-4", children: "Impressum" });
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = /* @__PURE__ */ jsxRuntimeExports.jsx("br", {});
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  let t5;
  if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
    t5 = /* @__PURE__ */ jsxRuntimeExports.jsx("br", {});
    $[5] = t5;
  } else {
    t5 = $[5];
  }
  let t6;
  if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
    t6 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "", children: [
      t3,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-700 dark:text-gray-300 space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Luca Mack",
        t4,
        "Lorystrasse 71",
        t5,
        "1110 Wien",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "Österreich"
      ] }) })
    ] });
    $[6] = t6;
  } else {
    t6 = $[6];
  }
  let t7;
  if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
    t7 = /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-4", children: "Lizenz & Rechtliches" });
    $[7] = t7;
  } else {
    t7 = $[7];
  }
  let t8;
  if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
    t8 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2", children: "MIT License" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "Copyright (c) 2025 Luca Mack" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed", children: 'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:' }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed mt-2", children: "The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed mt-2 font-semibold", children: 'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.' })
    ] });
    $[8] = t8;
  } else {
    t8 = $[8];
  }
  let t9;
  if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
    t9 = /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "select-auto my-6", children: [
      t6,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-6", children: [
        t7,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-gray-700 dark:text-gray-300 space-y-4", children: [
          t8,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 border-t border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2", children: "Haftungsausschluss" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed", children: "Diese Software wird zu Testzwecken bereitgestellt. Der Autor übernimmt keine Haftung für Schäden, die durch die Nutzung dieser Software entstehen. Die Verwendung erfolgt auf eigenes Risiko." })
          ] })
        ] })
      ] })
    ] });
    $[9] = t9;
  } else {
    t9 = $[9];
  }
  let t10;
  if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
    t10 = /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-4", children: "Benutzer-Dokumentation" });
    $[10] = t10;
  } else {
    t10 = $[10];
  }
  let t11;
  let t12;
  if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
    t11 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Erste Schritte" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "FormTest.Server ist eine Anwendung zum automatisierten Testen von Spendenformularen mit verschiedenen Zahlungsmethoden. Die Anwendung verwendet Playwright für die Browser-Automatisierung und speichert alle Daten lokal in einer SQLite-Datenbank." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Um mit dem Testen zu beginnen, müssen Sie zunächst Formulare und Zahlungsmethoden konfigurieren." })
    ] });
    t12 = /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Formulare verwalten" });
    $[11] = t11;
    $[12] = t12;
  } else {
    t11 = $[11];
    t12 = $[12];
  }
  let t13;
  let t14;
  if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
    t13 = /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Navigieren Sie zur Seite "Formulare"' });
    t14 = /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Klicken Sie auf "Neues Formular"' });
    $[13] = t13;
    $[14] = t14;
  } else {
    t13 = $[13];
    t14 = $[14];
  }
  let t15;
  if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
    t15 = /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "list-decimal list-inside space-y-2 ml-2", children: [
      t13,
      t14,
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
    ] });
    $[15] = t15;
  } else {
    t15 = $[15];
  }
  let t16;
  let t17;
  if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
    t16 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      t12,
      t15,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Hinweis:" }),
        " Nur aktive Formulare werden bei Testläufen berücksichtigt."
      ] })
    ] });
    t17 = /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Zahlungsmethoden verwalten" });
    $[16] = t16;
    $[17] = t17;
  } else {
    t16 = $[16];
    t17 = $[17];
  }
  let t18;
  let t19;
  if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
    t18 = /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Navigieren Sie zur Seite "Bezahlmethoden"' });
    t19 = /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Klicken Sie auf "Neue Bezahlmethode"' });
    $[18] = t18;
    $[19] = t19;
  } else {
    t18 = $[18];
    t19 = $[19];
  }
  let t20;
  if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
    t20 = /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "list-decimal list-inside space-y-2 ml-2", children: [
      t18,
      t19,
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
    ] });
    $[20] = t20;
  } else {
    t20 = $[20];
  }
  let t21;
  let t22;
  if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
    t21 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      t17,
      t20,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sicherheit:" }),
        " Alle Zahlungsdaten werden verschlüsselt gespeichert (AES-256-GCM). Der Verschlüsselungsschlüssel wird sicher im macOS Keychain gespeichert."
      ] })
    ] });
    t22 = /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Tests durchführen" });
    $[21] = t21;
    $[22] = t22;
  } else {
    t21 = $[21];
    t22 = $[22];
  }
  let t23;
  let t24;
  if ($[23] === Symbol.for("react.memo_cache_sentinel")) {
    t23 = /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "list-decimal list-inside space-y-2 ml-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Stellen Sie sicher, dass mindestens ein Formular und eine Zahlungsmethode aktiv sind" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Klicken Sie auf dem Dashboard auf "Tests starten"' }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Wählen Sie die zu testenden Formulare aus" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Wählen Sie die zu testenden Zahlungsmethoden aus" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Klicken Sie auf "Tests starten"' })
    ] });
    t24 = /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2", children: 'Die Tests werden im Hintergrund ausgeführt. Sie können den Fortschritt auf der Seite "Test Resultate" verfolgen.' });
    $[23] = t23;
    $[24] = t24;
  } else {
    t23 = $[23];
    t24 = $[24];
  }
  let t25;
  let t26;
  let t27;
  if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
    t25 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      t22,
      t23,
      t24,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Hinweis:" }),
        " Während der Testausführung wird ein Browser-Fenster geöffnet, das die automatisierten Aktionen durchführt. Bitte nicht schließen oder unterbrechen."
      ] })
    ] });
    t26 = /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Testergebnisse verstehen" });
    t27 = /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "Jeder Testlauf wird mit einem der folgenden Status gespeichert:" });
    $[25] = t25;
    $[26] = t26;
    $[27] = t27;
  } else {
    t25 = $[25];
    t26 = $[26];
    t27 = $[27];
  }
  let t28;
  let t29;
  if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
    t28 = /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-2 space-y-1", children: [
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
    ] });
    t29 = /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2", children: "Für jeden Testlauf werden folgende Informationen gespeichert:" });
    $[28] = t28;
    $[29] = t29;
  } else {
    t28 = $[28];
    t29 = $[29];
  }
  let t30;
  let t31;
  let t32;
  if ($[30] === Symbol.for("react.memo_cache_sentinel")) {
    t30 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      t26,
      t27,
      t28,
      t29,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-2 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Formular und Zahlungsmethode" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Zeitstempel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Dauer der Testausführung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Screenshots (bei Erfolg und Fehler)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Detaillierte Logs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Fehlermeldungen (bei Fehlern)" })
      ] })
    ] });
    t31 = /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Dashboard-Statistiken" });
    t32 = /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "Das Dashboard bietet eine umfassende Übersicht über Ihre Testaktivitäten:" });
    $[30] = t30;
    $[31] = t31;
    $[32] = t32;
  } else {
    t30 = $[30];
    t31 = $[31];
    t32 = $[32];
  }
  let t33;
  let t34;
  let t35;
  if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
    t33 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      t31,
      t32,
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
    ] });
    t34 = /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Einstellungen" });
    t35 = /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "Auf der Einstellungsseite können Sie globale Konfigurationen vornehmen:" });
    $[33] = t33;
    $[34] = t34;
    $[35] = t35;
  } else {
    t33 = $[33];
    t34 = $[34];
    t35 = $[35];
  }
  let t36;
  let t37;
  if ($[36] === Symbol.for("react.memo_cache_sentinel")) {
    t36 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      t34,
      t35,
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
    ] });
    t37 = /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Fehlerbehebung" });
    $[36] = t36;
    $[37] = t37;
  } else {
    t36 = $[36];
    t37 = $[37];
  }
  let t38;
  if ($[38] === Symbol.for("react.memo_cache_sentinel")) {
    t38 = /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Tests schlagen fehl:" });
    $[38] = t38;
  } else {
    t38 = $[38];
  }
  let t39;
  let t40;
  if ($[39] === Symbol.for("react.memo_cache_sentinel")) {
    t39 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      t38,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Überprüfen Sie die Formular-URL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Stellen Sie sicher, dass die Zahlungsdaten korrekt sind" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Erhöhen Sie den Timeout in den Einstellungen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Prüfen Sie die Logs in den Testergebnissen" })
      ] })
    ] });
    t40 = /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Browser startet nicht:" });
    $[39] = t39;
    $[40] = t40;
  } else {
    t39 = $[39];
    t40 = $[40];
  }
  let t41;
  let t42;
  if ($[41] === Symbol.for("react.memo_cache_sentinel")) {
    t41 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      t40,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Stellen Sie sicher, dass Playwright installiert ist" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Starten Sie die Anwendung neu" })
      ] })
    ] });
    t42 = /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Zahlungsdaten können nicht gespeichert werden:" });
    $[41] = t41;
    $[42] = t42;
  } else {
    t41 = $[41];
    t42 = $[42];
  }
  let t43;
  let t44;
  let t45;
  if ($[43] === Symbol.for("react.memo_cache_sentinel")) {
    t43 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      t37,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        t39,
        t41,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          t42,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Überprüfen Sie die Keychain-Berechtigungen" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Starten Sie die Anwendung neu" })
          ] })
        ] })
      ] })
    ] });
    t44 = /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-900 dark:text-white", children: "Datenspeicherung" });
    t45 = /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "Alle Daten werden lokal auf Ihrem Computer gespeichert:" });
    $[43] = t43;
    $[44] = t44;
    $[45] = t45;
  } else {
    t43 = $[43];
    t44 = $[44];
    t45 = $[45];
  }
  let t46;
  if ($[46] === Symbol.for("react.memo_cache_sentinel")) {
    t46 = /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside ml-2 space-y-1", children: [
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
    ] });
    $[46] = t46;
  } else {
    t46 = $[46];
  }
  let t47;
  if ($[47] === Symbol.for("react.memo_cache_sentinel")) {
    t47 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "select-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-6", children: [
      t10,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 text-gray-700 dark:text-gray-300", children: [
        t11,
        t16,
        t21,
        t25,
        t30,
        t33,
        t36,
        t43,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          t44,
          t45,
          t46,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Datenschutz:" }),
            " Keine Daten werden an externe Server gesendet. Alle Informationen bleiben auf Ihrem lokalen System."
          ] })
        ] })
      ] })
    ] });
    $[47] = t47;
  } else {
    t47 = $[47];
  }
  let t48;
  if ($[48] === Symbol.for("react.memo_cache_sentinel")) {
    t48 = /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-4", children: "Version & Technologie" });
    $[48] = t48;
  } else {
    t48 = $[48];
  }
  let t49;
  let t50;
  if ($[49] === Symbol.for("react.memo_cache_sentinel")) {
    t49 = /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Version:" }),
      " 1.0.11"
    ] });
    t50 = /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tech:" }) });
    $[49] = t49;
    $[50] = t50;
  } else {
    t49 = $[49];
    t50 = $[50];
  }
  let t51;
  if ($[51] === Symbol.for("react.memo_cache_sentinel")) {
    t51 = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: t0, children: [
      t1,
      t2,
      t9,
      t47,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6", children: [
        t48,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-gray-700 dark:text-gray-300 space-y-2", children: [
          t49,
          t50,
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
    $[51] = t51;
  } else {
    t51 = $[51];
  }
  return t51;
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono", children: formatShortcut(shortcut) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 py-2 text-sm text-gray-700 dark:text-gray-300", children: shortcut.description })
  ] }, index);
}
function _temp5(shortcut_0, index_0) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono", children: formatShortcut(shortcut_0) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 py-2 text-sm text-gray-700 dark:text-gray-300", children: shortcut_0.description })
  ] }, index_0);
}
function _temp6(shortcut_1, index_1) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono", children: formatShortcut(shortcut_1) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "px-4 py-2 text-sm text-gray-700 dark:text-gray-300", children: shortcut_1.description })
  ] }, index_1);
}
export {
  InfoDoku as default
};
