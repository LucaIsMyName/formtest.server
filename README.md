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

## 📋 Implementation Plan

### ✅ Phase 1: Foundation Setup (COMPLETED)
- [x] Project structure with Electron + Vite + TypeScript + React + Tailwind
- [x] Database schema design (Forms, PaymentMethods, GlobalSettings, TestRuns)
- [x] IPC communication layer between main and renderer processes
- [x] Basic React UI with navigation (Dashboard, Forms, PaymentMethods, Settings, TestResults)
- [x] Architecture decisions: Hybrid config approach (static + user input)

### 🚧 Phase 2: Core UI Implementation (CURRENT)
- [x] **Step 2.1**: Implement Forms Management UI ✅
  - [x] Forms list with add/edit/delete functionality
  - [x] Form validation and URL testing
  - [x] Active/inactive toggle for forms
  - [x] Zustand state management for forms
  - [x] Modal dialog for form creation/editing
  - [x] Dashboard integration with real form statistics
- [ ] **Step 2.2**: Implement Payment Methods Management UI
  - [ ] Payment method CRUD operations
  - [ ] Secure credential input forms (encrypted storage)
  - [ ] Support for PayPal, SEPA, Credit Card, EPS
- [ ] **Step 2.3**: Implement Settings Management UI
  - [ ] Global settings configuration
  - [ ] Default amounts, intervals, test parameters
  - [ ] Test data generation settings
- [ ] **Step 2.4**: Implement Dashboard with Statistics
  - [ ] Real-time stats from database
  - [ ] Quick action buttons
  - [ ] Recent test results overview

### 📅 Phase 3: Test Engine Integration (NEXT)
- [ ] **Step 3.1**: Playwright Integration Setup
  - [ ] Install and configure Playwright
  - [ ] Create base test runner class
  - [ ] Form field detection and mapping
- [ ] **Step 3.2**: Form Automation Logic
  - [ ] Dynamic form field identification
  - [ ] Test data generation with Faker.js
  - [ ] Form filling automation
- [ ] **Step 3.3**: Payment Method Automation
  - [ ] PayPal automation (test account)
  - [ ] SEPA form filling
  - [ ] Credit card form handling (Stripe iframes)
  - [ ] EPS bank selection automation
- [ ] **Step 3.4**: Test Execution Engine
  - [ ] Test orchestration and queuing
  - [ ] Parallel test execution
  - [ ] Error handling and retry logic
  - [ ] Screenshot capture on success/failure

### 🔍 Phase 4: Results & Reporting (FINAL)
- [ ] **Step 4.1**: Test Results UI
  - [ ] Results list with filtering and sorting
  - [ ] Detailed test result viewer
  - [ ] Screenshot gallery
  - [ ] Log viewer with syntax highlighting
- [ ] **Step 4.2**: Reporting Features
  - [ ] Export test results (CSV, JSON)
  - [ ] Test history and trends
  - [ ] Success rate analytics
- [ ] **Step 4.3**: Advanced Features
  - [ ] Scheduled test runs
  - [ ] Email notifications
  - [ ] Test result comparison
  - [ ] Performance metrics

## 🗂️ Project Structure

```
src/
├── main/                   # Electron main process
│   ├── index.ts           # Main entry point, window creation
│   ├── database.ts        # SQLite database operations
│   ├── ipcHandlers.ts     # IPC communication handlers
│   └── testRunner.ts      # Playwright test orchestration (Phase 3)
├── preload/               # Preload scripts
│   └── index.ts          # Secure IPC bridge
├── renderer/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application views
│   │   ├── services/      # API/IPC interaction
│   │   ├── store/         # State management
│   │   └── utils/         # Utility functions
│   └── index.html        # Renderer entry point
├── common/                # Shared types and utilities
│   └── types.ts          # TypeScript interfaces
└── tests/                 # Playwright test runners (Phase 3)
    └── formRunner.ts     # Form automation logic
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

# Run unit tests
npm test

# Run Playwright e2e tests
npm run test:playwright
```

### Troubleshooting

**better-sqlite3 Node.js version mismatch:**
If you encounter Node.js version errors with better-sqlite3:

```bash
# For Jest tests (regular Node.js)
npm rebuild better-sqlite3

# For Electron app
npx electron-rebuild -f -w better-sqlite3

# Or use the convenience script
npm run rebuild:sqlite
```

## 📊 Database Schema

### Forms Table
- `id`, `name`, `url`, `hash`, `isActive`, `createdAt`, `updatedAt`

### PaymentMethods Table  
- `id`, `name`, `type`, `isActive`, `details` (encrypted), `createdAt`, `updatedAt`

### GlobalSettings Table
- `key`, `value`, `description`

### TestRuns Table
- `id`, `formId`, `paymentMethodId`, `status`, `errorMessage`, `screenshotPath`, `logDetails`, `durationMs`, `runAt`

## 🔐 Security Considerations

- Payment credentials encrypted before database storage
- Test-only payment data (no real transactions)
- GDPR and PCI DSS compliance guidelines
- Secure IPC communication with context isolation

## 📝 Current Implementation Status

**✅ COMPLETED:**
- Basic Electron app with React frontend running
- Database schema and IPC layer implemented
- Navigation and basic page structure
- Tailwind CSS styling system
- Forms Management UI with full CRUD operations
- SQLite data type handling (boolean/integer conversion)
- API availability checks and error handling
- Unit tests for database operations and preload script

**🚧 CURRENT STEP: Phase 2.2 - Payment Methods Management UI**
- Next: Implement payment method CRUD operations with encrypted storage

**🔧 RECENT FIXES:**
- Fixed SQLite binding error by properly converting boolean to integer values
- Fixed window.api undefined error with better error handling and logging
- Added comprehensive unit tests with Jest
- Improved data type conversion for database operations
- Enhanced data sanitization in database layer (null vs undefined handling)
- Added comprehensive logging for debugging form creation issues
- Updated TypeScript types to properly handle null values for SQLite compatibility
- Fixed Node.js version mismatch with better-sqlite3 using @electron/rebuild
- Added ultra-robust data sanitization to handle all edge cases from IPC
- Configured proper test runner (Jest vs Playwright) separation

## 🎯 Next Steps

1. ✅ **~~Implement Forms Management UI~~** - COMPLETED
2. **Add Payment Methods Management** - Secure credential storage (CURRENT)
3. **Build Settings Interface** - Global configuration options
4. **Integrate Playwright** - Form automation engine
5. **Create Test Results Viewer** - Results analysis and reporting

## 📄 License

MIT
