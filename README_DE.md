# FormTest.Server

Eine Desktop-Anwendung zur automatisierten Tests von Spendenformularen mit Electron, Vite, TypeScript und Playwright.

## Übersicht

FormTest Server automatisiert Tests von Spendenformularen über mehrere Zahlungsmethoden hinweg. Es validiert Formularfunktionalität, Zahlungsverarbeitungsabläufe und bietet detaillierte Berichte.

**Hauptfunktionen:**
- Testen von Spendenformularen mit PayPal, SEPA, Kreditkarte, EPS
- Planung automatisierter Testläufe (Autopilot)
- REST API für CI/CD-Integration
- Master-Passwort-Schutz
- Import/Export von Konfigurationen
- E-Mail-Benachrichtigungen bei Testfehlern

---

## Architektur

### Tech Stack

| Schicht | Technologie |
|---------|------------|
| Desktop Framework | Electron |
| Build Tool | Vite |
| Sprache | TypeScript |
| UI Framework | React + React Router |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Datenbank | SQLite (better-sqlite3) |
| Browser-Automatisierung | Playwright |
| Testing | Vitest |
| Charts | Recharts |

### Prozess-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                    MAIN PROCESS (Electron)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  database   │  │ ipcHandlers │  │   schedulerService  │  │
│  │   .ts       │  │    .ts      │  │        .ts          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  testQueue  │  │ apiServer   │  │   processManager    │  │
│  │    .ts      │  │    .ts      │  │        .ts          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │ IPC
┌─────────────────────────────────────────────────────────────┐
│                   PRELOAD (Bridge)                          │
│                     index.ts                                │
└─────────────────────────────────────────────────────────────┘
                            │ Context Bridge
┌─────────────────────────────────────────────────────────────┐
│                 RENDERER PROCESS (React)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   pages/    │  │ components/ │  │      store/         │  │
│  │  Dashboard  │  │   ui/       │  │   (Zustand)         │  │
│  │  Forms      │  │   Drawer    │  │                     │  │
│  │  Tests      │  │   Dialog    │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │ Child Process
┌─────────────────────────────────────────────────────────────┐
│              TEST RUNNER (Isolated Node.js)                 │
│                    runner.js (Playwright)                   │
└─────────────────────────────────────────────────────────────┘
```

### Warum Child Process für Playwright?

Der Test-Runner (`runner.js`) läuft als isolierter Child-Prozess, weil:
1. **Stabilität** - Playwright-Abstürze beeinträchtigen die Hauptanwendung nicht
2. **Speicher** - Browser-Instanzen werden ordnungsgemäß bereinigt
3. **Isolation** - Tests können nicht mit Electrons Renderer interferieren
4. **Logging** - Separate stdout/stderr-Streams für Test-Ausgaben

---

## Projektstruktur

```
src/
├── main/                      # Electron Hauptprozess
│   ├── index.ts              # Haupt-Einstiegspunkt, Fenstererstellung
│   ├── database.ts           # SQLite-Operationen & Migrationen
│   ├── ipcHandlers.ts        # IPC-Kommunikationshandler
│   ├── testQueue.ts          # Sequenzielle Test-Ausführungs-Warteschlange
│   ├── testExecutor.ts       # Testlauf-Orchestrierung
│   ├── schedulerService.ts   # Cron-basierte Planung
│   ├── testRunner/           # Playwright-Automatisierung
│   │   ├── runner.js         # Standalone Node.js Prozess
│   │   └── processManager.ts # Prozess-Lebenszyklus-Verwaltung
│   └── utils/
│       └── encryption.ts     # AES-256-GCM Verschlüsselung
├── preload/                   # Preload-Skripte
│   └── index.ts              # Sichere IPC-Brücke
├── renderer/                  # React Frontend
│   └── src/
│       ├── components/       # Wiederverwendbare UI-Komponenten
│       │   ├── ui/           # Basis-UI-Komponenten (Button, Input, etc.)
│       │   ├── FormDrawer.tsx
│       │   ├── PaymentMethodDrawer.tsx
│       │   ├── ScheduleDrawer.tsx
│       │   ├── TestRunDrawer.tsx
│       │   ├── SelectorEditor.tsx
│       │   └── ...
│       ├── pages/            # Haupt-Anwendungsansichten
│       │   ├── Dashboard.tsx
│       │   ├── Forms.tsx
│       │   ├── PaymentMethods.tsx
│       │   ├── TestResults.tsx
│       │   ├── Schedules.tsx
│       │   ├── Settings.tsx
│       │   └── InfoDoku.tsx
│       ├── store/            # Zustand State Management
│       ├── hooks/            # Custom React Hooks
│       └── utils/            # Utility-Funktionen
└── common/                    # Geteilte Typen
    ├── types.ts              # TypeScript Interfaces
    └── selectors.config.ts   # Formularfeld-Selektoren
