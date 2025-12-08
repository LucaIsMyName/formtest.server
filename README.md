# FormTest Server

A desktop application for automated testing of donation forms using Electron, Vite, TypeScript, and Playwright.

## 🎯 Overview

FormTest Server automates testing of donation forms (originally built for FundraisingBox) across multiple payment methods. It validates form functionality, payment processing flows, and provides detailed reporting.

**Key Capabilities:**
- Test donation forms with PayPal, SEPA, Credit Card, EPS
- Schedule automated test runs (Autopilot)
- REST API for CI/CD integration
- Master password protection
- Import/Export configurations
- Email notifications on test failures

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop Framework | Electron |
| Build Tool | Vite |
| Language | TypeScript |
| UI Framework | React + React Router |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Database | SQLite (better-sqlite3) |
| Browser Automation | Playwright |
| Testing | Vitest |
| Charts | Recharts |

### Process Architecture

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

### Why Child Process for Playwright?

The test runner (`runner.js`) runs as an isolated child process because:
1. **Stability** - Playwright crashes don't affect the main app
2. **Memory** - Browser instances are properly cleaned up
3. **Isolation** - Tests can't interfere with Electron's renderer
4. **Logging** - Separate stdout/stderr streams for test output

---

## 🗂️ Project Structure

```
src/
├── main/                      # Electron main process
│   ├── index.ts              # Main entry, window creation
│   ├── database.ts           # SQLite operations & migrations
│   ├── ipcHandlers.ts        # IPC communication handlers
│   ├── testQueue.ts          # Sequential test execution queue
│   ├── testExecutor.ts       # Test run orchestration
│   ├── schedulerService.ts   # Cron-based scheduling
│   ├── testRunner/           # Playwright automation
│   │   ├── runner.js         # Standalone Node.js process
│   │   └── processManager.ts # Process lifecycle management
│   └── utils/
│       └── encryption.ts     # AES-256-GCM encryption
├── preload/                   # Preload scripts
│   └── index.ts              # Secure IPC bridge
├── renderer/                  # React frontend
│   └── src/
│       ├── components/       # Reusable UI components
│       │   ├── ui/           # Base UI components (Button, Input, etc.)
│       │   ├── FormDrawer.tsx
│       │   ├── PaymentMethodDrawer.tsx
│       │   ├── ScheduleDrawer.tsx
│       │   ├── TestRunDialog.tsx
│       │   ├── SelectorEditor.tsx
│       │   └── ...
│       ├── pages/            # Main application views
│       │   ├── Dashboard.tsx
│       │   ├── Forms.tsx
│       │   ├── PaymentMethods.tsx
│       │   ├── TestResults.tsx
│       │   ├── Schedules.tsx
│       │   ├── Settings.tsx
│       │   └── InfoDoku.tsx
│       ├── store/            # Zustand state management
│       ├── hooks/            # Custom React hooks
│       └── utils/            # Utility functions
└── common/                    # Shared types
    ├── types.ts              # TypeScript interfaces
    └── selectors.config.ts   # Form field selectors
```

---

## 🚀 Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Package application
npm run dist

# Run unit tests (Vitest)
npm test
```

### Troubleshooting

**better-sqlite3 Node.js version mismatch:**
```bash
# For Vitest tests (regular Node.js)
npm rebuild better-sqlite3

# For Electron app
npx electron-rebuild -f -w better-sqlite3

# Or use the convenience script
npm run rebuild:sqlite
```

---

## �️ Developer Guide: Adapting for Your Use Case

This section explains how to customize FormTest Server for different form types or organizations.

### 1. UI Components Already Available

The app includes a comprehensive UI component library in `src/renderer/src/components/ui/`:

| Component | File | Usage |
|-----------|------|-------|
| Button | `Button.tsx` | Primary, secondary, danger, ghost variants |
| Input | `Input.tsx` | Text, password, number inputs with icons |
| Select | `Select.tsx` | Dropdown with search, multi-select |
| Checkbox | `Checkbox.tsx` | Styled checkbox with label |
| Table | `Table.tsx` | Sortable, paginated tables |
| Drawer | `Drawer.tsx` | Slide-in panels for forms |
| Dialog | `Dialog.tsx` | Modal dialogs |
| Badge | `Badge.tsx` | Status badges (success, failure, etc.) |
| Skeleton | `Skeleton.tsx` | Loading placeholders |
| Toast | `Toast.tsx` | Notification toasts |

**Example: Using existing components**
```tsx
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Drawer, DrawerContent, DrawerHeader } from "../components/ui/Drawer";

