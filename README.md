# FormTest Server

A desktop application for automated testing of donation forms using Electron, Vite, TypeScript, and Playwright.

## 🎯 Project Overview

This application automates the testing of FundraisingBox donation forms across multiple payment methods (PayPal, SEPA, Credit Card, EPS) to ensure form functionality and payment processing reliability.

## 🏗️ Tech Stack

- **Electron**: Desktop application framework
- **Vite**: Fast build tool and dev server  
- **TypeScript**: Type-safe development
- **React**: UI framework with React Router
- **Tailwind CSS**: Utility-first CSS framework
- **Playwright**: Browser automation for testing
- **SQLite**: Local database storage (better-sqlite3)
- **Vitest**: Unit testing framework
- **Zustand**: State management
- **Recharts**: Dashboard analytics charts

## ✅ Implemented Features

### Core Features
- [x] **Forms Management** - Full CRUD with field mappings, icons, active/inactive toggle
- [x] **Payment Methods** - PayPal, SEPA, Credit Card, EPS with encrypted storage (AES-256-GCM)
- [x] **Test Execution** - Sequential test queue with real-time status updates
- [x] **Test Results** - Full CRUD, filtering, sorting, timeline view, notes
- [x] **Dashboard** - Real-time statistics, charts (line, bar, pie), quick actions
- [x] **Settings** - Theme, test parameters, import/export, data management
- [x] **Autopilot (Schedules)** - Cron-based scheduled test runs
- [x] **Notifications** - In-app notification system for scheduled tests
- [x] **Selector Overrides** - User-configurable CSS selectors for form fields

### Browser Automation
- [x] **Child Process Architecture** - Isolated Playwright process for stability
- [x] **Cookie Consent Handling** - Automatic detection and acceptance
- [x] **Smart Form Detection** - FundraisingBox-specific + generic form support
- [x] **Field Mappings** - Custom CSS selectors per form
- [x] **URL Prefill** - Amount and interval via URL parameters
- [x] **Payment Provider Detection** - PayPal, Stripe, Klarna, etc.
- [x] **Step Logging** - Detailed test execution timeline

### UI/UX
- [x] **Custom Title Bar** - Frameless window with custom traffic lights
- [x] **Dark/Light/System Theme** - Full theme support
- [x] **Global Search** - Cmd+K search across all entities
- [x] **Skeleton Loaders** - Loading states for all pages
- [x] **Toast Notifications** - User feedback system
- [x] **Responsive Tables** - Sorting, filtering, pagination

### Data Management
- [x] **Import/Export** - Full database backup/restore (JSON)
- [x] **Encrypted Storage** - Payment credentials via macOS Keychain
- [x] **Database Migrations** - Automatic schema updates

## 🚧 Implementation Roadmap

### Phase B: Export Features ✅
- [x] CSV export for test results
- [x] JSON export for test results  
- [x] Download buttons in TestResults page

### Phase C: Screenshot Gallery ✅
- [x] Screenshot viewer component with lightbox
- [x] Zoom controls (+/- and keyboard shortcuts)
- [x] Download functionality
- [x] Error handling for missing/broken images

### Phase D: Enhanced Reporting ✅
- [x] Success rate trends over time (7-day chart)
- [x] Form reliability metrics with progress bars
- [x] Payment method reliability metrics
- [x] Average test duration per form

### Phase E: Email Notifications ✅
- [x] Email settings configuration in Settings page
- [x] Nodemailer integration with SMTP support
- [x] Scheduled test failure/success alerts
- [x] Notification preferences (success/failure toggle)
- [x] Test email functionality

### CLI Test Tool ✅
- [x] Command-line interface for testing forms and payment methods
- [x] Payment method validation (SEPA all intervals, EPS/Credit/PayPal one-time only)
- [x] List forms and payment methods from CLI
- [x] Dry-run mode for validation without execution

### Phase F: Advanced Browser Features
- [ ] Firefox/Safari browser support
- [ ] Mobile viewport presets
- [ ] Network throttling options
- [ ] Video recording

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

# Run Playwright e2e tests
npm run test:playwright
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

## 📊 Database Schema

### Forms Table
- `id`, `name`, `url`, `hash`, `icon`, `fieldMappings`, `isActive`, `createdAt`, `updatedAt`

### PaymentMethods Table  
- `id`, `name`, `type`, `icon`, `isActive`, `details` (encrypted), `createdAt`, `updatedAt`

### GlobalSettings Table
- `key`, `value`, `description`

### TestRuns Table
- `id`, `uuid`, `formId`, `paymentMethodId`, `status`, `errorMessage`, `screenshotPath`, `logDetails`, `steps`, `durationMs`, `isScheduled`, `notes`, `runAt`

### TestSchedules Table
- `id`, `name`, `formId`, `paymentMethodId`, `cronExpression`, `icon`, `isActive`, `lastRun`, `createdAt`

### Notifications Table
- `id`, `type`, `title`, `message`, `testRunId`, `isRead`, `createdAt`

### SelectorOverrides Table
- `id`, `category`, `key`, `selectors`, `isActive`, `createdAt`, `updatedAt`

## 🔐 Security

- Payment credentials encrypted with AES-256-GCM
- Encryption key stored in macOS Keychain (via keytar)
- Test-only payment data (no real transactions)
- Secure IPC communication with context isolation
- Frameless window with custom controls

## 🎯 Field Mappings

Custom field mappings allow overriding automatic form detection:

| Field Type | Description | Example Selector |
|------------|-------------|------------------|
| `amount` | Preset amount button | `#payment_amount_suggestion-0` |
| `customAmount` | Free amount input | `#payment_customAmount` |
| `interval` | Payment frequency | `#payment_interval` |
| `firstName` | First name field | `#payment_first_name` |
| `lastName` | Last name field | `#payment_last_name` |
| `email` | Email field | `#payment_email` |
| `paymentMethod` | Payment method selector | `label[for="sepa_direct_debit"]` |
| `iban` | IBAN field | `#payment_bank_iban` |
| `accountHolder` | Account holder | `#payment_bank_account_owner` |

### Actions
- `type` - Type text into input
- `click` - Click element
- `select` - Select dropdown option
- `check` - Check checkbox
- `waitAndClick` - Wait 500ms then click

## 📄 License

MIT - Copyright (c) 2025 Luca Mack
