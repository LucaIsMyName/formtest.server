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
- [x] **Step 2.2**: Implement Payment Methods Management UI ✅
  - [x] Payment method CRUD operations
  - [x] Secure credential input forms with validation
  - [x] Support for PayPal, SEPA, Credit Card, EPS
  - [x] Active/inactive status management
  - [x] Data masking for sensitive information
- [x] **Step 2.3**: Implement Settings Management UI ✅
  - [x] Global settings configuration
  - [x] Default amounts, intervals, test parameters
  - [x] Inline editing with proper validation
  - [x] User-friendly display with formatted values
- [x] **Step 2.4**: Implement Dashboard with Statistics ✅
  - [x] Real-time stats from database
  - [x] Quick action buttons and navigation
  - [x] Setup status indicators

### 🚧 Phase 3: Test Engine Integration (CURRENT)
- [x] **Step 3.1**: Playwright Integration Setup ✅
  - [x] Install and configure Playwright
  - [x] Create base test runner class
  - [x] Form field detection and mapping
  - [x] Browser automation infrastructure
- [x] **Step 3.2**: Form Automation Logic ✅
  - [x] Dynamic form field identification with AI-powered detection
  - [x] Test data generation with Faker.js (German locale)
  - [x] Intelligent form filling automation
  - [x] Smart field purpose analysis (email, names, addresses, etc.)
  - [x] Payment method detection in forms
- [x] **Step 3.3**: Test Results Management ✅
  - [x] Complete Test Results page with CRUD operations
  - [x] Delete functionality for test runs
  - [x] Real-time dashboard statistics
  - [x] Test execution infrastructure
- [ ] **Step 3.4**: Browser Automation Integration ⚠️ **IN PROGRESS**
  - [x] Test execution framework
  - [ ] **ISSUE**: Playwright module resolution in Electron
  - [ ] **SOLUTION**: Implement browser automation with proper bundling
  - [x] Browser automation infrastructure
- [ ] **Step 3.5**: Payment Method Automation
  - [ ] PayPal automation (test account)
  - [ ] SEPA form filling
  - [ ] Credit card form handling (Stripe iframes)
  - [ ] EPS bank selection automation
  - [ ] Test orchestration and queuing
  - [ ] Parallel test execution
  - [ ] Error handling and retry logic
  - [ ] Screenshot capture on success/failure

### 🔍 Phase 4: Results & Reporting (FINAL)
- [ ] **Step 4.1**: Test Results UI
  - [ ] Results list with filtering and sorting
  - [ ] Detailed test result viewer
  - [ ] Screenshot gallery

---

## 🚀 **BROWSER AUTOMATION IMPLEMENTATION PLAN**

### **Current Issue: Playwright Module Resolution in Electron**
The Playwright library cannot be directly imported in the Electron main process due to module resolution conflicts between Node.js versions and native dependencies.

### **🎯 SOLUTION STRATEGY: Child Process Architecture**

#### **Phase A: Separate Process Implementation**
1. **Create dedicated test runner process**
   - Separate Node.js process for Playwright execution
   - IPC communication between Electron main and test runner
   - Isolated environment for browser automation

2. **Process Communication Protocol**
   - JSON-based message passing
   - Test job queue system
   - Real-time status updates
   - Error handling and recovery

3. **File Structure Changes**
   ```
   src/
   ├── main/
   │   ├── testRunner/           # NEW: Separate test runner
   │   │   ├── runner.js         # Standalone Node.js process
   │   │   ├── formAutomation.js # Browser automation logic
   │   │   └── processManager.ts # Process lifecycle management
   │   └── ipcHandlers.ts        # Updated with process communication
   ```

#### **Phase B: Implementation Steps**

**Step B1: Create Standalone Test Runner Process**
- [ ] Extract Playwright logic to separate Node.js script
- [ ] Implement JSON-based communication protocol
- [ ] Add process lifecycle management
- [ ] Test basic process spawning and communication

**Step B2: Update IPC Architecture**
- [ ] Modify IPC handlers to use child process
- [ ] Implement test job queue system
- [ ] Add real-time status updates via events
- [ ] Handle process errors and recovery