// In your component:
<Button variant="primary" onClick={handleSave}>Save</Button>
<Input placeholder="Enter name" value={name} onChange={setName} />
```

### 2. Adapting Form Selectors

Form field detection is configured in `src/common/selectors.config.ts`. This file defines CSS selectors for each field type.

**To add selectors for a new form provider:**

```typescript
// src/common/selectors.config.ts
export const DEFAULT_SELECTORS: FormSelectors = {
  amount: [
    // FundraisingBox selectors
    "#payment_amount_suggestion-0",
    "#payment_amount_suggestion-1",
    // Add your form provider's selectors:
    ".your-provider-amount-btn",
    "[data-amount]",
  ],
  firstName: [
    "#payment_first_name",
    // Your provider:
    "#donor_firstname",
    "input[name='first_name']",
  ],
  // ... other fields
};
```

**User-configurable overrides:** Users can also override selectors in Settings → Selektoren without modifying code.

### 3. Modifying the Test Runner

The browser automation logic lives in `src/main/testRunner/runner.js`. Key functions:

| Function | Purpose |
|----------|---------|
| `fillForm()` | Main form filling logic |
| `selectAmount()` | Amount selection |
| `selectInterval()` | Interval selection |
| `fillPersonalData()` | Name, email, address |
| `selectPaymentMethod()` | Payment method selection |
| `fillPaymentDetails()` | IBAN, card details |
| `submitForm()` | Form submission |
| `waitForSuccessRedirect()` | Success detection |

**To support a new form type:**

1. Add selectors to `selectors.config.ts`
2. Modify `runner.js` if the form has unique behavior
3. Test with headless mode disabled (`Settings → Headless-Modus → Deaktiviert`)

### 4. Adding New Payment Methods

Payment methods are defined in `src/common/types.ts`:

```typescript
export interface PaymentMethod {
  id: number;
  name: string;
  type: "paypal" | "sepa" | "creditcard" | "eps" | "your_new_type";
  // ...
}
```

**Steps to add a new payment type:**

1. Add type to `PaymentMethod.type` union in `types.ts`
2. Add details interface in `PaymentMethodDetails`
3. Update `PaymentMethodDrawer.tsx` with form fields
4. Update `runner.js` to handle the new payment flow
5. Add icon mapping in `iconHelper.ts`

### 5. Adding New Pages

1. Create page component in `src/renderer/src/pages/YourPage.tsx`
2. Add route in `src/renderer/src/App.tsx`
3. Add navigation item in `src/renderer/src/components/Layout.tsx`
4. Add keyboard shortcut if needed

### 6. Database Migrations

When adding new columns, create a migration function in `database.ts`:

```typescript
function migrateYourNewColumn(): void {
  const columns = db.prepare("PRAGMA table_info(your_table)").all();
  const hasColumn = columns.some(col => col.name === 'your_column');
  
  if (!hasColumn) {
    db.exec("ALTER TABLE your_table ADD COLUMN your_column TEXT");
  }
}

// Call in initDatabase():
migrateYourNewColumn();
```

---

## 🌐 REST API

The app includes a REST API server for CI/CD integration. Enable it in Settings → API Server.

### Authentication

All endpoints (except `/api/health`) require the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key" http://localhost:3847/api/forms
```

### Endpoints

#### Health Check
```
GET /api/health
```
No authentication required. Returns server status.

#### List Forms
```
GET /api/forms
```
Returns all forms with id, name, url, isActive.

#### List Payment Methods
```
GET /api/payment-methods
```
Returns payment methods (without sensitive details).

#### List Schedules
```
GET /api/schedules
```
Returns all scheduled test configurations.

#### Trigger Test Run
```
POST /api/tests/run
Content-Type: application/json

{
  "formIds": [1, 2],
  "paymentMethodIds": [1, 3]
}
```
Queues tests for all combinations of forms × payment methods.

**Response:**
```json
{
  "success": true,
  "message": "4 test(s) queued",
  "testIds": [101, 102, 103, 104],
  "testUuids": ["uuid-1", "uuid-2", "uuid-3", "uuid-4"]
}
```

#### List Tests
```
GET /api/tests?limit=50&status=SUCCESS
```
Query parameters:
- `limit` - Max results (default: 50, max: 100)
- `status` - Filter by status (SUCCESS, FAILURE, RUNNING, QUEUED)

#### Get Test by ID
```
GET /api/tests/:id
```
Returns full test details including steps.

#### Get Test Status (Polling)
```
GET /api/tests/:id/status
```
Lightweight endpoint for polling test completion.

#### Get Test by UUID
```
GET /api/tests/uuid/:uuid
```
Find test by its UUID (useful after triggering via API).

#### Queue Status
```
GET /api/queue/status
```
Returns current queue state (running test, queued count).

#### Delete Test
```
DELETE /api/tests/:id
```
Deletes a test run.

### CI/CD Example (GitHub Actions)

```yaml
name: Form Tests
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM

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
          
          # Poll for completion
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

## 📊 Database Schema

| Table | Key Columns |
|-------|-------------|
| `forms` | id, name, url, icon, fieldMappings, isActive |
| `payment_methods` | id, name, type, icon, details (encrypted), isActive |
| `test_runs` | id, uuid, formId, paymentMethodId, status, amount, interval, durationMs, steps, screenshotPath |
| `test_schedules` | id, name, formId, paymentMethodId, cronExpression, isActive |
| `global_settings` | key, value, description |
| `notifications` | id, type, title, message, testRunId, isRead |
| `selector_overrides` | id, category, key, selectors, isActive |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ + K` | Global search |
| `⌘ + ⇧ + T` | Open test dialog |
| `⌘ + 1-7` | Navigate to pages |
| `Esc` | Close dialog/drawer |
| `Enter` | Open selected item |
| `↑ / ↓` | Navigate lists |

---

## 🔐 Security

- **Payment Encryption**: AES-256-GCM with key in macOS Keychain
- **Master Password**: Optional app-level password protection
- **IPC Isolation**: Context-isolated preload scripts
- **API Authentication**: API key required for all endpoints

---

## 📄 License

MIT - Copyright (c) 2025 Luca Mack