```

---

## Entwicklung

### Voraussetzungen
- Node.js 18+
- npm oder yarn

### Setup
```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Für Produktion bauen
npm run build

# Anwendung packen
npm run dist

# Unit-Tests ausführen (Vitest)
npm test
```

### Fehlerbehebung

**better-sqlite3 Node.js Versionskonflikt:**
```bash
# Für Vitest-Tests (reguläres Node.js)
npm rebuild better-sqlite3

# Für Electron-App
npx electron-rebuild -f -w better-sqlite3

# Oder das Convenience-Skript verwenden
npm run rebuild:sqlite
```

---

## Entwicklerhandbuch: Anpassung für Ihren Anwendungsfall

Dieser Abschnitt erklärt, wie Sie FormTest Server für verschiedene Formulartypen oder Organisationen anpassen können.

### 1. Bereits verfügbare UI-Komponenten

Die App enthält eine umfassende UI-Komponentenbibliothek in `src/renderer/src/components/ui/`:

| Komponente | Datei | Verwendung |
|-----------|-------|-----------|
| Button | `Button.tsx` | Primary, secondary, danger, ghost Varianten |
| Input | `Input.tsx` | Text-, Passwort-, Zahlen-Eingaben mit Icons |
| Select | `Select.tsx` | Dropdown mit Suche, Multi-Select |
| Checkbox | `Checkbox.tsx` | Gestylte Checkbox mit Label |
| Table | `Table.tsx` | Sortierbare, paginierte Tabellen |
| Drawer | `Drawer.tsx` | Einblendbare Panels für Formulare |
| Dialog | `Dialog.tsx` | Modale Dialoge |
| Badge | `Badge.tsx` | Status-Badges (Erfolg, Fehler, etc.) |
| Skeleton | `Skeleton.tsx` | Ladeplatzhalter |
| Toast | `Toast.tsx` | Benachrichtigungs-Toasts |

**Beispiel: Verwendung vorhandener Komponenten**
```tsx
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Drawer, DrawerContent, DrawerHeader } from "../components/ui/Drawer";