**Step B3: Browser Automation Logic**
- [ ] Port FormFieldDetector to standalone process
- [ ] Port SmartFormFiller to standalone process
- [ ] Implement screenshot capture and storage
- [ ] Add comprehensive logging system

**Step B4: Integration & Testing**
- [ ] Connect UI to new architecture
- [ ] Test end-to-end form automation
- [ ] Implement error handling and recovery
- [ ] Performance optimization and cleanup

#### **Phase C: Advanced Features**

**Step C1: Parallel Test Execution**
- [ ] Multiple test runner processes
- [ ] Load balancing and job distribution
- [ ] Resource management and limits

**Step C2: Enhanced Browser Features**
- [ ] Multiple browser support (Chrome, Firefox, Safari)
- [ ] Mobile viewport testing
- [ ] Network condition simulation
- [ ] Advanced screenshot and video capture

**Step C3: Smart Form Detection**
- [ ] AI-powered form analysis
- [ ] Dynamic selector generation
- [ ] Form change detection and adaptation
- [ ] Success/failure pattern recognition

### **🔧 TECHNICAL IMPLEMENTATION DETAILS**

#### **Communication Protocol**
```typescript
interface TestMessage {
  id: string
  type: 'START_TEST' | 'UPDATE_STATUS' | 'TEST_COMPLETE' | 'ERROR'
  payload: {
    testRunId?: number
    form?: Form
    paymentMethod?: PaymentMethod
    settings?: Record<string, string>
    status?: TestStatus
    result?: TestResult
    error?: string
  }
}
```

#### **Process Architecture**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Electron UI   │◄──►│  Main Process    │◄──►│  Test Runner    │
│   (Renderer)    │    │  (IPC Handler)   │    │  (Child Process)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │    Database      │    │   Playwright    │
                       │   (SQLite)       │    │   (Browser)     │
                       └──────────────────┘    └─────────────────┘
```

#### **File System Structure**
```
screenshots/           # Test screenshots
├── success/          # Successful test screenshots
├── failure/          # Failed test screenshots
└── temp/             # Temporary files

logs/                 # Detailed test logs
├── test-runs/        # Individual test run logs
└── system/           # System and error logs
```

### **🎯 IMPLEMENTATION PRIORITY**
1. **HIGH**: Basic child process communication (Step B1-B2)
2. **HIGH**: Form automation in separate process (Step B3)
3. **MEDIUM**: UI integration and testing (Step B4)
4. **LOW**: Advanced features (Step C1-C3)

### **⚠️ RISKS & MITIGATION**
- **Risk**: Process communication overhead
  - **Mitigation**: Efficient JSON serialization, batch operations
- **Risk**: Child process crashes
  - **Mitigation**: Process monitoring, automatic restart, graceful degradation
- **Risk**: Resource consumption
  - **Mitigation**: Process limits, cleanup routines, resource monitoring

---
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
   1. The form is inside a `<iframe>` of the main website, has the id `#fbIframe`
   2. The form has the following fields (looks into "blueprint/form-example.html"):
      1. Betrag, 3 radios and a number filed for custom amount
      2. Rythmus, Dropwdown with 4 options: Einmalig, Monatlich, Quartal (§monate), Jährliche Zahlung
      3. Projekt: Dropwdown ith projects for donations
      4. Anrede, Dropdown, M, F, D
      5. Titel
      6. Vorname
      7. Nachname
      8. "Als unternehmen spenden", Toggle / Checkbox
      9. Mail
      10. Geburtstag (OPtinal)
      11. Wohnhaft (Land, AT)
      12. E-Mail
      13. Anmerkungen
      14. Zahlungsweise (Paymentmethods)
          1.  EPS:
              1.  Bank: Dropwdown
          2.  SEPA
              1.  Konotoinhaber
              2.  IBAN
          3.  PayPal
          4.  Visa/Mastercard/AmEx
              1.  Karteninhaber: Text
              2.  Kartennummer: Zahlen
              3.  Prüfziffern/CVV: Zahlen
              4.  Ablaufdatum: Monat/Jahr
      15. Datenschutz: Radio (Ja/Nein)
      16. Newsletter: Checkbox optional
      
      
5. **Create Test Results Viewer** - Results analysis and reporting

## 📄 License

MIT
