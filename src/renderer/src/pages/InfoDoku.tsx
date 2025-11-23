import React from "react";
import { CONFIG } from "../app.config";

const InfoDoku: React.FC = () => {
  return (
    <div className="max-w-4xl">
      <h1 className={CONFIG.style.title.className}>Info & Doku</h1>

      <section className="select-auto my-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Impressum Section */}
        <div className="">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Impressum</h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-2">
            <p>
              <strong>Angaben gemäß § 5 TMG:</strong>
            </p>
            <p>Luca Mack</p>
            <p>Lorystrasse 71</p>
            <p>1110 Wien</p>
            <p>Österreich</p>
          </div>
        </div>

        {/* Legal & License Section */}
        <div className="my-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Lizenz & Rechtliches</h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">MIT License</h3>
              <p className="mb-2">Copyright (c) 2025 Luca Mack</p>
              <p className="text-sm leading-relaxed">Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
              <p className="text-sm leading-relaxed mt-2">The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
              <p className="text-sm leading-relaxed mt-2 font-semibold">THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
            </div>
            <div className="py-4 border-y border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg mb-2">Haftungsausschluss</h3>
              <p className="text-sm leading-relaxed">Diese Software wird zu Testzwecken bereitgestellt. Der Autor übernimmt keine Haftung für Schäden, die durch die Nutzung dieser Software entstehen. Die Verwendung erfolgt auf eigenes Risiko.</p>
            </div>
          </div>
        </div>
      </section>
      {/* User Documentation Section */}
      <div className="select-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Benutzer-Dokumentation</h2>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          {/* Getting Started */}
          <div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Erste Schritte</h3>
            <p className="mb-2">FormTest.Server ist eine Anwendung zum automatisierten Testen von Spendenformularen mit verschiedenen Zahlungsmethoden. Die Anwendung verwendet Playwright für die Browser-Automatisierung und speichert alle Daten lokal in einer SQLite-Datenbank.</p>
            <p>Um mit dem Testen zu beginnen, müssen Sie zunächst Formulare und Zahlungsmethoden konfigurieren.</p>
          </div>

          {/* Managing Forms */}
          <div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Formulare verwalten</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Navigieren Sie zur Seite "Formulare"</li>
              <li>Klicken Sie auf "Neues Formular"</li>
              <li>
                Geben Sie folgende Informationen ein:
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>
                    <strong>Name:</strong> Ein eindeutiger Name für das Formular
                  </li>
                  <li>
                    <strong>URL:</strong> Die vollständige URL des Spendenformulars
                  </li>
                  <li>
                    <strong>Beschreibung:</strong> Optionale Beschreibung des Formulars
                  </li>
                  <li>
                    <strong>Status:</strong> Aktivieren Sie das Formular für Tests
                  </li>
                </ul>
              </li>
              <li>Speichern Sie das Formular</li>
            </ol>
            <p className="mt-2 text-sm">
              <strong>Hinweis:</strong> Nur aktive Formulare werden bei Testläufen berücksichtigt.
            </p>
          </div>

          {/* Managing Payment Methods */}
          <div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Zahlungsmethoden verwalten</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Navigieren Sie zur Seite "Bezahlmethoden"</li>
              <li>Klicken Sie auf "Neue Bezahlmethode"</li>
              <li>
                Wählen Sie den Zahlungstyp:
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>
                    <strong>PayPal:</strong> Benötigt E-Mail-Adresse
                  </li>
                  <li>
                    <strong>SEPA:</strong> Benötigt Kontoinhaber, IBAN und BIC
                  </li>
                  <li>
                    <strong>Kreditkarte:</strong> Benötigt Kartennummer, Karteninhaber, Ablaufdatum und CVV
                  </li>
                  <li>
                    <strong>EPS:</strong> Benötigt Bankname und Bankcode
                  </li>
                </ul>
              </li>
              <li>Geben Sie die erforderlichen Daten ein</li>
              <li>Aktivieren Sie die Zahlungsmethode</li>
              <li>Speichern Sie die Zahlungsmethode</li>
            </ol>
            <p className="mt-2 text-sm">
              <strong>Sicherheit:</strong> Alle Zahlungsdaten werden verschlüsselt gespeichert (AES-256-GCM). Der Verschlüsselungsschlüssel wird sicher im macOS Keychain gespeichert.
            </p>
          </div>

          {/* Running Tests */}
          <div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Tests durchführen</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Stellen Sie sicher, dass mindestens ein Formular und eine Zahlungsmethode aktiv sind</li>
              <li>Klicken Sie auf dem Dashboard auf "Tests starten"</li>
              <li>Wählen Sie die zu testenden Formulare aus</li>
              <li>Wählen Sie die zu testenden Zahlungsmethoden aus</li>
              <li>Klicken Sie auf "Tests starten"</li>
            </ol>
            <p className="mt-2">Die Tests werden im Hintergrund ausgeführt. Sie können den Fortschritt auf der Seite "Test Resultate" verfolgen.</p>
            <p className="mt-2 text-sm">
              <strong>Hinweis:</strong> Während der Testausführung wird ein Browser-Fenster geöffnet, das die automatisierten Aktionen durchführt. Bitte nicht schließen oder unterbrechen.
            </p>
          </div>

          {/* Understanding Results */}
          <div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Testergebnisse verstehen</h3>
            <p className="mb-2">Jeder Testlauf wird mit einem der folgenden Status gespeichert:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>
                <strong className="text-green-600 dark:text-green-400">SUCCESS:</strong> Test erfolgreich abgeschlossen
              </li>
              <li>
                <strong className="text-red-600 dark:text-red-400">FAILURE:</strong> Test fehlgeschlagen
              </li>
              <li>
                <strong className="text-yellow-600 dark:text-yellow-400">RUNNING:</strong> Test läuft noch
              </li>
            </ul>
            <p className="mt-2">Für jeden Testlauf werden folgende Informationen gespeichert:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Formular und Zahlungsmethode</li>
              <li>Zeitstempel</li>
              <li>Dauer der Testausführung</li>
              <li>Screenshots (bei Erfolg und Fehler)</li>
              <li>Detaillierte Logs</li>
              <li>Fehlermeldungen (bei Fehlern)</li>
            </ul>
          </div>

          {/* Dashboard Statistics */}
          <div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Dashboard-Statistiken</h3>
            <p className="mb-2">Das Dashboard bietet eine umfassende Übersicht über Ihre Testaktivitäten:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>
                <strong>Test-Verlauf:</strong> Zeitliche Entwicklung von erfolgreichen und fehlgeschlagenen Tests
              </li>
              <li>
                <strong>Erfolgsrate:</strong> Prozentuale Verteilung von Erfolgen und Fehlern
              </li>
              <li>
                <strong>Bezahlmethoden Performance:</strong> Erfolgsrate pro Zahlungsmethode
              </li>
              <li>
                <strong>Formular Performance:</strong> Erfolgsrate pro Formular
              </li>
            </ul>
            <p className="mt-2 text-sm">Diese Statistiken helfen Ihnen, Probleme mit bestimmten Formularen oder Zahlungsmethoden zu identifizieren.</p>
          </div>

          {/* Settings */}
          <div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Einstellungen</h3>
            <p className="mb-2">Auf der Einstellungsseite können Sie globale Konfigurationen vornehmen:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>
                <strong>Headless Mode:</strong> Browser-Fenster während Tests ausblenden
              </li>
              <li>
                <strong>Timeout:</strong> Maximale Wartezeit für Seitenelemente (in Millisekunden)
              </li>
              <li>
                <strong>Screenshot-Einstellungen:</strong> Automatische Screenshots bei Erfolg/Fehler
              </li>
            </ul>
          </div>

          {/* Troubleshooting */}
          <div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Fehlerbehebung</h3>
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Tests schlagen fehl:</p>
                <ul className="list-disc list-inside ml-2 text-sm">
                  <li>Überprüfen Sie die Formular-URL</li>
                  <li>Stellen Sie sicher, dass die Zahlungsdaten korrekt sind</li>
                  <li>Erhöhen Sie den Timeout in den Einstellungen</li>
                  <li>Prüfen Sie die Logs in den Testergebnissen</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Browser startet nicht:</p>
                <ul className="list-disc list-inside ml-2 text-sm">
                  <li>Stellen Sie sicher, dass Playwright installiert ist</li>
                  <li>Starten Sie die Anwendung neu</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Zahlungsdaten können nicht gespeichert werden:</p>
                <ul className="list-disc list-inside ml-2 text-sm">
                  <li>Überprüfen Sie die Keychain-Berechtigungen</li>
                  <li>Starten Sie die Anwendung neu</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Storage */}
          <div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Datenspeicherung</h3>
            <p className="mb-2">Alle Daten werden lokal auf Ihrem Computer gespeichert:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>
                <strong>Datenbank:</strong> ~/Library/Application Support/formtest-server/formtest.db
              </li>
              <li>
                <strong>Screenshots:</strong> Im Projektverzeichnis unter screenshots/
              </li>
              <li>
                <strong>Logs:</strong> Im Projektverzeichnis unter logs/
              </li>
              <li>
                <strong>Verschlüsselungsschlüssel:</strong> macOS Keychain (Service: FormTestServer)
              </li>
            </ul>
            <p className="mt-2 text-sm">
              <strong>Datenschutz:</strong> Keine Daten werden an externe Server gesendet. Alle Informationen bleiben auf Ihrem lokalen System.
            </p>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Version & Technologie</h2>
        <div className="text-gray-700 dark:text-gray-300 space-y-2">
          <p>
            <strong>Version:</strong> 1.0.0
          </p>
          <p>
            <strong>Technologie-Stack:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 text-sm space-y-1">
            <li>Electron - Desktop-Anwendungsframework</li>
            <li>React - UI-Framework</li>
            <li>TypeScript - Typsichere Entwicklung</li>
            <li>Tailwind CSS - Styling</li>
            <li>Playwright - Browser-Automatisierung</li>
            <li>SQLite - Lokale Datenbank</li>
            <li>Recharts - Datenvisualisierung</li>
            <li>Keytar - Sichere Schlüsselspeicherung</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InfoDoku;