// In Ihrer Komponente:
<Button variant="primary" onClick={handleSave}>Speichern</Button>
<Input placeholder="Name eingeben" value={name} onChange={setName} />
```

### 2. Anpassung von Formular-Selektoren

Die Formularfeld-Erkennung ist in `src/common/selectors.config.ts` konfiguriert. Diese Datei definiert CSS-Selektoren für jeden Feldtyp.

**Um Selektoren für einen neuen Formularanbieter hinzuzufügen:**

```typescript
// src/common/selectors.config.ts
export const DEFAULT_SELECTORS: FormSelectors = {
  amount: [
    // FundraisingBox Selektoren
    "#payment_amount_suggestion-0",
    "#payment_amount_suggestion-1",
    // Fügen Sie Selektoren Ihres Formularanbieters hinzu:
    ".your-provider-amount-btn",
    "[data-amount]",
  ],
  firstName: [
    "#payment_first_name",
    // Ihr Anbieter:
    "#donor_firstname",
    "input[name='first_name']",
  ],
  // ... andere Felder
};
```

**Benutzerkonfigurierbare Überschreibungen:** Benutzer können Selektoren auch in Einstellungen → Selektoren überschreiben, ohne Code zu ändern.

### 3. Änderung des Test-Runners

Die Browser-Automatisierungslogik befindet sich in `src/main/testRunner/runner.js`. Wichtige Funktionen:

| Funktion | Zweck |
|----------|-------|
| `fillForm()` | Haupt-Formularausfülllogik |
| `selectAmount()` | Betragsauswahl |
| `selectInterval()` | Intervallauswahl |
| `fillPersonalData()` | Name, E-Mail, Adresse |
| `selectPaymentMethod()` | Zahlungsmethodenauswahl |
| `fillPaymentDetails()` | IBAN, Kartendetails |
| `submitForm()` | Formularübermittlung |
| `waitForSuccessRedirect()` | Erfolgs-Erkennung |

**Um einen neuen Formulartyp zu unterstützen:**

1. Fügen Sie Selektoren zu `selectors.config.ts` hinzu
2. Ändern Sie `runner.js`, wenn das Formular einzigartiges Verhalten hat
3. Testen Sie mit deaktiviertem Headless-Modus (`Einstellungen → Headless-Modus → Deaktiviert`)

### 4. Hinzufügen neuer Zahlungsmethoden

Zahlungsmethoden sind in `src/common/types.ts` definiert:

```typescript
export interface PaymentMethod {
  id: number;
  name: string;
  type: "paypal" | "sepa" | "creditcard" | "eps" | "your_new_type";
  // ...
}
```

**Schritte zum Hinzufügen eines neuen Zahlungstyps:**

1. Fügen Sie den Typ zur `PaymentMethod.type` Union in `types.ts` hinzu
2. Fügen Sie Details-Interface in `PaymentMethodDetails` hinzu
3. Aktualisieren Sie `PaymentMethodDrawer.tsx` mit Formularfeldern
4. Aktualisieren Sie `runner.js`, um den neuen Zahlungsablauf zu behandeln
5. Fügen Sie Icon-Mapping in `iconHelper.ts` hinzu

### 5. Hinzufügen neuer Seiten

1. Erstellen Sie eine Seitenkomponente in `src/renderer/src/pages/YourPage.tsx`
2. Fügen Sie Route in `src/renderer/src/App.tsx` hinzu
3. Fügen Sie Navigationselement in `src/renderer/src/components/Layout.tsx` hinzu
4. Fügen Sie Tastenkürzel hinzu, falls erforderlich

### 6. Datenbank-Migrationen

Wenn Sie neue Spalten hinzufügen, erstellen Sie eine Migrationsfunktion in `database.ts`:

```typescript
function migrateYourNewColumn(): void {
  const columns = db.prepare("PRAGMA table_info(your_table)").all();
  const hasColumn = columns.some(col => col.name === 'your_column');
  
  if (!hasColumn) {
    db.exec("ALTER TABLE your_table ADD COLUMN your_column TEXT");
  }
}

// Aufruf in initDatabase():
migrateYourNewColumn();
```

---

## REST API

Die App enthält einen REST API-Server für CI/CD-Integration. Aktivieren Sie ihn in Einstellungen → API Server.

### Authentifizierung

Alle Endpunkte (außer `/api/health`) erfordern den `X-API-Key` Header:

```bash
curl -H "X-API-Key: your-api-key" http://localhost:3847/api/forms
```

### Endpunkte

#### Health Check
```
GET /api/health
```
Keine Authentifizierung erforderlich. Gibt Serverstatus zurück.

#### Formulare auflisten
```
GET /api/forms
```
Gibt alle Formulare mit id, name, url, isActive zurück.

#### Zahlungsmethoden auflisten
```
GET /api/payment-methods
```
Gibt Zahlungsmethoden zurück (ohne sensible Details).

#### Zeitpläne auflisten
```
GET /api/schedules
```
Gibt alle geplanten Test-Konfigurationen zurück.

#### Testlauf auslösen
```
POST /api/tests/run
Content-Type: application/json

{
  "formIds": [1, 2],
  "paymentMethodIds": [1, 3]
}
```
Fügt Tests für alle Kombinationen von Formularen × Zahlungsmethoden zur Warteschlange hinzu.

**Antwort:**
```json
{
  "success": true,
  "message": "4 Test(s) in Warteschlange",
  "testIds": [101, 102, 103, 104],
  "testUuids": ["uuid-1", "uuid-2", "uuid-3", "uuid-4"]
}
```

#### Tests auflisten
```
GET /api/tests?limit=50&status=SUCCESS
```
Abfrageparameter:
- `limit` - Maximale Ergebnisse (Standard: 50, Maximum: 100)
- `status` - Nach Status filtern (SUCCESS, FAILURE, RUNNING, QUEUED)

#### Test nach ID abrufen
```
GET /api/tests/:id
```
Gibt vollständige Testdetails einschließlich Schritten zurück.

#### Teststatus abrufen (Polling)
```
GET /api/tests/:id/status
```
Leichtgewichtiger Endpunkt zum Abfragen des Testabschlusses.

#### Test nach UUID abrufen
```
GET /api/tests/uuid/:uuid
```
Findet Test anhand seiner UUID (nützlich nach Auslösung über API).

#### Warteschlangenstatus
```
GET /api/queue/status
```
Gibt aktuellen Warteschlangenzustand zurück (laufender Test, Anzahl in Warteschlange).

#### Test löschen
```
DELETE /api/tests/:id
```
Löscht einen Testlauf.

### CI/CD-Beispiel (GitHub Actions)

```yaml
name: Form Tests
on:
  schedule:
    - cron: '0 6 * * *'  # Täglich um 6 Uhr

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger tests
        run: |
          RESPONSE=$(curl -s -X POST \
            -H "X-API-Key: ${{ secrets.FORMTEST_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"formIds": [1], "paymentMethodIds": [1, 2]}' \
            http://your-server:3847/api/tests/run)
          
          TEST_IDS=$(echo $RESPONSE | jq -r '.testIds[]')
          
          # Auf Abschluss warten
          for ID in $TEST_IDS; do
            while true; do
              STATUS=$(curl -s -H "X-API-Key: ${{ secrets.FORMTEST_API_KEY }}" \
                http://your-server:3847/api/tests/$ID/status | jq -r '.data.status')
              
              if [ "$STATUS" = "SUCCESS" ] || [ "$STATUS" = "FAILURE" ]; then
                echo "Test $ID: $STATUS"
                break
              fi
              sleep 5
            done
          done
```

---

## Datenbankschema

| Tabelle | Wichtige Spalten |
|---------|------------------|
| `forms` | id, name, url, icon, fieldMappings, isActive |
| `payment_methods` | id, name, type, icon, details (verschlüsselt), isActive |
| `test_runs` | id, uuid, formId, paymentMethodId, status, amount, interval, durationMs, steps, screenshotPath |
| `test_schedules` | id, name, formId, paymentMethodId, cronExpression, isActive |
| `global_settings` | key, value, description |
| `notifications` | id, type, title, message, testRunId, isRead |
| `selector_overrides` | id, category, key, selectors, isActive |

---

## ⌨️ Tastenkürzel

| Tastenkombination | Aktion |
|-------------------|--------|
| `⌘ + K` | Globale Suche |
| `⌘ + ⇧ + T` | Test-Dialog öffnen |
| `⌘ + 1-7` | Zu Seiten navigieren |
| `Esc` | Dialog/Drawer schließen |
| `Enter` | Ausgewähltes Element öffnen |
| `↑ / ↓` | Listen navigieren |

---

## Sicherheit

- **Zahlungsverschlüsselung**: AES-256-GCM mit Schlüssel in macOS Keychain
- **Master-Passwort**: Optionaler App-Level-Passwortschutz
- **IPC-Isolation**: Kontext-isolierte Preload-Skripte
- **API-Authentifizierung**: API-Schlüssel für alle Endpunkte erforderlich

---

## Lizenz

<span class="font-mono">FormTest.Server 1.0.36<br />
MIT - &copy; 2025 Luca Mack</span>
